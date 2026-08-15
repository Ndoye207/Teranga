import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AdminDashboard = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tableau de Bord Admin</Text>
      <Text>Bienvenue sur le portail administrateur.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
});
