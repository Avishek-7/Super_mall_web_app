import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Shop, ShopFormData } from '../types/shop';
import { logger } from '../utils/logger';

export class ShopService {
  private static readonly COLLECTION_NAME = 'shops';

  /**
   * Create a new shop
   */
  static async createShop(shopData: ShopFormData, userId: string): Promise<string> {
    try {
      logger.info('Creating new shop for user:', userId);
      
      const shop: Omit<Shop, 'id'> = {
        name: shopData.name,
        address: shopData.address,
        category: shopData.category,
        phone: shopData.phone,
        website: shopData.website,
        description: shopData.description,
        image: typeof shopData.image === 'string' ? shopData.image : undefined,
        rating: 0,
        offers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create document data, filtering out undefined values
      const shopDocData = {
        name: shop.name,
        address: shop.address,
        category: shop.category,
        rating: shop.rating,
        offers: shop.offers,
        userId,
        createdAt: Timestamp.fromDate(shop.createdAt),
        updatedAt: Timestamp.fromDate(shop.updatedAt),
        ...(shop.phone && { phone: shop.phone }),
        ...(shop.website && { website: shop.website }),
        ...(shop.description && { description: shop.description }),
        ...(shop.image && { image: shop.image }),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), shopDocData);

      logger.info('Shop created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      logger.error('Failed to create shop:', error as Error);
      throw new Error('Failed to create shop');
    }
  }

  /**
   * Get all shops for a user
   */
  static async getUserShops(userId: string): Promise<Shop[]> {
    try {
      logger.info('Fetching shops for user:', userId);
      
      let querySnapshot;
      
      try {
        // Try compound query first (requires index)
        const q = query(
          collection(db, this.COLLECTION_NAME),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        querySnapshot = await getDocs(q);
      } catch (indexError) {
        logger.warn('Compound query failed, falling back to simple query:', indexError);
        
        // Fallback to simple query without orderBy
        const q = query(
          collection(db, this.COLLECTION_NAME),
          where('userId', '==', userId)
        );
        querySnapshot = await getDocs(q);
      }
      
      const shops: Shop[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        shops.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Shop);
      });

      // Sort in memory if we used the simple query
      shops.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      logger.info(`Found ${shops.length} shops for user:`, userId);
      return shops;
    } catch (error) {
      logger.error('Failed to fetch user shops:', error as Error);
      throw new Error('Failed to fetch shops');
    }
  }

  /**
   * Get all shops (public)
   */
  static async getAllShops(limitCount?: number): Promise<Shop[]> {
    try {
      logger.info('Fetching all shops');
      
      let q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const shops: Shop[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        shops.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Shop);
      });

      logger.info(`Found ${shops.length} total shops`);
      return shops;
    } catch (error) {
      logger.error('Failed to fetch all shops:', error as Error);
      throw new Error('Failed to fetch shops');
    }
  }

  /**
   * Get shops by category
   */
  static async getShopsByCategory(category: string): Promise<Shop[]> {
    try {
      logger.info('Fetching shops by category:', category);
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const shops: Shop[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        shops.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Shop);
      });

      logger.info(`Found ${shops.length} shops in category:`, category);
      return shops;
    } catch (error) {
      logger.error('Failed to fetch shops by category:', error as Error);
      throw new Error('Failed to fetch shops by category');
    }
  }

  /**
   * Get a single shop by ID
   */
  static async getShopById(shopId: string): Promise<Shop | null> {
    try {
      logger.info('Fetching shop by ID:', shopId);
      
      const docRef = doc(db, this.COLLECTION_NAME, shopId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Shop;
      } else {
        logger.warn('Shop not found:', shopId);
        return null;
      }
    } catch (error) {
      logger.error('Failed to fetch shop by ID:', error as Error);
      throw new Error('Failed to fetch shop');
    }
  }

  /**
   * Update a shop
   */
  static async updateShop(shopId: string, shopData: Partial<ShopFormData>, userId: string): Promise<void> {
    try {
      logger.info('Updating shop:', shopId, 'for user:', userId);
      
      // First verify the shop belongs to the user
      const shop = await this.getShopById(shopId);
      if (!shop) {
        throw new Error('Shop not found');
      }
      
      // Note: Add userId validation here when you add userId to shop documents
      
      const updateData: Record<string, unknown> = {
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Only update fields that are provided
      if (shopData.name !== undefined) updateData.name = shopData.name;
      if (shopData.address !== undefined) updateData.address = shopData.address;
      if (shopData.category !== undefined) updateData.category = shopData.category;
      if (shopData.phone !== undefined) updateData.phone = shopData.phone;
      if (shopData.website !== undefined) updateData.website = shopData.website;
      if (shopData.description !== undefined) updateData.description = shopData.description;
      if (shopData.image !== undefined && typeof shopData.image === 'string') {
        updateData.image = shopData.image;
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, shopId);
      await updateDoc(docRef, updateData as Partial<Shop>);

      logger.info('Shop updated successfully:', shopId);
    } catch (error) {
      logger.error('Failed to update shop:', error as Error);
      throw new Error('Failed to update shop');
    }
  }

  /**
   * Delete a shop
   */
  static async deleteShop(shopId: string, userId: string): Promise<void> {
    try {
      logger.info('Deleting shop:', shopId, 'for user:', userId);
      
      // First verify the shop belongs to the user
      const shop = await this.getShopById(shopId);
      if (!shop) {
        throw new Error('Shop not found');
      }
      
      // Note: Add userId validation here when you add userId to shop documents
      
      const docRef = doc(db, this.COLLECTION_NAME, shopId);
      await deleteDoc(docRef);

      logger.info('Shop deleted successfully:', shopId);
    } catch (error) {
      logger.error('Failed to delete shop:', error as Error);
      throw new Error('Failed to delete shop');
    }
  }

  /**
   * Search shops by name or description
   */
  static async searchShops(searchTerm: string): Promise<Shop[]> {
    try {
      logger.info('Searching shops with term:', searchTerm);
      
      // Note: Firestore doesn't have full-text search. For production,
      // consider using Algolia or implementing your own search solution
      const shops = await this.getAllShops();
      
      const filteredShops = shops.filter(shop => 
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.category.toLowerCase().includes(searchTerm.toLowerCase())
      );

      logger.info(`Found ${filteredShops.length} shops matching search term`);
      return filteredShops;
    } catch (error) {
      logger.error('Failed to search shops:', error as Error);
      throw new Error('Failed to search shops');
    }
  }
}
