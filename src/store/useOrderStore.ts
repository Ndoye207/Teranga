import { create } from 'zustand';
import { Order } from '../types';

interface OrderState {
  currentOrder: Order | null;
  orders: Order[];
  setCurrentOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addOrder: (order: Order) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  currentOrder: null,
  orders: [],
  setCurrentOrder: (order) => set({ currentOrder: order }),
  updateOrderStatus: (orderId, status) =>
    set({
      orders: get().orders.map(o =>
        o.id === orderId ? { ...o, status } : o
      ),
      currentOrder:
        get().currentOrder?.id === orderId
          ? { ...get().currentOrder!, status }
          : get().currentOrder,
    }),
  addOrder: (order) =>
    set({ orders: [...get().orders, order], currentOrder: order }),
}));