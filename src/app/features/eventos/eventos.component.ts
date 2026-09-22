import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Evento } from '@app/core/models/evento.model';
import { ApiService } from '@app/core/services/api.service';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <h1>Eventos</h1>
      <div class="event-list">
        <article class="event-card" *ngFor="let evento of eventos">
          <h3>{{ evento.descripcion || 'Evento sin descripción' }}</h3>
          <p><strong>Fecha:</strong> {{ evento.fecha_evento }}</p>
          <p><strong>Estatus:</strong> {{ evento.estatus }}</p>
          <p><strong>Imágenes:</strong> {{ evento.imagenes?.length ?? 0 }}</p>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell { padding: 2rem; }
      .event-list { display: grid; gap: 1rem; }
      .event-card { background: white; border-radius: 12px; padding: 1.25rem; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); }
    `,
  ],
})
export class EventosComponent implements OnInit {
  private readonly api = inject(ApiService);
  eventos: Evento[] = [];

  ngOnInit(): void {
    this.api.get<Evento[]>('/eventosfront/optimizado').subscribe({
      next: (data) => (this.eventos = data),
      error: (err) => console.error(err),
    });
  }
}
