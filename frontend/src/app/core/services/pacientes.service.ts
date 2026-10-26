import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Paciente } from '../models/paciente.model';

@Injectable({
  providedIn: 'root',
})
export class PacientesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/pacientes';

  obtenerPacientesActivos(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.baseUrl);
  }
}
