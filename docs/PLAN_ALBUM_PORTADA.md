# Plan de rollout — Álbum seleccionable + Portada de bienvenida animada

> Bitácora de sesión puntual (rama `portada-y-album`). El conocimiento durable de CÓMO se hace esto vive en `docs/GUIA_TECNICA_PLANTILLAS.md` secciones 8-9 — este archivo es solo el checkpoint de QUÉ falta y en qué estado quedó cada familia. Se actualiza a medida que se avanza.

## 🔴 ESTADO ACTUAL — leer esto primero si se retoma en otra sesión

**Rama**: `portada-y-album`, pusheada a `origin` (último commit `0f4712a` al momento de escribir esto — confirmar con `git log origin/portada-y-album -1` que no haya nada más nuevo).

**Terminado y verificado, no tocar de nuevo salvo que se reporte un bug**:
- Infraestructura completa (schema, componentes compartidos, paso de wizard, fixes de wizard) — ver checklist abajo.
- **Moderno**: base + 7 variantes de color. Álbum + portada animada + mobile-only + transición de salida, todo verificado en el navegador.
- **Live preview del wizard**: el freeze después de "Álbum" y el salto exagerado al fondo de la página — los dos arreglados y verificados con el flujo completo. Documentado en `GUIA_TECNICA_PLANTILLAS.md` sección 9.

**Próximo paso exacto (nada más empezar acá)**:
1. Terminar de verificar **Chic** (wiring ya hecho, ver detalle completo en la sección "PARA RETOMAR ACÁ — Chic" más abajo): falta confirmar la transición de salida al abrir la portada, y falta propagar a sus 6 variantes de color.
2. Invitación de prueba lista para usar: slug `chic-test-1786819949098` (`/i/chic-test-1786819949098`), ya tiene fotos reales cargadas en ambos campos de portada.
3. Después de Chic: seguir con el resto de las 20 familias, en el orden y con los colores/efecto ya relevados en la tabla de más abajo (sección "Tabla de familias").

**⚠️ Al terminar TODO el rollout (las 21 familias, no antes)**: pasar una revisión completa de `docs/GUIA_TECNICA_PLANTILLAS.md` secciones 8-9 y actualizarla con cualquier matiz nuevo que haya aparecido en el camino y todavía no esté documentado (nuevas trampas por familia, ajustes al criterio de `effect`/tinte de la sección 8.4, correcciones a la tabla de familias claras/oscuras de la 8.3, etc. — cualquier cosa aprendida familia por familia que no sea específica de una sola sino que la próxima plantilla nueva también pueda pisar). Este archivo (`PLAN_ALBUM_PORTADA.md`) es la bitácora de sesión y se puede borrar/archivar después de eso; la guía técnica es lo que queda. Ver también el ítem 5 del checklist de la sección "Orden de trabajo sugerido" más abajo.

**Si algo de esto ya no es cierto** (por ejemplo, si esta sesión avanzó a otra familia y no actualizó este bloque): confiar en el estado real del código (`git log`, `git diff`) por sobre lo que dice este archivo, y actualizar este bloque antes de seguir.

---

## Bug encontrado y resuelto — live preview del wizard "se congelaba" después de Álbum

No era un bug de Álbum en sí: `WizardLivePreview.tsx` manda `postMessage({type:"wizard-scroll-to", section})` en cada paso, y `preview-plantilla/page.tsx` busca `document.getElementById(section)` para scrollear. Las secciones `music` (Música está deshabilitada a propósito en el preview, para no pisar el reproductor real -- `musicaHabilitada: false` hardcodeado) y `banco`/`quiz` (dependen de toggles que pueden estar apagados en la invitación de prueba) **nunca existen en el DOM del preview** -- el handler se quedaba esperando ese elemento para siempre, y el preview quedaba visualmente clavado en la última sección que sí encontró. Como Álbum ahora es el paso justo anterior a Música, se volvió mucho más notorio (antes "Galería" ya tenía el mismo problema, solo que menos visible).

