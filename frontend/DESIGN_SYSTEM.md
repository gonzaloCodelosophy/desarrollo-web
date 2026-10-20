# i+Med: estilos compartidos

La base visual está en `src/styles.css`. No agrega pantallas, rutas ni lógica de turnos.

## Temas

`ThemeService`, en `src/app/core/theme`, aplica `data-theme="dark"` o `data-theme="light"` al elemento `html`. `App` lo inicializa antes de recuperar la sesión. El encabezado existente de `LayoutComponent` permite alternar ambos temas con un botón nativo, accesible mediante Tab y activable con Enter o Espacio. Muestra luna en oscuro y sol en claro; `aria-pressed` indica si el modo oscuro está activo.

La preferencia se guarda en `localStorage` con la clave `imed_theme`. Sin preferencia, con un valor inválido o con almacenamiento bloqueado se inicia en oscuro. Si no se puede guardar, el cambio visual funciona durante la sesión. El login recupera el tema al iniciar, aunque el interruptor está en el encabezado autenticado existente.

Todos los componentes que usen estas clases y variables heredan el tema. Los futuros componentes con colores propios deberán utilizar las mismas variables; no hay aún pantallas funcionales de agenda, turnos ni aranceles para revisar visualmente.

## Variables

- Marca: `--color-navy`, `--color-sky-blue`, `--color-pale-pink`, `--color-azalea`, `--color-beige`.
- Superficies: `--color-bg`, `--color-sidebar`, `--color-surface`, `--color-surface-secondary`.
- Texto y controles: `--color-text`, `--color-text-secondary`, `--color-text-disabled`, `--color-border`, `--color-primary`, `--color-on-primary`, `--color-focus`.
- Estados: `--color-success`, `--color-error`, `--color-warning`, `--color-info` y sus fondos `-bg`.
- Tipografía: `--font-heading` (Playfair Display) y `--font-body` (Inter). Se importan de Google Fonts; Georgia y Arial permiten seguir trabajando sin conexión.
- Tamaños: `--text-xs`, `--text-sm`, `--text-base`, `--text-card`, `--text-section`, `--text-heading-secondary`, `--text-heading` (12, 14, 16, 20, 24, hasta 32 y hasta 44 px).
- Espaciados: `--space-1` a `--space-7` (4, 8, 12, 16, 24, 32, 48 px).
- Bordes: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-pill`.
- Estructura: `--sidebar-width`, `--header-height`, `--shadow-card`, `--color-overlay`, `--transition-theme`.

El texto de apoyo usa el tono principal para conservar contraste sobre todas las superficies, incluida la sidebar celeste. El token secundario solicitado está disponible, pero debe comprobarse contra el fondo elegido antes de usarlo en texto pequeño.

## Clases disponibles

| Grupo | Clases |
| --- | --- |
| Botones | `btn`, `btn-primary`, `btn-secondary`, `btn-outline`, `btn-ghost`, `btn-danger`, `btn-success`, `btn-sm`, `btn-lg`, `btn-icon` |
| Formularios | `form`, `form-group`, `form-row`, `form-label`, `form-control`, `form-select`, `form-textarea`, `form-checkbox`, `form-error`, `form-help`, `form-required` |
| Tarjetas | `card`, `card-header`, `card-body`, `card-footer`, `card-title`, `card-subtitle`, `card-interactive`, `stat-card` |
| Tablas | `table-container`, `table`, `table-header`, `table-actions`, `table-empty` |
| Estados | `badge`, `badge-pending`, `badge-attended`, `badge-absent`, `badge-cancelled`, `badge-in-progress`, `badge-active`, `badge-inactive` |
| Alertas | `alert`, `alert-success`, `alert-error`, `alert-warning`, `alert-info` |
| Modales | `modal-overlay`, `modal`, `modal-header`, `modal-body`, `modal-footer` |
| Navegación | `app-layout`, `sidebar`, `sidebar-logo`, `sidebar-nav`, `sidebar-link`, `sidebar-link-active`, `topbar`, `topbar-actions`, `user-avatar`, `nav-tabs`, `nav-tab`, `nav-tab-active` |
| Páginas | `page-container`, `page-header`, `page-title`, `page-subtitle`, `page-actions`, `section-title`, `content-grid`, `empty-state`, `loading-state` |
| Calendarios | `calendar`, `calendar-header`, `calendar-grid`, `calendar-day`, `calendar-day-selected`, `calendar-day-disabled`, `time-slots`, `time-slot`, `time-slot-selected`, `time-slot-unavailable` |
| Marca y accesibilidad | `brand`, `brand-logo`, `brand-name`, `brand-tagline`, `sr-only` |

Los badges son estilos: no agregan estados al modelo del backend. Los modales requieren implementar foco, teclado y apertura en el componente. Las clases de horarios no calculan disponibilidad. En controles deshabilitados usar también `disabled`; una clase visual no bloquea acciones. Mostrar texto en estados y acciones, además del color.

## Ejemplos para las pantallas

```html
<button type="submit" class="btn btn-primary">Guardar</button>

