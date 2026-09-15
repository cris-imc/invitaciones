# Inventario de piezas — Colección E "Papel Prensado"

> El set viejo `naipe` (corazón, trébol, puntilla de póker) se descartó y lo
> reemplaza `baraja`, de baraja española.

> Cortadas de las láminas de `mockup/inspire/assets/` con el corte por
> etiquetas: se etiqueta la lámina entera y cada pieza se recorta con el bbox de
> sus propios píxeles, poniendo en alfa 0 todo lo que no es suyo. Ninguna queda
> cortada ni arrastra un pedazo de la vecina.
>
> **Reglas de composición** (medidas sobre las referencias, están en
> `docs/ANALISIS_RAMESTUDIO.md` §8.2): toda pieza grande sangra por un borde de
> la hoja; se usan dos o tres piezas reutilizadas en tres a cinco tamaños; el
> ícono de sección va centrado arriba del número, con un ancho del 19 % de la
> hoja; y el ornamento está **quieto** (sin rotación, sin opacidad parcial, sin
> `mix-blend-mode`).

## iconos-linea (12 piezas, 225 KB)

Tinta plana a un color → **se usa como máscara CSS** y se recolorea por variante.

| Ruta | Tamaño | Peso | Para qué es |
|---|---|---|---|
| `/templates/iconos-linea/anillos.webp` | 290×332 | 26.7 KB | Dos anillos en su cajita abierta. Sección de ceremonia. |
| `/templates/iconos-linea/auto.webp` | 367×223 | 20.3 KB | Auto con latitas atadas. Cierre, «recién casados». |
| `/templates/iconos-linea/confeti.webp` | 268×319 | 19.1 KB | Cono de confeti. Cierre o celebración. |
| `/templates/iconos-linea/copas.webp` | 261×360 | 18.6 KB | Dos copas brindando. Sección de fiesta. |
| `/templates/iconos-linea/iglesia.webp` | 269×362 | 22.3 KB | Iglesia con cruz y destellos. Sección de ceremonia religiosa. |
| `/templates/iconos-linea/nota-musical.webp` | 202×253 | 9.3 KB | Nota doble con corazones. Sugerí una canción. |
| `/templates/iconos-linea/polaroids.webp` | 281×271 | 19.1 KB | Dos polaroids apiladas. Sección de álbum. |
| `/templates/iconos-linea/regalo.webp` | 249×293 | 20.8 KB | Cajita con moño. Sección de regalos y datos bancarios. |
| `/templates/iconos-linea/reloj.webp` | 265×269 | 16.7 KB | Reloj de agujas. Countdown o cronograma. |
| `/templates/iconos-linea/sobre.webp` | 261×276 | 13.4 KB | Sobre abierto con un tilde. RSVP confirmado. |
| `/templates/iconos-linea/tarjeta.webp` | 256×300 | 13 KB | Tarjeta doblada con un corazón. Sección de confirmación. |
| `/templates/iconos-linea/torta.webp` | 281×361 | 25.3 KB | Torta de dos pisos con velita. Cumpleaños y XV. |

## herbario (4 piezas, 277 KB)

Ilustración pintada con luces y sombras → **NO se usa como máscara** (quedaría una mancha). Se usa como imagen y se tiñe con `filter` (ver abajo).

| Ruta | Tamaño | Peso | Para qué es |
|---|---|---|---|
| `/templates/herbario/hoja.webp` | 245×244 | 12.4 KB | Hoja suelta. Viñeta chica y lluvia de hojas al confirmar el RSVP. |
| `/templates/herbario/magnolia.webp` | 504×849 | 88.3 KB | Magnolia con dos flores abiertas. Portada y columna fija de escritorio, ancho 45 %. |
| `/templates/herbario/rama-cabecera.webp` | 707×330 | 72.3 KB | Rama horizontal de hojas y espigas. Pieza de CABECERA: arriba a la derecha, cortada por el borde superior, ancho 40-63 %. |
| `/templates/herbario/rama-esquina.webp` | 525×911 | 104 KB | Eucalipto en diagonal. Pieza de ESQUINA: va pegada al borde izquierdo, tercio inferior, ancho 28-38 % de la hoja. |

## trazo (9 piezas, 101 KB)

Tinta plana a un color → **se usa como máscara CSS** y se recolorea por variante.

| Ruta | Tamaño | Peso | Para qué es |
|---|---|---|---|
| `/templates/trazo/corazon-chico.webp` | 134×148 | 4.6 KB | Corazón chico. Va de a dos con el grande. |
| `/templates/trazo/corazon-grande.webp` | 196×238 | 7.9 KB | Corazón a mano alzada, trazo abierto. |
| `/templates/trazo/destello-1.webp` | 126×185 | 3.7 KB | Chispa de cuatro puntas, grande. |
| `/templates/trazo/destello-2.webp` | 125×197 | 3.9 KB | Chispa de cuatro puntas, grande (la otra). |
| `/templates/trazo/destello-3.webp` | 72×96 | 2 KB | Chispa chica. |
| `/templates/trazo/destello-4.webp` | 72×94 | 2 KB | Chispa chica (la otra). |
| `/templates/trazo/garabato-corto.webp` | 584×161 | 8.5 KB | Línea curva horizontal con un rulo. Cierra la esquina contraria al garabato largo. |
| `/templates/trazo/garabato-largo.webp` | 176×1168 | 17 KB | Línea ondulada muy vertical. Va pegada a un borde lateral de la hoja, sangrando arriba y abajo, ancho 30 %. |
| `/templates/trazo/marco-circular.webp` | 632×674 | 51.4 KB | Círculo a mano alzada con tres hojitas. SÓLO alrededor del número del countdown. |

