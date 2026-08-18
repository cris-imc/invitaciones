# Cómo pedir una nueva plantilla de invitación (guía + contrato)

## Cómo usar esto
1. Escribime en una sola frase/párrafo lo que querés (ver ejemplos abajo).
2. Yo tomo tu input + este archivo y armo el prompt final, listo para pegar en Claude (u otro modelo). Vos no tocás corchetes ni completás nada — eso lo hago yo a partir de tu descripción.

**Ejemplos de input tuyo (así de simple):**
- "Quiero una de 15 años, estilo boho desértico, colores terracota y salvia, tipografía más redondeada"
- "Una de casamiento oscura y lujosa, mármol negro con dorado, ambiente de gala nocturna"
- "Cumpleaños de adulto, urbano/graffiti, colores flúo sobre negro"

Con eso alcanza. Yo interpreto paleta, tipografía y qué ilustraciones (doodles) van en cada uno de los 10 puntos fijos de la plantilla.

---

## Lo que NO cambia nunca (arquitectura rígida)
Esto es la base técnica de **todas** las plantillas de este pack. No es negociable porque así se garantiza que después se pueda instalar en el sistema real sin romper nada: (mas que nada tomar en cuenta Doodle Wedding standalone.html)

1. **Estado**: `{ device:'mobile'|'desktop', opened:boolean, votes:{}, scrollY:0 }` — un solo componente, nunca dos archivos.
2. **Toggle Celular/Escritorio**: 2 botones arriba que solo cambian `state.device`.
3. **`buildStyles(isDesktop, scrollY)`**: todos los estilos son objetos JS (no hojas de CSS aparte), cada propiedad clave condicionada `isDesktop ? X : Y`.
4. **Mobile**: portada de bienvenida a pantalla completa (`showSplash`) con nombre del invitado + botón "Abrir invitación" → pasa a `contentVisible`.
5. **Desktop**: grid `440px 1fr` — columna izquierda fija con foto + texto + nav numerada (01, 02...), columna derecha con scroll de todas las secciones.
6. **Parallax**: la foto de portada se mueve con el scroll (`translateY` proporcional a `scrollY`).
7. **Doodles**: siempre SVG inline dibujado a mano (paths/circles/ellipses), nunca imágenes PNG/JPG de ícono. Con animación sutil de flote/titileo.
8. **Nav inferior mobile**: pill flotante una vez abierta la tarjeta.
9. **Las 9 secciones y su orden**: Portada → Countdown → Frase → Detalles del evento (direcciones+cronograma) → Álbum → Mapa → RSVP → Datos bancarios/regalo → Sugerí una canción → Footer. No se agregan ni quitan secciones, no se reordenan.
10. **Los 10 slots de doodle son fijos en cantidad y posición** (aunque el dibujo que va en cada uno cambia libremente): 2 en portada, marco de foto (2 esquinas), 2 saliendo del marco, 1 ícono por sección, 1 divisor de countdown, 1 en RSVP, 1 en regalo, 1 en footer.

## Lo que SÍ es 100% creativo (podés pedir lo que quieras)
- **Paleta de colores** (fondo, fondo alterno, texto, texto suave, 2 acentos).
- **Tipografías** (una de display/títulos + una de texto, ambas Google Fonts).
- **Qué dibuja cada uno de los 10 doodles** (mientras respete el slot: ej. "el ícono de la sección Mapa" puede ser un pin, un cactus, una brújula — lo que pida el estilo).
- **Textos** (kicker de portada, dress code, título de RSVP, frase, footer) — siempre en español, tono acorde al evento.
- **Nombre del estilo/paleta** (para identificarlo).
- Tipo de evento: 15 años, casamiento, cumpleaños adulto, corporativo — cualquiera, la arquitectura es la misma para todos.

## Qué es "lo que espero de vos" (usuario)
- Una descripción breve del estilo/mood/paleta que imaginás (no necesitás saber de diseño ni de código).
- Si tenés fotos propias de referencia (moodboard), adjuntalas — ayuda pero no es obligatorio.

## Qué es "lo que esperás de mí" (yo, al generar el prompt)
- Traduzco tu descripción a: paleta hex concreta, pareja de tipografías, y una lista explícita de qué va en cada uno de los 10 slots de doodle.
- Entrego **dos prompts**:
  1. **Prompt para ChatGPT Image** (para generar el moodboard) — basado en tu input original, con la paleta, mood y motivos de ilustración ya traducidos a instrucciones visuales concretas.
  2. **Prompt para Claude design** — el mismo de siempre, respetando punto por punto la arquitectura rígida de arriba, pero que ahora incluye una línea explícita aclarando que se le va a adjuntar un moodboard (el que generaste con el prompt #1) como referencia visual principal para paleta, tipografía y estilo de ilustración.
- Flujo: primero pegás el prompt #1 en ChatGPT Image y generás el moodboard → después pegás el prompt #2 en Claude design junto con esa imagen adjunta.
