import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import AuthInput from '../../components/AuthInput';
import Icon from '../../components/Icon';
import { COLORS } from '../../constants/colors';
import { authService, getAuthErrorMessage } from '../../services/authService';
import { socialAuth } from '../../services/socialAuth';

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type Role = 'buyer' | 'vendor' | 'livreur';

const ROLES: { value: Role; label: string; icon: string }[] = [
  { value: 'buyer', label: 'Acheteur', icon: 'bag-handle-outline' },
  { value: 'vendor', label: 'Vendeur', icon: 'storefront-outline' },
  { value: 'livreur', label: 'Livreur', icon: 'bicycle-outline' },
];

export const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<Role>('buyer');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(
    null,
  );
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const busy = loading || socialLoading !== null;

  const clearError = (field: string) => {
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  };

  const handleRegister = async () => {
    if (busy) return;

    const result = registerSchema.safeParse({ fullName, email: email.trim(), password });
    const next: Record<string, string | null> = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        next[String(issue.path[0])] = issue.message;
      }
    }
    if (password !== confirm) next.confirm = 'Les mots de passe ne correspondent pas';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const data = await authService.signUp(email.trim(), password, fullName.trim(), role);

      // Adresse déjà utilisée : Supabase renvoie un faux utilisateur sans identité
      if (data.user && data.user.identities?.length === 0) {
        Alert.alert(
          'Compte existant',
          'Un compte existe déjà avec cette adresse email. Connectez-vous ou réinitialisez votre mot de passe.',
        );
        return;
      }

      // Sans session = confirmation par email requise (sinon connexion automatique)
      if (!data.session) {
        Alert.alert(
          'Vérifiez votre email',
          'Votre compte est créé. Cliquez sur le lien reçu par email pour le confirmer, puis connectez-vous.',
        );
        navigation?.goBack();
      }
    } catch (error: any) {
      Alert.alert("Erreur d'inscription", getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: 'google' | 'apple') => {
    if (busy) return;
    setSocialLoading(provider);
    try {
      if (provider === 'google') {
        await socialAuth.signInWithGoogle();
      } else {
        await socialAuth.signInWithApple();
      }
    } catch (error: any) {
      if (!error?.cancelled) {
        Alert.alert('Inscription impossible', getAuthErrorMessage(error));
      }
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.back}
            onPress={() => navigation?.goBack()}
            accessibilityLabel="Retour"
          >
            <Icon name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez Teranga Market</Text>

          <AuthInput
            icon="person-outline"
            placeholder="Nom complet"
            value={fullName}
            onChangeText={text => {
              setFullName(text);
              clearError('fullName');
            }}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            error={errors.fullName}
          />

          <AuthInput
            ref={emailRef}
            icon="mail-outline"
            placeholder="Adresse email"
            value={email}
            onChangeText={text => {
              setEmail(text);
              clearError('email');
            }}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            error={errors.email}
          />

          <AuthInput
            ref={passwordRef}
            icon="lock-closed-outline"
            secure
            placeholder="Mot de passe (6 caractères minimum)"
            value={password}
            onChangeText={text => {
              setPassword(text);
              clearError('password');
            }}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            error={errors.password}
          />

          <AuthInput
            ref={confirmRef}
            icon="lock-closed-outline"
            secure
            placeholder="Confirmer le mot de passe"
            value={confirm}
            onChangeText={text => {
              setConfirm(text);
              clearError('confirm');
            }}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={handleRegister}
            error={errors.confirm}
          />

          <Text style={styles.roleLabel}>Je m'inscris en tant que</Text>
          <View style={styles.roleRow}>
            {ROLES.map(item => {
              const active = role === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.roleCard, active && styles.roleCardActive]}
                  onPress={() => setRole(item.value)}
                  activeOpacity={0.85}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <Icon
                    name={item.icon}
                    size={24}
                    color={active ? COLORS.white : COLORS.primary}
                  />
                  <Text style={[styles.roleText, active && styles.roleTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, busy && styles.disabled]}
            onPress={handleRegister}
            disabled={busy}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou s'inscrire avec</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.socialButton, busy && styles.disabled]}
            onPress={() => handleSocial('google')}
            disabled={busy}
            activeOpacity={0.85}
          >
            {socialLoading === 'google' ? (
              <ActivityIndicator color={COLORS.textPrimary} />
            ) : (
              <>
                <Icon name="logo-google" size={20} color="#DB4437" />
                <Text style={styles.socialText}>Continuer avec Google</Text>
              </>
            )}
          </TouchableOpacity>

          {socialAuth.isAppleAvailable && (
            <TouchableOpacity
              style={[styles.socialButton, styles.appleButton, busy && styles.disabled]}
              onPress={() => handleSocial('apple')}
              disabled={busy}
              activeOpacity={0.85}
            >
              {socialLoading === 'apple' ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Icon name="logo-apple" size={22} color={COLORS.white} />
                  <Text style={[styles.socialText, styles.appleText]}>
                    Continuer avec Apple
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <Text style={styles.hint}>
            Avec Google ou Apple, le compte est créé en tant qu'acheteur.
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => navigation?.goBack()} disabled={busy}>
              <Text style={styles.footerLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24 },
  back: { width: 40, height: 40, justifyContent: 'center', marginBottom: 8 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 26,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 4,
    marginBottom: 10,
  },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  roleCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 6,
  },
  roleCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleText: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  roleTextActive: { color: COLORS.white },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 12, color: COLORS.textSecondary, fontSize: 13 },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 12,
    gap: 10,
  },
  socialText: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  appleButton: { backgroundColor: '#000000', borderColor: '#000000' },
  appleText: { color: COLORS.white },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: COLORS.textSecondary, fontSize: 14 },
  footerLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});