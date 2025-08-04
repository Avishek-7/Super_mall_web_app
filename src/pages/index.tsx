import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { OfferCard } from '../components/OfferCard';
import type { Offer, Shop, ShopCategory } from '../types/shop';
import { ShopService } from '../services/shopService';
import { OfferService } from '../services/offerService';
import { CategoryService } from '../services/categoryService';
import { logger } from '../utils/logger';

export const IndexPage: React.FC = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fetchedOffers, fetchedShops, fetchedCategories] = await Promise.all([
        OfferService.getActiveOffers(6), // Get 6 featured offers
        ShopService.getAllShops(12), // Get 12 shops
        CategoryService.getAllCategories(),
      ]);

      setOffers(fetchedOffers);
      setShops(fetchedShops);
      setCategories(fetchedCategories);
    } catch (error) {
      logger.error('Failed to load homepage data:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = selectedCategory === 'all' 
    ? shops 
    : shops.filter(shop => shop.category === selectedCategory);

  const handleViewDetails = (offer: Offer) => {
    logger.info('View offer details:', offer.id);
    // Navigate to offer details page
  };

  const handleShopView = (shop: Shop) => {
    logger.info('View shop details:', shop.id);
    // Navigate to shop details page
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
                      onClick={() => setSelectedCategory('all')}
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
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Create Your First Offer
              </button>
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
        <section>
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
          
          {/* Shops Grid */}
          {filteredShops.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 text-4xl mb-4">🏪</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No shops found</h3>
              <p className="text-gray-600">
                {selectedCategory === 'all' 
                  ? 'No shops available at the moment.'
                  : `No shops found in ${selectedCategory} category.`
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
    </Layout>
  );
};
