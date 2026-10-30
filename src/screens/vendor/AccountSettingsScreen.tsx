import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../services/supabase';

export default function AccountSettingsScreen({ navigation }: any) {
  const { user, fetchProfile } = useAuthStore();
  const [name, setName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.full_name ?? '');
    setPhone(user?.phone ?? '');
  }, [user]);

  const handleSave = async () => {
    if (!user || saving) return;
    if (name.trim().length < 2) {
      Alert.alert('Nom invalide', 'Le nom doit contenir au moins 2 caractères.');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: name.trim(), phone: phone.trim() || null })
        .eq('id', user.id);
      if (error) throw error;
      await fetchProfile(true);
      Alert.alert('Succès', 'Profil mis à jour');
      navigation?.goBack();
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible de mettre à jour le profil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Paramètres du compte</Text>

        <Text style={styles.label}>Nom complet</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Téléphone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+221 77 000 00 00" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={[styles.input, styles.readOnly]} value={user?.email ?? ''} editable={false} />

        <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveButtonText}>Enregistrer</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20, color: COLORS.textPrimary },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  input: { backgroundColor: COLORS.white, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16, color: COLORS.textPrimary },
  readOnly: { backgroundColor: '#F1F5F9', color: COLORS.textSecondary },
  saveButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
});
