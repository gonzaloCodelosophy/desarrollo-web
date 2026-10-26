import { ApiProperty } from "@nestjs/swagger";

export class PacienteResumenDTO {

    @ApiProperty()
    id!: number;

    @ApiProperty()
    nombres!: string;

    @ApiProperty()
    apellidos!: string;

    @ApiProperty()
    documento!: string;

}
