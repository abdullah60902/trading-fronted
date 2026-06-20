import { store } from '../store/store';
import { setCredentials, setAccessToken, clearCredentials } from '../store/authSlice';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/v1';

let cachedCsrfToken: string | null = null;
let csrfFetchPromise: Promise<string> | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

// Fetch CSRF Token from Server
export const fetchCsrfToken = async (): Promise<string> => {
  if (cachedCsrfToken) return cachedCsrfToken;
  // Deduplicate concurrent fetch calls
  if (csrfFetchPromise) return csrfFetchPromise;
  csrfFetchPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/csrf-token`, {
        method: 'GET',
        credentials: 'include', // Required so cookie is set in browser
      });
      const data = await res.json();
      cachedCsrfToken = data.csrfToken;
      return cachedCsrfToken || '';
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      return '';
    } finally {
      csrfFetchPromise = null;
    }
  })();
  return csrfFetchPromise;
};

// Call on logout to clear cached token
export const clearCsrfToken = () => { cachedCsrfToken = null; };

// Core Request Wrapper
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  // 1. Attach JWT Access Token
  const state = store.getState();
  const token = state.auth.accessToken || state.auth.tempToken;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // 2. Attach CSRF Token for Write Methods
  const method = options.method || 'GET';
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    const csrfToken = await fetchCsrfToken();
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }
  }

  // Set default content type (skip for FormData - browser sets multipart boundary)
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  // Remove Content-Type for FormData so browser auto-sets multipart/form-data with boundary
  if (options.body instanceof FormData) {
    headers.delete('Content-Type');
  }

  // Include credentials (cookies) for Refresh token Cookie
  const config = {
    ...options,
    headers,
    credentials: 'include' as RequestCredentials,
  };

  let response = await fetch(url, config);

  // 3. Handle 401 Access Token Expired (Auto-Refresh)
  if (
    response.status === 401 &&
    token &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/refresh')
  ) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const storedRefresh = typeof window !== 'undefined' ? window.localStorage.getItem('refreshToken') : null;
        const refreshOptions: RequestInit = {
          method: 'POST',
          credentials: 'include' as RequestCredentials,
        };

        const csrfTokenForRefresh = await fetchCsrfToken();
        const refreshHeaders = new Headers();
        if (csrfTokenForRefresh) refreshHeaders.set('X-CSRF-Token', csrfTokenForRefresh);

        if (storedRefresh) {
          refreshHeaders.set('Content-Type', 'application/json');
          refreshOptions.body = JSON.stringify({ refreshToken: storedRefresh });
        }

        refreshOptions.headers = refreshHeaders;

        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, refreshOptions);

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newAccessToken = refreshData.accessToken;

          if (state.auth.user) {
            store.dispatch(
              setCredentials({
                user: state.auth.user,
                accessToken: newAccessToken,
              })
            );
          } else {
            store.dispatch(setAccessToken(newAccessToken));
          }

          isRefreshing = false;
          onRefreshed(newAccessToken);

          // Retry THIS request immediately
          headers.set('Authorization', `Bearer ${newAccessToken}`);
          response = await fetch(url, config);
        } else {
          store.dispatch(clearCredentials());
          isRefreshing = false;
          onRefreshed(''); // Notify failure
          throw new Error('Session expired');
        }
      } catch (err) {
        isRefreshing = false;
        store.dispatch(clearCredentials());
        onRefreshed(''); // Notify failure
        throw err;
      }
    } else {
      // Wait for the concurrent token refresh to complete
      response = await new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (newToken) {
            headers.set('Authorization', `Bearer ${newToken}`);
            resolve(fetch(url, config));
          } else {
            reject(new Error('Session expired'));
          }
        });
      });
    }
  }

  let responseData;
  try {
    responseData = await response.json();
  } catch (e) {
    responseData = { error: 'Invalid JSON response from server' };
  }

  // Handle CSRF Token expiration / invalidation
  if (response.status === 403 && (responseData.error?.toLowerCase().includes('csrf') || responseData.message?.toLowerCase().includes('csrf'))) {
    clearCsrfToken();
    const newCsrfToken = await fetchCsrfToken();
    if (newCsrfToken) {
      headers.set('X-CSRF-Token', newCsrfToken);
      // Retry request once
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include' as RequestCredentials,
      });
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = { error: 'Invalid JSON response from server' };
      }
    }
  }

  if (!response.ok) {
    const err: any = new Error(responseData.error || responseData.message || 'Request failed');
    err.status = response.status;
    if (responseData.details) err.details = responseData.details;
    throw err;
  }

  return responseData;
};
