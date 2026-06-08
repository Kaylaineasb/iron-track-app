import { api } from './api';
import * as SecureStore from 'expo-secure-store';

interface AuthResponse {
  jwtToken?: string;
  usuTxNome: string;
  usuTxEmail: string;
}

export const authService = {
  /**
   * Envia as credenciais para o backend (JWTRequest)
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/v1/login', {
      usuTxEmail: email.trim(),
      usuTxSenha: password,
    });

    if (response.data && response.data.jwtToken) {
      await SecureStore.setItemAsync('user_token', response.data.jwtToken);
      await SecureStore.setItemAsync('user_name', response.data.usuTxNome);
    }

    return response.data;
  },

  /**
   * Cadastra um novo usuário
   */
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/v1/usuarios', {
      usuTxNome: name.trim(),
      usuTxEmail: email.trim(),
      usuTxSenha: password,   
    });

    return response.data;
  },

  /**
   * Limpa o token do aparelho para efetuar o logout
   */
  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync('user_token');
  },

  /**
   * Verifica se o usuário possui uma sessão ativa
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync('user_token');
    return !!token;
  }
};