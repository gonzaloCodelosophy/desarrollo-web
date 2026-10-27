import { Component, OnInit, ViewEncapsulation, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/auth/auth.service';
import type { LoginRequest } from '../../../core/models/auth.model';
import { ThemeService } from '../../../core/theme/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule, MessageModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'login-host' },
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly themeService = inject(ThemeService);

  readonly form = this.fb.nonNullable.group({
    documento: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[0-9]+$/),
        Validators.minLength(7),
        Validators.maxLength(9),
      ],
    ],
    clave: ['', [Validators.required, Validators.minLength(4)]],
  });

  readonly cargando = signal(false);
  readonly mensajeError = signal<string | null>(null);

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.mensajeError()) {
        this.mensajeError.set(null);
      }
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.redirigirDestino();
    }
  }

  onSubmit(): void {
    if (this.cargando()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.mensajeError.set(null);
    this.cargando.set(true);

    const raw = this.form.getRawValue();
    const credentials: LoginRequest = {
      documento: raw.documento.trim(),
      clave: raw.clave,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.cargando.set(false);
        this.redirigirDestino();
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

  private redirigirDestino(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl && returnUrl.startsWith('/') && returnUrl !== '/login') {
      this.router.navigateByUrl(returnUrl);
      return;
    }

    const rol = this.authService.userRole();
    if (rol === 'PACIENTE') {
      this.router.navigate(['/paciente/turnos']);
    } else if (rol === 'MEDICO') {
      this.router.navigate(['/medico/agenda']);
    } else if (rol === 'ADMINISTRADOR') {
      this.router.navigate(['/administracion/turnos']);
    }
  }
}
