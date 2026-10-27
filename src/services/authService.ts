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