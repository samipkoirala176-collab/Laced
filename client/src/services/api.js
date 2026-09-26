export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const getToken = () => localStorage.getItem('laced_token');

export async function apiRequest(endpoint, options = {}) {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && options.body !== undefined && options.body !== null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const requestConfig = {
    ...options,
    headers,
    body: isFormData ? options.body : options.body !== undefined ? JSON.stringify(options.body) : undefined,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, requestConfig);
  const contentType = response.headers.get('content-type') || '';
  let payload = null;

  if (contentType.includes('application/json')) {
    payload = await response.json();
  } else if (response.status !== 204) {
    payload = await response.text();
  }

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event('laced:unauthorized'));
    }
    const validationMessage = payload?.errors && typeof payload.errors === 'object'
      ? Object.values(payload.errors).flat().join(' ')
      : '';
    const message = payload && typeof payload === 'object' && payload.message
      ? payload.message
      : validationMessage || (response.status === 403 ? 'You do not have access to this area.' : response.status === 404 ? 'The requested resource was not found.' : 'Something went wrong. Please try again.');
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload || null;
    throw error;
  }

  if (payload && typeof payload === 'object' && payload.success === false) {
    const error = new Error(payload.message || 'Request failed.');
    error.payload = payload;
    throw error;
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }

  return payload;
}

export const authApi = {
  login: async (credentials) => {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: credentials,
    });

    return result;
  },

  signup: async (payload) => {
    const result = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: payload,
    });

    return result;
  },

  getMe: async () => {
    const result = await apiRequest('/api/auth/me');
    return result;
  },
};
