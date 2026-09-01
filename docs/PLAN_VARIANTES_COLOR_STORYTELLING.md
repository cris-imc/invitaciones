# Plan — 5 variantes de color por familia (Colección Storytelling)

Cada una de las 20 plantillas de la Colección Storytelling hoy tiene una
sola variante de color ("default"). El pedido: llevar cada familia a 5
variantes de color, donde tanto el color **principal/base** (los degradés
casi-negros de fondo de cada sección) como el **acento** (la identidad de
color de la familia -- ej. el dorado de Guest Pass VIP, el fucsia/cian/lima
de Acrylic Pop) cambien de forma NOTORIA entre variantes -- no un matiz
sutil. Los neutros compartidos de toda la colección (paneles claros
crema/pergamino del álbum, grises de texto) se mantienen iguales entre
variantes de una misma familia, para que el álbum y la UI de datos reales
no pierdan legibilidad.

Mecanismo: cada plantilla ya construida es el scaffold de sus propias 4
variantes nuevas -- mismo layout, copy, tipografía, gestos, textura de
tapa y tipo de medallón, cambiando SOLO los valores de color (hex/rgba).
Un agente por familia lee su propio archivo base completo, diseña 4
paletas nuevas coherentes con la identidad de esa familia, y genera 4
archivos nuevos (copias recoloreadas). El coordinador wirea después los 5
IDs de color de cada familia en `template-preview-registry.tsx` (arrays
`_COLORS` y records `_COMPONENTS`, ya existentes, solo se agregan 4
entradas a cada uno) y en las dos páginas de invitación real
(`i/[slug]/page.tsx`, `invite/[slug]/[token]/page.tsx`, agregando el
`switch` por color que ya usan las familias Flat con variantes).

## Familias (20) -- todas empiezan en 1/5

- [x] Guest Pass VIP (GUESTPASSVIP) — Casamiento — 5/5 wireado
- [x] Princesa (PRINCESA) — XV — 5/5 wireado
- [x] Corona Escarlata (CORONAESCARLATA) — XV — 5/5 wireado
- [x] Jewelry Box (JEWELRYBOX) — XV — 5/5 wireado
- [x] Pase VIP (PASEVIP) — XV — 5/5 wireado
- [x] Cine Abstracto XV (CINEABSTRACTOXV) — XV — 5/5 wireado
- [x] Acrylic Pop (ACRYLICPOP) — XV — 5/5 wireado
- [x] Bola de Discoteca (BOLADEDISCOTECA) — XV — 5/5 wireado
- [x] Crystal 3D (CRYSTAL3D) — XV — 5/5 wireado
- [x] Fashion Lookbook (FASHIONLOOKBOOK) — XV — 5/5 wireado
- [x] Fashion Tag (FASHIONTAG) — XV — 5/5 wireado
- [x] Atelier de Papel (ATELIERDEPAPEL) — Casamiento — 5/5 wireado
- [x] Botánica Editorial (BOTANICAEDITORIAL) — Casamiento — 5/5 wireado
- [x] Cerámica Editorial (CERAMICAEDITORIAL) — Casamiento — 5/5 wireado
- [x] Cine Abstracto (CINEABSTRACTO) — Casamiento — 5/5 wireado
- [x] Encaje Contemporáneo (ENCAJECONTEMPORANEO) — Casamiento — 5/5 wireado
- [x] Liquid Glass (LIQUIDGLASS) — Casamiento — 5/5 wireado
- [x] Mármol y Oro (MARMOLYORO) — Casamiento — 5/5 wireado (se generaron Ónix y Rosa, faltaban; se corrigió Esmeralda que había quedado con el acento dorado sin cambiar)
- [x] Papelería de Hotel de Lujo (PAPELERIADEHOTELDELUJO) — Casamiento — 5/5 wireado
- [x] Vintage Editorial (VINTAGEEDITORIAL) — Casamiento — 5/5 wireado

## Nota de bug corregido antes de este plan

Atelier de Papel, Botánica Editorial, Encaje Contemporáneo y Liquid Glass
habían quedado con el archivo construido pero SIN conectar a los 8 puntos
de wiring compartidos (omisión del coordinador durante la tanda anterior,
detectada y corregida al arrancar este plan).
