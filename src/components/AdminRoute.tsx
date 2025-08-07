import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-400 text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
        <p className="text-red-600">Please log in to access this area.</p>
        <a
          href="/login"
          className="inline-block mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Go to Login
        </a>
      </div>
    );
  }

  if (userProfile.role !== 'admin') {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
        <div className="text-orange-400 text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-orange-800 mb-2">Admin Access Required</h2>
        <p className="text-orange-600">
          You need administrator privileges to access this area.
        </p>
        <a
          href="/dashboard"
          className="inline-block mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Go to Dashboard
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
