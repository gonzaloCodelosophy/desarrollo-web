# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.26.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Reserva de turnos

El componente compartido `src/app/shared/reserva-turno/` implementa la reserva
para pacientes (`/paciente/reservar`) y administración (`/administracion/reservar`).
Su CSS usa clases propias en español y las variables de tema de `src/styles.css`.

- El paciente envía médico y fecha/hora. El backend obtiene su identidad de la sesión;
  esta pantalla consulta solo horarios ocupados, sin datos de otros pacientes.
- Administración selecciona un paciente activo y consulta horarios ocupados por médico
  y fecha. Si esa consulta falla, la reserva queda bloqueada hasta reintentar.
- Los turnos inician de 08:00 a 15:00, duran una hora y admiten hasta 30 días de anticipación.
  La pantalla interpreta fechas y horarios en Buenos Aires y envía el instante en UTC.
  El backend debe ejecutarse con `TZ=America/Argentina/Buenos_Aires`, según su `.env.example`.
- Ambos roles consultan los horarios ocupados por médico y fecha antes de seleccionar.
  El servidor comprueba la ocupación al confirmar. Ante un conflicto se conserva médico,
  fecha y paciente, y se solicita elegir otra hora.
- El importe mostrado es el arancel consultado; el backend guarda el vigente al confirmar.

### Comprobación manual del circuito

1. Entrar como paciente, abrir Reservar turno y seleccionar médico, fecha y horario.
2. Confirmar y abrir Mis turnos: verificar médico, hora de Buenos Aires e importe.
3. Intentar el mismo médico/horario desde otra cuenta: debe mostrarse el conflicto
   conservando el resto de la selección.
4. Cancelar una reserva futura dentro del plazo permitido y volver a reservar ese horario.
5. Entrar como administrador y repetir la reserva seleccionando un paciente.
6. Verificar fechas pasadas, límite de 30 días, bloqueo de doble envío y fallo de disponibilidad.
7. Revisar ambas pantallas en móvil y con los dos temas.

Estos pasos requieren API y base de datos en ejecución; una compilación correcta no
confirma por sí sola el funcionamiento completo del circuito.
