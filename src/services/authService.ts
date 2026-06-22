import { api } from './api';
import * as SecureStore from 'expo-secure-store';

interface RegisterResponse {
  usuTxNome: string;
  usuTxEmail: string;
}

interface LoginResponse {
  jwtToken: string;
  usuTxNome: string;
  usuTxRefreshToken: string;
}

export const authService = {
  /**
   * Envia as credenciais para o backend (JWTRequest)
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/v1/login', {
      usuTxEmail: email.trim(),
      usuTxSenha: password,
    });

    const { jwtToken, usuTxRefreshToken, usuTxNome } = response.data;

    if (jwtToken && usuTxRefreshToken) {
      await SecureStore.setItemAsync('jwtToken', jwtToken);
      await SecureStore.setItemAsync('refreshToken', usuTxRefreshToken);
      await SecureStore.setItemAsync('userName', usuTxNome || '');
    }

    return response.data;
  },

  /**
   * Cadastra um novo usuário
   */
  register: async (name: string, email: string, password: string): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/api/v1/usuarios', {
      usuTxNome: name.trim(),
      usuTxEmail: email.trim(),
      usuTxSenha: password,   
    });

    return response.data;
  },

  /**
   * Limpa todos os tokens do aparelho para efetuar o logout completo
   */
  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync('jwtToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('userName');
  },

  /**
   * Verifica se o usuário possui uma sessão ativa baseado na existência do JWT
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync('jwtToken');
    return !!token;
  }
};