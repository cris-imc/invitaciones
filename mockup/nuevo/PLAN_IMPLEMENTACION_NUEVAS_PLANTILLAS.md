# Plan de implementación — Nuevas plantillas (sin tocar backend)

## 0. Qué son los .zip
`new15.zip` y `newcasamiento.zip` contienen los mockups HTML/CSS/JS (Design Components) de las 12 plantillas nuevas (6 para 15 años, 6 para casamiento — Editorial/Noir/Botánico + variantes Cine/Nórdico/Riviera + las cinemáticas). **No son código React**: son la referencia visual e interactiva pixel-perfect (colores, tipografías, animaciones, parallax, countdown) que el equipo dev traduce a componentes `.tsx` siguiendo el patrón ya usado por `VintageEleganceTemplate.tsx` / `AuroraDreamyTemplate.tsx`.

Pasos previos:
1. Descomprimir ambos zips dentro de `mockup/` → `mockup/new15/*.html`, `mockup/newcasamiento/*.html`.
2. Cada `.html` es autocontenido: abrirlo en el navegador alcanza para ver colores exactos (buscar los objetos `colors:{...}` en el `<script>` de cada archivo), fuentes (Google Fonts en el `<head>`), y toda la lógica de countdown/parallax/animaciones ya funcionando en JS plano — copiar esa lógica 1:1 a `useEffect`/`useState` en el componente React.

## 1. Eliminar las plantillas actuales
Borrar (y sus referencias):
- `src/components/templates/*.tsx` existentes (Vintage, Aurora, Disco, KidsParty, BabyBaptism, y la plantilla legacy `ConviteTemplate.tsx`).
- Entradas correspondientes en `src/lib/theme-config.ts` y `src/lib/templatesConfig.ts`.
- Imports/condicionales en `StepPreview.tsx` e `InvitationContent.tsx`.
- Mantener sin tocar: `CollaborativeAlbumModern.tsx`, `types.ts` (interfaz `TemplateProps` se reusa tal cual).

## 2. Crear los componentes nuevos
12 archivos nuevos en `src/components/templates/`, uno por plantilla (nombre sugerido = nombre del mockup sin espacios, ej. `EditorialBlancTemplate.tsx`, `MarmolOroTemplate.tsx`, `HerbarioTemplate.tsx`, `DebutanteTemplate.tsx`, `OnixTemplate.tsx`, `JardinDeSedaTemplate.tsx`, `CineTemplate.tsx`, `AtelierNordicoTemplate.tsx`, `RivieraTemplate.tsx`, `SedaTemplate.tsx`, `PetalosTemplate.tsx`, `LuzDeLunaTemplate.tsx`). Cada uno:
- Recibe las mismas props que hoy (`invitation`, `guest`, `isPersonalized`, o `data`/`themeConfig`).
- Reusa los componentes existentes sin modificarlos: `Countdown`/`CountdownV2` (agregarle la unidad de segundos, ver §5), `SharedAlbum`/`AlbumCarousel`, `CronogramaOriginal`, `QuizTrivia`, `BankDetails`, `SongSuggestion`, `PersonalizedRsvpForm`/`RSVPWizardV2`, `SplashScreen`.
- El layout/CSS es nuevo (Tailwind + estilos inline donde el mockup use gradientes/filtros), la lógica de datos NO cambia.

## 3. Categorización por tipo de evento
En `templatesConfig.ts`, agregar a cada entrada un campo `category: 'QUINCE' | 'CASAMIENTO' | 'EVENTO'` (si no existe ya) y taggear las 6 de `new15.zip` como `QUINCE`, las 6 de `newcasamiento.zip` como `CASAMIENTO`. (El pack "Tech/Cinemático" de 15 también entra como `QUINCE`.)

## 4. Selector de plantilla (último paso del wizard)
En el componente que renderiza "Elegí tu plantilla" (dentro de `WizardSteps.tsx` / `StepPreview.tsx` o el selector de plantillas del dashboard):
- Filtrar las tarjetas mostradas por `category === tipoDeEventoDeLaInvitacion` (el wizard ya sabe si es 15/casamiento/evento desde `StepEventType.tsx`).
- Mostrar solo las plantillas nuevas (las 12) para 15/casamiento; para "evento general" corporativo/otros, dejar temporalmente las que ya cubren ese caso hasta que se pida un pack específico.

## 5. Countdown con segundos
`Countdown.tsx`/`CountdownV2.tsx`: agregar la unidad "segundos" al cálculo y al render (hoy solo días/horas/min). Es un cambio aditivo, no rompe las plantillas viejas que ya se están eliminando.

## 6. Foto de portada: recorte único cuadrado
Paso del wizard **"Fotos de Portada y Fondo"** (`StepCoverPage.tsx` / `StepHeroImages.tsx` / `ImagePositionEditor.tsx`):
- Reemplazar los dos recortes actuales (16:9 para desktop, 9:16 para mobile) por **un solo recorte cuadrado (1:1)**.
- Ese único archivo cuadrado se usa como `heroImg` tanto en la vista mobile como en la desktop (las plantillas nuevas ya están armadas para usar `object-fit: cover` sobre un cuadrado en ambos layouts — ver `heroImg`/`heroMedia` en los mockups).
- Guardar en el mismo campo que hoy se usa para la imagen de portada (no se necesita columna nueva); si hoy existen dos campos separados (`heroImageDesktop`/`heroImageMobile`), migrar a que ambos apunten al mismo archivo cuadrado nuevo, o dejar un solo campo `heroImageSquare` y que ambas vistas lo lean.

## 7. Selector de gama de colores (sin libertad total)
Requisito: el cliente elige entre **triadas de color curadas por plantilla**, nunca un color suelto.
- Cada componente de plantilla nueva expone un array fijo `COLOR_SCHEMES` (3–4 triadas, ej. la de ejemplo "gama de azules": bg oscuro + accent + accent2 ya combinados con la tipografía). Estas triadas son las mismas `colors:{...}` que aparecen en los mockups — armar 2-3 variantes adicionales por plantilla a mano (siguiendo la misma lógica de contraste ya usada en el pack "Cinemático": clara / oscura / vibrante).
- En el wizard, en el mismo paso de selección de plantilla (o uno inmediatamente después), agregar un pequeño selector de 3-4 swatches (como el `Color` de un tweak: cuadraditos con la triada, no un color picker libre).
- Guardar la elección como un string (`colorSchemeId`) **dentro del campo JSON flexible que ya exista** en la invitación (ej. si hay un `customization`/`themeConfig` de tipo JSON en la tabla `Invitation`, se agrega esta key ahí — cero migraciones). Si hoy no existe ningún campo JSON libre en el modelo, ese sería el único cambio de schema estrictamente necesario (una columna nullable `colorSchemeId: string`); avisar esto al equipo como la única excepción al "sin tocar backend".

## 8. QA antes de publicar
- Probar cada una de las 12 plantillas con: RSVP, quiz, álbum, cronograma, regalo (alias regalo + alias tarjeta), música — mismos flags que ya usa el wizard.
- Confirmar que el recorte cuadrado se ve bien tanto en el mock de celular como en el de escritorio (los mockups ya muestran el toggle Celular/Escritorio: usar eso como referencia de aceptación).
- Confirmar que countdown corre en vivo con segundos sin salto ni desfasaje al recargar la página.
