import { EvolucaoModel } from '@/services/evolutionService';

export interface SectionData {
  title: string;
  data: EvolucaoModel[];
}

export interface EvolutionFormState {
  weight: string;
  height: string;
  shoulder: string;
  bust: string;
  abdomen: string;
  waist: string;
  quadril: string;
  armRight: string;
  armLeft: string;
  forearmRight: string;
  forearmLeft: string;
  thighRight: string;
  thighLeft: string;
  calfRight: string;
  calfLeft: string;
}