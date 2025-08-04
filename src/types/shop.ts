export interface Shop {
  id: string;
  name: string;
  address: string;
  category: string;
  floor?: string;
  rating: number;
  image?: string;
  phone?: string;
  website?: string;
  description?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  offers?: Offer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Offer {
  id: string;
  shopId: string;
  title: string;
  description: string;
  discountPercentage?: number;
  originalPrice?: number;
  discountedPrice?: number;
  validFrom: Date;
  validTo: Date;
  category: string;
  image?: string;
  isActive: boolean;
  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface ShopFormData {
  name: string;
  address: string;
  category: string;
  floor?: string;
  phone?: string;
  website?: string;
  description?: string;
  image?: File | string;
}

export interface OfferFormData {
  title: string;
  description: string;
  discountPercentage?: number;
  originalPrice?: number;
  discountedPrice?: number;
  validFrom: Date;
  validTo: Date;
  category: string;
  image?: File | string;
  termsAndConditions?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  businessType: 'retail' | 'food' | 'service' | 'other';
  phoneNumber?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}
