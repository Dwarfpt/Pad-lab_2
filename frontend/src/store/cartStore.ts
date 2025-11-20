import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  type: 'tariff' | 'booking';
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  data?: any; // дополнительные данные (tariffId, parkingId и т.д.)
}

interface UserCart {
  [userId: string]: CartItem[];
}

interface CartState {
  userCarts: UserCart;
  currentUserId: string | null;
  setCurrentUser: (userId: string) => void;
  getItems: () => CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      userCarts: {},
      currentUserId: null,

      setCurrentUser: (userId: string) => {
        set({ currentUserId: userId });
      },

      getItems: () => {
        const { userCarts, currentUserId } = get();
        if (!currentUserId) return [];
        return userCarts[currentUserId] || [];
      },

      addItem: (item) => {
        set((state) => {
          const { currentUserId } = state;
          if (!currentUserId) return state;

          const userItems = state.userCarts[currentUserId] || [];
          const existingItem = userItems.find((i) => i.id === item.id);
          
          if (existingItem) {
            return {
              ...state,
              userCarts: {
                ...state.userCarts,
                [currentUserId]: userItems.map((i) =>
                  i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                ),
              },
            };
          }

          return {
            ...state,
            userCarts: {
              ...state.userCarts,
              [currentUserId]: [...userItems, { ...item, quantity: 1 }],
            },
          };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const { currentUserId } = state;
          if (!currentUserId) return state;

          return {
            ...state,
            userCarts: {
              ...state.userCarts,
              [currentUserId]: (state.userCarts[currentUserId] || []).filter((item) => item.id !== id),
            },
          };
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => {
          const { currentUserId } = state;
          if (!currentUserId) return state;

          return {
            ...state,
            userCarts: {
              ...state.userCarts,
              [currentUserId]: (state.userCarts[currentUserId] || []).map((item) =>
                item.id === id ? { ...item, quantity } : item
              ),
            },
          };
        });
      },

      clearCart: () => {
        set((state) => {
          const { currentUserId } = state;
          if (!currentUserId) return state;

          return {
            ...state,
            userCarts: {
              ...state.userCarts,
              [currentUserId]: [],
            },
          };
        });
      },

      getTotalPrice: () => {
        return get().getItems().reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        return get().getItems().reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
