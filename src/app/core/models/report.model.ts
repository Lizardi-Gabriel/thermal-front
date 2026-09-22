export interface EstadisticasEventos {
  total_eventos: number;
  eventos_pendientes: number;
  eventos_confirmados: number;
  eventos_descartados: number;
  total_detecciones: number;
  promedio_detecciones_por_evento: number;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
}

export interface ReportFilters {
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  usuario_id?: number | null;
  estatus?: string | null;
}
