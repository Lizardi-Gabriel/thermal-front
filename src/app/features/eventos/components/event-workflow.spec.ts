import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
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
  it('navigates across month boundaries and filters by the selected date', () => {
    TestBed.configureTestingModule({ providers: [
      { provide: EventService, useValue: {} },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => '2026-03-01' } } } },
    ] });
    const component = TestBed.runInInjectionContext(() => new EventosListComponent());
    component.changeDay(-1);
    expect(component.selectedDate).toBe('2026-02-28');
    component.eventos = [
      { evento_id: 1, fecha_evento: '2026-02-28', estatus: 'pendiente' },
      { evento_id: 2, fecha_evento: '2026-03-01', estatus: 'confirmado' },
    ];
    expect(component.filteredEvents.map(event => event.evento_id)).toEqual([1]);
    component.selectedDate = '';
    expect(component.filteredEvents.map(event => event.evento_id)).toEqual([2, 1]);
  });
  it('orders events from newest to oldest, including events on the same day', () => {
    TestBed.configureTestingModule({ providers: [
      { provide: EventService, useValue: {} },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => '' } } } },
    ] });
    const component = TestBed.runInInjectionContext(() => new EventosListComponent());
    component.eventos = [
      { evento_id: 1, fecha_evento: '2026-02-28', hora_inicio: '18:30:00', estatus: 'pendiente' },
      { evento_id: 3, fecha_evento: '2026-03-01', hora_inicio: '08:00:00', estatus: 'confirmado' },
      { evento_id: 2, fecha_evento: '2026-03-01', hora_inicio: '12:00:00', estatus: 'descartado' },
    ];
    expect(component.filteredEvents.map(event => event.evento_id)).toEqual([2, 3, 1]);
  });
});