## baraja (5 piezas, 241 KB)

Ilustración pintada con luces y sombras → **NO se usa como máscara**. Se usa como imagen y se tiñe con `filter` (ver abajo).

| Ruta | Tamaño | Peso | Para qué es |
|---|---|---|---|
| `/templates/baraja/ancho-de-basto.webp` | 240×770 | 44.6 KB | El garrote solo. Canción y cierre, en espejo del ancho de espada. |
| `/templates/baraja/ancho-de-espada.webp` | 205×787 | 26.5 KB | La espada sola. RSVP: pegada al borde izquierdo, sangrando arriba y abajo, ancho 22 %. |
| `/templates/baraja/as-de-copas.webp` | 297×489 | 40.4 KB | Copa ceremonial labrada. Esquina inferior izquierda de la portada y del cierre, ancho 32 % de la hoja, sangrando por el borde. En XV y cumpleaños reemplaza al escudo en la portada. |
| `/templates/baraja/as-de-oros.webp` | 413×414 | 58.8 KB | Medallón con sol de rayos. Countdown (ancho 55 %, el número de días en relieve encima) y cabecera de la sección de datos (ancho 40 %, cortado arriba). |
| `/templates/baraja/espada-y-basto.webp` | 453×646 | 70.6 KB | Los dos anchos cruzados con un lazo: el escudo de la pareja. Portada, centrado, ancho 45 %, y columna fija de escritorio. |

## Cómo se usan

### Piezas de tinta plana (iconos-linea, trazo)

Se usan como **máscara**, no como imagen: así toman el color de la variante sin
generar un archivo por color.

```css
.icono-seccion {
  width: 19%;                 /* la medida de las referencias */
  aspect-ratio: 265 / 269;
  background: var(--t-acc);
  -webkit-mask: url(/templates/iconos-linea/reloj.webp) no-repeat center / contain;
          mask: url(/templates/iconos-linea/reloj.webp) no-repeat center / contain;
}
```

### Piezas pintadas (herbario y baraja)

Están en sepia desteñido y tienen luces y sombras, así que la máscara las aplastaría. Van
como `<img>` y se tiñen con un duotono de filtros, que conserva el pintado.
Valores probados sobre `rama-esquina.webp`:

| Variante | `filter` |
|---|---|
| Salvia | `grayscale(1) sepia(1) hue-rotate(48deg) saturate(.75) brightness(.96)` |
| Eucalipto | `grayscale(1) sepia(1) hue-rotate(58deg) saturate(.55) brightness(1.02)` |
| Oliva | `grayscale(1) sepia(1) hue-rotate(20deg) saturate(.85) brightness(.94)` |
| Ceniza | `grayscale(1) sepia(.35) saturate(.5)` |
| Tinta | `grayscale(1) sepia(1) hue-rotate(150deg) saturate(.45) brightness(.92)` |

```html
<img src="/templates/herbario/rama-esquina.webp" alt="" aria-hidden="true"
     style="filter: var(--t-tinte); pointer-events: none;">
```

Se define `--t-tinte` por variante y la misma pieza sirve para las cinco. La
comparación está en `mockup/inspire/webs/4y-herbario-variantes.jpg`.

Para **baraja**, que arranca más saturada (la copa tiene una banda terracota),
los cinco valores probados son otros. Están verificados sobre las cinco piezas
en `mockup/inspire/webs/4y-baraja-variantes.jpg`:

| Variante | `filter` |
|---|---|
| Oro viejo | `grayscale(1) sepia(1) hue-rotate(-6deg) saturate(1.45) brightness(.88) contrast(1.08)` |
| Vino | `grayscale(1) sepia(1) hue-rotate(-38deg) saturate(2.2) brightness(.68) contrast(1.2)` |
| Verde mesa | `grayscale(1) sepia(1) hue-rotate(95deg) saturate(.7) brightness(.86)` |
| Tinta | `grayscale(1) sepia(1) hue-rotate(165deg) saturate(.6) brightness(.85)` |
| Ceniza | `grayscale(1) sepia(.3) saturate(.45) brightness(.98)` |

El `grayscale(1)` del principio no es decorativo: es lo que normaliza la banda
terracota de la copa con el dorado del oro, para que las cinco piezas queden en
el mismo tono.

### Siempre

- `alt=""` y `aria-hidden="true"`: son ornamento, no contenido.
- `pointer-events: none`.
- Nunca encima del texto: si se pisan, gana el texto.
