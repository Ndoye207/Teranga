import React, { useState, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Switch, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';
import { Database } from '../../types/supabase';

type DBOrder = Database['public']['Tables']['orders']['Row'];

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Reçue',          color: '#92400E', bg: '#FEF3C7' },
  preparing: { label: 'En préparation', color: '#1e40af', bg: '#DBEAFE' },
  ready:     { label: 'Prêt à livrer',  color: '#166534', bg: '#DCFCE7' },
};

export default function VendorDashboard({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ ordersToday: 0, revenueToday: 0, rating: 0, totalRatings: 0 });
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [vendor, setVendor] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('*')
          .eq('profile_id', user.id)
          .single();
        
        setVendor(vendorData);
        if (vendorData) {
          setIsOnline(vendorData.is_open ?? false);
          
          const [statsData, ordersData, commentsData] = await Promise.all([
            api.getVendorStats(vendorData.id),
            api.getVendorOrders(vendorData.id),
            supabase.from('ratings').select('rating, comment, profiles(full_name)').eq('vendor_id', vendorData.id).limit(5)
          ]);
          setStats(statsData as any);
          setOrders(ordersData);
          setComments(commentsData.data || []);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const toggleShopStatus = async (value: boolean) => {
    setIsOnline(value);
    if (!vendor) return;

    try {
      const { error } = await supabase
        .from('vendors')
        .update({ is_open: value })
        .eq('id', vendor.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating shop status:', error);
      setIsOnline(!value);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut de la boutique.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loaderContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bonjour, {user?.full_name?.split(' ')[0]}</Text>
          <Text style={styles.headerSub}>Tableau de bord vendeur</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Déco</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
        {!vendor ? (
          <View style={styles.centered}>
            <Text style={styles.text}>Vous n'avez pas encore de boutique.</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CreateShop')}>
              <Text style={styles.buttonText}>Créer ma boutique</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Toggle en ligne */}
            <View style={styles.toggleCard}>
              <View>
                <Text style={styles.toggleLabel}>Statut de ma boutique</Text>
                <Text style={[
                  styles.toggleStatus,
                  { color: isOnline ? COLORS.success : COLORS.danger },
                ]}>
                  {isOnline ? '● En ligne' : '● Hors ligne'}
                </Text>
              </View>
              <Switch
                value={isOnline}
                onValueChange={toggleShopStatus}
                trackColor={{ false: COLORS.border, true: COLORS.success }}
                thumbColor={COLORS.white}
              />
            </View>

            {/* Statistiques rapides */}
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{stats.ordersToday}</Text>
              <Text style={styles.statLabel}>Commandes</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: COLORS.accent }]}>
                {stats.revenueToday.toLocaleString()} F
              </Text>
              <Text style={styles.statLabel}>Revenus</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: COLORS.primary }]}>
                {stats.rating} / 5
              </Text>
              <Text style={styles.statLabel}>Note ({stats.totalRatings} avis)</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddProduct')}>
              <Text style={styles.buttonText}>Ajouter un produit</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Commandes récentes</Text>
            {orders.length === 0 ? (
              <Text style={styles.emptyText}>Aucune commande récente.</Text>
            ) : (
              orders.slice(0, 3).map(o => (
                <View key={o.id} style={styles.orderRow}>
                  <View>
                    <Text style={styles.orderId}>#{o.id.slice(-5)}</Text>
                    <Text style={styles.orderAmount}>{o.total_amount} F</Text>
                  </View>
                  <View style={[
                    styles.badge,
                    { backgroundColor: STATUS_LABELS[o.status || '']?.bg || '#f3f4f6' }
                  ]}>
                    <Text style={[
                      styles.badgeText,
                      { color: STATUS_LABELS[o.status || '']?.color || '#374151' }
                    ]}>
                      {STATUS_LABELS[o.status || '']?.label || o.status}
                    </Text>
                  </View>
                </View>
              ))
            )}

            <Text style={styles.sectionTitle}>Commentaires récents</Text>
            {comments.length === 0 ? (
              <Text style={styles.emptyText}>Aucun commentaire pour le moment.</Text>
            ) : (
              comments.map((c, i) => (
                <View key={i} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{c.profiles?.full_name || 'Client'}</Text>
                    <Text style={styles.commentRating}>⭐ {c.rating}/5</Text>
                  </View>
                  <Text style={styles.commentText}>{c.comment || 'Pas de commentaire.'}</Text>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  flex1:        { flex: 1 },
  loaderContainer: { justifyContent: 'center', alignItems: 'center' },
  header:       { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:  { fontSize: 18, fontWeight: '700', color: COLORS.white },
  headerSub:    { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  logoutBtn:    { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText:   { color: COLORS.white, fontWeight: '600', fontSize: 13 },
  scrollContent:{ padding: 16, gap: 14 },
  toggleCard:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  toggleLabel:  { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  toggleStatus: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  statCard:     { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  statNum:      { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  statLabel:    { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  button:       { backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 6 },
  buttonText:   { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginTop: 10, marginBottom: 4 },
  emptyText:    { fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic' },
  orderRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  orderId:      { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  orderAmount:  { fontSize: 13, color: COLORS.accent, fontWeight: '600', marginTop: 2 },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText:    { fontSize: 12, fontWeight: '600' },
  commentCard:  { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 6 },
  commentHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentAuthor:{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  commentRating:{ fontSize: 13, fontWeight: '600', color: '#F59E0B' },
  commentText:  { fontSize: 13, color: COLORS.textSecondary },
  centered:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  text:         { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
});
