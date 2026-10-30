import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';

export default function ShopSettingsScreen({ navigation }: any) {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const vendor = await api.getMyVendor();
        if (vendor) {
          setVendorId(vendor.id);
          setShopName(vendor.store_name);
          setAddress(vendor.address ?? '');
          setPhone(vendor.phone ?? '');
          setDescription(vendor.description ?? '');
        }
      } catch (err) {
        Alert.alert('Erreur', 'Impossible de charger votre boutique.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!vendorId || saving) return;
    if (!shopName.trim() || !address.trim()) {
      Alert.alert('Erreur', "Le nom et l'adresse de la boutique sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          store_name: shopName.trim(),
          address: address.trim(),
          phone: phone.trim() || null,
          description: description.trim() || null,
        })
        .eq('id', vendorId);
      if (error) throw error;
      Alert.alert('Succès', 'Paramètres de la boutique mis à jour');
      navigation?.goBack();
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible de mettre à jour la boutique.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!vendorId) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.title}>Aucune boutique</Text>
        <TouchableOpacity style={styles.saveButton} onPress={() => navigation?.navigate('CreateShop')}>
          <Text style={styles.saveButtonText}>Créer ma boutique</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Paramètres de la boutique</Text>

        <Text style={styles.label}>Nom de la boutique</Text>
        <TextInput style={styles.input} value={shopName} onChangeText={setShopName} />

        <Text style={styles.label}>Adresse</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} />

        <Text style={styles.label}>Téléphone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, { height: 90, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} multiline />

        <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveButtonText}>Enregistrer</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20, color: COLORS.textPrimary },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  input: { backgroundColor: COLORS.white, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16, color: COLORS.textPrimary },
  saveButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
});
