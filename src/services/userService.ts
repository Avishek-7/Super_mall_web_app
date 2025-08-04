import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { updateProfile, updatePassword } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { logger } from '../utils/logger';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  address?: string;
  businessType: 'retail' | 'food' | 'service' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  displayName?: string;
  phoneNumber?: string;
  address?: string;
  businessType?: 'retail' | 'food' | 'service' | 'other';
}

export class UserService {
  private static readonly COLLECTION_NAME = 'users';

  /**
   * Create user profile in Firestore
   */
  static async createUserProfile(profile: UserProfile): Promise<void> {
    try {
      logger.info('Creating user profile:', profile.uid);
      
      const docRef = doc(db, this.COLLECTION_NAME, profile.uid);
      const profileData = {
        ...profile,
        createdAt: Timestamp.fromDate(profile.createdAt),
        updatedAt: Timestamp.fromDate(profile.updatedAt),
      };
      
      await setDoc(docRef, profileData);
      
      logger.info('User profile created successfully:', profile.uid);
    } catch (error) {
      logger.error('Failed to create user profile:', error as Error);
      throw new Error('Failed to create user profile');
    }
  }

  /**
   * Get user profile from Firestore
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      logger.info('Fetching user profile:', userId);
      
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          uid: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as UserProfile;
      } else {
        logger.warn('User profile not found:', userId);
        return null;
      }
    } catch (error) {
      logger.error('Failed to fetch user profile:', error as Error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Update user profile in Firestore and Firebase Auth
   */
  static async updateUserProfile(
    user: User, 
    profileData: UpdateProfileData
  ): Promise<void> {
    try {
      logger.info('Updating user profile:', user.uid);
      
      // Update Firebase Auth profile if displayName is provided
      if (profileData.displayName !== undefined) {
        await updateProfile(user, {
          displayName: profileData.displayName
        });
      }

      // Update Firestore document
      const updateData: Record<string, unknown> = {
        updatedAt: Timestamp.fromDate(new Date()),
      };

      if (profileData.displayName !== undefined) {
        updateData.displayName = profileData.displayName;
      }
      if (profileData.phoneNumber !== undefined) {
        updateData.phoneNumber = profileData.phoneNumber;
      }
      if (profileData.businessType !== undefined) {
        updateData.businessType = profileData.businessType;
      }

      const docRef = doc(db, this.COLLECTION_NAME, user.uid);
      await updateDoc(docRef, updateData as Partial<UserProfile>);

      logger.info('User profile updated successfully:', user.uid);
    } catch (error) {
      logger.error('Failed to update user profile:', error as Error);
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Update user password
   */
  static async updateUserPassword(user: User, newPassword: string): Promise<void> {
    try {
      logger.info('Updating password for user:', user.uid);
      
      await updatePassword(user, newPassword);
      
      // Update the updatedAt timestamp in Firestore
      const docRef = doc(db, this.COLLECTION_NAME, user.uid);
      await updateDoc(docRef, {
        updatedAt: Timestamp.fromDate(new Date()),
      });

      logger.info('Password updated successfully for user:', user.uid);
    } catch (error) {
      logger.error('Failed to update password:', error as Error);
      throw new Error('Failed to update password');
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId: string): Promise<{
    totalShops: number;
    totalOffers: number;
    activeOffers: number;
  }> {
    try {
      logger.info('Fetching user statistics:', userId);
      
      // Import services here to avoid circular dependencies
      const { ShopService } = await import('./shopService');
      const { OfferService } = await import('./offerService');
      
      const [shops, offers] = await Promise.all([
        ShopService.getUserShops(userId),
        OfferService.getUserOffers(userId),
      ]);

      const activeOffers = offers.filter(offer => 
        offer.isActive && new Date(offer.validTo) > new Date()
      ).length;

      const stats = {
        totalShops: shops.length,
        totalOffers: offers.length,
        activeOffers,
      };

      logger.info('User statistics fetched:', stats);
      return stats;
    } catch (error) {
      logger.error('Failed to fetch user statistics:', error as Error);
      throw new Error('Failed to fetch user statistics');
    }
  }
}
