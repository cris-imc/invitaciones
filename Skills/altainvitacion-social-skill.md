---
name: altainvitacion-social
description: Genera contenido para Instagram de altainvitacion.com — devuelve PASO 1 (prompt Gemini para foto de fondo) + PASO 2 (prompt Gemini para mockup con captura adjunta) + caption + hashtags. Activar cuando el usuario pida un post, contenido para redes, o publicación de Instagram para la marca.
---

# altainvitacion.com — Skill de Contenido para Instagram

---

## IDENTIDAD DE MARCA

**Nombre en texto:** altainvitacion.com (siempre minúscula, con .com)
**Mercado:** Argentina
**Público:** Novias/novios organizando su boda, mamás organizando quince años, personas que organizan eventos sociales — 25-45 años, mayoría mujeres.
**Tono de voz:** Emocional y sobrio. Cálido sin ser cursi. Directo sin ser frío. Sin signos de admiración apilados. Sin emojis de corazones. Habla de igual a igual.

**Diferenciadores (rotar, nunca repetir todos en un post):**
- Confirmaciones centralizadas, no por WhatsApp
- Gestor de pagos tipo libreta, sin comisiones
- Modo LIVE: fotos y mensajes en tiempo real durante la fiesta
- Pago único por evento, sin suscripciones
- Todo en un solo link

---

## SISTEMA DE DISEÑO — REGLAS INAMOVIBLES

Estas reglas se incluyen en TODOS los prompts de Gemini, sin excepción. Son la columna vertebral visual de la marca en Instagram. Gemini no puede ignorarlas ni reinterpretarlas.

### Paleta Instagram (tono claro — diferente al shell oscuro de la web)

| Token | Hex | Uso |
|---|---|---|
| `paper` | `#F6F3EC` | Fondo principal de posts claros |
| `paper-2` | `#EAE4D4` | Fondo secundario, capas sutiles |
| `gold` | `#C79A4B` | Acento principal, textos destacados, detalles |
| `sage` | `#5C8A7A` | Acento secundario, elementos de apoyo |
| `ink` | `#0F1613` | Texto principal sobre fondos claros |
| `ink-2` | `#182420` | Texto secundario, sombras suaves |

### Tipografía

| Rol | Fuente | Uso |
|---|---|---|
| Display / Títulos | **Fraunces** (serif, variable) | Headlines del post, frases de marca |
| UI / Subtítulos | **Space Grotesk** (sans) | Subtítulos, etiquetas, CTA pequeño |
| Cuerpo | **Inter** | Texto de apoyo, si aplica |

**Jerarquía tipográfica en el post:**
- Headline: Fraunces, grande, peso light o regular (nunca bold en display)
- Subtítulo o dato: Space Grotesk, pequeño, peso medium
- Marca: altainvitacion.com en Space Grotesk, muy pequeño, color gold o ink-2

### Composición

- **Márgenes:** generosos, nunca texto pegado al borde
- **Isologo:** esquina superior izquierda, siempre — salvo que el usuario indique otra posición
- **Texto en imagen:** mínimo e intencional. Nunca más de 2 líneas de headline + 1 línea de subtítulo. El caption hace el trabajo de comunicar, no la imagen.
- **Estilo general:** limpio, con aire, que parezca editorial de revista — no banner publicitario

### Lo que el sistema NUNCA permite

- Fondos degradados de colores saturados
- Tipografías decorativas o scripts floridos (las tipografías elegantes son las del sistema)
- Texto en múltiples colores dentro del mismo post
- Más de 3 elementos de texto sobre la imagen
- Bordes, marcos decorativos, stickers o elementos de clipart
- Composiciones simétricas y centradas al 100% — siempre algo fuera del centro crea tensión visual
- Colores fuera de la paleta definida

---

## CÓMO USAR ESTE SKILL

### Input que el usuario pasa

```
TIPO_POST: [marca / funcionalidad / plantilla / educativo / promocion / testimonio / temporada / pregunta / comparacion / detras_de_escena / fecha_especial / repost_cliente]
EVENTO: [boda / xv / cumpleaños / general]
FOCO: qué querés comunicar o destacar
ENCUADRE: [primer plano / plano medio / ambiental / detalle / detalle humano / flat lay] — OPCIONAL, si no se especifica Gemini decide según el tipo de post.
  - detalle: close-up de objeto sin personas (anillo, flores, sobre, champagne, etc.)
  - detalle humano: close-up de mano, rostro, expresión o gesto — sin mostrar el cuerpo completo
TEXTO_POSICION: [arriba / abajo / centrado / mínimo] — OPCIONAL, si no se especifica Gemini decide
DATO_EXTRA: cualquier detalle puntual — nombre de plantilla, promoción, cita de cliente, fecha, etc. — OPCIONAL
CON_PLANTILLA: [sí / no] — ¿este post muestra una pantalla con la invitación? Si es sí, adjuntá la captura en el PASO 2.
CON_TEXTO: [sí / no] — OPCIONAL, default no. Si sí, el PASO 2 incluye headline y subtítulo sobre la imagen.
TEMA: [claro / oscuro] — OPCIONAL, default claro. Usar oscuro para quiebres visuales con la paleta de la web.
```

