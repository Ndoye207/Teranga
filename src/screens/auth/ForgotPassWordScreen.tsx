import React, { useEffect, useRef, useState } from 'react';
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
import { useAuthStore } from '../../store/useAuthStore';

const emailSchema = z.string().email('Adresse email invalide');
const resetSchema = z.object({
  code: z.string().regex(/^\d{6,8}$/, 'Le code contient 6 à 8 chiffres'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

const RESEND_DELAY = 60; // secondes avant de pouvoir redemander un code

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendCode = async () => {
    if (loading) return;
    const result = emailSchema.safeParse(email.trim());
    if (!result.success) {
      setErrors({ email: result.error.issues[0].message });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await authService.sendPasswordResetCode(email.trim());
      setStep('reset');
      setCooldown(RESEND_DELAY);
    } catch (error: any) {
      Alert.alert('Erreur', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (loading || cooldown > 0) return;
    setLoading(true);
    try {
      await authService.sendPasswordResetCode(email.trim());
      setCooldown(RESEND_DELAY);
      Alert.alert('Code renvoyé', 'Un nouveau code vient de vous être envoyé.');
    } catch (error: any) {
      Alert.alert('Erreur', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (loading) return;
    const result = resetSchema.safeParse({ code: code.trim(), password });
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
      await authService.resetPasswordWithCode(email.trim(), code.trim(), password);
      Alert.alert(
        'Mot de passe modifié',
        'Votre mot de passe a été mis à jour. Vous êtes connecté.',
      );
      // La session est ouverte : on charge le profil, ce qui redirige vers l'app
      await useAuthStore.getState().fetchProfile(true);
    } catch (error: any) {
      Alert.alert('Erreur', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
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
            onPress={() => (step === 'reset' ? setStep('email') : navigation.goBack())}
            accessibilityLabel="Retour"
          >
            <Icon name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Icon
              name={step === 'email' ? 'key-outline' : 'mail-open-outline'}
              size={32}
              color={COLORS.primary}
            />
          </View>

          {step === 'email' ? (
            <>
              <Text style={styles.title}>Mot de passe oublié ?</Text>
              <Text style={styles.subtitle}>
                Entrez votre adresse email, nous vous enverrons un code à saisir
                pour choisir un nouveau mot de passe.
              </Text>

              <AuthInput
                icon="mail-outline"
                placeholder="Adresse email"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (errors.email) setErrors({});
                }}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="send"
                onSubmitEditing={sendCode}
                error={errors.email}
              />

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.disabled]}
                onPress={sendCode}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.primaryText}>Envoyer le code</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Nouveau mot de passe</Text>
              <Text style={styles.subtitle}>
                Si un compte existe pour {email.trim()}, un code vient d'être
                envoyé. Saisissez-le ci-dessous (pensez à vérifier vos spams).
              </Text>

              <AuthInput
                icon="keypad-outline"
                placeholder="Code reçu par email"
                value={code}
                onChangeText={text => {
                  setCode(text.replace(/\D/g, ''));
                  if (errors.code) setErrors(e => ({ ...e, code: null }));
                }}
                keyboardType="number-pad"
                maxLength={8}
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                error={errors.code}
              />

              <AuthInput
                ref={passwordRef}
                icon="lock-closed-outline"
                secure
                placeholder="Nouveau mot de passe"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (errors.password) setErrors(e => ({ ...e, password: null }));
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
                  if (errors.confirm) setErrors(e => ({ ...e, confirm: null }));
                }}
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={resetPassword}
                error={errors.confirm}
              />

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.disabled]}
                onPress={resetPassword}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.primaryText}>Modifier le mot de passe</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resend}
                onPress={resendCode}
                disabled={loading || cooldown > 0}
              >
                <Text style={[styles.resendText, cooldown > 0 && styles.resendDisabled]}>
                  {cooldown > 0
                    ? `Renvoyer le code dans ${cooldown} s`
                    : 'Renvoyer le code'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24 },
  back: { width: 40, height: 40, justifyContent: 'center', marginBottom: 12 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E0F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  resend: { alignSelf: 'center', marginTop: 20, padding: 6 },
  resendText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  resendDisabled: { color: COLORS.textSecondary },
});