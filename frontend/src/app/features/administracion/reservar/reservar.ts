import { Component } from "@angular/core";
import { ReservaTurnoComponent } from "../../../shared/reserva-turno/reserva-turno";

@Component({
    selector: "app-reservar-admin",
    imports: [ReservaTurnoComponent],
    templateUrl: "./reservar.html",
})
export class ReservarComponent {}