<div class="form-group">
  <label for="documento" class="form-label">Documento</label>
  <input id="documento" class="form-control" formControlName="documento" />
</div>

<section class="card" aria-labelledby="titulo-turnos">
  <h2 id="titulo-turnos" class="card-title">Mis turnos</h2>
  <div class="card-body">Consultá tus próximas consultas.</div>
</section>

<div class="table-container" tabindex="0" role="region" aria-label="Turnos reservados">
  <table class="table">
    <caption>Próximos turnos</caption>
    <thead><tr><th scope="col">Médico</th><th scope="col">Estado</th></tr></thead>
    <tbody><tr><td>Laura Gómez</td><td><span class="badge badge-active">Activo</span></td></tr></tbody>
  </table>
</div>

<p class="alert alert-success" role="status">La reserva se guardó correctamente.</p>
<p class="alert alert-error" role="alert">No se pudo guardar la reserva.</p>
<p class="loading-state" role="status">Cargando turnos…</p>
<p class="empty-state">No tenés turnos reservados.</p>
```

El ejemplo de campo supone un contenedor con `[formGroup]` e importar `ReactiveFormsModule`, como el login actual. Los mensajes son ejemplos de uso y no se incorporaron a pantallas nuevas.

## Adaptación y accesibilidad

Grids automáticos, reducción de sidebar en tablet y una columna en móvil. Las tablas conservan scroll dentro de su contenedor; hacerlo enfocable como en el ejemplo permite recorrerlo con teclado. La sidebar puede ocultarse mediante `hidden` cuando su futuro componente implemente el menú móvil. No se agregó esa lógica.

Los controles tienen al menos 44 px de alto. Hay foco visible, temas para controles nativos y transiciones de 200 ms desactivadas con `prefers-reduced-motion`.

## Verificaciones realizadas

- `npm ci --ignore-scripts`: instala las dependencias existentes; no se agregaron dependencias ni se cambió el lockfile. npm avisa que Node 26 no está entre las versiones declaradas por ng-select.
- `npm run build`: correcto fuera del entorno restringido. Dentro de él terminó con código 134 sin diagnóstico.
- `NODE_OPTIONS=--no-experimental-webstorage npm test -- --watch=false --include='src/app/core/theme/theme.service.spec.ts' --include='src/app/layout/layout.spec.ts'`: 6 pruebas correctas. Se usa la opción de Node 26 para que su almacenamiento experimental no interfiera con el de jsdom.
- Las pruebas cubren oscuro inicial, preferencia inválida, alternancia, persistencia al recrear el servicio, almacenamiento bloqueado y actualización del botón, ícono y estado accesible. La persistencia se comprobó recreando el servicio, no recargando un navegador real.
- PostCSS analizó el archivo sin errores. Se calcularon 18 combinaciones de contraste de texto principal sobre superficies, texto del botón principal y estados semánticos. Todas superan 4.5:1; el mínimo fue 6.48:1. Esto no constituye una auditoría completa de accesibilidad.
- `git diff --check`: sin errores.

Pendiente: revisión visual real en escritorio y móvil, activación con teclado en navegador, recarga real, revisión de compañero y evidencia en la tarjeta. No había un navegador conectado para automatizar esas comprobaciones. Los tests iniciales de `app.spec.ts` no se modificaron ni forman parte de esta ejecución enfocada.

## Archivos de esta entrega

- `src/styles.css`: tokens, temas y clases compartidas.
- `src/app/core/theme/theme.service.ts`: gestión y persistencia del tema.
- `src/app/core/theme/theme.service.spec.ts`: pruebas del servicio.
- `src/app/app.ts`: inicialización del tema.
- `src/app/layout/layout.ts`: acceso al servicio desde el encabezado.
- `src/app/layout/layout.html`: interruptor de tema.
- `src/app/layout/layout.spec.ts`: prueba del interruptor.
- `DESIGN_SYSTEM.md`: esta guía.

La referencia existente «Clínica San Martín» permanece en `src/app/layout/layout.html`. No se inventó un logo ni se cambiaron nombres internos.
