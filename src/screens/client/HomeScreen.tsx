import React, { useState, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import Icon from '../../components/Icon';
import { Card } from '../../components/Card';
import { COLORS } from '../../constants/colors';
import { Vendor } from '../../types';
import { normalizeCategory, ShopCategory } from '../../utils/category';
import { CATEGORIES, getCategory } from '../../constants/categories';

import { api } from '../../services/api';

// Filtres : « Tous » + toutes les catégories officielles (constants/categories.ts)
const FILTERS = [
  { id: 'all', label: 'Tous', icon: 'grid', bg: '#E8F0FB', color: '#1B3A6B' },
  ...CATEGORIES.map(c => ({ id: c.id as string, label: c.fullLabel, icon: c.icon, bg: c.bg, color: c.color })),
];

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('all');
  const [vendors, setVendors]   = useState<Vendor[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { loadVendors(); }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const data = await api.getVendors();
      const mappedVendors: Vendor[] = data.map(v => ({
        id: v.id,
        name: v.store_name,
        address: v.address || '',
        city: '', 
        latitude: 0, 
        longitude: 0, 
        rating: v.rating || 0,
        totalOrders: 0, 
        isOpen: v.is_open ?? true,
        categories: Array.from(new Set(
          (v.products || [])
            .map(p => normalizeCategory(p.category))
            .filter((c): c is ShopCategory => c !== null),
        )),
      }));
      setVendors(mappedVendors);
    } catch (err) {
      console.error("Erreur chargement vendeurs:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = vendors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === 'all' || v.categories.includes(category as any);
    return matchSearch && matchCat;
  });

  const renderCategory = ({ item }: any) => {
    const isActive = category === item.id;
    return (
      <TouchableOpacity
        style={[styles.catBtn, isActive && styles.catBtnActive]}
        onPress={() => setCategory(item.id)}
      >
        <View style={[
          styles.catIconBox,
          isActive ? styles.catIconBoxActive : { backgroundColor: item.bg }
        ]}>
          <Icon
            name={item.icon}
            size={16}
            color={isActive ? '#fff' : item.color}
          />
        </View>
        <Text style={[styles.catLabel, isActive && styles.catLabelActive]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderVendor = ({ item }: { item: Vendor }) => (
    <Card style={styles.vendorCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Vendor', { vendor: item })}
        activeOpacity={0.85}
      >
        <View style={styles.vendorImgBox}>
          <View style={styles.vendorImgIcon}>
            <Icon
              name={getCategory(item.categories[0]).icon}
              size={36}
              color={COLORS.primary}
            />
          </View>
          {!item.isOpen && (
            <View style={styles.closedOverlay}>
              <Text style={styles.closedText}>Fermé</Text>
            </View>
          )}
          {item.badge === 'top' && (
            <View style={styles.topBadge}>
              <Icon name="star" size={10} color="#92400E" />
              <Text style={styles.topBadgeText}>Top</Text>
            </View>
          )}
        </View>

        <View style={styles.vendorInfo}>
          {item.categories.length > 0 && (
            <Text style={styles.vendorCats} numberOfLines={1}>
              {item.categories.map(c => getCategory(c).fullLabel).join(' · ')}
            </Text>
          )}
          <View style={styles.vendorTopRow}>
            <Text style={styles.vendorName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.ratingPill}>
              <Icon name="star" size={11} color="#F59E0B" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#1B3A6B' }]} edges={['top']}>
      <StatusBar backgroundColor="#1B3A6B" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <View style={styles.locationRow}>
              <Icon name="location" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.location}>Dakar, Sénégal</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Icon name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="rgba(255,255,255,0.7)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Chercher un vendeur ou un plat..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close-circle" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
        {/* Categories */}
        <FlatList
          data={FILTERS}
          keyExtractor={i => i.id}
          renderItem={renderCategory}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catList}
          contentContainerStyle={styles.catListContent}
        />

        {/* Vendors */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1B3A6B" />
            <Text style={styles.loadingText}>Chargement des vendeurs...</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={i => i.id}
            renderItem={renderVendor}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.vendorListContent}
            ListHeaderComponent={
              <Text style={styles.sectionTitle}>
                {filtered.length} vendeur{filtered.length > 1 ? 's' : ''} près de vous
              </Text>
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Icon name="search" size={40} color={COLORS.border} />
                <Text style={styles.emptyText}>Aucun vendeur trouvé</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },
  flex1:           { flex: 1 },
  catBtnActive:    { backgroundColor: '#1B3A6B', borderColor: '#1B3A6B' },
  catLabelActive:  { color: '#fff' },
  catListContent:  { paddingHorizontal: 16, gap: 8 },
  vendorListContent: { padding: 16, gap: 12 },
  header:          { backgroundColor: '#1B3A6B', paddingHorizontal: 16, paddingBottom: 20, paddingTop: 6 },
  headerTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  greeting:        { fontSize: 18, fontWeight: '700', color: '#fff' },
  locationRow:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  location:        { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  notifBtn:        { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  searchBox:       { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  searchInput:     { flex: 1, fontSize: 14, color: '#fff', padding: 0 },
  catList:         { backgroundColor: '#fff', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexGrow: 0 },
  catBtn:          { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  catIconBox:      { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  catIconBoxActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  catLabel:        { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  sectionTitle:    { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  vendorCard:      { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  vendorImgBox:    { height: 110, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  vendorImgIcon:   { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  closedOverlay:   { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  closedText:      { color: '#fff', fontWeight: '700', fontSize: 16 },
  topBadge:        { position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  topBadgeText:    { fontSize: 11, fontWeight: '700', color: '#92400E' },
  vendorInfo:      { padding: 12, gap: 6 },
  vendorTopRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vendorCats:      { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  vendorName:      { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  ratingPill:      { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  ratingText:      { fontSize: 12, fontWeight: '700', color: '#92400E' },
  loadingBox:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText:     { fontSize: 13, color: COLORS.textSecondary },
  emptyBox:        { padding: 40, alignItems: 'center', gap: 10 },
  emptyText:       { fontSize: 14, color: COLORS.textSecondary },
});
