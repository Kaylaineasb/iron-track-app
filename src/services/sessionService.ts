import { api } from './api';

export interface SessaoTreinoModel {
  setNrId?: number;
  treNrId: number;
  setDtData?: string;
  setTmHoraInicio?: string;
}

export const sessionService = {
  /**
   * Verifica se já existe uma sessão aberta hoje no servidor
   */
  checkTodaySession: async (treNrId: number): Promise<{ setNrId: number | null; hasSession: boolean }> => {
    try {
      const response = await api.get<any>(`/api/v1/sessoes/ativas/${treNrId}`);
      
      if (response.data && response.data.setNrId) {
        return {
          setNrId: response.data.setNrId,
          hasSession: true
        };
      }
      return { setNrId: null, hasSession: false };
    } catch (error) {
      console.error('Erro ao checar sessão ativa:', error);
      return { setNrId: null, hasSession: false };
    }
  },

  /**
   * Cria/Inicia uma nova sessão física de treino
   */
  startSession: async (treNrId: number): Promise<SessaoTreinoModel> => {
    const payload = {
      setDtData: new Date().toISOString().split('T')[0],
      setTmHoraInicio: new Date().toISOString()
    };
    
    const response = await api.post<SessaoTreinoModel>(`/api/v1/sessoes/${treNrId}`, payload);
    return response.data;
  },

  /**
   * Finaliza uma sessão de treino existente injetando o timestamp de fim no banco Go
   */
  finishSession: async (setNrId: number): Promise<void> => {
    await api.put(`/api/v1/sessoes/${setNrId}`);
  }
};