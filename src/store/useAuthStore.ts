import { create } from 'zustand';
import { DBProfile } from '../types';
import { authService } from '../services/authService';
import { supabase } from '../services/supabase';

interface AuthState {
  user: DBProfile | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: DBProfile | null, token?: string | null) => void;
  setAdminUser: () => void;
  fetchProfile: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,

  setUser: (user, token = null) => set({ user, token }),

  setAdminUser: () => {
    const adminUser: DBProfile = {
      id: 'admin-id',
      email: 'admin@teranga.market',
      full_name: 'Administrateur',
      role: 'admin',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      phone: null
    };
    set({ user: adminUser, token: 'admin-token', isLoading: false });
  },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const profile = await authService.getCurrentProfile();
      const session = await authService.getSession();
      set({ 
        user: profile, 
        token: session?.access_token || null, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Erreur lors du chargement du profil :', error);
      set({ user: null, token: null, isLoading: false });
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    await get().fetchProfile();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await get().fetchProfile();
      } else {
        set({ user: null, token: null, isLoading: false });
      }
    });
  },

  logout: async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    } finally {
      set({ user: null, token: null });
    }
  },
}));
