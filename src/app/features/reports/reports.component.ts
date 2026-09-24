import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ReportService } from '@app/core/services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Reportes</p>
          <h1>Generación de reportes</h1>
        </div>
      </header>

      <div class="date-filters">
        <label for="report-start">Desde
          <input id="report-start" type="date" [(ngModel)]="fechaInicio" [max]="fechaFin || ''" [disabled]="loading" (ngModelChange)="lastMessage = ''">
        </label>
        <label for="report-end">Hasta
          <input id="report-end" type="date" [(ngModel)]="fechaFin" [min]="fechaInicio || ''" [disabled]="loading" (ngModelChange)="lastMessage = ''">
        </label>
        <button type="button" class="secondary" [disabled]="loading" (click)="clearDates()">Limpiar fechas</button>
      </div>
      <p class="period" aria-live="polite">{{ periodLabel }} Las fechas indicadas se incluyen en el reporte.</p>
      <p *ngIf="invalidRange" role="alert">La fecha final no puede ser anterior a la inicial.</p>

      <div class="actions">
        <button type="button" [disabled]="loading || invalidRange" (click)="downloadPdf()">Generar PDF</button>
        <button type="button" class="secondary" [disabled]="loading || invalidRange" (click)="openPdf()">Abrir PDF</button>
      </div>

      <div class="hint" role="status" aria-live="polite" *ngIf="lastMessage">{{ lastMessage }}</div>
    </section>
  `,
  styles: [
    `
      .page-shell {
        display: grid;
        gap: 1.5rem;
        padding: 0.5rem 0;
      }

      .eyebrow {
        margin: 0;
        color: #93c5fd;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0.4rem 0 0;
      }

      .date-filters { display: flex; flex-wrap: wrap; align-items: end; gap: 1rem; }
      .date-filters label { display: grid; gap: .5rem; flex: 1 1 180px; min-width: 0; }
      .date-filters input { width: 100%; min-width: 0; padding: .8rem; border: 1px solid #24314a; border-radius: 10px; background: #111b2d; color: #e5edf8; font: inherit; }
      .period { margin: 0; color: #a7b4c8; }

      .actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      button {
        border: none;
        border-radius: 10px;
        background: linear-gradient(135deg, #60a5fa, #3b82f6);
        color: white;
        padding: 0.9rem 1.1rem;
        font-weight: 700;
        cursor: pointer;
      }

      button:disabled { opacity: .6; cursor: not-allowed; }

      .secondary {
        background: #111b2d;
        border: 1px solid #24314a;
      }

      .hint {
        background: rgba(59, 130, 246, 0.08);
        border: 1px solid rgba(96, 165, 250, 0.2);
        border-radius: 10px;
        padding: 0.9rem 1rem;
        color: #dfeafc;
      }
    `,
  ],
})
export class ReportsComponent {
  private readonly reportService = inject(ReportService);
  lastMessage = '';
  loading = false;
  fechaInicio = '';
  fechaFin = '';

  get invalidRange(): boolean { return !!this.fechaInicio && !!this.fechaFin && this.fechaInicio > this.fechaFin; }
  get periodLabel(): string {
    const format = (date: string) => date.split('-').reverse().join('/');
    if (this.fechaInicio && this.fechaFin) return `Periodo: del ${format(this.fechaInicio)} al ${format(this.fechaFin)}.`;
    if (this.fechaInicio) return `Periodo: desde el ${format(this.fechaInicio)} en adelante.`;
    if (this.fechaFin) return `Periodo: hasta el ${format(this.fechaFin)}.`;
    return 'Sin fechas seleccionadas: se incluirá todo el historial.';
  }
  clearDates(): void { this.fechaInicio = ''; this.fechaFin = ''; this.lastMessage = ''; }


  downloadPdf(): void { this.generate(false); }
  openPdf(): void { this.generate(true); }

  private generate(open: boolean): void {
    if (this.loading || this.invalidRange) return;
    // Open during the click so Safari preserves the user gesture.
    const tab = open ? window.open('about:blank', '_blank') : null;
    if (open && !tab) {
      this.lastMessage = 'El navegador bloqueó la pestaña. Permite ventanas emergentes o usa Generar PDF para descargarlo.';
      return;
    }
    if (tab) {
      tab.opener = null;
      tab.document.title = 'Generando reporte…';
      tab.document.body.textContent = 'Generando reporte PDF…';
    }
    this.loading = true;
    this.lastMessage = 'Generando reporte PDF…';
    this.reportService.getReportPdf({ fecha_inicio: this.fechaInicio, fecha_fin: this.fechaFin }).subscribe({
      next: (blob) => {
        this.loading = false;
        if (tab && !tab.closed) {
          this.reportService.openPdfInNewTab(blob, tab);
          this.lastMessage = 'PDF abierto en una nueva pestaña.';
        } else {
          this.reportService.downloadPdf(blob, 'reporte-eventos.pdf');
          this.lastMessage = 'Descarga del PDF iniciada.';
        }
      },
      error: async (error: HttpErrorResponse) => {
        tab?.close();
        this.lastMessage = await this.reportService.getErrorMessage(error);
        this.loading = false;
      },
    });
  }
}
