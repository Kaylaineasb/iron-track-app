import { api } from './api';

export interface EvolucaoModel {
    evoNrID?: number;
    usuNrID?: string;
    evoDtData?: string;
    evoNrPeso: number;
    evoNrAltura: number;
    evoNrOmbro: number | null;
    evoNrBusto: number | null;
    evoNrAbdomen: number | null;
    evoNrCintura: number | null;
    evoNrQuadril: number | null;
    evoNrBracoDireito: number | null;
    evoNrBracoEsquerdo: number | null;
    evoNrAntebracoDireito: number | null;
    evoNrAntebracoEsquerdo: number | null;
    evoNrCoxaDireita: number | null;
    evoNrCoxaEsquerda: number | null;
    evoNrPanturrilhaDireita: number | null;
    evoNrPanturrilhaEsquerda: number | null;
}

export const evolutionService = {
    /**
     * Puxa todo o histórico de evolução do usuário logado
     */
    getAll: async (): Promise<EvolucaoModel[]> => {
        const response = await api.get<EvolucaoModel[]>('/api/v1/evolucoes');
        return response.data || [];
    },

    /**
     * Salva um novo registro de evolução/biometria
     */
    create: async (payload: EvolucaoModel): Promise<EvolucaoModel> => {
        const response = await api.post<EvolucaoModel>('/api/v1/evolucoes', payload);
        return response.data;
    },

    /**
     * Remove um registro do histórico
     */
    delete: async (evoNrID: number): Promise<void> => {
        await api.delete(`/api/v1/evolucoes/${evoNrID}`);
    },

    /**
     * Puxa a última evolução cadastrada
     */
    getLatest: async (): Promise<EvolucaoModel | null> => {
        try {
            const response = await api.get<EvolucaoModel>('/api/v1/evolucoes/recente');
            return response.data || null;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }
};