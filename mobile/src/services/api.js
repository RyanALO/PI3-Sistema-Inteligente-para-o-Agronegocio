// ⚠️ CHANGE THIS to your computer's local IP when testing with Expo Go
// Example: 'http://192.168.1.100:3000/api'
const API_URL = 'http://10.0.2.2:3000/api'; // Android Emulator default

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

export async function getDashboardSummary() {
  return authenticatedFetch('/dashboard/summary');
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
