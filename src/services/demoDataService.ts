import {
  collection,
  addDoc,
  getDocs,
  query,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logger } from '../utils/logger';

export class DemoDataService {
  
  /**
   * Check if demo data already exists
   */
  static async hasDemoData(): Promise<boolean> {
    try {
      const [shops, offers, categories, floors, products] = await Promise.all([
        getDocs(query(collection(db, 'shops'), limit(1))),
        getDocs(query(collection(db, 'offers'), limit(1))),
        getDocs(query(collection(db, 'categories'), limit(1))),
        getDocs(query(collection(db, 'floors'), limit(1))),
        getDocs(query(collection(db, 'products'), limit(1))),
      ]);

      return shops.size > 0 || offers.size > 0 || categories.size > 0 || floors.size > 0 || products.size > 0;
    } catch (error) {
      logger.error('Error checking demo data:', error as Error);
      return false;
    }
  }

  /**
   * Check if we have sufficient demo data (more comprehensive check)
   */
  static async hasCompleteDemoData(): Promise<boolean> {
    try {
      const [shops, offers, categories, floors, products] = await Promise.all([
        getDocs(collection(db, 'shops')),
        getDocs(collection(db, 'offers')),
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'floors')),
        getDocs(collection(db, 'products')),
      ]);

      // Consider demo data complete if we have reasonable amounts of each type
      const isComplete = (
        shops.size >= 5 && 
        offers.size >= 3 && 
        categories.size >= 5 && 
        floors.size >= 3 && 
        products.size >= 10
      );

      logger.info(`Demo data completeness check: shops=${shops.size}, offers=${offers.size}, categories=${categories.size}, floors=${floors.size}, products=${products.size}, complete=${isComplete}`);
      
