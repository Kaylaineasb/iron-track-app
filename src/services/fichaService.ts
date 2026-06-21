import { FichaTreinoPayload, FichaTreinoEstruturada } from '@/core/types/exerciseTypes';
import { api } from './api';

export const fichaService = {
  /**
   * Busca todas as fichas/exercícios associados a um treino específico
   */
  getByTreinoId: async (treNrId: number): Promise<FichaTreinoEstruturada[]> => {
    const response = await api.get<FichaTreinoEstruturada[]>(`/api/v1/fichas/treino/${treNrId}`);
    return response.data || [];
  },

  /**
   * Adiciona um novo exercício à ficha de um treino
   */
  create: async (payload: FichaTreinoPayload): Promise<FichaTreinoPayload> => {
    const response = await api.post<FichaTreinoPayload>('/api/v1/fichas', payload);
    return response.data;
  },

  /**
   * Edita uma ficha/exercício existente
   */
  update: async (payload: FichaTreinoPayload): Promise<FichaTreinoPayload> => {
    const response = await api.put<FichaTreinoPayload>('/api/v1/fichas', payload);
    return response.data;
  },

  /**
   * Remove um exercício da ficha
   */
  delete: async (fitNrId: number): Promise<void> => {
    await api.delete(`/api/v1/fichas/${fitNrId}`);
  }
};