import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import Icon from '../../components/Icon';
import { Card } from '../../components/Card';
import { COLORS } from '../../constants/colors';
import { Vendor, Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { api } from '../../services/api';

const TABS = [
  { id: 'legumes',  label: 'Légumes',  icon: 'leaf' },
  { id: 'plats',    label: 'Plats',    icon: 'restaurant' },
  { id: 'traiteur', label: 'Traiteur', icon: 'people' },
];

export default function VendorScreen({ route, navigation }: any) {
  const initialVendor: Vendor = route?.params?.vendor;
  const [vendor, setVendor] = useState<Vendor | null>(initialVendor || null);
  const [activeTab, setTab] = useState('legumes');
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

  const matchCategory = (prodCat: string, tabId: string) => {
    const c = (prodCat || '').toLowerCase().trim();
    const t = tabId.toLowerCase().trim();
    if (c === t) return true;
    if (t === 'plats' && (c === 'repas' || c === 'plat')) return true;
    if (t === 'legumes' && (c === 'légumes' || c === 'legume')) return true;
    if (t === 'traiteur' && (c === 'service' || c === 'services')) return true;
    return false;
  };

  const matchedProducts = products.filter(p => matchCategory(p.category || '', activeTab));
  const filtered = matchedProducts.length > 0 ? matchedProducts : products;

  const getItemCount = (productId: string) => {
    const found = items.find(i => i.product.id === productId);
    return found ? found.quantity : 0;
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const qty = getItemCount(item.id);
    return (
      <Card style={styles.productCard}>
        <View style={styles.productLeft}>
          <View style={[styles.productIconBox, { backgroundColor: COLORS.bg }]}>
            <Text style={styles.productEmoji}>
              {item.category === 'plats' ? '🍛' : item.category === 'traiteur' ? '🎉' : '🥬'}
            </Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
            <Text style={styles.productPrice}>{item.price.toLocaleString()} F</Text>
          </View>
        </View>

        <View style={styles.productRight}>
          {qty > 0 ? (
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
                onPress={() => updateQty(item.id, qty + 1)}
              >
                <Icon name="add" size={14} color="#1B3A6B" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addBtn} onPress={() => addItem(item)}>
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
  tabs:             { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab:              { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13 },
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
