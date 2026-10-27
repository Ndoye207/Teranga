import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { authService } from '../../services/authService';
import { z } from 'zod';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Format email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'vendor' | 'livreur'>('buyer');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const result = registerSchema.safeParse({ fullName, email, password });

    if (!result.success) {
      Alert.alert('Erreur', result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await authService.signUp(email, password, fullName, role);
      Alert.alert(
        'Succès',
        'Votre compte a été créé avec succès ! Vérifiez votre email si une confirmation est requise.'
      );
    } catch (error: any) {
      Alert.alert("Erreur d'inscription", error.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>Rejoignez Teranga Market</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom complet"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="Adresse Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Sélecteur de rôle */}
      <Text style={styles.roleLabel}>Je souhaite être :</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === 'buyer' && styles.roleActive]}
          onPress={() => setRole('buyer')}
        >
          <Text style={[styles.roleText, role === 'buyer' && styles.roleTextActive]}>Acheteur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === 'vendor' && styles.roleActive]}
          onPress={() => setRole('vendor')}
        >
          <Text style={[styles.roleText, role === 'vendor' && styles.roleTextActive]}>Vendeur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === 'livreur' && styles.roleActive]}
          onPress={() => setRole('livreur')}
        >
          <Text style={[styles.roleText, role === 'livreur' && styles.roleTextActive]}>Livreur</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>S'inscrire</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation?.goBack()}>
        <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#10B981', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 25 },
  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
  roleLabel: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  roleButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', alignItems: 'center', marginHorizontal: 4 },
  roleActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  roleText: { color: '#666', fontWeight: 'bold' },
  roleTextActive: { color: '#FFF' },
  button: { backgroundColor: '#10B981', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: '#10B981', textAlign: 'center', marginTop: 20, fontSize: 14 },
});