import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { ShopCategory } from '../types/shop';
import { logger } from '../utils/logger';

export interface Floor {
  id: string;
  name: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryService {
  private static readonly CATEGORIES_COLLECTION = 'categories';
  private static readonly FLOORS_COLLECTION = 'floors';

  /**
   * Create a new category
   */
  static async createCategory(name: string, icon: string, description?: string): Promise<string> {
    try {
      logger.info('Creating new category:', name);
      
      const category = {
        name,
        icon,
        description,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      const docRef = await addDoc(collection(db, this.CATEGORIES_COLLECTION), category);
      logger.info('Category created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      logger.error('Failed to create category:', error as Error);
      throw new Error('Failed to create category');
    }
  }

  /**
   * Get all categories
   */
  static async getAllCategories(): Promise<ShopCategory[]> {
    try {
      logger.info('Fetching all categories');
      
      const q = query(collection(db, this.CATEGORIES_COLLECTION), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      const categories: ShopCategory[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        categories.push({
          id: doc.id,
          name: data.name,
          icon: data.icon,
          description: data.description,
        });
      });

      logger.info(`Found ${categories.length} categories`);
      return categories;
    } catch (error) {
      logger.error('Failed to fetch categories:', error as Error);
      throw new Error('Failed to fetch categories');
    }
  }

  /**
   * Update a category
   */
  static async updateCategory(categoryId: string, name: string, icon: string, description?: string): Promise<void> {
    try {
      logger.info('Updating category:', categoryId);
      
      const docRef = doc(db, this.CATEGORIES_COLLECTION, categoryId);
      await updateDoc(docRef, {
        name,
        icon,
        description,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      logger.info('Category updated successfully:', categoryId);
    } catch (error) {
      logger.error('Failed to update category:', error as Error);
      throw new Error('Failed to update category');
    }
  }

  /**
   * Delete a category
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    try {
      logger.info('Deleting category:', categoryId);
      
      const docRef = doc(db, this.CATEGORIES_COLLECTION, categoryId);
      await deleteDoc(docRef);

      logger.info('Category deleted successfully:', categoryId);
    } catch (error) {
      logger.error('Failed to delete category:', error as Error);
      throw new Error('Failed to delete category');
    }
  }

  /**
   * Create a new floor
   */
  static async createFloor(name: string, order: number, description?: string): Promise<string> {
    try {
      logger.info('Creating new floor:', name);
      
      const floor = {
        name,
        description,
        order,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      const docRef = await addDoc(collection(db, this.FLOORS_COLLECTION), floor);
      logger.info('Floor created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      logger.error('Failed to create floor:', error as Error);
      throw new Error('Failed to create floor');
    }
  }

  /**
   * Get all floors
   */
  static async getAllFloors(): Promise<Floor[]> {
    try {
      logger.info('Fetching all floors');
      
      const q = query(collection(db, this.FLOORS_COLLECTION), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      const floors: Floor[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        floors.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          order: data.order,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });

      logger.info(`Found ${floors.length} floors`);
      return floors;
    } catch (error) {
      logger.error('Failed to fetch floors:', error as Error);
      throw new Error('Failed to fetch floors');
    }
  }

  /**
   * Update a floor
   */
  static async updateFloor(floorId: string, name: string, order: number, description?: string): Promise<void> {
    try {
      logger.info('Updating floor:', floorId);
      
      const docRef = doc(db, this.FLOORS_COLLECTION, floorId);
      await updateDoc(docRef, {
        name,
        description,
        order,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      logger.info('Floor updated successfully:', floorId);
    } catch (error) {
      logger.error('Failed to update floor:', error as Error);
      throw new Error('Failed to update floor');
    }
  }

  /**
   * Delete a floor
   */
  static async deleteFloor(floorId: string): Promise<void> {
    try {
      logger.info('Deleting floor:', floorId);
      
      const docRef = doc(db, this.FLOORS_COLLECTION, floorId);
      await deleteDoc(docRef);

      logger.info('Floor deleted successfully:', floorId);
    } catch (error) {
      logger.error('Failed to delete floor:', error as Error);
      throw new Error('Failed to delete floor');
    }
  }
}
