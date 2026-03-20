// src/services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.15.5:3000/api';  // ← TROQUE PELO SEU IP LOCAL + porta

// Para testar no celular real (Expo Go):
// - Seu PC e celular precisam estar na mesma Wi-Fi

// Para emulador Android Studio: use http://10.0.2.2:3000/api

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente em todas as requisições
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de erro (opcional, mas útil)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Token inválido ou expirado');
      // Aqui pode adicionar logout automático depois
    }
    return Promise.reject(error);
  }
);

export default api;