const API_URL = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('agrotech_token');
}

function setToken(token) {
  localStorage.setItem('agrotech_token', token);
}

function setUser(user) {
  localStorage.setItem('agrotech_user', JSON.stringify(user));
}

function getUser() {
  const u = localStorage.getItem('agrotech_user');
  return u ? JSON.parse(u) : null;
}

function logout() {
  localStorage.removeItem('agrotech_token');
  localStorage.removeItem('agrotech_user');
}

function isAuthenticated() {
  return !!getToken();
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    logout();
    window.location.href = '/';
    throw new Error('Sessão expirada');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro desconhecido');
  }

  return data;
}

export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function register(name, email, password) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function getDashboardSummary() {
  return apiFetch('/dashboard/summary');
}

export async function getAlertas() {
  return apiFetch('/alertas');
}

export async function getDados(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/dados?${query}`);
}

export async function getLatestDados() {
  return apiFetch('/dados/latest');
}

export { getToken, getUser, logout, isAuthenticated };
