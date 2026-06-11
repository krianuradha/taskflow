import axios, { type AxiosError } from 'axios';
import {
  clearTokens,
  getAccessToken,
  markRefreshInProgress,
  clearRefreshFlag,
  redirectToLogin,
  setAccessToken
} from './auth';

const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshEndpoint(originalRequest.url)) {
        clearTokens();
        redirectToLogin();
        return Promise.reject(error);
      }

      try {
        if (typeof window !== 'undefined') {
          markRefreshInProgress();
        }

        const response = await axios.post(
          '/api/v1/auth/refresh-token',
          {},
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const accessToken = response.data?.accessToken as string | undefined;
        if (accessToken) {
          setAccessToken(accessToken);
          clearRefreshFlag();
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        clearTokens();
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      clearTokens();
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

function isRefreshEndpoint(url?: string | null) {
  if (!url) return false;
  return url.includes('/api/v1/auth/refresh-token');
}

export default api;
