import { ApiProperty } from "@nestjs/swagger";

export class MedicoResumenDTO {

    @ApiProperty()
    id!: number;

    @ApiProperty()
    nombres!: string;

    @ApiProperty()
    apellidos!: string;

}
