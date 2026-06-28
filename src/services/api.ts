import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

const ENCODED_URL = process.env.EXPO_PUBLIC_API_URL || '';
const API_URL = atob(ENCODED_URL);
// const API_URL =process.env.EXPO_PUBLIC_API_URL || '';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
   headers: {
    'Content-Type': 'application/json',
    'Connection': 'close',
  },
  httpAgent: undefined,
  httpsAgent: undefined,
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
  (response) => {
    console.log("<<< RESPONSE >>>");
    console.log(response.config.url);
    console.log(response.status);
    console.log(response.data);
    if ((response.status === 200 || response.status === 201) && !response.data) {
      console.log("API", API_URL);
      response.data = {}; 
    }
    return response;
  },
  async (error) => {
    console.log("<<< ERROR >>>");
    console.log("URL:", error.config?.url);
    console.log("MESSAGE:", error.message);
    console.log("CODE:", error.code);
    console.log("STATUS:", error.response?.status);
    console.log("REQUEST:", error.request?._response);
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    if (status === 429) {
      Alert.alert(
        "Calma aí, atleta!",
        "Você está enviando requisições rápido demais. Aguarde alguns segundos e tente novamente."
      );
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      
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