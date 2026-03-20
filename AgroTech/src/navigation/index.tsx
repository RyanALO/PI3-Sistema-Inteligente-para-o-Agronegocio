// src/navigation/index.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import FarmProfileScreen from '../screens/FarmProfileScreen';
import AlertsScreen from '../screens/AlertsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#006400',
      tabBarInactiveTintColor: '#6B7280',
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 1 },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> }}
    />
    <Tab.Screen
      name="Farm"
      component={FarmProfileScreen}
      options={{ tabBarIcon: ({ color }) => <Ionicons name="leaf" size={24} color={color} /> }}
    />
    <Tab.Screen
      name="Alerts"
      component={AlertsScreen}
      options={{ tabBarIcon: ({ color }) => <Ionicons name="notifications" size={24} color={color} /> }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;