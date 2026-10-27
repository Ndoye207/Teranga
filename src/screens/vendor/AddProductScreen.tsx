import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { api } from '../../services/api';
import { vendorService } from '../../services/vendorService';
import { COLORS } from '../../constants/colors';

const CATEGORIES = ['Repas', 'Légumes', 'Service'];

export default function AddProductScreen({ route, navigation }: any) {
  const { vendorId, product } = route?.params || {};
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState(product?.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : CATEGORIES[0]);
  const [image, setImage] = useState<string | null>(product?.image_url || null);
  const [loading, setLoading] = useState(false);

  // Fallback to fetch vendorId if it is missing
  useEffect(() => {
    if (!vendorId && !product) {
      Alert.alert('Erreur', 'ID de boutique manquant. Veuillez réessayer.');
      navigation.goBack();
    }
  }, [vendorId, product, navigation]);

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.5,
    });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri || null);
    }
  };

  const handleSaveProduct = async () => {
    if (!name || !price) {
      Alert.alert('Erreur', 'Veuillez remplir le nom et le prix.');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = image;
      if (image && image !== product?.image_url) {
        imageUrl = await api.uploadImage('product-images', image, vendorId || product.vendor_id);
      }

      const productData = {
        vendor_id: vendorId || product.vendor_id,
        name: name,
        price: parseFloat(price),
        description: description,
        category: category.toLowerCase(),
        image_url: imageUrl,
      };

      if (product) {
        await vendorService.updateProduct(product.id, productData);
        Alert.alert('Succès', 'Produit modifié !');
      } else {
        await api.addProduct(productData);
        Alert.alert('Succès', 'Produit ajouté !');
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'enregistrer le produit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{product ? 'Modifier' : 'Ajouter'} le produit</Text>
        
        {/* ... (keep imagePicker) ... */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
          ) : (
            <Text style={styles.imagePlaceholder}>Choisir une image</Text>
          )}
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Nom du produit"
          value={name}
          onChangeText={setName}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Prix (F)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSaveProduct} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>{product ? 'Enregistrer les modifications' : 'Ajouter le produit'}</Text>
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
  imagePicker: { width: '100%', height: 200, backgroundColor: '#EEE', borderRadius: 12, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  image: { width: '100%', height: '100%', borderRadius: 12 },
  imagePlaceholder: { color: COLORS.textSecondary },
  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
  textArea: { height: 100, textAlignVertical: 'top' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  categoryBtn: { padding: 10, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#FFF' },
  categoryBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryText: { color: COLORS.textSecondary },
  categoryTextActive: { color: '#FFF' },
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
