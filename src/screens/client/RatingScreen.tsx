import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar, ScrollView,
} from 'react-native';
import Icon from '../../components/Icon';
import { COLORS } from '../../constants/colors';

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(n => (
        <TouchableOpacity key={n} onPress={() => onChange(n)} activeOpacity={0.7}>
          <Icon
            name={n <= value ? 'star' : 'star-outline'}
            size={36}
            color={n <= value ? '#F59E0B' : COLORS.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function RatingScreen({ route, navigation }: any) {
  const order = route.params?.order;
  const [vendorRating,   setVendorRating]   = useState(4);
  const [vendorComment,  setVendorComment]  = useState('');
  const [livreurRating,  setLivreurRating]  = useState(5);
  const [livreurComment, setLivreurComment] = useState('');
  const [submitted,      setSubmitted]      = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => navigation.navigate('Accueil'), 2000);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successBox}>
          <View style={styles.successIconBox}>
            <Icon name="checkmark-circle" size={64} color="#22C55E" />
          </View>
          <Text style={styles.successTitle}>Merci pour votre avis !</Text>
          <Text style={styles.successText}>
            Votre note aide la communauté Teranga Market
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1B3A6B" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Votre avis</Text>
          <Text style={styles.headerSub}>Commande #{order?.id?.slice(-5)}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Vendeur */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, styles.avatarVendeur]}>
              <Icon name="storefront" family="material" size={24} color="#1B3A6B" />
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.cardTitle}>Vendeur</Text>
              <Text style={styles.cardSub}>{order?.vendorName ?? 'Épicerie Ndeye Fatou'}</Text>
            </View>
          </View>
          <Text style={styles.rateQuestion}>Qualité des produits et service</Text>
          <StarPicker value={vendorRating} onChange={setVendorRating} />
          <View style={styles.ratingLabel}>
            <Text style={styles.ratingLabelText}>
              {vendorRating === 5 ? 'Excellent !' :
               vendorRating === 4 ? 'Très bien'  :
               vendorRating === 3 ? 'Bien'        :
               vendorRating === 2 ? 'Passable'    : 'Décevant'}
            </Text>
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder="Laisser un commentaire (optionnel)"
            placeholderTextColor={COLORS.textSecondary}
            value={vendorComment}
            onChangeText={setVendorComment}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Livreur */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, styles.avatarLivreur]}>
              <Icon name="bicycle" size={24} color="#22C55E" />
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.cardTitle}>Livreur</Text>
              <Text style={styles.cardSub}>Moussa D.</Text>
            </View>
          </View>
          <Text style={styles.rateQuestion}>Ponctualité et politesse</Text>
          <StarPicker value={livreurRating} onChange={setLivreurRating} />
          <View style={styles.ratingLabel}>
            <Text style={styles.ratingLabelText}>
              {livreurRating === 5 ? 'Excellent !' :
               livreurRating === 4 ? 'Très bien'  :
               livreurRating === 3 ? 'Bien'        :
               livreurRating === 2 ? 'Passable'    : 'Décevant'}
            </Text>
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder="Laisser un commentaire (optionnel)"
            placeholderTextColor={COLORS.textSecondary}
            value={livreurComment}
            onChangeText={setLivreurComment}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Résumé */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{vendorRating}/5</Text>
            <Icon name="star" size={14} color="#F59E0B" />
            <Text style={styles.summarySub}>Vendeur</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{livreurRating}/5</Text>
            <Icon name="star" size={14} color="#F59E0B" />
            <Text style={styles.summarySub}>Livreur</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          activeOpacity={0.9}
        >
          <Icon name="send" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>Envoyer mes notes</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },
  scrollContent:   { padding: 16, gap: 14 },
  avatarVendeur:   { backgroundColor: '#EEF2FF' },
  avatarLivreur:   { backgroundColor: '#EDFBF3' },
  header:          { backgroundColor: '#1B3A6B', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn:         { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerSub:       { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  card:            { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  cardHeader:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:          { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardHeaderInfo:  { flex: 1 },
  cardTitle:       { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  cardSub:         { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  rateQuestion:    { fontSize: 13, color: COLORS.textSecondary },
  starRow:         { flexDirection: 'row', gap: 8 },
  ratingLabel:     { alignSelf: 'flex-start', backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  ratingLabelText: { fontSize: 13, fontWeight: '600', color: '#92400E' },
  commentInput:    { backgroundColor: COLORS.bg, borderRadius: 12, padding: 12, fontSize: 13, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, textAlignVertical: 'top', minHeight: 70 },
  summaryCard:     { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  summaryItem:     { flex: 1, padding: 16, alignItems: 'center', gap: 4 },
  summaryVal:      { fontSize: 24, fontWeight: '700', color: '#1B3A6B' },
  summarySub:      { fontSize: 12, color: COLORS.textSecondary },
  summaryDivider:  { width: 1, backgroundColor: COLORS.border },
  submitBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#E8834A', borderRadius: 16, padding: 16, marginBottom: 24 },
  submitBtnText:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  successBox:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  successIconBox:  { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EDFBF3', alignItems: 'center', justifyContent: 'center' },
  successTitle:    { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  successText:     { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});