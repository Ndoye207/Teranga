import React, { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { useAuthStore } from '../store/useAuthStore';
import Icon from '../components/Icon';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();

  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    Alert.alert('Info', `Mode ${!isDarkMode ? 'sombre' : 'clair'} activé (démo)`);
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  };

  const MenuItem = ({ icon, label, onPress, destructive }: any) => (
    <TouchableOpacity 
      style={[styles.menuItem, destructive && styles.menuItemDestructive]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon name={icon} size={22} color={destructive ? COLORS.danger : COLORS.textPrimary} />
      <Text style={[styles.menuText, destructive && styles.menuTextDestructive]}>{label}</Text>
      <Icon name="chevron-forward-outline" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : COLORS.bg }]}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={toggleTheme}>
          <Icon name={isDarkMode ? "sunny-outline" : "moon-outline"} size={24} color={isDarkMode ? '#FFF' : COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={40} color={COLORS.white} />
          </View>
          <Text style={[styles.userName, { color: isDarkMode ? '#FFF' : COLORS.textPrimary }]}>{user?.full_name || 'Vendeur'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Section Compte */}
        <Text style={styles.sectionHeader}>Compte</Text>
        <MenuItem icon="person-outline" label="Paramètres du compte" onPress={() => navigation.navigate('AccountSettings')} />
        <MenuItem icon="lock-closed-outline" label="Changer de mot de passe" onPress={() => Alert.alert('Info', 'Changement mot de passe à venir')} />

        {/* Section Boutique */}
        <Text style={styles.sectionHeader}>Gestion Boutique</Text>
        <MenuItem icon="storefront-outline" label="Paramètres de la boutique" onPress={() => navigation.navigate('ShopSettings')} />
        <MenuItem icon="stats-chart-outline" label="Statistiques détaillées" onPress={() => Alert.alert('Info', 'Statistiques à venir')} />

        {/* Section Support & Déconnexion */}
        <Text style={styles.sectionHeader}>Support</Text>
        <MenuItem icon="help-circle-outline" label="Aide et contact" onPress={() => Alert.alert('Info', 'Support à venir')} />
        <MenuItem icon="log-out-outline" label="Déconnexion" onPress={handleLogout} destructive />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: { flex: 1 },
  headerBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 10 },
  scrollContent: { padding: 20 },
  profileHeader: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  userName: { fontSize: 20, fontWeight: '700' },
  userEmail: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  sectionHeader: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginTop: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  menuItemDestructive: { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
  menuText: { flex: 1, fontSize: 16, marginLeft: 15, color: COLORS.textPrimary },
  menuTextDestructive: { color: COLORS.danger },
});
