import React, { useState } from 'react';
import type { OfferFormData, ShopCategory } from '../types/shop';
import { logger } from '../utils/logger';

interface OfferFormProps {
  onSubmit: (data: OfferFormData) => Promise<void>;
  initialData?: Partial<OfferFormData>;
  categories: ShopCategory[];
  isLoading?: boolean;
  onCancel?: () => void;
}

// Demo offer categories
const offerCategories: ShopCategory[] = [
  { id: '1', name: 'Electronics', icon: '📱' },
  { id: '2', name: 'Fashion', icon: '👕' },
  { id: '3', name: 'Food & Beverages', icon: '🍕' },
  { id: '4', name: 'Health & Beauty', icon: '💄' },
  { id: '5', name: 'Home & Garden', icon: '🏠' },
  { id: '6', name: 'Sports & Fitness', icon: '⚽' },
  { id: '7', name: 'Books & Education', icon: '📚' },
  { id: '8', name: 'Services', icon: '🛠️' },
];

export const OfferForm: React.FC<OfferFormProps> = ({
  onSubmit,
  initialData,
  categories = [],
  isLoading = false,
  onCancel,
}) => {
  // Use offer categories as fallback if categories prop is empty
  const availableCategories = categories.length > 0 ? categories : offerCategories;
  
  const [formData, setFormData] = useState<OfferFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    discountPercentage: initialData?.discountPercentage,
    originalPrice: initialData?.originalPrice,
    discountedPrice: initialData?.discountedPrice,
    validFrom: initialData?.validFrom || new Date(),
    validTo: initialData?.validTo || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    termsAndConditions: initialData?.termsAndConditions || '',
    image: initialData?.image || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Offer title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.validFrom >= formData.validTo) {
      newErrors.validTo = 'End date must be after start date';
    }

    if (formData.originalPrice && formData.originalPrice <= 0) {
      newErrors.originalPrice = 'Original price must be greater than 0';
    }

    if (formData.discountedPrice && formData.discountedPrice <= 0) {
      newErrors.discountedPrice = 'Discounted price must be greater than 0';
    }

    if (formData.originalPrice && formData.discountedPrice && formData.discountedPrice >= formData.originalPrice) {
      newErrors.discountedPrice = 'Discounted price must be less than original price';
    }

    if (formData.discountPercentage && (formData.discountPercentage <= 0 || formData.discountPercentage >= 100)) {
      newErrors.discountPercentage = 'Discount percentage must be between 1 and 99';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      logger.warn('Form validation failed', errors);
      return;
    }

    try {
      await onSubmit(formData);
      logger.info('Offer form submitted successfully');
    } catch (error) {
      logger.error('Failed to submit offer form', error as Error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number | Date | undefined = value;
    
    if (type === 'number') {
      processedValue = value === '' ? undefined : parseFloat(value) || 0;
    } else if (type === 'date' || type === 'datetime-local') {
      processedValue = new Date(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().slice(0, 16); // Format for datetime-local input
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white shadow-soft rounded-xl p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          {initialData ? 'Edit Offer' : 'Create New Offer'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Offer Title */}
          <div className="sm:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Offer Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter offer title"
            />
            {errors.title && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe your offer"
            />
            {errors.description && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.description}</p>}
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
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
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

          {/* Discount Percentage */}
          <div>
            <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700 mb-2">
              Discount Percentage (%)
            </label>
            <input
              type="number"
              id="discountPercentage"
              name="discountPercentage"
              value={formData.discountPercentage || ''}
              onChange={handleInputChange}
              min="1"
              max="99"
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                errors.discountPercentage ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 20"
            />
            {errors.discountPercentage && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.discountPercentage}</p>}
          </div>

          {/* Original Price */}
          <div>
            <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Original Price (₹)
            </label>
            <input
              type="number"
              id="originalPrice"
              name="originalPrice"
              value={formData.originalPrice || ''}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                errors.originalPrice ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 1000"
            />
            {errors.originalPrice && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.originalPrice}</p>}
          </div>

          {/* Discounted Price */}
          <div>
            <label htmlFor="discountedPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Discounted Price (₹)
            </label>
            <input
              type="number"
              id="discountedPrice"
              name="discountedPrice"
              value={formData.discountedPrice || ''}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                errors.discountedPrice ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 800"
            />
            {errors.discountedPrice && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.discountedPrice}</p>}
          </div>

          {/* Valid From */}
          <div>
            <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700 mb-2">
              Valid From *
            </label>
            <input
              type="datetime-local"
              id="validFrom"
              name="validFrom"
              value={formatDateForInput(formData.validFrom)}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                errors.validFrom ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.validFrom && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.validFrom}</p>}
          </div>

          {/* Valid To */}
          <div>
            <label htmlFor="validTo" className="block text-sm font-medium text-gray-700 mb-2">
              Valid Until *
            </label>
            <input
              type="datetime-local"
              id="validTo"
              name="validTo"
              value={formatDateForInput(formData.validTo)}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                errors.validTo ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.validTo && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.validTo}</p>}
          </div>

          {/* Terms and Conditions */}
          <div className="sm:col-span-2">
            <label htmlFor="termsAndConditions" className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <textarea
              id="termsAndConditions"
              name="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              placeholder="Enter terms and conditions (optional)"
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
            className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 border border-transparent rounded-xl hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isLoading ? 'Creating...' : initialData ? 'Update Offer' : 'Create Offer'}
          </button>
        </div>
      </div>
    </form>
  );
};
