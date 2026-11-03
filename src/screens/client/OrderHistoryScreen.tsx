import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import Icon from '../../components/Icon';
import { Card } from '../../components/Card';
import { COLORS } from '../../constants/colors';
import { useMyOrders } from '../../hooks/useMyOrders';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function OrderHistoryScreen({ navigation }: any) {
  const { history, ratedIds, loading, refreshing, refresh } = useMyOrders(navigation);

  const renderItem = ({ item }: { item: any }) => {
    const cancelled = item.status === 'cancelled';
    const rated = ratedIds.includes(item.id);
    const lines: { id: string; product_name: string; quantity: number }[] = item.order_items ?? [];

    return (
      <Card style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.shop} numberOfLines={1}>{item.vendors?.store_name || 'Boutique'}</Text>
          <View style={[styles.pill, cancelled ? styles.pillCancelled : styles.pillDone]}>
            <Text style={[styles.pillText, { color: cancelled ? '#991B1B' : '#15803D' }]}>
              {cancelled ? 'Refusée' : 'Livrée'}
            </Text>
          </View>
        </View>

        <Text style={styles.meta}>#{item.id.slice(0, 8)} · {formatDate(item.created_at)}</Text>

        {lines.length > 0 && (
          <Text style={styles.items} numberOfLines={3}>
            {lines.map(l => `${l.quantity} × ${l.product_name}`).join(', ')}
          </Text>
        )}

        <View style={styles.rowBetween}>
          <Text style={styles.total}>{item.total_amount.toLocaleString()} F</Text>

          {!cancelled && (rated ? (
            <View style={styles.ratedBox}>
              <Icon name="checkmark-circle" size={16} color="#22C55E" />
              <Text style={styles.ratedText}>Noté</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.rateBtn}
              onPress={() => navigation.navigate('Rating', {
                order: { id: item.id, vendorName: item.vendors?.store_name, hasLivreur: !!item.livreur_id },
              })}
            >
              <Icon name="star" size={14} color="#fff" />
              <Text style={styles.rateBtnText}>Noter</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique des commandes</Text>
      </View>

      <View style={styles.body}>
        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={o => o.id}
            renderItem={renderItem}
            contentContainerStyle={history.length === 0 ? styles.emptyContainer : styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
            ListEmptyComponent={
              <View style={styles.center}>
                <Icon name="receipt-outline" size={48} color={COLORS.border} />
                <Text style={styles.emptyTitle}>Aucune commande dans l'historique</Text>
                <Text style={styles.emptyText}>Vos commandes livrées et notées apparaîtront ici.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  backBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:    { fontSize: 18, fontWeight: '700', color: COLORS.white },
  body:           { flex: 1, backgroundColor: COLORS.bg },
  list:           { padding: 16, gap: 12 },
  emptyContainer: { flexGrow: 1 },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  emptyTitle:     { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  emptyText:      { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  card:           { gap: 8 },
  rowBetween:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  shop:           { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  pill:           { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  pillDone:       { backgroundColor: '#EDFBF3' },
  pillCancelled:  { backgroundColor: '#FEE2E2' },
  pillText:       { fontSize: 11, fontWeight: '700' },
  meta:           { fontSize: 12, color: COLORS.textSecondary },
  items:          { fontSize: 13, color: COLORS.textPrimary },
  total:          { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  ratedBox:       { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratedText:      { fontSize: 12, fontWeight: '600', color: '#15803D' },
  rateBtn:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  rateBtnText:    { color: COLORS.white, fontSize: 13, fontWeight: '700' },
});
