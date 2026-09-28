import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '@app/core/services/event.service';
import { Evento } from '@app/core/models/evento.model';
import { DetectionImageComponent, mexicoTime } from '../components/detection-image.component';
import { AirSummaryComponent } from '../components/air-summary.component';

@Component({
  selector: 'app-eventos-list', standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DetectionImageComponent, AirSummaryComponent],
  template: `
    <section class="page-shell">
      <header><p class="eyebrow">Monitoreo térmico</p><h1>Galería de eventos</h1><p class="muted">Explora las detecciones y revisa cada evento.</p></header>
      <div class="filters">
        <div class="date-navigation">
          <button type="button" aria-label="Día anterior" (click)="changeDay(-1)">←</button>
          <div class="date-field"><label for="event-date">Desde</label>
          <input id="event-date" type="date" [(ngModel)]="selectedDate" (ngModelChange)="applyFilters()" [max]="endDate"></div>
          <button type="button" aria-label="Día siguiente" (click)="changeDay(1)">→</button>
          <div class="date-field"><label for="event-end-date">Hasta</label>
          <input id="event-end-date" type="date" [(ngModel)]="endDate" (ngModelChange)="applyFilters()" [min]="selectedDate"></div>
          <button type="button" (click)="selectDay(today)">Hoy</button>
          <button type="button" (click)="selectDay('')">Todas las fechas</button>
        </div>
      </div>
      <p *ngIf="loading" role="status">Cargando eventos…</p>
      <p *ngIf="error" role="alert">{{ error }} <button (click)="loadPage(requestedPage)">Reintentar</button></p>
      <ng-container *ngIf="!loading && !error">
        <h2 aria-live="polite">Eventos <span class="muted">({{ eventos.length }} en esta página)</span></h2>
        <div class="grid">
          <a class="card" *ngFor="let evento of eventos" [routerLink]="['/eventos', evento.evento_id]" [queryParams]="{ fecha: selectedDate, fecha_fin: endDate, pagina: page }" [attr.aria-label]="'Ver evento ' + evento.evento_id">
            <div class="preview">
              <app-detection-image *ngIf="evento.imagen_preview as preview; else noImage" [imagen]="preview" />
              <ng-template #noImage><p class="placeholder">Sin imagen disponible</p></ng-template>
              <span class="badge" [ngClass]="evento.estatus">{{ evento.estatus }}</span>
              <span class="date">{{ evento.fecha_evento | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="card-body">
              <div class="card-heading"><strong>Evento #{{ evento.evento_id }}</strong><span class="max">Máx. {{ evento.max_detecciones ?? 0 }}</span></div>
              <p class="schedule">{{ eventTime(evento, evento.hora_inicio) }} — {{ eventTime(evento, evento.hora_fin) }} <small>CDMX</small></p>
              <p class="description">{{ evento.descripcion || 'Sin descripción disponible.' }}</p>
              <app-air-summary [evento]="evento" />
              <div class="footer"><span>{{ evento.total_imagenes ?? 0 }} imágenes</span><span>Ver detalle →</span></div>
            </div>
          </a>
        </div>
        <div class="empty-state" *ngIf="!eventos.length">No hay eventos para las fechas seleccionadas. Cambia el rango o consulta todas las fechas.</div>
      </ng-container>
      <nav class="pagination" aria-label="Paginación de eventos">
        <button type="button" (click)="loadPage(page - 1)" [disabled]="loading || page === 0 || invalidDates">Anterior</button>
        <span aria-live="polite">Página {{ page + 1 }} · 5 eventos por página</span>
        <button type="button" (click)="loadPage(page + 1)" [disabled]="loading || !hasNext || !!error || invalidDates">Siguiente</button>
      </nav>
      <p *ngIf="endReached && !loading && !error" role="status">No hay más eventos.</p>
    </section>
  `,
  styles: [`
    :host{display:block;min-width:0}.page-shell{display:grid;gap:1.3rem}h1{margin:.4rem 0;font-size:1.9rem}h2{font-size:1.15rem;margin:0}.eyebrow{color:var(--primary);letter-spacing:.12em;text-transform:uppercase;font-size:.75rem;margin:0}.muted,small{color:var(--muted)}
    .filters{background:var(--bg-elevated);border:1px solid var(--panel-border);border-radius:16px;padding:1rem}.filters label{display:block;margin-bottom:.7rem;font-weight:600}.date-navigation{display:flex;align-items:flex-end;gap:.6rem;flex-wrap:wrap}.date-field{display:grid;gap:.3rem}.date-field label{margin:0}button,input{background:#162235;color:var(--text);padding:.7rem;border:1px solid var(--panel-border);border-radius:9px}button{cursor:pointer}input{min-width:0;flex:1;max-width:260px}a:focus-visible,button:focus-visible,input:focus-visible{outline:2px solid var(--primary);outline-offset:3px}
    .pagination{display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap}button:disabled{opacity:.5;cursor:not-allowed}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(320px,100%),1fr));gap:1.25rem}.card{display:flex;flex-direction:column;min-width:0;border:1px solid var(--panel-border);border-radius:16px;overflow:hidden;background:var(--bg-elevated);text-decoration:none;transition:border-color .2s}.card:hover{border-color:var(--primary)}.preview{position:relative;background:#080e19;aspect-ratio:16/10;display:grid;align-items:center;overflow:hidden}.preview app-detection-image{width:100%;height:100%;--detection-height:100%;--detection-width:100%}.placeholder{text-align:center;color:var(--muted)}.badge,.date{position:absolute;font-size:.8rem;padding:.4rem .7rem;border-radius:999px}.badge{right:.8rem;top:.8rem;text-transform:capitalize;font-weight:700}.date{bottom:.7rem;left:.7rem;background:#0b1220e8}.pendiente{background:#453b16;color:#fde68a}.confirmado{background:#123c32;color:#6ee7b7}.descartado{background:#481f2a;color:#fda4af}.card-body{padding:1.1rem;display:grid;gap:.9rem;flex:1}.card-heading,.footer{display:flex;justify-content:space-between;gap:.6rem;align-items:center}.max{background:#443b1b;color:#fde68a;border-radius:999px;padding:.3rem .6rem;font-size:.75rem}.schedule{font-size:.85rem;margin:0}.description{color:var(--muted);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.5}.footer{border-top:1px solid var(--panel-border);padding-top:.8rem;font-size:.8rem;color:var(--primary)}.empty-state{padding:2rem;border:1px dashed var(--panel-border);border-radius:16px;text-align:center;color:var(--muted)}
  `],
})
export class EventosListComponent implements OnInit, OnDestroy {
  private readonly eventService = inject(EventService);
  private readonly route = inject(ActivatedRoute);
  today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  selectedDate = this.route.snapshot.queryParamMap.get('fecha') ?? this.today;
  endDate = this.route.snapshot.queryParamMap.get('fecha_fin') ?? this.selectedDate;
  readonly pageSize = 5;
  private readonly initialPage = Number(this.route.snapshot.queryParamMap.get('pagina'));
  page = Number.isSafeInteger(this.initialPage) && this.initialPage >= 0 ? this.initialPage : 0;
  requestedPage = this.page;
  eventos: Evento[] = [];
  loading = false;
  error = '';
  hasNext = false;
  endReached = false;
  private request?: Subscription;

