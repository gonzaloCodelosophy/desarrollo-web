import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import type { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    documento: ['', Validators.required],
    clave: ['', Validators.required],
  });

  readonly cargando = signal(false);
  readonly mensajeError = signal<string | null>(null);

  onSubmit(): void {
    if (this.form.invalid || this.cargando()) return;

    this.mensajeError.set(null);
    this.cargando.set(true);

    const credentials: LoginRequest = this.form.getRawValue();

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.cargando.set(false);
        const rol = response.usuario.rol;
        if (rol === 'PACIENTE') {
          this.router.navigate(['/paciente/turnos']);
        } else if (rol === 'MEDICO') {
          this.router.navigate(['/medico/agenda']);
        } else if (rol === 'ADMINISTRADOR') {
          this.router.navigate(['/administracion/turnos']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        if (err.status === 401) {
          this.mensajeError.set('Credenciales inválidas. Verificá tu documento y contraseña.');
        } else if (err.status === 0) {
          this.mensajeError.set('No se pudo conectar con el servidor. Intentá nuevamente.');
        } else {
          this.mensajeError.set('Ocurrió un error inesperado. Intentá nuevamente.');
        }
      },
    });
  }
}
