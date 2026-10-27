import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CourierStore {
  isConfigured: boolean;
  isLoading: boolean;
  checkCourierProfile: (userId: string) => Promise<void>;
  setConfigurationStatus: (status: boolean) => void;
}

export const useCourierStore = create<CourierStore>((set) => ({
  isConfigured: false,
  isLoading: true,

  checkCourierProfile: async (userId: string) => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(`courier_profile_${userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.isConfigured) {
          set({ isConfigured: true, isLoading: false });
          return;
        }
      }
      set({ isConfigured: false, isLoading: false });
    } catch (error) {
      console.error('Error checking courier profile in store:', error);
      set({ isConfigured: false, isLoading: false });
    }
  },

  setConfigurationStatus: (status: boolean) => set({ isConfigured: status }),
}));
