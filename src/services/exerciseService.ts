import { api } from './api';

export interface ExercicioModel {
  exeNrId?: number;
  exeTxNome: string;
  exeTxGrupoMuscular: string;
  exeTxGrupoMuscularSinergista: string;
  exeTxTipoEquipamento: string;
  isCustom: boolean;
}

export const exerciseService = {

  /**
   * Puxa todos os exercícios cadastrados no banco (padrão + customizados)
   */
  getAll: async (searchQuery: string = ''): Promise<ExercicioModel[]> => {
    // Passa o filtro por query string exatamente como o exercicioHandler do Go espera
    const response = await api.get<ExercicioModel[]>(`/api/v1/exercicios?exeTxNome=${searchQuery}`);
    return response.data || [];
  },
  
  /**
   * Cadastra um exercício customizado criado pelo usuário logado
   */
  createCustom: async (payload: ExercicioModel): Promise<ExercicioModel> => {
    const response = await api.post<ExercicioModel>('/api/v1/exercicios', payload);
    return response.data;
  }
};