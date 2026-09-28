import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { Evento } from '@app/core/models/evento.model';
import { ApiService } from '@app/core/services/api.service';
import { EventService } from '@app/core/services/event.service';
import { EventosListComponent } from '../eventos-list/eventos-list.component';

describe('Event workflow', () => {
  it('sends status as a query parameter as required by FastAPI', () => {
    const api = jasmine.createSpyObj('ApiService', ['put']);
    api.put.and.returnValue(of({ estatus: 'confirmado' }));
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
    TestBed.inject(EventService).updateEventoStatus(456, 'confirmado').subscribe();
    expect(api.put).toHaveBeenCalledWith('/eventos/456/status?estatus=confirmado', {});
  });
  describe('server pagination', () => {
    let component: EventosListComponent;
    let service: jasmine.SpyObj<EventService>;
    const events = (count: number): Evento[] => Array.from({ length: count }, (_, i) => ({
      evento_id: i + 1, fecha_evento: '2026-03-01', estatus: 'pendiente',
    }));

    beforeEach(() => {
      service = jasmine.createSpyObj('EventService', ['getEventos']);
      service.getEventos.and.returnValue(of(events(5)));
      TestBed.configureTestingModule({ providers: [
        { provide: EventService, useValue: service },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: (key: string) => key === 'fecha' ? '2026-03-01' : null } } } },
      ] });
      component = TestBed.runInInjectionContext(() => new EventosListComponent());
    });

    afterEach(() => component.ngOnDestroy());

    it('requests five events and advances the offset by five', () => {
      component.ngOnInit();
      expect(service.getEventos).toHaveBeenCalledWith({ skip: 0, limit: 5, fecha_inicio: '2026-03-01', fecha_fin: '2026-03-01' });
      expect(component.hasNext).toBeTrue();
      component.loadPage(1);
      expect(service.getEventos.calls.mostRecent().args[0]?.skip).toBe(5);
      expect(component.page).toBe(1);
      component.loadPage(0);
      expect(component.page).toBe(0);
    });

    it('resets pagination and queries dates across month boundaries', () => {
      component.loadPage(2);
      component.changeDay(-1);
      expect(component.selectedDate).toBe('2026-02-28');
      expect(service.getEventos.calls.mostRecent().args[0]).toEqual({ skip: 0, limit: 5, fecha_inicio: '2026-02-28', fecha_fin: '2026-02-28' });
      expect(component.page).toBe(0);
      component.endDate = '2026-03-10';
      component.applyFilters();
      expect(service.getEventos.calls.mostRecent().args[0]?.fecha_fin).toBe('2026-03-10');
      component.selectDay('');
      expect(component.selectedDate).toBe('');
      expect(component.endDate).toBe('');
    });

    it('stops on a partial page or an empty page after an exact multiple', () => {
      component.ngOnInit();
      service.getEventos.and.returnValue(of([]));
      component.loadPage(1);
      expect(component.page).toBe(0);
      expect(component.eventos.length).toBe(5);
      expect(component.hasNext).toBeFalse();
      service.getEventos.and.returnValue(of(events(2)));
      component.loadPage(1);
      expect(component.page).toBe(1);
      expect(component.eventos.length).toBe(2);
      expect(component.hasNext).toBeFalse();
    });

    it('cancels stale requests when dates change', () => {
      const oldRequest = new Subject<Evento[]>();
      service.getEventos.and.returnValue(oldRequest);
      component.ngOnInit();
      service.getEventos.and.returnValue(of(events(2)));
      component.selectDay('');
      oldRequest.next(events(5));
      expect(component.eventos.length).toBe(2);
    });

    it('rejects reversed ranges without requesting the API', () => {
      component.endDate = '2026-02-28';
      component.applyFilters();
      expect(service.getEventos).not.toHaveBeenCalled();
      expect(component.error).toContain('fecha inicial');
      expect(component.loading).toBeFalse();
    });

    it('retries the failed page and keeps the last successful page number', () => {
      component.ngOnInit();
      service.getEventos.and.returnValue(throwError(() => new Error('offline')));
      component.loadPage(1);
      expect(component.page).toBe(0);
      expect(component.error).toBeTruthy();
      service.getEventos.and.returnValue(of(events(2)));
      component.loadPage(component.requestedPage);
      expect(component.page).toBe(1);
      expect(component.error).toBe('');
    });
  });

  it('serializes all supported filters and omits empty dates', () => {
    const api = jasmine.createSpyObj('ApiService', ['get']);
    api.get.and.returnValue(of([]));
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
    const service = TestBed.inject(EventService);
    service.getEventos({ fecha_inicio: '', fecha_fin: '' }).subscribe();
    expect(api.get).toHaveBeenCalledWith('/eventosfront/optimizado', { params: { skip: 0, limit: 5 } });
    service.getEventos({ skip: 5, limit: 5, fecha_inicio: '2026-09-01', fecha_fin: '2026-09-28', estatus: 'pendiente', usuario_id: 4 }).subscribe();
    expect(api.get).toHaveBeenCalledWith('/eventosfront/optimizado', { params: { skip: 5, limit: 5, fecha_inicio: '2026-09-01', fecha_fin: '2026-09-28', estatus: 'pendiente', usuario_id: 4 } });
  });
});
