import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import Icon from '../../components/Icon';
import { Card } from '../../components/Card';
import { COLORS } from '../../constants/colors';
import { useMyOrders } from '../../hooks/useMyOrders';
import CourierCard from '../../components/CourierCard';

// Étape de la frise selon le statut en base
const STEP_INDEX: Record<string, number> = {
  pending: 0, confirmed: 1, preparing: 2, ready: 3, picked_up: 4, delivering: 4, delivered: 5,
};

const STEPS = [
  { icon: 'document-text', label: 'Commande envoyée',  sub: 'En attente du vendeur' },
  { icon: 'checkmark',     label: 'Commande acceptée', sub: 'Le vendeur a accepté' },
  { icon: 'restaurant',    label: 'Préparation',       sub: 'En cours de préparation' },
  { icon: 'cube',          label: 'Prête',             sub: 'En attente du livreur' },
  { icon: 'bicycle',       label: 'En route',          sub: 'Le livreur apporte votre commande' },
  { icon: 'checkmark-done',label: 'Livrée',            sub: 'Bon appétit !' },
];

const BANNER: Record<string, { title: string; sub: string }> = {
  pending:    { title: 'En attente du vendeur',  sub: 'Le vendeur va accepter ou refuser votre commande.' },
  confirmed:  { title: 'Commande acceptée',      sub: 'Le vendeur va commencer la préparation.' },
  preparing:  { title: 'En préparation',         sub: 'Votre commande est en cours de préparation.' },
  ready:      { title: 'Commande prête',         sub: 'Nous attendons un livreur.' },
  picked_up:  { title: 'Commande récupérée',     sub: 'Le livreur a récupéré votre commande.' },
  delivering: { title: 'En cours de livraison',  sub: 'Votre livreur est en route.' },
  delivered:  { title: 'Livrée avec succès',     sub: 'Merci pour votre commande !' },
};

const PAYMENT_LABEL: Record<string, string> = { cash: 'Cash', wave: 'Wave', orange_money: 'Orange Money' };

