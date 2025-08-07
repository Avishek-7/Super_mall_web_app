import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from './Layout';

export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout title="Access Denied - Super Mall">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-strong p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🚫</span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              This area is restricted. Business owners can access the dashboard to manage their shops, while the admin panel is reserved for mall administrators only.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🏠 Go to Home Page
              </button>
              
              <button
                onClick={() => navigate('/compare')}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                ⚖️ Compare Products
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Are you a business owner?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Register your business
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
