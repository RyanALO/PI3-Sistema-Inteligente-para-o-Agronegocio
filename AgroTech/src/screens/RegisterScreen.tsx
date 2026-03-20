// src/screens/RegisterScreen.tsx  ← SUBSTITUA TODO O CONTEÚDO
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigation = useNavigation<any>();

  const handleRegister = async () => {
    if (!name || !email || !password || !agreeTerms) {
      Alert.alert('Erro', 'Preencha todos os campos e aceite os termos');
      return;
    }
    setLoading(true);
    const success = await register(name, email, password);
    if (success) {
      navigation.replace('Main');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#F8FAF5' }}>
      <View style={{ padding: 24, paddingTop: 60 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ backgroundColor: theme.colors.primary, width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="leaf" size={28} color="#FFF" />
          </View>
          <Text style={{ marginLeft: 12, fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>AgriBusiness</Text>
        </View>

        <Text style={{ fontSize: 28, fontWeight: 'bold' }}>Create Account</Text>
        <Text style={{ color: theme.colors.textLight, marginTop: 4 }}>Begin your journey as a digital cultivator.</Text>

        <Text style={{ marginTop: 32, fontWeight: '600' }}>FULL NAME</Text>
        <TextInput style={{ backgroundColor: '#F1F5F0', borderRadius: 12, padding: 16, marginTop: 8 }} placeholder="Johnathan Appleseed" value={name} onChangeText={setName} />

        <Text style={{ marginTop: 20, fontWeight: '600' }}>EMAIL ADDRESS</Text>
        <TextInput style={{ backgroundColor: '#F1F5F0', borderRadius: 12, padding: 16, marginTop: 8 }} placeholder="cultivator@agri.com" value={email} onChangeText={setEmail} keyboardType="email-address" />

        <Text style={{ marginTop: 20, fontWeight: '600' }}>PASSWORD</Text>
        <TextInput style={{ backgroundColor: '#F1F5F0', borderRadius: 12, padding: 16, marginTop: 8 }} placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />

        {/* Checkbox customizado (funciona em mobile e evita erro) */}
        <Pressable onPress={() => setAgreeTerms(!agreeTerms)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24 }}>
          <View style={{
            width: 24,
            height: 24,
            borderWidth: 2,
            borderColor: agreeTerms ? theme.colors.secondary : '#D1D5DB',
            borderRadius: 6,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: agreeTerms ? theme.colors.secondary : '#FFF',
          }}>
            {agreeTerms && <Ionicons name="checkmark" size={18} color="#FFF" />}
          </View>
          <Text style={{ marginLeft: 12, fontSize: 15 }}>
            I agree to the <Text style={{ color: theme.colors.secondary }}>Terms of Service</Text>
          </Text>
        </Pressable>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading || !agreeTerms}
          style={{ backgroundColor: theme.colors.secondary, padding: 18, borderRadius: 12, marginTop: 32, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
        >
          <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Start Harvesting</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={{ color: theme.colors.textLight }}>Já tem conta? <Text style={{ color: theme.colors.secondary, fontWeight: 'bold' }}>Entrar</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;