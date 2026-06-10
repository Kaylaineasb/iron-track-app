import { api } from './api';

// Interface que espelha o payload de envio para o Go (model.FichaTreino)
export interface FichaTreinoPayload {
  fitNrId?: number;
  treNrId: number;
  exeNrId: number;
  fitNrOrdem: number;
  fitNrMetaSeries: number;
  fitTxMetaRepeticoes: string;
  fitNrMetaPeso: number;
  fitNrGrupo?: number;
}

// Interface que espelha a resposta do Go (model.FichaTreinoResponse)
export interface FichaTreinoResponse {
  fitNrId: number;
  treNrId: number;
  exeNrId: number;
  exeTxNome: string;
  fitNrOrdem: number;
  fitNrMetaSeries: number;
  fitTxMetaRepeticoes: string;
  fitNrMetaPeso: number;
  fitNrGrupo?: number;
}

export const fichaService = {
  /**
   * Busca todas as fichas/exercícios associados a um treino específico
   */
  getByTreinoId: async (treNrId: number): Promise<FichaTreinoResponse[]> => {
    const response = await api.get<FichaTreinoResponse[]>(`/api/v1/fichas/treino/${treNrId}`);
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