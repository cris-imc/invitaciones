# 🧪 Plan de QA Automation — Plataforma de Invitaciones Digitales

## 🎯 1. Pilar Principal: Verificación Mapeo Wizard ↔ Plantilla, UX & Calidad Estética Clase Mundial

Este plan de QA Automation está diseñado específicamente para auditar, probar y garantizar que:
1. **Mapeo de Integridad de Datos (Wizard ↔ Plantilla)**: Toda la información que se solicita en los 5 pasos del Wizard se refleje de forma exacta, funcional y completa en el renderizado de las plantillas públicas (`/i/[slug]`).
2. **Auditoría de UX y Flujos Defectuosos**: Se identifiquen y corrijan cuellos de botella en la experiencia de usuario (por ejemplo: falta de botones de edición en el Dashboard, navegación bloqueada, falta de feedback en formularios).
3. **Calidad Estética y Visual de Clase Mundial**: Se verifique la excelencia visual en múltiples dispositivos (responsive mobile-first), contraste, tipografía, micro-animaciones y manejo elegante de estados vacíos.

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

## 🚨 3. Auditoría de UX y Detección de Flujos Defectuosos (User Flows Audit)

Casos de prueba automatizados para detectar fallos en la navegación y experiencia del usuario:

| ID Caso | Escenario de UX / Flujo de Usuario | Comprobación de QA Automation | Estado |
| :--- | :--- | :--- | :--- |
| **UX-01** | **Edición de Invitación**: El cliente necesita editar su evento luego de crearlo. | Verificar presencia de enlace **"Editar ✏️"** en `/dashboard/invitaciones` apuntando a `/editar/[id]`. | ✅ Implementado & Auditado |
| **UX-02** | **Previsualización Directa**: Ver la plantilla en vivo desde el Dashboard. | Verificar presencia de enlace **"Ver 👁️"** apuntando a la URL pública `/i/[slug]`. | ✅ Implementado & Auditado |
| **UX-03** | **Confirmación de Eliminación**: Evitar el borrado accidental de eventos. | Presencia de modal de alerta destructiva antes de ejecutar la eliminación. | ✅ Verificado |
| **UX-04** | **Feedback de Carga (Loading States)**: Estado visual al guardar. | Botón con spinner "Guardando..." deshabilitado durante la petición. | ✅ Verificado |

---

## ⭐ 4. Estándar de Excelencia Estética de Clase Mundial

Criterios visuales evaluados mediante capturas automatizadas (*Visual Regression Testing*):

1. **Jerarquía Tipográfica**: Combinación legible de fuentes Google (*Playfair Display, Cormorant, Inter, Outfit*).
2. **Glassmorphism & Animaciones**: Uso de `backdrop-blur-md`, bordes traslúcidos y transiciones suaves con *Framer Motion*.
3. **Mobile-First Responsiveness**: 0% de desplazamiento horizontal (`overflow-x-hidden`) en dispositivos móviles (iPhone 14 / Pixel 5).
4. **Reorganización Fluida de Secciones Deshabilitadas**: Si una sección (Música, Trivia o CBU) no se activa en el Wizard, la plantilla reorganiza el diseño sin huecos ni espacios en blanco.

---

## 🏗️ 5. Arquitectura del Proyecto & Suite de Automatización

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

## 🤖 6. Integración CI/CD (GitHub Actions)

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

## 📌 7. Ejecución y Comandos

Para ejecutar la suite automatizada de QA:

```bash
# Ejecutar la prueba automatizada de QA, mapeo e inspección de UX
node scripts/execute-qa-automation.js
```
