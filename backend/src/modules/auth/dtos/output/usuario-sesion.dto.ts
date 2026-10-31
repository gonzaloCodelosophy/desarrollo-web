import { ApiProperty } from '@nestjs/swagger';
import { RolUsuarioEnum } from '../../enums/rol-usuario.enum.js';

export class UsuarioSesionDTO {

    @ApiProperty()
    id!: number;

    @ApiProperty()
    documento!: string;

    @ApiProperty()
    nombres!: string;

    @ApiProperty()
    apellidos!: string;

    @ApiProperty({ enum: RolUsuarioEnum })
    rol!: RolUsuarioEnum;

}
