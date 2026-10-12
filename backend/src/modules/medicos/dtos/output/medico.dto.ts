import { ApiProperty } from "@nestjs/swagger";

export class MedicoDTO {

    @ApiProperty()
    id!: number;

    @ApiProperty()
    nombres!: string;

    @ApiProperty()
    apellidos!: string;

    @ApiProperty()
    matricula!: number;

    @ApiProperty()
    valorConsulta!: number;

}
