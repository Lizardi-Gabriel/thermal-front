import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { Imagen } from '@app/core/models/evento.model';
import { DetectionImageComponent, imageUrl, mexicoTime } from './detection-image.component';

@Component({
  selector: 'app-event-carousel', standalone: true, imports: [CommonModule, DetectionImageComponent],
  template: `
    <section aria-label="Imágenes del evento" (keydown)="onKey($event)">
      <ng-container *ngIf="current as img; else empty">
        <div class="toolbar">
          <h3>Imágenes del evento</h3>
          <label><input type="checkbox" [checked]="showDetections" (change)="showDetections = !showDetections"> Mostrar detecciones</label>
          <button type="button" (click)="viewer.showModal()">Ampliar imagen</button>
        </div>
        <app-detection-image [imagen]="img" [showDetections]="showDetections" />
        <ng-container *ngTemplateOutlet="controls" />
        <div class="thumbnails" aria-label="Seleccionar imagen">
          <button type="button" *ngFor="let item of images; let i = index" [attr.aria-label]="'Ver imagen ' + (i + 1)" [attr.aria-pressed]="index === i" (click)="index = i">
            <img [src]="url(item.ruta_imagen)" alt="" loading="lazy">{{ i + 1 }}
          </button>
        </div>
        <p>Imagen #{{ img.imagen_id }} · {{ time(img.hora_subida) }} (Ciudad de México) · {{ img.detecciones?.length ?? 0 }} detecciones</p>
        <ul *ngIf="img.detecciones?.length; else noDetections">
          <li *ngFor="let det of img.detecciones; let i = index">Detección {{ i + 1 }} · Confianza: {{ det.confianza | percent:'1.0-1' }}</li>
        </ul>
        <ng-template #noDetections><p>Sin detecciones en esta imagen.</p></ng-template>
        <dialog #viewer (click)="closeOnBackdrop($event)" aria-label="Imagen ampliada">
          <button type="button" autofocus (click)="viewer.close()">Cerrar ✕</button>
          <app-detection-image *ngIf="viewer.open" [imagen]="img" [showDetections]="showDetections" />
          <ng-container *ngTemplateOutlet="controls" />
        </dialog>
      </ng-container>
      <ng-template #controls>
        <div class="controls">
          <button type="button" [disabled]="index === 0" (click)="move(-1)" aria-label="Imagen anterior">← Anterior</button>
          <span aria-live="polite">Imagen {{ index + 1 }} de {{ images.length }}</span>
          <button type="button" [disabled]="index === images.length - 1" (click)="move(1)" aria-label="Imagen siguiente">Siguiente →</button>
        </div>
      </ng-template>
      <ng-template #empty><p>Este evento no tiene imágenes.</p></ng-template>
    </section>
  `,
  styles: [`
    :host { display:block; min-width:0; max-width:100%; }
    section { min-width:0; }
    .toolbar, .controls { display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin:1rem 0; }
    button { background:#1d4ed8; color:white; border:2px solid transparent; border-radius:8px; padding:.6rem; cursor:pointer; }
    button:disabled { opacity:.4; cursor:default; } button:focus-visible { outline:2px solid #93c5fd; outline-offset:3px; }
    .thumbnails { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(80px, 100%), 1fr)); gap:.5rem; padding:.5rem; }
    .thumbnails button { min-width:0; background:#0d172b; } .thumbnails img { width:100%; height:50px; object-fit:contain; display:block; }
    [aria-pressed=true] { border-color:#60a5fa; }
    dialog { background:#121d31; color:#e5edf8; border:1px solid #24314a; border-radius:16px; width:min(1100px, 90vw); max-height:90vh; overflow:auto; }
    dialog::backdrop { background:rgba(0,0,0,.9); }
  `],
})
export class EventCarouselComponent implements OnChanges {
  @Input() images: Imagen[] = [];
  @ViewChild('viewer') viewer?: ElementRef<HTMLDialogElement>;
  index = 0;
  showDetections = true;
  url = imageUrl;
  time = mexicoTime;
  get current(): Imagen | undefined { return this.images[this.index]; }
  ngOnChanges(): void { this.index = 0; }
  move(delta: number): void { this.index = Math.max(0, Math.min(this.images.length - 1, this.index + delta)); }
  onKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); this.move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }
  closeOnBackdrop(event: MouseEvent): void {
    const dialog = this.viewer?.nativeElement;
    if (dialog && event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }
  }
}
