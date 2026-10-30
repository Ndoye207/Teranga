import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, StatusBar, ActivityIndicator, Alert, ScrollView } from 'react-native';
import Icon from '../../components/Icon';
import { Card } from '../../components/Card';
import { COLORS } from '../../constants/colors';
import { Vendor, Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { api } from '../../services/api';
import { normalizeCategory, categoryOf } from '../../utils/category';
import { CATEGORIES } from '../../constants/categories';

export default function VendorScreen({ route, navigation }: any) {
  const initialVendor: Vendor = route?.params?.vendor;
  const [vendor, setVendor] = useState<Vendor | null>(initialVendor || null);
  const [activeTab, setTab] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { items, addItem, updateQty } = useCartStore();
  const cartTotal = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const fetchVendorAndProducts = async () => {
      try {
        setLoading(true);
        if (initialVendor?.id) {
          const data = await api.getProducts(initialVendor.id);
          setProducts(data);
        }
      } catch (err) {
        console.error("Erreur chargement produits vendeur:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorAndProducts();
  }, [initialVendor]);

  // Onglets : « Tous » + seulement les catégories présentes chez ce vendeur
  const presentIds = new Set(products.map(p => normalizeCategory(p.category)));
  const tabs = [
    { id: 'all', label: 'Tous', icon: 'grid' },
    ...CATEGORIES.filter(c => presentIds.has(c.id)).map(c => ({ id: c.id as string, label: c.fullLabel, icon: c.icon })),
  ];
  const filtered = activeTab === 'all'
    ? products
    : products.filter(p => normalizeCategory(p.category) === activeTab);

  const getItemCount = (productId: string) => {
    const found = items.find(i => i.product.id === productId);
    return found ? found.quantity : 0;
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const qty = getItemCount(item.id);
    const outOfStock = item.stock != null && item.stock <= 0;
    const lowStock = item.stock != null && item.stock > 0 && item.stock <= 5;
    const stockAlert = () => Alert.alert('Stock limité', `Il ne reste que ${item.stock} « ${item.name} » en stock.`);
    return (
      <Card style={styles.productCard}>
        <View style={styles.productLeft}>
          <View style={[styles.productIconBox, { backgroundColor: COLORS.bg }]}>
            <Text style={styles.productEmoji}>
              {categoryOf(item.category).emoji}
            </Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.productCat} numberOfLines={1}>{categoryOf(item.category).fullLabel}</Text>
            <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
            <Text style={styles.productPrice}>{item.price.toLocaleString()} F</Text>
            {outOfStock && <Text style={styles.stockOut}>Rupture de stock</Text>}
            {lowStock && <Text style={styles.stockLow}>Plus que {item.stock} en stock</Text>}
          </View>
        </View>

        <View style={styles.productRight}>
          {outOfStock ? (
            <View style={[styles.addBtn, { opacity: 0.35 }]}>
              <Icon name="close" size={20} color="#fff" />
            </View>
          ) : qty > 0 ? (
            <View style={styles.qtyBox}>
              <TouchableOpacity
                style={styles.qtyBtnMini}
                onPress={() => updateQty(item.id, qty - 1)}
              >
                <Icon name="remove" size={14} color="#1B3A6B" />
              </TouchableOpacity>
              <Text style={styles.qtyCount}>{qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtnMini}
                onPress={() => { if (!updateQty(item.id, qty + 1)) stockAlert(); }}
              >
                <Icon name="add" size={14} color="#1B3A6B" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addBtn, initialVendor?.isOpen === false && { opacity: 0.4 }]}
              onPress={() => {
                if (initialVendor?.isOpen === false) {
                  Alert.alert('Boutique fermée', 'Cette boutique ne prend pas de commande pour le moment.');
                  return;
                }
                if (!addItem(item)) stockAlert();
              }}
            >
              <Icon name="add" family="material" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#1B3A6B' }]} edges={['top']}>
      <StatusBar backgroundColor="#1B3A6B" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.vendorName} numberOfLines={1}>{vendor?.name}</Text>
          <View style={styles.headerMeta}>
            <Icon name="star" size={12} color="#F59E0B" />
            <Text style={styles.headerMetaText}>{vendor?.rating}/5</Text>
            <Text style={styles.headerMetaDot}>·</Text>
            <View style={[
              styles.statusBadge,
              vendor?.isOpen ? styles.statusBadgeOpen : styles.statusBadgeClosed
            ]}>
              <Text style={[
                styles.statusBadgeText,
                vendor?.isOpen ? styles.statusBadgeTextOpen : styles.statusBadgeTextClosed
              ]}>
                {vendor?.isOpen ? 'Ouvert' : 'Fermé'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setTab(tab.id)}
            >
              <Icon
                name={tab.icon}
                size={16}
                color={activeTab === tab.id ? '#1B3A6B' : COLORS.textSecondary}
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1B3A6B" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={i => i.id}
            renderItem={renderProduct}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Icon name="basket-outline" size={40} color={COLORS.border} />
                <Text style={styles.emptyText}>Aucun produit disponible</Text>
              </View>
            }
          />
        )}

        {/* Cart FAB */}
        {cartTotal > 0 && (
          <TouchableOpacity
            style={styles.cartFab}
            onPress={() => navigation.navigate('CartTab')}
            activeOpacity={0.9}
          >
            <View style={styles.cartFabLeft}>
              <View style={styles.cartFabBadge}>
                <Text style={styles.cartFabBadgeText}>{cartTotal}</Text>
              </View>
              <Text style={styles.cartFabText}>Voir le panier</Text>
            </View>
            <Icon name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: COLORS.bg },
  flex1:            { flex: 1 },
  header:           { backgroundColor: '#1B3A6B', flexDirection: 'row', alignItems: 'center', paddingTop: 6, paddingBottom: 14, paddingHorizontal: 14, gap: 12 },
  backBtn:          { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerCenter:     { flex: 1 },
  vendorName:       { fontSize: 16, fontWeight: '700', color: '#fff' },
  headerMeta:       { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  headerMetaText:   { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  headerMetaDot:    { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  statusBadge:      { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  statusBadgeText:  { fontSize: 11, fontWeight: '600' },
  statusBadgeOpen:  { backgroundColor: '#DCFCE7' },
  statusBadgeClosed: { backgroundColor: '#FEE2E2' },
  statusBadgeTextOpen: { color: '#166534' },
  statusBadgeTextClosed: { color: '#991B1B' },
  tabsScroll:       { flexGrow: 0, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabsContent:      { paddingHorizontal: 8 },
  tab:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, paddingHorizontal: 14 },
  tabActive:        { borderBottomWidth: 2, borderBottomColor: '#1B3A6B' },
  tabText:          { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  tabTextActive:    { color: '#1B3A6B', fontWeight: '700' },
  listContent:      { padding: 16, gap: 12 },
  productCard:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  productLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  productIconBox:   { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  productEmoji:     { fontSize: 26 },
  productInfo:      { flex: 1, gap: 3 },
  productName:      { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  productCat:       { fontSize: 11, fontWeight: '600', color: COLORS.primary, marginBottom: 2 },
  stockOut:         { fontSize: 11, fontWeight: '700', color: COLORS.danger, marginTop: 2 },
  stockLow:         { fontSize: 11, fontWeight: '600', color: COLORS.warning, marginTop: 2 },
  productDesc:      { fontSize: 12, color: COLORS.textSecondary },
  productPrice:     { fontSize: 13, fontWeight: '700', color: COLORS.accent, marginTop: 2 },
  productRight:     { alignItems: 'center', justifyContent: 'center' },
  addBtn:           { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  qtyBox:           { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.bg, borderRadius: 10, padding: 4, borderWidth: 1, borderColor: COLORS.border },
  qtyBtnMini:       { width: 26, height: 26, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  qtyCount:         { fontSize: 13, fontWeight: '700', color: '#1B3A6B', minWidth: 16, textAlign: 'center' },
  loadingBox:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyBox:         { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
  emptyText:        { fontSize: 13, color: COLORS.textSecondary },
  cartFab:          { position: 'absolute', bottom: 20, left: 16, right: 16, backgroundColor: COLORS.accent, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  cartFabLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartFabBadge:     { width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  cartFabBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.accent },
  cartFabText:      { fontSize: 15, fontWeight: '700', color: '#fff' },
});
