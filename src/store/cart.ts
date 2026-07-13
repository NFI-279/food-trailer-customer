// [Frontend - Customer] src/store/cart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // <-- Import persist!
import { MenuItem } from '@/types';

export interface CartItem extends MenuItem {
  cartItemId: string; 
  quantity: number;
  notes: string;
}

interface CartStore {
  items: CartItem[];
  activeOrderNumber: string | null;
  setActiveOrder: (orderNumber: string | null) => void;
  addItem: (item: MenuItem, notes?: string) => void;
  updateNotes: (cartItemId: string, notes: string) => void; // <-- New function for notes!
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
      activeOrderNumber: null,
      
      setActiveOrder: (orderNumber) => set({ activeOrderNumber: orderNumber }),

      addItem: (item, notes = "") => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.id === item.id && i.notes === notes
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += 1;
            return { items: newItems };
          }

          return {
            items: [
              ...state.items,
              { ...item, cartItemId: Math.random().toString(36).substring(2, 9), quantity: 1, notes }
            ]
          };
        });
      },

      updateNotes: (cartItemId, notes) => {
        set((state) => ({
          items: state.items.map(item => 
            item.cartItemId === cartItemId ? { ...item, notes } : item
          )
        }));
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