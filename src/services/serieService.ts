import { api } from './api';

export interface SerieExecutadaPayload {
  sexNrId?: number;
  setNrId: number;
  fitNrId: number;
  sexNrSerieNumero: number;
  sexTxRepeticoesExecutadas: string;
  sexNrPesoUtilizado: number;
}

export const serieService = {
  /**
   * Registra uma série executada no servidor
   */
  save: async (treNrId: number, payload: SerieExecutadaPayload): Promise<{ sexNrId: number }> => {
    const response = await api.post<{ sexNrId: number }>(`/api/v1/series/${treNrId}`, payload);
    return response.data;
  },
  /**
   * Desmarca uma série excluindo o registro do banco
   */
  delete: async (sexNrId: number): Promise<void> => {
    await api.delete(`/api/v1/series/${sexNrId}`);
  }
};