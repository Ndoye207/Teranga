import { Platform } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { supabase } from './supabase';
import { CONFIG } from '../constants/config';

// Erreur « l'utilisateur a fermé la fenêtre » : à ignorer, pas à afficher.
const cancelled = () => Object.assign(new Error('cancelled'), { cancelled: true });

let googleConfigured = false;

export const socialAuth = {
  /** Apple n'est proposé que sur iOS (compte développeur Apple requis). */
  isAppleAvailable: Platform.OS === 'ios' && appleAuth.isSupported,

  async signInWithGoogle() {
    if (!CONFIG.GOOGLE_WEB_CLIENT_ID) {
      throw new Error(
        'Connexion Google non configurée : renseignez GOOGLE_WEB_CLIENT_ID dans config.ts.',
      );
    }
    if (!googleConfigured) {
      GoogleSignin.configure({ webClientId: CONFIG.GOOGLE_WEB_CLIENT_ID });
      googleConfigured = true;
    }

    try {
      await GoogleSignin.hasPlayServices();
      const response: any = await GoogleSignin.signIn();
      if (response?.type === 'cancelled') throw cancelled();

      // Selon la version de la librairie, le jeton est dans data.idToken ou idToken
      const idToken = response?.data?.idToken ?? response?.idToken;
      if (!idToken) throw new Error("Google n'a pas renvoyé de jeton d'identité.");

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) throw error;
    } catch (e: any) {
      if (e?.cancelled || e?.code === statusCodes.SIGN_IN_CANCELLED) {
        throw cancelled();
      }
      throw e;
    }
  },

  async signInWithApple() {
    try {
      const res = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      if (!res.identityToken) {
        throw new Error("Apple n'a pas renvoyé de jeton d'identité.");
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: res.identityToken,
        nonce: res.nonce,
      });
      if (error) throw error;

      // Apple ne communique le nom qu'à la toute première connexion
      const fullName = [res.fullName?.givenName, res.fullName?.familyName]
        .filter(Boolean)
        .join(' ');
      if (fullName && data.user) {
        await supabase
          .from('profiles')
          .update({ full_name: fullName })
          .eq('id', data.user.id);
      }
    } catch (e: any) {
      if (e?.code === appleAuth.Error.CANCELED) throw cancelled();
      throw e;
    }
  },
};