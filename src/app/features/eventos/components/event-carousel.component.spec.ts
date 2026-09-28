import { Imagen } from '@app/core/models/evento.model';
import { EventCarouselComponent } from './event-carousel.component';

describe('EventCarouselComponent', () => {
  const images: Imagen[] = Array.from({ length: 15 }, (_, index) => ({
    imagen_id: index + 1,
    evento_id: 10,
    ruta_imagen: `/image-${index + 1}.jpg`,
    hora_subida: `2026-09-24T12:00:${String(index).padStart(2, '0')}Z`,
    detecciones: index === 4 || index === 9 ? [{
      deteccion_id: index,
      imagen_id: index + 1,
      confianza: .9,
      x1: 1, y1: 1, x2: 2, y2: 2,
    }] : [],
  }));

  it('keeps a compact filmstrip centered around the current image', () => {
    const component = new EventCarouselComponent();
    component.images = images;
    component.select(8);

    expect(component.filmstripImages.length).toBe(11);
    expect(component.filmstripImages.map(item => item.index)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });

  it('filters the sequence to images with detections and keeps the current image when possible', () => {
    const component = new EventCarouselComponent();
    component.images = images;
    component.select(9);
    component.toggleDetectionFilter();

    expect(component.visibleImages.map(image => image.imagen_id)).toEqual([5, 10]);
    expect(component.current?.imagen_id).toBe(10);
    expect(component.index).toBe(1);
  });

  it('clamps navigation to the available image range', () => {
    const component = new EventCarouselComponent();
    component.images = images;

    component.move(-1);
    expect(component.index).toBe(0);
    component.select(999);
    expect(component.index).toBe(images.length - 1);
  });
});