**Fix v1 en `src/app/preview-plantilla/page.tsx`**: si a los 700ms el elemento buscado sigue sin aparecer, se hace scroll al final de la página (`document.body.scrollHeight`) en vez de no moverse. Esto arregló el freeze, pero generó un problema nuevo: en pasos DEL MEDIO del wizard con sección vacía (ej. "Cronograma" sin etapas cargadas) saltaba directo al final de TODA la invitación en vez de quedarse cerca — se sentía como "se rompió", no como "avanzó".

**Fix v2 (el que quedó)**: en vez de saltar directo al final, se agregó `SECTION_ORDER` (mismo orden que aparecen los pasos: hero→countdown→quote→details→schedule→album→music→banco→quiz) y el fallback busca la PRÓXIMA sección real que exista siguiendo ese orden -- recién si no queda ninguna más adelante (ej. llegando a Trivia con Música/Regalo/Trivia todas apagadas) cae al final de la página. Un contador (`scrollFallbackToken`) invalida el fallback si llega un `wizard-scroll-to` más nuevo antes de los 700ms.

**⚠️ Nota para quien siga debuggeando esto**: hay DOS `<iframe>` de preview montados en simultáneo en el wizard -- uno visible (el panel de escritorio) y uno oculto/colapsado (`WizardMobilePreviewSheet.tsx`, 0×0 hasta que se abre en mobile). `document.querySelector('iframe')` agarra el primero que encuentre, no necesariamente el visible -- para inspeccionar/debuggear el real, filtrar por `offsetParent !== null`. Esto costó bastante tiempo de diagnóstico en esta sesión (resultados que parecían inconsistentes entre pruebas eran en realidad dos iframes distintos con estados de scroll independientes).

Verificado con el flujo completo del wizard (Portada → ... → Detalles → Cronograma vacío → Álbum → Música → Regalo (CBU) → Trivia, todas sin datos) sobre el iframe VISIBLE — Cronograma cae en Álbum (la próxima real), y recién Trivia (nada más adelante) cae al final de la página. El preview ya no se queda clavado ni pega saltos grandes de más.

## Hecho (infraestructura, no depende de plantilla)

- [x] `Invitation.albumStyle` en el schema de Prisma (`carrusel` | `solapadas`), migrado a la DB de dev.
- [x] `Album.tsx` (switch de álbum) y `AnimatedCoverPhoto.tsx` (foto animada + tinte + 4 efectos + `COVER_EXIT_STYLE` + `COVER_RESPONSIVE_STYLE`) en `src/components/invitation/v2/`.
- [x] `AlbumPolaroidCascade.tsx` (estilo "solapadas", tope 4 fotos).
- [x] Paso de wizard `StepAlbumStyle.tsx`, agregado después de "Galería".
- [x] `StepHeroImages.tsx`: copy corregido ("Portada Invitación" / "Portada de bienvenida"), botón de sacar foto (`ImageUploader.onRemove`), aspect ratio 4/5 en ambos campos (antes desalineados por usar aspect ratios distintos).
- [x] `ImageUploader.tsx`: prop `onRemove` opcional (no rompe otros usos que no lo pasan).

## ⚠️ Regla de diseño confirmada a mitad de sesión (aplicar retroactivamente a Moderno si hace falta revisar, y a todo lo que sigue)

El tinte de color **no va en todas las familias** — confirmado por el usuario:
- **Paleta clara/pastel** (Elegant, Editorial, Seda, Chic...): sin tinte, `tint={false}` en `AnimatedCoverPhoto`. Solo blur/enfoque (o + shimmer, sin tinte).
- **Paleta más cargada/saturada** (Moderno, Onix...): blur + shimmer + tinte, u otra combo con tinte. Moderno ya está así, no hace falta tocarlo.
- **Alocadas/extravagantes** (Neon, Holograma, Circuito...): blur + tinte + `effect="flash"`.

`AnimatedCoverPhoto.tsx` ya soporta esto (`tintColor1`/`tintColor2` opcionales + prop `tint?: boolean`). Ver sección 8.1 de la guía técnica, actualizada.

## PARA RETOMAR ACÁ — Chic base (`ChicTemplate.tsx`) casi terminado, quedó en esto exacto

