import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ROUTINES: '@irontrack:routines',
  EVOLUTION: '@irontrack:evolution',
};

export const storageService = {
  /**
   * Salva a lista completa de rotinas no dispositivo
   */
  async saveRoutines(routines: any[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(routines);
      await AsyncStorage.setItem(KEYS.ROUTINES, jsonValue);
    } catch (error) {
      console.error('Erro ao salvar rotinas localmente:', error);
    }
  },

  /**
   * Busca a lista de rotinas salvas no dispositivo
   */
  async getRoutines(): Promise<any[] | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(KEYS.ROUTINES);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Erro ao buscar rotinas localmente:', error);
      return null;
    }
  },
  
  async saveEvolution(evolutionData: any[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(evolutionData);
      await AsyncStorage.setItem(KEYS.EVOLUTION, jsonValue);
    } catch (error) {
      console.error('Erro ao salvar evolução localmente:', error);
    }
  },

  async getEvolution(): Promise<any[] | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(KEYS.EVOLUTION);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Erro ao buscar evolução localmente:', error);
      return null;
    }
  },
};