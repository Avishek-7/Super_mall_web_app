import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { DemoDataInitializer } from '../components/DemoDataInitializer';
import { DemoDataService } from '../services/demoDataService';
import { ShopService } from '../services/shopService';
import { CategoryService } from '../services/categoryService';
import type { Shop, ShopCategory } from '../types/shop';
import { logger } from '../utils/logger';

export const ComparePage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [selectedShops, setSelectedShops] = useState<Shop[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showDemoInitializer, setShowDemoInitializer] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shopsData, categoriesData] = await Promise.all([
        ShopService.getAllShops(),
        CategoryService.getAllCategories()
      ]);
      setShops(shopsData);
      setCategories(categoriesData);

      // Check if we should show demo initializer
      const hasCompleteData = await DemoDataService.hasCompleteDemoData();
      setShowDemoInitializer(!hasCompleteData);
    } catch (error) {
      logger.error('Failed to load comparison data:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(shop => 
    selectedCategory === 'all' || shop.category === selectedCategory
  );

  const handleShopSelect = (shop: Shop) => {
    if (selectedShops.some(s => s.id === shop.id)) {
      setSelectedShops(selectedShops.filter(s => s.id !== shop.id));
    } else if (selectedShops.length < 3) {
      setSelectedShops([...selectedShops, shop]);
    } else {
      alert('You can compare maximum 3 shops at once');
    }
  };

  const clearComparison = () => {
    setSelectedShops([]);
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.icon || '🏪';
  };

  if (loading) {
    return (
      <Layout title="Compare Shops - Super Mall">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading shops...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Compare Shops - Super Mall">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Compare Shops</h1>
          <p className="text-gray-600 text-sm sm:text-base">Select up to 3 shops to compare their details side by side</p>
        </div>

        {/* Selected Shops for Comparison */}
        {selectedShops.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Selected for Comparison ({selectedShops.length}/3)
              </h2>
              <button
                onClick={clearComparison}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {selectedShops.map((shop) => (
                <div key={shop.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-xl sm:text-2xl">{getCategoryIcon(shop.category)}</div>
                    <button
                      onClick={() => handleShopSelect(shop)}
                      className="text-red-500 hover:text-red-700 text-lg"
                      title="Remove from comparison"
                    >
                      ✕
                    </button>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{shop.name}</h3>
                  <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                    <p><span className="font-medium">Category:</span> {shop.category}</p>
                    {shop.floor && <p><span className="font-medium">Floor:</span> {shop.floor}</p>}
                    <p><span className="font-medium">Address:</span> {shop.address}</p>
                    {shop.phone && <p><span className="font-medium">Phone:</span> {shop.phone}</p>}
                    {shop.website && (
                      <p>
                        <span className="font-medium">Website:</span>{' '}
                        <a 
                          href={shop.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Visit
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedShops.length >= 2 && (
              <div className="mt-6 text-center">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Quick Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 sm:px-3">Feature</th>
                          {selectedShops.map((shop) => (
                            <th key={shop.id} className="text-left py-2 px-2 sm:px-3">{shop.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 px-2 sm:px-3 font-medium">Category</td>
                          {selectedShops.map((shop) => (
                            <td key={shop.id} className="py-2 px-2 sm:px-3">{shop.category}</td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-2 sm:px-3 font-medium">Floor</td>
                          {selectedShops.map((shop) => (
                            <td key={shop.id} className="py-2 px-2 sm:px-3">{shop.floor || 'N/A'}</td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-2 sm:px-3 font-medium">Phone</td>
                          {selectedShops.map((shop) => (
                            <td key={shop.id} className="py-2 px-2 sm:px-3">{shop.phone || 'N/A'}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-2 px-2 sm:px-3 font-medium">Website</td>
                          {selectedShops.map((shop) => (
                            <td key={shop.id} className="py-2 px-2 sm:px-3">
                              {shop.website ? (
                                <a 
                                  href={shop.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Visit
                                </a>
                              ) : 'N/A'}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
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
        </div>

        {/* Shops List */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Available Shops</h2>
          {filteredShops.length === 0 ? (
            <div className="space-y-6">
              {/* Show demo data initializer if demo data is incomplete */}
              {showDemoInitializer && (
                <DemoDataInitializer onDataCreated={loadData} />
              )}
              
              <div className="text-center py-8 sm:py-12">
                <div className="text-gray-400 text-4xl mb-4">🏪</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No shops found</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {selectedCategory === 'all' 
                    ? 'No shops available for comparison.'
                    : `No shops found in ${selectedCategory} category.`
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredShops.map((shop) => {
                const isSelected = selectedShops.some(s => s.id === shop.id);
                return (
                  <div
                    key={shop.id}
                    onClick={() => handleShopSelect(shop)}
                    className={`bg-white p-4 sm:p-6 rounded-xl shadow-soft hover:shadow-medium transition-all duration-200 cursor-pointer border-2 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl mb-2">{getCategoryIcon(shop.category)}</div>
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{shop.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">{shop.category}</p>
                      {shop.floor && (
                        <p className="text-xs text-gray-500 mb-2">Floor: {shop.floor}</p>
                      )}
                      <p className="text-xs text-gray-500">{shop.address}</p>
                      {isSelected && (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ✓ Selected
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
