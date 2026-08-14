# Prompt para tu agente de programación — instalar "ModernoTemplate"

Copiá y pegale esto tal cual a tu agente (Cursor/Claude Code/etc.), con `ModernoTemplate.tsx` ya copiado dentro de `src/components/templates/`:

---

Quiero instalar una nueva plantilla de invitación llamada **Moderno** en el proyecto. Ya coloqué el archivo `src/components/templates/ModernoTemplate.tsx` — es una copia funcional de `DraftTemplate.tsx` (misma interfaz de props `ModernoTemplateProps`, mismos componentes reutilizados: `AlbumCarousel`, `DraftCountdown as CountdownV2`, `RSVPWizardV2`, `PaymentBadge`, `SongSuggestion`, `SectionWrapper`, `BottomNavPill`, `TypewriterText`, `AnimatedSynonyms`, `MusicPlayer`) con la lógica de datos intacta. Solo cambia la paleta de colores a grafito (`#0F0E13`) + dorado champagne (`#C9A876`) + acento esmeralda, pensada para verse elegante y moderna.

Hacé esto, en este orden:

1. **Tipografía** — el archivo usa los mismos CSS vars que ya existen en el proyecto: `var(--font-cormorant)` para títulos y `var(--font-inter)` / `var(--font-sans)` para texto. Para que el look de "Moderno" se vea como está pensado (serif itálica elegante + sans-serif geométrica), agregá dos Google Fonts nuevas en el layout raíz (`app/layout.tsx` o donde ya se cargan las fuentes actuales) **sin tocar los nombres de los vars existentes**, sino haciendo que las nuevas fuentes usen esos mismos vars SOLO cuando el tema activo sea `moderno`:
   - `Fraunces` (pesos 400-500, con italic) → alias a `--font-cormorant`
   - `Sora` (pesos 400-600) → alias a `--font-inter` y `--font-sans`
   
   Si el proyecto ya resuelve la fuente por tema (`data-theme="moderno"` en el contenedor raíz — este template ya setea `data-theme={theme}` igual que el resto), preferí condicionar el font-family a ese atributo con CSS en vez de duplicar el layout de Next/font. Si no hay ese mecanismo, decime cómo cargan fuentes hoy (`next/font/google` vs `<link>`) antes de tocar nada, para no romper las otras plantillas que comparten esos mismos vars.

2. **Registrar la plantilla** — agregala donde estén registradas las demás (`src/lib/templatesConfig.ts` o equivalente): id `moderno`, mismo `category` que ya usa `DraftTemplate` (o el correspondiente a boda/15/evento — preguntame si no está claro), componente `ModernoTemplate`.

3. **Selector del wizard** — en el paso final "Elegí tu plantilla" agregala a la lista visible, con thumbnail/preview igual que las demás (no requiere props nuevas: usa los mismos campos de `invitation` que ya lee `DraftTemplate`).

4. **No tocar**: `RSVPWizardV2`, `CountdownV2`, `AlbumCarousel`, `SongSuggestion`, `ProgressiveQuiz`, `BankDetails`/`CopyField`/`InfoRow`, `BottomNavPill`, ni ningún campo del modelo `Invitation`/`Guest` — el archivo ya los usa exactamente igual que `DraftTemplate.tsx`, cero cambios de backend.

5. **Verificar** al final: abrir la plantilla con datos de prueba y confirmar que RSVP, quiz, álbum, banco (2 cuentas), música y countdown funcionan igual que en `DraftTemplate` — solo debería cambiar el look visual (colores/tipografía/bordes rectos en vez de redondeados).

---

**Portada de bienvenida**: ya viene resuelta dentro del propio `ModernoTemplate.tsx` (no requiere pasos extra) — el mesh dorado/esmeralda animado, el glow pulsante y el sello son un `<div>` con `style` inline + un bloque `<style jsx>{...}</style>` con los `@keyframes moderno-meshDrift` / `moderno-glowPulse`, embebidos junto al overlay `{!isCoverOpen && (...)}`. Si el proyecto es Next.js (lo más probable dado el resto del código), `styled-jsx` ya viene incluido y no hay que instalar nada. Si NO usan Next.js, avisame para pasar esos keyframes a un CSS global en vez de `<style jsx>`.

## Especificación visual completa (referencia rápida para tu agente)

**Tipografía**
- Display (títulos, nombre, cifras countdown): **Fraunces**, itálica, pesos 400–500 → alias a `var(--font-cormorant)`.
- Texto (cuerpo, labels, botones): **Sora**, pesos 400–600 → alias a `var(--font-inter)` / `var(--font-sans)`.
- Mono (fechas, horarios, alias bancarios, cifras de countdown en algunos layouts): **Space Mono** 400/700.

**Paleta**
- Fondo principal: `#0F0E13` (grafito profundo) / variante `#15131B`.
- Tarjetas/superficies: `#1C1926`.
- Texto principal: `#EDE9F4`.
- Texto secundario: `#9B92AF`.
- Acento dorado (botones, líneas, cifras, bordes): `#C9A876` (hover `#E0BF8F`).
- Acento esmeralda (fondos de sección alternos, frase/quiz): `#3E7A6A`.
- Bordes: rectos, 0–4px de radio (nunca `rounded-full`/`rounded-2xl` salvo el sello circular y los botones de RSVP).

**Efectos y animación (todos ya están en `ModernoTemplate.tsx`, verificar que no se pierdan al fusionar con el resto del código):**
1. **Portada de bienvenida**: mesh de fondo animado (`@keyframes moderno-meshDrift`, radial-gradient dorado + esmeralda, 14s), glow orb dorado pulsante detrás del nombre (`moderno-glowPulse`, 5s), sello circular con el monograma (♥/✦/●), botón con borde dorado y vidrio esmerilado (`backdrop-filter: blur(6px)`).
2. **Hero (título Mili & Gastón)**: línea dorada que se expande de 0 a 40px al entrar (`moderno-lineExpand`, 1.2s ease-out) debajo del título, tanto en la versión mobile como en la aside de escritorio.
3. **Countdown**: tarjetas con borde dorado sutil (`rgba(201,168,118,.18)`), cifra en Fraunces itálica.
4. **Frase/quote**: fondo con gradiente esmeralda sutil (`linear-gradient(160deg, #3E7A6A14, transparent 70%)`) sobre la tarjeta.
5. **Álbum**: fotos con `filter: saturate(.94) contrast(1.03)` para un grading fotográfico levemente desaturado y contrastado (no fotos "crudas").
6. **RSVP / Banco / Quiz**: tarjetas con borde dorado fino (`rgba(201,168,118,.15-.3)`), sin sombras suaves difusas — el look es plano y de vidrio, no "cards flotantes" con blur excesivo.
7. **Nav inferior (mobile)**: pill flotante con `backdrop-filter: blur(10px)` y fondo semitransparente oscuro, borde dorado fino.

Si tu agente reconstruye alguna sección desde cero en vez de reusar el archivo tal cual, esta lista es el checklist para no perder ningún detalle estético del diseño aprobado.
