// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type User = { name: string; email: string } | null;

interface AuthContextType {
  user: User | null; // use o mesmo tipo já usado no estado
  setUser: (user: User | null) => void;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isWeb = Platform.OS === 'web';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        let token;
        let savedUser;

        if (isWeb) {
          token = localStorage.getItem('token');
          savedUser = localStorage.getItem('user');
        } else {
          token = await SecureStore.getItemAsync('token');
          savedUser = await AsyncStorage.getItem('user');
        }

        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.warn('Erro ao carregar usuário:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) return false;

    const fakeUser = { name: 'Johnathan Appleseed', email };

    try {
      if (isWeb) {
        localStorage.setItem('token', 'fake-jwt-token-123');
        localStorage.setItem('user', JSON.stringify(fakeUser));
      } else {
        await SecureStore.setItemAsync('token', 'fake-jwt-token-123');
        await AsyncStorage.setItem('user', JSON.stringify(fakeUser));
      }
      setUser(fakeUser);
      console.log('Login OK - user set:', fakeUser);
      return true;
    } catch (e) {
      console.error('Erro no login:', e);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const fakeUser = { name, email };

    try {
      if (isWeb) {
        localStorage.setItem('token', 'fake-jwt-token-123');
        localStorage.setItem('user', JSON.stringify(fakeUser));
      } else {
        await SecureStore.setItemAsync('token', 'fake-jwt-token-123');
        await AsyncStorage.setItem('user', JSON.stringify(fakeUser));
      }
      setUser(fakeUser);
      console.log('Registro OK - user set:', fakeUser);
      return true;
    } catch (e) {
      console.error('Erro no registro:', e);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (isWeb) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        await SecureStore.deleteItemAsync('token');
        await AsyncStorage.removeItem('user');
      }
      setUser(null);
    } catch (e) {
      console.error('Erro no logout:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};