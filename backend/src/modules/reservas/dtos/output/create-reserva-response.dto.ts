import { ApiProperty } from "@nestjs/swagger";

export class CreateReservaResponseDto {

   @ApiProperty({ description: 'ID de reserva creada' })
   id!: number;

}