      return isComplete;
    } catch (error) {
      logger.error('Error checking complete demo data:', error as Error);
      // If there's an error (like permissions), assume we need to create demo data
      return false;
    }
  }

  /**
   * Create all demo data for a specific user
   */
  static async createDemoDataForUser(userId: string): Promise<void> {
    try {
      logger.info('Creating demo data for user:', userId);

      // Create demo data in order
      await this.createDemoCategories();
      await this.createDemoFloors();
      await this.createDemoShopsForUser(userId);
      await this.createDemoOffersForUser(userId);
      await this.createDemoProductsForUser(userId);

      logger.info('Demo data created successfully for user:', userId);
    } catch (error) {
      logger.error('Failed to create demo data for user:', error as Error);
      throw new Error('Failed to create demo data for user');
    }
  }

  /**
   * Create all demo data
   */
  static async createDemoData(): Promise<void> {
    try {
      logger.info('Creating demo data...');

      // Skip the hasDemoData check for now and just create the data
      // This will allow us to populate the database even if there's partial data

      // Create demo data in order
      await this.createDemoCategories();
      await this.createDemoFloors();
      await this.createDemoShops();
      await this.createDemoOffers();
      await this.createDemoProducts();

      logger.info('Demo data created successfully!');
    } catch (error) {
      logger.error('Failed to create demo data:', error as Error);
      throw new Error('Failed to create demo data');
    }
  }

  /**
   * Create demo categories
   */
  private static async createDemoCategories(): Promise<void> {
    const categories = [
      { name: 'Fashion & Clothing', icon: '👗', description: 'Trendy clothes and fashion accessories' },
      { name: 'Electronics', icon: '📱', description: 'Latest gadgets and electronic devices' },
      { name: 'Food & Dining', icon: '🍕', description: 'Restaurants and food courts' },
      { name: 'Beauty & Cosmetics', icon: '💄', description: 'Beauty products and cosmetics' },
      { name: 'Books & Stationery', icon: '📚', description: 'Books, stationery, and office supplies' },
      { name: 'Sports & Fitness', icon: '⚽', description: 'Sports equipment and fitness gear' },
      { name: 'Home & Decor', icon: '🏠', description: 'Home furnishing and decoration items' },
      { name: 'Jewelry', icon: '💎', description: 'Fine jewelry and accessories' },
      { name: 'Toys & Games', icon: '🧸', description: 'Toys and games for all ages' },
      { name: 'Health & Pharmacy', icon: '💊', description: 'Medicines and health products' },
    ];

    for (const category of categories) {
      await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });
    }

    logger.info(`Created ${categories.length} demo categories`);
  }

  /**
   * Create demo floors
   */
  private static async createDemoFloors(): Promise<void> {
    const floors = [
      { name: 'Ground Floor', order: 1, description: 'Main entrance level with popular shops' },
      { name: 'First Floor', order: 2, description: 'Fashion and electronics section' },
      { name: 'Second Floor', order: 3, description: 'Food court and dining area' },
      { name: 'Third Floor', order: 4, description: 'Entertainment and specialty stores' },
      { name: 'Fourth Floor', order: 5, description: 'Services and business center' },
    ];

    for (const floor of floors) {
      await addDoc(collection(db, 'floors'), {
        ...floor,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });
    }

    logger.info(`Created ${floors.length} demo floors`);
  }

  /**
   * Create demo shops for a specific user
   */
  private static async createDemoShopsForUser(userId: string): Promise<void> {
    const shops = [
      {
        name: 'My Fashion Store',
        address: 'Shop No. 101, Ground Floor',
        category: 'Fashion & Clothing',
        floor: 'Ground Floor',
        phone: '+91 98765 43210',
        website: 'https://myfashionstore.com',
        description: 'Latest trendy clothes for men and women',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        rating: 4.5,
        offers: [],
        userId: userId,
      },
      {
        name: 'Tech Hub Electronics',
        address: 'Shop No. 205, First Floor',
        category: 'Electronics',
        floor: 'First Floor',
        phone: '+91 98765 43211',
        website: 'https://techhub.com',
        description: 'Latest smartphones, laptops, and gadgets',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
        rating: 4.8,
        offers: [],
        userId: userId,
      },
      {
        name: 'Delicious Cafe',
        address: 'Shop No. 301, Second Floor',
        category: 'Food & Dining',
        floor: 'Second Floor',
        phone: '+91 98765 43212',
        description: 'Multi-cuisine restaurant with amazing flavors',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        rating: 4.3,
        offers: [],
        userId: userId,
      },
    ];

    for (const shop of shops) {
      await addDoc(collection(db, 'shops'), {
        ...shop,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });
    }

    logger.info(`Created ${shops.length} demo shops for user: ${userId}`);
  }

  /**
   * Create demo offers for a specific user
   */
  private static async createDemoOffersForUser(userId: string): Promise<void> {
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + 30); // Valid for 30 days

    const offers = [
      {
        shopId: 'my-shop-1',
        title: '50% Off on Fashion Collection',
        description: 'Get flat 50% discount on all fashion items',
        discountPercentage: 50,
        originalPrice: 2000,
        discountedPrice: 1000,
        validFrom: currentDate,
        validTo: futureDate,
        category: 'Fashion & Clothing',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
        isActive: true,
        termsAndConditions: 'Valid on purchase of minimum ₹1500. Not valid with other offers.',
        userId: userId,
      },
      {
        shopId: 'my-shop-2',
        title: 'Electronics Sale - Up to 40% Off',
        description: 'Latest electronics with amazing discounts',
        discountPercentage: 40,
        originalPrice: 25000,
        discountedPrice: 15000,
        validFrom: currentDate,
        validTo: futureDate,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        isActive: true,
        termsAndConditions: 'Limited stock. First come first serve basis.',
        userId: userId,
      },
      {
        shopId: 'my-shop-3',
        title: 'Buy 1 Get 1 Free on Food',
        description: 'Order any item and get another free',
        discountPercentage: 50,
        originalPrice: 500,
        discountedPrice: 250,
        validFrom: currentDate,
        validTo: futureDate,
        category: 'Food & Dining',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        isActive: true,
        termsAndConditions: 'Valid for dine-in only. Free item of equal or lesser value.',
        userId: userId,
      },
    ];

    for (const offer of offers) {
      await addDoc(collection(db, 'offers'), {
        ...offer,
        validFrom: Timestamp.fromDate(offer.validFrom),
        validTo: Timestamp.fromDate(offer.validTo),
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });
    }

    logger.info(`Created ${offers.length} demo offers for user: ${userId}`);
  }

  /**
   * Create demo products for a specific user
   */
  private static async createDemoProductsForUser(userId: string): Promise<void> {
    const products = [
      {
        name: 'Casual T-Shirt',
        price: 799,
        category: 'Fashion & Clothing',
        description: 'Comfortable cotton t-shirt for daily wear',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        shopId: 'my-shop-1',
        shopName: 'My Fashion Store',
        userId: userId,
      },
      {
        name: 'Smartphone',
        price: 79999,
        category: 'Electronics',
        description: 'Latest smartphone with advanced features',
        image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400',
        shopId: 'my-shop-2',
        shopName: 'Tech Hub Electronics',
        userId: userId,
      },
      {
        name: 'Delicious Pizza',
        price: 349,
        category: 'Food & Dining',
        description: 'Fresh pizza with amazing toppings',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        shopId: 'my-shop-3',
        shopName: 'Delicious Cafe',
        userId: userId,
      },
    ];

    for (const product of products) {
      await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });
    }

    logger.info(`Created ${products.length} demo products for user: ${userId}`);
  }

  /**
   * Create demo shops
   */
  private static async createDemoShops(): Promise<void> {
    const shops = [
      {
        name: 'Fashion Hub',
        address: 'Shop No. 101, Ground Floor',
        category: 'Fashion & Clothing',
        floor: 'Ground Floor',
        phone: '+91 98765 43210',
        website: 'https://fashionhub.com',
        description: 'Latest trendy clothes for men and women',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        rating: 4.5,
        offers: [],
        userId: 'demo-user-1',
      },
      {
        name: 'TechWorld Electronics',
        address: 'Shop No. 205, First Floor',
        category: 'Electronics',
        floor: 'First Floor',
        phone: '+91 98765 43211',
        website: 'https://techworld.com',
        description: 'Latest smartphones, laptops, and gadgets',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
        rating: 4.8,
        offers: [],
        userId: 'demo-user-2',
      },
      {
        name: 'Delicious Bites',
        address: 'Shop No. 301, Second Floor',
        category: 'Food & Dining',
        floor: 'Second Floor',
        phone: '+91 98765 43212',
        description: 'Multi-cuisine restaurant with amazing flavors',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        rating: 4.3,
        offers: [],
        userId: 'demo-user-3',
      },
      {
        name: 'Glamour Beauty',
        address: 'Shop No. 102, Ground Floor',
        category: 'Beauty & Cosmetics',
        floor: 'Ground Floor',
        phone: '+91 98765 43213',
        website: 'https://glamourbeauty.com',
        description: 'Premium cosmetics and beauty treatments',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
        rating: 4.6,
        offers: [],
        userId: 'demo-user-4',
      },
      {
        name: 'BookWorm Paradise',
        address: 'Shop No. 206, First Floor',
        category: 'Books & Stationery',
        floor: 'First Floor',
        phone: '+91 98765 43214',
        description: 'Wide collection of books and stationery items',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        rating: 4.4,
        offers: [],
        userId: 'demo-user-5',
      },
      {
        name: 'FitZone Sports',
        address: 'Shop No. 302, Second Floor',
        category: 'Sports & Fitness',
        floor: 'Second Floor',
        phone: '+91 98765 43215',
        website: 'https://fitzonesports.com',
        description: 'Sports equipment and fitness accessories',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        rating: 4.7,
        offers: [],
        userId: 'demo-user-6',
      },
      {
        name: 'Home Decor Studio',
        address: 'Shop No. 401, Third Floor',
        category: 'Home & Decor',
        floor: 'Third Floor',
        phone: '+91 98765 43216',
        description: 'Beautiful home furnishing and decoration items',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
        rating: 4.2,
        offers: [],
        userId: 'demo-user-7',
      },
      {
        name: 'Diamond Dreams',
        address: 'Shop No. 103, Ground Floor',
        category: 'Jewelry',
        floor: 'Ground Floor',
        phone: '+91 98765 43217',
        website: 'https://diamonddreams.com',
        description: 'Exquisite jewelry and precious stones',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
        rating: 4.9,
        offers: [],
        userId: 'demo-user-8',
      },
      {
        name: 'KidZone Toys',
        address: 'Shop No. 402, Third Floor',
        category: 'Toys & Games',
        floor: 'Third Floor',
        phone: '+91 98765 43218',
        description: 'Fun toys and educational games for children',
        image: 'https://images.unsplash.com/photo-1558877172-613c8e8b7956?w=400',
        rating: 4.1,
        offers: [],
        userId: 'demo-user-9',
      },
      {
        name: 'HealthCare Plus',
        address: 'Shop No. 501, Fourth Floor',
        category: 'Health & Pharmacy',
        floor: 'Fourth Floor',
        phone: '+91 98765 43219',
        description: 'Complete pharmacy and health consultation',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
        rating: 4.8,
        offers: [],
        userId: 'demo-user-10',
      },
      {
        name: 'Cafe Mocha',
        address: 'Shop No. 303, Second Floor',
        category: 'Food & Dining',
        floor: 'Second Floor',
        phone: '+91 98765 43220',
        description: 'Cozy cafe with premium coffee and snacks',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
        rating: 4.4,
        offers: [],
        userId: 'demo-user-11',
      },
      {
        name: 'Style Statement',
        address: 'Shop No. 207, First Floor',
        category: 'Fashion & Clothing',
        floor: 'First Floor',
        phone: '+91 98765 43221',
        description: 'Designer clothing and accessories',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
        rating: 4.6,
        offers: [],
        userId: 'demo-user-12',
      },
    ];

    for (const shop of shops) {
      await addDoc(collection(db, 'shops'), {
        ...shop,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });
    }

    logger.info(`Created ${shops.length} demo shops`);
  }

  /**
   * Create demo offers
   */
  private static async createDemoOffers(): Promise<void> {
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + 30); // Valid for 30 days

    const offers = [
      {
        shopId: 'demo-shop-1',
        title: '50% Off on Summer Collection',
        description: 'Get flat 50% discount on all summer clothing items',
        discountPercentage: 50,
        originalPrice: 2000,
        discountedPrice: 1000,
        validFrom: currentDate,
        validTo: futureDate,
        category: 'Fashion & Clothing',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
        isActive: true,
        termsAndConditions: 'Valid on purchase of minimum ₹1500. Not valid with other offers.',
        userId: 'demo-user-1',
      },
      {
        shopId: 'demo-shop-2',
        title: 'Smartphone Sale - Up to 40% Off',
        description: 'Latest smartphones with amazing discounts',
        discountPercentage: 40,
        originalPrice: 25000,
        discountedPrice: 15000,
        validFrom: currentDate,
        validTo: futureDate,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        isActive: true,
        termsAndConditions: 'Limited stock. First come first serve basis.',
        userId: 'demo-user-2',
      },
      {
        shopId: 'demo-shop-3',
        title: 'Buy 1 Get 1 Free on Main Course',
        description: 'Order any main course and get another free',
        discountPercentage: 50,
        originalPrice: 500,
        discountedPrice: 250,
        validFrom: currentDate,
        validTo: futureDate,
        category: 'Food & Dining',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        isActive: true,
        termsAndConditions: 'Valid for dine-in only. Free item of equal or lesser value.',
        userId: 'demo-user-3',
      },
      {
        shopId: 'demo-shop-4',
        title: '30% Off on Skincare Products',
        description: 'Premium skincare products at discounted prices',
        discountPercentage: 30,
        originalPrice: 1500,
        discountedPrice: 1050,
        validFrom: currentDate,
        validTo: futureDate,
        category: 'Beauty & Cosmetics',
        image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400',
        isActive: true,
        termsAndConditions: 'Valid on international brands only.',
        userId: 'demo-user-4',
      },
      {
        shopId: 'demo-shop-5',
        title: 'Back to School - 25% Off Stationery',
        description: 'All stationery items at special prices',
        discountPercentage: 25,
        originalPrice: 800,
        discountedPrice: 600,
        validFrom: currentDate,
        validTo: futureDate,
        category: 'Books & Stationery',
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
        isActive: true,
        termsAndConditions: 'Minimum purchase of ₹500 required.',
        userId: 'demo-user-5',
      },
      {
        shopId: 'demo-shop-6',
        title: 'Gym Equipment Sale - 35% Off',
        description: 'Professional gym equipment at home',
        discountPercentage: 35,
        originalPrice: 5000,
        discountedPrice: 3250,
        validFrom: currentDate,
        validTo: futureDate,
        category: 'Sports & Fitness',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
        isActive: true,
        termsAndConditions: 'Free home delivery and installation.',
        userId: 'demo-user-6',
      },
      {
        shopId: 'demo-shop-7',
        title: 'Home Makeover - 45% Off',
        description: 'Transform your home with our collection',
        discountPercentage: 45,
        originalPrice: 3000,
        discountedPrice: 1650,
        validFrom: currentDate,
        validTo: futureDate,
        category: 'Home & Decor',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
        isActive: true,
        termsAndConditions: 'Valid on furniture items only.',
        userId: 'demo-user-7',
      },
      {
        shopId: 'demo-shop-8',
        title: 'Diamond Collection - 20% Off',
        description: 'Exclusive diamond jewelry collection',
        discountPercentage: 20,
        originalPrice: 50000,
        discountedPrice: 40000,
        validFrom: currentDate,
        validTo: futureDate,
        category: 'Jewelry',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
        isActive: true,
        termsAndConditions: 'Certification included. Gold rate applicable separately.',
        userId: 'demo-user-8',
      },
    ];

    for (const offer of offers) {
      await addDoc(collection(db, 'offers'), {
        ...offer,
        validFrom: Timestamp.fromDate(offer.validFrom),
        validTo: Timestamp.fromDate(offer.validTo),
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });
    }

    logger.info(`Created ${offers.length} demo offers`);
  }

  /**
   * Create demo products
   */
  private static async createDemoProducts(): Promise<void> {
    const products = [
      {
        name: 'Casual T-Shirt',
        price: 799,
        category: 'Fashion & Clothing',
        description: 'Comfortable cotton t-shirt for daily wear',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        shopId: 'demo-shop-1',
        shopName: 'Fashion Hub',
      },
      {
        name: 'Formal Shirt',
        price: 1299,
        category: 'Fashion & Clothing',
        description: 'Professional formal shirt for office wear',
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
        shopId: 'demo-shop-1',
        shopName: 'Fashion Hub',
      },
      {
        name: 'iPhone 14',
        price: 79999,
        category: 'Electronics',
        description: 'Latest iPhone with advanced features',
        image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400',
        shopId: 'demo-shop-2',
        shopName: 'TechWorld Electronics',
      },
      {
        name: 'Samsung Galaxy S23',
        price: 69999,
        category: 'Electronics',
        description: 'Flagship Android smartphone',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        shopId: 'demo-shop-2',
        shopName: 'TechWorld Electronics',
      },
      {
        name: 'Chicken Biryani',
        price: 349,
        category: 'Food & Dining',
        description: 'Aromatic basmati rice with tender chicken',
        image: 'https://images.unsplash.com/photo-1563379091339-03246963d388?w=400',
        shopId: 'demo-shop-3',
        shopName: 'Delicious Bites',
      },
      {
        name: 'Paneer Butter Masala',
        price: 299,
        category: 'Food & Dining',
        description: 'Creamy paneer curry with rich gravy',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
        shopId: 'demo-shop-3',
        shopName: 'Delicious Bites',
      },
      {
        name: 'Foundation',
        price: 1599,
        category: 'Beauty & Cosmetics',
        description: 'Long-lasting liquid foundation',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
        shopId: 'demo-shop-4',
        shopName: 'Glamour Beauty',
      },
      {
        name: 'Lipstick Set',
        price: 899,
        category: 'Beauty & Cosmetics',
        description: 'Set of 6 matte lipsticks in trending colors',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
        shopId: 'demo-shop-4',
        shopName: 'Glamour Beauty',
      },
      {
        name: 'Programming Book',
        price: 599,
        category: 'Books & Stationery',
        description: 'Complete guide to modern programming',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        shopId: 'demo-shop-5',
        shopName: 'BookWorm Paradise',
      },
      {
        name: 'Notebook Set',
        price: 299,
        category: 'Books & Stationery',
        description: 'Pack of 5 ruled notebooks',
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400',
        shopId: 'demo-shop-5',
        shopName: 'BookWorm Paradise',
      },
      {
        name: 'Yoga Mat',
        price: 1299,
        category: 'Sports & Fitness',
        description: 'Non-slip yoga mat for daily practice',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
        shopId: 'demo-shop-6',
        shopName: 'FitZone Sports',
      },
      {
        name: 'Dumbbells Set',
        price: 2999,
        category: 'Sports & Fitness',
        description: 'Adjustable weight dumbbells set',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        shopId: 'demo-shop-6',
        shopName: 'FitZone Sports',
      },
      {
        name: 'Wall Clock',
        price: 899,
        category: 'Home & Decor',
        description: 'Modern minimalist wall clock',
        image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400',
        shopId: 'demo-shop-7',
        shopName: 'Home Decor Studio',
      },
      {
        name: 'Table Lamp',
        price: 1599,
        category: 'Home & Decor',
        description: 'LED table lamp with adjustable brightness',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        shopId: 'demo-shop-7',
        shopName: 'Home Decor Studio',
      },
      {
        name: 'Diamond Ring',
        price: 45999,
        category: 'Jewelry',
        description: 'Beautiful diamond engagement ring',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
        shopId: 'demo-shop-8',
        shopName: 'Diamond Dreams',
      },
      {
        name: 'Gold Necklace',
        price: 25999,
        category: 'Jewelry',
        description: 'Elegant 22k gold necklace',
        image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400',
        shopId: 'demo-shop-8',
        shopName: 'Diamond Dreams',
      },
      {
        name: 'Building Blocks',
        price: 799,
        category: 'Toys & Games',
        description: 'Educational building blocks for kids',
        image: 'https://images.unsplash.com/photo-1558877172-613c8e8b7956?w=400',
        shopId: 'demo-shop-9',
        shopName: 'KidZone Toys',
      },
      {
        name: 'Board Game',
        price: 1299,
        category: 'Toys & Games',
        description: 'Fun family board game for all ages',
        image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400',
        shopId: 'demo-shop-9',
        shopName: 'KidZone Toys',
      },
      {
        name: 'Vitamin Tablets',
        price: 399,
        category: 'Health & Pharmacy',
        description: 'Daily multivitamin supplement',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
        shopId: 'demo-shop-10',
        shopName: 'HealthCare Plus',
      },
      {
        name: 'Hand Sanitizer',
        price: 149,
        category: 'Health & Pharmacy',
        description: '500ml antibacterial hand sanitizer',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
        shopId: 'demo-shop-10',
        shopName: 'HealthCare Plus',
      },
    ];

    for (const product of products) {
      await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });
    }

    logger.info(`Created ${products.length} demo products`);
  }

  /**
   * Force create demo data (even if data exists)
   */
  static async forceDemoData(): Promise<void> {
    try {
      logger.info('Force creating demo data...');

      await this.createDemoCategories();
      await this.createDemoFloors();
      await this.createDemoShops();
      await this.createDemoOffers();
      await this.createDemoProducts();

      logger.info('Demo data force created successfully!');
    } catch (error) {
      logger.error('Failed to force create demo data:', error as Error);
      throw new Error('Failed to force create demo data');
    }
  }
}
