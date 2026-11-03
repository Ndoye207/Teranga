import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useOrderSubscription } from './useOrderSubscription';

function parseIds(raw: string | null): string[] {
  try {
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/**
 * Commandes du client, séparées en :
 *  - en cours  : pas encore livrées, OU livrées mais pas encore notées, OU refusées non acquittées
 *  - historique : livrées et notées, ou que le client a mises de côté (« Plus tard » / « J'ai compris »)
 */
export function useMyOrders(navigation?: any) {
  const userId = useAuthStore(s => s.user?.id);
  const [orders, setOrders] = useState<any[]>([]);
  const [ratedIds, setRatedIds] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const storageKey = `dismissed_orders_${userId}`;

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const [mine, rated, raw] = await Promise.all([
        api.getMyOrders(userId),
        api.getMyRatedOrderIds(userId).catch((e) => {
          console.warn('Lecture des avis impossible :', e);
          return [] as string[];
        }),
        AsyncStorage.getItem(`dismissed_orders_${userId}`).catch(() => null),
      ]);
      setOrders(mine);
      setRatedIds(rated);
      setDismissed(parseIds(raw));
    } catch (err) {
      console.error('Erreur chargement commandes client:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!navigation) return;
    return navigation.addListener('focus', load);
  }, [navigation, load]);

  // Temps réel : tout changement sur une de MES commandes recharge la liste
  useOrderSubscription(
    (o) => { if (o.buyer_id === userId) load(); },
    (o) => { if (o.buyer_id === userId) load(); },
  );

  const refresh = useCallback(() => { setRefreshing(true); load(); }, [load]);

  /** Met la commande de côté : elle passe dans l'historique. */
  const dismiss = useCallback((orderId: string) => {
    setDismissed(prev => {
      const next = prev.includes(orderId) ? prev : [...prev, orderId];
      AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [storageKey]);

  const { active, history } = useMemo(() => {
    const rated = new Set(ratedIds);
    const isActive = (o: any) => {
      if (dismissed.includes(o.id)) return false;
      if (o.status === 'delivered') return !rated.has(o.id);
      return true; // en cours, ou refusée pas encore acquittée
    };
    return {
      active: orders.filter(isActive),
      history: orders.filter(o => !isActive(o)),
    };
  }, [orders, ratedIds, dismissed]);

  return { active, history, ratedIds, loading, refreshing, refresh, dismiss };
}
