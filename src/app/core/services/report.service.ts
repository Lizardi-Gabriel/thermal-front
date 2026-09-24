import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ReportFilters } from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly http = inject(HttpClient);

  getReportPdf(filters: Pick<ReportFilters, 'fecha_inicio' | 'fecha_fin'> = {}): Observable<Blob> {
    const params: Record<string, string> = {};
    if (filters.fecha_inicio) params['fecha_inicio'] = filters.fecha_inicio;
    if (filters.fecha_fin) params['fecha_fin'] = filters.fecha_fin;
    return this.http.get(`${environment.apiUrl}/admin/reportes/generar-pdf`, {
      responseType: 'blob',
      params,
    });
  }

  getReportFilters(): ReportFilters {
    return {
      fecha_inicio: null,
      fecha_fin: null,
      usuario_id: null,
      estatus: null,
    };
  }

  downloadPdf(blob: Blob, filename = 'reporte.pdf'): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
  }

  openPdfInNewTab(blob: Blob, tab: Window): void {
    const url = window.URL.createObjectURL(blob);
    tab.location.replace(url);
    setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
  }

  async getErrorMessage(error: HttpErrorResponse): Promise<string> {
    if (error.status === 403) return 'Acceso denegado: el servidor permite generar reportes solo a administradores. Inicia sesión con una cuenta administradora.';
    if (error.status === 401) return 'La sesión expiró. Vuelve a iniciar sesión.';
    if (error.status === 0) return 'No se pudo conectar con el servidor. Revisa la conexión y vuelve a intentar.';
    try {
      const body = error.error instanceof Blob ? JSON.parse(await error.error.text()) : error.error;
      if (typeof body?.detail === 'string') return body.detail;
    } catch { /* The server may return a non-JSON error. */ }
    return 'No se pudo generar el PDF. Vuelve a intentar.';
  }
}
