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
import type { Offer, OfferFormData } from '../types/shop';
import { logger } from '../utils/logger';

export class OfferService {
  private static readonly COLLECTION_NAME = 'offers';

  /**
   * Create a new offer
   */
  static async createOffer(offerData: OfferFormData, shopId: string, userId: string): Promise<string> {
    try {
      logger.info('Creating new offer for shop:', shopId);
      
      const offer: Omit<Offer, 'id'> = {
        shopId,
        title: offerData.title,
        description: offerData.description,
        discountPercentage: offerData.discountPercentage,
        originalPrice: offerData.originalPrice,
        discountedPrice: offerData.discountedPrice,
        validFrom: offerData.validFrom,
        validTo: offerData.validTo,
        category: offerData.category,
        image: typeof offerData.image === 'string' ? offerData.image : undefined,
        isActive: true,
        termsAndConditions: offerData.termsAndConditions,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...offer,
        userId,
        validFrom: Timestamp.fromDate(offer.validFrom),
        validTo: Timestamp.fromDate(offer.validTo),
        createdAt: Timestamp.fromDate(offer.createdAt),
        updatedAt: Timestamp.fromDate(offer.updatedAt),
      });

      logger.info('Offer created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      logger.error('Failed to create offer:', error as Error);
      throw new Error('Failed to create offer');
    }
  }

  /**
   * Get all offers for a user
   */
  static async getUserOffers(userId: string): Promise<Offer[]> {
    try {
      logger.info('Fetching offers for user:', userId);
      
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
      
      const offers: Offer[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        offers.push({
          id: doc.id,
          ...data,
          validFrom: data.validFrom.toDate(),
          validTo: data.validTo.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Offer);
      });

      // Sort in memory if we used the simple query
      offers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      logger.info(`Found ${offers.length} offers for user:`, userId);
      return offers;
    } catch (error) {
      logger.error('Failed to fetch user offers:', error as Error);
      throw new Error('Failed to fetch offers');
    }
  }

