export type LogType = 'info' | 'advertencia' | 'error';

export interface SystemLog {
  log_id: number;
  hora_log: string;
  tipo: LogType;
  mensaje: string;
}

export interface LogFilters {
  skip?: number;
  limit?: number;
  fecha?: string;
  tipo?: LogType | '';
}
