import { create } from 'zustand';
import { DBProfile } from '../types';
import { authService, authFlags } from '../services/authService';
import { supabase } from '../services/supabase';
import { resetAllStores } from './reset';

interface AuthState {
  user: DBProfile | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: DBProfile | null, token?: string | null) => void;
  fetchProfile: (silent?: boolean) => Promise<void>;
  initializeAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

// Une seule souscription aux événements d'authentification pour toute l'app
let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,

  setUser: (user, token = null) => set({ user, token }),

  /**
   * silent = true : recharge le profil sans afficher l'écran de chargement
   * (sinon la navigation est démontée et l'utilisateur perd son écran).
   */
  fetchProfile: async (silent = false) => {
    if (!silent) set({ isLoading: true });
    try {
      const session = await authService.getSession();
      if (!session) {
        set({ user: null, token: null, isLoading: false });
        return;
      }
      const profile = await authService.getCurrentProfile();
      set({ user: profile, token: session.access_token, isLoading: false });
    } catch (error) {
      console.error('Erreur lors du chargement du profil :', error);
      if (!silent) {
        set({ user: null, token: null, isLoading: false });
      }
    }
  },

  initializeAuth: async () => {
    if (authSubscription) return;

    set({ isLoading: true });
    await get().fetchProfile();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // Pas d'await ni d'appel Supabase direct dans ce callback
      // (risque de blocage connu de supabase-js).
      if (event === 'TOKEN_REFRESHED') {
        set({ token: session?.access_token ?? null });
        return;
      }
      if (event === 'SIGNED_OUT' || !session?.user) {
        set({ user: null, token: null, isLoading: false });
        resetAllStores();
        return;
      }
      if (authFlags.recoveryInProgress) return; // fin de la réinitialisation : le profil est chargé ensuite
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setTimeout(() => {
          get().fetchProfile(true);
        }, 0);
      }
    });
    authSubscription = data.subscription;
  },

  logout: async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    } finally {
      set({ user: null, token: null });
      resetAllStores();
    }
  },
}));