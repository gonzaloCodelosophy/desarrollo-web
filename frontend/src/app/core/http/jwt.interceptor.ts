import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  const esApiPropia = req.url.startsWith('/api/');

  if (token && esApiPropia) {
    const reqConToken = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(reqConToken);
  }

  return next(req);
};
