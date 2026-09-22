import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  handleError(error: HttpErrorResponse): Observable<never> {
    const message = error.error?.detail || error.message || 'Ocurrió un error inesperado.';
    console.error('[HTTP Error]', error);
    return throwError(() => new Error(message));
  }
}
