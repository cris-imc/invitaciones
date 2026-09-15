repo: cris-imc/invitaciones
branch: main

## Last sync
date: 2026-09-15T13:17:30Z

### Updated in this project
- Botonera inferior unificada en las cinco familias con el registro de Prensa (colección Papel Prensado): grano de papel con `feTurbulence` en un `data:` URI, canto en relieve con la luz desde arriba a la derecha, e íconos de línea en lugar de números.
- Importado el set compartido `public/templates/iconos-linea/` (8 de 12 piezas) y usado como máscara CSS, así se recolorea por variante.
- La botonera se repliega al scrollear (opacity → 0, translateY 26 px, 300 ms) y vuelve 370 ms después de frenar, en 350 ms.
- Colección Papelería Viva completa: cinco familias Flat — "Sobre & Sello", "Acuarela & Corona", "Manuscrita", "Tinta & Vinilo" y "Membrete" — cada una en un .dc.html panorámico con toggle Celular/Escritorio, 5 variantes y handoff.
- Importadas las piezas de `sobre-sello/`, `acuarela-corona/`, `manuscrita/` (como máscara CSS) y `tinta-vinilo/`. Membrete no usa imágenes: toda su ornamentación es SVG/CSS.
- Datos y campos tomados de `src/lib/schemas/invitation.ts`; arquitectura rígida de `Skills/GUIA_PEDIR_NUEVA_PLANTILLA.md`.

## Screen map
| Pantalla del proyecto | Archivos del repo |
|---|---|
| Sobre y Sello - Panoramica.dc.html | Skills/GUIA_PEDIR_NUEVA_PLANTILLA.md · public/templates/INVENTARIO.md · src/lib/schemas/invitation.ts · mockup/nuevo/Plantillas Casamiento.dc.html |
| Acuarela y Corona - Panoramica.dc.html | Skills/GUIA_PEDIR_NUEVA_PLANTILLA.md · public/templates/INVENTARIO.md · src/lib/schemas/invitation.ts |
| Manuscrita - Panoramica.dc.html | Skills/GUIA_PEDIR_NUEVA_PLANTILLA.md · public/templates/INVENTARIO.md · src/lib/schemas/invitation.ts |
| Tinta y Vinilo - Panoramica.dc.html | Skills/GUIA_PEDIR_NUEVA_PLANTILLA.md · public/templates/INVENTARIO.md · src/lib/schemas/invitation.ts |
| Membrete - Panoramica.dc.html | Skills/GUIA_PEDIR_NUEVA_PLANTILLA.md · src/lib/schemas/invitation.ts |
| public/templates/sobre-sello/*.webp | public/templates/sobre-sello/*.webp |
| public/templates/acuarela-corona/*.webp | public/templates/acuarela-corona/*.webp |
| public/templates/manuscrita/*.webp | public/templates/manuscrita/*.webp |
| public/templates/tinta-vinilo/*.webp | public/templates/tinta-vinilo/*.webp |
| public/templates/tinta-vinilo/vinilo.webp | public/templates/tinta-vinilo/vinilo.webp |

## Sync history
- 2026-09-14T17:46:22Z — primera lectura del repo: guía Flat, inventario de piezas, schema de invitación; importadas las 4 piezas de sobre-sello.
