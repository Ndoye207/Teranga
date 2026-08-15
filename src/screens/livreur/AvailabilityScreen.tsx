import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList,
  StyleSheet, SafeAreaView, StatusBar, Switch, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { Database } from '../../types/supabase';

type DBOrder = Database['public']['Tables']['orders']['Row'] & {
    vendors: { store_name: string; address: string } | null;
};

export default function AvailabilityScreen({ _navigation }: any) {
  const { user } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<DBOrder[]>([]);

  useEffect(() => {
    if (isOnline) {
      loadCourses();
    }
  }, [isOnline]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await api.getAvailableCourses();
      setCourses(data as unknown as DBOrder[]);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bonjour, {user?.full_name?.split(' ')[0]}</Text>
          <Text style={styles.headerSub}>Espace livreur</Text>
        </View>
      </View>

      <View style={styles.toggleCard}>
        <View>
          <Text style={styles.toggleLabel}>Mon statut</Text>
          <Text style={[styles.toggleStatus, { color: isOnline ? COLORS.success : COLORS.danger }]}>
            {isOnline ? '● En ligne' : '● Hors ligne'}
          </Text>
        </View>
        <Switch value={isOnline} onValueChange={setIsOnline} trackColor={{ false: COLORS.border, true: COLORS.success }} thumbColor={COLORS.white} />
      </View>

      {isOnline ? (
      loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={courses}

            keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <View style={styles.courseCard}>
                <Text>Vendeur: {item.vendors?.store_name}</Text>
                <Text>Dest: {item.shipping_address}</Text>
                <Text>Prix: {item.total_amount} F</Text>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        )
      ) : (
        <View style={styles.offlineBox}>
          <Text style={styles.offlineTitle}>Vous êtes hors ligne</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.bg },
  header:        { backgroundColor: COLORS.primary, padding: 16 },
  headerTitle:   { fontSize: 18, fontWeight: '600', color: COLORS.white },
  headerSub:     { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  toggleCard:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, margin: 16, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  toggleLabel:   { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  toggleStatus:  { fontSize: 13, fontWeight: '500', marginTop: 4 },
  courseCard:    { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10, marginHorizontal: 16 },
  offlineBox:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  offlineTitle:  { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  listContent:   { padding: 16, gap: 10 },
  loader:        { marginTop: 20 },
});
