import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../services/supabase';
import { Order } from '../../types';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  ready:       { label: 'Disponible',  color: '#1e40af', bg: '#DBEAFE' },
  picked_up:   { label: 'En cours',    color: '#92400E', bg: '#FEF3C7' },
  delivering:  { label: 'En cours',    color: '#92400E', bg: '#FEF3C7' },
  delivered:   { label: 'Terminée',    color: '#166534', bg: '#DCFCE7' },
};

export default function CoursesScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) {
      Alert.alert('Erreur', 'Impossible de charger les courses');
    } else {
      setOrders((data as any) || []);
    }
  };

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter || (filter === 'available' && o.status === 'ready') || (filter === 'in_progress' && (o.status === 'picked_up' || o.status === 'delivering')) || (filter === 'done' && o.status === 'delivered'));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes courses</Text>
        <Text style={styles.headerSub}>{orders.length} courses</Text>
      </View>

      {/* Filtres */}
      <View style={styles.filters}>
        {['all', 'available', 'in_progress', 'done'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Toutes' : f === 'available' ? 'Dispo' : f === 'in_progress' ? 'En cours' : 'Terminées'}
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
          const cfg = STATUS_CFG[item.status];
          return (
            <TouchableOpacity
              style={styles.courseCard}
              onPress={() => navigation.navigate('CourseDetail', { course: item })}
            >
              <View style={styles.courseHead}>
                <Text style={styles.courseId}>#{item.id}</Text>
                <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>
              <View style={styles.courseBody}>
                <Text style={styles.courseVendor}>{item.vendorName}</Text>
                <Text style={styles.courseArrow}>→</Text>
                <Text style={styles.courseClient}>{item.deliveryAddress}</Text>
              </View>
              <View style={styles.courseFoot}>
                <Text style={styles.courseDist}>-- km</Text>
                <Text style={styles.courseFee}>+{item.totalAmount} F</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Aucune course</Text>
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
  courseVendor:    { fontSize: 13, fontWeight: '500', color: COLORS.primary },
  courseArrow:     { fontSize: 14, color: COLORS.accent, fontWeight: '600' },
  courseClient:    { fontSize: 13, color: COLORS.textSecondary },
  courseFoot:      { flexDirection: 'row', justifyContent: 'space-between' },
  courseDist:      { fontSize: 12, color: COLORS.textSecondary },
  courseFee:       { fontSize: 13, fontWeight: '600', color: COLORS.success },
  emptyBox:        { padding: 40, alignItems: 'center' },
  emptyText:       { fontSize: 13, color: COLORS.textSecondary },
  listContent:     { padding: 16, gap: 10 },
});