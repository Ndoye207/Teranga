import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../services/supabase';

type Counts = { users: number; vendors: number; orders: number; pending: number; delivered: number };

const count = async (table: 'profiles' | 'vendors' | 'orders', status?: string) => {
  let q = supabase.from(table).select('id', { count: 'exact', head: true });
  if (status) q = q.eq('status', status);
  const { count: c, error } = await q;
  if (error) throw error;
  return c ?? 0;
};

export const AdminDashboard = () => {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [users, vendors, orders, pending, delivered] = await Promise.all([
        count('profiles'), count('vendors'), count('orders'),
        count('orders', 'pending'), count('orders', 'delivered'),
      ]);
      setCounts({ users, vendors, orders, pending, delivered });
    } catch (err) {
      console.error('Erreur dashboard admin:', err);
      Alert.alert('Erreur', 'Impossible de charger les statistiques (droits admin requis).');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const cards: [string, number | undefined][] = [
    ['Utilisateurs', counts?.users],
    ['Boutiques', counts?.vendors],
    ['Commandes', counts?.orders],
    ['En attente', counts?.pending],
    ['Livrées', counts?.delivered],
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <Text style={styles.title}>Tableau de bord Admin</Text>
        {!counts ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 24 }} />
        ) : (
          <View style={styles.grid}>
            {cards.map(([label, value]) => (
              <View key={label} style={styles.card}>
                <Text style={styles.value}>{value ?? 0}</Text>
                <Text style={styles.label}>{label}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', backgroundColor: COLORS.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  value: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  label: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
});
