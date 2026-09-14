# Inventario de piezas pictóricas (Colección Papelería Viva)

> Generado al cortar las láminas de `mockup/inspire/assets/`. Las piezas son
> WebP con transparencia y se sirven desde `/templates/<familia>/<nombre>.webp`.
> La lámina original de cada familia queda en `mockup/inspire/assets/` por si hay
> que volver a cortar.
>
> El corte es por etiquetas: se etiqueta la lámina entera y cada pieza se recorta
> con el bbox de sus propios píxeles, borrando el alfa de todo lo que no es suyo.
> Por eso ninguna queda cortada ni arrastra un pedazo de la vecina.

## sobre-sello (4 piezas, 318 KB)

| Ruta | Tamaño | Peso | Para qué es |
|---|---|---|---|
| `/templates/sobre-sello/lacre.webp` | 584×567 | 79.9 KB | Sello de lacre bordó con monograma en relieve. Splash: se parte en dos al abrir. |
| `/templates/sobre-sello/lazo.webp` | 636×593 | 66 KB | Moño de cinta de raso crema. Divisor o remate de tarjeta. |
| `/templates/sobre-sello/pluma.webp` | 576×533 | 29.4 KB | Pluma caligráfica con gota de tinta. Frase o firma del cierre. |
| `/templates/sobre-sello/ramo-esquina.webp` | 621×710 | 143.2 KB | Ramo de rosa crema, eucalipto y bayas bordó. Esquina de la portada. |

## acuarela-corona (8 piezas, 437 KB)

| Ruta | Tamaño | Peso | Para qué es |
|---|---|---|---|
| `/templates/acuarela-corona/corona.webp` | 657×674 | 172.5 KB | Corona botánica circular con el centro vacío. Countdown: gira 1 vuelta/min con los días en el medio. |
| `/templates/acuarela-corona/guirnalda.webp` | 681×224 | 67.5 KB | Guirnalda horizontal. Divisor entre secciones. |
| `/templates/acuarela-corona/mariposa-1.webp` | 214×252 | 13.6 KB | Mariposa de perfil. Pieza flotante. |
| `/templates/acuarela-corona/mariposa-2.webp` | 307×290 | 22.8 KB | Mariposa de frente, alas abiertas. Pieza flotante. |
| `/templates/acuarela-corona/petalo-1.webp` | 137×150 | 6.1 KB | Pétalo chico. Lluvia de pétalos al confirmar el RSVP. |
| `/templates/acuarela-corona/petalo-2.webp` | 217×204 | 11.5 KB | Pétalo grande. Ídem. |
| `/templates/acuarela-corona/petalo-3.webp` | 194×169 | 8.3 KB | Pétalo mediano. Ídem. |
| `/templates/acuarela-corona/ramo-esquina.webp` | 599×702 | 135.1 KB | Ramo de peonías en acuarela. Esquina superior de la portada. |

## manuscrita (4 piezas, 352 KB)

| Ruta | Tamaño | Peso | Para qué es |
|---|---|---|---|
| `/templates/manuscrita/candelabro.webp` | 399×652 | 71.6 KB | Candelabro de tres velas. Detalles del evento. |
| `/templates/manuscrita/copas.webp` | 608×554 | 71.9 KB | Dos copas brindando. Cronograma o cierre. |
| `/templates/manuscrita/cupido.webp` | 662×625 | 117.4 KB | Cupido con arco, tinta de un trazo. Portada o frase. |
| `/templates/manuscrita/olivo.webp` | 592×567 | 90.7 KB | Rama de olivo. Divisor o esquina. |

## tinta-vinilo (5 piezas, 186 KB)

| Ruta | Tamaño | Peso | Para qué es |
|---|---|---|---|
| `/templates/tinta-vinilo/brazo.webp` | 569×620 | 31 KB | Brazo de tocadiscos. Baja sobre el vinilo al abrir la invitación. |
| `/templates/tinta-vinilo/sello-goma.webp` | 429×395 | 36 KB | Sello de goma con mango de madera, sin la marca de tinta. |
| `/templates/tinta-vinilo/sello-tinta.webp` | 282×277 | 16.3 KB | Impresión circular de tinta roja, suelta. Gesto de CONFIRMADO en el RSVP. |
| `/templates/tinta-vinilo/ticket.webp` | 615×538 | 51.7 KB | Ticket troquelado con clip. Pase de ingreso con QR. |
| `/templates/tinta-vinilo/vinilo.webp` | 611×608 | 51.3 KB | Disco de vinilo. Sugerí una canción: gira 8 s por vuelta. |

## Cómo se usan

- Como imagen: `<img src="/templates/<familia>/<nombre>.webp" alt="">` con `pointer-events:none`.
- La familia Manuscrita es tinta a un color: además de usarse como imagen, sirve de
  máscara para recolorear por variante, sin generar archivos nuevos:

```css
.doodle-cupido {
  width: 180px; aspect-ratio: 662 / 625;
  background: var(--t-acc);
  -webkit-mask: url(/templates/manuscrita/cupido.webp) no-repeat center / contain;
          mask: url(/templates/manuscrita/cupido.webp) no-repeat center / contain;
}
```

- El resto de la ornamentación (filetes, marcos, bordes rasgados, sellos simples,
  íconos, divisores) sigue siendo SVG inline dibujado en la plantilla.
