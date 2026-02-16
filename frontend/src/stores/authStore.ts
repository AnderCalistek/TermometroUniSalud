import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario } from '../types';

interface AuthState {
  token: string | null;
  user: Usuario | null;
  isAuthenticated: boolean;
  login: (token: string, user: Usuario) => void;
  logout: () => void;
  updateUser: (user: Partial<Usuario>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      
      login: (token, user) => {
        localStorage.setItem('authToken', token);
        set({ token, user, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('authToken');
        set({ token: null, user: null, isAuthenticated: false });
      },
      
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
