import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/colors';
import { LivreurStackParamList, LivreurTabParamList } from '../types/navigation';
import AvailabilityScreen  from '../screens/livreur/AvailabilityScreen';
import CoursesScreen       from '../screens/livreur/CoursesScreen';
import CourseDetailScreen  from '../screens/livreur/CourseDetailScreen';
import RevenusScreen       from '../screens/livreur/RevenusScreen';
import Icon                from '../components/Icon';

const Tab   = createBottomTabNavigator<LivreurTabParamList>();
const Stack = createStackNavigator<LivreurStackParamList>();

const TabIcon = ({ name }: { name: string }) => ({ color, size }: { color: string, size: number }) => (
  <Icon name={name} color={color} size={size} />
);

function CoursesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Courses"      component={CoursesScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
    </Stack.Navigator>
  );
}

export default function LivreurNavigator() {
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
        name="Disponible" 
        component={AvailabilityScreen} 
        options={{ 
          tabBarLabel: 'Disponible',
          tabBarIcon: TabIcon({ name: 'map-outline' })
        }} 
      />
      <Tab.Screen 
        name="CoursesTab" 
        component={CoursesStack}       
        options={{ 
          tabBarLabel: 'Courses',
          tabBarIcon: TabIcon({ name: 'bicycle-outline' })
        }} 
      />
      <Tab.Screen 
        name="Revenus"    
        component={RevenusScreen}      
        options={{ 
          tabBarLabel: 'Revenus',
          tabBarIcon: TabIcon({ name: 'wallet-outline' })
        }} 
      />
    </Tab.Navigator>
  );
}