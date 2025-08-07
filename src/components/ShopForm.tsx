import React, { useState, useEffect } from 'react';
import type { ShopFormData, ShopCategory } from '../types/shop';
import type { Floor } from '../types/shop';
import { CategoryService } from '../services/categoryService';
import { logger } from '../utils/logger';

interface ShopFormProps {
  onSubmit: (shopData: ShopFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  initialData?: ShopFormData;
  categories?: ShopCategory[];
}

// Demo service categories
const serviceCategories: ShopCategory[] = [
  { id: '1', name: 'Repair & Maintenance Services', icon: '🛠️' },
  { id: '2', name: 'Beauty & Salon', icon: '💇' },
  { id: '3', name: 'Consulting', icon: '💼' },
  { id: '4', name: 'Cleaning Services', icon: '🧹' },
  { id: '5', name: 'Health & Wellness', icon: '🏥' },
  { id: '6', name: 'Education & Coaching', icon: '🎓' },
  { id: '7', name: 'Legal Services', icon: '⚖️' },
  { id: '8', name: 'Event Planning', icon: '🎉' },
];

export const ShopForm: React.FC<ShopFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  categories = [],
  isLoading = false,
}) => {
  // Use service categories as fallback if categories prop is empty
  const availableCategories = categories.length > 0 ? categories : serviceCategories;
  
  const [formData, setFormData] = useState<ShopFormData>({
    name: initialData?.name || '',
    address: initialData?.address || '',
    category: initialData?.category || '',
    floor: initialData?.floor || '',
    phone: initialData?.phone || '',
    website: initialData?.website || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
  });

  const [errors, setErrors] = useState<Partial<ShopFormData>>({});
  const [floors, setFloors] = useState<Floor[]>([]);

  useEffect(() => {
    loadFloors();
  }, []);

  const loadFloors = async () => {
    try {
      const floorsData = await CategoryService.getAllFloors();
      setFloors(floorsData);
    } catch (error) {
      logger.error('Failed to load floors:', error as Error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ShopFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Shop name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      logger.warn('Form validation failed', errors);
      return;
    }

    try {
      await onSubmit(formData);
      logger.info('Shop form submitted successfully');
    } catch (error) {
      logger.error('Failed to submit shop form', error as Error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ShopFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white shadow-soft rounded-xl p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          {initialData ? 'Edit Shop' : 'Add New Shop'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Shop Name */}
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Shop Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter shop name"
            />
            {errors.name && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter shop address"
            />
            {errors.address && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.address}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select category</option>
              {availableCategories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.category}</p>}
          </div>

          {/* Floor */}
          <div>
            <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-2">
              Floor
            </label>
            <select
              id="floor"
              name="floor"
              value={formData.floor}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            >
              <option value="">Select floor (optional)</option>
              {floors.map((floor) => (
                <option key={floor.id} value={floor.name}>
                  {floor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              placeholder="Enter phone number"
            />
          </div>

          {/* Website */}
          <div className="sm:col-span-2">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                errors.website ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://example.com"
            />
            {errors.website && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.website}</p>}
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              placeholder="Enter shop description"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Shop' : 'Create Shop'}
          </button>
        </div>
      </div>
    </form>
  );
};

// Optionally export demo categories for usage elsewhere