export default function TrackingScreen({ navigation }: any) {
  const { active, history, loading, refreshing, refresh, dismiss } = useMyOrders(navigation);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Commande affichée : celle choisie, sinon la plus récente encore en cours
  const current = active.find(o => o.id === selectedId) || active[0] || null;
  const items: { id: string; product_name: string; quantity: number; unit_price: number }[] =
    current?.order_items ?? [];

  const openHistory = () => navigation.navigate('OrderHistory');

  if (loading) {
    return (
      <View style={[styles.container, styles.emptyBox, { backgroundColor: COLORS.bg }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!current) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Suivi de commande</Text>
          <TouchableOpacity style={styles.historyBtn} onPress={openHistory}>
            <Icon name="time-outline" size={16} color="#fff" />
            <Text style={styles.historyBtnText}>Historique</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconBox}>
              <Icon name="cube-outline" size={48} color={COLORS.border} />
            </View>
            <Text style={styles.emptyTitle}>Aucune commande en cours</Text>
            <Text style={styles.emptyText}>
              {history.length > 0
                ? 'Vos commandes terminées sont dans votre historique.'
                : 'Passez une commande pour voir son suivi ici.'}
            </Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Accueil')}>
              <Icon name="storefront" size={16} color="#fff" />
              <Text style={styles.shopBtnText}>Commander maintenant</Text>
            </TouchableOpacity>
            {history.length > 0 && (
              <TouchableOpacity style={styles.secondaryBtn} onPress={openHistory}>
                <Icon name="time-outline" size={16} color={COLORS.primary} />
                <Text style={styles.secondaryBtnText}>Voir l'historique ({history.length})</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const status: string = current.status || 'pending';
  const isDelivered = status === 'delivered';
  const isCancelled = status === 'cancelled';
  const stepIdx = STEP_INDEX[status] ?? 0;
  const banner = BANNER[status] || BANNER.pending;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Suivi de commande</Text>
        <View style={styles.headerRight}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>#{current.id.slice(0, 8)}</Text>
          </View>
          <TouchableOpacity style={styles.historyBtn} onPress={openHistory}>
            <Icon name="time-outline" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        >
          {active.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
              style={styles.chipsScroll}
            >
              {active.map(o => (
                <TouchableOpacity
                  key={o.id}
                  style={[styles.chip, o.id === current.id && styles.chipActive]}
                  onPress={() => setSelectedId(o.id)}
                >
                  <Text style={[styles.chipText, o.id === current.id && styles.chipTextActive]}>
                    {o.vendors?.store_name || 'Boutique'} · #{o.id.slice(0, 4)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Statut global */}
          <Card style={styles.statusBanner}>
            <View style={[styles.statusIconBox, { backgroundColor: isCancelled ? '#FEE2E2' : isDelivered ? '#EDFBF3' : '#FEF3C7' }]}>
              <Icon
                name={isCancelled ? 'close-circle' : isDelivered ? 'checkmark-circle' : 'time'}
                size={28}
                color={isCancelled ? '#DC2626' : isDelivered ? '#22C55E' : '#F59E0B'}
              />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>{isCancelled ? 'Commande refusée' : banner.title}</Text>
              <Text style={styles.statusSub}>
                {isCancelled ? 'Le vendeur n\'a pas pu honorer votre commande.' : banner.sub}
              </Text>
            </View>
          </Card>

          {isCancelled ? (
            <View style={styles.cancelBox}>
              <Text style={styles.cancelTitle}>Motif : {current.cancel_reason || 'non précisé'}</Text>
              <Text style={styles.cancelText}>Vous n'avez rien à payer. Vous pouvez commander ailleurs.</Text>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => dismiss(current.id)}>
                <Text style={styles.cancelBtnText}>J'ai compris</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Card style={styles.timelineCard}>
              <Text style={styles.timelineTitle}>Progression</Text>
              {STEPS.map((s, i) => (
                <TimelineStep
                  key={s.label}
                  icon={s.icon}
                  label={s.label}
                  sub={s.sub}
                  done={i < stepIdx || isDelivered}
                  current={i === stepIdx && !isDelivered}
                  isLast={i === STEPS.length - 1}
                />
              ))}
            </Card>
          )}

          {/* Livreur */}
          {current.livreur_id && !isCancelled && (
            <CourierCard
              key={`${current.id}:${current.livreur_id}`}
              orderId={current.id}
              variant="client"
              allowCall={!isDelivered}
              style={{ margin: 16, marginTop: 0 }}
            />
          )}

          {/* Détails */}
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Détails</Text>
            <View style={styles.infoRow}>
              <Icon name="storefront" size={18} color={COLORS.primary} />
              <Text style={styles.infoLabel}>Boutique :</Text>
              <Text style={styles.infoVal}>{current.vendors?.store_name || 'Boutique'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="location" size={18} color={COLORS.primary} />
              <Text style={styles.infoLabel}>Adresse :</Text>
              <Text style={styles.infoVal}>{current.shipping_address}</Text>
            </View>
            {items.length > 0 && (
              <View style={styles.infoRow}>
                <Icon name="basket" size={18} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Articles :</Text>
                <Text style={styles.infoVal}>
                  {items.map(i => `${i.quantity} × ${i.product_name}`).join(', ')}
                </Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Icon name="wallet" size={18} color={COLORS.primary} />
              <Text style={styles.infoLabel}>Paiement :</Text>
              <Text style={styles.infoVal}>
                {PAYMENT_LABEL[current.payment_method || ''] || '—'} · {current.total_amount.toLocaleString()} F (dont livraison {(current.delivery_fee ?? 0).toLocaleString()} F)
              </Text>
            </View>
          </Card>

          {isDelivered && (
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => navigation.navigate('Rating', {
                order: { id: current.id, vendorName: current.vendors?.store_name, hasLivreur: !!current.livreur_id },
              })}
            >
              <Icon name="star" size={18} color="#fff" />
              <Text style={styles.chatBtnText}>Noter la commande</Text>
            </TouchableOpacity>
          )}
          {isDelivered && (
            <TouchableOpacity style={styles.laterBtn} onPress={() => dismiss(current.id)}>
              <Text style={styles.laterBtnText}>Plus tard (envoyer dans l'historique)</Text>
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
        <View style={[styles.stepIconCircle, done && styles.stepDone, current && styles.stepCurrent]}>
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
  headerRight:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  historyBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  historyBtnText: { fontSize: 12, color: COLORS.white, fontWeight: '600' },
  secondaryBtn:   { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 11 },
  secondaryBtnText:{ color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  chipsScroll:    { flexGrow: 0 },
  chipsRow:       { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  chip:           { backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:       { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white },
  laterBtn:       { alignItems: 'center', paddingVertical: 8, marginHorizontal: 16, marginTop: -12, marginBottom: 24 },
  laterBtnText:   { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  cancelBtn:      { alignSelf: 'flex-start', backgroundColor: '#991B1B', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, marginTop: 4 },
  cancelBtnText:  { color: '#fff', fontSize: 13, fontWeight: '700' },
  cancelBox:      { margin: 16, marginTop: 0, backgroundColor: '#FEE2E2', borderRadius: 16, padding: 16, gap: 6 },
  cancelTitle:    { fontSize: 14, fontWeight: '700', color: '#991B1B' },
  cancelText:     { fontSize: 13, color: '#7F1D1D' },
  callBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 12, minHeight: 44, marginTop: 4 },
  callBtnText:    { color: COLORS.white, fontSize: 14, fontWeight: '700' },
});