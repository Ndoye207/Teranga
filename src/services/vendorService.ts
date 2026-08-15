import { supabase } from './supabase';
import { DBProduct } from '../types';

export const vendorService = {
  // Product CRUD
  async addProduct(product: Omit<DBProduct, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('products').insert(product).select().single();
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: Partial<DBProduct>) {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // Order Management
  async updateOrderStatus(id: string, status: string) {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
};
