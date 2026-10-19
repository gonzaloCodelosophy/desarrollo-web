import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const LOGIN_URL = '/api/v1/auth';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const esLoginRequest = req.url === LOGIN_URL || req.url.endsWith('/auth');
        if (!esLoginRequest) {
          authService.logout();
        }
      }
      return throwError(() => error);
    }),
  );
};
