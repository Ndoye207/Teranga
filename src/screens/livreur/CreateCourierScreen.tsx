import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import Icon from '../../components/Icon';
import CourierIdentityForm from '../../components/CourierIdentityForm';

export default function CreateCourierScreen({ navigation }: any) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]} edges={['top']}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Livreur</Text>
      </View>

      <ScrollView
        style={[styles.flex1, { backgroundColor: COLORS.bg }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconContainer}>
          <Icon name="bicycle" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Configuration du profil</Text>
        <Text style={styles.subtitle}>
          Pour la sécurité des clients et des vendeurs, votre identité et votre véhicule sont vérifiés avant
          d'accéder aux courses.
        </Text>

        <CourierIdentityForm submitLabel="Enregistrer le profil" onSaved={() => navigation.goBack()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: COLORS.bg },
  flex1:            { flex: 1 },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.primary, gap: 12 },
  backBtn:          { padding: 4 },
  headerTitle:      { fontSize: 18, fontWeight: '700', color: COLORS.white },
  content:          { padding: 20, gap: 16 },
  iconContainer:    { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 10, borderWidth: 1, borderColor: COLORS.border },
  title:            { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  subtitle:         { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 10, lineHeight: 18 },
  label:            { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginTop: 4 },
  input:            { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: COLORS.textPrimary },
  vehicleRow:       { flexDirection: 'row', gap: 10 },
  vehicleBtn:       { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, alignItems: 'center' },
  vehicleBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  vehicleText:      { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  vehicleTextActive:{ color: COLORS.white },
  button:           { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  buttonText:       { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
