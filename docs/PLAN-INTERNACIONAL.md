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

## Modo claro y oscuro

Va en esta misma rama porque comparte el problema: un producto que se muestra a
gente de siete países no puede tener una sola manera de verse.

El modo claro tiene que ser en **blancos cálidos, cremas y tono manteca**. Nada
de blanco puro ni de grises fríos: papel, no pantalla. El dorado de la marca
probablemente necesite una versión más oscura para contrastar sobre crema.

Las **plantillas de invitación no participan**: cada una tiene su propia paleta
y el invitado la ve como la diseñó el anfitrión. Esto es sólo para el panel y
la landing.

---

## El país decide el método de pago

Esto salió al pensar la internacionalización y es lo más importante que queda
por definir:

- **Argentina:** Mercado Pago + transferencia (alias/CBU).
- **Estados Unidos:** ninguno de los dos aplica.
- **Resto:** sin definir.

**Lo que se sabe:** Mercado Pago opera en Argentina, Brasil, Chile, Colombia,
México, Perú y Uruguay. De la lista, sólo Estados Unidos queda afuera.

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