  get invalidDates(): boolean {
    return !!(this.selectedDate && this.endDate && this.selectedDate > this.endDate);
  }

  applyFilters(): void {
    this.request?.unsubscribe();
    this.page = 0;
    this.eventos = [];
    this.hasNext = false;
    this.loadPage(0);
  }

  selectDay(date: string): void {
    this.selectedDate = date;
    this.endDate = date;
    this.applyFilters();
  }

  changeDay(delta: number): void {
    const date = new Date(`${this.selectedDate || this.today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + delta);
    this.selectDay(date.toISOString().slice(0, 10));
  }

  eventTime(evento: Evento, hora?: string | null): string { return mexicoTime(hora ? `${evento.fecha_evento}T${hora}` : null); }

  ngOnInit(): void { this.loadPage(this.page); }
  ngOnDestroy(): void { this.request?.unsubscribe(); }

  loadPage(page: number): void {
    if (page < 0 || !Number.isSafeInteger(page)) return;
    this.request?.unsubscribe();
    this.requestedPage = page;
    this.error = '';
    this.endReached = false;
    if (this.invalidDates) {
      this.loading = false;
      this.error = 'La fecha inicial debe ser anterior o igual a la fecha final.';
      return;
    }
    this.loading = true;
    this.request = this.eventService.getEventos({
      skip: page * this.pageSize,
      limit: this.pageSize,
      fecha_inicio: this.selectedDate,
      fecha_fin: this.endDate,
    }).subscribe({
      next: data => {
        this.loading = false;
        this.hasNext = data.length === this.pageSize;
        this.endReached = !this.hasNext;
        // An exact multiple of five is only known to be the end after an empty request.
        if (!data.length && page > this.page && this.eventos.length) return;
        this.eventos = data;
        this.page = page;
      },
      error: () => { this.loading = false; this.error = 'No se pudieron cargar los eventos.'; },
    });
  }
}
