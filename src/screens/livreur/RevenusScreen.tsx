import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';

const MOCK_HISTORY = [
  { id: 'CMD-098', client: 'Moussa Ba',    addr: 'Mermoz',    fee: 500, date: 'Aujourd\'hui 14:32' },
  { id: 'CMD-097', client: 'Fatou Diallo', addr: 'Liberté 6', fee: 700, date: 'Aujourd\'hui 11:15' },
  { id: 'CMD-096', client: 'Omar Seck',    addr: 'Fann',      fee: 400, date: 'Hier 18:45' },
  { id: 'CMD-095', client: 'Aminata Diop', addr: 'Plateau',   fee: 600, date: 'Hier 15:20' },
];

export default function RevenusScreen() {
  const { logout } = useAuthStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Revenus & Notes</Text>
        <Text style={styles.headerSub}>Moussa Dleaf · Dakar</Text>
      </View>

      <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Stats principales */}
          <View style={styles.mainStats}>
            <View style={styles.mainStatCard}>
              <Text style={styles.mainStatLabel}>Aujourd'hui</Text>
              <Text style={styles.mainStatVal}>25 000 F</Text>
            </View>
            <View style={styles.mainStatCard}>
              <Text style={styles.mainStatLabel}>Cette semaine</Text>
              <Text style={[styles.mainStatVal, { color: COLORS.accent }]}>150 000 F</Text>
            </View>
          </View>

          {/* Stats secondaires */}
          <View style={styles.secondaryStats}>
            <View style={styles.secondaryCard}>
              <Text style={styles.secondaryVal}>20</Text>
              <Text style={styles.secondaryLabel}>Livraisons réussies</Text>
            </View>
            <View style={styles.secondaryCard}>
              <Text style={[styles.secondaryVal, styles.ratingText]}>4.8 ★</Text>
              <Text style={styles.secondaryLabel}>Note moyenne</Text>
            </View>
            <View style={styles.secondaryCard}>
              <Text style={[styles.secondaryVal, { color: COLORS.success }]}>98%</Text>
              <Text style={styles.secondaryLabel}>Taux de succès</Text>
            </View>
          </View>

          {/* Note badge */}
          <View style={styles.badgeCard}>
            <Text style={styles.badgeEmoji}>🏆</Text>
            <View>
              <Text style={styles.badgeTitle}>Top livreur</Text>
              <Text style={styles.badgeSub}>Note ≥ 4.5 · 20+ livraisons</Text>
            </View>
          </View>

          {/* Historique */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historique des courses</Text>
            {MOCK_HISTORY.map(item => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyLeft}>
                  <View style={styles.historyIcon}>
                    <Text style={styles.historyIconText}>🛵</Text>
                  </View>
                  <View>
                    <Text style={styles.historyClient}>{item.client}</Text>
                    <Text style={styles.historyAddr}>{item.addr} · {item.date}</Text>
                  </View>
                </View>
                <Text style={styles.historyFee}>+{item.fee} F</Text>
              </View>
            ))}
          </View>

          {/* Déconnexion */}
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bg },
  flex1:          { flex: 1 },
  header:         { backgroundColor: COLORS.primary, paddingTop: 6, paddingBottom: 16, paddingHorizontal: 16 },
  headerTitle:    { fontSize: 18, fontWeight: '600', color: COLORS.white },
  headerSub:      { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  mainStats:      { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8 },
  mainStatCard:   { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  mainStatLabel:  { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  mainStatVal:    { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  secondaryStats: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 8 },
  secondaryCard:  { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  secondaryVal:   { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  secondaryLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
  badgeCard:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FEF3C7', marginHorizontal: 16, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FCD34D', marginBottom: 8 },
  badgeEmoji:     { fontSize: 28 },
  badgeTitle:     { fontSize: 14, fontWeight: '600', color: '#92400E' },
  badgeSub:       { fontSize: 12, color: '#B45309', marginTop: 2 },
  section:        { padding: 16, gap: 8 },
  sectionTitle:   { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  historyCard:    { backgroundColor: COLORS.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyLeft:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  historyIcon:    { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  historyClient:  { fontSize: 13, fontWeight: '500', color: COLORS.textPrimary },
  historyAddr:    { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  historyFee:     { fontSize: 14, fontWeight: '700', color: COLORS.success },
  ratingText:     { color: '#F59E0B' },
  historyIconText:{ fontSize: 18 },
  logoutBtn:      { margin: 16, marginBottom: 32, backgroundColor: '#FEE2E2', borderRadius: 12, padding: 14, alignItems: 'center' },
  logoutText:     { color: '#991B1B', fontWeight: '600', fontSize: 14 },
});
