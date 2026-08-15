import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { Product } from '../../types';
import { vendorService } from '../../services/vendorService';
import { supabase } from '../../services/supabase';

const TABS = ['Légumes', 'Plats', 'Traiteur'];
const CAT_MAP: Record<string, string> = {
  'Légumes': 'légumes', 'Plats': 'repas', 'Traiteur': 'service',
};
export default function ProductsScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab]   = useState('Légumes');
  const [products, setProducts]     = useState<Product[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const fetchProducts = async () => {
    // 1. Get current user's vendor record
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: vendorData } = await supabase
      .from('vendors')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (!vendorData) {
      Alert.alert('Erreur', 'Boutique introuvable');
      return;
    }

    // 2. Fetch products for this vendor
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorData.id);

    if (error) {
      Alert.alert('Erreur', 'Impossible de charger les produits');
    } else {
      setProducts(data || []);
    }
  };

  const filtered = products.filter(
    p => p.category === CAT_MAP[activeTab]
  );

  const toggleAvailable = async (product: Product) => {
    try {
      await vendorService.updateProduct(product.id, { is_active: !product.is_active });
      await fetchProducts();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le produit');
    }
  };

  const deleteProduct = async (id: string) => {
    Alert.alert('Supprimer', 'Confirmer la suppression ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await vendorService.deleteProduct(id);
            await fetchProducts();
          } catch (error: any) {
            Alert.alert('Erreur', error.message || 'Impossible de supprimer le produit');
          }
        },
      },
    ]);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productLeft}>
        <View style={styles.productIcon}>
          <Text style={styles.productIconText}>
            {item.category === 'plats' ? '🍛' : item.category === 'traiteur' ? '🎉' : '🥬'}
          </Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>
            {item.price.toLocaleString()} F
          </Text>
          <TouchableOpacity
            style={[
              styles.availBadge,
              item.is_active ? styles.availBadgeAvailable : styles.availBadgeUnavailable
            ]}
            onPress={() => toggleAvailable(item)}
          >
            <Text style={[
              styles.availText,
              item.is_active ? styles.availTextAvailable : styles.availTextUnavailable
            ]}>
              {item.is_active ? '● Disponible' : '● Indisponible'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity 
          style={styles.editBtn}
          onPress={() => navigation.navigate('AddProduct', { product: item })}
        >
          <Text style={styles.editBtnText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteProduct(item.id)}
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes produits</Text>
        <Text style={styles.headerSub}>{products.length} produits au total</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderProduct}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Aucun produit dans cette catégorie</Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={async () => {
              if (products.length > 0) {
                navigation.navigate('AddProduct', { vendorId: products[0].vendor_id });
              } else {
                // Fetch vendor ID if list is empty
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  const { data: vendorData } = await supabase
                    .from('vendors')
                    .select('id')
                    .eq('profile_id', user.id)
                    .single();
                  if (vendorData) {
                    navigation.navigate('AddProduct', { vendorId: vendorData.id });
                  } else {
                    Alert.alert('Erreur', 'Boutique introuvable');
                  }
                }
              }
            }}
          >
            <Text style={styles.addBtnText}>+ Ajouter un produit</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bg },
  header:         { backgroundColor: COLORS.primary, padding: 16 },
  headerTitle:    { fontSize: 18, fontWeight: '600', color: COLORS.white },
  headerSub:      { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  tabs:           { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab:            { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive:      { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText:        { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  tabTextActive:  { color: COLORS.primary },
  productCard:    { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  productLeft:    { flexDirection: 'row', gap: 10, flex: 1 },
  productIcon:    { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  productInfo:    { flex: 1, gap: 4 },
  productName:    { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  productPrice:   { fontSize: 13, color: COLORS.accent, fontWeight: '500' },
  availBadge:     { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  availText:      { fontSize: 11, fontWeight: '600' },
  productActions: { gap: 6, alignItems: 'flex-end' },
  editBtn:        { backgroundColor: COLORS.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.border },
  editBtnText:    { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },
  deleteBtn:      { backgroundColor: '#FEE2E2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  deleteBtnText:  { fontSize: 11, color: '#991B1B', fontWeight: '600' },
  emptyBox:       { padding: 40, alignItems: 'center' },
  emptyText:       { fontSize: 13, color: COLORS.textSecondary },
  listContent:     { padding: 16, gap: 10 },
  addBtn:         { backgroundColor: 'transparent', borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.accent, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  addBtnText:     { color: COLORS.accent, fontWeight: '600', fontSize: 14 },
  availBadgeAvailable: { backgroundColor: '#DCFCE7' },
  availBadgeUnavailable: { backgroundColor: '#FEE2E2' },
  availTextAvailable: { color: '#166534' },
  availTextUnavailable: { color: '#991B1B' },
  productIconText: { fontSize: 22 },
});