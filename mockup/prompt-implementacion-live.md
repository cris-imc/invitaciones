# Prompt de implementación — Función LIVE (muro de fotos/audios con QR)

Pegar completo a tu agente de código. Complementa a `prompt-implementacion-rediseno.md` y `prompt-implementacion-contenido-real.md` — este prompt es específico para la función nueva **LIVE**, que vive fuera de la invitación pública pero dentro del mismo producto.

Adjuntar `convite-ux-propuesta.html` (pestaña **LIVE**) como referencia visual — ahí está resuelto el diseño y, sobre todo, el **comportamiento**: subir una foto o "grabar" un audio desde la vista *Subir* actualiza al instante el muro de la vista *Pantalla*, en la misma demo, sin backend. Esa reactividad es la que hay que lograr de verdad en producción (con datos reales, entre dos dispositivos distintos).

## 0. Qué es LIVE, en una línea

Durante la fiesta se proyecta una pantalla con un QR. Los invitados lo escanean con el celular, llegan a una página simple para subir fotos y mandar audios, y lo que suben aparece en la pantalla proyectada casi al instante. Es una función por evento, no por invitado — vive como una solapa nueva dentro del panel de administración de cada invitación.

## 1. Dónde vive en el producto

- Nueva solapa **LIVE** dentro de `/dashboard/invitaciones/[id]` (junto a las que ya existan: Resumen, Invitados, Pagos, Música, etc. — revisar el nombre real de esa ruta y de esas solapas en el repo, el mockup usa nombres ilustrativos).
- Dentro de esa solapa, tres sub-vistas (tal como en el mockup):
  1. **Pantalla** — lo que se proyecta durante la fiesta: QR + muro de fotos/audios en vivo. Esta es la vista que se abre en la notebook conectada al proyector.
  2. **Subir (mobile)** — la página a la que llega el invitado al escanear el QR. Es la prioritaria: el 100% del tráfico real entra por acá.
  3. **Subir (desktop)** — versión secundaria, por si alguien sube contenido desde una laptop en el evento.

Aclaración sobre el mockup: las vistas "Subir" duplicadas (mobile/desktop) dentro de la misma pantalla de demo son **solo para poder probar el flujo sin un celular**, porque el entorno de desarrollo corre en local. En producción no hace falta ese selector — cada visitante entra directamente a la versión que le corresponde según su dispositivo (mobile-first, con fallback responsive a desktop), no hay que pedirle que elija.

## 2. Flujo real, de punta a punta

1. El anfitrión (o quien maneje el evento) abre la solapa LIVE del evento y proyecta la vista **Pantalla**.
2. Esa vista muestra un QR que apunta a una URL pública tipo `convite.app/live/{slug-o-token-del-evento}` (no reutilizar el mismo slug/token de la invitación — usar uno propio de LIVE, ver sección 4, para no exponer ni mezclar datos de RSVP/pago con esta función).
3. Un invitado escanea con la cámara del celular → llega a la página de subida (mobile), sin necesidad de login ni de estar en la lista de invitados — cualquiera con el link puede subir (es una función social abierta a todos los presentes, no atada a la identidad del invitado).
4. Sube una foto o graba un audio corto.
5. El archivo se procesa y aparece en la vista **Pantalla** que está proyectada, en un lapso corto (definir el SLA — el mockup lo simula instantáneo porque es todo cliente; en producción con upload real + procesamiento, apuntar a que aparezca en segundos, no minutos).
6. El invitado ve una confirmación liviana ("ya se está mostrando en la pantalla") y puede seguir subiendo más contenido.

## 3. Actualización en tiempo real — cómo resolverlo

La vista Pantalla necesita reflejar contenido nuevo sin que alguien tenga que refrescar la página manualmente durante la fiesta. Opciones, de más a menos recomendada según la complejidad del stack actual:

1. **WebSockets / Server-Sent Events**: la vista Pantalla abre una conexión persistente y recibe cada nuevo ítem apenas se procesa. Es la opción más prolija para una pantalla que va a estar abierta varias horas seguidas.
2. **Polling corto** (cada 3-5 segundos, pedir "¿hay contenido nuevo desde el último ítem que tengo?"): más simple de implementar si el proyecto no tiene infraestructura de websockets, aceptable para este caso de uso porque no es una app de chat de alta frecuencia.

Elegir la opción según lo que ya tenga el stack (revisar si hay algo de tiempo real ya usado en otra parte del producto, como el contador de confirmaciones en vivo del dashboard — si existe, reutilizar el mismo mecanismo acá).

## 4. Modelo de datos y almacenamiento

