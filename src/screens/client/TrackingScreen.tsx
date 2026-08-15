import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  StatusBar, TouchableOpacity, ScrollView,
} from 'react-native';
import Icon from '../../components/Icon';
import { Card } from '../../components/Card';
import { COLORS } from '../../constants/colors';
import { useOrderStore } from '../../store/useOrderStore';
import { OrderStatus } from '../../types';

const STEPS: { status: OrderStatus; label: string; sub: string; icon: string }[] = [
  { status: 'pending',    label: 'Commande reçue',        sub: 'Votre commande est enregistrée',      icon: 'receipt'          },
  { status: 'preparing',  label: 'En préparation',         sub: 'Le vendeur prépare votre commande',   icon: 'restaurant'       },
  { status: 'picked_up',  label: 'Prise en charge',        sub: 'Le livreur a récupéré la commande',   icon: 'bicycle'          },
  { status: 'delivering', label: 'En cours de livraison',  sub: 'Le livreur est en route',             icon: 'navigate'         },
  { status: 'delivered',  label: 'Livré',                  sub: 'Commande livrée avec succès',         icon: 'checkmark-circle' },
];

const STATUS_ORDER: OrderStatus[] = [
  'pending','confirmed','preparing','ready','picked_up','delivering','delivered',
];

function getStepState(stepStatus: OrderStatus, currentStatus: OrderStatus) {
  const si = STATUS_ORDER.indexOf(stepStatus);
  const ci = STATUS_ORDER.indexOf(currentStatus);
  if (si < ci)  return 'done';
  if (si === ci) return 'active';
  return 'todo';
}

