# 💡 Reporte de Oportunidades de Mejora, Faltantes y UX Audit

Este documento consolida el análisis de la experiencia de usuario (**UX**), arquitectura visual y oportunidades de mejora detectadas en la plataforma de Invitaciones Digitales.

---

## 🎯 1. Oportunidades de Mejora en el Wizard de Creación (Wizard 5 Pasos)

| Módulo / Paso | Oportunidad / Faltante Detectado | Impacto en UX | Propuesta de Solución Recomendada | Prioridad |
| :--- | :--- | :---: | :--- | :---: |
| **Borrador Progresivo** | Si el usuario cierra la ventana a mitad del Wizard, pierde los datos cargados. | 🔴 Alto | Guardar estado en `localStorage` o tabla `BORRADOR` automáticamente tras cada paso. | P1 |
| **Toggle de Vista Previa (Desktop/Mobile)** | La vista previa del Wizard solo se ve en formato desktop. | 🟡 Medio | Agregar switch "📱 Mobile | 💻 Desktop" en la vista previa del Paso 5. | P2 |
| **Subida Masiva de Fotos** | El Paso de Galería obliga a ingresar URLs en lugar de permitir arrastrar y soltar imágenes desde la PC o celular. | 🔴 Alto | Integrar `react-dropzone` directo en el Wizard para compresión y subida directa de fotos. | P1 |

---

## 🎨 2. Oportunidades de Mejora en las Plantillas Públicas (`/i/[slug]`)

| Componente / Sección | Oportunidad / Faltante Detectado | Impacto en UX | Propuesta de Solución Recomendada | Prioridad |
| :--- | :--- | :---: | :--- | :---: |
| **Reproductor de Música en Móviles** | Los navegadores móviles (iOS Safari / Chrome) bloquean el *autoplay* de audio por política del sistema. | 🟡 Medio | Mostrar un botón flotante animado más prominente: **"Toca para activar música 🎵"**. | P1 |
| **Confirmante RSVP sin comprobante** | Cuando el invitado confirma su asistencia, no recibe un comprobante o pase de ingreso. | 🟡 Medio | Generar un **Ticket / Pase Digital con Código QR** para descargar o enviar por WhatsApp al confirmar. | P2 |
| **Álbum Compartido** | Subir fotos desde el celular no muestra barra de progreso de carga. | 🟡 Medio | Agregar indicador porcentual de subida y compresión en cliente (*WebP/JPEG*). | P2 |
| **Navegación por Anclas (Smooth Scroll)** | Al hacer clic en el menú flotante, el desplazamiento a veces salta bruscamente. | 🟢 Bajo | Refactorizar navegación con `lenis` o `framer-motion` smooth scroll. | P3 |

---

## 📊 3. Oportunidades de Mejora en el Dashboard de Clientes

| Funcionalidad | Oportunidad / Faltante Detectado | Impacto en UX | Propuesta de Solución Recomendada | Prioridad |
| :--- | :--- | :---: | :--- | :---: |
| **Exportar Invitados RSVP** | El organizador/catering necesita la lista de confirmados en papel o Excel. | 🔴 Alto | Agregar botón **"Descargar Lista (Excel / CSV)"** en `/dashboard/invitaciones/[slug]/guests`. | P1 |
| **Duplicar / Clonar Evento** | Crear un evento similar requiere volver a llenar todo el Wizard. | 🟡 Medio | Agregar botón **"Duplicar Invitación 📋"** en el Dashboard. | P2 |
| **Compartir por WhatsApp** | Compartir el link requiere copiar y pegar manualmente. | 🟡 Medio | Agregar botón **"Enviar por WhatsApp 📲"** que abra WhatsApp Web/App con mensaje predefinido y el enlace. | P1 |

---

## 🛠️ 4. Matriz de Priorización para Próximos Sprints

```
          IMPACTO EN EL USUARIO
               ▲
               │  [P1] Exportar Excel RSVP    [P1] Botón Enviar WhatsApp
         ALTO  │  [P1] Subida Masiva Fotos    [P1] Guardado Borrador Wizard
               │
        MEDIO  │  [P2] QR Pase de Ingreso     [P2] Duplicar Evento
               │  [P2] Switch Preview Mobile
               │
        BAJO   │                              [P3] Smooth Scroll Lenis
               └──────────────────────────────────────────────────►
                     ESFUERZO DE DESARROLLO (FACILITAD HASTA COMPLEJO)
```