**Invitación de prueba ya creada en la DB de dev**: slug `chic-test-1786819949098` (CASAMIENTO, Ana & Tomas, `portadaImagenFondoDesktop` y `portadaImagenFondo` ya cargados con fotos reales de `/uploads/`). Usarla directo en `/i/chic-test-1786819949098` para seguir verificando, no hace falta crear otra.

- [x] Wiring completo: imports, `Album`, estado `isClosingCover`/`openInvitation`, variables (`portadaImagenFondoDesktopRaw`, `portadaFondoAnimado`), JSX de portada (`acp-mobile-only`/`acp-desktop-only`), botón `onClick={openInvitation}`, `<style>{COVER_EXIT_STYLE}{COVER_RESPONSIVE_STYLE}</style>`.
- [x] `effect="enfoque"`, `tint={false}` (paleta clara/pastel, regla de arriba), `scrimColorRgb="36,30,18"` (rgb de su tinta oscura `#241E12`, no de su fondo claro).
- [x] **Bug real encontrado y corregido en vivo** (no solo en el código, se vio roto en el navegador): la primera versión forzaba el texto de la portada (nombre/dress code) a color claro con un `color` inline calculado en JS a partir de `portadaFondoAnimado` — eso lo dejaba claro TAMBIÉN en desktop (donde la foto está oculta por CSS pero el JS no lo sabe), texto claro invisible sobre el mesh crema claro de siempre. **Corregido**: se sacó el `color` inline y se pasó a clases CSS con media query propia por plantilla (`.chic-cover-text` / `.chic-cover-text-muted`, definidas en el `<style jsx>` de Chic — claro por default, oscuro a partir de `768px`, mismo breakpoint que `COVER_RESPONSIVE_STYLE`). **Esta trampa nueva ya está documentada en la sección 8.3 de la guía técnica — leerla antes de tocar la próxima familia de tema claro, para no repetirla.**
- [x] Verificado en el navegador, desktop (1536px real): texto oscuro `rgb(36,30,18)` confirmado por `getComputedStyle`, sin foto (correcto).
- [ ] **Falta verificar mobile con captura real** — el `resize_window` del navegador no tomó efecto en esta sesión (quedó fijo en ~1536px pese al llamado exitoso), no se pudo sacar screenshot angosto. La regla base de `.chic-cover-text` (sin media query, `color: #FBF3EA`) está confirmada por lectura de código y es el mismo mecanismo ya probado con capturas reales angostas en Moderno — alta confianza, pero **no fue una verificación visual real, confirmarla apenas se pueda** (probar `resize_window` de nuevo, o F12 device toolbar a mano, o simplemente abrir `/i/chic-test-1786819949098` desde un celular real).
- [ ] Abrir la portada a mano (click en "ABRIR INVITACIÓN") y confirmar la transición de salida — no se llegó a probar en Chic (sí está probada en Moderno, mismo mecanismo).
- [ ] Variantes de color de Chic (6: revisar cuáles son con `ls src/components/templates/ChicTemplate*.tsx`) — **no propagadas todavía**. Cuando se haga, ojo: replicar TAMBIÉN las clases `.chic-cover-text`/`.chic-cover-text-muted` (con los hex propios de cada variante, no copiar los de la base a ciegas) además del wiring de imports/Album/AnimatedCoverPhoto — son 3 cosas a propagar, no 2.
- [ ] Después de Chic: seguir con el resto de la tabla de abajo, en el orden sugerido (ya no hace falta "resolver arquitectura CSS-vars", eso se cerró esta sesión).

## Hecho y verificado — Moderno (referencia)

- [x] `ModernoTemplate.tsx` (base) + 7 variantes de color (Azul, Bordo, Gris, Negro, Purpura, Rojo, Verde) — álbum + portada animada + mobile-only + transición de salida.
- [x] Verificado en `/draft-moderno/[slug]` con foto real, en el navegador, mobile y responsive.
- [x] Verificado que cambiar `albumStyle` en la DB cambia el render real.
- [x] `?heroBlur=1&coverTint=1&tintColor1=...&tintColor2=...` era SOLO un override del Lab de pruebas (`src/app/draft-moderno-lab/`, `ModernoTemplateLab.tsx`) — no existe en real, el trigger real es tener `portadaImagenFondoDesktop` cargado. El Lab sigue en el repo, sin linkear, por si hace falta seguir prototipando ahí.

