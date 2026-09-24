import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Evento } from '../models/evento.model';
import { EstadisticasEventos } from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly api = inject(ApiService);

  getDashboardStats(): Observable<EstadisticasEventos> {
    return this.api.get<EstadisticasEventos>('/eventosfront/estadisticas');
  }

  getEventos(): Observable<Evento[]> {
    return this.api.get<Evento[]>('/eventosfront/optimizado');
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
