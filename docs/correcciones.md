En la rama "rediseño-completo", aplicá las siguientes correcciones. No modificar nada fuera de lo especificado.

CORRECCIÓN 1 — Preview reactiva del wizard
La miniatura que se muestra en el wizard (desktop: columna derecha; mobile: debajo del panel) debe reflejar la invitación real que se está editando, no un mockup estático. Implementar lo siguiente:
— Leer el estado actual del wizard (store/contexto existente) y renderizar la preview con los datos reales: nombre del evento, fecha, lugar, look/plantilla seleccionada, tipografía elegida.
— La preview debe actualizarse reactivamente a medida que el usuario modifica cualquier campo, sin necesidad de avanzar al siguiente paso.
— La pantalla de bienvenida (splash con botón "Entrar") no necesita mostrarse en la miniatura del wizard; mostrar directamente la vista de portada/hero de la invitación.
— En desktop la preview ocupa la columna derecha fija (como está). En mobile ver corrección 4.

CORRECCIÓN 2 — Tipografía elegida aplicada correctamente + dos niveles + más opciones
La tipografía seleccionada en el wizard debe aplicarse realmente en la invitación pública. Ampliar el sistema así:

2a. Aplicar tipografía de títulos en:
— El nombre del homenajeado/novios/quinceañera/empresa en el hero de la invitación.
— El nombre del invitado en la pantalla de bienvenida (donde aparece el botón "Abrir invitación").

2b. Separar en dos niveles de tipografía seleccionables independientemente:
— Nivel 1 "Títulos": para nombres principales y headings grandes. Puede ser manuscrita, con caligrafía o alto contraste — prioriza estética sobre legibilidad en texto corrido.
— Nivel 2 "Texto": para subtítulos de sección (en bold), botones como "Abrir invitación", textos largos y cuerpo general. Debe priorizar legibilidad; evitar fuentes muy manuscritas o decorativas.

2c. Ampliar el catálogo de opciones en cada nivel. Sugerencia de distribución:
— Títulos (mínimo 6 opciones): Fraunces, Fraunces Italic, Cormorant Garamond Italic, Dancing Script, Playfair Display, Great Vibes.
— Texto (mínimo 5 opciones): Space Grotesk, Inter, Merriweather, Lora, DM Sans.
— Mostrar cada opción con un preview del nombre del evento en esa fuente, dentro de la grilla 2×2 existente (paginada o con scroll si hay más opciones).
— Importar desde Google Fonts las fuentes que no estén cargadas aún.
— Persistir ambas selecciones en el modelo de la invitación (dos campos separados: fontTitle y fontBody, o reutilizar estructura de config existente).
— Aplicar ambas variables como CSS custom properties en el wrapper de la invitación pública.

CORRECCIÓN 3 — Paso de estilos de countdown
Agregar un paso en el wizard dedicado a elegir el estilo visual del countdown. Implementar lo siguiente:
— Mostrar mínimo 4 opciones en grilla 2×2 con preview visual de cómo se verá el countdown (usando los días/horas/minutos/segundos reales del estado del wizard si ya existe la fecha, o valores de ejemplo si no):
  · Clásico: bloques con número grande en Space Mono sobre fondo papel-2, label debajo.
  · Minimalista: solo el número de días restantes en una línea, sin cajas.
  · Cápsulas: dígitos en píldoras del color del acento de la plantilla elegida.
  · Flip/Separado: cada unidad en una tarjeta con separador de dos puntos entre ellas.
— La selección debe guardarse en el modelo (campo countdownStyle o dentro del config existente).
— Aplicar el estilo elegido en la invitación pública donde se renderiza el countdown.
— Colocar este paso después del paso de tipografía y antes del paso de contenido/datos del evento.

CORRECCIÓN 4 — Preview en mobile: revelar miniatura con gesto de scroll
En la vista mobile del wizard, la miniatura de la invitación actualmente no se ve. Implementar lo siguiente:
— El panel inferior (bottom sheet) debe mostrar un borde superior ligeramente visible de la miniatura por debajo, dando señal visual de que hay contenido debajo (peek de aproximadamente 60-80px).
— Al hacer swipe hacia abajo sobre el handle del bottom sheet, el panel se desplaza hacia abajo revelando la miniatura completa de la invitación.
— Al hacer swipe hacia arriba, el panel vuelve a su posición original cubriendo la miniatura.
— La miniatura en mobile debe ser reactiva igual que en desktop (corrección 1).
— Implementar con CSS transform + touch events o con la librería de gestos que ya esté en el proyecto; no agregar dependencias nuevas si se puede evitar.

CORRECCIÓN 5 — Inputs desalineados en el wizard
Revisar todos los pasos del wizard y corregir inputs, labels y campos de texto que hayan quedado visualmente desalineados tras el rediseño. Criterios:
— Labels siempre en Space Mono uppercase, alineados al borde izquierdo del input correspondiente.
— Inputs con padding, border-radius y border consistentes con los tokens del sistema (--r-s, --line, fondo rgba(246,243,236,.06)).
— En mobile, inputs de ancho 100% sin desborde lateral.
— En desktop, inputs que comparten fila deben tener la misma altura de línea base.
— No cambiar el tipo ni el comportamiento de ningún input, solo su apariencia visual.

RESTRICCIONES GENERALES
— Todo el trabajo va en la rama "rediseño-completo". No tocar main.
— No modificar lógica de backend, API routes ni schema Prisma salvo agregar los campos fontTitle, fontBody y countdownStyle si no existen (migración incluida).
— No agregar ni quitar funcionalidades más allá de lo especificado en estas 5 correcciones.
— Usar exclusivamente los tokens de globals.css; no hardcodear colores ni tamaños.
— Al terminar, correr el checklist de revisión punto por punto definido anteriormente antes de hacer commit.