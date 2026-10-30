import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import Icon from '../components/Icon';
import { COLORS } from '../constants/colors';
import { useAuthStore } from '../store/useAuthStore';

// Palette de couleurs spécifique pour le design "Premium"
const DESIGN_COLORS = {
  headerBg: '#1B3A6B',
  client: { primary: '#1B3A6B', bg: '#E8F0FB' },
  vendor: { primary: '#ea691e', bg: '#FEF0E8' },
  livreur: { primary: '#1be666', bg: '#d8f7e6' },
  admin: { primary: '#EF4444', bg: '#FEF2F2' },
};

const ROLES = [
  {
    key: 'Client',
    label: 'Acheter',
    sub: 'Commander des repas et légumes',
    icon: 'person',
    ...DESIGN_COLORS.client,
  },
  {
    key: 'Vendor',
    label: 'Vendre',
    sub: 'Gérer ma boutique et mes produits',
    icon: 'storefront',
    family: 'material',
    ...DESIGN_COLORS.vendor,
  },
  {
    key: 'Livreur',
    label: 'Livrer',
    sub: 'Accepter et effectuer des livraisons',
    icon: 'bicycle',
    ...DESIGN_COLORS.livreur,
  },
];

export default function SelectionScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const displayedRoles = isAdmin
    ? [...ROLES, { key: 'Admin', label: 'Admin', sub: 'Gestion globale', icon: 'shield', ...DESIGN_COLORS.admin }]
    : ROLES;

  return (
    <View style={[styles.container, { backgroundColor: DESIGN_COLORS.headerBg }]}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />

      <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 24) }]}>
        <Icon name="basket" size={48} color="#fff" />
        <Text style={styles.appName}>Teranga Marché</Text>
        <Text style={styles.appSub}>Livraison alimentaire au Sénégal</Text>
      </View>

      <View style={styles.bodyWrapper}>
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
            >
              <View style={[styles.roleIcon, { backgroundColor: role.bg }]}>
                <Icon
                  name={role.icon}
                  family={((role as any).family) ?? 'ion'}
                  size={26}
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
          <Text style={styles.footerText}>Teranga Market © 2026</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bodyWrapper: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: DESIGN_COLORS.headerBg, paddingBottom: 30, alignItems: 'center', gap: 8 },
  appName: { fontSize: 28, fontWeight: '700', color: '#fff', marginTop: 4 },
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
