import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import CourierIdentityForm from '../../components/CourierIdentityForm';

export default function CourierSettingsScreen({ navigation }: any) {
  const { logout } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Paramètres livreur</Text>

        <CourierIdentityForm submitLabel="Enregistrer" onSaved={() => navigation?.goBack()} />

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white },
  input: { backgroundColor: COLORS.white, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16, color: COLORS.textPrimary },
  saveBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
  saveText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  logoutBtn: { marginTop: 16, backgroundColor: '#FEE2E2', borderRadius: 8, padding: 14, alignItems: 'center' },
  logoutText: { color: '#991B1B', fontWeight: '600' },
});
