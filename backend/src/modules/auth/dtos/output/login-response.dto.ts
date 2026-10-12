import { ApiProperty } from "@nestjs/swagger";
import { UsuarioSesionDTO } from "./usuario-sesion.dto.js";

export class LoginResponseDTO {

    @ApiProperty()
    accessToken!: string;

    @ApiProperty({ type: UsuarioSesionDTO })
    usuario!: UsuarioSesionDTO;

}
