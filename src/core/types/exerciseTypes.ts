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
  id: string;
  exeNrId: number;
  name: string;
  sets: SetMeta[];
  groupId?: string;
  fitNrOrdem: number;
}

export interface ModalSetInput {
  targetReps: string;
}