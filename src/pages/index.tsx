import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { OfferCard } from '../components/OfferCard';
import { DemoDataInitializer } from '../components/DemoDataInitializer';
import { DemoDataService } from '../services/demoDataService';
import { useAuth } from '../hooks/useAuth';
import type { Offer, Shop, ShopCategory } from '../types/shop';
import type { Floor } from '../types/shop';
import { ShopService } from '../services/shopService';
import { OfferService } from '../services/offerService';
import { CategoryService } from '../services/categoryService';
import { logger } from '../utils/logger';

export const IndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [viewingOffer, setViewingOffer] = useState<Offer | null>(null);
  const [viewingShop, setViewingShop] = useState<Shop | null>(null);
  const [showDemoInitializer, setShowDemoInitializer] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fetchedOffers, fetchedShops, fetchedCategories, fetchedFloors] = await Promise.all([
        OfferService.getActiveOffers(6), // Get 6 featured offers
        ShopService.getAllShops(12), // Get 12 shops
        CategoryService.getAllCategories(),
        CategoryService.getAllFloors(),
      ]);

      setOffers(fetchedOffers);
      setShops(fetchedShops);
      setCategories(fetchedCategories);
      setFloors(fetchedFloors);

      // Check if we should show demo initializer
      const hasCompleteData = await DemoDataService.hasCompleteDemoData();
      setShowDemoInitializer(!hasCompleteData);
    } catch (error) {
      logger.error('Failed to load homepage data:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(shop => {
    const categoryMatch = selectedCategory === 'all' || shop.category === selectedCategory;
    const floorMatch = selectedFloor === 'all' || shop.floor === selectedFloor;
    return categoryMatch && floorMatch;
  });

  const handleViewDetails = (offer: Offer) => {
    logger.info('View offer details:', offer.id);
    setViewingOffer(offer);
  };

  const handleShopView = (shop: Shop) => {
    logger.info('View shop details:', shop.id);
    setViewingShop(shop);
  };

  const scrollToShops = () => {
    const shopsSection = document.getElementById('shops-section');
    if (shopsSection) {
      shopsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <Layout title="Super Mall - Best Deals">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="spinner mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading amazing deals...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Super Mall - Best Deals">
      <div className="space-y-8 lg:space-y-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-strong p-6 sm:p-8 md:p-12 text-white relative">
            <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                    Welcome to <br />
                    <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      Super Mall
                    </span>
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-blue-100">
                    Discover amazing shops, compare prices, and find the best deals all in one place!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={scrollToShops}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                      🛍️ Browse Shops
                    </button>
                    <button
                      onClick={() => navigate('/compare')}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-800/50 backdrop-blur text-white font-semibold rounded-xl hover:bg-blue-700/50 transform hover:scale-105 transition-all duration-200 border border-blue-400/30"
                    >
                      ⚖️ Compare Prices
                    </button>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="bg-white/20 backdrop-blur rounded-2xl p-4 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                        <div className="text-3xl mb-2">🏪</div>
                        <p className="text-sm font-medium">Premium Shops</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-2xl p-4 transform -rotate-2 hover:-rotate-6 transition-transform duration-300">
                        <div className="text-3xl mb-2">💰</div>
                        <p className="text-sm font-medium">Best Deals</p>
                      </div>
                    </div>
                    <div className="space-y-4 mt-8">
                      <div className="bg-white/20 backdrop-blur rounded-2xl p-4 transform -rotate-3 hover:-rotate-6 transition-transform duration-300">
                        <div className="text-3xl mb-2">⚡</div>
                        <p className="text-sm font-medium">Fast Service</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-2xl p-4 transform rotate-2 hover:rotate-6 transition-transform duration-300">
                        <div className="text-3xl mb-2">🎯</div>
                        <p className="text-sm font-medium">Smart Compare</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-yellow-300/20 to-pink-300/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-green-300/20 to-blue-300/20 rounded-full blur-3xl"></div>
          </div>
        </section>

        {/* Demo Data Section - Show if demo data is incomplete */}
        {showDemoInitializer && (
          <section>
            <DemoDataInitializer onDataCreated={loadData} />
          </section>
        )}

        {/* Featured Offers */}
        <section className="mb-12 lg:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                🎯 Featured Offers
              </h2>
              <p className="text-gray-600">Don't miss out on these amazing deals!</p>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 mt-2 sm:mt-0">
              <span>🔥</span>
              <span>{offers.length} active offers</span>
            </div>
          </div>
          
          {offers.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl sm:text-4xl">🎯</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No offers available yet</h3>
              <p className="text-gray-600 mb-6">Check back later for amazing deals!</p>
              {/* Show appropriate buttons based on user type */}
              {user && userProfile?.role === 'admin' && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Create Offers in Dashboard
                </button>
              )}
              {user && (userProfile?.businessName && userProfile?.businessType) && userProfile?.role !== 'admin' && (
                <button
                  onClick={() => navigate('/my-shop')}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Manage Your Shop
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {offers.map((offer) => (
                <div key={offer.id} className="group">
                  <OfferCard
                    offer={offer}
                    onViewDetails={handleViewDetails}
                    className="transform group-hover:scale-105 transition-all duration-300 shadow-soft hover:shadow-medium"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Categories Section */}
        <section id="shops-section">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Shop by Category</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                  selectedCategory === category.name
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          {/* Floor Filter */}
          {floors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Filter by Floor</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedFloor('all')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                    selectedFloor === 'all'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Floors
                </button>
                {floors.map((floor) => (
                  <button
                    key={floor.id}
                    onClick={() => setSelectedFloor(floor.name)}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                      selectedFloor === floor.name
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    🏢 {floor.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Shops Grid */}
          {filteredShops.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 text-4xl mb-4">🏪</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No shops found</h3>
              <p className="text-gray-600">
                {selectedCategory === 'all' && selectedFloor === 'all'
                  ? 'No shops available at the moment.'
                  : selectedCategory !== 'all' && selectedFloor !== 'all'
                  ? `No shops found in ${selectedCategory} category on ${selectedFloor} floor.`
                  : selectedCategory !== 'all'
                  ? `No shops found in ${selectedCategory} category.`
                  : `No shops found on ${selectedFloor} floor.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredShops.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => handleShopView(shop)}
                  className="bg-white p-4 sm:p-6 rounded-xl shadow-soft hover:shadow-medium transition-all duration-200 cursor-pointer group hover:scale-105"
                >
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl mb-2">
                      {categories.find(c => c.name === shop.category)?.icon || '🏪'}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{shop.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">{shop.category}</p>
                    {shop.floor && (
                      <p className="text-xs text-gray-500 mb-2">Floor: {shop.floor}</p>
                    )}
                    <p className="text-xs text-gray-500">{shop.address}</p>
                    {shop.phone && (
                      <p className="text-xs text-gray-500 mt-1">{shop.phone}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Stats Section */}
        <section className="bg-white rounded-xl shadow-soft p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Super Mall?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">100+</div>
              <p className="text-gray-600 text-sm sm:text-base">Partner Shops</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">500+</div>
              <p className="text-gray-600 text-sm sm:text-base">Active Offers</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">10K+</div>
              <p className="text-gray-600 text-sm sm:text-base">Happy Customers</p>
            </div>
          </div>
        </section>
      </div>

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
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingOffer(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
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
                    href={viewingShop.website.startsWith('http') ? viewingShop.website : `https://${viewingShop.website}`}
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
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{viewingShop.description}</p>
                </div>
              )}

              {viewingShop.floor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                  <p className="text-gray-900">{viewingShop.floor}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= (viewingShop.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">
                    {viewingShop.rating ? `${viewingShop.rating}/5` : 'Not rated'}
                  </span>
                </div>
              </div>

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

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingShop(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
