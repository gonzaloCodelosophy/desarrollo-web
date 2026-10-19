import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import type { LoginRequest, LoginResponse } from '../models/auth.model';
import type { UsuarioSesion, RolUsuario } from '../models/usuario.model';

const TOKEN_KEY = 'auth_token';
const USUARIO_KEY = 'auth_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly currentUser = signal<UsuarioSesion | null>(null);
  readonly token = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.rol ?? null);

  initSession(): void {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUsuario = localStorage.getItem(USUARIO_KEY);
    if (storedToken && storedUsuario) {
      try {
        const usuario: UsuarioSesion = JSON.parse(storedUsuario);
        this.token.set(storedToken);
        this.currentUser.set(usuario);
      } catch {
        this.clearStorage();
      }
    }
  }


  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/v1/auth', credentials).pipe(
      tap((response) => {
        this.token.set(response.accessToken);
        this.currentUser.set(response.usuario);
        localStorage.setItem(TOKEN_KEY, response.accessToken);
        localStorage.setItem(USUARIO_KEY, JSON.stringify(response.usuario));
      }),
    );
  }

  logout(): void {
    this.clearStorage();
    this.router.navigate(['/login']);
  }

  hasRole(roles: RolUsuario[]): boolean {
    const rol = this.userRole();
    return rol !== null && roles.includes(rol);
  }

  private clearStorage(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
  }
}
