import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, Min } from "class-validator";

export class UpdateValorConsultaDto {

  @ApiProperty()
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  valorConsulta!: number;

}
