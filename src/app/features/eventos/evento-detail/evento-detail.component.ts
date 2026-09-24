import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '@app/core/services/event.service';
import { Evento } from '@app/core/models/evento.model';
import { EventCarouselComponent } from '../components/event-carousel.component';
import { AirSummaryComponent } from '../components/air-summary.component';
import { mexicoTime } from '../components/detection-image.component';

@Component({
  selector: 'app-evento-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, EventCarouselComponent, AirSummaryComponent],
  template: `
    <section class="page-shell" *ngIf="evento; else loadingTpl">
      <div class="header-row">
        <div>
          <a routerLink="/eventos" [queryParams]="{ fecha: returnDate }" class="back-link">← Volver</a>
          <h1>Evento #{{ evento.evento_id }}</h1>
        </div>
        <span class="badge" [ngClass]="evento.estatus">{{ evento.estatus }}</span>
      </div>

      <div class="card summary">
        <p><strong>Fecha:</strong> {{ evento.fecha_evento | date:'dd/MM/yyyy' }}</p>
        <p><strong>Horario:</strong> {{ time(evento.imagenes?.[0]?.hora_subida) }} — {{ time(evento.imagenes?.[lastImageIndex]?.hora_subida) }} <small>Ciudad de México</small></p>
        <div class="counts">
          <div><strong>{{ totalDetections }}</strong><span>Detecciones acumuladas</span></div>
          <div><strong>{{ maxDetections }}</strong><span>Máximo por imagen</span></div>
          <div><strong>{{ evento.total_imagenes ?? evento.imagenes?.length ?? 0 }}</strong><span>Imágenes</span></div>
        </div>
        <p *ngIf="evento.estatus !== 'pendiente'"><strong>Gestionado por:</strong> {{ evento.usuario?.nombre_usuario || 'Sin información de usuario' }}</p>
        <p *ngIf="evento.estatus === 'pendiente'" class="muted">Pendiente de revisión. Revisa las imágenes antes de confirmar o descartar el evento.</p>
      </div>
      <p class="feedback" *ngIf="statusMessage" role="status">{{ statusMessage }}</p>

      <div class="card">
        <app-event-carousel [images]="evento.imagenes ?? []" />
      </div>

      <div class="card"><h3>Descripción</h3><p class="description">{{ evento.descripcion || 'Sin descripción disponible.' }}</p></div>
      <div class="card">
        <h3>Calidad del aire</h3>
        <p class="muted">Promedios del evento</p>
        <app-air-summary [evento]="evento" />
        <h4>Mediciones detalladas</h4>
        <p *ngIf="!evento.registros_calidad_aire?.length" class="muted">No hay mediciones disponibles para este evento.</p>
        <div class="table-wrap" *ngIf="evento.registros_calidad_aire?.length">
          <table>
            <thead>
              <tr>
                <th>Hora (CDMX)</th><th>Tipo</th><th>Descripción</th>
                <th>Temp</th>
                <th>Humedad</th>
                <th>PM2.5</th>
                <th>PM10</th>
                <th>PM1.0</th>
                <th>AQI</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of evento.registros_calidad_aire">
                <td>{{ time(item.hora_medicion) }}</td><td>{{ item.tipo }}</td><td>{{ item.descrip }}</td>
                <td>{{ item.temp }}</td>
                <td>{{ item.humedad }}</td>
                <td>{{ item.pm2p5 }}</td>
                <td>{{ item.pm10 }}</td>
                <td>{{ item.pm1p0 }}</td>
                <td>{{ item.aqi }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="review-panel card" *ngIf="evento.estatus === 'pendiente'">
        <div><h3>Revisar evento</h3><p class="muted">Confirma si las imágenes corresponden a un evento de consumo de tabaco.</p></div>
        <div class="actions">
          <button class="discard" [disabled]="saving" (click)="setStatus('descartado')">Descartar evento</button>
          <button class="confirm" [disabled]="saving" (click)="setStatus('confirmado')">Confirmar evento</button>
        </div>
        <p *ngIf="saving" role="status">Guardando revisión…</p>
        <p *ngIf="statusError" role="alert">{{ statusError }}</p>
      </div>
    </section>

    <ng-template #loadingTpl>
      <section class="page-shell">
        <a routerLink="/eventos" [queryParams]="{ fecha: returnDate }" class="back-link">← Volver</a>
        <p role="status">{{ loadError || 'Cargando detalle del evento...' }}</p>
        <button *ngIf="loadError" (click)="ngOnInit()">Reintentar</button>
      </section>
    </ng-template>
  `,
  styles: [
    `
      :host { display: block; min-width: 0; }

      .page-shell {
        min-width: 0;
        grid-template-columns: minmax(0, 1fr);
        display: grid;
        gap: 1.5rem;
        padding: 1.5rem 0;
      }

      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      h1 {
        margin: 0.35rem 0 0;
      }

      .back-link {
        color: #93c5fd;
        text-decoration: none;
      }

      .badge {
        padding: 0.45rem 0.8rem;
        border-radius: 999px;
        text-transform: capitalize;
        font-weight: 700;
      }

      .badge.pendiente {
        background: rgba(250, 204, 21, 0.12);
        color: #facc15;
      }

      .badge.confirmado {
        background: rgba(34, 197, 94, 0.12);
        color: #4ade80;
      }

      .badge.descartado {
        background: rgba(248, 113, 113, 0.12);
        color: #f87171;
      }

      .meta-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
        gap: 1rem;
      }

      .card {
        min-width: 0;
        overflow-wrap: anywhere;
        background: #121d31;
        border: 1px solid #24314a;
        border-radius: 16px;
        padding: 1.25rem;
      }

      .actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      button {
        border: none;
        border-radius: 10px;
        background: #1d4ed8;
        color: white;
        padding: 0.7rem 0.9rem;
        cursor: pointer;
      }

      h3 { margin-top: 0; }
      .page-shell { max-width: 1200px; margin: 0 auto; }
      .muted, small, .counts span { color: var(--muted); }
      .description { white-space: pre-line; line-height: 1.6; }
      .counts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .8rem; margin: 1.2rem 0; }
      .counts div { display: grid; gap: .5rem; padding: .8rem; background: #0d172b; border-radius: 12px; }
      .counts strong { color: var(--primary); font-size: 1.5rem; }
      .counts span { font-size: .8rem; }
      .confirm { background: #145044; color: #a7f3d0; }
      .discard { background: #572733; color: #fecdd3; }
      .actions button { flex: 1; padding: 1rem; font-weight: 700; }
      button:disabled { opacity: .6; cursor: wait; }
      button:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
      .feedback { padding: 1rem; border: 1px solid #276454; background: #123c32; color: #a7f3d0; border-radius: 12px; }
      @media(max-width: 480px) { .counts { grid-template-columns: 1fr; } .header-row { flex-wrap: wrap; } }

      .table-wrap { overflow-x: auto; }

      table {
        width: 100%;
        border-collapse: collapse;
        color: #e5edf8;
      }

      th, td {
        text-align: left;
        padding: 0.7rem;
        border-bottom: 1px solid rgba(148, 163, 184, 0.18);
      }
    `,
  ],
})
export class EventoDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);

  evento?: Evento;
  loadError = '';
  statusError = '';
  statusMessage = '';
  returnDate = this.route.snapshot.queryParamMap.get('fecha');
  saving = false;
  time = mexicoTime;
  get lastImageIndex(): number { return Math.max(0, (this.evento?.imagenes?.length ?? 0) - 1); }
  get maxDetections(): number { return this.evento?.max_detecciones ?? Math.max(0, ...(this.evento?.imagenes ?? []).map(img => img.detecciones?.length ?? 0)); }
  get totalDetections(): number { return this.evento?.total_detecciones ?? (this.evento?.imagenes ?? []).reduce((total, img) => total + (img.detecciones?.length ?? 0), 0); }

  ngOnInit(): void {
    this.loadError = '';
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.eventService.getEventoById(id).subscribe({
      next: (data) => {
        this.evento = { ...data, imagenes: [...(data.imagenes ?? [])].sort((a, b) => a.hora_subida.localeCompare(b.hora_subida)) };
      },
      error: () => { this.loadError = 'No se pudo cargar el evento.'; },
    });
  }

  setStatus(status: 'pendiente' | 'confirmado' | 'descartado'): void {
    if (!this.evento || this.saving) return;
    this.saving = true;
    this.statusError = '';
    this.eventService.updateEventoStatus(this.evento.evento_id, status).subscribe({
      next: (updated) => {
        this.saving = false;
        if (this.evento) {
          this.evento = { ...this.evento, estatus: updated.estatus, usuario: updated.usuario, usuario_id: updated.usuario_id };
          this.statusMessage = status === 'confirmado' ? 'Evento confirmado correctamente.' : 'Evento descartado correctamente.';
        }
      },
      error: () => { this.saving = false; this.statusError = 'No se pudo actualizar el estado.'; },
    });
  }

}
