import { create } from 'zustand';
import { api } from '../services/api';
import { isCourierProfileComplete } from '../utils/courier';

interface CourierStore {
  isConfigured: boolean;
  isLoading: boolean;
  /** Utilisateur pour lequel `isConfigured` a été calculé (évite de mélanger deux comptes). */
  checkedFor: string | null;
  /** Le profil livreur est lu en base (table courier_profiles), plus dans AsyncStorage. */
  checkCourierProfile: (userId: string) => Promise<void>;
  setConfigurationStatus: (status: boolean) => void;
}

export const useCourierStore = create<CourierStore>((set, get) => ({
  isConfigured: false,
  isLoading: true,
  checkedFor: null,

  checkCourierProfile: async (userId: string) => {
    // Spinner seulement la première fois pour cet utilisateur (pas à chaque retour sur l'écran)
    if (get().checkedFor !== userId) set({ isLoading: true, isConfigured: false });
    try {
      const profile = await api.getCourierProfile(userId);
      set({ isConfigured: isCourierProfileComplete(profile), isLoading: false, checkedFor: userId });
    } catch (error) {
      console.error('Erreur chargement profil livreur :', error);
      set({ isConfigured: false, isLoading: false });
    }
  },

  setConfigurationStatus: (status: boolean) => set({ isConfigured: status }),
}));
