import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '@app/core/services/event.service';
import { Evento } from '@app/core/models/evento.model';
import { EventCarouselComponent } from '../components/event-carousel.component';
import { mexicoTime } from '../components/detection-image.component';

@Component({
  selector: 'app-evento-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, EventCarouselComponent],
  template: `
    <section class="page-shell" *ngIf="evento; else loadingTpl">
      <div class="header-row">
        <div>
          <a routerLink="/eventos" class="back-link">← Volver</a>
          <h1>Evento #{{ evento.evento_id }}</h1>
        </div>
        <span class="badge" [ngClass]="evento.estatus">{{ evento.estatus }}</span>
      </div>

      <div class="meta-grid">
        <div class="card">
          <h3>Información</h3>
          <p><strong>Fecha:</strong> {{ evento.fecha_evento }}</p>
          <p><strong>Usuario:</strong> {{ evento.usuario?.nombre_usuario ?? 'Sin asignar' }}</p>
          <p><strong>Descripción:</strong> {{ evento.descripcion || 'Sin descripción' }}</p>
        </div>
        <div class="card">
          <h3>Resumen del evento</h3>
          <p><strong>Imágenes:</strong> {{ evento.total_imagenes ?? evento.imagenes?.length ?? 0 }}</p>
          <p><strong>Máximo de fumadores detectados:</strong> {{ maxDetections }}</p>
          <p><strong>Detecciones acumuladas:</strong> {{ totalDetections }}</p>
          <p><strong>Inicio:</strong> {{ time(evento.imagenes?.[0]?.hora_subida) }}</p>
          <p><strong>Fin:</strong> {{ time(evento.imagenes?.[lastImageIndex]?.hora_subida) }}</p>
          <small>Horarios de Ciudad de México. Las detecciones acumuladas pueden incluir la misma persona en varias fotos.</small>
          <h3>Acciones</h3>
          <p *ngIf="statusError" role="alert">{{ statusError }}</p>
          <div class="actions">
            <button [disabled]="saving" (click)="setStatus('pendiente')">Pendiente</button>
            <button [disabled]="saving" (click)="setStatus('confirmado')">Confirmado</button>
            <button [disabled]="saving" (click)="setStatus('descartado')">Descartado</button>
          </div>
        </div>
      </div>

      <div class="card">
        <app-event-carousel [images]="evento.imagenes ?? []" />
      </div>

      <div class="card" *ngIf="evento.registros_calidad_aire?.length">
        <h3>Calidad del aire</h3>
        <div class="table-wrap">
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
    </section>

    <ng-template #loadingTpl>
      <section class="page-shell">
        <a routerLink="/eventos" class="back-link">← Volver</a>
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

      .images-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      img {
        width: 100%;
        border-radius: 12px;
        border: 1px solid #24314a;
        object-fit: cover;
      }

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
    const usuarioId = Number(localStorage.getItem('current_user') ? JSON.parse(localStorage.getItem('current_user') ?? '{}')?.usuario_id : 0);

    this.saving = true;
    this.statusError = '';
    this.eventService.updateEventoStatus(this.evento.evento_id, status, usuarioId, this.evento.descripcion ?? '').subscribe({
      next: () => {
        this.saving = false;
        if (this.evento) {
          this.evento.estatus = status;
        }
      },
      error: () => { this.saving = false; this.statusError = 'No se pudo actualizar el estado.'; },
    });
  }

}
