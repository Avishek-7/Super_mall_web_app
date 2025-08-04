import React from 'react';
import type { Offer } from '../types/shop';

interface OfferCardProps {
  offer: Offer;
  onViewDetails?: (offer: Offer) => void;
  className?: string;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onViewDetails,
  className = '',
}) => {
  const isExpired = new Date(offer.validTo) < new Date();
  const isActive = offer.isActive && !isExpired;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDiscount = () => {
    if (offer.discountPercentage) {
      return `${offer.discountPercentage}% OFF`;
    }
    if (offer.originalPrice && offer.discountedPrice) {
      const discount = Math.round(((offer.originalPrice - offer.discountedPrice) / offer.originalPrice) * 100);
      return `${discount}% OFF`;
    }
    return null;
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-medium transition-all duration-300 border border-gray-100 group ${
        !isActive ? 'opacity-60' : ''
      } ${className}`}
    >
      {/* Image */}
      {offer.image && (
        <div className="relative h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
          <img
            src={offer.image}
            alt={offer.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Discount Badge */}
          {calculateDiscount() && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-200">
              {calculateDiscount()}
            </div>
          )}
          {/* Status Badge */}
          {!isActive && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium shadow-lg">
              {isExpired ? 'Expired' : 'Inactive'}
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      )}

      <div className="p-4 sm:p-6">
        {/* Category and Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs px-2 py-1 sm:px-3 sm:py-1 rounded-full font-medium">
            {offer.category}
          </span>
          {isActive && (
            <span className="text-green-600 text-xs font-semibold bg-green-100 px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {offer.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {offer.description}
        </p>

        {/* Price Information */}
        {(offer.originalPrice || offer.discountedPrice) && (
          <div className="flex items-center space-x-2 mb-4">
            {offer.discountedPrice && (
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ₹{offer.discountedPrice.toFixed(2)}
              </span>
            )}
            {offer.originalPrice && (
              <span
                className={`text-sm sm:text-base ${
                  offer.discountedPrice ? 'line-through text-gray-500' : 'text-gray-900 font-semibold'
                }`}
              >
                ₹{offer.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        )}

        {/* Validity Period */}
        <div className="text-xs text-gray-500 mb-4 space-y-1">
          <div className="flex items-center">
            <span className="mr-2">📅</span>
            <span>From {formatDate(offer.validFrom)}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">⏰</span>
            <span>Until {formatDate(offer.validTo)}</span>
          </div>
        </div>

        {/* Action Button */}
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(offer)}
            className={`w-full py-2 sm:py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg focus-ring ${
              isActive
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!isActive}
          >
            {isActive ? 'View Details' : isExpired ? 'Expired' : 'Not Available'}
          </button>
        )}
      </div>

      {/* Terms and Conditions Preview */}
      {offer.termsAndConditions && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700 transition-colors duration-200 font-medium">
              📋 Terms & Conditions
            </summary>
            <p className="mt-2 text-gray-600 leading-relaxed">{offer.termsAndConditions}</p>
          </details>
        </div>
      )}
    </div>
  );
};
