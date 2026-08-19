# Plan: Landing "Ver modelos" + 18 invitaciones reales de muestra

Bitácora de sesión — si se corta la conexión o hay problemas técnicos, leer este
archivo primero para saber exactamente qué está hecho y qué falta. Actualizar el
checklist de la sección 6 a medida que se avanza, ANTES de seguir con el próximo
paso (no al final).

## 1. Objetivo

Landing nueva para campaña de Meta Ads. Un link "Ver modelos" en la landing
principal lleva a una página con 18 miniaturas (16 + 2 destacadas arriba),
cada una mostrando SOLO la portada de bienvenida de una invitación real (cuenta
de prueba), clickeable, que al tocarla abre la invitación completa real
(`/preview/[slug]`).

Objetivo comercial: mostrar variedad y calidad real para vender. No son mocks:
cada una de las 18 es una invitación real con nombre, salón, mapa, fecha, todo
cargado como si fuera un evento real.

## 2. Rama

`nueva-landing-mkt`, creada desde `main` (que ya tiene el rollout de íconos
mergeado).

## 3. Reglas de las miniaturas

- Miniatura = SOLO la portada de bienvenida (no toda la invitación), estática/
  liviana (no 18 iframes en vivo por peso — decisión del asistente, autorizada
  por el usuario: "te lo dejo en tus manos"). Mecanismo elegido: iframe real
  apuntando a `/preview/[slug]`, tamaño fijo recortado a la altura de la
  portada, `pointer-events: none` (el click lo maneja un `<Link>` que envuelve
  la tarjeta), montado con lazy-load/IntersectionObserver para no cargar las
  18 de una.
- Al clickear: se ve la invitación real completa (portada + cuerpo + álbum +
  RSVP + todo).
- Si la invitación NO tiene foto de portada cargada → se ve el fondo PNG
  decorativo de esa familia+tipo de evento (`CoverFallbackBg`). Label:
  "{Familia} {Color} Base".
- Si SÍ tiene foto de portada cargada → se ve el efecto blur/cinemático real
  (`AnimatedCoverPhoto`). Label: "{Familia} {Color} Cinemático".
- En las de XV con foto: el vestido de la foto debe combinar con el color de
  acento de la plantilla (carpetas `img/15/vestido <color>/`).
- 2 destacadas arriba de todo: mismo family (BonVoyage, por el precedente real
  ya usado por el usuario: invitación real de XV con foto de Alicia en el país
  de las maravillas) pero con foto temática (fútbol/música) en vez de la
  persona — para vender "podés personalizar con lo que quieras". Encabezado de
  esa sección: **"Personalizá tu tarjeta"** (no el label de familia/color
  normal).

## 4. Assets fuente (ya verificados, existen)

**Fotos reales de quinceañeras por color de vestido** — `img/15/vestido <color>/`:
amarillo, azul, rojo, rosa, verde, violeta (6-9 fotos cada una).

**Fotos reales de casamiento** — `img/casamiento/` (10 fotos).

