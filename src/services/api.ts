import { supabase } from './supabase';
import { Database } from '../types/supabase';
import { decode } from 'base64-arraybuffer';
import { getPickedBase64, releasePicked } from '../utils/pickImage';

type Vendor = Database['public']['Tables']['vendors']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Order = Database['public']['Tables']['orders']['Insert'];
type DBOrder = Database['public']['Tables']['orders']['Row'];

// Ce que le client et le vendeur ont le droit de voir sur le livreur de LEUR commande
// (jamais la pièce d'identité ni le permis : ils restent privés, visibles par l'admin seulement)
export type CourierPublicInfo = {
  full_name: string | null;
  phone: string | null;
  photo_url: string | null;
  vehicle_type: string | null;
  plate: string | null;
};

const toBlob = async (fileUri: string): Promise<Blob> => {
  const uri = fileUri.startsWith('file://') || fileUri.startsWith('content://') || fileUri.startsWith('http')
    ? fileUri
    : `file://${fileUri}`;
  const response = await fetch(uri);
  if (!response.ok) throw new Error(`Lecture de l'image impossible (${response.status})`);
  return response.blob();
};

// Corps de l'envoi : on préfère le base64 fourni par le sélecteur d'images (fiable),
// et on retombe sur la lecture du fichier si on ne l'a pas.
const toUploadBody = async (fileUri: string): Promise<ArrayBuffer | Blob> => {
  const b64 = getPickedBase64(fileUri);
  return b64 ? decode(b64) : toBlob(fileUri);
};

