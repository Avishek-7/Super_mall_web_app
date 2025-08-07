import React, { useState } from 'react';
import { DemoDataService } from '../services/demoDataService';
import { DemoUsersService } from '../services/demoUsersService';

interface DemoDataInitializerProps {
  onDataCreated?: () => void;
  alwaysShow?: boolean; // For admin panel - always show regardless of existing data
}

export const DemoDataInitializer: React.FC<DemoDataInitializerProps> = ({ onDataCreated, alwaysShow = false }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [hasCompleteData, setHasCompleteData] = useState<boolean | null>(null);

  const checkDemoData = async () => {
    try {
      setLoading(true);
      const [exists, complete] = await Promise.all([
        DemoDataService.hasDemoData(),
        DemoDataService.hasCompleteDemoData()
      ]);
      setHasCompleteData(complete);
      
      if (complete) {
        setMessage('Complete demo data exists in the database');
      } else if (exists) {
        setMessage('Some data exists, but demo data is incomplete');
      } else {
        setMessage('No demo data found in the database');
      }
    } catch (error) {
      setMessage('Error checking demo data');
      console.error('Error checking demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDemoData = async () => {
    try {
      setLoading(true);
      setMessage('Creating demo data and users...');
      await Promise.all([
        DemoDataService.createDemoData(),
        DemoUsersService.createDemoUsers()
      ]);
      setMessage('Demo data and users created successfully! 🎉');
      setHasCompleteData(true);
      onDataCreated?.();
    } catch (error) {
      setMessage('Error creating demo data. Please try again.');
      console.error('Error creating demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const forceDemoData = async () => {
    try {
      setLoading(true);
      setMessage('Force creating demo data and users...');
      await Promise.all([
        DemoDataService.forceDemoData(),
        DemoUsersService.createDemoUsers()
      ]);
      setMessage('Demo data and users force created successfully! 🎉');
      setHasCompleteData(true);
      onDataCreated?.();
    } catch (error) {
      setMessage('Error force creating demo data. Please try again.');
      console.error('Error force creating demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    checkDemoData();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center mb-4">
        <div className="text-2xl mr-3">🎭</div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Demo Data Manager</h2>
          <p className="text-gray-600 text-sm">Initialize the system with sample data for demonstration</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('Error') || message.includes('error')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : message.includes('successfully')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={checkDemoData}
          disabled={loading}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking...' : 'Check Demo Data'}
        </button>

        <button
          onClick={createDemoData}
          disabled={loading || (hasCompleteData === true && !alwaysShow)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : hasCompleteData ? 'Add More Demo Data' : 'Create Demo Data'}
        </button>

        <button
          onClick={forceDemoData}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Force Create Data'}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Create Demo Data:</strong> Only creates data if database is empty</p>
        <p><strong>Force Create Data:</strong> Creates additional demo data regardless of existing data</p>
      </div>

      {(hasCompleteData === false || alwaysShow) && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">🏗️ Demo Data Includes:</h3>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• 10 Shop Categories (Fashion, Electronics, Food, etc.)</li>
            <li>• 5 Mall Floors (Ground to Fourth Floor)</li>
            <li>• 12 Demo Shops across different categories</li>
            <li>• 8 Active Offers with discounts</li>
            <li>• 20+ Products across all shops</li>
            <li>• 5 Demo User Accounts (Admin, Shop Owners, Customer)</li>
          </ul>
        </div>
      )}

      {(hasCompleteData === true || alwaysShow) && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-sm font-medium text-green-800 mb-3">🔐 Demo User Credentials:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {Object.entries(DemoUsersService.getDemoCredentials()).map(([key, creds]) => (
              <div key={key} className="bg-white p-3 rounded border border-green-200">
                <div className="font-semibold text-green-800 mb-1">
                  {key === 'admin' ? '👑 Admin' : 
                   key.startsWith('shopOwner') ? '🏪 Shop Owner' : '👤 Customer'}
                </div>
                <div className="text-green-700">
                  <div>📧 {creds.email}</div>
                  <div>🔑 {creds.password}</div>
                </div>
                <div className="text-green-600 mt-1 text-xs">{creds.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
