import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartState {
   items: CartItem[];
   vendorId: string | null;
   // Actions
   addItem: (product: Product) => void;
   removeItem: (productId: string) => void;
   updateQty: (productId: string, qty: number) => void;
   clearCart: () => void;
   // Calculs
   total: () => number;
}

 export const useCartStore = create<CartState>((set, get) => ({
   items:    [],
   vendorId: null,

   addItem: (product) => {
     const { items, vendorId } = get();

     // Si le panier appartient déjà à un autre vendeur, on le vide
     if (vendorId && vendorId !== product.vendor_id) {
       set({ items: [], vendorId: product.vendor_id });
     }

     const existing = items.find(i => i.product.id === product.id);
     if (existing) {
       set({
         items: items.map(i =>
           i.product.id === product.id
             ? { ...i, quantity: i.quantity + 1 }
             : i
         ),
       });
     } else {
       set({
         items: [...items, { product, quantity: 1 }],
         vendorId: product.vendor_id,
       });
     }
   },

   removeItem: (productId) => {
     const items = get().items.filter(i => i.product.id !== productId);
     set({
       items,
       vendorId: items.length === 0 ? null : get().vendorId
     });
   },

   updateQty: (productId, qty) => {
     if (qty <= 0) {
       get().removeItem(productId);
       return;
     }
     set({
       items: get().items.map(i =>
         i.product.id === productId ? { ...i, quantity: qty } : i
       ),
     });
   },

   clearCart: () => set({ items: [], vendorId: null }),

   total: () =>
     get().items.reduce(
       (sum, i) => sum + i.product.price * i.quantity, 0
     ),
}));