export const api = {
  // Vendeurs
  getVendors: async (): Promise<(Vendor & { products: { category: string | null }[] })[]> => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*, products(category)');
    if (error) throw error;
    return (data || []) as any;
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
      .eq('vendor_id', vendorId)
      // is_active vide (null) = actif ; le stock n'est pas géré dans l'app pour l'instant
      .or('is_active.is.null,is_active.eq.true');
    if (error) throw error;
    return data || [];
  },

  // Tous les produits du vendeur (y compris désactivés) — écran de gestion
  getAllProducts: async (vendorId: string): Promise<Product[]> => {
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

  uploadImage: async (bucket: string, fileUri: string, ownerId: string): Promise<string> => {
    const body = await toUploadBody(fileUri);

    const fileName = `${ownerId}-${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, body, { contentType: 'image/jpeg', upsert: true });
    if (error) throw error;
    releasePicked(fileUri);

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  },

  // Pièces du livreur. Chemin = <userId>/<type>-<date>.jpg (les règles de stockage l'exigent).
  //  - photo   -> bucket public « courier-photos » : on renvoie l'URL publique
  //  - id_card / license -> bucket PRIVÉ « courier-docs » : on renvoie le chemin (pas d'URL publique)
  uploadCourierFile: async (
    kind: 'photo' | 'id_card' | 'license', fileUri: string, userId: string,
  ): Promise<string> => {
    const body = await toUploadBody(fileUri);
    const bucket = kind === 'photo' ? 'courier-photos' : 'courier-docs';
    const path = `${userId}/${kind}-${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, body, { contentType: 'image/jpeg', upsert: false });
    if (error) throw error;
    releasePicked(fileUri);
    if (kind === 'photo') return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    return path;
  },

  // Commandes — prix, stock et boutique sont vérifiés côté serveur (fonction create_order)
  createOrder: async (params: {
    vendorId: string;
    items: { productId: string; quantity: number }[];
    address: string;
    payment: 'cash' | 'wave' | 'orange_money';
  }): Promise<DBOrder> => {
    const { data, error } = await supabase.rpc('create_order', {
      p_vendor_id: params.vendorId,
      p_items: params.items.map(i => ({ product_id: i.productId, quantity: i.quantity })),
      p_address: params.address,
      p_payment: params.payment,
    });
    if (error) throw error;
    return data as DBOrder;
  },

  getOrderItems: async (orderId: string) => {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    if (error) throw error;
    return data || [];
  },

  // Commandes du client connecté (avec le nom de la boutique)
  getMyOrders: async (buyerId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, vendors(store_name), order_items(id, product_name, quantity, unit_price)')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Identifiants des commandes que ce client a déjà notées
  getMyRatedOrderIds: async (buyerId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('ratings')
      .select('order_id')
      .eq('buyer_id', buyerId);
    if (error) throw error;
    return (data || []).map(r => r.order_id).filter((id): id is string => !!id);
  },

  // Profil public du livreur de cette commande : visible par le client, le vendeur, le livreur et l'admin (fonction SQL sécurisée)
  getOrderCourier: async (orderId: string): Promise<CourierPublicInfo | null> => {
    const { data, error } = await supabase.rpc('get_order_courier', { p_order_id: orderId });
    if (error) throw error;
    return data?.[0] ?? null;
  },

  // Commandes du vendeur avec le détail des articles commandés
  getVendorOrdersWithItems: async (vendorId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(id, product_name, quantity, unit_price)')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Une commande du vendeur avec ses articles (pour les mises à jour temps réel)
  getVendorOrderWithItems: async (orderId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(id, product_name, quantity, unit_price)')
      .eq('id', orderId)
      .single();
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

  // Stats du jour (hors commandes annulées)
  getVendorStats: async (vendorId: string) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from('orders')
      .select('total_amount, delivery_fee, status')
      .eq('vendor_id', vendorId)
      .gte('created_at', startOfDay.toISOString())
      .neq('status', 'cancelled');
    if (error) throw error;
    const rows = data || [];
    const ordersToday = rows.length;
    // Le vendeur ne touche pas les frais de livraison
    const revenueToday = rows.reduce(
      (acc, o) => acc + Math.max(0, (o.total_amount || 0) - (o.delivery_fee || 0)), 0);
    return { ordersToday, revenueToday };
  },

  // Courses (Livreur)
  // Courses disponibles (prêtes, sans livreur) + courses du livreur connecté
  getCoursesForCourier: async (courierId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, vendors(store_name, address, phone)')
      .or(`and(status.eq.ready,livreur_id.is.null),livreur_id.eq.${courierId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Courses prêtes, sans livreur (onglet « Disponible »)
  getAvailableCourses: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, vendors(store_name, address, phone)')
      .eq('status', 'ready')
      .is('livreur_id', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Courses terminées du livreur (revenus)
  getDeliveredByCourier: async (courierId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, total_amount, delivery_fee, shipping_address, updated_at, created_at')
      .eq('livreur_id', courierId)
      .eq('status', 'delivered')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Le livreur fait avancer SA course (picked_up -> delivering -> delivered)
  setCourierOrderStatus: async (
    orderId: string,
    status: 'picked_up' | 'delivering' | 'delivered',
  ): Promise<DBOrder> => {
    const { data, error } = await supabase.rpc('set_courier_order_status', {
      p_order_id: orderId, p_status: status,
    });
    if (error) throw error;
    return data as DBOrder;
  },

  // Crée / met à jour le profil livreur. Le serveur refuse si une pièce obligatoire manque.
  becomeCourier: async (p: {
    vehicle: string; phone: string; plate: string;
    photoUrl: string; idCardPath: string; licensePath: string;
  }) => {
    const { error } = await supabase.rpc('become_courier_verified', {
      p_vehicle: p.vehicle, p_phone: p.phone, p_plate: p.plate,
      p_photo_url: p.photoUrl, p_id_card_path: p.idCardPath, p_license_path: p.licensePath,
    });
    if (error) throw error;
  },

  getCourierProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('courier_profiles').select('*').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    return data;
  },

  rateOrder: async (p: {
    orderId: string; vendorRating: number; vendorComment: string;
    livreurRating: number; livreurComment: string;
  }) => {
    const { error } = await supabase.rpc('rate_order', {
      p_order_id: p.orderId,
      p_vendor_rating: p.vendorRating, p_vendor_comment: p.vendorComment,
      p_livreur_rating: p.livreurRating, p_livreur_comment: p.livreurComment,
    });
    if (error) throw error;
  },

  // Le livreur accepte une course (la base garantit qu'un seul livreur la prend)
  acceptCourse: async (orderId: string): Promise<DBOrder> => {
    const { data, error } = await supabase.rpc('accept_course', { p_order_id: orderId });
    if (error) throw error;
    return data as DBOrder;
  },

  // Boutique du vendeur connecté (vendors.profile_id = auth user)
  getMyVendor: async (): Promise<Vendor | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('vendors').select('*').eq('profile_id', user.id).maybeSingle();
    if (error) throw error;
    return data;
  },

  // Le vendeur accepte / refuse / fait avancer une commande
  setVendorOrderStatus: async (
    orderId: string,
    status: 'confirmed' | 'cancelled' | 'preparing' | 'ready',
    reason?: string,
  ): Promise<DBOrder> => {
    const { data, error } = await supabase.rpc('set_vendor_order_status', {
      p_order_id: orderId, p_status: status, p_reason: reason ?? null,
    });
    if (error) throw error;
    return data as DBOrder;
  },
};
