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

## Reportados, pendientes

- [ ] **Confirmar en el iPhone** que el video ya no abre la invitación, y que el
  switch de tema quedó arriba a la derecha en escritorio y al lado de Ayuda
  en mobile.

- [ ] **Wizard, elegir fecha en mobile:** abre un calendario dibujado en HTML.
  Debería abrir el selector nativo del celular.

- [ ] **Wizard, elegir hora:** se ve raro en PC y en mobile. Debería arrancar
  cerca de las 21 y moverse de 5 en 5 minutos.

- [ ] **Las plantillas Storytelling no se probaron** desde que existen.

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
