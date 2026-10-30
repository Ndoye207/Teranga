import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Linking, ActivityIndicator, ViewStyle,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { api, CourierPublicInfo } from '../services/api';
import Icon from './Icon';

interface Props {
  orderId: string;
  /** client : « Votre livreur » · vendeur : « Livreur de cette commande » + consigne de remise */
  variant: 'client' | 'vendor';
  /** false une fois la commande livrée : plus besoin d'appeler */
  allowCall?: boolean;
  style?: ViewStyle;
}

export default function CourierCard({ orderId, variant, allowCall = true, style }: Props) {
  const [courier, setCourier] = useState<CourierPublicInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.getOrderCourier(orderId)
      .then(c => { if (alive) setCourier(c); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [orderId]);

  const hint = variant === 'client'
    ? 'Vérifiez que la personne qui sonne correspond à cette photo avant de recevoir votre commande.'
    : 'Avant de remettre la commande, vérifiez que le livreur correspond à cette photo et à cette plaque.';

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{variant === 'client' ? 'Votre livreur' : 'Livreur de cette commande'}</Text>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 12 }} />
      ) : (
        <>
          <View style={styles.row}>
            {courier?.photo_url ? (
              <Image source={{ uri: courier.photo_url }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoEmpty]}>
                <Icon name="person" size={30} color={COLORS.textSecondary} />
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{courier?.full_name || 'Livreur assigné'}</Text>
              {courier?.vehicle_type ? <Text style={styles.vehicle}>{courier.vehicle_type}</Text> : null}
              {courier?.plate ? (
                <View style={styles.plateBox}>
                  <Text style={styles.plateText}>{courier.plate}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {courier?.phone && allowCall ? (
            <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${courier.phone}`)}>
              <Icon name="call" size={16} color="#fff" />
              <Text style={styles.callBtnText}>Appeler le livreur</Text>
            </TouchableOpacity>
          ) : null}

          {allowCall ? (
            <View style={styles.hintRow}>
              <Icon name="shield-checkmark" size={14} color="#166534" />
              <Text style={styles.hintText}>{hint}</Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card:       { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  title:      { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  row:        { flexDirection: 'row', alignItems: 'center', gap: 14 },
  photo:      { width: 64, height: 64, borderRadius: 32 },
  photoEmpty: { backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  info:       { flex: 1, gap: 4 },
  name:       { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  vehicle:    { fontSize: 13, color: COLORS.textSecondary },
  plateBox:   { alignSelf: 'flex-start', borderWidth: 1.5, borderColor: COLORS.textPrimary, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: '#FFFBEB' },
  plateText:  { fontSize: 14, fontWeight: '800', letterSpacing: 1.5, color: COLORS.textPrimary },
  callBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 12, minHeight: 44 },
  callBtnText:{ color: '#fff', fontSize: 14, fontWeight: '700' },
  hintRow:    { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: '#F0FDF4', borderRadius: 10, padding: 10 },
  hintText:   { flex: 1, fontSize: 12, color: '#166534', lineHeight: 17 },
});
