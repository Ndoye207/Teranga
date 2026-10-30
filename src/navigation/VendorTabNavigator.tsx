import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import VendorDashboard from '../screens/vendor/VendorDashboard';
import ProductsScreen from '../screens/vendor/ProductsScreen';
import OrdersScreen from '../screens/vendor/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen'; // Assuming this exists or create it
import Icon from '../components/Icon';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

const renderHomeIcon = ({ color, size }: { color: string; size: number }) => <Icon name="home" size={size} color={color} />;
const renderProductsIcon = ({ color, size }: { color: string; size: number }) => <Icon name="restaurant" size={size} color={color} />;
const renderOrdersIcon = ({ color, size }: { color: string; size: number }) => <Icon name="list" size={size} color={color} />;
const renderProfileIcon = ({ color, size }: { color: string; size: number }) => <Icon name="person" size={size} color={color} />;

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
          tabBarIcon: renderHomeIcon
        }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen} 
        options={{
          tabBarLabel: 'Produits',
          tabBarIcon: renderProductsIcon
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen} 
        options={{
          tabBarLabel: 'Commandes',
          tabBarIcon: renderOrdersIcon
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: renderProfileIcon
        }}
      />
    </Tab.Navigator>
  );
}
