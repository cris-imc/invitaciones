# Plan de internacionalización

Rama `internacional`, creada desde `main`. Nunca desde `mesas`: así no arrastra
trabajo que todavía no fue aprobado.

---

## La decisión que ordena todo

**Hay dos idiomas distintos, y confundirlos rompe el producto.**

1. **El idioma del anfitrión.** El del panel, el wizard y la landing. Es una
   preferencia suya. Se guarda en una cookie.

2. **El idioma de la invitación.** El que ven sus invitados. **No** es una
   preferencia de quien mira: una boda en São Paulo manda su convite en
   portugués aunque el invitado tenga el navegador en inglés, y si un tío
   argentino lo abre lo tiene que ver igual que todos. Se define al crear la
   invitación y viaja con ella.

**Por eso el idioma no va en la URL** (`/es/…`, `/en/…`). Además de partir el
sitio en tres, rompería todos los links de invitación ya enviados — que es lo
único de este producto que no se puede romper: están en el WhatsApp de cientos
de invitados y no hay forma de reenviarlos.

---

## Cuánto texto hay, de verdad

Medido sobre el código, no estimado:

| | archivos | apariciones | textos distintos |
|---|---|---|---|
| Plantillas | 365 | 7.576 | **111** |
| Panel | 45 | 251 | 223 |
| Wizard | 28 | 129 | 116 |
| Landing y páginas | 71 | 104 | 96 |
| Otros | 158 | 87 | 68 |

**592 textos distintos.** Contando atributos y placeholders que la medición no
alcanza, el techo real ronda los 1.500. Es un trabajo normal.

El dato que importa: las plantillas repiten 111 frases 7.576 veces. Se traducen
una vez y quedan las 365 traducidas.

---

## Orden de trabajo, y por qué ese orden

La traducción es **transversal**: toca todos los archivos. Toda función que se
agregue después de empezar la extracción llega en español y hay que traducirla
aparte. Por eso:

### Fase 1 — Cimientos ✅ hecho

Archivos nuevos, cero conflicto con lo que se esté construyendo en paralelo.

- `src/lib/i18n/idiomas.ts` — los tres idiomas, la cookie, y la detección por
  navegador (que sólo se usa la primera vez: después manda la elección de la
  persona, porque adivinar por encima de una elección explícita es de las cosas
  más molestas que puede hacer un sitio).
- `src/lib/i18n/diccionario.ts` — los textos. El español es la fuente de verdad
  y TypeScript obliga a que los otros idiomas tengan **todas** las claves: una
  traducción a medias es un texto en español en medio de una pantalla en
  inglés, que se ve peor que no traducir.
- `src/lib/i18n/texto.ts` — el traductor, con variables entre llaves. Con
  llaves y no concatenando, porque el orden de las palabras cambia entre
  idiomas: "Faltan 3 invitados" y "3 guests remaining" no ponen el número en el
  mismo lugar.
- `src/lib/paises.ts` — qué datos bancarios pide cada país.

Verificado ejecutándolo: los tres idiomas resuelven, las variables caen en el
lugar correcto de cada frase, y un navegador en francés cae a español.

### Fase 2 — Enchufar, sin traducir todavía

- Leer la cookie del idioma y repartirlo a toda la app.
- El selector ES / EN / PT.
- `Invitation.idioma` y `Invitation.pais` en la base.
- El wizard pregunta el país cuando se avanza en plan gratis.
- `StepBankDetails` se dibuja a partir de `paises.ts` en vez de tener ALIAS y
  CBU escritos a mano.

### Fase 3 — La extracción masiva

**Recién cuando las funciones nuevas estén cerradas.** Empezar por las
plantillas, que son 111 textos para 365 archivos: es donde más rinde cada
traducción.

---

## Modo claro y oscuro — hecho a medias, a propósito

Va en esta misma rama porque comparte el problema: un producto que se muestra a
gente de siete países no puede tener una sola manera de verse.

El modo claro quedó en **blancos cálidos y crema**: papel, no pantalla. El
dorado de la marca daba **2.32:1** sobre crema — ilegible —, así que se
oscureció manteniendo el matiz, bajando la luminosidad de 53% a 32%, y quedó en
**5.49:1**.

Contrastes verificados con la fórmula WCAG, recalculados de forma independiente
y coincidentes: texto principal 16.56:1, tarjetas 17.30:1, dorado 5.49:1,
salvia 6.09:1, rojo de error 5.80:1.

No hay destello del tema equivocado al cargar: un script bloqueante lee la
preferencia guardada y marca el elemento raíz antes de que React hidrate.

### Qué NO participa, y por qué

- Las **plantillas de invitación**: cada una tiene su paleta y el invitado la
  ve como la diseñó el anfitrión.
- El **hero de la landing**: su fondo animado de luces está armado para
  oscuro. Adaptarlo a claro es un trabajo de diseño, no agregar un
  interruptor. Queda oscuro en los dos temas.

### Lo que falta

