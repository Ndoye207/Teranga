import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/colors';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrderSubscription } from '../../hooks/useOrderSubscription';
import { useCourierProfile } from '../../hooks/useCourierProfile';
import Icon from '../../components/Icon';

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
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const { hasProfile, refresh: refreshProfile } = useCourierProfile();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Courses ignorées : mémorisées sur le téléphone
  useEffect(() => {
    if (!user) return;
    AsyncStorage.getItem(`dismissed_courses_${user.id}`)
      .then(v => v && setDismissed(JSON.parse(v)))
      .catch(() => {});
  }, [user]);

  useEffect(() => navigation.addListener('focus', refreshProfile), [navigation, refreshProfile]);

  useEffect(() => {
    if (hasProfile) {
      fetchOrders();
    }
  }, [hasProfile]);

  const fetchOrders = async () => {
    try {
      if (!user) return;
      const data = await api.getCoursesForCourier(user.id);
      setOrders(data || []);
    } catch (error) {
      console.error('Erreur chargement courses:', error);
      Alert.alert('Erreur', 'Impossible de charger les courses. Vérifiez votre connexion.');
    }
  };

  useOrderSubscription(
    () => { if (hasProfile) fetchOrders(); },
    () => { if (hasProfile) fetchOrders(); },
  );

  const ignoreCourse = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    if (user) AsyncStorage.setItem(`dismissed_courses_${user.id}`, JSON.stringify(next)).catch(() => {});
  };

  const acceptCourse = (item: any) => {
    Alert.alert('Accepter cette course ?', `${item.vendors?.store_name || 'Boutique'} → ${item.shipping_address || 'client'}`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Accepter',
        onPress: async () => {
          setBusyId(item.id);
          try {
            const updated = await api.acceptCourse(item.id);
            const course = { ...item, ...updated };
            setOrders(prev => prev.map(o => (o.id === item.id ? course : o)));
            navigation.navigate('CourseDetail', { course });
          } catch (err: any) {
            Alert.alert('Course indisponible', err?.message || 'Impossible de prendre cette course');
            fetchOrders();
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  const isAvailable = (o: any) => o.status === 'ready' && !o.livreur_id;
  const isMine = (o: any) => o.livreur_id === user?.id;

  const filtered = orders.filter(o => {
    if (isAvailable(o) && dismissed.includes(o.id)) return false;
    if (filter === 'available') return isAvailable(o);
    if (filter === 'in_progress') return isMine(o) && o.status !== 'delivered';
    if (filter === 'done') return isMine(o) && o.status === 'delivered';
    return true;
  });

  if (hasProfile === null) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: COLORS.primary }]}>
        <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes courses</Text>
        <Text style={styles.headerSub}>{hasProfile ? `${filtered.length} courses` : 'Profil non configuré'}</Text>
      </View>

      <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
        {!hasProfile ? (
          <View style={styles.onboardingContainer}>
            <View style={styles.onboardingIconBox}>
              <Icon name="bicycle" size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.onboardingTitle}>Devenez Livreur Partenaire</Text>
            <Text style={styles.onboardingText}>
              Configurez votre profil de livraison pour voir et accepter les courses disponibles.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('CreateCourier')}>
              <Text style={styles.primaryButtonText}>Configurer mon profil</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Filtres */}
            <View style={styles.filters}>
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'available', label: 'Disponibles' },
                { id: 'in_progress', label: 'Mes courses' },
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
                const cfg = isAvailable(item)
                  ? STATUS_CFG.ready
                  : (STATUS_CFG[item.status] || { label: item.status, color: '#000', bg: '#eee' });
                const busy = busyId === item.id;
                return (
                  <TouchableOpacity
                    style={styles.courseCard}
                    activeOpacity={isMine(item) ? 0.7 : 1}
                    onPress={() => { if (isMine(item)) navigation.navigate('CourseDetail', { course: item }); }}
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
                      <Text style={styles.courseDist}>Total commande : {item.total_amount} F</Text>
                      <Text style={styles.courseFee}>Gain : +{item.delivery_fee ?? 0} F</Text>
                    </View>
                    {isAvailable(item) && (
                      <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.actionBtn, styles.ignoreBtn]} disabled={busy} onPress={() => ignoreCourse(item.id)}>
                          <Text style={styles.ignoreText}>Ignorer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} disabled={busy} onPress={() => acceptCourse(item)}>
                          {busy ? <ActivityIndicator color={COLORS.textPrimary} /> : <Text style={styles.acceptText}>Accepter</Text>}
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>Aucune course trouvée</Text>
                </View>
              }
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionRow:          { flexDirection: 'row', gap: 8 },
  actionBtn:          { flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ignoreBtn:          { borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.white },
  ignoreText:         { color: COLORS.textSecondary, fontWeight: '700', fontSize: 14 },
  acceptBtn:          { backgroundColor: COLORS.accent },
  acceptText:         { color: COLORS.textPrimary, fontWeight: '700', fontSize: 14 },
  container:          { flex: 1, backgroundColor: COLORS.bg },
  flex1:              { flex: 1 },
  center:             { justifyContent: 'center', alignItems: 'center' },
  header:             { backgroundColor: COLORS.primary, paddingBottom: 16, paddingHorizontal: 16, paddingTop: 6 },
  headerTitle:        { fontSize: 18, fontWeight: '600', color: COLORS.white },
  headerSub:          { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  filters:            { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 10, gap: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterBtn:          { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  filterBtnActive:    { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText:         { fontSize: 11, fontWeight: '500', color: COLORS.textSecondary },
  filterTextActive:   { color: COLORS.white },
  listContent:        { padding: 16, gap: 12 },
  courseCard:         { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  courseHead:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  courseId:           { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  statusPill:         { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  statusText:         { fontSize: 11, fontWeight: '600' },
  courseBody:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  courseVendor:       { fontSize: 13, fontWeight: '500', color: COLORS.primary, flex: 1 },
  courseArrow:        { fontSize: 14, color: COLORS.accent, fontWeight: '600' },
  courseClient:       { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  courseFoot:         { flexDirection: 'row', justifyContent: 'space-between' },
  courseDist:         { fontSize: 12, color: COLORS.textSecondary },
  courseFee:          { fontSize: 13, fontWeight: '600', color: COLORS.success },
  emptyBox:           { padding: 40, alignItems: 'center' },
  emptyText:          { fontSize: 13, color: COLORS.textSecondary },
  onboardingContainer:{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, gap: 16 },
  onboardingIconBox:  { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  onboardingTitle:    { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  onboardingText:     { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  primaryButton:      { backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 24, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 10 },
  primaryButtonText:  { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});