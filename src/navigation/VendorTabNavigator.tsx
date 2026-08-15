import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import VendorDashboard from '../screens/vendor/VendorDashboard';
import ProductsScreen from '../screens/vendor/ProductsScreen';
import OrdersScreen from '../screens/vendor/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen'; // Assuming this exists or create it
import Icon from '../components/Icon';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

export default function VendorTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={VendorDashboard} 
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen} 
        options={{
          tabBarLabel: 'Produits',
          tabBarIcon: ({ color, size }) => <Icon name="restaurant" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen} 
        options={{
          tabBarLabel: 'Commandes',
          tabBarIcon: ({ color, size }) => <Icon name="list" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => <Icon name="person" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}
