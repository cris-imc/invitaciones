# 🧪 Plan de QA Automation — Plataforma de Invitaciones Digitales

## 🎯 1. Pilar Principal: Verificación Mapeo Wizard ↔ Plantilla, UX, Reglas de Negocio & Calidad Estética Clase Mundial

Este plan de QA Automation está diseñado específicamente para auditar, probar y garantizar que:
1. **Mapeo de Integridad de Datos (Wizard ↔ Plantilla)**: Toda la información que se solicita en los 5 pasos del Wizard se refleje de forma exacta, funcional y completa en el renderizado de las plantillas públicas (`/i/[slug]`).
2. **Auditoría de UX y Flujos Defectuosos**: Se identifiquen y corrijan cuellos de botella en la experiencia de usuario (por ejemplo: falta de botones de edición en el Dashboard, navegación bloqueada, falta de feedback en formularios).
3. **Auditoría de Reglas de Negocio & Ciclo de Vida**: Se verifiquen las reglas sobre vigencia de 3 meses, borrado automático de archivos, vista post-evento exclusiva, mensaje motivacional el día del evento y bloqueo anti-fraude de fecha a los 30 días.
4. **Calidad Estética y Visual de Clase Mundial**: Se verifique la excelencia visual en múltiples dispositivos (responsive mobile-first), contraste, tipografía, micro-animaciones y manejo elegante de estados vacíos.

---

## 🔍 2. Matriz de Verificación de Integridad de Datos (Wizard ↔ Plantillas)

La suite automatizada verifica la correspondencia campo por campo entre lo ingresado por el usuario y lo mostrado en pantalla:

| Paso del Wizard | Campo Configurable | Destino en la Plantilla (`/i/[slug]`) | Criterio de Aceptación QA |
| :--- | :--- | :--- | :--- |
| **Paso 1: Tipo & Básicos** | Nombres (Novios / Quinceañera) | `HeroSection` | Nombres visibles con animación reveal |
| | Fecha y Hora del Evento | `EventDetails` & `ContadorRegresivo` | Cálculo exacto de días, horas y minutos |
| | Lugar, Dirección y MapUrl | `EventDetails` | Botón "Cómo llegar" abre Google Maps activo |
| **Paso 2: Portada & Frase** | Título, Subtítulo e Imagen | `CoverPage` | Overlay visual oscuro y tipografía legible |
| | Cita / Frase Personalizada | `PhraseSection` | Renderizado con comillas y autor |
| **Paso 3: Cronograma & Detalles** | Itinerario / Cronograma | `TimelineSection` | Horarios e íconos ordenados cronológicamente |
| | Dress Code & Observaciones | `DressCodeSection` | Tipo de vestimenta e indicación de color |
| **Paso 4: Regalos & Galería** | CBU, Alias, Banco, Titular | `BankDetailsModal` | Modal con copiado fácil de un clic |
| | Fotos Iniciales de Galería | `SharedAlbum` | Grid responsivo con visor Lightbox |
| **Paso 5: Música & Trivia** | URL de Música MP3 | `MusicPlayer` | Reproductor flotante (autoplay y loop) |
| | Preguntas de Quiz Trivia | `TriviaQuiz` | Modal de preguntas interactivas y ranking |

---

## ⌛ 3. Auditoría de Reglas de Negocio & Ciclo de Vida de Tarjeta Digital

Casos de prueba automatizados para verificar la vigencia, ciclo de vida del evento y reglas anti-fraude:

| ID Caso | Regla de Negocio / Escenario | Comprobación de QA Automation | Estado |
| :--- | :--- | :--- | :---: |
| **RULE-01** | **Mensaje Motivacional Día del Evento** | `EVENT_DAY`: Muestra `"¡Llegó el día! 🎉"` y mensaje motivacional de celebración. | ✅ Verificado |
| **RULE-02** | **Vigencia de 3 Meses y Borrado Físico** | `EXPIRED`: Transcurridos 3 meses de `fechaEvento`, borra archivos físicos (`public/uploads/...`) y ejecuta `prisma.invitation.delete`. | ✅ Verificado |
| **RULE-03** | **Vista Post-Evento (Día Siguiente)** | `POST_EVENT`: Renderiza únicamente mensaje de agradecimiento (*"✨ ¡Esperamos que la hayan pasado genial! ✨"*) y el álbum de fotos. | ✅ Verificado |
| **RULE-04** | **Archivos LIVE Disponibles por 3 Meses** | Las fotos y notas de voz compartidas en vivo en la sesión LIVE continúan disponibles en el álbum post-evento por 3 meses. | ✅ Verificado |
| **RULE-05** | **Bloqueo de Fecha a los 30 Días** | Faltando 30 días o menos para el evento (`daysUntilEvent <= 30`), deshabilita el campo en UI y retorna error HTTP 400 en API (Anti-Fraude). | ✅ Verificado |

---

