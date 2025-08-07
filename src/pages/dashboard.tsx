import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Layout } from '../components/Layout';
import { ShopForm } from '../components/ShopForm';
import { OfferForm } from '../components/OfferForm';
import { OfferCard } from '../components/OfferCard';
import type { ShopFormData, OfferFormData, ShopCategory, Offer, Shop } from '../types/shop';
import { ShopService } from '../services/shopService';
import { OfferService } from '../services/offerService';
import { UserService } from '../services/userService';
import { CategoryService } from '../services/categoryService';
import { DemoDataService } from '../services/demoDataService';
import { logger } from '../utils/logger';

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'shops' | 'offers'>('overview');
  const [showShopForm, setShowShopForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [viewingShop, setViewingShop] = useState<Shop | null>(null);
  const [viewingOffer, setViewingOffer] = useState<Offer | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState({ totalShops: 0, totalOffers: 0, activeOffers: 0 });
  const [userShops, setUserShops] = useState<Shop[]>([]);
  const [userOffers, setUserOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [needsPersonalDemoData, setNeedsPersonalDemoData] = useState(false);

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
      // Load data separately to handle index building gracefully
      const results = await Promise.allSettled([
        UserService.getUserStats(userId),
        ShopService.getUserShops(userId),
        OfferService.getUserOffers(userId),
      ]);

      // Handle stats
      if (results[0].status === 'fulfilled') {
        setUserStats(results[0].value);
      } else {
        logger.warn('Failed to load user stats (possibly due to index building):', results[0].reason);
        // Set default stats
        setUserStats({ totalShops: 0, totalOffers: 0, activeOffers: 0 });
      }

      // Handle shops
      if (results[1].status === 'fulfilled') {
        setUserShops(results[1].value);
      } else {
        logger.warn('Failed to load user shops (possibly due to index building):', results[1].reason);
        setUserShops([]);
      }

      // Handle offers
      if (results[2].status === 'fulfilled') {
        setUserOffers(results[2].value);
      } else {
        logger.warn('Failed to load user offers (possibly due to index building):', results[2].reason);
        setUserOffers([]);
      }

      // Check if user needs personal demo data
      const hasShops = results[1].status === 'fulfilled' && results[1].value.length > 0;
      const hasOffers = results[2].status === 'fulfilled' && results[2].value.length > 0;
      setNeedsPersonalDemoData(!hasShops && !hasOffers);
    } catch (error) {
      logger.error('Failed to load user data:', error as Error);
    }
  };

  const handleRefresh = async () => {
    if (!currentUser || refreshing) return;
    
    setRefreshing(true);
    try {
      await loadUserData(currentUser.uid);
      logger.info('Dashboard data refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh dashboard data:', error as Error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreatePersonalDemoData = async () => {
    if (!currentUser) return;
    
    try {
      logger.info('Creating personal demo data for user:', currentUser.uid);
      await DemoDataService.createDemoDataForUser(currentUser.uid);
      await loadUserData(currentUser.uid);
      logger.info('Personal demo data created successfully');
    } catch (error) {
      logger.error('Failed to create personal demo data:', error as Error);
    }
  };

  const loadCategories = async () => {
    try {
      logger.info('Loading categories from Firebase...');
      const fetchedCategories = await CategoryService.getAllCategories();
      logger.info('Fetched categories:', fetchedCategories);
      if (fetchedCategories && fetchedCategories.length > 0) {
        setCategories(fetchedCategories);
      } else {
        // Fallback to service categories if no categories found
        setCategories([
          { id: '1', name: 'Repair & Maintenance Services', icon: '🛠️', description: 'Repair and maintenance services' },
          { id: '2', name: 'Beauty & Salon', icon: '💇', description: 'Beauty and salon services' },
          { id: '3', name: 'Consulting', icon: '💼', description: 'Business consulting services' },
          { id: '4', name: 'Cleaning Services', icon: '🧹', description: 'Cleaning and maintenance' },
          { id: '5', name: 'Health & Wellness', icon: '🏥', description: 'Health and wellness services' },
          { id: '6', name: 'Education & Coaching', icon: '🎓', description: 'Education and coaching' },
          { id: '7', name: 'Legal Services', icon: '⚖️', description: 'Legal and consulting services' },
          { id: '8', name: 'Event Planning', icon: '🎉', description: 'Event planning and management' },
        ]);
      }
    } catch (error) {
      logger.error('Failed to load categories:', error as Error);
      // Fallback to service categories if Firebase fails
      setCategories([
        { id: '1', name: 'Repair & Maintenance Services', icon: '�️', description: 'Repair and maintenance services' },
        { id: '2', name: 'Beauty & Salon', icon: '💇', description: 'Beauty and salon services' },
        { id: '3', name: 'Consulting', icon: '�', description: 'Business consulting services' },
        { id: '4', name: 'Cleaning Services', icon: '🧹', description: 'Cleaning and maintenance' },
        { id: '5', name: 'Health & Wellness', icon: '🏥', description: 'Health and wellness services' },
        { id: '6', name: 'Education & Coaching', icon: '�', description: 'Education and coaching' },
        { id: '7', name: 'Legal Services', icon: '⚖️', description: 'Legal and consulting services' },
        { id: '8', name: 'Event Planning', icon: '🎉', description: 'Event planning and management' },
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

  const handleOfferSubmit = async (data: OfferFormData) => {
    if (!currentUser) return;

    // For now, create the offer with the first available shop
    // In a real app, you'd let the user select which shop
    const shopId = userShops.length > 0 ? userShops[0].id : '';
    
    if (!shopId) {
      logger.error('No shops available to create offer');
      alert('Please create at least one shop before adding offers. You can create a shop in the "Shops" tab.');
      setShowOfferForm(false);
      setActiveTab('shops');
      return;
    }

    try {
      logger.info('Creating new offer', data);
      await OfferService.createOffer(data, shopId, currentUser.uid);
      
      setShowOfferForm(false);
      // Reload user data
      await loadUserData(currentUser.uid);
    } catch (error) {
      logger.error('Failed to create offer', error as Error);
    }
  };

  const handleOfferDetails = (offer: Offer) => {
    logger.info('Viewing offer details', { offerId: offer.id });
    setViewingOffer(offer);
  };

  const handleEditShop = (shop: Shop) => {
    logger.info('Editing shop', { shopId: shop.id });
    setEditingShop(shop);
  };

  const handleViewShop = (shop: Shop) => {
    logger.info('Viewing shop details', { shopId: shop.id });
    setViewingShop(shop);
  };

  const handleShopUpdate = async (data: ShopFormData) => {
    try {
      console.log('Updating shop:', data);
      if (editingShop?.id && currentUser) {
        await ShopService.updateShop(editingShop.id, data, currentUser.uid);
        setEditingShop(null);
        await loadUserData(currentUser.uid); // Refresh data
      }
    } catch (error) {
      console.error('Error updating shop:', error);
    }
  };

  const handleDeleteShop = async (shopId: string) => {
    if (window.confirm('Are you sure you want to delete this shop? This action cannot be undone.')) {
      try {
        console.log('Deleting shop:', shopId);
        if (currentUser) {
          await ShopService.deleteShop(shopId, currentUser.uid);
          await loadUserData(currentUser.uid); // Refresh data
        }
      } catch (error) {
        console.error('Error deleting shop:', error);
        alert('Failed to delete shop. Please try again.');
      }
    }
  };

  const handleEditOffer = (offer: Offer) => {
    logger.info('Editing offer', { offerId: offer.id });
    setViewingOffer(null); // Close the view modal
    setEditingOffer(offer);
  };

  const handleOfferUpdate = async (data: OfferFormData) => {
    try {
      console.log('Updating offer:', data);
      if (editingOffer?.id && currentUser) {
        await OfferService.updateOffer(editingOffer.id, data, currentUser.uid);
        setEditingOffer(null);
        await loadUserData(currentUser.uid); // Refresh data
      }
    } catch (error) {
      console.error('Error updating offer:', error);
      alert('Failed to update offer. Please try again.');
    }
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

            {/* Status Indicator for Index Building */}
            {userStats.totalShops === 0 && userStats.totalOffers === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-500 text-lg">⚡</span>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Database is optimizing for better performance
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      If you've recently created shops or offers, try clicking the refresh button above. This process typically takes 5-10 minutes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Demo Data Section */}
            {needsPersonalDemoData && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <span className="mr-2">🚀</span>
                      Get Started with Demo Data
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Create sample shops and offers to explore all dashboard features
                    </p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-xl">
                    <span className="text-white text-2xl">🏪</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="bg-green-100 p-2 rounded-lg mb-2 inline-block">
                      <span className="text-green-600">🏪</span>
                    </div>
                    <p className="text-xs font-medium text-gray-700">3 Sample Shops</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 p-2 rounded-lg mb-2 inline-block">
                      <span className="text-blue-600">🎯</span>
                    </div>
                    <p className="text-xs font-medium text-gray-700">3 Active Offers</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 p-2 rounded-lg mb-2 inline-block">
                      <span className="text-purple-600">📦</span>
                    </div>
                    <p className="text-xs font-medium text-gray-700">3 Products</p>
                  </div>
                </div>

                <button
                  onClick={handleCreatePersonalDemoData}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  Create My Demo Data
                </button>
              </div>
            )}

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
                      <button 
                        onClick={() => handleEditShop(shop)}
                        className="text-xs sm:text-sm bg-blue-100 text-blue-700 px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-blue-200 transition-colors font-medium">
                        Edit
                      </button>
                      <button 
                        onClick={() => handleViewShop(shop)}
                        className="text-xs sm:text-sm bg-green-100 text-green-700 px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-green-200 transition-colors font-medium">
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
              <button 
                onClick={() => setShowOfferForm(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base">
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
                  <button 
                    onClick={() => setShowOfferForm(true)}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base">
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
        {/* Show Shop Form */}
        {showShopForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <ShopForm
                onSubmit={handleShopSubmit}
                categories={categories}
                isLoading={false}
              />
              <div className="p-4 border-t">
                <button
                  onClick={() => setShowShopForm(false)}
                  className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show Offer Form */}
        {showOfferForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <OfferForm
                onSubmit={handleOfferSubmit}
                categories={categories}
                isLoading={false}
                onCancel={() => setShowOfferForm(false)}
              />
            </div>
          </div>
        )}

        {/* Edit Shop Form */}
        {editingShop && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <ShopForm
                onSubmit={handleShopUpdate}
                initialData={editingShop}
                categories={categories}
                isLoading={false}
              />
              <div className="p-4 border-t">
                <button
                  onClick={() => setEditingShop(null)}
                  className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Shop Modal */}
        {viewingShop && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Shop Details</h2>
                <button
                  onClick={() => setViewingShop(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{viewingShop.name}</h3>
                  <div className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full inline-block">
                    {viewingShop.category}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900">{viewingShop.address}</p>
                </div>

                {viewingShop.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{viewingShop.phone}</p>
                  </div>
                )}

                {viewingShop.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <a 
                      href={viewingShop.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {viewingShop.website}
                    </a>
                  </div>
                )}

                {viewingShop.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-900">{viewingShop.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p className="text-gray-600 text-sm">{viewingShop.createdAt.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Updated</label>
                    <p className="text-gray-600 text-sm">{viewingShop.updatedAt.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => {
                    setViewingShop(null);
                    if (viewingShop) {
                      handleDeleteShop(viewingShop.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Shop
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setViewingShop(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setViewingShop(null);
                      handleEditShop(viewingShop);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Shop
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Offer Modal */}
        {viewingOffer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Offer Details</h2>
                <button
                  onClick={() => setViewingOffer(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Offer Header */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{viewingOffer.title}</h3>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full inline-block">
                      {viewingOffer.category}
                    </div>
                    <div className={`text-sm px-3 py-1 rounded-full inline-block ${
                      viewingOffer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {viewingOffer.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>

                {/* Offer Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{viewingOffer.description}</p>
                </div>

                {/* Pricing Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {viewingOffer.originalPrice && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                      <p className="text-lg font-semibold text-gray-500 line-through">₹{viewingOffer.originalPrice}</p>
                    </div>
                  )}
                  {viewingOffer.discountedPrice && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price</label>
                      <p className="text-xl font-bold text-green-600">₹{viewingOffer.discountedPrice}</p>
                    </div>
                  )}
                </div>

                {/* Discount Information */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    {viewingOffer.discountPercentage && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
                        <p className="text-lg font-bold text-green-600">{viewingOffer.discountPercentage}% OFF</p>
                      </div>
                    )}
                    {viewingOffer.originalPrice && viewingOffer.discountedPrice && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">You Save</label>
                        <p className="text-lg font-bold text-green-600">₹{viewingOffer.originalPrice - viewingOffer.discountedPrice}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Validity Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Validity Period</label>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-600">From: </span>
                        <span className="font-medium">{viewingOffer.validFrom.toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">To: </span>
                        <span className="font-medium">{viewingOffer.validTo.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                {viewingOffer.termsAndConditions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{viewingOffer.termsAndConditions}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p className="text-gray-600 text-sm">{viewingOffer.createdAt.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Updated</label>
                    <p className="text-gray-600 text-sm">{viewingOffer.updatedAt.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setViewingOffer(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleEditOffer(viewingOffer)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Offer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Offer Form */}
        {editingOffer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <OfferForm
                onSubmit={handleOfferUpdate}
                initialData={{
                  title: editingOffer.title,
                  description: editingOffer.description,
                  discountPercentage: editingOffer.discountPercentage,
                  originalPrice: editingOffer.originalPrice,
                  discountedPrice: editingOffer.discountedPrice,
                  validFrom: editingOffer.validFrom,
                  validTo: editingOffer.validTo,
                  category: editingOffer.category,
                  termsAndConditions: editingOffer.termsAndConditions,
                }}
                categories={categories}
                isLoading={false}
                onCancel={() => setEditingOffer(null)}
              />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8 rounded-2xl shadow-strong text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back! 👋</h1>
              <p className="text-blue-100 text-sm sm:text-base">Manage your shops and offers from your personalized dashboard.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 px-3 sm:px-4 py-2 sm:py-3 rounded-xl flex items-center space-x-2 text-white hover:text-white disabled:opacity-50"
                title="Refresh data"
              >
                <span className={`text-sm sm:text-base ${refreshing ? 'animate-spin' : ''}`}>🔄</span>
                <span className="hidden sm:inline text-sm font-medium">
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>
              <div className="hidden sm:block">
                <div className="bg-white/20 backdrop-blur-sm p-3 sm:p-4 rounded-xl">
                  <span className="text-3xl sm:text-4xl">🏪</span>
                </div>
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
