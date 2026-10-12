import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsInt, IsNotEmpty, IsOptional } from "class-validator";

export class CreateReservaDto {

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    idMedico!: number;

    @ApiProperty({ description: 'Fecha y hora en punto del turno (ISO 8601)' })
    @IsDateString()
    @IsNotEmpty()
    fechaHora!: string;

    @ApiProperty({ required: false, description: 'Solo lo puede indicar un administrador; si lo reserva un paciente, se usa su propio id' })
    @IsOptional()
    @IsInt()
    idPaciente?: number;

}
