import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import VendorTabNavigator from './VendorTabNavigator';
import CreateShopScreen from '../screens/vendor/CreateShopScreen';
import AddProductScreen from '../screens/vendor/AddProductScreen';
import AccountSettingsScreen from '../screens/vendor/AccountSettingsScreen';
import ShopSettingsScreen from '../screens/vendor/ShopSettingsScreen';
import { VendorStackParamList } from '../types/navigation';

const Stack = createStackNavigator<VendorStackParamList>();

export default function VendorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={VendorTabNavigator} />
      <Stack.Screen name="CreateShop" component={CreateShopScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="ShopSettings" component={ShopSettingsScreen} />
    </Stack.Navigator>
  );
}