export type UserRole = 'client' | 'vendor' | 'livreur' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  token?: string;
}

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
  categories: ('legumes' | 'plats' | 'traiteur')[];
  badge?: 'top' | null;
}

export type Product = DBProduct;

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
  | 'delivered';

export interface Order {
  id: string;
  clientId: string;
  vendorId: string;
  vendorName: string;
  livreurId?: string;
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  status: OrderStatus;
  paymentMethod: 'cash' | 'wave' | 'orange_money';
  deliveryAddress: string;
  note?: string;
  createdAt: string;
}

export interface Rating {
  orderId: string;
  vendorRating: number;
  vendorComment?: string;
  livreurRating: number;
  livreurComment?: string;
}

import { Database } from './supabase';

export type DBProfile = Database['public']['Tables']['profiles']['Row'];
export type DBVendor = Database['public']['Tables']['vendors']['Row'];
export type DBProduct = Database['public']['Tables']['products']['Row'];
export type DBOrder = Database['public']['Tables']['orders']['Row'];
export type DBRating = Database['public']['Tables']['ratings']['Row'];

export type { Database };