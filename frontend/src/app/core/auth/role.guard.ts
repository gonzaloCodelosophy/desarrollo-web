import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import type { RolUsuario } from '../models/usuario.model';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolesRequeridos: RolUsuario[] = route.data['roles'] ?? [];

  if (rolesRequeridos.length === 0 || authService.hasRole(rolesRequeridos)) {
    return true;
  }

  return router.createUrlTree(['/acceso-denegado']);
};
