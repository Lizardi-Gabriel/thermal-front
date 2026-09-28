import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, Input, OnChanges, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Imagen } from '@app/core/models/evento.model';
import { DetectionImageComponent, imageUrl, mexicoTime } from './detection-image.component';

@Component({
  selector: 'app-event-carousel', standalone: true, imports: [CommonModule, DetectionImageComponent],
  template: `
    <section class="event-viewer" aria-label="Imágenes del evento" tabindex="0" (keydown)="onKey($event)">
      <ng-container *ngIf="images.length; else empty">
        <div class="toolbar">
          <div>
            <h3>Imágenes del evento</h3>
            <p class="hint">Recorre la secuencia para revisar cómo cambió el evento.</p>
          </div>
          <div class="toolbar-actions">
            <label class="toggle"><input type="checkbox" [checked]="showDetections" (change)="showDetections = !showDetections"> Mostrar recuadros</label>
            <button type="button" class="secondary" (click)="openViewer()" [disabled]="!current">Ampliar</button>
          </div>
        </div>

        <ng-container *ngIf="current as img; else noFilteredImages">
          <div class="stage">
            <app-detection-image [imagen]="img" [showDetections]="showDetections" />
          </div>

          <div class="navigation">
            <button type="button" class="nav-button" [disabled]="index === 0" (click)="move(-1)" aria-label="Imagen anterior">← <span>Anterior</span></button>
            <div class="current-meta" aria-live="polite">
              <strong>{{ index + 1 }} de {{ visibleImages.length }}</strong>
              <span>{{ time(img.hora_subida) }} · Ciudad de México</span>
            </div>
            <button type="button" class="nav-button" [disabled]="index === visibleImages.length - 1" (click)="move(1)" aria-label="Imagen siguiente"><span>Siguiente</span> →</button>
          </div>

          <div class="timeline" aria-label="Línea de tiempo del evento">
            <div class="filmstrip" aria-label="Imágenes cercanas a la selección">
              <button #filmstripThumb type="button" class="thumb" *ngFor="let item of filmstripImages; trackBy: trackImage" [class.active]="item.index === index" [attr.aria-label]="'Ver imagen ' + (item.index + 1) + ' de ' + visibleImages.length" [attr.aria-pressed]="item.index === index" (click)="select(item.index)">
                <img [src]="url(item.image.ruta_imagen)" alt="" loading="lazy">
                <span>{{ item.index + 1 }}</span>
                <i *ngIf="item.image.detecciones?.length" [attr.aria-label]="(item.image.detecciones?.length ?? 0) + ' detecciones'">{{ item.image.detecciones?.length }}</i>
              </button>
            </div>

            <input class="scrubber" type="range" min="0" [max]="visibleImages.length - 1" step="1" [value]="index" (input)="selectRange($event)" [attr.aria-label]="'Imagen ' + (index + 1) + ' de ' + visibleImages.length">
            <div class="range-labels"><span>{{ time(visibleImages[0].hora_subida) }}</span><span>{{ time(visibleImages[visibleImages.length - 1].hora_subida) }}</span></div>

            <div class="timeline-actions">
              <button type="button" class="secondary" (click)="togglePlayback()" [attr.aria-pressed]="playing">{{ playing ? '❚❚ Pausar' : '▶ Reproducir' }}</button>
              <label class="toggle"><input type="checkbox" [checked]="onlyDetections" (change)="toggleDetectionFilter()"> Solo con detecciones <span class="count">{{ detectedCount }}</span></label>
              <button type="button" class="secondary" (click)="showGallery = !showGallery" [attr.aria-expanded]="showGallery">{{ showGallery ? 'Ocultar galería' : 'Ver las ' + visibleImages.length + ' imágenes' }}</button>
            </div>
          </div>

          <div class="details">
            <p><strong>Imagen #{{ img.imagen_id }}</strong> · {{ img.detecciones?.length ?? 0 }} {{ (img.detecciones?.length ?? 0) === 1 ? 'detección' : 'detecciones' }}</p>
            <ul *ngIf="img.detecciones?.length">
              <li *ngFor="let det of img.detecciones; let i = index">Detección {{ i + 1 }} · Confianza: {{ det.confianza | percent:'1.0-1' }}</li>
            </ul>
          </div>

          <div class="gallery" *ngIf="showGallery" aria-label="Todas las imágenes">
            <button type="button" class="gallery-item" *ngFor="let item of visibleImages; let i = index; trackBy: trackImage" [class.active]="index === i" [attr.aria-label]="'Ver imagen ' + (i + 1)" [attr.aria-pressed]="index === i" (click)="select(i)">
              <img [src]="url(item.ruta_imagen)" alt="" loading="lazy"><span>{{ i + 1 }}</span>
            </button>
          </div>

          <dialog #viewerDialog (click)="closeOnBackdrop($event)" aria-label="Imagen ampliada">
            <div class="dialog-toolbar"><span>Imagen {{ index + 1 }} de {{ visibleImages.length }}</span><button type="button" autofocus (click)="viewerDialog.close()">Cerrar ✕</button></div>
            <app-detection-image *ngIf="viewerDialog.open" [imagen]="img" [showDetections]="showDetections" />
            <div class="navigation dialog-navigation">
              <button type="button" [disabled]="index === 0" (click)="move(-1)">← Anterior</button>
              <span>{{ time(img.hora_subida) }}</span>
              <button type="button" [disabled]="index === visibleImages.length - 1" (click)="move(1)">Siguiente →</button>
            </div>
          </dialog>
        </ng-container>

        <ng-template #noFilteredImages>
          <div class="empty-filter">
            <p>No hay imágenes con detecciones en este evento.</p>
            <button type="button" (click)="toggleDetectionFilter()">Mostrar todas las imágenes</button>
          </div>
        </ng-template>
      </ng-container>
      <ng-template #empty><p>Este evento no tiene imágenes.</p></ng-template>
    </section>
  `,
  styles: [`
    :host { display:block; min-width:0; max-width:100%; }
    .event-viewer { min-width:0; outline:none; }
    .event-viewer:focus-visible { outline:2px solid #60a5fa; outline-offset:6px; border-radius:10px; }
    .toolbar, .toolbar-actions, .navigation, .timeline-actions, .dialog-toolbar { display:flex; align-items:center; gap:.75rem; }
    .toolbar { justify-content:space-between; flex-wrap:wrap; margin-bottom:1rem; }
    h3 { margin:0 0 .25rem; }
    .hint { color:var(--muted); margin:0; font-size:.9rem; }
    .toolbar-actions, .timeline-actions { flex-wrap:wrap; }
    .toggle { display:flex; align-items:center; gap:.5rem; color:#cbd5e1; cursor:pointer; }
    .toggle input { accent-color:#3b82f6; width:1rem; height:1rem; }
    button { background:#2563eb; color:white; border:1px solid transparent; border-radius:10px; padding:.65rem .85rem; cursor:pointer; font-weight:650; }
    button.secondary { background:#18253a; border-color:#334155; color:#dbeafe; }
    button:disabled { opacity:.4; cursor:default; }
    button:focus-visible, input:focus-visible { outline:2px solid #93c5fd; outline-offset:3px; }
    .stage { display:flex; align-items:center; justify-content:center; min-height:240px; max-height:56vh; overflow:hidden; padding:.5rem; background:#09111f; border:1px solid #22304a; border-radius:14px; }
    .stage app-detection-image { --detection-height:min(54vh, 620px); --detection-width:100%; width:100%; }
    .navigation { justify-content:space-between; margin:1rem 0; }
    .nav-button { min-width:112px; }
    .current-meta { display:grid; text-align:center; gap:.2rem; }
    .current-meta span, .range-labels, .details { color:var(--muted); font-size:.86rem; }
    .timeline { padding:1rem; background:#0d172b; border:1px solid #22304a; border-radius:14px; }
    .filmstrip { display:flex; gap:.5rem; overflow-x:auto; padding:.2rem; scroll-snap-type:x proximity; scrollbar-width:thin; }
    .thumb, .gallery-item { position:relative; min-width:0; padding:.35rem; background:#111d31; color:#cbd5e1; border-color:transparent; }
    .thumb { flex:1 0 74px; scroll-snap-align:center; }
    .thumb img, .gallery-item img { display:block; width:100%; height:52px; object-fit:cover; border-radius:5px; }
    .thumb span, .gallery-item span { display:block; padding-top:.25rem; font-size:.75rem; }
    .thumb i { position:absolute; top:.15rem; right:.15rem; min-width:1.25rem; padding:.1rem .3rem; background:#16a34a; color:white; border-radius:999px; font-size:.68rem; font-style:normal; }
    .thumb.active, .gallery-item.active { border-color:#60a5fa; box-shadow:0 0 0 1px #60a5fa; background:#172744; }
    .scrubber { width:100%; margin:1rem 0 .15rem; accent-color:#3b82f6; cursor:pointer; }
    .range-labels { display:flex; justify-content:space-between; margin-bottom:1rem; }
    .timeline-actions { justify-content:center; }
    .count { display:inline-grid; place-items:center; min-width:1.5rem; height:1.5rem; padding:0 .35rem; background:#23324a; border-radius:999px; font-size:.75rem; }
    .details { margin-top:1rem; }
    .details p { margin:.5rem 0; }
    .details ul { margin:.5rem 0 0; padding-left:1.25rem; }
    .gallery { display:grid; grid-template-columns:repeat(auto-fill, minmax(74px, 1fr)); gap:.5rem; max-height:420px; overflow:auto; margin-top:1rem; padding:.75rem; border:1px solid #22304a; border-radius:12px; }
    .gallery-item img { height:48px; }
    .empty-filter { text-align:center; padding:2rem; background:#0d172b; border-radius:12px; }
    dialog { background:#121d31; color:#e5edf8; border:1px solid #334155; border-radius:16px; width:min(1100px, 92vw); max-height:92vh; overflow:auto; }
    dialog::backdrop { background:rgba(0,0,0,.9); }
    .dialog-toolbar { justify-content:space-between; margin-bottom:1rem; }
    .dialog-navigation { position:sticky; bottom:0; background:#121d31; padding:.75rem 0 0; }
    @media(max-width:600px) {
      .nav-button { min-width:auto; } .nav-button span { display:none; }
      .toolbar-actions, .timeline-actions { width:100%; } .timeline-actions > * { flex:1; justify-content:center; }
      .stage { min-height:180px; } .current-meta span { font-size:.75rem; }
    }
  `],
})
export class EventCarouselComponent implements OnChanges, OnDestroy, AfterViewChecked {
  @Input() images: Imagen[] = [];
  @ViewChild('viewerDialog') viewerDialog?: ElementRef<HTMLDialogElement>;
  @ViewChildren('filmstripThumb') filmstripThumbs?: QueryList<ElementRef<HTMLElement>>;
  index = 0;
  showDetections = true;
  onlyDetections = false;
  showGallery = false;
  playing = false;
  private playbackTimer?: ReturnType<typeof setInterval>;
  private centerSelectedThumb = true;
  url = imageUrl;
  time = mexicoTime;

