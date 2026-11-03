import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image,
} from 'react-native';
import { pickPhoto } from '../utils/pickImage';
import { COLORS } from '../constants/colors';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import { VEHICLES, vehicleNeedsPlateAndLicense } from '../utils/courier';
import Icon from './Icon';

// uri = nouvelle image choisie dans la galerie ; saved = valeur déjà enregistrée en base
type Doc = { uri: string | null; saved: string | null };
const emptyDoc: Doc = { uri: null, saved: null };

function DocPicker({ label, hint, doc, previewSaved, onPick }: {
  label: string; hint: string; doc: Doc; previewSaved?: boolean; onPick: () => void;
}) {
  const ok = !!(doc.uri || doc.saved);
  // Photo de profil : on peut afficher l'URL enregistrée. Pièces privées : pas d'aperçu.
  const preview = doc.uri ?? (previewSaved ? doc.saved : null);
  return (
    <TouchableOpacity style={[styles.doc, ok && styles.docOk]} onPress={onPick} activeOpacity={0.8}>
      {preview ? (
        <Image source={{ uri: preview }} style={styles.docThumb} />
      ) : (
        <View style={[styles.docThumb, styles.docThumbEmpty]}>
          <Icon name={ok ? 'checkmark-circle' : 'camera-outline'} size={26} color={ok ? '#22C55E' : COLORS.textSecondary} />
        </View>
      )}
      <View style={styles.docInfo}>
        <Text style={styles.docLabel}>{label}</Text>
        <Text style={[styles.docHint, ok && { color: '#166534' }]}>
          {doc.uri ? 'Nouvelle image sélectionnée' : doc.saved ? 'Déjà enregistré · toucher pour remplacer' : hint}
        </Text>
      </View>
      <Icon name="chevron-forward" size={18} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
}

export default function CourierIdentityForm({ submitLabel, onSaved }: {
  submitLabel: string;
  onSaved: () => void;
}) {
  const { user } = useAuthStore();
  const [vehicle, setVehicle] = useState<string>('Moto');
  const [phone, setPhone] = useState(user?.phone || '');
  const [plate, setPlate] = useState('');
  const [photo, setPhoto] = useState<Doc>(emptyDoc);
  const [idCard, setIdCard] = useState<Doc>(emptyDoc);
  const [license, setLicense] = useState<Doc>(emptyDoc);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const needsVehicleDocs = vehicleNeedsPlateAndLicense(vehicle);

  // Préremplit avec le profil existant (livreurs créés avant l'ajout des pièces obligatoires)
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.getCourierProfile(user.id)
      .then(p => {
        if (!p) return;
        setVehicle(p.vehicle_type);
        setPhone(p.phone);
        setPlate(p.plate ?? '');
        setPhoto({ uri: null, saved: p.photo_url ?? null });
        setIdCard({ uri: null, saved: p.id_card_path ?? null });
        setLicense({ uri: null, saved: p.license_path ?? null });
      })
      .catch(() => Alert.alert('Erreur', 'Impossible de charger votre profil livreur.'))
      .finally(() => setLoading(false));
  }, [user]);

  const pick = async (setDoc: React.Dispatch<React.SetStateAction<Doc>>) => {
    const uri = await pickPhoto({ quality: 0.7, maxWidth: 1600, maxHeight: 1600 });
    if (uri) setDoc(d => ({ ...d, uri }));
  };

  const save = async () => {
    if (!user || saving) return;
    const cleanPhone = phone.trim();
    const cleanPlate = plate.trim().toUpperCase();

    const missing: string[] = [];
    if (!cleanPhone) missing.push('numéro de téléphone');
    if (!photo.uri && !photo.saved) missing.push('photo de profil');
    if (!idCard.uri && !idCard.saved) missing.push("pièce d'identité");
    if (needsVehicleDocs) {
      if (!cleanPlate) missing.push("plaque d'immatriculation");
      if (!license.uri && !license.saved) missing.push('permis de conduire');
    }
    if (missing.length > 0) {
      Alert.alert('Informations obligatoires', `Il manque : ${missing.join(', ')}.`);
      return;
    }

    setSaving(true);
    try {
      // On n'envoie que les images nouvellement choisies ; les autres gardent leur valeur en base
      const photoUrl = photo.uri ? await api.uploadCourierFile('photo', photo.uri, user.id) : photo.saved!;
      const idCardPath = idCard.uri ? await api.uploadCourierFile('id_card', idCard.uri, user.id) : idCard.saved!;
      const licensePath = !needsVehicleDocs
        ? ''
        : license.uri ? await api.uploadCourierFile('license', license.uri, user.id) : license.saved!;

      await api.becomeCourier({
        vehicle, phone: cleanPhone, plate: needsVehicleDocs ? cleanPlate : '',
        photoUrl, idCardPath, licensePath,
      });
      await useAuthStore.getState().fetchProfile(true);

      Alert.alert('Succès', 'Votre profil de livreur est enregistré.');
      onSaved();
    } catch (error: any) {
      Alert.alert('Erreur', error?.message || 'Impossible de sauvegarder le profil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginVertical: 40 }} color={COLORS.primary} />;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Type de véhicule</Text>
      <View style={styles.vehicleRow}>
        {VEHICLES.map(v => (
          <TouchableOpacity
            key={v}
            style={[styles.vehicleBtn, vehicle === v && styles.vehicleBtnActive]}
            onPress={() => setVehicle(v)}
          >
            <Text style={[styles.vehicleText, vehicle === v && styles.vehicleTextActive]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Numéro de téléphone *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: +221 77 000 00 00"
        placeholderTextColor={COLORS.textSecondary}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      {needsVehicleDocs && (
        <>
          <Text style={styles.label}>Plaque d'immatriculation *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: DK-1234-AA"
            placeholderTextColor={COLORS.textSecondary}
            value={plate}
            onChangeText={setPlate}
            autoCapitalize="characters"
          />
        </>
      )}

      <Text style={styles.label}>Pièces obligatoires</Text>
      <DocPicker
        label="Photo de profil *"
        hint="Visage bien visible — le client et le vendeur la verront"
        doc={photo} previewSaved onPick={() => pick(setPhoto)}
      />
      <DocPicker
        label="Carte d'identité *"
        hint="Photo nette, recto"
        doc={idCard} onPick={() => pick(setIdCard)}
      />
      {needsVehicleDocs && (
        <DocPicker
          label="Permis de conduire *"
          hint="Photo nette, recto"
          doc={license} onPick={() => pick(setLicense)}
        />
      )}

      <View style={styles.privacy}>
        <Icon name="lock-closed" size={14} color={COLORS.textSecondary} />
        <Text style={styles.privacyText}>
          Votre carte d'identité et votre permis ne sont visibles que par l'équipe Teranga.
          Le client et le vendeur voient seulement votre photo, votre nom, votre véhicule et votre plaque.
        </Text>
      </View>

      <TouchableOpacity style={[styles.button, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
        {saving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>{submitLabel}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:             { gap: 12 },
  label:            { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginTop: 4 },
  input:            { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: COLORS.textPrimary },
  vehicleRow:       { flexDirection: 'row', gap: 10 },
  vehicleBtn:       { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, alignItems: 'center' },
  vehicleBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  vehicleText:      { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  vehicleTextActive:{ color: COLORS.white },
  doc:              { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 10 },
  docOk:            { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' },
  docThumb:         { width: 56, height: 56, borderRadius: 10 },
  docThumbEmpty:    { backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  docInfo:          { flex: 1 },
  docLabel:         { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  docHint:          { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  privacy:          { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingHorizontal: 4 },
  privacyText:      { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  button:           { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonText:       { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
