import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrderSubscription } from '../../hooks/useOrderSubscription';
import { Database } from '../../types/supabase';
import CourierCard from '../../components/CourierCard';

type OrderItem = Database['public']['Tables']['order_items']['Row'];
type DBOrder = Database['public']['Tables']['orders']['Row'] & {
  order_items?: Pick<OrderItem, 'id' | 'product_name' | 'quantity' | 'unit_price'>[];
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Nouvelle',       color: '#92400E', bg: '#FEF3C7' },
  confirmed:  { label: 'Acceptée',       color: '#1e40af', bg: '#DBEAFE' },
  preparing:  { label: 'En préparation', color: '#1e40af', bg: '#DBEAFE' },
  ready:      { label: 'Prête',          color: '#166534', bg: '#DCFCE7' },
  picked_up:  { label: 'Récupérée',      color: '#166534', bg: '#DCFCE7' },
  delivering: { label: 'En livraison',   color: '#166534', bg: '#DCFCE7' },
  delivered:  { label: 'Livrée',         color: '#5F5E5A', bg: '#F1EFE8' },
  cancelled:  { label: 'Refusée',        color: '#991B1B', bg: '#FEE2E2' },
};

// Action principale selon le statut (pending a deux boutons : Refuser / Accepter)
const NEXT_ACTION: Record<string, { label: string; next: 'preparing' | 'ready' }> = {
  confirmed: { label: 'Lancer la préparation', next: 'preparing' },
  preparing: { label: 'Marquer comme prête',   next: 'ready' },
};

const FILTERS = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

