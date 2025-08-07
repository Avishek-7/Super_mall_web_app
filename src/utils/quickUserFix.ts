import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logger } from './logger';

/**
 * Quick fix for user profile to enable dashboard access
 * This will add the missing businessName field for the specific user
 */
export const quickFixUserProfile = async () => {
  const userId = 'eyj5laNjCKZD0g1Qk92mvsUYVW62';
  
  try {
    const userDocRef = doc(db, 'users', userId);
    
    const updates = {
      businessType: 'service', // Fix the incorrect "service provider" value
      businessName: 'Avishek Services', // Add the missing business name
      role: 'user',
      updatedAt: new Date()
    };
    
    await updateDoc(userDocRef, updates);
    
    logger.info('User profile fixed successfully:', updates);
    
    // Return success message
    return {
      success: true,
      message: 'Profile updated successfully! Please refresh the page or log out and log back in.',
      updates
    };
    
  } catch (error) {
    logger.error('Failed to fix user profile:', error as Error);
    throw error;
  }
};

// Auto-run the fix when this module is imported
quickFixUserProfile()
  .then((result) => {
    console.log('✅ Quick fix applied:', result.message);
  })
  .catch((error) => {
    console.error('❌ Quick fix failed:', error);
  });
