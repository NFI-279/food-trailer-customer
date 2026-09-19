// [Frontend - Customer] src/store/cart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware'; 
import { MenuItem } from '@/types';

export interface CartItem extends MenuItem {
  cartItemId: string; 
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  activeOrderId: string | null;
  activeOrderToken: string | null;
  setActiveOrder: (id: string | null, token?: string | null) => void;
  addItem: (item: MenuItem) => void; // Removed notes parameter
  removeItem: (cartItemId: string) => void;
  decreaseQuantity: (cartItemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      activeOrderId: null,
      activeOrderToken: null,
      
      setActiveOrder: (id, token = null) => set({
        activeOrderId: id,
        activeOrderToken: id ? token : null,
      }),

      addItem: (item) => {
        set((state) => {
          // Check if this exact item is already in the cart (just by ID now)
          const existingItemIndex = state.items.findIndex(
            (i) => i.id === item.id
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += 1;
            return { items: newItems };
          }

          return {
            items: [
              ...state.items,
              { ...item, cartItemId: crypto.randomUUID(), quantity: 1 }
            ]
          };
        });
      },

      decreaseQuantity: (cartItemId) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex((i) => i.cartItemId === cartItemId);
          if (existingItemIndex === -1) return state;

          const newItems = [...state.items];
          if (newItems[existingItemIndex].quantity > 1) {
            newItems[existingItemIndex].quantity -= 1;
            return { items: newItems };
          } else {
            return { items: state.items.filter((i) => i.cartItemId !== cartItemId) };
          }
        });
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartItemId !== cartItemId)
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'food-trailer-cart', // The name of the localStorage key
    }
  )
);