export default function OrdersScreen() {
  const { user } = useAuthStore();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const vendor = await api.getMyVendor();   // vendors.id ≠ profiles.id
      if (!vendor) { setLoading(false); return; }
      setVendorId(vendor.id);
      setOrders(await api.getVendorOrdersWithItems(vendor.id));
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useOrderSubscription(
    async (newOrder) => {
      if (vendorId && newOrder.vendor_id === vendorId) {
        try {
          // L'événement temps réel ne contient pas les articles : on les recharge
          const full = await api.getVendorOrderWithItems(newOrder.id);
          setOrders(prev => [full, ...prev.filter(o => o.id !== full.id)]);
        } catch {
          setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
        }
        Alert.alert('Nouvelle commande', `La commande #${newOrder.id.slice(0, 8)} vient d'arriver.`);
      }
    },
    (updated) => {
      if (vendorId && updated.vendor_id === vendorId) {
        setOrders(prev => prev.map(o => (o.id === updated.id ? { ...o, ...updated } : o)));
      }
    },
  );

  const changeStatus = async (
    id: string,
    status: 'confirmed' | 'cancelled' | 'preparing' | 'ready',
    reason?: string,
  ) => {
    setBusyId(id);
    try {
      const updated = await api.setVendorOrderStatus(id, status, reason);
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, ...updated } : o)));
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Action impossible pour le moment');
    } finally {
      setBusyId(null);
    }
  };

  const askRefuse = (id: string) => {
    Alert.alert('Refuser la commande ?', 'Choisissez le motif, le client sera informé.', [
      { text: 'Rupture de stock', onPress: () => changeStatus(id, 'cancelled', 'Rupture de stock') },
      { text: 'Trop de commandes', onPress: () => changeStatus(id, 'cancelled', 'Boutique trop occupée') },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  if (loading) return <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />;

  const renderOrder = ({ item }: { item: DBOrder }) => {
    const cfg = STATUS_CONFIG[item.status || ''] || { label: item.status || 'Inconnu', color: '#000', bg: '#eee' };
    const busy = busyId === item.id;
    const action = NEXT_ACTION[item.status || ''];
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHead}>
          <View style={styles.flex1}>
            <Text style={styles.orderId}>#{item.id.slice(0, 8)}</Text>
            <Text style={styles.orderClient}>{item.shipping_address}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {item.order_items && item.order_items.length > 0 && (
          <View style={styles.itemsBox}>
            {item.order_items.map(it => (
              <View key={it.id} style={styles.itemRow}>
                <Text style={styles.itemQty}>{it.quantity} ×</Text>
                <Text style={styles.itemName} numberOfLines={2}>{it.product_name}</Text>
                <Text style={styles.itemPrice}>{(it.unit_price * it.quantity).toLocaleString()} F</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.orderAmount}>Total : {item.total_amount.toLocaleString()} F</Text>
        {item.status === 'cancelled' && item.cancel_reason ? (
          <Text style={styles.reason}>Motif : {item.cancel_reason}</Text>
        ) : null}

        {/* Livreur assigné : le vendeur vérifie son identité avant de remettre la commande */}
        {item.livreur_id && ['ready', 'picked_up', 'delivering'].includes(item.status || '') && (
          <CourierCard key={`${item.id}:${item.livreur_id}`} orderId={item.id} variant="vendor" />
        )}

        {item.status === 'pending' && (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnRefuse]} disabled={busy}
              onPress={() => askRefuse(item.id)}
            >
              <Text style={styles.btnRefuseText}>Refuser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnAccept]} disabled={busy}
              onPress={() => changeStatus(item.id, 'confirmed')}
            >
              {busy ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnAcceptText}>Accepter</Text>}
            </TouchableOpacity>
          </View>
        )}

        {action && (
          <TouchableOpacity
            style={[styles.btn, styles.btnAction]} disabled={busy}
            onPress={() => changeStatus(item.id, action.next)}
          >
            {busy ? <ActivityIndicator color={COLORS.textPrimary} /> : <Text style={styles.btnActionText}>{action.label}</Text>}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Commandes</Text>
        <Text style={styles.headerSub}>
          {orders.length} commandes{pendingCount > 0 ? ` · ${pendingCount} à traiter` : ''}
        </Text>
      </View>

      <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
        <View>
          <FlatList
            horizontal
            data={FILTERS}
            keyExtractor={f => f}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
            renderItem={({ item: f }) => (
              <TouchableOpacity
                style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                  {f === 'all' ? 'Toutes' : STATUS_CONFIG[f]?.label || f}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{vendorId ? 'Aucune commande' : 'Créez votre boutique pour recevoir des commandes'}</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },
  flex1:           { flex: 1 },
  header:          { backgroundColor: COLORS.primary, paddingBottom: 16, paddingHorizontal: 16 },
  headerTitle:     { fontSize: 18, fontWeight: '600', color: COLORS.white },
  headerSub:       { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  filters:         { backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 10, gap: 6 },
  filterBtn:       { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText:      { fontSize: 12, fontWeight: '500', color: COLORS.textSecondary },
  filterTextActive:{ color: COLORS.white },
  orderCard:       { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  orderHead:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  orderId:         { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  orderClient:     { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  statusPill:      { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:      { fontSize: 11, fontWeight: '600' },
  orderAmount:     { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  reason:          { fontSize: 12, color: COLORS.danger },
  itemsBox:        { backgroundColor: COLORS.bg, borderRadius: 8, padding: 10, gap: 6 },
  itemRow:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemQty:         { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, minWidth: 28 },
  itemName:        { flex: 1, fontSize: 13, color: COLORS.textPrimary },
  itemPrice:       { fontSize: 12, color: COLORS.textSecondary },
  btnRow:          { flexDirection: 'row', gap: 8 },
  btn:             { flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnRefuse:       { borderWidth: 2, borderColor: COLORS.danger, backgroundColor: COLORS.white },
  btnRefuseText:   { color: '#991B1B', fontWeight: '700', fontSize: 14 },
  btnAccept:       { backgroundColor: COLORS.primary },
  btnAcceptText:   { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  btnAction:       { backgroundColor: COLORS.accent },
  btnActionText:   { color: COLORS.textPrimary, fontWeight: '700', fontSize: 14 },
  emptyBox:        { padding: 40, alignItems: 'center' },
  emptyText:       { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  listContent:     { padding: 16, gap: 10 },
  loader:          { flex: 1 },
});