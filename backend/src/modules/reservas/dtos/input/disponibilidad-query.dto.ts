import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, Matches } from "class-validator";

export class DisponibilidadQueryDto {

    @ApiProperty({ description: "Fecha (YYYY-MM-DD), hora de Buenos Aires" })
    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    @IsDateString({ strict: true })
    fecha!: string;

    @ApiProperty({ description: "ID del médico" })
    @Matches(/^[1-9]\d*$/)
    idMedico!: string;

}
