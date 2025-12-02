// API utility for making requests
// Uses Vite proxy in development (localhost)

/**
 * Get the API URL for a given endpoint
 * @param {string} endpoint - API endpoint (e.g., '/api/vouchers')
 * @returns {string} Relative path (Vite proxy handles it)
 */
export function getApiUrl(endpoint) {
  // Use relative path - Vite proxy will forward to backend
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const url = getApiUrl(endpoint);
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  return response;
}

/**
 * Make a GET request
 */
export async function apiGet(endpoint) {
  return apiRequest(endpoint, { method: 'GET' });
}

/**
 * Make a POST request
 */
export async function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Make a PATCH request
 */
export async function apiPatch(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Make a DELETE request
 */
export async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}

