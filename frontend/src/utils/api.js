// API utility for making requests
// Supports both development (proxy) and production (absolute URL)

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Debug logging (only in development)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL || '(using proxy)');
}

/**
 * Get the full API URL for a given endpoint
 * @param {string} endpoint - API endpoint (e.g., '/api/vouchers')
 * @returns {string} Full URL or relative path
 */
export function getApiUrl(endpoint) {
  // Validate endpoint
  if (!endpoint || typeof endpoint !== 'string') {
    console.error('Invalid endpoint provided to getApiUrl:', endpoint);
    throw new Error('API endpoint is required');
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // If API_BASE_URL is set, use it (production)
  if (API_BASE_URL && API_BASE_URL.trim() !== '') {
    // Remove trailing slash from base URL if present
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const fullUrl = `${baseUrl}${cleanEndpoint}`;
    
    // Debug logging (always log in production for troubleshooting)
    console.log('🔗 API Request:', {
      endpoint,
      cleanEndpoint,
      baseUrl,
      fullUrl,
      apiBaseUrl: API_BASE_URL,
      env: import.meta.env.MODE
    });
    
    // Validate the constructed URL
    if (!fullUrl.includes(cleanEndpoint)) {
      console.error('❌ URL construction error! Endpoint missing from final URL:', {
        fullUrl,
        cleanEndpoint,
        baseUrl
      });
    }
    
    return fullUrl;
  }
  
  // Otherwise use relative path (development with proxy)
  console.log('🔗 API Request (relative, no VITE_API_URL):', cleanEndpoint);
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
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    return response;
  } catch (error) {
    // Enhanced error logging
    console.error('API Request Failed:', {
      url,
      endpoint,
      error: error.message,
      apiBaseUrl: API_BASE_URL
    });
    throw error;
  }
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