## Hallazgos que cambian el plan para las 21 familias restantes

1. **Las 22 familias (`TemplateTipo` en `template-preview-registry.tsx`) comparten la misma estructura de variables** (`isCoverOpen`, `heroBgMobile`, `AlbumCarousel photos={allPhotos} hideHeader`, etc.) — el wiring mecánico de la sección 8.3 de la guía aplica a todas.
2. **⚠️ Dos arquitecturas de color distintas conviven en el repo**:
   - **Hardcoded hex** (Moderno, Chic, Cine, Circuito, Corporate, Cristal3D, Editorial, Elegant, GardenParty, GoldenDusk, Holograma, Infantil, LoftIndustrial, Neon, Nordico, Onix, Riviera, BonVoyage): el JSX tiene `backgroundColor: '#HEX'` literal. Wiring directo, igual que Moderno.
   - **CSS custom properties** (LuzLuna, Petalos, Seda — probablemente la tanda "18 plantillas de `imple-masiva`" mencionada en la sección 7 de la guía): el JSX tiene `backgroundColor: 'var(--t-bg)'`, acento en `var(--t-acc)`. Para estas hay que resolver el hex real donde se DEFINE la variable (buscar el wrapper raíz que setea `--t-bg`/`--t-acc` inline) antes de poder pasarle `scrimColorRgb`/`tintColor1`/`tintColor2` a `AnimatedCoverPhoto` (que espera valores literales, no acepta `var()` anidado sin que la familia ya tenga una variante `-rgb` de esas variables, que hay que confirmar si existe).
3. **⚠️ ~10 de las 21 son de tema claro** (fondo claro, texto oscuro) — el texto de la portada necesita forzarse a un color claro cuando hay foto animada, si no queda ilegible sobre el scrim oscuro. Documentado en la guía, sección 8.3. Confirmado por archivo con `bg:` en la tabla de abajo; "?" = no confirmado todavía.
4. **El acento "de marca" de una familia puede no ser constante entre sus variantes de color** (pasó en Moderno con el esmeralda) — no asumir, revisar cada variante al propagar.

## Tabla de familias — colores relevados, tier propuesto, estado

Efecto según personalidad (criterio del asistente, sección 8.1 de la guía — **ajustar al verlo en vivo, no es definitivo hasta que se confirme visualmente**):

