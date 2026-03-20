import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      const { token, user } = response.data;

      // salva token
      await SecureStore.setItemAsync('token', token);

      // salva dados do usuário
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // atualiza contexto
      setUser(user);

      console.log('Login real OK! Token:', token);

      Alert.alert('Sucesso', 'Login realizado!');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });

    } catch (error: any) {
      console.error('Erro no login:', error);

      Alert.alert(
        'Erro',
        error?.response?.data?.error || 'Falha ao conectar com o servidor'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#F8FAF5' }}>
      <View style={{ backgroundColor: theme.colors.primary, paddingTop: 60, paddingBottom: 40, alignItems: 'center' }}>
        
        <Image 
          source={require('../assets/logo-agrotech.png')} 
          style={{ width: 80, height: 80 }} 
        />

        <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>
          CultivatePro
        </Text>

        <Text style={{ color: '#FFF', fontSize: 28, fontWeight: 'bold', marginTop: 20 }}>
          AgriBusiness
        </Text>

        <Text style={{ color: '#FFF', fontSize: 16, marginTop: 4 }}>
          Gestão inteligente do campo
        </Text>

      </View>

      <View style={{ padding: 24, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20 }}>

        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}>
          EMAIL
        </Text>

        <TextInput
          style={{ backgroundColor: '#F1F5F0', borderRadius: 12, padding: 16, fontSize: 16 }}
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
            SENHA
          </Text>

          <TouchableOpacity onPress={() => Alert.alert('Esqueceu a senha?', 'Funcionalidade em breve')}>
            <Text style={{ color: theme.colors.secondary, fontWeight: '600' }}>
              ESQUECEU A SENHA?
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={{ backgroundColor: '#F1F5F0', borderRadius: 12, padding: 16, fontSize: 16 }}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: theme.colors.secondary,
            padding: 18,
            borderRadius: 12,
            marginTop: 32,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Text>

          <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Register')} 
          style={{ marginTop: 20, alignItems: 'center' }}
        >
          <Text style={{ color: theme.colors.textLight }}>
            Ainda não tem conta?{' '}
            <Text style={{ color: theme.colors.secondary, fontWeight: 'bold' }}>
              Cadastre-se
            </Text>
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

export default LoginScreen;