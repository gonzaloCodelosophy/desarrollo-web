import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsInt, IsNotEmpty, IsOptional } from "class-validator";

export class CreateReservaDto {

   @ApiProperty()
   @IsInt()
   @IsNotEmpty()
   idMedico!: number;

   @ApiProperty({ description: 'Fecha y hora del turno' })
   @IsDateString()
   @IsNotEmpty()
   fechaHora!: string;

   @ApiProperty({ required: false, description: 'Solo para administradores, el paciente usa su propio id' })
   @IsOptional()
   @IsInt()
   idPaciente?: number;

}
