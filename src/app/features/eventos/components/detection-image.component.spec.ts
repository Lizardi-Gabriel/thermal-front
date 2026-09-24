import { TestBed } from '@angular/core/testing';
import { DetectionImageComponent, mexicoTime } from './detection-image.component';
import { Imagen } from '@app/core/models/evento.model';

describe('Event detection rendering', () => {
  it('treats backend naive timestamps as UTC and displays Mexico City time', () => {
    expect(mexicoTime('2026-09-23T15:00:00')).toBe('09:00:00');
    expect(mexicoTime('2026-09-23T15:00:00Z')).toBe('09:00:00');
    expect(mexicoTime(null)).toBe('--:--');
  });

  it('ignores stale image loads and draws boxes in natural image coordinates', () => {
    const pending: any[] = [];
    spyOn(window, 'Image').and.callFake(function () {
      const image = { naturalWidth: 640, naturalHeight: 480, onload: () => {}, src: '' };
      pending.push(image);
      return image as unknown as HTMLImageElement;
    });
    const ctx = jasmine.createSpyObj('context', ['drawImage', 'strokeRect']);
    spyOn(HTMLCanvasElement.prototype, 'getContext').and.returnValue(ctx);
    const fixture = TestBed.createComponent(DetectionImageComponent);
    const first: Imagen = { imagen_id: 1, evento_id: 1, hora_subida: '', ruta_imagen: '/first.png', detecciones: [] };
    const second: Imagen = { ...first, imagen_id: 2, ruta_imagen: '/second.png', detecciones: [{ deteccion_id: 1, imagen_id: 2, confianza: .95, x1: 10, y1: 20, x2: 110, y2: 220 }] };
    fixture.componentRef.setInput('imagen', first);
    fixture.detectChanges();
    fixture.componentRef.setInput('imagen', second);
    fixture.detectChanges();
    pending[1].onload();
    pending[0].onload();
    expect(ctx.drawImage).toHaveBeenCalledTimes(1);
    expect(ctx.strokeRect).toHaveBeenCalledWith(10, 20, 100, 200);
    expect(fixture.nativeElement.querySelector('canvas').width).toBe(640);
  });
});