export default function TrackingScreen({ navigation }: any) {
  const { currentOrder, updateOrderStatus } = useOrderStore();

  useEffect(() => {
    if (!currentOrder || currentOrder.status === 'delivered') return;
    const idx  = STATUS_ORDER.indexOf(currentOrder.status);
    const next = STATUS_ORDER[idx + 1];
    if (!next) return;
    const timer = setTimeout(() => updateOrderStatus(currentOrder.id, next), 4000);
    return () => clearTimeout(timer);
  }, [currentOrder, updateOrderStatus]);

  if (!currentOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Suivi de commande</Text>
        </View>
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
      </SafeAreaView>
    );
  }

  const isDelivered = currentOrder.status === 'delivered';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Suivi de commande</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>#{currentOrder.id.slice(-5)}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Map placeholder */}
        <Card style={styles.mapBox}>
          <View style={styles.mapInner}>
            <Icon name="map" size={36} color="#2D6A4F" />
            <Text style={styles.mapText}>Position du livreur en temps réel</Text>
            <Text style={styles.mapSub}>Google Maps · À connecter</Text>
          </View>
          {/* Points simulés */}
          <View style={[styles.mapDot, styles.mapDotStore]}>
            <Icon name="storefront" family="material" size={10} color={COLORS.white} />
          </View>
          <View style={[styles.mapDot, styles.mapDotHome]}>
            <Icon name="home" size={10} color={COLORS.white} />
          </View>
          <View style={[styles.mapDot, styles.mapDotBike]}>
            <Icon name="bicycle" size={10} color={COLORS.white} />
          </View>
        </Card>

        {/* Infos commande */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: COLORS.bg }]}>
              <Icon name="storefront" family="material" size={16} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Vendeur</Text>
              <Text style={styles.infoValue}>{currentOrder.vendorName}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: COLORS.bg }]}>
              <Icon name="wallet" size={16} color={COLORS.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Total</Text>
              <Text style={styles.infoValue}>
                {(currentOrder.totalAmount + currentOrder.deliveryFee).toLocaleString()} F · {currentOrder.paymentMethod}
              </Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: COLORS.bg }]}>
              <Icon name="location" size={16} color={COLORS.success} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Adresse</Text>
              <Text style={styles.infoValue}>{currentOrder.deliveryAddress}</Text>
            </View>
          </View>
        </Card>

        {/* Étapes */}
        <Card style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Progression</Text>
          {STEPS.map((step, index) => {
            const state = getStepState(step.status, currentOrder.status);
            return (
              <View key={step.status} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View style={[
                    styles.stepDot,
                    state === 'done'   && styles.stepDotDone,
                    state === 'active' && styles.stepDotActive,
                  ]}>
                    {state === 'done' ? (
                      <Icon name="checkmark" size={14} color={COLORS.success} />
                    ) : (
                      <Icon
                        name={step.icon}
                        size={14}
                        color={state === 'active' ? COLORS.white : COLORS.textSecondary}
                      />
                    )}
                  </View>
                  {index < STEPS.length - 1 && (
                    <View style={[
                      styles.stepLine,
                      state === 'done' && styles.stepLineDone,
                    ]} />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepLabel,
                    state === 'todo'   && styles.stepLabelTodo,
                    state === 'active' && styles.stepLabelActive,
                  ]}>
                    {step.label}
                  </Text>
                  <Text style={[
                    styles.stepSub,
                    state === 'active' && { color: COLORS.success },
                  ]}>
                    {state === 'active' ? '● En cours...' : step.sub}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.callBtn}>
            <Icon name="call" size={18} color="#fff" />
            <Text style={styles.callBtnText}>Appeler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chatBtn}>
            <Icon name="chatbubble" size={18} color="#fff" />
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Notation */}
        {isDelivered && (
          <TouchableOpacity
            style={styles.rateBtn}
            onPress={() => navigation.navigate('Rating', { order: currentOrder })}
            activeOpacity={0.85}
          >
            <Icon name="star" size={20} color="#92400E" />
            <Text style={styles.rateBtnText}>Noter la commande</Text>
            <Icon name="chevron-forward" size={18} color="#92400E" />
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bg },
  header:         { backgroundColor: COLORS.primary, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle:    { fontSize: 18, fontWeight: '700', color: COLORS.white },
  headerBadge:    { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  headerBadgeText:{ fontSize: 12, color: COLORS.white, fontWeight: '600' },
  emptyBox:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  emptyIconBox:   { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  emptyTitle:     { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptyText:      { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  shopBtn:        { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginTop: 8 },
  shopBtnText:    { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  mapBox:         { margin: 16, height: 150, backgroundColor: '#E8F4F0', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#C8E6C9', position: 'relative' },
  mapInner:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  mapText:        { fontSize: 13, fontWeight: '600', color: '#2D6A4F' },
  mapSub:         { fontSize: 11, color: '#52796F' },
  mapDot:         { position: 'absolute', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  infoCard:       { backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12, overflow: 'hidden' },
  infoRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  infoIconBox:    { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  infoContent:    { flex: 1 },
  infoLabel:      { fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 },
  infoValue:      { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  infoDivider:    { height: 1, backgroundColor: COLORS.border, marginHorizontal: 14 },
  stepsCard:      { backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  stepsTitle:     { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  stepRow:        { flexDirection: 'row', gap: 12 },
  stepLeft:       { alignItems: 'center', width: 32 },
  stepDot:        { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  stepDotDone:    { backgroundColor: COLORS.success },
  stepDotActive:  { backgroundColor: COLORS.accent },
  stepLine:       { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: 4, minHeight: 20 },
  stepLineDone:   { backgroundColor: COLORS.success },
  stepContent:    { flex: 1, paddingBottom: 20 },
  stepLabel:      { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  stepLabelTodo:  { color: COLORS.textSecondary, fontWeight: '400' },
  stepLabelActive:{ color: COLORS.accent },
  stepSub:        { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  actions:        { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  callBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.accent, borderRadius: 14, padding: 14 },
  callBtnText:    { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  chatBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 14, padding: 14 },
  chatBtnText:    { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  rateBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FEF3C7', marginHorizontal: 16, borderRadius: 14, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: '#FCD34D' },
  rateBtnText:    { color: '#92400E', fontWeight: '700', fontSize: 14, flex: 1, textAlign: 'center' },
  mapDotStore:    { top: 30, left: 40, backgroundColor: COLORS.primary },
  mapDotHome:     { bottom: 30, right: 40, backgroundColor: COLORS.accent },
  mapDotBike:     { top: '45%', left: '50%', backgroundColor: COLORS.success },
});