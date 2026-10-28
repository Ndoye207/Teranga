import { supabase } from './supabase';
import { DBProfile } from '../types';

export const authService = {
  /**
   * Inscription d'un nouvel utilisateur (Buyer / Vendor)
   */
  async signUp(email: string, password: string, fullName: string, role: 'buyer' | 'vendor' | 'livreur' = 'buyer') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Connexion avec Email et Mot de passe
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Envoie un code à 6 chiffres par email pour réinitialiser le mot de passe.
   * (Supabase ne révèle pas si l'adresse existe : pas d'erreur dans ce cas.)
   */
  async sendPasswordResetCode(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
    );
    if (error) throw error;
  },

  /**
   * Vérifie le code reçu (ouvre une session), puis définit le nouveau mot de passe.
   */
  async resetPasswordWithCode(email: string, code: string, newPassword: string) {
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: 'recovery',
    });
    if (otpError) throw otpError;

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw new Error(
        `Code validé, mais le mot de passe n'a pas pu être modifié : ${getAuthErrorMessage(error)}`,
      );
    }
  },

  /**
   * Déconnexion
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Récupère le profil complet de l'utilisateur connecté depuis la table 'profiles'
   */
  async getCurrentProfile(): Promise<DBProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Récupère la session courante
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
};

/** Transforme les erreurs Supabase en messages clairs pour l'utilisateur */
export function getAuthErrorMessage(error: any): string {
  const message: string = error?.message ?? '';
  if (/invalid login credentials/i.test(message)) {
    return 'Email ou mot de passe incorrect.';
  }
  if (/email not confirmed/i.test(message)) {
    return 'Veuillez confirmer votre adresse email avant de vous connecter.';
  }
  if (/token has expired or is invalid/i.test(message)) {
    return 'Code invalide ou expiré.';
  }
  if (/rate limit|too many|security purposes/i.test(message)) {
    return 'Trop de tentatives. Réessayez dans quelques minutes.';
  }
  if (/same as the old password/i.test(message)) {
    return "Le nouveau mot de passe doit être différent de l'ancien.";
  }
  if (/network request failed/i.test(message)) {
    return 'Connexion impossible. Vérifiez votre connexion internet.';
  }
  return message || 'Une erreur est survenue.';
}