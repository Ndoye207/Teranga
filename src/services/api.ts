import { supabase } from './supabase';
import { Database } from '../types/supabase';

type Vendor = Database['public']['Tables']['vendors']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Order = Database['public']['Tables']['orders']['Insert'];
type DBOrder = Database['public']['Tables']['orders']['Row'];

export const api = {
  // Vendeurs
  getVendors: async (): Promise<Vendor[]> => {
    const { data, error } = await supabase.from('vendors').select('*');
    if (error) throw error;
    return data || [];
  },

  createShop: async (shopData: Database['public']['Tables']['vendors']['Insert']) => {
    const { data, error } = await supabase.from('vendors').insert([shopData]).select().single();
    if (error) throw error;
    return data;
  },

  // Produits
  getProducts: async (vendorId: string): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId);
    if (error) throw error;
    return data || [];
  },

  addProduct: async (productData: Database['public']['Tables']['products']['Insert']) => {
    const { data, error } = await supabase.from('products').insert([productData]).select().single();
    if (error) throw error;
    return data;
  },

  uploadImage: async (bucket: string, fileUri: string, vendorId: string): Promise<string> => {
    console.log('--- Debug Upload ---');
    console.log('URI:', fileUri);
    
    try {
      const uri = fileUri.startsWith('file://') ? fileUri : `file://${fileUri}`;
      const response = await fetch(uri);
      
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      
      const blob = await response.blob();
      console.log('Blob size:', blob.size);
      
      // TEST: Simplified file name to test if StorageUnknown is folder-related
      const fileName = `prod-${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

      if (error) {
        console.error('Supabase Upload Error:', error);
        throw error;
      }
      
      console.log('Upload successful:', data);
      
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
        
      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Full Error in uploadImage:', err);
      throw err;
    }
  },

  // Commandes
  createOrder: async (order: Order) => {
    const { data, error } = await supabase.from('orders').insert([order]);
    if (error) throw error;
    return data;
  },

  getVendorOrders: async (vendorId: string): Promise<DBOrder[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Stats
  getVendorStats: async (vendorId: string) => {
    // Basic implementation - needs backend views or complex queries in production
    const { data, error } = await supabase
      .from('orders')
      .select('total_amount, status')
      .eq('vendor_id', vendorId);
    if (error) throw error;
    
    // Simplistic reduction for demonstration
    const ordersToday = data.length;
    const revenueToday = data.reduce((acc, curr) => acc + curr.total_amount, 0);
    return { ordersToday, revenueToday };
  },

  // Courses (Livreur)
  getAvailableCourses: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, vendors(store_name, address)')
      .eq('status', 'ready');
    if (error) throw error;
    return data || [];
  },
};
