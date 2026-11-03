import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';

type Delivered = {
  id: string; total_amount: number; delivery_fee: number | null;
  shipping_address: string; updated_at: string; created_at: string;
};

const startOfDay = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const startOfWeek = () => { const d = startOfDay(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; };
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function RevenusScreen() {
  const { user, logout } = useAuthStore();
  const [rows, setRows] = useState<Delivered[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setRows(await api.getDeliveredByCourier(user.id));
      const { data } = await supabase.from('ratings').select('rating').eq('livreur_id', user.id);
      if (data && data.length > 0) {
        setRating(data.reduce((a, r) => a + r.rating, 0) / data.length);
      }
    } catch (err) {
      console.error('Erreur chargement revenus:', err);
      Alert.alert('Erreur', 'Impossible de charger vos revenus.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const fee = (r: Delivered) => r.delivery_fee ?? 0;
  const todayRows = rows.filter(r => new Date(r.updated_at) >= startOfDay());
  const weekRows = rows.filter(r => new Date(r.updated_at) >= startOfWeek());
  const sum = (list: Delivered[]) => list.reduce((a, r) => a + fee(r), 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Revenus & Notes</Text>
        <Text style={styles.headerSub}>{user?.full_name || 'Livreur'}</Text>
      </View>

      <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
        ) : (
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Stats principales */}
          <View style={styles.mainStats}>
            <View style={styles.mainStatCard}>
              <Text style={styles.mainStatLabel}>Aujourd'hui</Text>
              <Text style={styles.mainStatVal}>{sum(todayRows).toLocaleString()} F</Text>
            </View>
            <View style={styles.mainStatCard}>
              <Text style={styles.mainStatLabel}>Cette semaine</Text>
              <Text style={[styles.mainStatVal, { color: COLORS.accent }]}>{sum(weekRows).toLocaleString()} F</Text>
            </View>
          </View>

          {/* Stats secondaires */}
          <View style={styles.secondaryStats}>
            <View style={styles.secondaryCard}>
              <Text style={styles.secondaryVal}>{rows.length}</Text>
              <Text style={styles.secondaryLabel}>Livraisons réussies</Text>
            </View>
            <View style={styles.secondaryCard}>
              <Text style={[styles.secondaryVal, styles.ratingText]}>
                {rating !== null ? `${rating.toFixed(1)} ★` : '—'}
              </Text>
              <Text style={styles.secondaryLabel}>Note moyenne</Text>
            </View>
            <View style={styles.secondaryCard}>
              <Text style={[styles.secondaryVal, { color: COLORS.success }]}>{sum(rows).toLocaleString()} F</Text>
              <Text style={styles.secondaryLabel}>Total gagné</Text>
            </View>
          </View>

          {/* Badge : affiché seulement s'il est mérité */}
          {rating !== null && rating >= 4.5 && rows.length >= 20 && (
            <View style={styles.badgeCard}>
              <Text style={styles.badgeEmoji}>🏆</Text>
              <View>
                <Text style={styles.badgeTitle}>Top livreur</Text>
                <Text style={styles.badgeSub}>Note ≥ 4.5 · 20+ livraisons</Text>
              </View>
            </View>
          )}

          {/* Historique */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historique des courses</Text>
            {rows.length === 0 && (
              <Text style={styles.historyAddr}>Aucune course terminée pour le moment.</Text>
            )}
            {rows.slice(0, 30).map(item => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyLeft}>
                  <View style={styles.historyIcon}>
                    <Text style={styles.historyIconText}>🛵</Text>
                  </View>
                  <View>
                    <Text style={styles.historyClient}>#{item.id.slice(0, 8)}</Text>
                    <Text style={styles.historyAddr} numberOfLines={1}>{item.shipping_address} · {fmtDate(item.updated_at)}</Text>
                  </View>
                </View>
                <Text style={styles.historyFee}>+{fee(item)} F</Text>
              </View>
            ))}
          </View>

          {/* Déconnexion */}
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>

        </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bg },
  flex1:          { flex: 1 },
  header:         { backgroundColor: COLORS.primary, paddingTop: 6, paddingBottom: 16, paddingHorizontal: 16 },
  headerTitle:    { fontSize: 18, fontWeight: '600', color: COLORS.white },
  headerSub:      { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  mainStats:      { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8 },
  mainStatCard:   { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  mainStatLabel:  { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  mainStatVal:    { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  secondaryStats: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 8 },
  secondaryCard:  { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  secondaryVal:   { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  secondaryLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
  badgeCard:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FEF3C7', marginHorizontal: 16, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FCD34D', marginBottom: 8 },
  badgeEmoji:     { fontSize: 28 },
  badgeTitle:     { fontSize: 14, fontWeight: '600', color: '#92400E' },
  badgeSub:       { fontSize: 12, color: '#B45309', marginTop: 2 },
  section:        { padding: 16, gap: 8 },
  sectionTitle:   { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  historyCard:    { backgroundColor: COLORS.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyLeft:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  historyIcon:    { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  historyClient:  { fontSize: 13, fontWeight: '500', color: COLORS.textPrimary },
  historyAddr:    { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  historyFee:     { fontSize: 14, fontWeight: '700', color: COLORS.success },
  ratingText:     { color: '#F59E0B' },
  historyIconText:{ fontSize: 18 },
  logoutBtn:      { margin: 16, marginBottom: 32, backgroundColor: '#FEE2E2', borderRadius: 12, padding: 14, alignItems: 'center' },
  logoutText:     { color: '#991B1B', fontWeight: '600', fontSize: 14 },
});
