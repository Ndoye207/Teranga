import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import { isCourierProfileComplete } from '../utils/courier';

/**
 * Le profil livreur est stocké en base (table courier_profiles),
 * plus dans AsyncStorage : il survit à une réinstallation / un changement de téléphone.
 * hasProfile : null = chargement, true / false ensuite (true = profil COMPLET : photo, pièce d'identité, etc.).
 */
export const useCourierProfile = () => {
  const user = useAuthStore(s => s.user);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const profile = await api.getCourierProfile(user.id);
      setHasProfile(isCourierProfileComplete(profile));
    } catch (err) {
      console.error('Erreur chargement profil livreur:', err);
      setHasProfile(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return { hasProfile, refresh };
};
