import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ApiService } from '@app/core/services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <h1>Reportes</h1>
      <button (click)="downloadPdf()">Generar PDF</button>
    </section>
  `,
  styles: [
    `
      .page-shell { padding: 2rem; }
      button { border: none; border-radius: 10px; background: #0f172a; color: white; padding: 0.9rem 1rem; font-weight: 700; cursor: pointer; }
    `,
  ],
})
export class ReportsComponent {
  private readonly api = inject(ApiService);

  downloadPdf(): void {
    window.open(`${this.api['baseUrl'] || 'http://localhost:8000'}/admin/reportes/generar-pdf`, '_blank');
  }
}
