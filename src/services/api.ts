import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const ENCODED_URL = process.env.EXPO_PUBLIC_API_URL || '';
const API_URL = atob(ENCODED_URL);

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshQueue: any[] = [];
let onSessionExpiredCallback: (() => void) | null = null;

export const registerSessionExpiredListener = (callback: () => void) => {
  onSessionExpiredCallback = callback;
};

const processQueue = (error: any, token: string | null = null) => {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  refreshQueue = [];
};

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('jwtToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Falha ao recuperar o token do SecureStore', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');

        if (!storedRefreshToken) {
          throw new Error('Refresh Token não localizado no SecureStore');
        }

        const refreshResponse = await axios.post(`${API_URL}/api/v1/refresh`, {
          usuTxRefreshToken: storedRefreshToken,
        });

        const { jwtToken, usuTxRefreshToken } = refreshResponse.data;

        await SecureStore.setItemAsync('jwtToken', jwtToken);
        if (usuTxRefreshToken) {
          await SecureStore.setItemAsync('refreshToken', usuTxRefreshToken);
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        originalRequest.headers.Authorization = `Bearer ${jwtToken}`;

        processQueue(null, jwtToken);
        isRefreshing = false;

        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        await SecureStore.deleteItemAsync('jwtToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('userName');

        if (onSessionExpiredCallback) {
          onSessionExpiredCallback();
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);