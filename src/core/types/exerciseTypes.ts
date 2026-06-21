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

export interface ExercicioTreinoResponse {
  fitNrId: number;
  exeNrId: number;
  exeTxNome: string;
  fitNrMetaPeso: number;
  fitTxMetaRepeticoes: string[];
  fitBlDropSet: boolean;
}

export interface FichaTreinoEstruturada {
  isConjudado: boolean;
  fitNrMetaSeries: number;
  Exercicios: ExercicioTreinoResponse[];
}

export interface ModalSetInput {
  targetReps: string;
}

export interface FichaTreinoPayload {
  treNrId: number;
  exeNrId: number;
  fitNrOrdem: number;
  fitNrMetaSeries: number;
  fitTxMetaRepeticoes: string;
  fitNrMetaPeso: number;
  fitNrGrupo?: number;
  fitBlDropSet: boolean;
}