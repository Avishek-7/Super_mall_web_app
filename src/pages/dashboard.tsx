import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Layout } from '../components/Layout';
import { ShopForm } from '../components/ShopForm';
import { OfferCard } from '../components/OfferCard';
import type { ShopFormData, ShopCategory, Offer, Shop } from '../types/shop';
import { ShopService } from '../services/shopService';
import { OfferService } from '../services/offerService';
import { UserService } from '../services/userService';
import { CategoryService } from '../services/categoryService';
import { logger } from '../utils/logger';

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'shops' | 'offers'>('overview');
  const [showShopForm, setShowShopForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState({ totalShops: 0, totalOffers: 0, activeOffers: 0 });
  const [userShops, setUserShops] = useState<Shop[]>([]);
  const [userOffers, setUserOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await Promise.all([
          loadUserData(user.uid),
          loadCategories(),
        ]);
      } else {
        // Redirect to login if not authenticated
        window.location.href = '/login';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const [stats, shops, offers] = await Promise.all([
        UserService.getUserStats(userId),
        ShopService.getUserShops(userId),
        OfferService.getUserOffers(userId),
      ]);

      setUserStats(stats);
      setUserShops(shops);
      setUserOffers(offers);
    } catch (error) {
      logger.error('Failed to load user data:', error as Error);
    }
  };

  const loadCategories = async () => {
    try {
      const fetchedCategories = await CategoryService.getAllCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      logger.error('Failed to load categories:', error as Error);
      // Fallback to mock categories if Firebase fails
      setCategories([
        { id: '1', name: 'Electronics', icon: '📱', description: 'Electronic devices and gadgets' },
        { id: '2', name: 'Fashion', icon: '👕', description: 'Clothing and accessories' },
        { id: '3', name: 'Food', icon: '🍕', description: 'Restaurants and food delivery' },
        { id: '4', name: 'Books', icon: '📚', description: 'Books and stationery' },
      ]);
    }
  };

  const handleShopSubmit = async (data: ShopFormData) => {
    if (!currentUser) return;

    try {
      logger.info('Creating new shop', data);
      await ShopService.createShop(data, currentUser.uid);
      
      setShowShopForm(false);
      // Reload user data
      await loadUserData(currentUser.uid);
    } catch (error) {
      logger.error('Failed to create shop', error as Error);
    }
  };

  const handleOfferDetails = (offer: Offer) => {
    logger.info('Viewing offer details', { offerId: offer.id });
    // Navigate to offer details
  };

  if (loading) {
    return (
      <Layout title="Dashboard - Super Mall">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="relative">
              <div className="spinner mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🏪</span>
              </div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
            <p className="mt-2 text-sm text-gray-500">Preparing your shops and offers</p>
          </div>
        </div>
      </Layout>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 sm:space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-blue-900">Your Shops</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">{userStats.totalShops}</p>
                    <p className="text-xs sm:text-sm text-blue-600 mt-1">Active shops</p>
                  </div>
                  <div className="bg-blue-500 p-2 sm:p-3 rounded-xl">
                    <span className="text-white text-xl sm:text-2xl">🏪</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-2xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-green-900">Active Offers</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">{userStats.activeOffers}</p>
                    <p className="text-xs sm:text-sm text-green-600 mt-1">Running campaigns</p>
                  </div>
                  <div className="bg-green-500 p-2 sm:p-3 rounded-xl">
                    <span className="text-white text-xl sm:text-2xl">🎯</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-2xl border border-purple-200 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-purple-900">Total Offers</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-2">{userStats.totalOffers}</p>
                    <p className="text-xs sm:text-sm text-purple-600 mt-1">All time</p>
                  </div>
                  <div className="bg-purple-500 p-2 sm:p-3 rounded-xl">
                    <span className="text-white text-xl sm:text-2xl">📊</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-soft border border-gray-100">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <span className="mr-2">📋</span>
                Recent Activity
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 bg-green-50 rounded-xl">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">New offer "Summer Sale" was created</p>
                    <span className="text-xs text-green-600">2 hours ago</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 bg-blue-50 rounded-xl">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">Shop "Tech Store" was updated</p>
                    <span className="text-xs text-blue-600">1 day ago</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 bg-yellow-50 rounded-xl">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">Offer "Winter Collection" expires soon</p>
                    <span className="text-xs text-yellow-600">2 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'shops':
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Your Shops
                </h2>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your business locations</p>
              </div>
              <button
                onClick={() => setShowShopForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base"
              >
                + Add New Shop
              </button>
            </div>

            {showShopForm && (
              <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-8 rounded-2xl shadow-soft border border-gray-100">
                <ShopForm
                  onSubmit={handleShopSubmit}
                  categories={categories}
                />
              </div>
            )}

            {/* Shops List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {userShops.length === 0 ? (
                <div className="col-span-full text-center py-12 sm:py-16">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl sm:text-4xl">🏪</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No shops yet</h3>
                  <p className="text-gray-600 mb-6 text-sm sm:text-base">Create your first shop to start selling</p>
                  <button
                    onClick={() => setShowShopForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base"
                  >
                    Add Your First Shop
                  </button>
                </div>
              ) : (
                userShops.map((shop) => (
                  <div key={shop.id} className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-soft border border-gray-100 hover:shadow-medium transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{shop.name}</h3>
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <span className="text-blue-600">🏪</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 flex items-center">
                      <span className="mr-2">📍</span>
                      {shop.category} • {shop.phone}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">{shop.address}</p>
                    <div className="flex space-x-2">
                      <button className="text-xs sm:text-sm bg-blue-100 text-blue-700 px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-blue-200 transition-colors font-medium">
                        Edit
                      </button>
                      <button className="text-xs sm:text-sm bg-green-100 text-green-700 px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-green-200 transition-colors font-medium">
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'offers':
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Your Offers
                </h2>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Create and manage promotional campaigns</p>
              </div>
              <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base">
                + Create New Offer
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {userOffers.length === 0 ? (
                <div className="col-span-full text-center py-12 sm:py-16">
                  <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl sm:text-4xl">🎯</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No offers yet</h3>
                  <p className="text-gray-600 mb-6 text-sm sm:text-base">Create your first offer to attract customers</p>
                  <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base">
                    Create Your First Offer
                  </button>
                </div>
              ) : (
                userOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onViewDetails={handleOfferDetails}
                    className="transform hover:scale-105 transition-all duration-300"
                  />
                ))
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout title="Dashboard - Super Mall">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8 rounded-2xl shadow-strong text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back! 👋</h1>
              <p className="text-blue-100 text-sm sm:text-base">Manage your shops and offers from your personalized dashboard.</p>
            </div>
            <div className="hidden sm:block">
              <div className="bg-white/20 backdrop-blur-sm p-3 sm:p-4 rounded-xl">
                <span className="text-3xl sm:text-4xl">🏪</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-8 overflow-x-auto">
              {(['overview', 'shops', 'offers'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 sm:py-6 px-1 border-b-2 font-semibold text-xs sm:text-sm capitalize transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'overview' && '📊 '}
                  {tab === 'shops' && '🏪 '}
                  {tab === 'offers' && '🎯 '}
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-8">{renderTabContent()}</div>
        </div>
      </div>
    </Layout>
  );
};
