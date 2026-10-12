import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNumberString, IsOptional } from "class-validator";

export class ListReservasQueryDto {

    @ApiProperty({ required: false, description: 'Fecha (YYYY-MM-DD). Obligatoria para el rol MEDICO' })
    @IsOptional()
    @IsDateString()
    fecha?: string;

    @ApiProperty({ required: false, description: 'Solo aplica para el rol ADMINISTRADOR' })
    @IsOptional()
    @IsNumberString()
    idMedico?: string;

}
