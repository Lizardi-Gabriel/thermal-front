import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { EstadisticasEventos } from '@app/core/models/report.model';
import { ApiService } from '@app/core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <header class="topbar">
        <h1>Dashboard</h1>
      </header>

      <div class="stats-grid" *ngIf="stats as s">
        <div class="card">
          <span>Total eventos</span>
          <strong>{{ s.total_eventos }}</strong>
        </div>
        <div class="card">
          <span>Pendientes</span>
          <strong>{{ s.eventos_pendientes }}</strong>
        </div>
        <div class="card">
          <span>Confirmados</span>
          <strong>{{ s.eventos_confirmados }}</strong>
        </div>
        <div class="card">
          <span>Detecciones</span>
          <strong>{{ s.total_detecciones }}</strong>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell {
        padding: 2rem;
        min-height: 100vh;
        background: var(--bg);
        color: var(--text);
      }

      .topbar {
        margin-bottom: 1.5rem;
      }

      .topbar h1 {
        margin: 0;
        font-size: clamp(2rem, 3vw, 2.5rem);
        font-weight: 700;
        color: var(--text);
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
      }

      .card {
        background: linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-elevated) 100%);
        border: 1px solid var(--panel-border);
        border-radius: 18px;
        padding: 1.25rem;
        box-shadow: 0 12px 28px var(--shadow);
        display: grid;
        gap: 0.7rem;
        min-height: 130px;
      }

      .card span {
        color: var(--muted);
        font-size: 0.9rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .card strong {
        font-size: clamp(1.8rem, 3vw, 2.3rem);
        font-weight: 700;
        color: var(--text);
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  stats!: EstadisticasEventos;

  ngOnInit(): void {
    this.api.get<EstadisticasEventos>('/eventosfront/estadisticas').subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (error) => console.error(error),
    });
  }
}
