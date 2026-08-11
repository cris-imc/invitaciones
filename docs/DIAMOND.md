Trabajá en una rama nueva llamada "DIAMOND" (git checkout -b DIAMOND desde main). Antes de escribir una sola línea de código, creá el archivo docs/plan-diamond.md con el plan de implementación completo detallado por secciones y checkpoints. Cada vez que completes un checkpoint, marcalo con [x] en ese archivo y hacé commit del plan actualizado. Si la sesión se cierra, ese archivo es el punto de retoma.

El archivo docs/plan-diamond.md debe tener esta estructura inicial:

# Plan DIAMOND
## Estado: En progreso
## Rama: DIAMOND

### Checkpoints
- [ ] 1. Modelo de datos: membresías y créditos
- [ ] 2. Actualizar lógica de membresías (Free / Premium / Diamond / Enterprise)
- [ ] 3. Landing page: sección de precios actualizada
- [ ] 4. Landing page: opción Contacto → WhatsApp
- [ ] 5. Registro: rediseño de cards de membresía con UX mejorado
- [ ] 6. Panel admin: gestión de membresías y créditos por cliente
- [ ] 7. Panel cliente: créditos remanentes en pantalla de inicio
- [ ] 8. App mobile: botón Ayuda → WhatsApp en topbar
- [ ] 9. App desktop: opción Ayuda en sidebar
- [ ] 10. Revisión y checklist final


---

