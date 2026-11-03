import type { ShopCategory } from '../constants/categories';

export type UserRole = 'buyer' | 'vendor' | 'livreur' | 'admin' | 'client';

export interface Vendor {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  rating: number;
  totalOrders: number;
  isOpen: boolean;
  categories: ShopCategory[];
  badge?: 'top' | null;
}

export type Product = DBProduct;
export type Order = DBOrder;

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

import { Database } from './supabase';

export type DBProfile = Database['public']['Tables']['profiles']['Row'];
export type DBVendor = Database['public']['Tables']['vendors']['Row'];
export type DBProduct = Database['public']['Tables']['products']['Row'];
export type DBOrder = Database['public']['Tables']['orders']['Row'];
export type DBRating = Database['public']['Tables']['ratings']['Row'];

export type { Database };