| Familia | Arquitectura | Tema | Acento principal | Acento 2° / bg | Efecto propuesto | Estado |
|---|---|---|---|---|---|---|
| **Moderno** | hex | oscuro | `#C9A876` | `#3E7A6A` (solo base) | `enfoque` | ✅ hecho y verificado |
| BonVoyage | hex | claro (`#F4F9FB`) | `#2E7EA6` (azul océano) | `#1B3A5C` | `enfoque` | pendiente |
| Chic | hex | claro (`#FBF3EA`) | `#C9A876` (dorado) | `#241E12` | `enfoque` | pendiente |
| Cine | hex | oscuro (`#17130F`) | `#C08A3E` (ámbar cálido) | `#9C8F7A` | `enfoque` o `shimmer` (grano/flicker de cine, ver nota) | pendiente |
| Circuito | hex | oscuro (`#08080A`) | `#39FFD0` / `#FF2E9B` (cian/magenta neón) | — | `flash` | pendiente |
| Corporate | hex | oscuro (`#10131C`) | `#5C8DFF` (azul corporativo) | `#171B27` | `geometric` | pendiente |
| Cristal3D | hex | oscuro (`#0A0E16`) | `#8FD3FF` / `#B9A6FF` (cian/violeta glass) | — | `flash` o `shimmer` | pendiente |
| Editorial | hex | claro (`#EDEBE5`) | `#A3123B` (vino editorial) | `#17140F` | `geometric` (tipografía/editorial = sobrio) | pendiente |
| Elegant | hex | claro (`#F9F7F1`) | `#C79A4B` (dorado clásico) | `#1A2B33` | `enfoque` | pendiente |
| GardenParty | hex | claro (`#FBF4EC`) | `#D97757` (terracota festivo) | `#3A2A22` | `shimmer` | pendiente |
| GoldenDusk | hex | claro (`#FDF6F0`) | `#C8956C` (atardecer) | `#3B2A2A` | `shimmer` | pendiente |
| Holograma | hex | oscuro (`#0D0D14`) | `#A78BFA` / `#22D3EE` (violeta/cian iridiscente) | — | `flash` | pendiente |
| Infantil | hex | claro (`#FFF7F2`) | `#FF5C8A` / `#9B7FE8` (rosa/violeta) | — | `flash` (juguetón) o `bounce` si se prioriza el rebote sobre el flash | pendiente |
| JardinSeda | hex | claro (`#FCEFF1`) | `#B79FC4` (lavanda jardín) | `#3A2E33` | `shimmer` | pendiente |
| LoftIndustrial | hex | oscuro (`#121212`) | `#E0B84B` (ámbar industrial) | `#1C1C1C` | `geometric` | pendiente |
| LuzLuna | CSS vars (`--t-acc`/`--t-bg`, valores literales, mismo wiring) | oscuro (`--t-bg: #171425`) | `--t-acc: #B9A6D9` (lavanda luna) | — | `shimmer` | pendiente |
| Neon | hex | oscuro (`#0D0D10`) | `#39FFD0` / `#FF2E9B` | — | `flash` | pendiente |
| Nordico | hex | claro (`#FFFFFF`) | neutros (`#111111`/`#5B5850`, sin acento de color fuerte) | — | `geometric` | pendiente |
| Onix | hex | oscuro (`#140B14`) | `#D89AA0` (rosa piedra preciosa) | `#B9A6B4` | `enfoque` o `shimmer` | pendiente |
| Petalos | CSS vars | **claro** (`--t-bg: #FFF1EF` — corregido, el relevo por frecuencia de hex se equivocó acá) | `--t-acc: #E23B4E` (rojo flor) | — | `shimmer` | pendiente |
| Riviera | hex | claro (`#FAF1E4`) | `#C1734A` (terracota mediterráneo) | `#3E2E20` | `enfoque` | pendiente |
| Seda | CSS vars | **claro** (`--t-bg: #FBF3EE` — corregido, mismo motivo) | `--t-acc: #C9A0A6` (rosa seda) | — | `enfoque` | pendiente |

**Nota Cine**: no hay un 5° `effect` de "grano/flicker de cine" implementado todavía en `AnimatedCoverPhoto.tsx` (los 4 que existen son `enfoque`/`shimmer`/`flash`/`geometric`, pensados para bodas/XV/eventos, no específicamente para Cine). Al llegar a esta familia, decidir si `enfoque` alcanza o si vale la pena sumar un 5° efecto (grano de película, ya prototipado y descartado en el Lab de Moderno por pedido del usuario en otro contexto — podría tener más sentido temático acá).

## Orden de trabajo sugerido

1. ~~Resolver arquitectura CSS-vars (LuzLuna, Petalos, Seda)~~ — resuelto: son valores hex literales asignados a `--t-acc`/`--t-bg` inline, mismo wiring que las familias hex, solo cambia de dónde se lee el color. No hace falta un patrón de wiring distinto en la guía.
2. Una familia de **tema claro** primero (Chic) para probar en vivo la solución de texto claro-sobre-foto (sección 8.3 de la guía) antes de repetirla en las otras ~10.
3. Resto de las familias de tema oscuro (son las más parecidas a Moderno, más rápidas).
4. Auditoría final: `grep -c "acp-mobile-only" src/components/templates/*Template*.tsx` — tiene que dar 1+ en las 132 archivos de familias reales (todo excepto `ConviteTemplate.tsx`, `DraftTemplate.tsx`, `CollaborativeAlbumModern.tsx`, que no son parte de `TemplateTipo` y no se tocan).
5. **Última tarea, recién con las 21 familias ya terminadas**: releer `docs/GUIA_TECNICA_PLANTILLAS.md` secciones 8-9 completas y actualizarlas con todos los matices/trampas nuevos que hayan aparecido familia por familia durante el rollout (ver el aviso en el bloque "ESTADO ACTUAL" arriba de este archivo). No hacerlo a mitad de camino, en una sola pasada al final — así la guía queda consistente en vez de parcheada de a poco.
