import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Evento, EventoStatus, EventosPage } from '../models/evento.model';
import { EstadisticasEventos } from '../models/report.model';

export interface EventosQuery {
  skip?: number;
  limit?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  estatus?: EventoStatus;
  usuario_id?: number;
}

export class EventosResponseError extends Error {
  constructor() {
    super('La API de eventos devolvió un formato incompatible. Se esperaba { items, total, skip, limit }. Verifica que el servidor tenga la versión paginada del endpoint.');
    this.name = 'EventosResponseError';
  }
}

function isEventosPage(value: unknown): value is EventosPage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const page = value as Partial<EventosPage>;
  return Array.isArray(page.items)
    && typeof page.total === 'number' && Number.isSafeInteger(page.total) && page.total >= 0
    && typeof page.skip === 'number' && Number.isSafeInteger(page.skip) && page.skip >= 0
    && typeof page.limit === 'number' && Number.isSafeInteger(page.limit) && page.limit > 0;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly api = inject(ApiService);

  getDashboardStats(): Observable<EstadisticasEventos> {
    return this.api.get<EstadisticasEventos>('/eventosfront/estadisticas');
  }

  getEventos(query: EventosQuery = {}): Observable<EventosPage> {
    const params: Record<string, string | number> = { skip: query.skip ?? 0, limit: query.limit ?? 5 };
    for (const key of ['fecha_inicio', 'fecha_fin', 'estatus', 'usuario_id'] as const) {
      const value = query[key];
      if (value !== undefined && value !== '') params[key] = value;
    }
    return this.api.get<unknown>('/eventosfront/optimizado', { params }).pipe(
      map(response => {
        if (!isEventosPage(response)) throw new EventosResponseError();
        return response;
      }),
    );
  }

  getEventoById(id: number): Observable<Evento> {
    return this.api.get<Evento>(`/eventosfront/${id}/optimizado`);
  }

  updateEventoStatus(
    id: number,
    estatus: 'pendiente' | 'confirmado' | 'descartado',
  ): Observable<Evento> {
    return this.api.put<Evento>(`/eventos/${id}/status?estatus=${encodeURIComponent(estatus)}`, {});
  }

  updateEventoDescripcion(id: number, descripcion: string): Observable<any> {
    return this.api.patch(`/eventos/${id}/descripcion`, { descripcion });
  }
}
