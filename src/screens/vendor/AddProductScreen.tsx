import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { pickPhoto } from '../../utils/pickImage';
import { api } from '../../services/api';
import { vendorService } from '../../services/vendorService';
import { normalizeCategory } from '../../utils/category';
import { CATEGORIES } from '../../constants/categories';
import { COLORS } from '../../constants/colors';


export default function AddProductScreen({ route, navigation }: any) {
  const { vendorId, product } = route?.params || {};
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [description, setDescription] = useState(product?.description || '');
  // Vide = stock illimité (non suivi). Un nombre = quantité disponible.
  const [stock, setStock] = useState(product?.stock != null ? String(product.stock) : '');
  // On stocke l'identifiant officiel de la catégorie (ex. 'plats', 'legumes', 'patisserie')
  const [category, setCategory] = useState<string>(normalizeCategory(product?.category) ?? CATEGORIES[0].id);
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
    const uri = await pickPhoto({ quality: 0.5, maxWidth: 1280, maxHeight: 1280 });
    if (uri) setImage(uri);
  };

  const handleSaveProduct = async () => {
    const parsedPrice = parseFloat(price.replace(',', '.'));
    if (!name.trim() || !price) {
      Alert.alert('Erreur', 'Veuillez remplir le nom et le prix.');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Prix invalide', 'Entrez un prix supérieur à 0 (ex : 1500).');
      return;
    }

    let stockValue: number | null = null;
    if (stock.trim() !== '') {
      stockValue = Number(stock.replace(',', '.'));
      if (!Number.isInteger(stockValue) || stockValue < 0) {
        Alert.alert('Stock invalide', 'Entrez un nombre entier (0 ou plus), ou laissez vide pour un stock illimité.');
        return;
      }
    }

    setLoading(true);
    try {
      let imageUrl = image;
      if (image && image !== product?.image_url) {
        imageUrl = await api.uploadImage('product-images', image, vendorId || product.vendor_id);
      }

      const productData = {
        vendor_id: vendorId || product.vendor_id,
        name: name.trim(),
        price: Math.round(parsedPrice),
        description: description,
        category,
        stock: stockValue,
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
          style={styles.input}
          placeholder="Stock disponible (vide = illimité)"
          value={stock}
          onChangeText={setStock}
          keyboardType="number-pad"
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
              key={cat.id}
              style={[styles.categoryBtn, category === cat.id && styles.categoryBtnActive]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={[styles.categoryText, category === cat.id && styles.categoryTextActive]}>{cat.emoji} {cat.fullLabel}</Text>
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
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  categoryBtn: { padding: 10, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#FFF' },
  categoryBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryText: { color: COLORS.textSecondary },
  categoryTextActive: { color: '#FFF' },
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
