import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  collection,
  query,
  orderBy,
  where,
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
  businessType?: 'retail' | 'food' | 'service' | 'other'; // Optional - only for business users
  businessName?: string; // For business users
  businessAddress?: string; // For business users
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  displayName?: string;
  phoneNumber?: string;
  address?: string;
  businessType?: 'retail' | 'food' | 'service' | 'other';
  role?: 'admin' | 'user';
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
      if (profileData.role !== undefined) {
        updateData.role = profileData.role;
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
      logger.info('Fetching user statistics for:', userId);
      
      // Import services here to avoid circular dependencies
      const { ShopService } = await import('./shopService');
      const { OfferService } = await import('./offerService');
      
      const [shops, offers] = await Promise.all([
        ShopService.getUserShops(userId),
        OfferService.getUserOffers(userId)
      ]);
      
      const activeOffers = offers.filter(offer => 
        offer.isActive && offer.validTo >= new Date()
      ).length;
      
      return {
        totalShops: shops.length,
        totalOffers: offers.length,
        activeOffers
      };
    } catch (error) {
      logger.error('Failed to fetch user statistics:', error as Error);
      throw new Error('Failed to fetch user statistics');
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(): Promise<UserProfile[]> {
    try {
      logger.info('Fetching all users');
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const users: UserProfile[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          uid: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as UserProfile);
      });

      logger.info(`Found ${users.length} total users`);
      return users;
    } catch (error) {
      logger.error('Failed to fetch all users:', error as Error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Get users by role (admin only)
   */
  static async getUsersByRole(role: 'admin' | 'user'): Promise<UserProfile[]> {
    try {
      logger.info('Fetching users by role:', role);
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('role', '==', role),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const users: UserProfile[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          uid: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as UserProfile);
      });

      logger.info(`Found ${users.length} users with role:`, role);
      return users;
    } catch (error) {
      logger.error('Failed to fetch users by role:', error as Error);
      throw new Error('Failed to fetch users by role');
    }
  }

  /**
   * Promote user to admin (admin only)
   */
  static async promoteToAdmin(userId: string): Promise<void> {
    try {
      logger.info('Promoting user to admin:', userId);
      
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(docRef, {
        role: 'admin',
        updatedAt: Timestamp.fromDate(new Date()),
      });

      logger.info('User promoted to admin successfully:', userId);
    } catch (error) {
      logger.error('Failed to promote user to admin:', error as Error);
      throw new Error('Failed to promote user to admin');
    }
  }
}
