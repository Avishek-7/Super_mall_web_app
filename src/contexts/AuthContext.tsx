import React, { useEffect, useState, useMemo } from 'react';
import { 
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type AuthError
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserService } from '../services/userService';
import type { UserProfile } from '../types/shop';
import { logger } from '../utils/logger';
import { AuthContext, type AuthContextType } from './AuthContextDef';

// Re-export for easier imports
export { AuthContext } from './AuthContextDef';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const userService = useMemo(() => new UserService(), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Load user profile when user is authenticated
        try {
          let profile = await UserService.getUserProfile(user.uid);
          
          // If profile doesn't exist, create a basic one
          if (!profile) {
            logger.info('Creating missing user profile for:', user.uid);
            const basicProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              // Don't set businessType for existing users - they should be customers
              role: 'user', // Default role for new users
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            await UserService.createUserProfile(basicProfile);
            profile = basicProfile;
          }
          
          setUserProfile(profile);
        } catch (error) {
          logger.error('Failed to load user profile:', error as Error);
          // Create a basic profile if all else fails
          const fallbackProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            // Don't set businessType for fallback - they should be customers
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setUserProfile(fallbackProfile);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [userService]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      const authError = error as AuthError;
      logger.error('Login failed:', authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, profileData: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || email,
        displayName: profileData.displayName || '',
        businessType: profileData.businessType || 'other',
        role: profileData.role || 'user', // Default to user role
        createdAt: new Date(),
        updatedAt: new Date(),
        ...profileData
      };
      
      await UserService.createUserProfile(userProfile);
      setUserProfile(userProfile);
    } catch (error) {
      const authError = error as AuthError;
      logger.error('Registration failed:', authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      logger.error('Logout failed:', error as Error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