  get visibleImages(): Imagen[] {
    return this.onlyDetections ? this.images.filter(image => (image.detecciones?.length ?? 0) > 0) : this.images;
  }
  get current(): Imagen | undefined { return this.visibleImages[this.index]; }
  get detectedCount(): number { return this.images.filter(image => (image.detecciones?.length ?? 0) > 0).length; }
  get filmstripImages(): Array<{ image: Imagen; index: number }> {
    const count = Math.min(11, this.visibleImages.length);
    const start = Math.max(0, Math.min(this.index - Math.floor(count / 2), this.visibleImages.length - count));
    return this.visibleImages.slice(start, start + count).map((image, offset) => ({ image, index: start + offset }));
  }

  ngOnChanges(): void { this.stopPlayback(); this.index = 0; this.onlyDetections = false; this.showGallery = false; this.centerSelectedThumb = true; }
  ngAfterViewChecked(): void {
    if (!this.centerSelectedThumb) return;
    const selected = this.filmstripImages.findIndex(item => item.index === this.index);
    this.filmstripThumbs?.get(selected)?.nativeElement.scrollIntoView({ block: 'nearest', inline: 'center' });
    this.centerSelectedThumb = false;
  }
  ngOnDestroy(): void { this.stopPlayback(); }
  move(delta: number): void { this.select(this.index + delta); }
  select(nextIndex: number): void {
    this.index = Math.max(0, Math.min(this.visibleImages.length - 1, nextIndex));
    this.centerSelectedThumb = true;
  }
  selectRange(event: Event): void { this.select(Number((event.target as HTMLInputElement).value)); }
  openViewer(): void { this.viewerDialog?.nativeElement.showModal(); }
  toggleDetectionFilter(): void {
    const currentId = this.current?.imagen_id;
    this.onlyDetections = !this.onlyDetections;
    const retainedIndex = this.visibleImages.findIndex(image => image.imagen_id === currentId);
    this.index = retainedIndex >= 0 ? retainedIndex : 0;
    this.centerSelectedThumb = true;
    this.stopPlayback();
  }
  togglePlayback(): void {
    if (this.playing) { this.stopPlayback(); return; }
    if (this.visibleImages.length < 2) return;
    if (this.index === this.visibleImages.length - 1) this.index = 0;
    this.playing = true;
    this.playbackTimer = setInterval(() => {
      if (this.index >= this.visibleImages.length - 1) { this.stopPlayback(); return; }
      this.select(this.index + 1);
    }, 700);
  }
  stopPlayback(): void {
    if (this.playbackTimer) clearInterval(this.playbackTimer);
    this.playbackTimer = undefined;
    this.playing = false;
  }
  onKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'range') return;
    const actions: Record<string, () => void> = {
      ArrowLeft: () => this.move(-1), ArrowRight: () => this.move(1),
      Home: () => this.select(0), End: () => this.select(this.visibleImages.length - 1),
    };
    if (actions[event.key]) { event.preventDefault(); actions[event.key](); }
  }
  trackImage(_index: number, item: Imagen | { image: Imagen }): number {
    return 'image' in item ? item.image.imagen_id : item.imagen_id;
  }
  closeOnBackdrop(event: MouseEvent): void {
    const dialog = this.viewerDialog?.nativeElement;
    if (dialog && event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }
  }
}
