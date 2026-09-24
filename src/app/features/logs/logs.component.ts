import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, switchMap } from 'rxjs';
import { LogService } from '@app/core/services/log.service';
import { LogFilters, LogType, SystemLog } from '@app/core/models/log.model';

@Component({
  selector: 'app-logs', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <header><p class="eyebrow">Sistema</p><h1>Logs del backend</h1><p class="muted">Historial de actividad, advertencias y errores.</p></header>
      <form class="filters" (ngSubmit)="load()">
        <label for="log-date">Fecha<input id="log-date" name="fecha" type="date" [(ngModel)]="fecha" (ngModelChange)="resetPage()" aria-describedby="date-help"></label>
        <label for="log-type">Tipo<select id="log-type" name="tipo" [(ngModel)]="tipo" (ngModelChange)="resetPage()"><option value="">Todos los tipos</option><option value="info">Información</option><option value="advertencia">Advertencias</option><option value="error">Errores</option></select></label>
        <button type="submit" [disabled]="loading">Actualizar</button>
        <button type="button" class="secondary" (click)="clear()">Limpiar filtros</button>
        <p id="date-help" class="muted help">La fecha se compara con la almacenada en el backend, sin conversión a horario de México. Sin fecha se consultan todos los días.</p>
      </form>
      <p *ngIf="loading" role="status">Cargando registros…</p>
      <div *ngIf="error" class="error-state" role="alert">{{ error }} <button type="button" (click)="load()">Reintentar</button></div>
      <ng-container *ngIf="!loading && !error">
        <div class="stats" aria-label="Conteos de la página actual">
          <div><strong>{{ logs.length }}</strong><span>En esta página</span></div>
          <div><strong>{{ count('info') }}</strong><span>Información</span></div>
          <div><strong>{{ count('advertencia') }}</strong><span>Advertencias</span></div>
          <div><strong>{{ count('error') }}</strong><span>Errores</span></div>
        </div>
        <div class="results-heading"><h2>Registros de esta página ({{ logs.length }})</h2><span class="muted">Más recientes primero</span></div>
        <p class="empty-state" *ngIf="!logs.length" role="status">{{ skip === 0 ? 'No hay registros que coincidan con los filtros seleccionados.' : 'No hay más registros. Puedes volver a la página anterior.' }}</p>
        <article class="log" *ngFor="let log of logs; trackBy: trackLog" [ngClass]="log.tipo">
          <div class="log-header"><div><span class="log-id">#{{ log.log_id }}</span> <time [attr.datetime]="log.hora_log">{{ timestamp(log.hora_log) }}</time></div><span class="badge">{{ log.tipo === 'info' ? 'Información' : log.tipo }}</span></div>
          <p class="message">{{ log.mensaje }}</p>
        </article>
        <p *ngIf="logs.length" class="muted">Las marcas de tiempo se muestran tal como las devuelve el servidor, sin conversión de zona horaria.</p>
      </ng-container>
      <nav class="pagination" aria-label="Paginación de logs">
        <button type="button" [disabled]="loading || skip === 0" (click)="previousPage()">← Anterior</button>
        <div aria-live="polite">Página {{ page }}<small *ngIf="!loading && !error && logs.length">Registros {{ skip + 1 }}–{{ skip + logs.length }}</small></div>
        <button type="button" [disabled]="loading || !!error || !hasNext" (click)="nextPage()">Siguiente →</button>
      </nav>
    </section>
  `,
  styles: [`
    .pagination{display:flex;justify-content:space-between;align-items:center;gap:.75rem;flex-wrap:wrap}.pagination div{text-align:center}.pagination small{display:block;color:var(--muted);margin-top:.4rem}
    :host{display:block;min-width:0}.page-shell{display:grid;gap:1.25rem;min-width:0}h1{margin:.4rem 0;font-size:1.9rem}h2{font-size:1.1rem;margin:0}.eyebrow{color:var(--primary);text-transform:uppercase;letter-spacing:.12em;font-size:.75rem;margin:0}.muted,time{color:var(--muted)}
    .filters{display:flex;flex-wrap:wrap;gap:1rem;align-items:end;background:var(--bg-elevated);border:1px solid var(--panel-border);border-radius:16px;padding:1.25rem}label{display:grid;gap:.5rem;flex:1 1 190px;min-width:0}input,select,button{font:inherit;background:var(--panel);color:var(--text);border:1px solid var(--panel-border);border-radius:9px;padding:.75rem;min-width:0}button{cursor:pointer;background:#1d4ed8}.secondary{background:var(--panel)}button:disabled{opacity:.6;cursor:wait}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--primary);outline-offset:3px}.help{flex-basis:100%;margin:0;font-size:.85rem;line-height:1.5}
    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.8rem}.stats>div{display:grid;gap:.5rem;padding:1rem;background:var(--bg-elevated);border:1px solid var(--panel-border);border-radius:12px}.stats strong{font-size:1.6rem;color:var(--primary)}.stats span{font-size:.85rem;color:var(--muted)}.results-heading,.log-header{display:flex;justify-content:space-between;align-items:center;gap:.75rem;flex-wrap:wrap}.results-heading>span{font-size:.85rem}
    .log{min-width:0;padding:1.2rem;border:1px solid var(--panel-border);border-left:4px solid var(--primary);border-radius:12px;background:var(--bg-elevated)}.log.advertencia{border-left-color:#facc15}.log.error{border-left-color:#f87171}.log-header{font-size:.8rem}.log-id{color:var(--muted);margin-right:.7rem}.badge{padding:.35rem .7rem;border-radius:999px;text-transform:capitalize;background:#172e50;color:#93c5fd}.advertencia .badge{background:#453b16;color:#fde68a}.error .badge{background:#481f2a;color:#fda4af}.message{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;margin:1rem 0 0}.empty-state,.error-state{padding:1.5rem;border:1px dashed var(--panel-border);border-radius:12px}.error-state{color:#fda4af}@media(max-width:520px){.stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `],
})
export class LogsComponent implements OnInit {
  private readonly service = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requests = new Subject<LogFilters>();
  fecha = '';
  tipo: LogType | '' = '';
  logs: SystemLog[] = [];
  readonly pageSize = 10;
  skip = 0;
  hasNext = false;
  get page(): number { return this.skip / this.pageSize + 1; }
  loading = false;
  error = '';

  ngOnInit(): void {
    this.requests.pipe(
      switchMap(filters => this.service.getLogs(filters).pipe(
        map(logs => ({ logs, error: '' })),
        catchError((error: HttpErrorResponse) => of({ logs: [] as SystemLog[], error: this.errorMessage(error) })),
      )),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(result => { this.hasNext = result.logs.length > this.pageSize; this.logs = result.logs.slice(0, this.pageSize); this.error = result.error; this.loading = false; });
    this.load();
  }
  load(): void {
    this.loading = true;
    this.error = '';
    // One extra record detects another page without requiring a total count.
    this.requests.next({ fecha: this.fecha, tipo: this.tipo, skip: this.skip, limit: this.pageSize + 1 });
  }
  resetPage(): void { this.skip = 0; this.hasNext = false; this.load(); }
  previousPage(): void { if (!this.loading && this.skip > 0) { this.skip -= this.pageSize; this.load(); } }
  nextPage(): void { if (!this.loading && !this.error && this.hasNext) { this.skip += this.pageSize; this.load(); } }
  clear(): void { this.fecha = ''; this.tipo = ''; this.resetPage(); }
  count(tipo: LogType): number { return this.logs.filter(log => log.tipo === tipo).length; }
  trackLog(_index: number, log: SystemLog): number { return log.log_id; }
  timestamp(value: string): string { return value.replace('T', ' '); }
  private errorMessage(error: HttpErrorResponse): string {
    if (error.status === 422) return 'La fecha o el tipo no son válidos. Selecciona una fecha válida y uno de los tipos disponibles.';
    if (error.status === 401) return 'La sesión expiró. Inicia sesión nuevamente.';
    if (error.status === 403) return 'Tu cuenta no tiene permiso para consultar estos registros.';
    if (error.status === 0) return 'No se pudo conectar con el backend. Revisa la conexión e intenta nuevamente.';
    return 'No se pudieron cargar los registros. Intenta nuevamente.';
  }
}