- Entidad nueva, algo como `LiveSession` (uno por evento) con: `eventId`, `token` público (el que va en la URL del QR — generarlo random, no usar el `slug` de la invitación), `createdAt`, estado (activo/cerrado — el anfitrión debería poder "cerrar" el LIVE después del evento para que el QR deje de aceptar subidas).
- Entidad `LiveItem`: `sessionId`, `type` (`photo` | `audio`), `fileUrl`, `duration` (solo audio), `uploadedAt`, y opcionalmente `nombreInvitado` si se le pide (ver sección 6, es opcional).
- Los archivos van a almacenamiento de objetos (S3/Cloudinary/lo que ya use el proyecto para otros uploads — revisar si ya hay una integración de storage antes de agregar una nueva).
- **Moderación básica**: antes de mostrar un ítem en la pantalla pública/proyectada, contemplar al menos un filtro mínimo (tamaño máximo de archivo, tipos MIME permitidos). Si el producto ya tiene o va a tener moderación de contenido en otras partes (por ejemplo en las canciones sugeridas), evaluar si conviene el mismo criterio acá — es contenido que sube cualquier invitado sin login, así que no debería ir a la pantalla proyectada sin al menos una validación automática mínima.

## 5. Subida — mobile (prioritario)

Página standalone, liviana, sin necesitar que el invitado tenga cuenta ni esté logueado:

- Foto: usar `<input type="file" accept="image/*" capture="environment">` para que en mobile se pueda elegir directo "sacar foto" o "elegir de la galería".
- Audio: usar la Web Audio API / `MediaRecorder` para grabar directo desde el navegador (pedir permiso de micrófono con una explicación clara de para qué es, ya que se pide sin que el usuario esté logueado ni conozca el producto de antes). Definir una duración máxima razonable (ej. 30-60 segundos) para que no se suban archivos enormes ni mensajes eternos.
- Feedback inmediato: mostrar el archivo recién subido en un mini-feed en la misma página (igual que en el mockup) — esto le da al invitado la confirmación de que funcionó, sin que tenga que mirar la pantalla proyectada para saberlo.
- Sin login, pero si el producto quiere atribuir cada subida a alguien, contemplar un campo opcional de nombre (no obligatorio — no poner fricción a subir contenido en el momento de la fiesta).
- Performance: comprimir/redimensionar la imagen en el cliente antes de subir si el archivo es muy pesado (fotos de celu modernas pueden pesar varios MB — no hace falta esa resolución para una pantalla proyectada).

## 6. Subida — desktop (secundario)

Mismo flujo y mismo endpoint que mobile, con layout más ancho (dos columnas: acciones a la izquierda, feed en vivo a la derecha, como en el mockup). No es il foco principal — no invertir tiempo en features exclusivas de esta versión que no estén también en mobile.

## 7. Pantalla / proyector

- Vista pensada para quedar abierta varias horas en una notebook conectada a un proyector o TV — sin interacción del usuario durante ese tiempo, solo mostrando contenido nuevo a medida que entra.
- El QR tiene que ser grande y legible a distancia (la gente lo va a escanear desde varios metros, con poca luz en una fiesta) — probar el tamaño y contraste en condiciones reales, no solo en pantalla de escritorio.
- Layout del muro: grilla que vaya acomodando ítems nuevos (fotos y audios mezclados, como en el mockup), con una entrada visual suave para cada ítem nuevo (fade/scale, nada brusco).
- Si el volumen de contenido es alto, definir un límite de cuántos ítems se muestran a la vez (¿los últimos 40? ¿rotan?) para que la pantalla no quede sobrecargada — esto no está resuelto en el mockup, que muestra todo sin límite; decidirlo antes de llevarlo a producción.
- Los audios en la pantalla proyectada: **no deberían reproducirse solos** (sería un caos con varios a la vez en un evento con música). Mostrar el ítem visualmente (como en el mockup, con el ícono/waveform) pero sin autoplay — el sonido de audios queda para que el anfitrión los escuche después, no en vivo en la pantalla.

## 8. Seguridad y abuso

- El token de la sesión LIVE (el que va en la URL del QR) tiene que ser lo suficientemente largo/random como para no ser adivinable — es la única barrera de acceso, ya que conscientemente no hay login para el invitado.
- Rate limiting por IP/sesión para evitar que alguien suba contenido en loop (por accidente o mal intencionado).
- El anfitrión tiene que poder **eliminar un ítem individual** desde el panel de administración (LIVE, dentro de la solapa) si algo inapropiado llega a aparecer en la pantalla — esto es más importante que un sistema de moderación automática sofisticado: como mínimo, control manual instantáneo.
- El anfitrión tiene que poder **cerrar la sesión LIVE** (el QR deja de aceptar contenido nuevo) — típicamente al terminar el evento.

## 9. Entregables

1. Solapa LIVE dentro del admin de cada invitación, con las 3 vistas (Pantalla, Subir mobile, Subir desktop) fieles al mockup en diseño.
2. Generación de QR apuntando a un token propio de la sesión LIVE (no el slug de la invitación).
3. Upload de fotos y audios funcionando de punta a punta, con el mecanismo de actualización en tiempo real elegido en la sección 3.
4. Panel de moderación mínimo: ver todo lo subido, eliminar ítems individuales, cerrar la sesión LIVE.
5. Límite de tamaño/duración de archivos, y compresión de imágenes en el cliente antes de subir.
6. Confirmar con el resto del equipo, antes de dar por cerrado: SLA de "tiempo hasta que aparece en pantalla", límite de ítems visibles simultáneos, y si se pide o no nombre al invitado que sube contenido.