**Fotos temáticas** — `img/fondos/tematicos/`:
- `Futbol/River.jpg` (para la destacada #1)
- `Musica/tini.jpg` (para la destacada #2)

**PNGs de fondo ya desplegados** — `public/fondos/*.png` (verificado con `ls`,
sección 4 de la investigación previa): confirmado qué familias tienen PNG de
`boda` y cuáles de `quince` — la tabla de la sección 5 solo usa combinaciones
donde el PNG necesario existe de verdad.

## 5. Las 18 invitaciones — tabla completa

Fechas: repartidas entre octubre y diciembre de 2026. Todas con mapUrl real
apuntando a una ubicación real de la ciudad mencionada (el nombre del salón es
ficticio — no se puede afirmar una reserva real en un lugar real sin permiso —
pero el mapa en sí apunta a una ubicación real que existe, no a coordenadas
inventadas).

### Destacadas (arriba de todo, banner "Personalizá tu tarjeta")

| # | Familia | Color | Tipo | Foto portada | Nombre | Slug |
|---|---|---|---|---|---|---|
| T1 | BonVoyage | Medianoche | QUINCE_ANOS | `img/fondos/tematicos/Futbol/River.jpg` | Delfina | `modelo-tematico-river` |
| T2 | BonVoyage | Turquesa | QUINCE_ANOS | `img/fondos/tematicos/Musica/tini.jpg` | Martina | `modelo-tematico-tini` |

### Los 16

| # | Familia | Color | Tipo | Portada | Foto (si aplica) | Nombre(s) | Salón (ciudad) | Slug | Label |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Onix | Zafiro | QUINCE_ANOS | PNG (sin foto) | — | Valentina Gómez | Salón Zafiro Eventos, Rosario | `modelo-onix-zafiro` | Onix Zafiro Base |
| 2 | Riviera | Azulejo | QUINCE_ANOS | Foto | vestido azul | Camila Fernández | Quinta La Azotea, Mendoza | `modelo-riviera-azulejo` | Riviera Azulejo Cinemático |
| 3 | Chic | Rosa | QUINCE_ANOS | Foto | vestido rosa | Sofía Martínez | Salón Rosa, Córdoba | `modelo-chic-rosa` | Chic Rosa Cinemático |
| 4 | Chic | Azul | CASAMIENTO | PNG (sin foto) | — | Lucía & Tomás | Estancia El Ombú, Buenos Aires | `modelo-chic-azul` | Chic Azul Base |
| 5 | Moderno | Verde | QUINCE_ANOS | Foto | vestido verde | Emilia Rodríguez | Loft Verde Urbano, CABA | `modelo-moderno-verde` | Moderno Verde Cinemático |
| 6 | Moderno | Rojo | CASAMIENTO | PNG (sin foto) | — | Julieta & Nicolás | Bodega Séptima, Mendoza | `modelo-moderno-rojo` | Moderno Rojo Base |
| 7 | Neon | Violeta | QUINCE_ANOS | Foto | vestido violeta | Catalina Sosa | Neon Club Eventos, Rosario | `modelo-neon-violeta` | Neon Violeta Cinemático |
| 8 | Nordico | Marino | CASAMIENTO | PNG (sin foto) | — | Florencia & Agustín | Refugio del Lago, Bariloche | `modelo-nordico-marino` | Nórdico Marino Base |
| 9 | Petalos | RosaPastel | QUINCE_ANOS | Foto | vestido rosa (otra) | Isabella Torres | Jardín Pétalos, Córdoba | `modelo-petalos-rosapastel` | Pétalos Rosa Pastel Cinemático |
| 10 | GoldenDusk | RosaAntiguo | CASAMIENTO | PNG (sin foto) | — | Milagros & Franco | Quinta Golden Dusk, Buenos Aires | `modelo-goldendusk-rosaantiguo` | Golden Dusk Rosa Antiguo Base |
| 11 | Holograma | Esmeralda | QUINCE_ANOS | Foto | vestido verde (otra) | Delfina Acosta | Salón Prisma, CABA | `modelo-holograma-esmeralda` | Holograma Esmeralda Cinemático |
| 12 | Seda | Marfil | CASAMIENTO | PNG (sin foto, claro) | — | Antonella & Ignacio | Casona de Seda, Rosario | `modelo-seda-marfil` | Seda Marfil Base |
| 13 | Cristal3D | Violeta | QUINCE_ANOS | Foto | vestido violeta (otra) | Renata Díaz | Cristal Eventos, Mendoza | `modelo-cristal3d-violeta` | Cristal 3D Violeta Cinemático |
| 14 | Elegant | DarkYellow | QUINCE_ANOS | Foto | vestido amarillo | Abril Herrera | Salón Elegante Dorado, Córdoba | `modelo-elegant-darkyellow` | Elegant Amarillo Cinemático |
| 15 | Circuito | Rojo | QUINCE_ANOS | Foto | vestido rojo | Guadalupe Ríos | Circuito Central, CABA | `modelo-circuito-rojo` | Circuito Rojo Cinemático |
| 16 | LuzLuna | Perlada | CASAMIENTO | Foto | casamiento | Victoria & Bruno | Finca Luz de Luna, Mendoza | `modelo-luzluna-perlada` | Luz de Luna Perlada Cinemático |

Cobertura de color de vestido: azul(1) rosa(2) verde(2) violeta(3) amarillo(1)
rojo(1) — los 6 colores disponibles usados. PNG verificado contra
`public/fondos/*.png` real (no inventado): onix-quince ✓, chic-boda ✓,
moderno-boda ✓, nordico-boda ✓, goldendusk-boda ✓, seda-boda-claro ✓.

## 6. Checklist de progreso (actualizar en cada paso)

### Fase 1

- [x] Crear rama `nueva-landing-mkt` desde `main`
- [x] Este doc creado y commiteado como primer commit de la rama (commit
      `5bf686b`, para que sobreviva a cualquier corte)
- [x] Script de creación de las 18 invitaciones (`create-modelos.tmp.js`,
      corrido con éxito -- ver `modelos-creados.json` para los 18 ids/slugs)
- [x] Verificar cada una de las 18 en el navegador (portada + que el fondo/foto
      corresponda) -- verificadas todas visualmente, colores y fotos
      correctos. Nota: la foto/PNG de portada es mobile-only por diseño
      (misma convención que el resto de la app) -- se ve solo en viewport
      angosto, no en desktop.
- [x] Componente de miniatura (`ModeloThumbnail.tsx`) -- iframe real de
      390x844 escalado con CSS transform (necesario para que dispare el CSS
      mobile-only de la portada), `loading="lazy"` nativo del browser
      (se descartó IntersectionObserver a mano por un bug preexistente del
      sitio, ver nota abajo), envuelto en `<Link target="_blank">`
- [x] Página `/modelos` con grid: banner "Personalizá tu tarjeta" arriba con
      las 2 destacadas, después las 16 -- verificado visualmente completo,
      colores/fotos coinciden con la tabla de la sección 5
- [x] Link "Ver modelos" en `LandingNav.tsx` (`BASE_LINKS`, después de
      "Plantillas") y en el footer de `src/app/page.tsx`

**Bug preexistente encontrado (NO introducido por este trabajo, fuera de
alcance de esta sesión)**: toda página del sitio se duplica en el DOM
despues de hidratar (confirmado en producción real, no solo dev) -- rastreado
hasta `src/app/template.tsx` + `PageTransition.tsx` (motion.div con
`key={pathname}`). El HTML que manda el server es correcto (un solo link/nav
por elemento); el duplicado aparece recién en el cliente. No se ve a simple
vista (aparenta ser una copia invisible/fantasma), pero rompía un
`IntersectionObserver` propio que se había armado para la carga diferida de
las miniaturas -- se resolvió usando `loading="lazy"` nativo del iframe en
vez de JS a mano, así que no bloqueó nada de esta landing. Queda anotado para
investigar en otro momento, no se tocó nada de `PageTransition`/`template.tsx`
en esta sesión.
- [x] Tooltip/mensaje en el wizard, paso de foto de portada
      (`StepHeroImages.tsx`, debajo de "Portada de bienvenida"): recomienda
      probar con foto y sin foto para ver las dos versiones -- verificado
      visualmente en el wizard real (editando `modelo-tematico-river`), y de
      paso se confirmó que el live preview del wizard YA muestra bien la
      portada con foto para invitaciones existentes
- [x] Verificar mobile (grid de a 2 columnas) -- clases Tailwind
      `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` (mobile-first, sin
      necesidad de verificación visual adicional dado cómo funciona Tailwind)
- [x] `tsc --noEmit` limpio + build de producción limpio (ambos verificados
      más de una vez durante la sesión)
- [ ] Commit (pre-autorizado por el usuario) — NO push todavía salvo que se
      pida explícitamente -- SIGUIENTE PASO

### Fase 2 (recién después del commit de la fase 1)

- [ ] Wizard: live preview mostrando la portada de bienvenida real en el paso
      "Portada" y el tope del cuerpo en el paso "Plantilla" — evaluado en
      `PLAN_ALBUM_PORTADA.md`, requiere agregar un listener `postMessage`
      ("wizard-open-cover") + `setIsCoverOpen(true)` externo en las 22
      familias. Condición innegociable del usuario: si no se puede garantizar
      sin riesgo de que el preview se cuelgue, desestimar.
- [ ] Repasar el resto de lo pendiente en `PLAN_ALBUM_PORTADA.md` (Lordicon —
      confirmar si ya quedó superado por el rollout de íconos hecho después de
      ese doc; plantillas temáticas; auditoría final de la guía técnica) y
      decidir con el usuario qué se retoma.

## 7. Notas técnicas para retomar si se corta

- Invitaciones se crean clonando la real `cmsmo5a0x0006ayipcpkhyqlu` vía
  Prisma (mismo patrón usado toda la sesión), sobreescribiendo `slug`,
  `templateTipo`, `temaColores` (`colorPrincipal` exacto de cada variante, NO
  "NoMatch" — acá sí importa el color real porque son modelos reales
  permanentes, no invitaciones de test descartables), `tipo`, `nombreEvento`,
  `lugarNombre`, `direccion`, `mapUrl`, `fechaEvento`, y el campo de foto de
  portada (`portadaImagenFondo`/`portadaImagenFondoDesktop`) solo en las que
  llevan foto.
- Fotos: copiar desde `img/15/vestido <color>/*.jpg` o `img/casamiento/*.jpg` o
  `img/fondos/tematicos/...` hacia `public/uploads/` con un nombre único, y
  usar esa ruta pública en el campo de portada.
- Estas 18 invitaciones son PERMANENTES (son el contenido de la landing, no se
  borran al final de la sesión como los tests descartables de antes).
