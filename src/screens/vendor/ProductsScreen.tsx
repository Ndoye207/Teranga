import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, StatusBar, Alert, ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { Product } from '../../types';
import { vendorService } from '../../services/vendorService';
import { api } from '../../services/api';
import { normalizeCategory, categoryOf } from '../../utils/category';
import { CATEGORIES } from '../../constants/categories';

// « Tous » + toutes les catégories officielles (libellés complets)
const TABS = [{ id: 'all', label: 'Tous' }, ...CATEGORIES.map(c => ({ id: c.id as string, label: c.fullLabel }))];

export default function ProductsScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab]   = useState('all');
  const [products, setProducts]     = useState<Product[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const [vendorId, setVendorId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const vendor = await api.getMyVendor();
      if (!vendor) {
        Alert.alert('Boutique introuvable', "Créez d'abord votre boutique depuis l'accueil.");
        return;
      }
      setVendorId(vendor.id);
      setProducts(await api.getAllProducts(vendor.id));
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les produits');
    }
  };

  const filtered = activeTab === 'all'
    ? products
    : products.filter(p => normalizeCategory(p.category) === activeTab);

  const toggleAvailable = async (product: Product) => {
    try {
      await vendorService.updateProduct(product.id, { is_active: product.is_active === false });
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
            {categoryOf(item.category).emoji}
          </Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCat}>{categoryOf(item.category).fullLabel}</Text>
          <Text style={styles.productPrice}>
            {item.price.toLocaleString()} F
          </Text>
          <Text style={[
            styles.productStock,
            item.stock != null && item.stock <= 0 && { color: COLORS.danger, fontWeight: '700' },
            item.stock != null && item.stock > 0 && item.stock <= 5 && { color: COLORS.warning, fontWeight: '700' },
          ]}>
            {item.stock == null ? 'Stock illimité'
              : item.stock <= 0 ? 'Rupture de stock'
              : `Stock : ${item.stock}`}
          </Text>
          <TouchableOpacity
            style={[
              styles.availBadge,
              item.is_active !== false ? styles.availBadgeAvailable : styles.availBadgeUnavailable
            ]}
            onPress={() => toggleAvailable(item)}
          >
            <Text style={[
              styles.availText,
              item.is_active !== false ? styles.availTextAvailable : styles.availTextUnavailable
            ]}>
              {item.is_active !== false ? '● Disponible' : '● Indisponible'}
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
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes produits</Text>
        <Text style={styles.headerSub}>{products.length} produits au total</Text>
      </View>

      <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label} ({tab.id === 'all' ? products.length : products.filter(p => normalizeCategory(p.category) === tab.id).length})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
              onPress={() => {
                if (!vendorId) {
                  Alert.alert('Boutique introuvable', "Créez d'abord votre boutique.");
                  return;
                }
                navigation.navigate('AddProduct', { vendorId });
              }}
            >
              <Text style={styles.addBtnText}>+ Ajouter un produit</Text>
            </TouchableOpacity>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bg },
  flex1:          { flex: 1 },
  header:         { backgroundColor: COLORS.primary, paddingBottom: 16, paddingHorizontal: 16 },
  headerTitle:    { fontSize: 18, fontWeight: '600', color: COLORS.white },
  headerSub:      { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  tabsScroll:     { flexGrow: 0, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabsContent:    { paddingHorizontal: 8 },
  tab:            { paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
  tabActive:      { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText:        { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  tabTextActive:  { color: COLORS.primary },
  productCard:    { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  productLeft:    { flexDirection: 'row', gap: 10, flex: 1 },
  productIcon:    { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  productInfo:    { flex: 1, gap: 4 },
  productName:    { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  productCat:     { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  productStock:   { fontSize: 12, color: COLORS.textSecondary },
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