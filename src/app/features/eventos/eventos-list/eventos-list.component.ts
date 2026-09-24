import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
        <label for="event-date">Filtrar por fecha</label>
        <div class="date-navigation">
          <button type="button" aria-label="Día anterior" (click)="changeDay(-1)">←</button>
          <input id="event-date" type="date" [(ngModel)]="selectedDate">
          <button type="button" aria-label="Día siguiente" (click)="changeDay(1)">→</button>
          <button type="button" (click)="selectedDate = today">Hoy</button>
          <button type="button" (click)="selectedDate = ''">Todas las fechas</button>
        </div>
      </div>
      <p *ngIf="loading" role="status">Cargando eventos…</p>
      <p *ngIf="error" role="alert">{{ error }} <button (click)="ngOnInit()">Reintentar</button></p>
      <ng-container *ngIf="!loading && !error">
        <h2 aria-live="polite">Eventos <span class="muted">({{ filteredEvents.length }})</span></h2>
        <div class="grid">
          <a class="card" *ngFor="let evento of filteredEvents" [routerLink]="['/eventos', evento.evento_id]" [queryParams]="{ fecha: selectedDate }" [attr.aria-label]="'Ver evento ' + evento.evento_id">
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
        <div class="empty-state" *ngIf="!filteredEvents.length">No hay eventos para esta fecha. Selecciona otro día o consulta todas las fechas.</div>
      </ng-container>
    </section>
  `,
  styles: [`
    :host{display:block;min-width:0}.page-shell{display:grid;gap:1.3rem}h1{margin:.4rem 0;font-size:1.9rem}h2{font-size:1.15rem;margin:0}.eyebrow{color:var(--primary);letter-spacing:.12em;text-transform:uppercase;font-size:.75rem;margin:0}.muted,small{color:var(--muted)}
    .filters{background:var(--bg-elevated);border:1px solid var(--panel-border);border-radius:16px;padding:1rem}.filters label{display:block;margin-bottom:.7rem;font-weight:600}.date-navigation{display:flex;gap:.6rem;flex-wrap:wrap}button,input{background:#162235;color:var(--text);padding:.7rem;border:1px solid var(--panel-border);border-radius:9px}button{cursor:pointer}input{min-width:0;flex:1;max-width:260px}a:focus-visible,button:focus-visible,input:focus-visible{outline:2px solid var(--primary);outline-offset:3px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(320px,100%),1fr));gap:1.25rem}.card{display:flex;flex-direction:column;min-width:0;border:1px solid var(--panel-border);border-radius:16px;overflow:hidden;background:var(--bg-elevated);text-decoration:none;transition:border-color .2s}.card:hover{border-color:var(--primary)}.preview{position:relative;background:#080e19;aspect-ratio:16/10;display:grid;align-items:center;overflow:hidden}.preview app-detection-image{width:100%;height:100%;--detection-height:100%;--detection-width:100%}.placeholder{text-align:center;color:var(--muted)}.badge,.date{position:absolute;font-size:.8rem;padding:.4rem .7rem;border-radius:999px}.badge{right:.8rem;top:.8rem;text-transform:capitalize;font-weight:700}.date{bottom:.7rem;left:.7rem;background:#0b1220e8}.pendiente{background:#453b16;color:#fde68a}.confirmado{background:#123c32;color:#6ee7b7}.descartado{background:#481f2a;color:#fda4af}.card-body{padding:1.1rem;display:grid;gap:.9rem;flex:1}.card-heading,.footer{display:flex;justify-content:space-between;gap:.6rem;align-items:center}.max{background:#443b1b;color:#fde68a;border-radius:999px;padding:.3rem .6rem;font-size:.75rem}.schedule{font-size:.85rem;margin:0}.description{color:var(--muted);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.5}.footer{border-top:1px solid var(--panel-border);padding-top:.8rem;font-size:.8rem;color:var(--primary)}.empty-state{padding:2rem;border:1px dashed var(--panel-border);border-radius:16px;text-align:center;color:var(--muted)}
  `],
})
export class EventosListComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly route = inject(ActivatedRoute);
  today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  selectedDate = this.route.snapshot.queryParamMap.get('fecha') ?? this.today;
  eventos: Evento[] = [];
  loading = true;
  error = '';
  get filteredEvents(): Evento[] { return this.eventos.filter(evento => !this.selectedDate || evento.fecha_evento === this.selectedDate); }
  changeDay(delta: number): void {
    const date = new Date(`${this.selectedDate || this.today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + delta);
    this.selectedDate = date.toISOString().slice(0, 10);
  }
  eventTime(evento: Evento, hora?: string | null): string { return mexicoTime(hora ? `${evento.fecha_evento}T${hora}` : null); }
  ngOnInit(): void {
    this.loading = true; this.error = '';
    this.eventService.getEventos().subscribe({
      next: data => { this.eventos = data ?? []; this.loading = false; },
      error: () => { this.loading = false; this.error = 'No se pudieron cargar los eventos.'; },
    });
  }
}
