// API utility for making requests
// Supports both development (proxy) and production (absolute URL)

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Get the full API URL for a given endpoint
 * @param {string} endpoint - API endpoint (e.g., '/api/vouchers')
 * @returns {string} Full URL or relative path
 */
export function getApiUrl(endpoint) {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // If API_BASE_URL is set, use it (production)
  if (API_BASE_URL) {
    // Remove trailing slash from base URL if present
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${baseUrl}${cleanEndpoint}`;
  }
  
  // Otherwise use relative path (development with proxy)
  return cleanEndpoint;
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

