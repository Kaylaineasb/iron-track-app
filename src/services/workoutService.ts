import { api } from './api';

export interface WorkoutRoutine {
  treNrId?: number;
  treTxNome: string;
  treTxDescricao: string;
}

export const workoutService = {
  /**
   * Puxa todos os treinos criados pelo usuário logado
   */
  getAll: async (searchQuery: string = ''): Promise<WorkoutRoutine[]> => {
    const response = await api.get<WorkoutRoutine[]>(`/api/v1/treinos?treTxNome=${searchQuery}`);
    return response.data || [];
  },

  /**
   * Salva um novo Treino (Rotina)
   */
  create: async (name: string, description: string): Promise<WorkoutRoutine> => {
    const response = await api.post<WorkoutRoutine>('/api/v1/treinos', {
      treTxNome: name.trim(),
      treTxDescricao: description.trim(),
    });
    return response.data;
  },

  /**
   * Edita um treino existente
   */
  update: async (id: number, name: string, description: string): Promise<WorkoutRoutine> => {
    const response = await api.put<WorkoutRoutine>(`/api/v1/treinos`, {
      treNrId: id,
      treTxNome: name.trim(),
      treTxDescricao: description.trim(),
    });
    return response.data;
  },

  /**
   * Deleta o treino e suas fichas associadas cascateado pelo Go
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/treinos/${id}`);
  }
};