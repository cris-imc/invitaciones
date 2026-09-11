# Pendientes

En el orden en que él los fue reportando. Se tacha lo hecho, no se borra:
así queda el registro de qué se verificó y cómo.

---

## Reportados, hechos — falta que él los confirme en su celular

- [x] **El video de la landing abría una invitación.** Pasaba sólo en el
  iPhone, no en la simulación de Chrome. Causa: con `preload="none"` el video
  no sabe su tamaño hasta que carga; al tocar play el elemento cambia de alto,
  el contenido se corre, y el click que iOS sintetiza después del toque cae
  donde quedó el link "Ver una invitación real" — que en producción es una
  invitación Cine Abstracto. Arreglado reservando el espacio con
  `aspect-ratio` (720/1080 el vertical, 1080/720 el horizontal, medidos de los
  posters) y separando el link 96px en mobile.

- [x] **Los datos de transferencia no cambiaban de país.** Abrías España,
  cambiabas a México y seguía mostrando España. Eran dos bugs encadenados: los
  datos se pedían una sola vez y no se volvían a pedir, y `/api/cobro`
  resolvía el país por sesión o cookie — no sabía cuál elegiste en el
  formulario. Ahora el país viaja en la consulta y se recarga al cambiarlo.

- [x] **El banner "Creada gratis" ilegible en modo claro.** Tenía
  `background: var(--ink)` con el texto crema fijo; en claro `--ink` es el
  crema del panel.

- [x] **El tema no debe afectar a las plantillas ni al post evento.**
  Resuelto de raíz y no pieza por pieza: las rutas que ve el invitado llevan
  `data-invitado`, que devuelve los tokens base a sus valores oscuros para
  todo el subárbol. Cualquier componente nuevo que use `--ink` queda bien sin
  tener que acordarse. De paso se arregló el fondo del hero sin foto de
  portada, que afectaba a 164 plantillas.

---

## Hechos en esta vuelta

- [x] **Logos oficiales de pago.** `public/marcas/paypal.svg` (SVG de
  paypalobjects.com) y `mercadopago.png` (el de la barra de
  mercadopago.com.ar). Van sobre una pastilla blanca: los dos son azul
  oscuro y sueltos sobre el fondo oscuro no se leen.

- [x] **Contraste en claro al pegar la lista y en las mesas.** Colores
  escritos a mano (`bg-black/25`, `border-white/10`) reemplazados por
  tokens. Silla vacía y tablero del plano tenían blanco fijo: ahora hay un
  token propio, `--silla-vacia`.

- [x] **"Flia" y el número sin coma.** `Flia`/`Flia.`/`Fam.` se escriben
  "Familia", y `Flia Gómez 5` entra como grupo de 5 en vez de como un
  invitado llamado "Flia Gómez 5". `Los 3 Chiflados` sigue siendo un nombre.

- [x] **La previsualización ya no es un chorizo.** El resumen va arriba y la
  tabla muestra sólo lo que tiene error o aviso, más un asomo del resto.

- [x] **Ejemplo de lista, y la carga masiva entera, en modal.** La tarjeta
  de invitados es una columna angosta: los nombres salían cortados y cada
  fila se partía en tres renglones.

- [x] **El campo de hora del wizard.** En escritorio es una lista de 288
  horas de cinco en cinco: 21:03 no se puede elegir porque no existe.
  `step` solo no alcanzaba, se podía tipear igual. En el celular sigue la
  rueda del sistema. El reloj negro era el ícono del navegador sin
  `color-scheme`: se le puso `campo-nativo`, y se sacó el reloj duplicado.

- [x] **El switch de tema y el botón de la cabecera.** Ya no se encinan (la
  cabecera deja 64px) y quedaron a la misma altura: el que bajó es el
  switch, medido en pantalla.

---

## Reportados, pendientes

- [ ] **El teléfono del registro está pensado para Argentina.** Hoy son dos
  campos fijos, "Cód. área" y "Número", con el prefijo del país puesto al
  margen (ver img/telefono.jpg). Tiene que salir del país elegido: el código
  de país se pone solo, y lo del medio cambia de nombre y de largo según el
  país -- no en todos lados existe un "código de área", y donde existe no se
  llama igual ni mide lo mismo.

- [x] **Post evento en las 177 Storytelling.** Hecho: ninguna lo tenía, la
  cuenta regresiva quedaba clavada en cero. Un solo componente
  (`PostEventoStorytelling`) al que cada plantilla le pasa su paleta, leída
  del código de cada variante. Verificado con una Crystal 3D vencida y una
  Guest Pass VIP futura.

- [ ] **Sección de bienvenida en las 177 Storytelling.** En curso. Hoy la
  invitación abre directo en "Save the Date" y no dice en ningún lado de
  quién es la fiesta. El mockup (`mockup/Guest Pass VIP - En accion.html`,
  sección `data-screen-label="Bienvenida"`) la pone primero, sin numerar, con:
  pase activado · tipo de evento · **los nombres** · fecha y lugar · un
  mensaje · nº de pase y cuántas personas. Las 36 familias tienen prefijo de
  clase propio (gpv-, c3d-, ifs-…) y el mismo andamiaje, así que la sección
  puede usar `${pref}-section` y `${pref}-kicker` y salir temática sola.
  Al ir SIN numerar no hay que renumerar los kickers existentes.

- [ ] **El importador ignora `upgradable`.** Si pegás 40 en una invitación
  Gratis entran 20 y el resto sale en rojo, cuando agregar uno solo de más sí
  ofrece pasar a Premium. Es el peor momento para no ofrecerlo.

 Las plantillas sí; lo
  que falta es cómo se ve el post evento en esa colección.

---

## De antes, sin reportar por él

- [ ] **Un pago real con su tarjeta, y devolvérselo.** Sandbox no prueba los
  medios de pago reales ni los límites de la cuenta. Es lo único que todavía
  puede fallar con plata de por medio.

- [ ] **Que alguien mire el modo claro con los ojos.** 580 archivos
  verificados con HTTP y `tsc`: eso agarra que nada explote, no que algo se
  vea feo.

- [ ] **Punto 15 del FODA:** elegir una sola promesa para el hero. El de mayor
  impacto y no cuesta código.

- [ ] Si alguna vez se prende `MULTIIDIOMA_HABILITADO`, antes hay que cerrar
  los 266 kickers de plantilla y el mensaje de WhatsApp, que siguen en
  español.
