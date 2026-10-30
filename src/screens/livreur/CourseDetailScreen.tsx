import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Alert, Linking, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { api } from '../../services/api';

const DELIVERY_STEPS = [
  { id: 'go_vendor',    label: 'Je pars au vendeur',                  icon: '🛵' },
  { id: 'at_vendor',   label: 'Arrivé au vendeur · Prend la commande',icon: '📦' },
  { id: 'go_client',   label: 'En route vers le client',              icon: '🚀' },
  { id: 'delivered',   label: 'Livraison effectuée',                  icon: '✅' },
];

// Texte du bouton selon l'étape en cours (ce que le livreur va faire)
const ACTION_LABELS = [
  "J'ai récupéré la commande",
  'Je suis en route vers le client',
  'Confirmer la livraison',
];

export default function CourseDetailScreen({ route, navigation }: any) {
  const course = route.params?.course;
  const [currentStep, setCurrentStep] = useState(() => {
    if (course?.status === 'delivered') return 3;
    if (course?.status === 'delivering') return 2;
    if (course?.status === 'picked_up') return 1;
    return 0;
  });
  const [done, setDone] = useState(course?.status === 'delivered');

  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<{ id: string; product_name: string; quantity: number; unit_price: number }[]>([]);

  useEffect(() => {
    if (!course?.id) return;
    api.getOrderItems(course.id).then(setItems).catch(() => {});
  }, [course?.id]);

  const callVendor = () => {
    const phone = course?.vendors?.phone;
    if (!phone) {
      Alert.alert('Numéro indisponible', "Le vendeur n'a pas renseigné de téléphone.");
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  // Étape 0 -> 1 : récupéré chez le vendeur (picked_up)
  // Étape 1 -> 2 : en route vers le client (delivering)
  // Étape 2 -> 3 : livré (delivered), après confirmation
  const changeStatus = async (status: 'picked_up' | 'delivering' | 'delivered', nextStep: number) => {
    setBusy(true);
    try {
      // L'écran n'avance que si le serveur a accepté le changement
      await api.setCourierOrderStatus(course.id, status);
      setCurrentStep(nextStep);
      if (status === 'delivered') setDone(true);
    } catch (err: any) {
      console.error('Erreur mise à jour statut course:', err);
      Alert.alert('Erreur', err?.message || 'Impossible de mettre à jour la course.');
    } finally {
      setBusy(false);
    }
  };

  const advance = () => {
    if (busy || !course?.id) return;
    if (currentStep === 0) changeStatus('picked_up', 1);
    else if (currentStep === 1) changeStatus('delivering', 2);
    else if (currentStep === 2) {
      Alert.alert('Confirmer la livraison', 'La commande a bien été livrée ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => changeStatus('delivered', 3) },
      ]);
    }
  };

  if (done) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
          <View style={styles.successBox}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Livraison confirmée !</Text>
            <Text style={styles.successSub}>+{course?.delivery_fee ?? 0} F ajoutés à vos revenus</Text>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backBtnText}>Retour aux courses</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Détail de la course</Text>
          <Text style={styles.headerSub}>#{course?.id?.slice(0, 8)}</Text>
        </View>
      </View>

      <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Articles à récupérer */}
          <View style={styles.mapBox}>
            <Text style={styles.mapEmoji}>📦</Text>
            <Text style={styles.mapText}>
              {items.length > 0
                ? items.map(i => `${i.quantity} × ${i.product_name}`).join('\n')
                : 'Commande'}
            </Text>
            <Text style={styles.mapDist}>Gain : +{course?.delivery_fee ?? 0} F</Text>
          </View>

          {/* Infos course */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.infoDot, { backgroundColor: COLORS.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Vendeur</Text>
                <Text style={styles.infoValue}>{course?.vendors?.store_name || 'Boutique'}</Text>
              </View>
            </View>
            <View style={styles.infoSep} />
            <View style={styles.infoRow}>
              <View style={[styles.infoDot, { backgroundColor: COLORS.accent }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Client (Adresse)</Text>
                <Text style={styles.infoValue}>{course?.shipping_address || 'Adresse'}</Text>
              </View>
            </View>
          </View>

          {/* Étapes livraison */}
          <View style={styles.stepsCard}>
            <Text style={styles.stepsTitle}>Étapes de livraison</Text>
            {DELIVERY_STEPS.map((step, index) => {
              const isDone   = index < currentStep;
              const isActive = index === currentStep;
              return (
                <View key={step.id} style={styles.stepRow}>
                  <View style={[
                    styles.stepIcon,
                    isDone   && styles.stepIconDone,
                    isActive && styles.stepIconActive,
                  ]}>
                    <Text style={styles.stepIconText}>
                      {isDone ? '✓' : step.icon}
                    </Text>
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    isDone   && styles.stepLabelDone,
                    isActive && styles.stepLabelActive,
                  ]}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Bouton avancer */}
          <TouchableOpacity style={[styles.advanceBtn, busy && { opacity: 0.6 }]} onPress={advance} disabled={busy}>
            {busy ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.advanceBtnText}>
                {ACTION_LABELS[Math.min(currentStep, ACTION_LABELS.length - 1)]}
              </Text>
            )}
          </TouchableOpacity>

          {/* Contact */}
          <View style={styles.contactRow}>
            <TouchableOpacity style={[styles.contactBtn, { backgroundColor: COLORS.primary }]} onPress={callVendor}>
              <Text style={[styles.contactBtnText, { color: COLORS.white }]}>📞 Appeler le vendeur</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: COLORS.bg },
  flex1:            { flex: 1 },
  header:           { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', paddingTop: 6, paddingBottom: 16, paddingHorizontal: 16, gap: 12 },
  headerBack:       { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerBackText:   { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  headerTitle:      { fontSize: 18, fontWeight: '700', color: COLORS.white },
  headerSub:        { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  mapBox:           { margin: 16, height: 150, backgroundColor: COLORS.white, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 4 },
  mapEmoji:         { fontSize: 36 },
  mapText:          { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  mapDist:          { fontSize: 12, color: COLORS.accent, fontWeight: '700' },
  infoCard:         { margin: 16, marginTop: 0, backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  infoRow:          { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoDot:          { width: 12, height: 12, borderRadius: 6 },
  infoLabel:        { fontSize: 11, color: COLORS.textSecondary },
  infoValue:        { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginTop: 1 },
  infoSep:          { height: 1, backgroundColor: COLORS.border },
  stepsCard:        { margin: 16, marginTop: 0, backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 14 },
  stepsTitle:       { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  stepRow:          { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepIcon:         { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  stepIconDone:     { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  stepIconActive:   { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepIconText:     { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  stepLabel:        { fontSize: 13, color: COLORS.textSecondary },
  stepLabelDone:    { color: COLORS.textPrimary, textDecorationLine: 'line-through' },
  stepLabelActive:  { fontWeight: '700', color: COLORS.textPrimary },
  advanceBtn:       { backgroundColor: COLORS.accent, borderRadius: 16, padding: 16, marginHorizontal: 16, alignItems: 'center', marginBottom: 14 },
  advanceBtnText:   { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  contactRow:       { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 32 },
  contactBtn:       { flex: 1, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, alignItems: 'center' },
  contactBtnText:   { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  successBox:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, gap: 12 },
  successEmoji:     { fontSize: 60 },
  successTitle:     { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  successSub:       { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  backBtn:          { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 10 },
  backBtnText:      { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});
