import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';

const REVIEWS = [
  { name: 'Moussa Ba',    rating: 5, comment: 'Excellent service, légumes très frais !', date: 'il y a 2h' },
  { name: 'Aminata Diop', rating: 4, comment: 'Bonne qualité, livraison rapide.',         date: 'il y a 1j' },
  { name: 'Omar Seck',    rating: 5, comment: 'Thiéboudienne délicieuse !',               date: 'il y a 2j' },
];

export default function StatsScreen() {
  const { logout } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notes & Statistiques</Text>
        <Text style={styles.headerSub}>Derniers 30 jours</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Note globale */}
        <View style={styles.ratingCard}>
          <View style={styles.ratingMain}>
            <Text style={styles.ratingBig}>4.8</Text>
            <View>
              <Text style={styles.stars}>★★★★★</Text>
              <Text style={styles.ratingLabel}>342 avis au total</Text>
            </View>
          </View>
          <View style={styles.topBadge}>
            <Text style={styles.topBadgeText}>🥇 Meilleur vendeur</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>42</Text>
            <Text style={styles.statLabel}>Commandes ce mois</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.accent }]}>62 000</Text>
            <Text style={styles.statLabel}>Revenus (FCFA)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.success }]}>98%</Text>
            <Text style={styles.statLabel}>Clients satisfaits</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>18 min</Text>
            <Text style={styles.statLabel}>Temps prépa moyen</Text>
          </View>
        </View>

        {/* Avis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avis récents</Text>
          {REVIEWS.map((r, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewHead}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>
                    {r.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewName}>{r.name}</Text>
                  <Text style={styles.reviewDate}>{r.date}</Text>
                </View>
                <Text style={styles.reviewStars}>
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </Text>
              </View>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          ))}
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },
  header:          { backgroundColor: COLORS.primary, padding: 16 },
  headerTitle:     { fontSize: 18, fontWeight: '600', color: COLORS.white },
  headerSub:       { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  ratingCard:      { backgroundColor: COLORS.white, margin: 16, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  ratingMain:      { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ratingBig:       { fontSize: 48, fontWeight: '700', color: COLORS.primary },
  stars:           { fontSize: 20, color: '#F59E0B', letterSpacing: 2 },
  ratingLabel:     { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  topBadge:        { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10, alignItems: 'center' },
  topBadgeText:    { fontSize: 14, fontWeight: '600', color: '#92400E' },
  statsGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginBottom: 8 },
  statCard:        { flex: 1, minWidth: '45%', backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  statVal:         { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  statLabel:       { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  section:         { padding: 16, gap: 10 },
  sectionTitle:    { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  reviewCard:      { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  reviewHead:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar:    { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText:{ color: COLORS.white, fontWeight: '600', fontSize: 14 },
  reviewInfo:      { flex: 1 },
  reviewName:      { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  reviewDate:      { fontSize: 11, color: COLORS.textSecondary },
  reviewStars:     { fontSize: 13, color: '#F59E0B' },
  reviewComment:   { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  logoutBtn:       { margin: 16, marginTop: 4, marginBottom: 32, backgroundColor: '#FEE2E2', borderRadius: 12, padding: 14, alignItems: 'center' },
  logoutText:      { color: '#991B1B', fontWeight: '600', fontSize: 14 },
});