## 🚨 4. Auditoría de UX y Detección de Flujos Defectuosos (User Flows Audit)

Casos de prueba automatizados para detectar fallos en la navegación y experiencia del usuario:

| ID Caso | Escenario de UX / Flujo de Usuario | Comprobación de QA Automation | Estado |
| :--- | :--- | :--- | :---: |
| **UX-01** | **Edición de Invitación**: Edición en Dashboard. | Verificar presencia de enlace **"Editar ✏️"** apuntando a `/editar/[id]`. | ✅ Verificado |
| **UX-02** | **Previsualización Directa**: Ver en vivo. | Verificar presencia de enlace **"Ver 👁️"** apuntando a `/i/[slug]`. | ✅ Verificado |
| **UX-03** | **Confirmación de Eliminación**: Eventos. | Presencia de modal de alerta destructiva antes de eliminar. | ✅ Verificado |
| **UX-04** | **Feedback de Carga (Loading States)** | Botón con spinner "Guardando..." deshabilitado durante peticiones. | ✅ Verificado |
| **UX-05** | **Wizard: Separación Portada/Recorte** | La portada de bienvenida y el recorte (Hero Images) son pasos separados. | ✅ Verificado |
| **UX-06** | **Wizard: Portada Bienvenida Obligatoria** | Sin opción de apagar la portada de bienvenida; siempre existe. | ✅ Verificado |
| **UX-07** | **Plantilla: Destaque Dress Code** | Visualizado con estilo glassmorphism en la portada de bienvenida. | ✅ Verificado |
| **UX-08** | **Plantilla: Visualización Ciudad** | La ciudad se renderiza correctamente en la portada de la plantilla. | ✅ Verificado |
| **UX-09** | **Plantilla: Footer Branding** | El pie de la invitación muestra "Invitaciones digitales". | ✅ Verificado |
| **UX-10** | **Dashboard: Admin Invitados** | El listado de invitados (Guests) incluye buscador y paginación (3/pág). | ✅ Verificado |
| **UX-11** | **Dashboard: Eliminación Invitados** | Modal Custom (Dialog de UI) para borrar invitados (no confirm nativo). | ✅ Verificado |
| **UX-12** | **Sugerencia de Música** | Toggle independiente que refleja su estado real en la plantilla. | ✅ Verificado |
| **UX-13** | **Quiz/Trivia Edición** | Botón lápiz que permite reeditar la pregunta sin borrarla por error. | ✅ Verificado |
| **UX-14** | **Lógica Regalo Sin Datos Bancarios** | Oculta el subtítulo "Datos bancarios" si se apaga, manteniendo el mensaje. | ✅ Verificado |

---

## ⭐ 5. Estándar de Excelencia Estética de Clase Mundial

Criterios visuales evaluados mediante capturas automatizadas (*Visual Regression Testing*):

1. **Jerarquía Tipográfica**: Combinación legible de fuentes Google (*Playfair Display, Cormorant, Inter, Outfit*).
2. **Glassmorphism & Animaciones**: Uso de `backdrop-blur-md`, bordes traslúcidos y transiciones suaves con *Framer Motion*.
3. **Mobile-First Responsiveness**: 0% de desplazamiento horizontal (`overflow-x-hidden`) en dispositivos móviles (iPhone 14 / Pixel 5).
4. **Reorganización Fluida de Secciones Deshabilitadas**: Si una sección (Música, Trivia o CBU) no se activa en el Wizard, la plantilla reorganiza el diseño sin huecos ni espacios en blanco.

---

## 🏗️ 6. Arquitectura del Proyecto & Suite de Automatización

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            ARQUITECTURA DE QA                            │
├──────────────────────────┬──────────────────────────┬────────────────────┤
│   Pruebas E2E & Visual   │ Integration & API Tests  │  Inspector Audit   │
├──────────────────────────┼──────────────────────────┼────────────────────┤
│ • Playwright Test        │ • Vitest                 │ • QA Runner Node   │
│ • Snapshots de Pantalla  │ • Prisma SQLite Test DB  │ • Reporte Automático│
└──────────────────────────┴──────────────────────────┴────────────────────┘
```

### Estructura de Archivos de QA
* `docs/QA_AUTOMATION_PLAN.md` — Documentación del Plan de QA.
* `docs/QA_EXECUTION_REPORT.md` — Reporte generado tras cada ejecución del runner.
* `scripts/execute-qa-automation.js` — Script automatizado de inspección y prueba.

---

## 🤖 7. Integración CI/CD (GitHub Actions)

Workflow en `.github/workflows/qa-automation.yml`:

```yaml
name: QA Automation Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx prisma db push
      - run: npx prisma db seed
      - run: node scripts/execute-qa-automation.js
```

---

## 📌 8. Ejecución y Comandos

Para ejecutar la suite automatizada de QA:

```bash
# Ejecutar la prueba automatizada de QA, mapeo, reglas de negocio e inspección de UX
node scripts/execute-qa-automation.js
```
