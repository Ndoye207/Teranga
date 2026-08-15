import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, Switch, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase'; // Import supabase
import { Database } from '../../types/supabase';

type DBOrder = Database['public']['Tables']['orders']['Row'];

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Reçue',          color: '#92400E', bg: '#FEF3C7' },
  preparing: { label: 'En préparation', color: '#1e40af', bg: '#DBEAFE' },
  ready:     { label: 'Prêt à livrer',  color: '#166534', bg: '#DCFCE7' },
};

export default function VendorDashboard({ navigation }: any) {
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
          setStats(statsData);
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
    // Optimistic update
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
      setIsOnline(!value); // Revert on error
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut de la boutique.');
    }
  };

  if (loading) return <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />;

  return (
    <SafeAreaView style={styles.container}>
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

      {!vendor ? (
        <View style={styles.centered}>
          <Text style={styles.text}>Vous n'avez pas encore de boutique.</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CreateShop')}>
            <Text style={styles.buttonText}>Créer ma boutique</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
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

          {/* Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{stats.ordersToday}</Text>
              <Text style={styles.statLabel}>Commandes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.accent }]}>
                {stats.revenueToday.toLocaleString()} F
              </Text>
              <Text style={styles.statLabel}>Revenus</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{(stats.rating || 0).toFixed(1)} / 5</Text>
              <Text style={styles.statLabel}>Note ({stats.totalRatings})</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, styles.addProductButton]} 
            onPress={() => navigation.navigate('AddProduct', { vendorId: vendor.id })}
          >
            <Text style={styles.buttonText}>Ajouter un produit</Text>
          </TouchableOpacity>

          {/* Commandes récentes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Commandes récentes</Text>
            {orders.map(order => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                  <View style={[
                    styles.statusPill,
                    { backgroundColor: STATUS_LABELS[order.status || '']?.bg },
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: STATUS_LABELS[order.status || '']?.color },
                    ]}>
                      {STATUS_LABELS[order.status || '']?.label || order.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.orderClient}>
                  {order.shipping_address}
                </Text>
                <View style={styles.orderBottom}>
                  <Text style={styles.orderAmount}>
                    {order.total_amount.toLocaleString()} F
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Commentaires */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Commentaires récents</Text>
            {comments.map((c: any, i: number) => (
                <View key={i} style={styles.orderCard}>
                    <Text style={{fontWeight:'bold'}}>{c.profiles?.full_name}</Text>
                    <Text>"{c.comment}"</Text>
                </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  header:       { backgroundColor: COLORS.primary, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:  { fontSize: 18, fontWeight: '600', color: COLORS.white },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  logoutBtn:    { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  logoutText:   { color: COLORS.white, fontSize: 12, fontWeight: '500' },
  toggleCard:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, margin: 16, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  toggleLabel:  { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  toggleStatus: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginBottom: 8 },
  statCard:     { flex: 1, minWidth: '45%', backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  statVal:      { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  statLabel:    { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  section:      { padding: 16, gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  orderCard:    { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 6 },
  orderTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId:      { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  statusPill:   { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  statusText:   { fontSize: 11, fontWeight: '600' },
  orderClient:  { fontSize: 12, color: COLORS.textSecondary },
  orderBottom:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderAmount:  { fontSize: 12, color: COLORS.textPrimary, fontWeight: '500' },
  readyBtn:     { backgroundColor: COLORS.success, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  readyBtnText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  loader:       { flex: 1 },
  centered:     { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  button:       { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center' },
  addProductButton: { margin: 16 },
  buttonText:   { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  text:         { fontSize: 16, color: COLORS.textPrimary },
});