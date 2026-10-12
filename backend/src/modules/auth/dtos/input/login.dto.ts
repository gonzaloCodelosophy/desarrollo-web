import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class LoginDTO {

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: "Se debe indicar el documento" })
    documento: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    clave: string
}
