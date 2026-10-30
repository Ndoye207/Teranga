import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Switch, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { useOrderSubscription } from '../../hooks/useOrderSubscription';
import { useCourierProfile } from '../../hooks/useCourierProfile';
import { Database } from '../../types/supabase';
import Icon from '../../components/Icon';

type DBOrder = Database['public']['Tables']['orders']['Row'] & {
    vendors: { store_name: string; address: string } | null;
};

export default function AvailabilityScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<DBOrder[]>([]);
  const { hasProfile, refresh: refreshProfile } = useCourierProfile();
  const [busyId, setBusyId] = useState<string | null>(null);

  // Au retour de l'écran de configuration du profil
  useEffect(() => navigation.addListener('focus', refreshProfile), [navigation, refreshProfile]);

  useEffect(() => {
    if (hasProfile) {
      loadAvailableCourses();
    }
  }, [hasProfile]);

  useOrderSubscription(
    (newOrder) => {
      if (isOnline && hasProfile) {
        loadAvailableCourses();
        Alert.alert('🛵 Nouvelle course !', `Une nouvelle course est disponible.`);
      }
    },
    (updatedOrder) => {
      if (isOnline && hasProfile) {
        loadAvailableCourses();
      }
    }
  );

  const loadAvailableCourses = async () => {
    setLoading(true);
    try {
      const data = await api.getAvailableCourses();
      setCourses(data as DBOrder[]);
    } catch (error) {
      console.error('Erreur chargement courses:', error);
      Alert.alert('Erreur', 'Impossible de charger les courses. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const acceptCourse = (item: DBOrder) => {
    Alert.alert('Accepter cette course ?', `${item.vendors?.store_name || 'Boutique'} → ${item.shipping_address || 'client'}`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Accepter',
        onPress: async () => {
          setBusyId(item.id);
          try {
            const updated = await api.acceptCourse(item.id);
            navigation.navigate('CourseDetail', { course: { ...item, ...updated } });
          } catch (err: any) {
            Alert.alert('Course indisponible', err?.message || 'Impossible de prendre cette course');
          } finally {
            setBusyId(null);
            loadAvailableCourses();
          }
        },
      },
    ]);
  };

  if (hasProfile === null) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: COLORS.primary }]}>
        <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />

      <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 16) }]}>
          <View>
            <Text style={styles.headerTitle}>Espace Livreur</Text>
            <Text style={styles.headerSub}>{user?.full_name ? `Connecté en tant que ${user.full_name}` : 'Tableau de bord'}</Text>
          </View>
          <TouchableOpacity style={styles.configBtn} onPress={() => navigation.navigate(hasProfile ? 'CourierSettings' : 'CreateCourier')}>
            <Icon name="person-outline" size={16} color={COLORS.white} />
            <Text style={styles.configBtnText}>Profil</Text>
          </TouchableOpacity>
        </View>

        {!hasProfile ? (
          <View style={styles.onboardingContainer}>
            <View style={styles.onboardingIconBox}>
              <Icon name="bicycle" size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.onboardingTitle}>Devenez Livreur Partenaire</Text>
            <Text style={styles.onboardingText}>
              Configurez votre profil de livraison pour commencer à accepter des courses et gagner des revenus.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('CreateCourier')}>
              <Text style={styles.primaryButtonText}>Configurer mon profil</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.flex1}>
            <View style={styles.statusCard}>
              <View>
                <Text style={styles.statusLabel}>Statut de disponibilité</Text>
                <Text style={[styles.statusValue, { color: isOnline ? COLORS.success : COLORS.danger }]}>
                  {isOnline ? '● En ligne (Prêt pour livrer)' : '● Hors ligne'}
                </Text>
              </View>
              <Switch
                value={isOnline}
                onValueChange={setIsOnline}
                trackColor={{ false: COLORS.border, true: COLORS.success }}
                thumbColor={COLORS.white}
              />
            </View>

            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Courses disponibles ({courses.length})</Text>
              <TouchableOpacity onPress={loadAvailableCourses}>
                <Icon name="refresh" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
            ) : courses.length === 0 ? (
              <View style={styles.emptyBox}>
                <Icon name="time-outline" size={48} color={COLORS.border} />
                <Text style={styles.emptyTitle}>Aucune course disponible</Text>
                <Text style={styles.emptyText}>Les nouvelles commandes prêtes apparaîtront ici en temps réel.</Text>
              </View>
            ) : (
              <FlatList
                data={courses}
                keyExtractor={i => i.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.courseCard, busyId === item.id && { opacity: 0.6 }]}
                    disabled={busyId !== null}
                    onPress={() => acceptCourse(item)}
                  >
                    <View style={styles.courseHeader}>
                      <Text style={styles.shopName}>{item.vendors?.store_name || 'Boutique'}</Text>
                      <Text style={styles.amount}>Gain : +{item.delivery_fee ?? 0} F</Text>
                    </View>
                    <View style={styles.row}>
                      <Icon name="location-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.address} numberOfLines={1}>{item.shipping_address || 'Adresse non spécifiée'}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ padding: 16, gap: 12 }}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: COLORS.bg },
  flex1:              { flex: 1 },
  center:             { justifyContent: 'center', alignItems: 'center' },
  header:             { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:        { fontSize: 18, fontWeight: '700', color: COLORS.white },
  headerSub:          { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  configBtn:          { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  configBtnText:      { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  onboardingContainer:{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, gap: 16 },
  onboardingIconBox:  { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  onboardingTitle:    { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  onboardingText:     { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  primaryButton:      { backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 24, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 10 },
  primaryButtonText:  { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  statusCard:         { margin: 16, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  statusLabel:        { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  statusValue:        { fontSize: 12, fontWeight: '600', marginTop: 3 },
  listHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, marginBottom: 4 },
  listTitle:          { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  emptyBox:           { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 10 },
  emptyTitle:         { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  emptyText:          { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  courseCard:         { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  courseHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shopName:           { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  amount:             { fontSize: 15, fontWeight: '700', color: COLORS.accent },
  row:                { flexDirection: 'row', alignItems: 'center', gap: 6 },
  address:            { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
});