---

## OUTPUT — ESTRUCTURA OBLIGATORIA EN 4 BLOQUES

---

### BLOQUE 1: PASO 1 — PROMPT GPT IMAGE / GEMINI (foto de fondo)

Siempre en inglés. Genera la escena de fondo. Si `CON_PLANTILLA: sí`, la escena debe incluir un celular con pantalla en negro o en blanco — ese es el hueco donde irá la plantilla en el paso 2. Si `CON_PLANTILLA: no`, no hay celular necesariamente.

**Estructura del prompt:**

```
SCENE: [descripción específica de la escena — qué se ve, dónde ocurre]
SUBJECT: [descripción física concreta y particular del sujeto si hay uno — nunca "beautiful woman"]
LIGHTING: [tipo de iluminación cinematográfica]
FRAMING: [encuadre según ENCUADRE del input, o decisión propia si no se especificó]
STYLE: [estilo fotográfico editorial]
PALETTE: [según TEMA del input:
  - claro (default): warm ivory #F6F3EC, champagne, sage greens #5C8A7A, gold accents #C79A4B, soft natural light — nunca colores saturados
  - oscuro: deep forest green #0F1613 backgrounds, gold #C79A4B accents, ivory #F6F3EC text, dramatic low-key lighting, rich shadows — estética de la web]
EXCLUDE: [no text overlays, no graphic elements, no obvious AI artifacts, no stock photo poses]
QUALITY: [shot on 35mm, editorial quality — referenciar revista o fotógrafo si aplica]
LOGO SPACE: leave upper left corner with clean, uncluttered space for logo placement
PHONE SCREEN: [solo si CON_PLANTILLA: sí] include a smartphone held naturally, screen facing camera, screen completely black/off — no reflections on screen
```

**Ejemplo para TIPO_POST: marca / CON_PLANTILLA: no / EVENTO: boda:**

> SCENE: A round wooden table near a tall window, late afternoon. A half-full champagne glass, an open envelope, a few dried flower petals scattered. Nobody in frame.
> LIGHTING: Golden hour light coming through sheer linen curtains, warm and soft.
> FRAMING: Overhead flat lay, slightly off-center composition.
> STYLE: Fine art wedding editorial, still life photography.
> PALETTE: Warm ivory surface, champagne glass, sage green dried flowers, gold tones in the light. No cold colors.
> EXCLUDE: No text, no phone, no graphic overlays, no stock-looking props, no obvious AI artifacts.
> QUALITY: Shot on 35mm film, Kinfolk magazine aesthetic, Gentl & Hyers influence.
> LOGO SPACE: Upper left corner clean and slightly darker for logo placement.

**Ejemplo para TIPO_POST: plantilla / CON_PLANTILLA: sí / ENCUADRE: plano medio:**

> SCENE: A woman in her early thirties sitting at a café table, holding a smartphone with both hands, looking at the screen with a calm smile.
> SUBJECT: Dark curly hair, natural makeup, wearing a simple cream linen blouse.
> LIGHTING: Soft diffused window light from the left, warm and even.
> FRAMING: Medium shot, subject slightly off-center to the right, negative space on the left.
> STYLE: Lifestyle editorial photography, authentic and unposed.
> PALETTE: Warm ivory and sage tones in background, champagne light, gold accents in jewelry.
> EXCLUDE: No text overlays, no graphic elements, no stock photo poses, no obvious AI artifacts.
> QUALITY: Shot on 85mm f/1.8, editorial quality, Artifact Uprising aesthetic.
> LOGO SPACE: Upper left corner kept clean and bright for logo placement.
> PHONE SCREEN: The smartphone screen must be completely black/off, facing the camera at a slight natural angle, no reflections.

---

### BLOQUE 2: PASO 2 — PROMPT GEMINI (logo + texto + mockup)

**Aparece siempre.** El usuario adjunta siempre el PNG del isologo. Si `CON_PLANTILLA: sí`, adjunta además la captura de la invitación. Si `CON_TEXTO: sí`, se incluyen las instrucciones de texto.

Siempre en inglés.

**Estructura fija:**

