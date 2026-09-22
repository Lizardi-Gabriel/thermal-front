import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  get<T>(url: string, options?: { params?: Record<string, string | number | boolean | null> }): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}${url}`, {
        headers: this.headers,
        params: options?.params as any,
      })
      .pipe(catchError(this.handleError));
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${url}`, body, { headers: this.headers }).pipe(catchError(this.handleError));
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${url}`, body, { headers: this.headers }).pipe(catchError(this.handleError));
  }

  patch<T>(url: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${url}`, body, { headers: this.headers }).pipe(catchError(this.handleError));
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${url}`, { headers: this.headers }).pipe(catchError(this.handleError));
  }

  private handleError = (error: HttpErrorResponse) => {
    const message = error.error?.detail || error.message || 'Error inesperado';
    console.error('[API Error]', error);
    return throwError(() => new Error(message));
  };
}
