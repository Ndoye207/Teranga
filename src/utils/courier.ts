// Règle « profil livreur complet » — la même que côté base (fonction is_courier_profile_complete).
// Téléphone + photo de profil + pièce d'identité toujours obligatoires ;
// plaque d'immatriculation + permis de conduire obligatoires pour moto et voiture
// (un vélo n'a ni plaque ni permis).
export const VEHICLES = ['Moto', 'Vélo', 'Voiture'] as const;

export const vehicleNeedsPlateAndLicense = (vehicle: string | null | undefined) =>
  (vehicle ?? '').trim().toLowerCase() !== 'vélo' && (vehicle ?? '').trim().toLowerCase() !== 'velo';

type CourierProfileLike = {
  vehicle_type?: string | null;
  phone?: string | null;
  plate?: string | null;
  photo_url?: string | null;
  id_card_path?: string | null;
  license_path?: string | null;
};

const filled = (v?: string | null) => !!v && v.trim().length > 0;

export const isCourierProfileComplete = (p?: CourierProfileLike | null): boolean => {
  if (!p) return false;
  if (!filled(p.phone) || !filled(p.photo_url) || !filled(p.id_card_path)) return false;
  if (vehicleNeedsPlateAndLicense(p.vehicle_type)) return filled(p.plate) && filled(p.license_path);
  return true;
};
