import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { logger } from '../utils/logger';

export class DemoUsersService {
  
  /**
   * Create demo users for testing
   */
  static async createDemoUsers(): Promise<void> {
    const demoUsers = [
      {
        email: 'admin@supermall.com',
        password: 'admin123',
        profile: {
          role: 'admin' as const,
          name: 'Super Mall Admin',
          phone: '+91 98765 00000',
        }
      },
      {
        email: 'fashion.hub@gmail.com',
        password: 'fashion123',
        profile: {
          role: 'user' as const,
          name: 'Fashion Hub Owner',
          phone: '+91 98765 43210',
          businessName: 'Fashion Hub',
          businessType: 'Fashion & Clothing',
        }
      },
      {
        email: 'techworld@gmail.com',
        password: 'tech123',
        profile: {
          role: 'user' as const,
          name: 'TechWorld Owner',
          phone: '+91 98765 43211',
          businessName: 'TechWorld Electronics',
          businessType: 'Electronics',
        }
      },
      {
        email: 'delicious.bites@gmail.com',
        password: 'food123',
        profile: {
          role: 'user' as const,
          name: 'Restaurant Owner',
          phone: '+91 98765 43212',
          businessName: 'Delicious Bites',
          businessType: 'Food & Dining',
        }
      },
      {
        email: 'customer@gmail.com',
        password: 'customer123',
        profile: {
          role: 'user' as const,
          name: 'John Customer',
          phone: '+91 98765 99999',
        }
      },
    ];

    logger.info('Creating demo users...');

    for (const user of demoUsers) {
      try {
        // Create auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );

        // Create user profile in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          ...user.profile,
          email: user.email,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        });

        logger.info(`Created demo user: ${user.email}`);
      } catch (error: unknown) {
        const authError = error as { code?: string; message?: string };
        if (authError.code === 'auth/email-already-in-use') {
          logger.info(`Demo user already exists: ${user.email}`);
        } else if (authError.code === 'auth/operation-not-allowed') {
          logger.warn(`Email/password authentication not enabled in Firebase Console. Skipping user creation for: ${user.email}`);
        } else {
          logger.warn(`Failed to create demo user ${user.email}:`, error as Error);
          // Don't throw error, just continue with next user
        }
      }
    }

    logger.info('Demo users creation completed');
  }

  /**
   * Get demo credentials for easy login
   */
  static getDemoCredentials() {
    return {
      admin: {
        email: 'admin@supermall.com',
        password: 'admin123',
        description: 'Mall Administrator - Full access to admin panel and dashboard'
      },
      shopOwner1: {
        email: 'fashion.hub@gmail.com',
        password: 'fashion123',
        description: 'Fashion Hub Shop Owner - Can manage their shop'
      },
      shopOwner2: {
        email: 'techworld@gmail.com',
        password: 'tech123',
        description: 'TechWorld Electronics Shop Owner - Can manage their shop'
      },
      shopOwner3: {
        email: 'delicious.bites@gmail.com',
        password: 'food123',
        description: 'Delicious Bites Restaurant Owner - Can manage their shop'
      },
      customer: {
        email: 'customer@gmail.com',
        password: 'customer123',
        description: 'Regular Customer - Can browse and compare shops'
      }
    };
  }
}
