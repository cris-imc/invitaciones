# Quiz/Trivia - Funcionalidad Completa

## ✨ Características

La funcionalidad de Quiz/Trivia permite crear un quiz interactivo para tus invitados con las siguientes características:

### 📝 Gestión de Preguntas
- **Agregar preguntas ilimitadas** sobre la quinceañera o la pareja
- **4 opciones de respuesta** por pregunta (A, B, C, D)
- **Marcar la respuesta correcta** fácilmente con un checkbox
- **Vista previa** de todas las preguntas agregadas
- **Eliminar preguntas** individualmente

### 🎮 Experiencia del Usuario
- **Pantalla de inicio** con título y subtítulo personalizables
- **Preguntas de una en una** con interfaz limpia
- **Barra de progreso visual** que muestra el avance
- **Resultados detallados** al finalizar:
  - Porcentaje de aciertos
  - Número de respuestas correctas
  - Revisión de cada pregunta con la respuesta correcta
  - Mensaje personalizado según el rendimiento
- **Opción de reintentar** el quiz

### 🎨 Personalización
- Icono/emoji personalizable
- Título del quiz
- Subtítulo descriptivo
- Se adapta al tema de colores de la invitación

## 📋 Cómo usar

### En el Wizard de Creación:
1. Navega hasta el paso "Quiz/Trivia" (necesitas agregarlo al flujo del wizard)
2. Activa el checkbox "Activar Quiz/Trivia"
3. Personaliza el icono, título y subtítulo
4. Agrega preguntas:
   - Escribe la pregunta
   - Completa las 4 opciones
   - Marca cuál es la correcta
   - Click en "Agregar pregunta"
5. Repite para más preguntas
6. Las preguntas se guardan automáticamente

### En la Invitación:
El quiz aparecerá automáticamente en la invitación si:
- `triviaHabilitada` está en `true`
- Existen preguntas guardadas en `triviaPreguntas`

## 🔧 Integración con el Wizard

Para que aparezca en el flujo de creación, necesitas agregarlo al componente principal del wizard.
Busca donde se renderizan los pasos (StepEventType, StepBasicInfo, etc.) y agrega:

```tsx
import { StepTrivia } from '@/components/wizard/StepTrivia';

// En el switch/case o array de pasos:
case 'trivia':
    return <StepTrivia />;
```

## 📊 Estructura de Datos

Las preguntas se guardan como JSON string en la base de datos:

```json
[
  {
    "pregunta": "¿Cuál es el color favorito de María?",
    "opciones": ["Azul", "Rosa", "Verde", "Amarillo"],
    "respuestaCorrecta": 1
  },
  {
    "pregunta": "¿Dónde se conocieron los novios?",
    "opciones": ["Universidad", "Trabajo", "Parque", "Café"],
    "respuestaCorrecta": 0
  }
]
```

## 🎯 Ejemplo de Preguntas para Quinceañera

- ¿Cuál es el segundo nombre de [Nombre]?
- ¿En qué mes nació?
- ¿Cuál es su película favorita?
- ¿Qué instrumento musical toca?
- ¿Cuál es su comida favorita?
- ¿Cuántos hermanos tiene?
- ¿Cuál es su color favorito?
- ¿Dónde le gustaría viajar?

## 🎯 Ejemplo de Preguntas para Casamiento

- ¿Dónde se conocieron?
- ¿En qué año empezaron a salir?
- ¿Cuál fue su primera cita?
- ¿Quién dijo "te amo" primero?
- ¿Cuál es el restaurante favorito de la pareja?
- ¿Qué deporte practican juntos?
- ¿Cuál es el apodo de [Novio/a]?
- ¿Dónde fue la propuesta de matrimonio?

## 💡 Tips
- Mantén las preguntas divertidas y livianas
- Usa entre 5-10 preguntas para no hacer el quiz muy largo
- Mezcla preguntas fáciles con algunas más desafiantes
- Los invitados pueden reintentar el quiz cuantas veces quieran
