import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Database } from '../../types/supabase';

type DBOrder = Database['public']['Tables']['orders']['Row'];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Reçue',          color: '#92400E', bg: '#FEF3C7' },
  preparing: { label: 'En préparation', color: '#1e40af', bg: '#DBEAFE' },
  ready:     { label: 'Prêt à livrer',  color: '#166534', bg: '#DCFCE7' },
  delivered: { label: 'Livré',          color: '#5F5E5A', bg: '#F1EFE8' },
};

export default function OrdersScreen() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      if (user.role === 'admin') {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await api.getVendorOrders(user.id);
        setOrders(data);
      } catch (error) {
        console.error('Erreur chargement commandes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  if (loading) return <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />;

  const renderOrder = ({ item }: { item: DBOrder }) => {
    const cfg = STATUS_CONFIG[item.status || ''] || { label: item.status || 'Inconnu', color: '#000', bg: '#eee' };
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHead}>
          <View>
            <Text style={styles.orderId}>#{item.id.slice(0, 8)}</Text>
            <Text style={styles.orderClient}>{item.shipping_address}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={styles.orderFoot}>
          <Text style={styles.orderAmount}>
            {item.total_amount.toLocaleString()} F
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Commandes</Text>
        <Text style={styles.headerSub}>{orders.length} commandes</Text>
      </View>

      <View style={styles.filters}>
        {['all', 'pending', 'preparing', 'ready', 'delivered'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Toutes' : STATUS_CONFIG[f]?.label || f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderOrder}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Aucune commande</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },
  header:          { backgroundColor: COLORS.primary, padding: 16 },
  headerTitle:     { fontSize: 18, fontWeight: '600', color: COLORS.white },
  headerSub:       { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  filters:         { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 10, gap: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterBtn:       { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText:      { fontSize: 11, fontWeight: '500', color: COLORS.textSecondary },
  filterTextActive:{ color: COLORS.white },
  orderCard:       { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  orderHead:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId:         { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  orderClient:     { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  statusPill:      { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:      { fontSize: 11, fontWeight: '600' },
  orderFoot:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderAmount:     { fontSize: 13, fontWeight: '500', color: COLORS.textPrimary },
  emptyBox:        { padding: 40, alignItems: 'center' },
  emptyText:       { fontSize: 13, color: COLORS.textSecondary },
  listContent:     { padding: 16, gap: 10 },
  loader:          { flex: 1 },
});
