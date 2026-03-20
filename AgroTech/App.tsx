// App.tsx (substitua o conteúdo atual)
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation';
import { AuthProvider } from './src/context/AuthContext';
import { theme } from './src/theme';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor={theme.colors.primary} />
      <AppNavigator />
    </AuthProvider>
  );
}