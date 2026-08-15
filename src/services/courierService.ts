import { supabase } from './supabase';

export const courierService = {
  async acceptOrder(orderId: string, courierId: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'picked_up', livreur_id: courierId }) // Simplified workflow
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateOrderStatus(orderId: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
