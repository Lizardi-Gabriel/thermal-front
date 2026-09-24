import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { Imagen } from '@app/core/models/evento.model';
import { environment } from '@environments/environment';

export function imageUrl(path: string): string {
  return /^https?:\/\//i.test(path) ? path : `${environment.apiUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export function mexicoTime(value?: string | null): string {
  if (!value) return '--:--';
  const date = new Date(/[zZ]$|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? '--:--' : date.toLocaleTimeString('es-MX', {
    timeZone: 'America/Mexico_City', hour12: false,
  });
}

@Component({
  selector: 'app-detection-image', standalone: true, imports: [CommonModule],
  template: `
    <p *ngIf="loading" role="status">Cargando imagen…</p>
    <p *ngIf="failed" role="alert">No se pudo cargar la imagen. <button type="button" (click)="render()">Reintentar</button></p>
    <canvas #canvas [hidden]="loading || failed" role="img" [attr.aria-label]="'Imagen ' + imagen.imagen_id + ', ' + (imagen.detecciones?.length ?? 0) + ' detecciones'"></canvas>
  `,
  styles: [`:host { display: block; min-width: 0; max-width: 100%; text-align: center; } canvas { display: block; max-width: 100%; max-height: 65vh; width: auto; height: auto; margin: auto; } canvas[hidden] { display: none; }`],
})
export class DetectionImageComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) imagen!: Imagen;
  @Input() showDetections = true;
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  loading = true;
  failed = false;
  private request = 0;

  ngOnChanges(): void { this.render(); }
  ngOnDestroy(): void { this.request++; }

  render(): void {
    const request = ++this.request;
    this.loading = true;
    this.failed = false;
    const img = new Image();
    img.onload = () => {
      if (request !== this.request) return;
      const canvas = this.canvas.nativeElement;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { this.loading = false; this.failed = true; return; }
      ctx.drawImage(img, 0, 0);
      if (this.showDetections) {
        ctx.strokeStyle = '#01ff01';
        ctx.lineWidth = Math.max(2, img.naturalWidth / 400);
        for (const det of this.imagen.detecciones ?? []) {
          if (![det.x1, det.x2, det.y1, det.y2].every(Number.isFinite)) continue;
          const x = Math.max(0, det.x1), y = Math.max(0, det.y1);
          const w = Math.min(canvas.width, det.x2) - x, h = Math.min(canvas.height, det.y2) - y;
          if (w > 0 && h > 0) ctx.strokeRect(x, y, w, h);
        }
      }
      this.loading = false;
    };
    img.onerror = () => { if (request === this.request) { this.loading = false; this.failed = true; } };
    img.src = imageUrl(this.imagen.ruta_imagen);
  }
}
