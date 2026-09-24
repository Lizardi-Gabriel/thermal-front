import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { LogFilters, SystemLog } from '../models/log.model';

@Injectable({ providedIn: 'root' })
export class LogService {
  private readonly http = inject(HttpClient);

  getLogs(filters: LogFilters = {}): Observable<SystemLog[]> {
    const params: Record<string, string> = {
      skip: String(filters.skip ?? 0),
      limit: String(filters.limit ?? 50),
    };
    if (filters.fecha) params['fecha'] = filters.fecha;
    if (filters.tipo) params['tipo'] = filters.tipo;
    return this.http.get<SystemLog[]>(`${environment.apiUrl}/logs`, { params });
  }
}
