import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Medico, UpdateValorConsultaRequest } from '../models/medico.model';

@Injectable({
  providedIn: 'root',
})
export class MedicosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/medicos';

  obtenerMedicos(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.baseUrl);
  }

  actualizarValorConsulta(id: number, body: UpdateValorConsultaRequest): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/valor-consulta`, body);
  }
}
