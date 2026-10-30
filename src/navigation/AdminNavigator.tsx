import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AdminDashboard } from '../screens/admin/AdminDashboard';

const Stack = createStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={AdminDashboard} options={{ title: 'Admin' }} />
    </Stack.Navigator>
  );
}
