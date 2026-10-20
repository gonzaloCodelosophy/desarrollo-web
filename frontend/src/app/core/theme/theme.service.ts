import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

type Theme = 'dark' | 'light';
const THEME_KEY = 'imed_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly currentTheme = signal<Theme>('dark');

  readonly theme = this.currentTheme.asReadonly();

  initTheme(): void {
    let theme: Theme = 'dark';
    try {
      if (this.document.defaultView?.localStorage.getItem(THEME_KEY) === 'light') {
        theme = 'light';
      }
    } catch {
      // El tema sigue disponible aunque el navegador bloquee el almacenamiento.
    }
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.applyTheme(theme);
    try {
      this.document.defaultView?.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // La preferencia se conserva durante esta sesión si no se puede guardar.
    }
  }

  private applyTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.document.documentElement.setAttribute('data-theme', theme);
  }
}
