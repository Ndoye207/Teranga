import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function CourierSettingsScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Paramètres livreur</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  text: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
});
