import { Platform } from 'react-native';

// Seleciona automaticamente o host correto dependendo da plataforma:
//   - Android Emulator → 10.0.2.2 (apelido especial para o localhost do PC)
//   - Web (Expo browser) e iOS Simulator → localhost
// ⚠️ Se usar Expo Go em um celular físico, substitua pelo IP local do seu PC
//    ex: const API_URL = 'http://192.168.1.XXX:3000/api';
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }
  return 'http://localhost:3000/api';
};

const API_URL = getApiUrl();
// ⚠️ CHANGE THIS to your computer's local IP when testing with Expo Go
// Example: 'http://192.168.1.100:3000/api'
const API_URL = 'http://localhost:3000/api'; // Web/Local testing

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

/**
 * Creates a new talhão (plot) in a farm
 * @param {number} fazendaId - Farm ID
 * @param {Object} data - Talhão data
 * @returns {Promise<Object>} Created talhão
 */
export async function addTalhao(fazendaId, data) {
  return authenticatedFetchAPI(`/fazenda/${fazendaId}/talhoes`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Creates a new stock item
 * @param {Object} data - Stock item data (must include fazenda_id)
 * @returns {Promise<Object>} Created stock item
 */
export async function addEstoque(data) {
  return authenticatedFetchAPI('/estoque', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Updates an existing stock item
 * @param {number} itemId - Stock item ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Updated stock item
 */
export async function updateEstoque(itemId, data) {
  return authenticatedFetchAPI(`/estoque/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
