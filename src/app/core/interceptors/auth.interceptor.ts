import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  const router = inject(Router);
  const logger = inject(NGXLogger);

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  logger.info('HTTP Request', {
    url: authReq.url,
    method: authReq.method,
    hasToken: !!token,
  });

  return next(authReq).pipe(
    tap((event) => {
      if (event.type === 0) {
        logger.debug('HTTP Request sent', { url: authReq.url, method: authReq.method });
      }
    }),
    catchError((error) => {
      logger.error('HTTP Error', {
        url: authReq.url,
        method: authReq.method,
        status: error.status,
        message: error.message,
        error: error.error,
      });

      if (error.status === 401) {
        localStorage.removeItem('access_token');
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    })
  );
};