```
Working on the photo from Step 1:

— LOGO (always):
LOGO: place the attached logo PNG in the upper left corner. Scale it to approximately 15% of the image width. Respect its transparency. Do not alter its colors or proportions. No text or other elements overlap the logo.

— MOCKUP DE PANTALLA (solo si CON_PLANTILLA: sí):
Take the attached screenshot and insert it into the smartphone screen in the photo.
Match the perspective and angle of the phone exactly.
Apply the same lighting and color grading of the photo to the screen — [describir la iluminación del paso 1 brevemente].
The screen should look naturally lit, not like a flat paste. Add very subtle screen glow if it helps realism.

— TEXTO (solo si CON_TEXTO: sí):
HEADLINE: [gancho del caption, derivado del FOCO del input — en Fraunces, light weight, large size]
SUBTITLE: [dato secundario si aplica según DATO_EXTRA — en Space Grotesk, medium weight, small size. Omitir si no hay dato relevante.]
TEXT POSITION: [según TEXTO_POSICION del input — top / bottom / centered / minimal. Si no se especificó, decidir según la composición: donde haya más espacio limpio sin tapar el sujeto.]
TEXT COLOR: [según TEMA:
  - claro (default): #0F1613 (ink) sobre zonas claras, #F6F3EC (paper) sobre zonas oscuras
  - oscuro: #F6F3EC (paper) para headline, #C79A4B (gold) para brand name — siempre]

— SIEMPRE:
MARGINS: generous on all sides, nothing touches the edges.
MAX TEXT ELEMENTS: headline + subtitle (optional) + brand name. Never more than 3 text elements total.
NO decorative borders, frames, or graphic overlays of any kind.
Do not change anything in the photo beyond what is described above.
```

---

### BLOQUE 3: CAPTION

**Estructura fija:**

**Línea 1 (gancho):** Frase que detiene el scroll. Máximo 10 palabras. No empieza con "¿Sabías que...". Puede ser pregunta, afirmación inesperada, o verdad incómoda del mundo de los eventos.

**Cuerpo (2-4 líneas):** Beneficio real, no feature técnica. No dice "nuestra plataforma". Dice lo que resuelve en la vida del usuario. Tono según el tipo de post.

**Cierre + CTA:** Una línea natural. Nunca "¡No esperes más!". Opciones: "El link está en bio.", "Empezá gratis en altainvitacion.com", o pregunta que invite a comentar.

**Reglas:** Línea en blanco entre secciones. Máximo 1-2 emojis y solo si agregan algo. Nunca signos de admiración apilados.

---

### BLOQUE 4: HASHTAGS

20-25 hashtags. Mix obligatorio:

- **5-6 nicho AR:** #bodasargentina #invitacionesdigitales #quinceaños #15años #bodas2026 #casamientoargentino
- **4-5 comunidad:** #novias #organizaciondeeventos #boda #quinceañera #novia2026
- **4-5 locales** (adaptar si el usuario especifica zona): #córdoba #buenosaires #argentina #eventosargentina
- **3-4 producto:** #invitaciondigital #RSVPonline #altainvitacion
- **3-4 alcance:** #wedding #weddingplanning #eventplanning #weddingseason

---

## TIPOS DE POST — GUÍA POR CATEGORÍA

### MARCA
Presencia pura. Imagen de alto impacto, copy de marca. Sin vender nada específico.
- `CON_PLANTILLA` generalmente: no
- Imagen: escena elegante y emotiva, sin pantallas
- Caption: frase de marca, sin CTA de venta directa
- Input ejemplo: `TIPO_POST: marca / EVENTO: boda / FOCO: la emoción de celebrar`
- Gancho ejemplo: *"Hay fechas que no se olvidan."*

### FUNCIONALIDAD
Una sola feature por post. Nunca listar todo.
- `CON_PLANTILLA` generalmente: no (la situación importa más que la pantalla)
- Imagen: la situación que resuelve (caos vs calma)
- Caption: antes/después emocional
- Input ejemplo: `TIPO_POST: funcionalidad / EVENTO: boda / FOCO: confirmaciones sin WhatsApp`
- Gancho ejemplo: *"Nunca más 'che, ¿confirmaste?' por WhatsApp."*

### PLANTILLA
Mostrar una plantilla específica. No decir "nueva plantilla disponible" como gancho.
- `CON_PLANTILLA` generalmente: sí — el usuario adjunta captura
- Imagen: mano con celular mostrando la invitación, fondo acorde al estilo de esa plantilla
- Caption: arranca por la emoción del estilo, no por las specs
- Input ejemplo: `TIPO_POST: plantilla / EVENTO: xv / FOCO: plantilla Elegant / DATO_EXTRA: colores rosa y dorado / CON_PLANTILLA: sí`
- Gancho ejemplo: *"Romántica, tuya, lista para compartir."*

