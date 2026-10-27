import React, { useState, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Icon from '../../components/Icon';
import { Card } from '../../components/Card';
import { COLORS } from '../../constants/colors';
import { useOrderStore } from '../../store/useOrderStore';
import { Order } from '../../types';

export default function TrackingScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { orders, updateOrderStatus } = useOrderStore();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  useEffect(() => {
    const active = orders.find(o => o.status !== 'delivered');
    setCurrentOrder(active || orders[orders.length - 1] || null);
  }, [orders]);

  useEffect(() => {
    if (!currentOrder || currentOrder.status === 'delivered') return;

    const timer = setTimeout(() => {
      if (currentOrder.status === 'pending') {
        updateOrderStatus(currentOrder.id, 'confirmed');
      } else if (currentOrder.status === 'confirmed') {
        updateOrderStatus(currentOrder.id, 'preparing');
      } else if (currentOrder.status === 'preparing') {
        updateOrderStatus(currentOrder.id, 'ready');
      } else if (currentOrder.status === 'ready') {
        updateOrderStatus(currentOrder.id, 'picked_up');
      } else if (currentOrder.status === 'picked_up') {
        updateOrderStatus(currentOrder.id, 'delivering');
      } else if (currentOrder.status === 'delivering') {
        updateOrderStatus(currentOrder.id, 'delivered');
      }
    }, 7000);

    return () => clearTimeout(timer);
  }, [currentOrder, updateOrderStatus]);

  if (!currentOrder) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Suivi de commande</Text>
        </View>

        <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconBox}>
              <Icon name="cube-outline" size={48} color={COLORS.border} />
            </View>
            <Text style={styles.emptyTitle}>Aucune commande active</Text>
            <Text style={styles.emptyText}>
              Passe une commande pour voir son suivi ici
            </Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => navigation.navigate('Accueil')}
            >
              <Icon name="storefront" family="material" size={16} color="#fff" />
              <Text style={styles.shopBtnText}>Commander maintenant</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const isDelivered = currentOrder.status === 'delivered';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Suivi de commande</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>#{currentOrder.id.slice(-5)}</Text>
        </View>
      </View>

      <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Live Google Map */}
          <Card style={styles.mapBox}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: 14.7167,
                longitude: -17.4677,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              <Marker coordinate={{ latitude: 14.7167, longitude: -17.4677 }} title="Vendeur">
                <View style={[styles.mapMarker, styles.mapDotStore]}>
                  <Icon name="storefront" family="material" size={12} color="#fff" />
                </View>
              </Marker>
              <Marker coordinate={{ latitude: 14.7238, longitude: -17.4522 }} title="Livreur">
                <View style={[styles.mapMarker, styles.mapDotBike]}>
                  <Icon name="bicycle" size={12} color="#fff" />
                </View>
              </Marker>
            </MapView>
          </Card>

          {/* Statut Global */}
          <Card style={styles.statusBanner}>
            <View style={[styles.statusIconBox, { backgroundColor: isDelivered ? '#EDFBF3' : '#FEF3C7' }]}>
              <Icon
                name={isDelivered ? 'checkmark-circle' : 'time'}
                size={28}
                color={isDelivered ? '#22C55E' : '#F59E0B'}
              />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>
                {currentOrder.status === 'pending' && 'En attente de validation'}
                {currentOrder.status === 'confirmed' && 'Commande confirmée'}
                {currentOrder.status === 'picked_up' && 'Commande récupérée'}
                {currentOrder.status === 'delivering' && 'En cours de livraison'}
                {currentOrder.status === 'delivered' && 'Livré avec succès'}
              </Text>
              <Text style={styles.statusSub}>
                {isDelivered ? 'Merci pour votre commande !' : 'Votre livreur est en route.'}
              </Text>
            </View>
          </Card>

          {/* Étapes (Timeline) */}
          <Card style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Progression</Text>

            <TimelineStep
              icon="document-text"
              label="Commande validée"
              sub="Le vendeur a accepté"
              done={['accepted', 'picked_up', 'delivering', 'delivered'].includes(currentOrder.status)}
              current={currentOrder.status === 'pending'}
            />
            <TimelineStep
              icon="restaurant"
              label="Préparation"
              sub="En cours de cuisine / emballage"
              done={['picked_up', 'delivering', 'delivered'].includes(currentOrder.status)}
              current={currentOrder.status === 'confirmed'}
            />
            <TimelineStep
              icon="bicycle"
              label="En route"
              sub="Le livreur apporte votre commande"
              done={['delivering', 'delivered'].includes(currentOrder.status)}
              current={currentOrder.status === 'picked_up'}
            />
            <TimelineStep
              icon="checkmark-done"
              label="Livré"
              sub="Bon appétit !"
              done={currentOrder.status === 'delivered'}
              current={currentOrder.status === 'delivering'}
              isLast
            />
          </Card>

          {/* Infos Vendeur & Livreur */}
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Détails</Text>
            <View style={styles.infoRow}>
              <Icon name="storefront" family="material" size={18} color={COLORS.primary} />
              <Text style={styles.infoLabel}>Boutique :</Text>
              <Text style={styles.infoVal}>{currentOrder.vendorName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="location" size={18} color={COLORS.primary} />
              <Text style={styles.infoLabel}>Adresse :</Text>
              <Text style={styles.infoVal}>{currentOrder.deliveryAddress}</Text>
            </View>
          </Card>

          {/* Actions si livré */}
          {isDelivered && (
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => navigation.navigate('Rating', { order: currentOrder })}
            >
              <Icon name="star" size={18} color="#fff" />
              <Text style={styles.chatBtnText}>Noter la commande</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function TimelineStep({ icon, label, sub, done, current, isLast }: any) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepIndicatorCol}>
        <View style={[
          styles.stepIconCircle,
          done && styles.stepDone,
          current && styles.stepCurrent
        ]}>
          <Icon name={icon} size={14} color={done || current ? '#fff' : COLORS.textSecondary} />
        </View>
        {!isLast && <View style={[styles.stepLine, done && styles.stepLineDone]} />}
      </View>
      <View style={styles.stepContent}>
        <Text style={[styles.stepLabel, (done || current) && styles.stepLabelActive]}>{label}</Text>
        <Text style={styles.stepSub}>{sub}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bg },
  flex1:          { flex: 1 },
  header:         { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle:    { fontSize: 18, fontWeight: '700', color: COLORS.white },
  headerBadge:    { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  headerBadgeText:{ fontSize: 12, color: COLORS.white, fontWeight: '600' },
  emptyBox:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  emptyIconBox:   { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  emptyTitle:     { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptyText:      { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  shopBtn:        { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginTop: 8 },
  shopBtnText:    { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  mapBox:         { margin: 16, marginBottom: 0, height: 180, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  map:            { flex: 1 },
  mapMarker:      { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  mapDotStore:    { backgroundColor: COLORS.primary },
  mapDotBike:     { backgroundColor: COLORS.accent },
  statusBanner:   { margin: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  statusIconBox:  { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  statusInfo:     { flex: 1 },
  statusTitle:    { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  statusSub:      { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  timelineCard:   { margin: 16, marginTop: 0, marginBottom: 12, backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 4 },
  timelineTitle:  { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  stepRow:        { flexDirection: 'row', gap: 12 },
  stepIndicatorCol:{ alignItems: 'center', width: 28 },
  stepIconCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  stepDone:       { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  stepCurrent:    { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepLine:       { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  stepLineDone:   { backgroundColor: '#22C55E' },
  stepContent:    { flex: 1, paddingBottom: 16 },
  stepLabel:      { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  stepLabelActive:{ fontWeight: '700', color: COLORS.textPrimary },
  stepSub:        { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  infoCard:       { margin: 16, marginTop: 0, marginBottom: 16, backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  infoTitle:      { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  infoRow:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel:      { fontSize: 13, color: COLORS.textSecondary, width: 70 },
  infoVal:        { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, flex: 1 },
  chatBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 24 },
  chatBtnText:    { color: COLORS.white, fontSize: 14, fontWeight: '700' },
});
