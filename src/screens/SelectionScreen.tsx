import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import Icon from '../components/Icon';
import { COLORS } from '../constants/colors';
import { useAuthStore } from '../store/useAuthStore';

// Palette de couleurs spécifique pour le design "Premium"
const DESIGN_COLORS = {
  headerBg: '#1B3A6B',
  client: { primary: '#1B3A6B', bg: '#E8F0FB' },
  vendor: { primary: '#E8834A', bg: '#FEF0E8' },
  livreur: { primary: '#22C55E', bg: '#EDFBF3' },
  admin: { primary: '#EF4444', bg: '#FEF2F2' },
};

const ROLES = [
  {
    key: 'Client',
    label: 'Je suis client',
    sub: 'Commander des repas et légumes',
    icon: 'person',
    ...DESIGN_COLORS.client,
  },
  {
    key: 'Vendor',
    label: 'Je suis vendeur',
    sub: 'Gérer ma boutique et mes produits',
    icon: 'storefront',
    family: 'material',
    ...DESIGN_COLORS.vendor,
  },
  {
    key: 'Livreur',
    label: 'Je suis livreur',
    sub: 'Accepter et effectuer des livraisons',
    icon: 'bicycle',
    ...DESIGN_COLORS.livreur,
  },
];

export default function SelectionScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const displayedRoles = isAdmin
    ? [...ROLES, { key: 'Admin', label: 'Admin', sub: 'Gestion globale', icon: 'shield', ...DESIGN_COLORS.admin }]
    : ROLES;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={DESIGN_COLORS.headerBg} barStyle="light-content" />

      <View style={styles.header}>
        <Icon name="basket" size={48} color="#fff" />
        <Text style={styles.appName}>Teranga Market</Text>
        <Text style={styles.appSub}>Livraison alimentaire au Sénégal</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.question}>Qui êtes-vous ?</Text>
        <Text style={styles.questionSub}>
          Choisissez votre profil pour continuer
        </Text>

        {displayedRoles.map(role => (
          <TouchableOpacity
            key={role.key}
            style={[styles.roleCard, { borderColor: role.primary }]}
            onPress={() => navigation.navigate(role.key)}
            activeOpacity={0.85}
          >
            <View style={[styles.roleIcon, { backgroundColor: role.bg }]}>
              <Icon
                name={role.icon}
                family={(role.family as any) ?? 'ion'}
                size={28}
                color={role.primary}
              />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleLabel}>{role.label}</Text>
              <Text style={styles.roleSub}>{role.sub}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Teranga Market · Dakar, Sénégal</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: DESIGN_COLORS.headerBg, paddingTop: 60, paddingBottom: 40, alignItems: 'center', gap: 10 },
  appName: { fontSize: 28, fontWeight: '700', color: '#fff', marginTop: 8 },
  appSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  body: { flex: 1, padding: 24, gap: 16 },
  question: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  questionSub: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 },
  roleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, gap: 16 },
  roleIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  roleInfo: { flex: 1 },
  roleLabel: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  roleSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  footer: { padding: 20, alignItems: 'center' },
  footerText: { fontSize: 12, color: COLORS.textSecondary },
});
