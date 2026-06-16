export interface SessaoTreinoDetalhada {
  setNrId: number;
  treNrId: number;
  treTxNome: string;
  treTxDescricao?: string;
  setDtData: string;
  setTmHoraInicio: string;
  setTmHoraFim?: string;
}

export interface SerieExecutadaDetalhada {
  sexNrId: number;
  setNrId: number;
  fitNrId: number;
  sexNrSerieNumero: number;
  sexNrPesoUtilizado: number;
  sexTxRepeticoesExecutadas: string;
  fitNrOrdem: number;
  exeTxNome: string;
}

export interface ExerciciosAgrupados {
  nomeExercicio: string;
  series: SerieExecutadaDetalhada[];
}

export interface SectionHistoryData {
  title: string;
  data: SessaoTreinoDetalhada[];
}