import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  template: `
    <main>
      <h2>{{ titulo }}</h2>
      <p>Módulo pendiente de integración por el responsable asignado.</p>
    </main>
  `,
})
export class PlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  readonly titulo: string = this.route.snapshot.data['title'] ?? 'Módulo en desarrollo';
}