CONTEXTO DEL PROYECTO
Repositorio: https://github.com/cris-imc/invitaciones
Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, Shadcn UI, Prisma, PostgreSQL
Sistema de diseño: tokens en globals.css (--ink #0F1613, --accent #C79A4B, --font-display Fraunces, etc.)
Referencia visual: invitaciones/mockup/alta-invitacion-mockup-v2.html


---

CHECKPOINT 1 — Modelo de datos

Revisar el schema de Prisma actual para entender cómo están modeladas las membresías hoy.

Actualizar o crear los campos necesarios para soportar:
— Tipo de membresía por usuario: FREE, PREMIUM, DIAMOND, ENTERPRISE.
— Créditos premium disponibles por usuario (int, default 0).
— Créditos diamond disponibles por usuario (int, default 0).

Si el campo de membresía ya existe con otros valores, hacer una migración additive (no destructiva): agregar DIAMOND y ENTERPRISE al enum sin eliminar los existentes.

Generar y aplicar la migración con nombre descriptivo: add_diamond_membership_and_credits.

No modificar ninguna otra parte del schema.


---

CHECKPOINT 2 — Lógica de membresías

Definir claramente qué habilita cada membresía. Implementar o actualizar la función/helper que verifica features por plan:

FREE
— Igual que hoy. No cambiar ningún bloqueo existente.

PREMIUM — $50.000
— Todo habilitado EXCEPTO la función LIVE (proyección de fotos en vivo durante el evento).
— La función LIVE debe quedar bloqueada y mostrar un mensaje que indique que es exclusiva del plan Diamond.

DIAMOND — $90.000 (precio real), mostrar con 20% de descuento aplicado = $72.000, marcado como recomendado
— Todo habilitado sin excepciones, incluyendo la función LIVE.

ENTERPRISE
— No tiene precio fijo ni flujo de registro propio.
— Solo se menciona en la landing como opción para pedidos especiales (diseño de plantilla a medida para empresa/cliente).
— No linkear a registro ni a ningún flujo de pago.
— Si un usuario tiene membresía ENTERPRISE en base de datos, tiene todo habilitado (tratarlo igual que DIAMOND en cuanto a features).

Actualizar todos los puntos del código donde se verifica el plan del usuario para incluir DIAMOND y ajustar PREMIUM según lo anterior. Buscar con grep o equivalente todos los usos del campo de membresía antes de modificar.


---

CHECKPOINT 3 — Landing page: sección de precios

Actualizar la sección de precios de la landing (/) conservando el diseño y estilo actuales. Mostrar cuatro cards en este orden:

Card 1 — Gratis
— Precio: $0
— Features: las mismas que hoy.
— CTA: "Crear cuenta gratis" → /register.

Card 2 — Premium
— Precio: $50.000
— Features: todo habilitado excepto LIVE. Mencionar explícitamente "Sin función Live" con ícono o nota aclaratoria.
— CTA: "Elegir Premium" → /register?plan=premium.

Card 3 — Diamond ⭐ RECOMENDADO
— Precio tachado: $90.000 → Precio con descuento: $72.000 (20% OFF).
— Badge visible "Recomendado" o "Más popular".
— Features: todo incluido, función LIVE habilitada.
— CTA: "Elegir Diamond" → /register?plan=diamond.
— Destacar visualmente esta card sobre las demás (borde dorado, fondo ligeramente diferente, usar --accent).

Card 4 — Enterprise
— Sin precio fijo. Texto: "Precio a consultar".
— Descripción: para empresas o clientes que necesiten un diseño de plantilla a medida.
— CTA: "Consultar" → link directo a WhatsApp +5493517660000 con mensaje predefinido: "Hola, me interesa el plan Enterprise de Alta Invitación".
— No linkear a /register.

Diseño: las cuatro cards deben verse equilibradas, sin compactarse. En mobile apilar verticalmente. En desktop grilla de 4 columnas o 2x2 según el espacio disponible.


---

CHECKPOINT 4 — Landing page: opción Contacto

Agregar en el nav de la landing una opción "Contacto" que abra WhatsApp en una nueva pestaña:
URL: https://wa.me/5493517660000?text=Hola%2C%20me%20comunico%20desde%20Alta%20Invitaci%C3%B3n

Ubicación: en el menú de navegación existente junto a los otros links (Plantillas, Cómo funciona, Precios).
En mobile: dentro del drawer/hamburger existente.
No modificar ningún otro elemento del nav.


---

CHECKPOINT 5 — Registro: rediseño de cards de membresía con UX mejorado

Actualmente el registro muestra dos cards compactadas. Rediseñar esta pantalla así:

Paso 1 — Elegir plan
Mostrar tres cards seleccionables (Free, Premium, Diamond). Enterprise no aparece aquí.
— Las cards deben ser espaciosas, legibles y claramente distinguibles.
— La card Diamond debe estar pre-seleccionada o visualmente destacada como recomendada.
— El usuario hace clic en una card para seleccionarla (estado activo visual claro: borde dorado, checkmark).
— Un botón "Continuar" debajo de las cards avanza al paso 2.
— Si el usuario llegó desde la landing con ?plan=premium o ?plan=diamond, pre-seleccionar esa card automáticamente.

Paso 2 — Formulario de registro
El mismo formulario de registro que existe hoy (nombre, email, contraseña, etc.).
— Mostrar en la parte superior un resumen del plan elegido (nombre + precio) para que el usuario confirme antes de completar el form.
— El botón final de submit dice "Crear cuenta" (no mencionar nada de pago ni Mercado Pago).
— Al hacer submit, crear la cuenta con el plan seleccionado guardado en base de datos.

No cambiar ningún campo del formulario existente, solo agregar el paso previo de selección de plan y el resumen superior.


---

CHECKPOINT 6 — Panel admin: gestión de membresías y créditos

En la vista de administración (la que usa la cuenta admin del sistema), agregar o actualizar la sección de usuarios/clientes para mostrar:

Por cada cliente:
— Membresía actual (FREE / PREMIUM / DIAMOND / ENTERPRISE) con posibilidad de cambiarla mediante un selector/dropdown. El cambio debe persistir en base de datos inmediatamente.
— Créditos premium disponibles: número editable (input numérico) con botón "Guardar".
— Créditos diamond disponibles: ídem anterior.

Si ya existe una tabla o listado de clientes en el panel admin, agregar estas columnas/campos ahí. Si no existe, crear una sección "Clientes" en el panel admin con un listado que muestre nombre, email, membresía actual y créditos, con las acciones de edición descritas.

No modificar ninguna otra funcionalidad del panel admin.


---

CHECKPOINT 7 — Panel cliente: créditos remanentes

En la pantalla de inicio del dashboard del cliente (/dashboard), mostrar los créditos disponibles del usuario logueado:

— Si el usuario tiene créditos premium > 0: mostrar "X créditos Premium disponibles".
— Si el usuario tiene créditos diamond > 0: mostrar "X créditos Diamond disponibles".
— Si no tiene créditos: no mostrar nada (no ocupar espacio con ceros).

Ubicación: dentro del área principal del dashboard, cerca de la parte superior, sin reemplazar ni desplazar ningún elemento existente. Puede ser una línea discreta en Space Mono o un pequeño badge, siguiendo los tokens del sistema.


---

CHECKPOINT 8 — App mobile: botón Ayuda → WhatsApp en topbar

En la barra superior de la app (mobile), en el extremo opuesto al logo:
— Agregar un ícono de WhatsApp (SVG oficial o equivalente) en color dorado (--accent).
— Al lado del ícono el texto "Ayuda" en Space Mono o Space Grotesk, tamaño pequeño.
— Al tocar, abrir en nueva pestaña: https://wa.me/5493517660000?text=Hola%2C%20necesito%20ayuda%20con%20Alta%20Invitaci%C3%B3n

No desplazar ni modificar el logo ni ningún otro elemento de la topbar. Si el espacio es justo, el texto "Ayuda" puede omitirse y dejar solo el ícono con un aria-label="Ayuda".


---

CHECKPOINT 9 — App desktop: opción Ayuda en sidebar

En el sidebar izquierdo del dashboard (desktop), agregar un ítem de navegación "Ayuda" al final de la lista de opciones, antes del footer del sidebar donde aparece el usuario.
— Solo el texto "Ayuda" con el ícono que ya usan los otros ítems del nav (usar b tag con signo de interrogación o ícono existente en el sistema).
— Al hacer clic, abrir en nueva pestaña: https://wa.me/5493517660000?text=Hola%2C%20necesito%20ayuda%20con%20Alta%20Invitaci%C3%B3n
— No agregar el ícono de WhatsApp en desktop, solo el texto/ícono del sistema.


---

CHECKPOINT 10 — Revisión y checklist final

Antes del commit final corré el siguiente checklist:

□ Las cuatro membresías existen en el schema y la lógica de features es correcta por cada una.
□ LIVE bloqueado en Premium, habilitado en Diamond y Enterprise.
□ Landing: cuatro cards de precio con diseño equilibrado, Contacto en nav.
□ Registro: flujo de dos pasos funciona, pre-selección por query param funciona.
□ Panel admin: cambio de membresía y edición de créditos persisten correctamente.
□ Panel cliente: créditos se muestran solo si son > 0.
□ Mobile topbar: ícono/botón Ayuda visible y funcional.
□ Desktop sidebar: ítem Ayuda visible y funcional.
□ Ninguna funcionalidad existente fue rota o modificada.
□ Ningún precio, link de pago ni mención a Mercado Pago aparece en ninguna pantalla.
□ Todos los tokens usados provienen de globals.css.
□ El archivo docs/plan-diamond.md tiene todos los checkpoints marcados con [x].
□ Hacer commit final con mensaje: "feat: membresía DIAMOND completa - rama DIAMOND".