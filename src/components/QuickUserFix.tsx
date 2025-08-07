import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Temporary Quick Fix Component
 * Import this component anywhere and click the button to fix the user profile
 */
export const QuickUserFix: React.FC = () => {
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleQuickFix = async () => {
    setFixing(true);
    setResult('');
    
    try {
      const userId = 'eyj5laNjCKZD0g1Qk92mvsUYVW62';
      const userDocRef = doc(db, 'users', userId);
      
      const updates = {
        businessType: 'service', // Fix the incorrect "service provider" value
        businessName: 'Avishek Services', // Add the missing business name
        role: 'admin' as const, // Make this user an admin since they have business info
        updatedAt: new Date()
      };
      
      await updateDoc(userDocRef, updates);
      
      setResult('✅ Profile fixed successfully! Please refresh the page or log out and log back in to access the dashboard.');
      
    } catch (error) {
      console.error('Fix failed:', error);
      setResult('❌ Fix failed. Please try again or contact support.');
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-red-200 z-50">
      <h3 className="text-lg font-semibold text-red-600 mb-2">🔧 Quick Profile Fix</h3>
      <p className="text-sm text-gray-600 mb-3">
        Click to fix your profile and enable dashboard access
      </p>
      
      <button
        onClick={handleQuickFix}
        disabled={fixing}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
      >
        {fixing ? 'Fixing...' : 'Fix My Profile'}
      </button>
      
      {result && (
        <div className="mt-3 text-sm">
          {result}
        </div>
      )}
    </div>
  );
};
