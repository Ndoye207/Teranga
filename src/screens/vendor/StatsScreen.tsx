import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';

type Review = { rating: number; comment: string | null; created_at: string; profiles: { full_name: string | null } | null };

export default function StatsScreen() {
  const { logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [ordersMonth, setOrdersMonth] = useState(0);
  const [revenueMonth, setRevenueMonth] = useState(0);
  const [satisfied, setSatisfied] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const vendor = await api.getMyVendor();
          if (!vendor) return;
          const since = new Date(); since.setDate(since.getDate() - 30);

          const [{ data: orders }, { data: ratings }] = await Promise.all([
            supabase.from('orders').select('total_amount, delivery_fee, status')
              .eq('vendor_id', vendor.id).gte('created_at', since.toISOString()).neq('status', 'cancelled'),
            supabase.from('ratings').select('rating, comment, created_at, profiles(full_name)')
              .eq('vendor_id', vendor.id).order('created_at', { ascending: false }),
          ]);
          setOrdersMonth(orders?.length ?? 0);
          setRevenueMonth((orders || []).reduce((a, o) => a + Math.max(0, o.total_amount - (o.delivery_fee || 0)), 0));
          const list = (ratings || []) as unknown as Review[];
          setCount(list.length);
          setAvg(list.length ? list.reduce((a, r) => a + r.rating, 0) / list.length : null);
          setSatisfied(list.length ? Math.round((list.filter(r => r.rating >= 4).length / list.length) * 100) : null);
          setReviews(list.filter(r => r.comment).slice(0, 10));
        } catch (err) {
          console.error('Erreur chargement statistiques:', err);
          Alert.alert('Erreur', 'Impossible de charger les statistiques.');
        } finally {
          setLoading(false);
        }
      };
      load();
    }, []),
  );

  const rounded = Math.round(avg ?? 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notes & Statistiques</Text>
        <Text style={styles.headerSub}>Derniers 30 jours</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
      ) : (
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Note globale */}
        <View style={styles.ratingCard}>
          <View style={styles.ratingMain}>
            <Text style={styles.ratingBig}>{avg !== null ? avg.toFixed(1) : '—'}</Text>
            <View>
              <Text style={styles.stars}>{'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}</Text>
              <Text style={styles.ratingLabel}>{count} avis au total</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{ordersMonth}</Text>
            <Text style={styles.statLabel}>Commandes (30 j)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.accent }]}>{revenueMonth.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Revenus (FCFA)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.success }]}>{satisfied !== null ? `${satisfied}%` : '—'}</Text>
            <Text style={styles.statLabel}>Clients satisfaits</Text>
          </View>
        </View>

        {/* Avis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avis récents</Text>
          {reviews.length === 0 && <Text style={styles.reviewDate}>Aucun avis pour le moment.</Text>}
          {reviews.map((r, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewHead}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>
                    {(r.profiles?.full_name || 'C').charAt(0)}
                  </Text>
                </View>
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewName}>{r.profiles?.full_name || 'Client'}</Text>
                  <Text style={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</Text>
                </View>
                <Text style={styles.reviewStars}>
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </Text>
              </View>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          ))}
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, paddingTop: 24, paddingBottom: 16, paddingHorizontal: 16 },
  headerTitle:     { fontSize: 18, fontWeight: '600', color: COLORS.white },
  headerSub:       { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  ratingCard:      { backgroundColor: COLORS.white, margin: 16, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  ratingMain:      { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ratingBig:       { fontSize: 48, fontWeight: '700', color: COLORS.primary },
  stars:           { fontSize: 20, color: '#F59E0B', letterSpacing: 2 },
  ratingLabel:     { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  topBadge:        { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10, alignItems: 'center' },
  topBadgeText:    { fontSize: 14, fontWeight: '600', color: '#92400E' },
  statsGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginBottom: 8 },
  statCard:        { flex: 1, minWidth: '45%', backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  statVal:         { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  statLabel:       { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  section:         { padding: 16, gap: 10 },
  sectionTitle:    { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  reviewCard:      { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  reviewHead:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar:    { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText:{ color: COLORS.white, fontWeight: '600', fontSize: 14 },
  reviewInfo:      { flex: 1 },
  reviewName:      { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  reviewDate:      { fontSize: 11, color: COLORS.textSecondary },
  reviewStars:     { fontSize: 13, color: '#F59E0B' },
  reviewComment:   { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  logoutBtn:       { margin: 16, marginTop: 4, marginBottom: 32, backgroundColor: '#FEE2E2', borderRadius: 12, padding: 14, alignItems: 'center' },
  logoutText:      { color: '#991B1B', fontWeight: '600', fontSize: 14 },
});