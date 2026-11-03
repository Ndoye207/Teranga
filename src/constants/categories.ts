/**
 * Catégories de produits — SOURCE UNIQUE pour toute l'application.
 * Pour en ajouter une : ajoutez une ligne ici (et son id dans sql/003_categories.sql).
 * Les écrans client, vendeur, panier et formulaire s'en servent tous.
 */
export interface CategoryDef {
  id: string;
  /** Libellé court (onglets, filtres) */
  label: string;
  /** Libellé complet (formulaire vendeur) */
  fullLabel: string;
  /** Icône Ionicons */
  icon: string;
  emoji: string;
  /** Fond clair et couleur d'icône pour les pastilles */
  bg: string;
  color: string;
}

export const CATEGORIES = [
  { id: 'plats',       label: 'Plats',        fullLabel: 'Repas / Plats',        icon: 'restaurant', emoji: '🍛', bg: '#FEF0E8', color: '#E8834A' },
  { id: 'legumes',     label: 'Légumes',      fullLabel: 'Légumes',              icon: 'leaf',       emoji: '🥬', bg: '#EDFBF3', color: '#22C55E' },
  { id: 'fruits',      label: 'Fruits',       fullLabel: 'Fruits',               icon: 'nutrition',  emoji: '🍎', bg: '#FEECEC', color: '#EF4444' },
  { id: 'poissons',    label: 'Poissons',     fullLabel: 'Poissons & viandes',   icon: 'fish',       emoji: '🐟', bg: '#E8F3FB', color: '#0EA5E9' },
  { id: 'boissons',    label: 'Boissons',     fullLabel: 'Boissons & jus',       icon: 'cafe',       emoji: '🥤', bg: '#E6F7F7', color: '#14B8A6' },
  { id: 'patisserie',  label: 'Pâtisserie',   fullLabel: 'Pâtisserie',           icon: 'ice-cream',  emoji: '🥐', bg: '#FDF2F8', color: '#EC4899' },
  { id: 'epicerie',    label: 'Épicerie',     fullLabel: 'Épicerie',             icon: 'basket',     emoji: '🛒', bg: '#FEF9E7', color: '#CA8A04' },
  { id: 'traiteur',    label: 'Traiteur',     fullLabel: 'Service de traiteur',  icon: 'people',     emoji: '🍽️', bg: '#F3EEFB', color: '#8B5CF6' },
  { id: 'evenements',  label: 'Événements',   fullLabel: 'Événements',           icon: 'balloon',    emoji: '🎉', bg: '#EEF2FF', color: '#6366F1' },
] as const satisfies readonly CategoryDef[];

export type ShopCategory = (typeof CATEGORIES)[number]['id'];

export const CATEGORY_IDS: string[] = CATEGORIES.map(c => c.id);

const DEFAULT_CATEGORY: CategoryDef = {
  id: 'other', label: 'Autre', fullLabel: 'Autre', icon: 'bag-handle',
  emoji: '🛒', bg: '#E8F0FB', color: '#1B3A6B',
};

export const getCategory = (id?: string | null): CategoryDef =>
  (CATEGORIES.find(c => c.id === id) as CategoryDef | undefined) ?? DEFAULT_CATEGORY;
