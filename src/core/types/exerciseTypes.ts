export interface SetMeta {
  id: string;
  setNumber: number;
  targetReps: string;
  doneReps: string;
  doneWeight: string;
  isDone: boolean;
  sexNrId?: number;
  targetWeight?: string;
}

export interface Exercise {
  fitNrGrupo: number | null;
  isConjugado: boolean;
  exercicios: {
    fitNrId: number;
    exeNrId: number;
    exeTxNome: string;
    fitNrOrdem: number;
    fitNrMetaSeries: number;
    fitTxMetaRepeticoes: string[];
    fitNrMetaPeso: number;
  }[];
}

export interface ModalSetInput {
  targetReps: string;
}