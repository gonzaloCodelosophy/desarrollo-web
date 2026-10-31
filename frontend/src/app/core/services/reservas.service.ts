import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  CreateReservaRequest,
  CreateReservaResponse,
  FiltroReservas,
  Reserva,
} from '../models/reserva.model';

@Injectable({
  providedIn: 'root',
})
export class ReservasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/reservas';

  listarMisTurnos(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.baseUrl);
  }

  listarReservas(filtros?: FiltroReservas): Observable<Reserva[]> {
    let params = new HttpParams();

    if (filtros?.fecha) {
      params = params.set('fecha', filtros.fecha);
    }

    if (filtros?.idMedico !== undefined && filtros.idMedico !== '') {
      params = params.set('idMedico', String(filtros.idMedico));
    }

    return this.http.get<Reserva[]>(this.baseUrl, { params });
  }

    consultarDisponibilidad(fecha: string, idMedico: number): Observable<string[]> {
        const params = new HttpParams().set("fecha", fecha).set("idMedico", idMedico);
        return this.http.get<string[]>(`${this.baseUrl}/disponibilidad`, { params });
    }

  crearReserva(body: CreateReservaRequest): Observable<CreateReservaResponse> {
    return this.http.post<CreateReservaResponse>(this.baseUrl, body);
  }

  cancelarTurno(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/cancelar`, {});
  }

  cancelarReserva(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/cancelar`, {});
  }

  marcarAtendido(id: number){
    return this.http.patch<void>(
      `${this.baseUrl}/${id}/atender`, 
      {}
    );
  }

  marcarAusente(id: number){
    return this.http.patch<void>(
      `${this.baseUrl}/${id}/ausente`,      {}
    );
  }
}
