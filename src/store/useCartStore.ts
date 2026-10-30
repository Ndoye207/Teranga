import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  vendorId: string | null;
  // Actions
  /** Renvoie false si le stock disponible est atteint. */
  addItem: (product: Product) => boolean;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => boolean;
  clearCart: () => void;
  // Calculs
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  vendorId: null,

  addItem: (product) => {
    const { items, vendorId } = get();
    // stock null/undefined = illimité ; sinon on ne dépasse pas le stock connu
    const limit = product.stock ?? Infinity;
    if (limit <= 0) return false;

    // Panier d'un autre vendeur : on repart d'un panier vide avec ce seul produit
    // (avant, les anciens articles restaient à cause d'une lecture périmée de `items`)
    if (vendorId && vendorId !== product.vendor_id) {
      set({ items: [{ product, quantity: 1 }], vendorId: product.vendor_id });
      return true;
    }

    const existing = items.find(i => i.product.id === product.id);
    if (existing) {
      if (existing.quantity + 1 > limit) return false;
      set({
        items: items.map(i =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      });
    } else {
      set({
        items: [...items, { product, quantity: 1 }],
        vendorId: product.vendor_id,
      });
    }
    return true;
  },

  removeItem: (productId) => {
    const items = get().items.filter(i => i.product.id !== productId);
    set({
      items,
      vendorId: items.length === 0 ? null : get().vendorId,
    });
  },

  updateQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeItem(productId);
      return true;
    }
    const current = get().items.find(i => i.product.id === productId);
    if (current && qty > (current.product.stock ?? Infinity)) return false;
    set({
      items: get().items.map(i =>
        i.product.id === productId ? { ...i, quantity: qty } : i,
      ),
    });
    return true;
  },

  clearCart: () => set({ items: [], vendorId: null }),

  total: () =>
    get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
}));
