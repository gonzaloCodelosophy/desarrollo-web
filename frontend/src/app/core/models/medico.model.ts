export interface Medico {
  id: number;
  nombres: string;
  apellidos: string;
  matricula: number;
  valorConsulta: number;
}

export interface UpdateValorConsultaRequest {
  valorConsulta: number;
}
