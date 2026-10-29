const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Universal API Client with automatic JWT injection and error parsing
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = localStorage.getItem('crm_admin_token');
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    // Check if unauthorized
    if (res.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('crm_admin_token');
      localStorage.removeItem('crm_admin_user');
      window.dispatchEvent(new CustomEvent('crm-session-expired'));
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || data.error || `HTTP error ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.status) throw error;
    // Network / offline error
    const netErr = new Error('Could not connect to the backend server. Please verify the backend is running on port 5000.');
    netErr.isNetworkError = true;
    throw netErr;
  }
}

export const api = {
  // Public Form
  submitInquiry: (inquiryData) => request('/inquiries', {
    method: 'POST',
    body: JSON.stringify(inquiryData),
  }),

  // Admin Auth
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  getProfile: () => request('/auth/me', {
    method: 'GET',
  }),

  getStatus: () => request('/auth/status', {
    method: 'GET',
  }),

  // Protected Inquiries CRM
  getInquiries: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.user_type && filters.user_type !== 'All') params.append('user_type', filters.user_type);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/inquiries${queryString}`, { method: 'GET' });
  },

  updateStatus: (id, status) => request(`/inquiries/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),

  updateNotes: (id, notes) => request(`/inquiries/${id}/notes`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  }),

  deleteInquiry: (id) => request(`/inquiries/${id}`, {
    method: 'DELETE',
  }),
};
