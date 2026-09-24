import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Evento } from '@app/core/models/evento.model';

@Component({
  selector: 'app-air-summary', standalone: true, imports: [CommonModule],
  template: `<div class="metrics"><div *ngFor="let metric of metrics"><span>{{ metric.label }}</span><strong>{{ metric.value == null ? '—' : (metric.value | number:'1.1-2') }}</strong><small>{{ metric.value == null ? 'Sin datos' : 'µg/m³' }}</small></div></div>`,
  styles: [`:host{display:block;min-width:0}.metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem}.metrics>div{background:#0d172b;border:1px solid var(--panel-border);border-radius:12px;padding:.85rem;display:grid;gap:.4rem}span,small{color:var(--muted);font-size:.75rem}strong{color:var(--text);font-size:1.2rem;font-variant-numeric:tabular-nums}@media(max-width:380px){.metrics{gap:.3rem}.metrics>div{padding:.5rem}strong{font-size:1rem}}`],
})
export class AirSummaryComponent {
  @Input({ required: true }) evento!: Evento;
  get metrics() {
    return [
      { label: 'PM10', value: this.evento.promedio_pm10 },
      { label: 'PM1.0', value: this.evento.promedio_pm1p0 },
      { label: 'PM2.5', value: this.evento.promedio_pm2p5 },
    ];
  }
}
