import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { ThemeService } from '../core/theme/theme.service';
import type { UsuarioSesion, RolUsuario } from '../core/models/usuario.model';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './layout.html',
})
export class LayoutComponent {
  readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);

  readonly usuario: UsuarioSesion | null = null;

  get currentUser(): UsuarioSesion | null {
    return this.authService.currentUser();
  }

  get userRole(): RolUsuario | null {
    return this.authService.userRole();
  }

  logout(): void {
    this.authService.logout();
  }
}
