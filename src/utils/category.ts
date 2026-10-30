import { CATEGORIES, ShopCategory, getCategory, CategoryDef } from '../constants/categories';

export type { ShopCategory };

// Anciennes valeurs ou variantes de saisie -> identifiant officiel
const ALIASES: Record<string, ShopCategory> = {
  plat: 'plats', repas: 'plats', plats: 'plats', cuisine: 'plats',
  legume: 'legumes', legumes: 'legumes',
  fruit: 'fruits', fruits: 'fruits',
  poisson: 'poissons', poissons: 'poissons', viande: 'poissons', viandes: 'poissons',
  boisson: 'boissons', boissons: 'boissons', jus: 'boissons',
  patisserie: 'patisserie', patisseries: 'patisserie', gateau: 'patisserie', gateaux: 'patisserie',
  epicerie: 'epicerie',
  traiteur: 'traiteur', service: 'traiteur', services: 'traiteur', 'service de traiteur': 'traiteur',
  evenement: 'evenements', evenements: 'evenements',
};

const clean = (raw: string) =>
  raw.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Unifie les catégories venant de la base (casse, accents, anciens noms
 * comme "repas", "Légumes", "service"...) vers les identifiants officiels.
 */
export const normalizeCategory = (raw?: string | null): ShopCategory | null => {
  if (!raw) return null;
  const c = clean(raw);
  const direct = CATEGORIES.find(cat => cat.id === c);
  return direct ? direct.id : ALIASES[c] ?? null;
};

/** Définition (libellé, icône, emoji, couleurs) d'une catégorie brute venant de la base. */
export const categoryOf = (raw?: string | null): CategoryDef => getCategory(normalizeCategory(raw));