  /**
   * Get all offers for a shop
   */
  static async getShopOffers(shopId: string): Promise<Offer[]> {
    try {
      logger.info('Fetching offers for shop:', shopId);
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('shopId', '==', shopId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const offers: Offer[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        offers.push({
          id: doc.id,
          ...data,
          validFrom: data.validFrom.toDate(),
          validTo: data.validTo.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Offer);
      });

      logger.info(`Found ${offers.length} offers for shop:`, shopId);
      return offers;
    } catch (error) {
      logger.error('Failed to fetch shop offers:', error as Error);
      throw new Error('Failed to fetch shop offers');
    }
  }

  /**
   * Get all active offers (public)
   */
  static async getActiveOffers(limitCount?: number): Promise<Offer[]> {
    try {
      logger.info('Fetching all active offers');
      
      const now = Timestamp.fromDate(new Date());
      
      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true),
        where('validTo', '>=', now),
        orderBy('validTo', 'asc')
      );
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      let querySnapshot;
      try {
        // Try the compound query first
        querySnapshot = await getDocs(q);
      } catch (indexError) {
        logger.warn('Compound query failed (possibly due to index building), trying simple query:', indexError);
        // Fallback to simple query without orderBy
        let fallbackQuery = query(
          collection(db, this.COLLECTION_NAME),
          where('isActive', '==', true)
        );
        
        if (limitCount) {
          fallbackQuery = query(fallbackQuery, limit(limitCount * 2)); // Get more to compensate for filtering
        }
        
        querySnapshot = await getDocs(fallbackQuery);
      }
      
      const offers: Offer[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const offer = {
          id: doc.id,
          ...data,
          validFrom: data.validFrom.toDate(),
          validTo: data.validTo.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Offer;
        
        // Filter out expired offers if using fallback query
        if (offer.validTo >= new Date()) {
          offers.push(offer);
        }
      });

      // Sort by validTo if we used the fallback query
      offers.sort((a, b) => a.validTo.getTime() - b.validTo.getTime());
      
      // Apply limit if specified and we have more offers than needed
      const finalOffers = limitCount && offers.length > limitCount 
        ? offers.slice(0, limitCount) 
        : offers;

      logger.info(`Found ${finalOffers.length} active offers`);
      return finalOffers;
    } catch (error) {
      logger.error('Failed to fetch active offers:', error as Error);
      throw new Error('Failed to fetch active offers');
    }
  }

  /**
   * Get offers by category
   */
  static async getOffersByCategory(category: string): Promise<Offer[]> {
    try {
      logger.info('Fetching offers by category:', category);
      
      const now = Timestamp.fromDate(new Date());
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('category', '==', category),
        where('isActive', '==', true),
        where('validTo', '>=', now),
        orderBy('validTo', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const offers: Offer[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        offers.push({
          id: doc.id,
          ...data,
          validFrom: data.validFrom.toDate(),
          validTo: data.validTo.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Offer);
      });

      logger.info(`Found ${offers.length} offers in category:`, category);
      return offers;
    } catch (error) {
      logger.error('Failed to fetch offers by category:', error as Error);
      throw new Error('Failed to fetch offers by category');
    }
  }

  /**
   * Get a single offer by ID
   */
  static async getOfferById(offerId: string): Promise<Offer | null> {
    try {
      logger.info('Fetching offer by ID:', offerId);
      
      const docRef = doc(db, this.COLLECTION_NAME, offerId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          validFrom: data.validFrom.toDate(),
          validTo: data.validTo.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Offer;
      } else {
        logger.warn('Offer not found:', offerId);
        return null;
      }
    } catch (error) {
      logger.error('Failed to fetch offer by ID:', error as Error);
      throw new Error('Failed to fetch offer');
    }
  }

  /**
   * Update an offer
   */
  static async updateOffer(offerId: string, offerData: Partial<OfferFormData>, userId: string): Promise<void> {
    try {
      logger.info('Updating offer:', offerId, 'for user:', userId);
      
      // First verify the offer belongs to the user
      const offer = await this.getOfferById(offerId);
      if (!offer) {
        throw new Error('Offer not found');
      }
      
      const updateData: Record<string, unknown> = {
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Only update fields that are provided
      if (offerData.title !== undefined) updateData.title = offerData.title;
      if (offerData.description !== undefined) updateData.description = offerData.description;
      if (offerData.discountPercentage !== undefined) updateData.discountPercentage = offerData.discountPercentage;
      if (offerData.originalPrice !== undefined) updateData.originalPrice = offerData.originalPrice;
      if (offerData.discountedPrice !== undefined) updateData.discountedPrice = offerData.discountedPrice;
      if (offerData.validFrom !== undefined) updateData.validFrom = Timestamp.fromDate(offerData.validFrom);
      if (offerData.validTo !== undefined) updateData.validTo = Timestamp.fromDate(offerData.validTo);
      if (offerData.category !== undefined) updateData.category = offerData.category;
      if (offerData.termsAndConditions !== undefined) updateData.termsAndConditions = offerData.termsAndConditions;
      if (offerData.image !== undefined && typeof offerData.image === 'string') {
        updateData.image = offerData.image;
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, offerId);
      await updateDoc(docRef, updateData as Partial<Offer>);

      logger.info('Offer updated successfully:', offerId);
    } catch (error) {
      logger.error('Failed to update offer:', error as Error);
      throw new Error('Failed to update offer');
    }
  }

  /**
   * Toggle offer active status
   */
  static async toggleOfferStatus(offerId: string, userId: string): Promise<void> {
    try {
      logger.info('Toggling offer status:', offerId, 'for user:', userId);
      
      const offer = await this.getOfferById(offerId);
      if (!offer) {
        throw new Error('Offer not found');
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, offerId);
      await updateDoc(docRef, {
        isActive: !offer.isActive,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      logger.info('Offer status toggled successfully:', offerId);
    } catch (error) {
      logger.error('Failed to toggle offer status:', error as Error);
      throw new Error('Failed to toggle offer status');
    }
  }

  /**
   * Delete an offer
   */
  static async deleteOffer(offerId: string, userId: string): Promise<void> {
    try {
      logger.info('Deleting offer:', offerId, 'for user:', userId);
      
      // First verify the offer belongs to the user
      const offer = await this.getOfferById(offerId);
      if (!offer) {
        throw new Error('Offer not found');
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, offerId);
      await deleteDoc(docRef);

      logger.info('Offer deleted successfully:', offerId);
    } catch (error) {
      logger.error('Failed to delete offer:', error as Error);
      throw new Error('Failed to delete offer');
    }
  }

  /**
   * Search offers by title or description
   */
  static async searchOffers(searchTerm: string): Promise<Offer[]> {
    try {
      logger.info('Searching offers with term:', searchTerm);
      
      // Note: Firestore doesn't have full-text search. For production,
      // consider using Algolia or implementing your own search solution
      const offers = await this.getActiveOffers();
      
      const filteredOffers = offers.filter(offer => 
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.category.toLowerCase().includes(searchTerm.toLowerCase())
      );

      logger.info(`Found ${filteredOffers.length} offers matching search term`);
      return filteredOffers;
    } catch (error) {
      logger.error('Failed to search offers:', error as Error);
      throw new Error('Failed to search offers');
    }
  }
}
