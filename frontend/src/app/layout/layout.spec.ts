import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { ThemeService } from '../core/theme/theme.service';
import { LayoutComponent } from './layout';

describe('LayoutComponent: tema', () => {
  afterEach(() => {
    document.defaultView!.localStorage.removeItem('imed_theme');
    document.documentElement.removeAttribute('data-theme');
  });

  it('actualiza el estado accesible y el ícono al pulsar el interruptor', async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser: () => null,
            userRole: () => 'PACIENTE',
            logout: () => {},
          },
        },
      ],
    }).compileComponents();
    document.defaultView!.localStorage.removeItem('imed_theme');
    TestBed.inject(ThemeService).initTheme();
    const fixture = TestBed.createComponent(LayoutComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[aria-pressed]') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Modo oscuro');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.querySelector('circle')).toBeNull();
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.querySelector('circle')).not.toBeNull();
    expect(document.documentElement.dataset['theme']).toBe('light');
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.querySelector('circle')).toBeNull();
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });
});
