import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventService } from '@app/core/services/event.service';
import { Evento } from '@app/core/models/evento.model';
import { DetectionImageComponent, mexicoTime } from '../components/detection-image.component';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-eventos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DetectionImageComponent],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Eventos</p>
          <h1>Listado de eventos</h1>
        </div>
      </header>

      <p *ngIf="loading" role="status">Cargando eventos…</p>
      <p *ngIf="error" role="alert">{{ error }} <button (click)="ngOnInit()">Reintentar</button></p>
      <div class="grid" *ngIf="eventos.length; else emptyTpl">
        <article class="card" *ngFor="let evento of eventos">
          <a *ngIf="evento.imagen_preview as preview" [routerLink]="['/eventos', evento.evento_id]" [attr.aria-label]="'Ver imágenes del evento ' + evento.evento_id">
            <app-detection-image [imagen]="preview" />
          </a>
          <p *ngIf="!evento.imagen_preview">Sin imagen de vista previa</p>
          <strong>Evento #{{ evento.evento_id }}</strong>

          <div class="card-head">
            <span class="badge" [ngClass]="evento.estatus">{{ evento.estatus }}</span>
            <span class="date">{{ evento.fecha_evento }}</span>
          </div>

          <h3>{{ evento.descripcion || 'Evento sin descripción' }}</h3>
          <p><strong>Usuario:</strong> {{ evento.usuario?.nombre_usuario || 'Sin usuario' }}</p>
          <p><strong>Imágenes:</strong> {{ evento.total_imagenes ?? evento.imagenes?.length ?? 0 }}</p>
          <p><strong>Máximo de fumadores detectados:</strong> {{ evento.max_detecciones ?? 0 }}</p>
          <p><strong>Detecciones acumuladas:</strong> {{ evento.total_detecciones ?? evento.max_detecciones ?? 0 }}</p>
          <p><strong>Horario:</strong> {{ eventTime(evento, evento.hora_inicio) }} - {{ eventTime(evento, evento.hora_fin) }} (CDMX)</p>

          <div class="actions">
            <a [routerLink]="['/eventos', evento.evento_id]">Ver detalle</a>
          </div>
        </article>
      </div>
    </section>

    <ng-template #emptyTpl>
      <div class="empty-state" *ngIf="!loading && !error">No hay eventos disponibles.</div>
    </ng-template>
  `,
  styles: [
    `
      .page-shell {
        display: grid;
        gap: 1.5rem;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .eyebrow {
        color: #93c5fd;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin: 0;
      }

      h1 {
        margin: 0.4rem 0 0;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1rem;
      }

      .card {
        background: #121d31;
        border: 1px solid #24314a;
        border-radius: 16px;
        padding: 1.25rem;
        display: grid;
        gap: 0.8rem;
      }

      .preview-image {
        width: 100%;
        height: 180px;
        object-fit: cover;
        border-radius: 12px;
        border: 1px solid #24314a;
        background: #0d172b;
      }

      .card-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .badge {
        display: inline-flex;
        padding: 0.35rem 0.7rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: capitalize;
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

      .date {
        color: #9aa9c2;
        font-size: 0.85rem;
      }

      .actions {
        margin-top: 0.5rem;
      }

      a {
        display: inline-block;
        color: #dbeafe;
        text-decoration: none;
        background: rgba(59, 130, 246, 0.14);
        padding: 0.7rem 0.9rem;
        border-radius: 10px;
      }

      .empty-state {
        background: #121d31;
        border: 1px dashed #24314a;
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
      }
    `,
  ],
})
export class EventosListComponent implements OnInit {
  private readonly eventService = inject(EventService);
  eventos: Evento[] = [];
  loading = true;
  error = '';

  eventTime(evento: Evento, hora?: string | null): string {
    return mexicoTime(hora ? `${evento.fecha_evento}T${hora}` : null);
  }

  getImageUrl(path?: string | null): string | null {
      if (!path) return null;

      if (/^https?:\/\//i.test(path)) {
          return path;
      }

      return `${environment.apiUrl}${path.startsWith('/') ? path : '/' + path}`;
  }

  ngOnInit(): void {
    this.loading = true;
    this.error = '';
    this.eventService.getEventos().subscribe({
      next: (data) => {
        this.loading = false;
        this.eventos = (data ?? []).map((evento) => ({
          ...evento,
          usuario: evento.usuario ?? null,
          imagenes:
            evento.imagenes?.length
              ? evento.imagenes
              : evento.imagen_preview
                ? [
                    {
                      imagen_id: evento.imagen_preview.imagen_id,
                      evento_id: evento.evento_id,
                      ruta_imagen:
                        this.getImageUrl(evento.imagen_preview.ruta_imagen) ??
                        evento.imagen_preview.ruta_imagen,
                      hora_subida: evento.imagen_preview.hora_subida,
                      detecciones: evento.imagen_preview.detecciones ?? [],
                    },
                  ]
                : [],
        }));
      },
      error: () => { this.loading = false; this.error = 'No se pudieron cargar los eventos.'; },
    });
  }
}
