// frontend/js/api.js
const BASE_URL = 'http://localhost:5000/api';

// ─── Token helpers ──────────────────────────────
const getToken = () => localStorage.getItem('token');
const setToken = (t) => localStorage.setItem('token', t);
const removeToken = () => localStorage.removeItem('token');

// ─── Core fetch wrapper ─────────────────────────
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── Auth ───────────────────────────────────────
const Auth = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  logout:   () => { removeToken(); window.location.href = '/login.html'; },
  getUser:  () => {
    const token = getToken();
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
  }
};

// ─── Products ───────────────────────────────────
const Products = {
  list:   (params = {}) => request('/products?' + new URLSearchParams(params)),
  get:    (id) => request(`/products/${id}`),
  create: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
};

// ─── Cart ───────────────────────────────────────
const Cart = {
  get:    () => request('/cart'),
  add:    (product_id, quantity = 1) => request('/cart', { method: 'POST', body: JSON.stringify({ product_id, quantity }) }),
  remove: (id) => request(`/cart/${id}`, { method: 'DELETE' }),
};

// ─── Orders ─────────────────────────────────────
const Orders = {
  place:  (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  list:   () => request('/orders'),
  get:    (id) => request(`/orders/${id}`),
};

// ─── Vendor ─────────────────────────────────────
const Vendor = {
  dashboard: () => request('/vendor/dashboard'),
  products:  () => request('/vendor/products'),
  updateProfile: (body) => request('/vendor/profile', { method: 'PUT', body: JSON.stringify(body) }),
};

// ─── Categories ─────────────────────────────────
const Categories = {
  list: () => request('/categories'),
};