**26 archivos con colores escritos a mano** (`bg-black`, `text-white/60`) que se
van a ver oscuros aunque el resto del panel esté en claro. Son sobre todo
pantallas de admin, perfil y FAQ. Unos 140 cambios que necesitan criterio uno
por uno, no un reemplazo mecánico.

El sidebar, la barra superior, las tarjetas de invitación, el panel
"Administrar" y la landing sí quedaron adaptados. **Antes de mostrar el
interruptor a un cliente hay que terminar esas 26 pantallas**, o va a encontrar
zonas oscuras sueltas.

---

## El país decide el método de pago

Esto salió al pensar la internacionalización y es lo más importante que queda
por definir:

- **Argentina:** Mercado Pago + transferencia (alias/CBU).
- **Estados Unidos:** ninguno de los dos aplica.
- **Resto:** sin definir.

**Lo que se sabe:** Mercado Pago opera en Argentina, Brasil, Chile, Colombia,
México, Perú y Uruguay. De la lista, sólo Estados Unidos queda afuera.

**RESPONDIDO (septiembre 2026, documentación oficial de Mercado Pago).**

Existe un producto que hace exactamente esto y se llama **Cross Border**:

> "cobrar de manera local pero retirar los fondos en una cuenta bancaria en otro país"

Cómo funciona:

- **El comprador paga en SU moneda local**, con sus medios de pago locales y
  con la financiación que ofrece Mercado Pago en su país. Un mexicano paga en
  pesos mexicanos y ve sus cuotas; un brasileño paga en reales. Esto es mejor
  de lo que se esperaba: no es "tarjeta internacional con recargo", es un
  cobro local de verdad.
- **El vendedor retira en dólares** a una cuenta bancaria de otro país. Hoy
  **sólo USD**.
- **No es autogestionado.** La cuenta la tiene que crear el equipo de Mercado
  Pago con una configuración especial. Se pide a **crm_regionales@mercadopago.com**,
  con datos de la empresa, datos bancarios (SWIFT/routing, número de cuenta,
  banco) y documentación de la habilitación comercial.
- En la API hay que mandar `"counter_currency": { "currency_id": "USD" }` en
  todos los medios de pago.

**Lo que esto implica para el producto:**

1. Una cuenta común de Mercado Pago Argentina **no sirve** para cobrarle a
   otros países. Mercado Pago no convierte monedas: si se manda una preferencia
   en ARS a un comprador mexicano, le cobra ese número en pesos argentinos. El
   código hoy tiene `currency_id: "ARS"` fijo -- ver `src/lib/mercadopago.ts`
   y `src/app/api/user/buy-credit/route.ts`.
2. Hace falta **una cuenta bancaria en el exterior que reciba dólares**. Acá
   entra lo del PREX con cuenta en Uruguay que él mencionó: es justo el tipo
   de destino que este producto necesita. Falta confirmar con PREX que acepte
   una acreditación de este tipo.
3. Los precios en dólares del producto (`src/lib/precios-por-pais.ts`) quedan
   alineados con esto: se cobra local, se liquida en dólares.

**Lo que todavía hay que preguntarles a ellos, ahora con la pregunta correcta:**

1. Comisión de Cross Border comparada con un cobro local argentino.
2. Si aceptan como destino una cuenta tipo PREX/Payoneer o exigen una cuenta
   bancaria a nombre de la empresa.
3. Requisitos de habilitación comercial para una empresa argentina.
4. Plazo de acreditación.

---

### La pregunta original, para referencia

**Lo que hay que preguntarle a Mercado Pago, textual:**

1. ¿Una cuenta de vendedor argentina puede cobrar a compradores de México,
   Chile, Colombia, Brasil y Uruguay con tarjeta internacional?
2. ¿Con qué comisión, comparada con un cobro local?
3. ¿El comprador ve sus medios de pago locales o sólo tarjeta?
4. ¿El dinero llega en pesos argentinos y con qué tipo de cambio?

Con esas cuatro respuestas se decide solo: si funciona con comisión razonable,
MP cubre seis de siete países y PayPal queda sólo para Estados Unidos.

**Sobre PayPal:** en Argentina está muy restringido para *recibir* — hace años
que no se puede retirar a cuentas bancarias argentinas. Tener PREX con cuenta
en Uruguay es el tipo de solución que se usa, pero si funciona, con qué
comisiones y qué implicancias impositivas tiene, hay que confirmarlo con ellos.
No es algo que se pueda resolver desde el código.

**Mientras tanto:** que el método de pago salga de una sola función que depende
del país. Hoy devuelve Mercado Pago y transferencia para Argentina, y "todavía
no disponible" para el resto. Cuando se resuelva, se enchufa ahí sin tocar el
resto de la app.

---

## Lo que no hay que hacer

- **No** traducir el contenido que escribe el anfitrión. Los nombres, la
  dirección del salón y el mensaje a los invitados son suyos y van como los
  escribió.
- **No** meter el idioma en la URL. Ver la primera sección.
- **No** empezar la extracción masiva antes de que las funciones nuevas estén
  cerradas.
