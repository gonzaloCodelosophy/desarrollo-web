import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { PlaceholderComponent } from './shared/placeholder.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'paciente/turnos',
        canActivate: [roleGuard],
        data: { roles: ['PACIENTE'], title: 'Mis Turnos' },
        component: PlaceholderComponent,
      },
      {
        path: 'paciente/reservar',
        canActivate: [roleGuard],
        data: { roles: ['PACIENTE'], title: 'Reservar Turno' },
        component: PlaceholderComponent,
      },

      {
        path: 'medico/agenda',
        canActivate: [roleGuard],
        data: { roles: ['MEDICO'], title: 'Agenda Médica' },
        component: PlaceholderComponent,
      },
      {
        path: 'administracion/turnos',
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'], title: 'Turnos' },
        loadComponent: () =>
          import('./features/administracion/turnos/turnos').then(
            (m) => m.TurnosComponent
          ),
      },
      {
        path: 'administracion/reservar',
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'], title: 'Reservar' },
        loadComponent: () =>
          import('./features/administracion/reservar/reservar').then(
            (m) => m.ReservarComponent
          ),
      },
      {
        path: 'administracion/aranceles',
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'], title: 'Aranceles' },
        loadComponent: () =>
          import('./features/administracion/aranceles/aranceles').then(
            (m) => m.ArancelesComponent
          ),
      },

      {
        path: 'acceso-denegado',
        loadComponent: () =>
          import('./pages/unauthorized/unauthorized').then((m) => m.UnauthorizedComponent),
      },

      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found').then((m) => m.NotFoundComponent),
  },
];
