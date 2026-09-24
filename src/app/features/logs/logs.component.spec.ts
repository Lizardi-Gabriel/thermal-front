import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@environments/environment';
import { LogService } from '@app/core/services/log.service';
import { LogsComponent } from './logs.component';

describe('Backend logs', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('omits empty filters and sends both selected filters unchanged', () => {
    const service = TestBed.inject(LogService);
    service.getLogs({ fecha: '', tipo: '' }).subscribe();
    http.expectOne(`${environment.apiUrl}/logs?skip=0&limit=50`).flush([]);
    service.getLogs({ fecha: '2026-09-24', tipo: 'error' }).subscribe();
    const request = http.expectOne(req => req.url === `${environment.apiUrl}/logs`);
    expect(request.request.params.get('fecha')).toBe('2026-09-24');
    expect(request.request.params.get('tipo')).toBe('error');
    request.flush([]);
  });

  it('cancels outdated requests and recovers after validation errors', () => {
    const fixture = TestBed.createComponent(LogsComponent);
    fixture.detectChanges();
    const old = http.expectOne(`${environment.apiUrl}/logs?skip=0&limit=11`);
    fixture.componentInstance.tipo = 'error';
    fixture.componentInstance.load();
    expect(old.cancelled).toBeTrue();
    http.expectOne(`${environment.apiUrl}/logs?skip=0&limit=11&tipo=error`).flush({ detail: [] }, { status: 422, statusText: 'Unprocessable Entity' });
    expect(fixture.componentInstance.error).toContain('no son válidos');
    fixture.componentInstance.clear();
    http.expectOne(`${environment.apiUrl}/logs?skip=0&limit=11`).flush([{ log_id: 1, tipo: 'info', hora_log: '2026-09-24T12:00:00', mensaje: 'Listo' }]);
    expect(fixture.componentInstance.error).toBe('');
    expect(fixture.componentInstance.logs.length).toBe(1);
    expect(fixture.componentInstance.timestamp('2026-09-24T12:00:00')).toBe('2026-09-24 12:00:00');
  });
  it('uses a lookahead without skipping records and resets pagination on filter changes', () => {
    const fixture = TestBed.createComponent(LogsComponent);
    fixture.detectChanges();
    const logs = Array.from({ length: 11 }, (_, i) => ({ log_id: 100 - i, tipo: 'info', hora_log: '2026-09-24T12:00:00', mensaje: 'Log' }));
    http.expectOne(`${environment.apiUrl}/logs?skip=0&limit=11`).flush(logs);
    const component = fixture.componentInstance;
    expect(component.logs.length).toBe(10);
    expect(component.hasNext).toBeTrue();
    component.nextPage();
    http.expectOne(`${environment.apiUrl}/logs?skip=10&limit=11`).flush([logs[10]]);
    expect(component.logs[0].log_id).toBe(90);
    expect(component.hasNext).toBeFalse();
    expect(component.page).toBe(2);
    component.previousPage();
    http.expectOne(`${environment.apiUrl}/logs?skip=0&limit=11`).flush(logs.slice(0, 10));
    expect(component.hasNext).toBeFalse();
    component.skip = 10;
    component.tipo = 'error';
    component.resetPage();
    http.expectOne(`${environment.apiUrl}/logs?skip=0&limit=11&tipo=error`).flush([]);
    expect(component.page).toBe(1);
    expect(component.logs).toEqual([]);
  });

});
