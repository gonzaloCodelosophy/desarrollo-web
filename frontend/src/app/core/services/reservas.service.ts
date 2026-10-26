import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Reserva } from '../models/reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/reservas';

  listarMisTurnos(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.baseUrl);
  }

  cancelarTurno(id: number): Observable<void> {
    return this.http.patch<void>(this.baseUrl + '/' + id + '/cancelar', {});
  }
}
