import React, { useState, useEffect } from 'react';
import { UserService } from '../services/userService';
import { ShopService } from '../services/shopService';
import { OfferService } from '../services/offerService';
import { CategoryService } from '../services/categoryService';
import type { UserProfile, Shop, Offer, ShopCategory } from '../types/shop';
import type { Floor } from '../types/shop';
import { logger } from '../utils/logger';

interface AdminStats {
  totalUsers: number;
  totalShops: number;
  totalOffers: number;
  totalCategories: number;
  totalFloors: number;
}

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'shops' | 'offers' | 'categories' | 'floors'>('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalShops: 0,
    totalOffers: 0,
    totalCategories: 0,
    totalFloors: 0
  });
  
  // Data states
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);

  // Form states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showFloorForm, setShowFloorForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '', description: '' });
  const [floorForm, setFloorForm] = useState({ name: '', order: 1, description: '' });

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case 'users':
        loadUsers();
        break;
      case 'shops':
        loadShops();
        break;
      case 'offers':
        loadOffers();
        break;
      case 'categories':
        loadCategories();
        break;
      case 'floors':
        loadFloors();
        break;
    }
  }, [activeTab]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [usersData, shopsData, offersData, categoriesData, floorsData] = await Promise.all([
        UserService.getAllUsers(),
        ShopService.getAllShops(),
        OfferService.getActiveOffers(),
        CategoryService.getAllCategories(),
        CategoryService.getAllFloors()
      ]);

      setStats({
        totalUsers: usersData.length,
        totalShops: shopsData.length,
        totalOffers: offersData.length,
        totalCategories: categoriesData.length,
        totalFloors: floorsData.length
      });
    } catch (error) {
      logger.error('Failed to load admin stats:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await UserService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      logger.error('Failed to load users:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadShops = async () => {
    try {
      setLoading(true);
      const shopsData = await ShopService.getAllShops();
      setShops(shopsData);
    } catch (error) {
      logger.error('Failed to load shops:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadOffers = async () => {
    try {
      setLoading(true);
      const offersData = await OfferService.getActiveOffers();
      setOffers(offersData);
    } catch (error) {
      logger.error('Failed to load offers:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await CategoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      logger.error('Failed to load categories:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadFloors = async () => {
    try {
      setLoading(true);
      const floorsData = await CategoryService.getAllFloors();
      setFloors(floorsData);
    } catch (error) {
      logger.error('Failed to load floors:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = async (userId: string) => {
    try {
      await UserService.promoteToAdmin(userId);
      await loadUsers();
      alert('User promoted to admin successfully!');
    } catch (error) {
      logger.error('Failed to promote user:', error as Error);
      alert('Failed to promote user. Please try again.');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await CategoryService.createCategory(
        categoryForm.name,
        categoryForm.icon,
        categoryForm.description
      );
      setCategoryForm({ name: '', icon: '', description: '' });
      setShowCategoryForm(false);
      await loadCategories();
      await loadStats();
      alert('Category created successfully!');
    } catch (error) {
      logger.error('Failed to create category:', error as Error);
      alert('Failed to create category. Please try again.');
    }
  };

  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await CategoryService.createFloor(
        floorForm.name,
        floorForm.order,
        floorForm.description
      );
      setFloorForm({ name: '', order: 1, description: '' });
      setShowFloorForm(false);
      await loadFloors();
      await loadStats();
      alert('Floor created successfully!');
    } catch (error) {
      logger.error('Failed to create floor:', error as Error);
      alert('Failed to create floor. Please try again.');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await CategoryService.deleteCategory(categoryId);
        await loadCategories();
        await loadStats();
        alert('Category deleted successfully!');
      } catch (error) {
        logger.error('Failed to delete category:', error as Error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  const handleDeleteFloor = async (floorId: string) => {
    if (window.confirm('Are you sure you want to delete this floor?')) {
      try {
        await CategoryService.deleteFloor(floorId);
        await loadFloors();
        await loadStats();
        alert('Floor deleted successfully!');
      } catch (error) {
        logger.error('Failed to delete floor:', error as Error);
        alert('Failed to delete floor. Please try again.');
      }
    }
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'users' as const, label: 'Users', icon: '👥' },
    { id: 'shops' as const, label: 'Shops', icon: '🏪' },
    { id: 'offers' as const, label: 'Offers', icon: '🎯' },
    { id: 'categories' as const, label: 'Categories', icon: '📂' },
    { id: 'floors' as const, label: 'Floors', icon: '🏢' }
  ];

  if (loading && activeTab === 'overview') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-purple-100">Manage all aspects of the Super Mall system</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100">
              <div className="text-2xl mb-2">👥</div>
              <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100">
              <div className="text-2xl mb-2">🏪</div>
              <h3 className="text-lg font-semibold text-gray-900">Total Shops</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalShops}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900">Active Offers</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.totalOffers}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100">
              <div className="text-2xl mb-2">📂</div>
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.totalCategories}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100">
              <div className="text-2xl mb-2">🏢</div>
              <h3 className="text-lg font-semibold text-gray-900">Floors</h3>
              <p className="text-3xl font-bold text-pink-600">{stats.totalFloors}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Name</th>
                    <th className="text-left py-3 px-2">Email</th>
                    <th className="text-left py-3 px-2">Role</th>
                    <th className="text-left py-3 px-2">Business Type</th>
                    <th className="text-left py-3 px-2">Joined</th>
                    <th className="text-left py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.uid} className="border-b">
                      <td className="py-3 px-2">{user.displayName}</td>
                      <td className="py-3 px-2">{user.email}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-2">{user.businessType}</td>
                      <td className="py-3 px-2">{user.createdAt.toLocaleDateString()}</td>
                      <td className="py-3 px-2">
                        {user.role === 'user' && (
                          <button
                            onClick={() => handlePromoteUser(user.uid)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Promote to Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'shops' && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Shop Management</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading shops...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shops.map((shop) => (
                <div key={shop.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{shop.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{shop.category}</p>
                  {shop.floor && (
                    <p className="text-xs text-gray-500 mb-2">Floor: {shop.floor}</p>
                  )}
                  <p className="text-xs text-gray-500">{shop.address}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">
                      Rating: {shop.rating}/5
                    </span>
                    <span className="text-xs text-gray-500">
                      {shop.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'offers' && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Offer Management</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading offers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map((offer) => (
                <div key={offer.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{offer.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{offer.category}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Valid until: {offer.validTo.toLocaleDateString()}
                  </p>
                  {offer.discountPercentage && (
                    <p className="text-sm font-medium text-green-600 mb-2">
                      {offer.discountPercentage}% OFF
                    </p>
                  )}
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    offer.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Category Management</h2>
            <button
              onClick={() => setShowCategoryForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Category
            </button>
          </div>

          {showCategoryForm && (
            <form onSubmit={handleCreateCategory} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Add New Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Icon (emoji)"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Category
                </button>
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading categories...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-2xl">{category.icon}</div>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-600">{category.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'floors' && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Floor Management</h2>
            <button
              onClick={() => setShowFloorForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Floor
            </button>
          </div>

          {showFloorForm && (
            <form onSubmit={handleCreateFloor} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Add New Floor</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Floor Name"
                  value={floorForm.name}
                  onChange={(e) => setFloorForm({ ...floorForm, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Order"
                  value={floorForm.order}
                  onChange={(e) => setFloorForm({ ...floorForm, order: parseInt(e.target.value) || 1 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={floorForm.description}
                  onChange={(e) => setFloorForm({ ...floorForm, description: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Floor
                </button>
                <button
                  type="button"
                  onClick={() => setShowFloorForm(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading floors...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {floors.map((floor) => (
                <div key={floor.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{floor.name}</h3>
                    <button
                      onClick={() => handleDeleteFloor(floor.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Order: {floor.order}</p>
                  {floor.description && (
                    <p className="text-sm text-gray-600">{floor.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
