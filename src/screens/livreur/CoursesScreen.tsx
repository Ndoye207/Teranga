import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { api } from '../../services/api';
import { useOrderSubscription } from '../../hooks/useOrderSubscription';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  ready:       { label: 'Disponible',  color: '#1e40af', bg: '#DBEAFE' },
  picked_up:   { label: 'En cours',    color: '#92400E', bg: '#FEF3C7' },
  delivering:  { label: 'En cours',    color: '#92400E', bg: '#FEF3C7' },
  delivered:   { label: 'Terminée',    color: '#166534', bg: '#DCFCE7' },
  pending:     { label: 'En attente',  color: '#5F5E5A', bg: '#F1EFE8' },
  confirmed:   { label: 'Confirmée',   color: '#1e40af', bg: '#DBEAFE' },
  preparing:   { label: 'En cuisine',  color: '#92400E', bg: '#FEF3C7' },
};

export default function CoursesScreen({ navigation }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.getAllCourses();
      setOrders(data || []);
    } catch (error) {
      console.error('Erreur chargement courses:', error);
    }
  };

  useOrderSubscription(
    (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
    },
    (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    }
  );

  const filtered = orders.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'available') return o.status === 'ready';
    if (filter === 'in_progress') return o.status === 'picked_up' || o.status === 'delivering';
    if (filter === 'done') return o.status === 'delivered';
    return true;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes courses</Text>
        <Text style={styles.headerSub}>{filtered.length} courses</Text>
      </View>

      <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
        {/* Filtres */}
        <View style={styles.filters}>
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'available', label: 'Dispo' },
            { id: 'in_progress', label: 'En cours' },
            { id: 'done', label: 'Terminées' },
          ].map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterBtn, filter === f.id && styles.filterBtnActive]}
              onPress={() => setFilter(f.id)}
            >
              <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const cfg = STATUS_CFG[item.status] || { label: item.status, color: '#000', bg: '#eee' };
            return (
              <TouchableOpacity
                style={styles.courseCard}
                onPress={() => navigation.navigate('CourseDetail', { course: item })}
              >
                <View style={styles.courseHead}>
                  <Text style={styles.courseId}>#{item.id.slice(0, 8)}</Text>
                  <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <View style={styles.courseBody}>
                  <Text style={styles.courseVendor} numberOfLines={1}>{item.vendors?.store_name || 'Boutique'}</Text>
                  <Text style={styles.courseArrow}>→</Text>
                  <Text style={styles.courseClient} numberOfLines={1}>{item.shipping_address || 'Adresse'}</Text>
                </View>
                <View style={styles.courseFoot}>
                  <Text style={styles.courseDist}>-- km</Text>
                  <Text style={styles.courseFee}>+{item.total_amount} F</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Aucune course trouvée</Text>
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
  header:          { backgroundColor: COLORS.primary, paddingBottom: 16, paddingHorizontal: 16, paddingTop: 6 },
  headerTitle:     { fontSize: 18, fontWeight: '600', color: COLORS.white },
  headerSub:       { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  filters:         { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 10, gap: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterBtn:       { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText:      { fontSize: 11, fontWeight: '500', color: COLORS.textSecondary },
  filterTextActive:{ color: COLORS.white },
  courseCard:      { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  courseHead:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  courseId:        { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  statusPill:      { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  statusText:      { fontSize: 11, fontWeight: '600' },
  courseBody:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  courseVendor:    { fontSize: 13, fontWeight: '500', color: COLORS.primary, flex: 1 },
  courseArrow:     { fontSize: 14, color: COLORS.accent, fontWeight: '600' },
  courseClient:    { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  courseFoot:      { flexDirection: 'row', justifyContent: 'space-between' },
  courseDist:      { fontSize: 12, color: COLORS.textSecondary },
  courseFee:       { fontSize: 13, fontWeight: '600', color: COLORS.success },
  emptyBox:        { padding: 40, alignItems: 'center' },
  emptyText:       { fontSize: 13, color: COLORS.textSecondary },
  listContent:     { padding: 16, gap: 10 },
});
