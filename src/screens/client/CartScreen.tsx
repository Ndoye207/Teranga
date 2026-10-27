import React, { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, StatusBar, Alert } from 'react-native';
import Icon from '../../components/Icon';
import { Card } from '../../components/Card';
import { COLORS } from '../../constants/colors';
import { useCartStore } from '../../store/useCartStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';

const PAYMENT_METHODS = [
  { id: 'cash',         label: 'Cash',         icon: 'cash',          family: 'ion' },
  { id: 'wave',         label: 'Wave',          icon: 'phone-portrait', family: 'ion' },
  { id: 'orange_money', label: 'Orange Money',  icon: 'phone-portrait', family: 'ion' },
];

const DELIVERY_FEE = 500;

export default function CartScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { items, updateQty, clearCart, total } = useCartStore();
  const { addOrder } = useOrderStore();
  const { user } = useAuthStore();
  const [payment, setPayment] = useState('cash');
  const [address] = useState('Médina, Dakar');

  const handleOrder = () => {
    if (items.length === 0) {
      Alert.alert('Panier vide', 'Ajoute des produits avant de commander');
      return;
    }
    Alert.alert(
      'Confirmer la commande',
      `Total : ${(total() + DELIVERY_FEE).toLocaleString()} F\nPaiement : ${payment}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Commander',
          onPress: async () => {
            try {
              if (user?.id) {
                await api.createOrder({
                  buyer_id: user.id,
                  vendor_id: items[0].product.vendor_id,
                  total_amount: total() + DELIVERY_FEE,
                  shipping_address: address,
                  status: 'pending',
                });
              }
              addOrder({
                id: `CMD-${Date.now()}`,
                clientId: user?.id ?? '1',
                vendorId: items[0].product.vendor_id,
                vendorName: 'Boutique',
                items: [...items],
                totalAmount: total(),
                deliveryFee: DELIVERY_FEE,
                status: 'pending',
                paymentMethod: payment as any,
                deliveryAddress: address,
                createdAt: new Date().toISOString(),
              });
              clearCart();
              navigation.navigate('TrackingTab');
            } catch (err: any) {
              console.error('Erreur creation commande:', err);
              Alert.alert('Erreur', err.message || 'Impossible de passer la commande');
            }
          },
        },
      ]
    );
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon panier</Text>
        </View>

        <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconBox}>
              <Icon name="cart-outline" size={48} color={COLORS.border} />
            </View>
            <Text style={styles.emptyTitle}>Panier vide</Text>
            <Text style={styles.emptyText}>
              Ajoute des produits depuis un vendeur
            </Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => navigation.navigate('Accueil')}
            >
              <Icon name="storefront" family="material" size={16} color="#fff" />
              <Text style={styles.shopBtnText}>Voir les vendeurs</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon panier</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{items.length}</Text>
        </View>
      </View>

      <View style={[styles.flex1, { backgroundColor: COLORS.bg }]}>
        <FlatList
          data={items}
          keyExtractor={i => i.product.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card style={styles.cartRow}>
              <View style={[styles.cartIconBox, { backgroundColor: COLORS.bg }]}>
                <Icon
                  name={
                    item.product.category === 'plats'    ? 'restaurant' :
                    item.product.category === 'traiteur' ? 'people'     : 'leaf'
                  }
                  size={22}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.cartInfo}>
                <Text style={styles.cartName} numberOfLines={1}>{item.product.name}</Text>
                <Text style={styles.cartPrice}>{item.product.price} F × {item.quantity}</Text>
              </View>

              <View style={styles.qtyControl}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQty(item.product.id, item.quantity - 1)}
                >
                  <Icon name="remove" size={14} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.qtyVal}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQty(item.product.id, item.quantity + 1)}
                >
                  <Icon name="add" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </Card>
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              {/* Adresse de livraison */}
              <Card style={styles.sectionBox}>
                <View style={styles.sectionHeader}>
                  <Icon name="location" size={18} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Adresse de livraison</Text>
                </View>
                <Text style={styles.addressText}>{address}</Text>
              </Card>

              {/* Mode de paiement */}
              <Card style={styles.sectionBox}>
                <View style={styles.sectionHeader}>
                  <Icon name="wallet" size={18} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Mode de paiement</Text>
                </View>
                <View style={styles.payRow}>
                  {PAYMENT_METHODS.map(m => {
                    const active = payment === m.id;
                    return (
                      <TouchableOpacity
                        key={m.id}
                        style={[styles.payBtn, active && styles.payBtnActive]}
                        onPress={() => setPayment(m.id)}
                      >
                        <Icon name={m.icon} family={m.family} size={16} color={active ? '#fff' : COLORS.textSecondary} />
                        <Text style={[styles.payBtnText, active && styles.payBtnTextActive]}>{m.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Card>

              {/* Résumé */}
              <Card style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>Résumé</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Sous-total</Text>
                  <Text style={styles.summaryValue}>{total().toLocaleString()} F</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Livraison</Text>
                  <Text style={styles.summaryValue}>{DELIVERY_FEE} F</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{(total() + DELIVERY_FEE).toLocaleString()} F</Text>
                </View>
              </Card>

              {/* Bouton Commander */}
              <TouchableOpacity style={styles.orderBtn} onPress={handleOrder}>
                <Icon name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.orderBtnText}>Valider la commande</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },
  flex1:           { flex: 1 },
  header:          { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle:     { fontSize: 18, fontWeight: '700', color: COLORS.white },
  headerBadge:     { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  headerBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  emptyBox:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  emptyIconBox:    { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  emptyTitle:      { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptyText:       { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  shopBtn:         { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginTop: 8 },
  shopBtnText:     { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  cartRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  cartIconBox:     { width: 46, height: 46, borderRadius: 14, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  cartInfo:        { flex: 1 },
  cartName:        { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  cartPrice:       { fontSize: 12, color: COLORS.accent, marginTop: 3, fontWeight: '500' },
  qtyControl:      { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.bg, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6 },
  qtyBtn:          { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  qtyVal:          { fontSize: 14, fontWeight: '700', color: COLORS.primary, minWidth: 18, textAlign: 'center' },
  summaryBox:      { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  summaryTitle:    { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  summaryRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryLabel:    { fontSize: 13, color: COLORS.textSecondary },
  summaryValue:    { fontSize: 13, color: COLORS.textPrimary, fontWeight: '500' },
  divider:         { height: 1, backgroundColor: COLORS.border },
  totalLabel:      { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  totalValue:      { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  sectionBox:      { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle:    { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  addressText:     { fontSize: 13, color: COLORS.textSecondary },
  payRow:          { flexDirection: 'row', gap: 8 },
  payBtn:          { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  payBtnActive:    { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  payBtnText:      { fontSize: 11, fontWeight: '500', color: COLORS.textSecondary },
  payBtnTextActive:{ color: COLORS.white },
  orderBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.accent, borderRadius: 16, padding: 16 },
  orderBtnText:    { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  footer:          { gap: 14, padding: 16 },
});
