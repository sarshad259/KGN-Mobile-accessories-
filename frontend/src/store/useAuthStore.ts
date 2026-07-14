import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token?: string;
}

interface AuthState {
  userInfo: User | null;
  setCredentials: (data: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userInfo: null,
      setCredentials: (data) => set({ userInfo: data }),
      logout: () => set({ userInfo: null }),
    }),
    {
      name: 'kgn-auth-storage',
    }
  )
);
