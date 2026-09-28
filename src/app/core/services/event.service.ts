import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Evento, EventoStatus } from '../models/evento.model';
import { EstadisticasEventos } from '../models/report.model';

export interface EventosQuery {
  skip?: number;
  limit?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  estatus?: EventoStatus;
  usuario_id?: number;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly api = inject(ApiService);

  getDashboardStats(): Observable<EstadisticasEventos> {
    return this.api.get<EstadisticasEventos>('/eventosfront/estadisticas');
  }

  getEventos(query: EventosQuery = {}): Observable<Evento[]> {
    const params: Record<string, string | number> = { skip: query.skip ?? 0, limit: query.limit ?? 5 };
    for (const key of ['fecha_inicio', 'fecha_fin', 'estatus', 'usuario_id'] as const) {
      const value = query[key];
      if (value !== undefined && value !== '') params[key] = value;
    }
    return this.api.get<Evento[]>('/eventosfront/optimizado', { params });
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
