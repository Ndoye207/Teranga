import { create } from 'zustand';
import { api } from '../services/api';
import { isCourierProfileComplete } from '../utils/courier';
import { registerReset } from './reset';

interface CourierStore {
  isConfigured: boolean;
  isLoading: boolean;
  checkedFor: string | null;
  checkCourierProfile: (userId: string) => Promise<void>;
  setConfigurationStatus: (status: boolean) => void;
}

const initialState = { isConfigured: false, isLoading: true, checkedFor: null };

export const useCourierStore = create<CourierStore>((set, get) => {
  registerReset(() => set(initialState));
  return {
    ...initialState,

    checkCourierProfile: async (userId: string) => {
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
  };
});
