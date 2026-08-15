import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/colors';
import { ClientStackParamList, ClientTabParamList } from '../types/navigation';
import HomeScreen     from '../screens/client/HomeScreen';
import VendorScreen   from '../screens/client/VendorScreen';
import CartScreen     from '../screens/client/CartScreen';
import TrackingScreen from '../screens/client/TrackingScreen';
import RatingScreen   from '../screens/client/RatingScreen';
import Icon           from '../components/Icon';

const Tab   = createBottomTabNavigator<ClientTabParamList>();
const Stack = createStackNavigator<ClientStackParamList>();

const TabIcon = ({ name }: { name: string }) => ({ color, size }: { color: string, size: number }) => (
  <Icon name={name} color={color} size={size} />
);

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"   component={HomeScreen} />
      <Stack.Screen name="Vendor" component={VendorScreen} />
      <Stack.Screen name="Rating" component={RatingScreen} />
    </Stack.Navigator>
  );
}

export default function ClientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          borderTopColor: COLORS.border,
          backgroundColor: COLORS.white,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeStack}
        options={{ 
          tabBarLabel: 'Accueil',
          tabBarIcon: TabIcon({ name: 'home-outline' })
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{ 
          tabBarLabel: 'Panier',
          tabBarIcon: TabIcon({ name: 'cart-outline' })
        }}
      />
      <Tab.Screen
        name="TrackingTab"
        component={TrackingScreen}
        options={{ 
          tabBarLabel: 'Commandes',
          tabBarIcon: TabIcon({ name: 'list-outline' })
        }}
      />
    </Tab.Navigator>
  );
}