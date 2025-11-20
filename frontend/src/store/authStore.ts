import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCartStore } from './cartStore';

type Currency = 'MDL' | 'USD' | 'EUR';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  phone?: string;
  role: 'user' | 'admin' | 'super-admin';
  qrCode?: string;
  language: 'en' | 'ru' | 'ro';
  avatar?: string;
  balance?: Record<Currency, number>;
  preferredCurrency?: Currency;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: false,
      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
        // Устанавливаем текущего пользователя в корзине
        useCartStore.getState().setCurrentUser(user.id);
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // Очищаем текущего пользователя в корзине
        useCartStore.getState().setCurrentUser('');
      },
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
      setInitialized: () => set({ isInitialized: true }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setInitialized();
      },
    }
  )
);
