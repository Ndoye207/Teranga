import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';

const DELIVERY_STEPS = [
  { id: 'go_vendor',    label: 'Je pars au vendeur',                  icon: '🛵' },
  { id: 'at_vendor',   label: 'Arrivé au vendeur · Prend la commande',icon: '📦' },
  { id: 'go_client',   label: 'En route vers le client',              icon: '🚀' },
  { id: 'delivered',   label: 'Livraison effectuée',                  icon: '✅' },
];

export default function CourseDetailScreen({ route, navigation }: any) {
  const course = route.params?.course;
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);

  const advance = () => {
    if (currentStep < DELIVERY_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      Alert.alert(
        'Confirmer la livraison',
        'La commande a bien été livrée ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Confirmer', onPress: () => setDone(true) },
        ]
      );
    }
  };

  if (done) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successBox}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Livraison confirmée !</Text>
          <Text style={styles.successSub}>+{course?.fee ?? 500} F ajoutés à vos revenus</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>Retour aux courses</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.headerSub}>#{course?.id}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Carte */}
        <View style={styles.mapBox}>
          <Text style={styles.mapEmoji}>🗺️</Text>
          <Text style={styles.mapText}>Itinéraire · Vendeur → Client</Text>
          <Text style={styles.mapDist}>{course?.distance ?? 3.2} km</Text>
        </View>

        {/* Infos course */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.infoDot, { backgroundColor: COLORS.primary }]} />
            <View>
              <Text style={styles.infoLabel}>Vendeur</Text>
              <Text style={styles.infoValue}>{course?.vendorName}</Text>
            </View>
          </View>
          <View style={styles.infoSep} />
          <View style={styles.infoRow}>
            <View style={[styles.infoDot, { backgroundColor: COLORS.accent }]} />
            <View>
              <Text style={styles.infoLabel}>Client</Text>
              <Text style={styles.infoValue}>{course?.clientAddr}</Text>
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
        <TouchableOpacity style={styles.advanceBtn} onPress={advance}>
          <Text style={styles.advanceBtnText}>
            {currentStep < DELIVERY_STEPS.length - 1
              ? DELIVERY_STEPS[currentStep].label
              : 'Confirmer la livraison'}
          </Text>
        </TouchableOpacity>

        {/* Contact */}
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactBtn}>
            <Text style={styles.contactBtnText}>📞 Appeler le vendeur</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactBtn, { backgroundColor: COLORS.primary }]}>
            <Text style={[styles.contactBtnText, { color: COLORS.white }]}>💬 Chat client</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },
  header:          { backgroundColor: COLORS.primary, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBack:      { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerBackText:  { color: COLORS.white, fontSize: 18, fontWeight: '600' },
  headerTitle:     { fontSize: 17, fontWeight: '600', color: COLORS.white },
  headerSub:       { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  mapBox:          { margin: 16, height: 130, backgroundColor: '#E8F4F0', borderRadius: 14, borderWidth: 1, borderColor: '#C8E6C9', alignItems: 'center', justifyContent: 'center', gap: 6 },
  mapEmoji:        { fontSize: 32 },
  mapText:         { fontSize: 13, fontWeight: '500', color: '#2D6A4F' },
  mapDist:         { fontSize: 12, color: '#52796F' },
  infoCard:        { backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  infoRow:         { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoDot:         { width: 12, height: 12, borderRadius: 6 },
  infoLabel:       { fontSize: 11, color: COLORS.textSecondary },
  infoValue:       { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  infoSep:         { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  stepsCard:       { backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12, gap: 12 },
  stepsTitle:      { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  stepRow:         { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepIcon:        { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  stepIconDone:    { backgroundColor: '#DCFCE7' },
  stepIconActive:  { backgroundColor: COLORS.accent },
  stepIconText:    { fontSize: 16 },
  stepLabel:       { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  stepLabelDone:   { color: COLORS.success, fontWeight: '500' },
  stepLabelActive: { color: COLORS.textPrimary, fontWeight: '600' },
  advanceBtn:      { backgroundColor: COLORS.primary, marginHorizontal: 16, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 },
  advanceBtnText:  { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  contactRow:      { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 32 },
  contactBtn:      { flex: 1, backgroundColor: COLORS.accent, borderRadius: 12, padding: 12, alignItems: 'center' },
  contactBtnText:  { color: COLORS.white, fontWeight: '600', fontSize: 13 },
  successBox:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  successEmoji:    { fontSize: 56 },
  successTitle:    { fontSize: 22, fontWeight: '600', color: COLORS.textPrimary },
  successSub:      { fontSize: 14, color: COLORS.success, fontWeight: '500' },
  backBtn:         { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  backBtnText:     { color: COLORS.white, fontWeight: '600', fontSize: 14 },
});