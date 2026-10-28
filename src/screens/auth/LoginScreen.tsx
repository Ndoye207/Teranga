import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
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

const emailSchema = z.string().email('Adresse email invalide');

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(
    null,
  );
  const passwordRef = useRef<TextInput>(null);

  const busy = loading || socialLoading !== null;

  const handleLogin = async () => {
    if (busy) return;

    const emailResult = emailSchema.safeParse(email.trim());
    setEmailError(emailResult.success ? null : emailResult.error.issues[0].message);
    setPasswordError(password ? null : 'Entrez votre mot de passe');
    if (!emailResult.success || !password) return;

    setLoading(true);
    try {
      await authService.signIn(email.trim(), password);
      // Le listener dans useAuthStore redirige automatiquement l'utilisateur
    } catch (error: any) {
      Alert.alert('Connexion impossible', getAuthErrorMessage(error));
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
        Alert.alert('Connexion impossible', getAuthErrorMessage(error));
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
          <View style={styles.header}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Teranga Market</Text>
            <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>
          </View>

          <AuthInput
            icon="mail-outline"
            placeholder="Adresse email"
            value={email}
            onChangeText={text => {
              setEmail(text);
              if (emailError) setEmailError(null);
            }}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            error={emailError}
          />

          <AuthInput
            ref={passwordRef}
            icon="lock-closed-outline"
            secure
            placeholder="Mot de passe"
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            error={passwordError}
          />

          <TouchableOpacity
            style={styles.forgot}
            onPress={() => navigation?.navigate('ForgotPassword')}
            disabled={busy}
          >
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, busy && styles.disabled]}
            onPress={handleLogin}
            disabled={busy}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou continuer avec</Text>
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

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <TouchableOpacity
              onPress={() => navigation?.navigate('Register')}
              disabled={busy}
            >
              <Text style={styles.footerLink}>S'inscrire</Text>
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
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 96, height: 96, marginBottom: 14 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 6 },
  forgot: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 20, paddingVertical: 4 },
  forgotText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: COLORS.textSecondary, fontSize: 14 },
  footerLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});