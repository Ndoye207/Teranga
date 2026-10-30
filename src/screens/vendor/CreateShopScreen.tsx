import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { pickPhoto } from '../../utils/pickImage';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { COLORS } from '../../constants/colors';

export default function CreateShopScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const uri = await pickPhoto({ quality: 0.5, maxWidth: 1280, maxHeight: 1280 });
    if (uri) setLogo(uri);
  };

  const handleCreateShop = async () => {
    if (!user) return;
    if (!storeName || !address) {
      Alert.alert('Erreur', 'Veuillez remplir le nom de la boutique et l\'adresse.');
      return;
    }

    setLoading(true);
    try {
      let logoUrl = null;
      if (logo) {
        logoUrl = await api.uploadImage('shop-logos', logo, user.id);
      }

      await api.createShop({
        profile_id: user.id,
        store_name: storeName,
        address: address,
        description: description,
        logo_url: logoUrl,
      });
      Alert.alert('Succès', 'Votre boutique a été créée !');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de créer la boutique.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Créer votre boutique</Text>
        
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {logo ? (
            <Image source={{ uri: logo }} style={styles.image} resizeMode="cover" />
          ) : (
            <Text style={styles.imagePlaceholder}>Choisir un logo</Text>
          )}
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Nom de la boutique"
          value={storeName}
          onChangeText={setStoreName}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Adresse"
          value={address}
          onChangeText={setAddress}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleCreateShop} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Créer la boutique</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
  imagePicker: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#EEE', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 20, alignSelf: 'center' },
  image: { width: '100%', height: '100%', borderRadius: 60 },
  imagePlaceholder: { color: COLORS.textSecondary, textAlign: 'center' },
  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
