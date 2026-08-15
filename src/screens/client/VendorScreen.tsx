import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import Icon from '../../components/Icon';
import { COLORS } from '../../constants/colors';
import { Product, Vendor } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { api } from '../../services/api';
const TABS = [
  { id: 'légumes', label: 'Légumes', icon: 'leaf',       color: '#22C55E', bg: '#EDFBF3' },
  { id: 'repas',   label: 'Plats',   icon: 'restaurant', color: '#E8834A', bg: '#FEF0E8' },
  { id: 'service', label: 'Traiteur',icon: 'people',     color: '#8B5CF6', bg: '#F3EEFB' },
];

export default function VendorScreen({ route, navigation }: any) {
  const vendor: Vendor | undefined = route.params?.vendor;
  const [activeTab, setTab] = useState('légumes');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const { addItem, items } = useCartStore();

  const loadProducts = useCallback(async () => {
    if (!vendor?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getProducts(vendor.id);
      setProducts(data as unknown as Product[]);
    } catch (err) {
      console.error("Erreur chargement produits:", err);
    } finally {
      setLoading(false);
    }
  }, [vendor?.id]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filtered = products.filter(p => p.category?.toLowerCase() === activeTab.toLowerCase() && p.is_active);
  const cartTotal  = items.reduce((s, i) => s + i.quantity, 0);
  const getQty     = (id: string) => items.find(i => i.product.id === id)?.quantity ?? 0;
  const activeTabData = TABS.find(t => t.id === activeTab)!;

  const renderProduct = ({ item }: { item: Product }) => {
    const qty = getQty(item.id);
    return (
      <View style={styles.productCard}>
        <View style={[styles.productIconBox, { backgroundColor: activeTabData.bg }]}>
          <Icon name={activeTabData.icon} size={24} color={activeTabData.color} />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
        </View>
        <View style={styles.productRight}>
          <Text style={styles.productPrice}>{item.price.toLocaleString()} F</Text>
          {qty > 0 ? (
            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => useCartStore.getState().updateQty(item.id, qty - 1)}
              >
                <Icon name="remove" family="material" size={16} color="#1B3A6B" />
              </TouchableOpacity>
              <Text style={styles.qtyVal}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => addItem(item)}>
                <Icon name="add" family="material" size={16} color="#1B3A6B" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addBtn} onPress={() => addItem(item)}>
              <Icon name="add" family="material" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(tab => (
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
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: COLORS.bg },
  header:           { backgroundColor: '#1B3A6B', flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
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
  tabs:             { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab:              { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13 },
  tabActive:        { borderBottomWidth: 2, borderBottomColor: '#1B3A6B' },
  tabText:          { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  tabTextActive:    { color: '#1B3A6B', fontWeight: '700' },
  productCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  productIconBox:   { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  productInfo:      { flex: 1 },
  productName:      { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  productUnit:      { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  productRight:     { alignItems: 'flex-end', gap: 8 },
  productPrice:     { fontSize: 14, fontWeight: '700', color: '#E8834A' },
  qtyControl:       { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#EEF2FF', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6 },
  qtyBtn:           { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  qtyVal:           { fontSize: 14, fontWeight: '700', color: '#1B3A6B', minWidth: 18, textAlign: 'center' },
  addBtn:           { width: 34, height: 34, borderRadius: 10, backgroundColor: '#E8834A', alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, gap: 10 },
  loadingBox:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBox:         { padding: 40, alignItems: 'center', gap: 10 },
  emptyText:        { fontSize: 14, color: COLORS.textSecondary },
  cartFab:          { position: 'absolute', bottom: 20, left: 16, right: 16, backgroundColor: '#1B3A6B', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartFabLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartFabBadge:     { width: 26, height: 26, borderRadius: 13, backgroundColor: '#E8834A', alignItems: 'center', justifyContent: 'center' },
  cartFabBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  cartFabText:      { color: '#fff', fontSize: 14, fontWeight: '600' },
  notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  notFoundText:     { color: COLORS.textPrimary },
  notFoundLink:     { color: COLORS.primary, marginTop: 10, fontWeight: 'bold' },
  });