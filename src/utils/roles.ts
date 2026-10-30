import { UserRole } from '../types';

export type Space = 'Client' | 'Vendor' | 'Livreur' | 'Admin';

/** Ramène les anciennes valeurs (buyer, delivery, null) vers les rôles actuels. */
export function normalizeRole(role: string | null | undefined): UserRole {
  switch ((role ?? '').toLowerCase()) {
    case 'vendor':   return 'vendor';
    case 'livreur':
    case 'delivery': return 'livreur';
    case 'admin':    return 'admin';
    default:         return 'client';
  }
}

/**
 * Espaces ouverts selon le rôle. Le contrôle réel reste côté serveur (RLS et
 * fonctions SQL) : ceci évite seulement d'afficher / d'ouvrir un espace interdit.
 * - un client peut devenir livreur (via save_courier_profile) ;
 * - un vendeur garde son rôle et n'ouvre pas l'espace livreur.
 */
export function allowedSpaces(role: string | null | undefined): Space[] {
  switch (normalizeRole(role)) {
    case 'admin':   return ['Client', 'Vendor', 'Livreur', 'Admin'];
    case 'vendor':  return ['Client', 'Vendor'];
    case 'livreur': return ['Client', 'Livreur'];
    default:        return ['Client', 'Livreur'];
  }
}
