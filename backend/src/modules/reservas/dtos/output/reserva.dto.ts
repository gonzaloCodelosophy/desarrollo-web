import { ApiProperty } from "@nestjs/swagger";
import { EstadoReservaEnum } from "../../enums/estado-reserva.enum.js";
import { MedicoResumenDTO } from "./medico-resumen.dto.js";
import { PacienteResumenDTO } from "./paciente-resumen.dto.js";

export class ReservaDTO {

   @ApiProperty()
   id!: number;

   @ApiProperty()
   fechaHora!: Date;

   @ApiProperty({ enum: EstadoReservaEnum })
   estado!: EstadoReservaEnum;

   @ApiProperty()
   valorConsulta!: number;

   @ApiProperty({ type: MedicoResumenDTO })
   medico!: MedicoResumenDTO;

   @ApiProperty({ type: PacienteResumenDTO })
   paciente!: PacienteResumenDTO;

}
