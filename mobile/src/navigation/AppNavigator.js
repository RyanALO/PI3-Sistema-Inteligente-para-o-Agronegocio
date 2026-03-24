import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import colors from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, emoji, focused }) {
  return (
    <View style={[tabStyles.container, focused && tabStyles.focused]}>
      <Text style={[tabStyles.emoji, focused && tabStyles.emojiActive]}>{emoji}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  focused: {},
  emoji: { fontSize: 20, opacity: 0.5 },
  emojiActive: { opacity: 1 },
  label: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  labelActive: { color: colors.primary, fontWeight: '600' },
});

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
          backgroundColor: colors.cardWhite,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Início" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Metrics"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Métricas" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" label="Alertas" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Perfil" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
