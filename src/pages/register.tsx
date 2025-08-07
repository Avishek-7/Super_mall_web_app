import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Layout } from '../components/Layout';
import { logger } from '../utils/logger';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  businessType?: 'retail' | 'food' | 'service' | 'other';
  businessName?: string;
  businessAddress?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export const RegisterPage: React.FC = () => {
  const [showBusinessFields, setShowBusinessFields] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    businessType: '',
    businessName: '',
    businessAddress: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const businessTypes = [
    { label: 'Retail Shop Owner', value: 'retail' },
    { label: 'Restaurant Owner', value: 'food' }, 
    { label: 'Service Provider', value: 'service' },
    { label: 'General Store Owner', value: 'retail' },
    { label: 'Specialty Shop Owner', value: 'retail' },
    { label: 'Other Business Type', value: 'other' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Business-specific validation (if business fields are provided)
    const isBusinessRegistration = formData.businessName.trim() || formData.businessType || formData.businessAddress.trim();
    
    if (isBusinessRegistration) {
      if (!formData.phoneNumber.trim()) {
        setError('Phone number is required for shop owner accounts');
        return false;
      }
      if (!formData.businessName.trim()) {
        setError('Shop name is required');
        return false;
      }
      if (!formData.businessType) {
        setError('Shop type is required');
        return false;
      }
      if (!formData.businessAddress.trim()) {
        setError('Shop address is required');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      logger.info('Attempting to register user:', formData.email);
      
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;
      logger.info('User created successfully:', user.uid);

      // Update user profile
      await updateProfile(user, {
        displayName: formData.fullName
      });

      // Create user profile in Firestore
      const isBusinessRegistration = formData.businessName.trim() || formData.businessType || formData.businessAddress.trim();
      
      const userProfile: UserProfile = {
        uid: user.uid,
        email: formData.email,
        displayName: formData.fullName,
        phoneNumber: formData.phoneNumber || undefined,
        businessType: isBusinessRegistration ? (formData.businessType as 'retail' | 'food' | 'service' | 'other') || 'other' : undefined,
        businessName: isBusinessRegistration ? formData.businessName : undefined,
        businessAddress: isBusinessRegistration ? formData.businessAddress : undefined,
        role: 'user', // All registrations get user role - only mall admin should have admin role
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      logger.info('User profile created in Firestore:', user.uid);

      // Redirect to appropriate page based on registration type
      if (isBusinessRegistration) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/';
      }
      
    } catch (error: unknown) {
      logger.error('Registration failed:', error as Error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string };
        switch (firebaseError.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Please use a different email or try logging in.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please choose a stronger password.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          default:
            errorMessage = 'Registration failed. Please try again.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Register - Super Mall">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo/Brand Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white text-xl sm:text-2xl font-bold">SM</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Join Super Mall
            </h2>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">
              Create your account to browse shops, compare prices, and discover amazing deals. Shop owners can register their business details below.
            </p>
          </div>
          
          {/* Register Form Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-strong border border-white/20 p-6 sm:p-8">
            {/* Registration Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
                    <span>❌</span>
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 placeholder-gray-400 text-sm sm:text-base"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 placeholder-gray-400 text-sm sm:text-base"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (Required for shop owners)
                    </label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 placeholder-gray-400 text-sm sm:text-base"
                      placeholder="Enter your phone number"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Business Information Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">🏪 Shop Owner Information (Optional)</h3>
                      <p className="text-sm text-gray-600">Fill out this section if you want to register your shop and create offers</p>
                    </div>

                    {/* Shop Name */}
                    <div className="mb-4">
                      <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                        Shop Name
                      </label>
                      <input
                        id="businessName"
                        name="businessName"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 placeholder-gray-400 text-sm sm:text-base"
                        placeholder="Enter your shop name"
                        value={formData.businessName}
                        onChange={(e) => {
                          handleInputChange(e);
                          setShowBusinessFields(e.target.value.trim().length > 0);
                        }}
                      />
                    </div>

                    {/* Show additional business fields when shop name is entered */}
                    {(formData.businessName.trim() || showBusinessFields) && (
                      <>
                        {/* Shop Type */}
                        <div className="mb-4">
                          <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                            Shop Type
                          </label>
                          <select
                            id="businessType"
                            name="businessType"
                            className="w-full px-4 py-3 border border-gray-300 bg-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            value={formData.businessType}
                            onChange={handleInputChange}
                          >
                            <option value="">Select shop type</option>
                            {businessTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Shop Address */}
                        <div>
                          <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-2">
                            Shop Address
                          </label>
                          <input
                            id="businessAddress"
                            name="businessAddress"
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 placeholder-gray-400 text-sm sm:text-base"
                            placeholder="Enter your shop address"
                            value={formData.businessAddress}
                            onChange={handleInputChange}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Role Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-600 text-lg">ℹ️</span>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">About User Roles</h4>
                        <p className="text-xs text-blue-700">
                          All registrations create regular user accounts. If you fill out shop information, you'll get access to manage your shop and create offers. 
                          Only the mall administrator has special admin privileges for managing the entire mall system.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 placeholder-gray-400 text-sm sm:text-base"
                      placeholder="Enter your password (min 6 characters)"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 placeholder-gray-400 text-sm sm:text-base"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white font-medium py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <div className="text-xs text-gray-500 text-center">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500 transition-colors duration-200">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500 transition-colors duration-200">
                    Privacy Policy
                  </a>
                </div>
              </form>
            
            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm sm:text-base">
                Already have an account?{' '}
                <a
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