### EDUCATIVO
Enseñar algo útil. La marca aparece al final, no al principio.
- `CON_PLANTILLA` generalmente: no
- Caption: valor primero, altainvitacion.com al final y natural
- Input ejemplo: `TIPO_POST: educativo / EVENTO: boda / FOCO: cuándo mandar las invitaciones`
- Gancho ejemplo: *"La mayoría manda las invitaciones demasiado tarde."*
- Temas posibles: cuándo mandar invitaciones, cómo gestionar mesa de regalos, qué datos no pueden faltar, diferencia entre RSVP y confirmación por WhatsApp

### PROMOCION
El único tipo donde el copy puede ser directo y orientado a conversión.
- `CON_PLANTILLA` generalmente: no — imagen de marca elegante, no banner de oferta
- Caption: beneficio antes que precio. Nunca poner precios en pesos — redirigir a la web.
- Input ejemplo: `TIPO_POST: promocion / FOCO: plan Diamond / DATO_EXTRA: 20% OFF`
- Gancho ejemplo: *"Todo lo que necesitás para tu boda. Un solo pago."*

### TESTIMONIO
Solo con clientes reales. Nunca inventar ni parafrasear.
- `CON_PLANTILLA` generalmente: opcional — foto real del evento si hay permiso
- Caption: citar brevemente en cursiva, ampliar con lo que lo hizo posible
- Input ejemplo: `TIPO_POST: testimonio / EVENTO: xv / DATO_EXTRA: "fue lo más lindo de la noche, todos subían fotos"`
- Gancho ejemplo: la cita real del cliente entre comillas

### TEMPORADA
Solo cuando aplica naturalmente. Nunca forzado.
- Temporadas clave AR: bodas nov-mar, día enamorados 14 feb, día madre tercer domingo oct, fin de año
- Input ejemplo: `TIPO_POST: temporada / EVENTO: boda / FOCO: inicio temporada / DATO_EXTRA: noviembre`
- Gancho ejemplo: *"La temporada de bodas ya arrancó."*

### PREGUNTA
Genera conversación y engagement. Construye comunidad.
- `CON_PLANTILLA` generalmente: no
- Caption: la pregunta es el centro, el producto puede no aparecer
- Input ejemplo: `TIPO_POST: pregunta / EVENTO: boda / FOCO: decisiones de casamiento`
- Gancho ejemplo: *"¿Iglesia o civil? Respondé en los comentarios."*
- Temas: cantidad de invitados, mesa dulce vs torta, viaje vs regalo, open bar sí o no

### COMPARACION
Antes/después. Sin nombrar competidores.
- `CON_PLANTILLA` generalmente: no
- Imagen: contraste entre caos y calma
- Input ejemplo: `TIPO_POST: comparacion / FOCO: WhatsApp vs panel de confirmaciones`
- Gancho ejemplo: *"Antes: 47 mensajes sin leer. Ahora: un panel con todo."*

### DETRAS_DE_ESCENA
Humaniza la marca. El proceso sin que parezca tutorial.
- `CON_PLANTILLA` generalmente: sí — captura del wizard o del panel
- Caption: primera persona, tono cercano
- Input ejemplo: `TIPO_POST: detras_de_escena / FOCO: el wizard de creación / CON_PLANTILLA: sí`
- Gancho ejemplo: *"Así se crea una invitación en menos de 10 minutos."*

### FECHA_ESPECIAL
Estar presente en fechas emotivas. Sin vender directamente.
- `CON_PLANTILLA` generalmente: no
- Caption: emotivo, breve, humano
- Input ejemplo: `TIPO_POST: fecha_especial / FOCO: día de los enamorados`
- Gancho ejemplo: *"Para los que este año celebran juntos por primera vez."*

### REPOST_CLIENTE
Contenido original del cliente. Diferente al testimonio escrito.
- `CON_PLANTILLA` generalmente: sí — la captura o foto del cliente
- Caption: agradecer sin ser corporativo, contar el evento
- Input ejemplo: `TIPO_POST: repost_cliente / EVENTO: boda / DATO_EXTRA: boda en Córdoba, 150 invitados`
- Gancho ejemplo: *"Cuando el link llega y la emoción también."*

---

## LO QUE ESTE SKILL NUNCA HACE

- Genera captions con signos de admiración múltiples
- Usa "¡No te lo pierdas!", "¡Aprovechá!", "¡Contactanos ya!"
- Lista todas las funciones de la plataforma en un solo post
- Sugiere colores, tipografías o estilos fuera del sistema de diseño definido
- Menciona precios en pesos (se desactualizan — redirigir a la web)
- Genera personas genéricas tipo stock — siempre escenas específicas y particulares
- Inventa o parafrasea testimonios de clientes
- Pone más de 3 elementos de texto sobre la imagen
- Usa fondos degradados saturados o tipografías decorativas floridas
