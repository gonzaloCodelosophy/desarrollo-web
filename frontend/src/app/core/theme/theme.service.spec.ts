import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    document.defaultView!.localStorage.removeItem('imed_theme');
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    document.defaultView!.localStorage.removeItem('imed_theme');
    document.documentElement.removeAttribute('data-theme');
  });

  it('inicia en oscuro sin preferencia guardada', () => {
    const service = TestBed.inject(ThemeService);
    service.initTheme();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('inicia en oscuro sin una preferencia válida', () => {
    document.defaultView!.localStorage.setItem('imed_theme', 'otro');
    const service = TestBed.inject(ThemeService);
    service.initTheme();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('alterna los temas y guarda la preferencia', () => {
    const service = TestBed.inject(ThemeService);
    service.initTheme();
    service.toggleTheme();
    expect(service.theme()).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(document.defaultView!.localStorage.getItem('imed_theme')).toBe('light');
    service.toggleTheme();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(document.defaultView!.localStorage.getItem('imed_theme')).toBe('dark');
  });

  it('recupera la preferencia al iniciar una nueva instancia', () => {
    const service = TestBed.inject(ThemeService);
    service.initTheme();
    service.toggleTheme();
    TestBed.resetTestingModule();
    const restored = TestBed.inject(ThemeService);
    restored.initTheme();
    expect(restored.theme()).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });

  it('permite cambiar de tema cuando el almacenamiento está bloqueado', () => {
    vi.spyOn(document.defaultView!.Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(document.defaultView!.Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    try {
      const service = TestBed.inject(ThemeService);
      expect(() => service.initTheme()).not.toThrow();
      expect(service.theme()).toBe('dark');
      expect(() => service.toggleTheme()).not.toThrow();
      expect(document.documentElement.dataset['theme']).toBe('light');
    } finally {
      vi.restoreAllMocks();
    }
  });
});
