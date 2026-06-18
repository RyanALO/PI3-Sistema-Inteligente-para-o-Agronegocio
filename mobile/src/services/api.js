import { Platform } from 'react-native';

// Seleciona automaticamente o host correto dependendo da plataforma:
//   - Android Emulator → 10.0.2.2 (apelido especial para o localhost do PC)
//   - Web (Expo browser) e iOS Simulator → localhost
// ⚠️ Se usar Expo Go em um celular físico, substitua pelo IP local do seu PC
//    ex: const API_URL = 'http://192.168.1.XXX:3000/api';
const getApiUrl = () => {
  // Para testar em celular físico com Expo Go, precisamos usar o IP do computador na rede.
  // 10.0.2.2 só funciona no emulador do Android Studio.
  return 'http://10.252.29.130:3001/api';
};

const API_URL = getApiUrl();
// ⚠️ CHANGE THIS via environment variable when building/running the app
// Routes through backend proxy to avoid CORS issues with direct AWS endpoint
const SENSORES_PROXY_URL = (
  (typeof process !== 'undefined' && process.env && (process.env.SENSORES_PROXY_URL || process.env.REACT_NATIVE_SENSORES_PROXY_URL))
  || `${API_URL}/sensores/proxy`
);

function toNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function average(values) {
  const validValues = values.filter(value => Number.isFinite(value));

  if (validValues.length === 0) {
    return 0;
  }

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

function normalizeSensorAws(sensor) {
  return {
    id: sensor.id,
    temperatura: toNumber(sensor.temperatura),
    umidade: toNumber(sensor.umidade),
    umidade_solo: toNumber(sensor.umidade_solo),
  };
}

export function buildDashboardSummaryFromSensors(sensores = []) {
  const normalizedSensors = sensores.map(normalizeSensorAws);
  const totalDevices = normalizedSensors.length;

  return {
    success: true,
    kpis: {
      soil_moisture: Math.round(average(normalizedSensors.map(sensor => sensor.umidade_solo))),
      temperature: Number(average(normalizedSensors.map(sensor => sensor.temperatura)).toFixed(1)),
      air_humidity: Math.round(average(normalizedSensors.map(sensor => sensor.umidade))),
      active_devices: totalDevices,
      total_devices: totalDevices,
    },
    sensores: normalizedSensors,
  };
}

export async function getSensoresAws() {
  const response = await fetch(SENSORES_PROXY_URL);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Erro ${response.status} ao buscar sensores`);
  }

  if (!Array.isArray(data)) {
    throw new Error('Resposta invalida do endpoint de sensores');
  }

  return data.map(normalizeSensorAws);
}

export async function getDashboardSummaryFromSensoresAws() {
  const sensores = await getSensoresAws();
  return buildDashboardSummaryFromSensors(sensores);
}

async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro desconhecido');
  }

  return data;
}

let authToken = null;
let currentUser = null;

export function setAuth(token, user) {
  authToken = token;
  currentUser = user;
}

export function getAuth() {
  return { token: authToken, user: currentUser };
}

export function clearAuth() {
  authToken = null;
  currentUser = null;
}

function authenticatedFetch(endpoint, options = {}) {
  return apiFetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });
}

export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuth(data.token, data.user);
  return data;
}

export async function register(name, email, password) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setAuth(data.token, data.user);
  return data;
}

export async function getDashboardSummary(timeFilter = 'Hoje') {
  return authenticatedFetch(`/dashboard/summary?filter=${timeFilter}`);
}

export async function getAlertas() {
  return authenticatedFetch('/alertas');
}

export async function resolveAlerta(id) {
  return authenticatedFetch(`/alertas/${id}/resolve`, { method: 'PATCH' });
}

export async function getLatestDados() {
  return authenticatedFetch('/dados/latest');
}

/**
 * Authenticated fetch wrapper with Bearer token
 * Adds Authorization header and handles auth errors
 * 
 * @param {string} endpoint - API endpoint (e.g., '/estoque')
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Object>} Response data or throws error
 * @throws {Error} If not authenticated, network error, or API error
 * 
 * @example
 * const result = await authenticatedFetch('/estoque', {
 *   method: 'POST',
 *   body: JSON.stringify({ nome_produto: 'Adubo' })
 * });
 */
export async function authenticatedFetchAPI(endpoint, options = {}) {
  if (!authToken) {
    throw new Error('Não autenticado');
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers,
      },
    });

    const responseData = await response.json();

    if (response.status === 401) {
      clearAuth();
      throw new Error('Sessão expirada');
    }

    if (!response.ok) {
      throw new Error(responseData.error || `Erro ${response.status}`);
    }

    return responseData.data || responseData;
  } catch (error) {
    if (error.message === 'Sessão expirada') {
      clearAuth();
    }
    throw error;
  }
}

