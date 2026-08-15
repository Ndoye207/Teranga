import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/useAuthStore';
import SelectionScreen   from '../screens/SelectionScreen';
import { LoginScreen }       from '../screens/auth/LoginScreen';
import { RegisterScreen }    from '../screens/auth/RegisterScreen';
import ClientNavigator   from './ClientNavigator';
import VendorNavigator   from './VendorNavigator';
import LivreurNavigator  from './LivreurNavigator';
import AdminNavigator    from './AdminNavigator';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', backgroundColor: '#FFFFFF' },
});

export default function RootNavigator() {
  const { user, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Selection" component={SelectionScreen} />
          <Stack.Screen name="Client" component={ClientNavigator} />
          <Stack.Screen name="Vendor" component={VendorNavigator} />
          <Stack.Screen name="Livreur" component={LivreurNavigator} />
          <Stack.Screen name="Admin" component={AdminNavigator} />
        </>
      )}
    </Stack.Navigator>
  );
}