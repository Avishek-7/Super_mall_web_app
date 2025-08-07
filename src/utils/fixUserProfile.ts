import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logger } from './logger';

/**
 * Utility function to fix user profiles with incorrect business type values
 * This is a one-time fix for users who registered before the business type mapping was corrected
 */
export const fixUserProfile = async (userId: string, businessName: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }
    
    const userData = userDoc.data();
    logger.info('Current user data:', userData);
    
    // Map incorrect business type values to correct ones
    let correctedBusinessType = userData.businessType;
    if (userData.businessType === 'service provider' || userData.businessType === 'service provider ') {
      correctedBusinessType = 'service';
    }
    
    const updates: Partial<{
      businessType: string;
      businessName: string;
      role: string;
      updatedAt: Date;
    }> = {
      updatedAt: new Date()
    };
    
    // Fix business type if needed
    if (correctedBusinessType !== userData.businessType) {
      updates.businessType = correctedBusinessType;
    }
    
    // Add business name if missing (required for dashboard access)
    if (!userData.businessName && businessName.trim()) {
      updates.businessName = businessName.trim();
    }
    
    // Ensure role is set to admin for business users
    if (!userData.role || userData.role === 'user') {
      if (userData.businessType || businessName.trim()) {
        updates.role = 'admin'; // Business users should be admins
      } else {
        updates.role = 'user'; // Regular users stay as users
      }
    }
    
    await updateDoc(userDocRef, updates);
    
    logger.info('User profile updated successfully:', updates);
    return { success: true, updates };
    
  } catch (error) {
    logger.error('Failed to update user profile:', error as Error);
    throw error;
  }
};

/**
 * Example usage:
 * 
 * // Fix the specific user's profile
 * await fixUserProfile('eyj5laNjCKZD0g1Qk92mvsUYVW62', 'User Business Name');
 * 
 * // Then ask the user to log out and log back in to refresh their session
 */
