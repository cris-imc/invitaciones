# Plan de implementación — plantillas de mockup/ (Colección Storytelling)

Seguimiento de qué falta portar de `mockup/*.dc.html` a plantillas reales,
conectadas al wizard y a la invitación real. Cada una reusa la arquitectura
ya probada de `GuestPassVipTemplate.tsx` (RSVP, álbum con lightbox y foto
destacada, paginación balanceada, música con lista acotada, gesto lateral en
paneles, fix de `--vh`, motor de scroll/reveal) -- solo cambian paleta,
tipografía, copy, ícono/medallón y la textura propia de la tapa de cada
mockup (nunca se reusa el "sunburst" de otra, según pidió el usuario).

## Hechas

- [x] **Guest Pass VIP** (Casamiento) — dorado/negro, Bodoni Moda.
- [x] **Princesa** (XV) — lavanda/ciruela, Cormorant Garamond, destellos.
- [x] **Corona Escarlata** (XV) — bordó/dorado, Playfair Display, trama cruzada.
- [x] **Jewelry Box** (XV) — ciruela oscuro/rosa-viejo/dorado, Cormorant
      Garamond, medallón sin ícono ("15"), destello de gema. Wireada.
- [x] **Pase VIP** (XV) — negro/dorado con destellos rojo/verde-azulado,
      Bodoni Moda + IBM Plex Mono, medallón texto "VIP". Wireada.
- [x] **Cine Abstracto XV** — negro/rojo/dorado, Archivo Black + IBM Plex
      Mono, medallón texto "15", foquitos de marquesina. Wireada.
- [x] **Acrylic Pop** (XV) — negro con fucsia/cian/lima, Poppins + IBM Plex
      Mono, medallón "15". Wireada.
- [x] **Bola de Discoteca** (XV) — negro con neón cian/magenta/amarillo,
      Archivo Black, medallón "ADMIT ONE"/"15", disco lights. Wireada.
- [x] **Crystal 3D** (XV) — negro con cian/lavanda, Poppins + IBM Plex Mono,
      gema facetada + medallón circular. Wireada.
- [x] **Fashion Lookbook** (XV) — negro editorial con rojo, Archivo Black,
      medallón "15"/"Pasarela", "LOOK Nº". Wireada.
- [x] **Fashion Tag** (XV) — negro óxido, Playfair Display + IBM Plex Mono,
      medallón "15", "TALLE XV". Wireada.
- [x] **Atelier de Papel** (Casamiento) — negro-sepia/bronce, Cormorant
      Garamond, hoja de papel rotada en la tapa. Wireada.
- [x] **Botánica Editorial** (Casamiento) — negro/oliva-salvia, Cormorant
      Garamond, crosshatch de lino + vena de hoja SVG. Wireada.
- [x] **Cerámica Editorial** (Casamiento) — negro/bronce, Cormorant Garamond,
      destello de glasé. Wireada.
- [x] **Cine Abstracto** (Casamiento) — negro/cobre-terracota, Frank Ruhl
      Libre + IBM Plex Mono, grano de película + perforación 35mm. Wireada.
- [x] **Encaje Contemporáneo** (Casamiento) — negro/terracota, Playfair
      Display, trama tejida diamante. Wireada.
- [x] **Liquid Glass** (Casamiento) — negro/azul-vidrio, Cormorant Garamond,
      panel de vidrio con blur al abrir. Wireada.
- [x] **Papelería de Hotel de Lujo** (Casamiento) — verde-hotel/dorado,
      Playfair Display, medallón "LM". Wireada.
- [x] **Vintage Editorial** (Casamiento) — negro-sepia/dorado, Playfair
      Display, "EDICIÓN Nº". Wireada.

- [x] **Mármol y Oro** (Casamiento) — dorado/mármol plata, Italiana +
      Cormorant Garamond itálica, veta de mármol con deriva lenta en la
      tapa, "PIEZA Nº". Wireada.

## Pendientes

Ninguna -- las 20 plantillas de la Colección Storytelling (Guest Pass VIP,
Princesa, Corona Escarlata + las 17 de este plan) están construidas,
conectadas a los 8 puntos de wiring compartidos, y con typecheck/lint
limpios en todo el proyecto.

## Descartados (no son plantillas nuevas)

- `mockup/Pase VIP - Panorámica.dc.html` (con tilde): mismo diseño que ya es
  Guest Pass VIP (paleta, "ADMIT TWO · GUEST PASS", "La puerta se abre") --
  no se construye aparte.
- `mockup/Temáticas - Tanda 1.dc.html`: documento de exploración con
  fragmentos cortos de varios temas (Cine Abstracto, Botánica Editorial...),
  no una plantilla completa -- se usan los archivos dedicados de cada una.

## Después de tenerlas todas

- Volver a la idea del anillo/corona que viaja con el scroll y crece para
  revelar contenido (ver conversación) -- decidir con un prototipo en un
  solo punto antes de extenderlo.
