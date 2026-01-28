# 📋 Criterios de Creación de Plantillas

## Resumen Ejecutivo

Este documento detalla los **criterios y estándares** que se siguen para crear plantillas de invitaciones digitales en el sistema. Estos criterios aseguran consistencia, calidad visual premium y funcionalidad completa.

## Dónde sacar ideas?

Revisar plantillas web de ENVATO y Pinterest.

## 🎯 Principios Fundamentales

### 1. **Estética Premium y Tendencias 2025**
Cada plantilla debe tener:
- **Identidad visual única** con paleta de colores cohesiva y moderna
- **Tema específico** alineado a tendencias actuales (ej: Liquid Glass, Bento Grid, Eco-Minimal)
- **Tipografías personalizadas** que prioricen legibilidad y carácter (Expressive Typography)
- **Efectos visuales distintivos** como micro-interacciones, glassmorphism evolucionado ("liquid glass") y motion design intencional.

### 2. **Experiencia de Usuario (UX) e Interactividad**
- **Micro-interacciones**: Feedback visual sutil al interactuar (hover, click, scroll).
- **Personalización Profunda**: Espacios dedicados para storytelling, timelines visuales y citas personalizadas.
- **Accesibilidad Primero**: Contraste adecuado, tipografías legibles (evitar scripts difíciles de leer en cuerpos de texto), y navegación clara.
- **Integración Multimedia**: Soporte para video, audio y mapas interactivos.

### 3. **Arquitectura de Componentes**
```tsx
interface TemplateProps {
    invitation: any;      // Para plantillas modernas
    guest?: any;         // Para versiones personalizadas
    isPersonalized?: boolean;
    // O alternativamente:
    data: any;           // Para plantillas legacy
    themeConfig: any;    // Configuración de tema
}
```

### 3. **Responsive y Mobile-First**
- Diseño adaptativo con Tailwind CSS
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Touch-friendly en dispositivos móviles

---

## 🎨 Elementos Visuales Obligatorios

### **A. Paleta de Colores**
Cada plantilla debe definir:
- **Color primario** (principal del tema)
- **Color secundario** (acentos y detalles)
- **Color de fondo** (base)
- **Color de texto** (legibilidad)

**Ejemplos:**
- **SpaceExplorer**: `#4B0082` (púrpura), `#FFD700` (dorado), `#0B1026` (fondo oscuro)
- **GoldenLuxury**: `#D4AF37` (dorado), `#0a0a0a` (negro profundo), `#FDFCF8` (crema)
- **BotanicalGarden**: Verdes naturales, blancos suaves, tonos tierra

### **B. Tipografías Personalizadas**
Importar fuentes mediante:
```tsx
<style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=...');
    .font-custom-serif { font-family: 'Playfair Display', serif; }
    .font-custom-display { font-family: 'Cinzel', serif; }
    .font-custom-sans { font-family: 'Lato', sans-serif; }
`}</style>
```

**Categorías de fuentes:**
- **Serif/Script**: Títulos principales, nombres
- **Display**: Subtítulos, etiquetas decorativas
- **Sans-serif**: Cuerpo de texto, información

### **C. Efectos de Fondo**
- **Texturas**: Patrones SVG, gradientes
- **Partículas animadas**: Estrellas, pétalos, confetti
- **Overlays**: Capas semitransparentes para profundidad

**Ejemplo (GoldenLuxury):**
```tsx
<div className="fixed inset-0 opacity-10 pointer-events-none"
    style={{
        backgroundImage: `url("data:image/svg+xml,...")`
    }}
/>
```

---

## 🏗️ Estructura de Secciones

Todas las plantillas deben incluir estas secciones en orden:

### 1. **Hero Section** (Portada)
```tsx
<section className="relative min-h-screen flex items-center justify-center">
    {/* Decoraciones de fondo temáticas */}
    {/* Contenido principal: nombres, fecha, lugar */}
    {/* Scroll indicator */}
</section>
```

**Elementos obligatorios:**
- Nombres del evento (novia/novio, quinceañera, etc.)
- Fecha del evento
- Lugar del evento
- Decoraciones temáticas
- Animaciones de entrada (Framer Motion)

### 2. **Countdown** (Cuenta regresiva)
```tsx
<section className="py-20">
    <Countdown targetDate={new Date(invitation.fechaEvento)} />
    {/* O implementación custom con useCountdown hook */}
</section>
```

**Variantes:**
- Componente `<Countdown>` reutilizable
- Hook `useCountdown()` para implementaciones custom
- Diseño visual acorde al tema

### 3. **Detalles del Evento**
```tsx
<section className="py-24">
    {/* Información de ceremonia */}
    {/* Información de recepción */}
    {/* Botón de mapa */}
    {/* Imagen destacada */}
</section>
```

**Información a mostrar:**
- Nombre del lugar
- Dirección completa
- Hora del evento
- Enlace a Google Maps
- Dress code (opcional)

### 4. **Galería de Fotos** (Opcional)
```tsx
{data.galeriaPrincipalHabilitada && (
    <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.galeriaPrincipalFotos.map((foto, index) => (
                <motion.div key={index}>
                    <img src={foto} alt={`Moment ${index}`} />
                </motion.div>
            ))}
        </div>
    </section>
)}
```

### 5. **Álbum Compartido** (Opcional)
```tsx
{invitation.albumCompartidoHabilitado && (
    <CollaborativeAlbumModern
        invitationSlug={invitation.slug}
        fechaEvento={invitation.fechaEvento}
        guestName={guest?.name}
    />
)}
```

### 6. **Trivia/Quiz** (Opcional)
```tsx
{data.triviaHabilitada && (
    <QuizTrivia
        titulo="¿Qué tanto nos conoces?"
        preguntas={data.triviaPreguntas}
        invitationId={data.id}
    />
)}
```

### 7. **Información de Regalos** (Opcional)
```tsx
{data.regaloHabilitado && (
    <section>
        <h3>{data.regaloTitulo}</h3>
        <p>{data.regaloMensaje}</p>
        {data.regaloMostrarDatos && (
            <BankDetails
                banco={data.regaloBanco}
                cbu={data.regaloCbu}
                alias={data.regaloAlias}
                titular={data.regaloTitular}
            />
        )}
    </section>
)}
```

### 8. **RSVP** (Confirmación de asistencia)
```tsx
{isPersonalized && guest && (
    <PersonalizedRsvpForm
        invitation={invitation}
        guest={guest}
        onSuccess={() => {}}
    />
)}
```

### 9. **Mensaje Final** (Opcional)
```tsx
{data.mensajeFinalHabilitado && (
    <div className="text-center">
        <p>{data.mensajeFinalTexto}</p>
    </div>
)}
```

---

## 🎭 Animaciones y Efectos

### **A. Framer Motion - Animaciones de Entrada**
```tsx
// Fade in desde abajo
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

<motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={fadeInUp}
>
    {/* Contenido */}
</motion.div>
```

### **B. Scroll Effects**
```tsx
const { scrollYProgress } = useScroll();
const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
const scaleHero = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
```

### **C. Hover Effects**
```tsx
<motion.div
    whileHover={{ scale: 1.02 }}
    className="group"
>
    {/* Contenido con efectos hover */}
</motion.div>
```

### **D. Animaciones CSS Custom**
```css
@keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
}
.animate-shimmer {
    animation: shimmer 15s linear infinite;
}
```

---

## 🎵 Música de Fondo

Todas las plantillas deben incluir control de música:

```tsx
const [isPlaying, setIsPlaying] = useState(false);
const audioRef = useRef<HTMLAudioElement>(null);

const togglePlay = () => {
    if (audioRef.current) {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }
};

{invitation.musicaUrl && (
    <>
        <audio ref={audioRef} loop>
            <source src={invitation.musicaUrl} type="audio/mpeg" />
        </audio>
        <button onClick={togglePlay} className="fixed top-6 right-6 z-50">
            {isPlaying ? <Volume2 /> : <VolumeX />}
        </button>
    </>
)}
```

**Requisitos:**
- Botón fijo en esquina superior derecha
- Iconos de Lucide React (`Volume2`, `VolumeX`)
- Loop automático
- z-index alto (50+)

---

## 📱 Interactividad y UX

### **A. Copiar al Portapapeles**
```tsx
const { showToast } = useToast();

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Dato copiado al portapapeles", "success");
};
```

### **B. Enlaces Externos**
```tsx
<Button onClick={() => window.open(data.mapUrl, '_blank')}>
    Ver Mapa
</Button>
```

### **C. Scroll Indicators**
```tsx
<motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, y: [0, 10, 0] }}
    transition={{ delay: 2, duration: 2, repeat: Infinity }}
    className="absolute bottom-12"
>
    <ChevronDown />
</motion.div>
```

---

## 🎨 Decoraciones Temáticas

Cada plantilla debe incluir elementos decorativos únicos:

### **SpaceExplorer:**
- Estrellas animadas en el fondo
- Planetas con gradientes
- Iconos de cohetes (`<Rocket />`)
- Fuente monoespaciada para "coordenadas"
- Bordes con glow effect

### **GoldenLuxury:**
- Marcos ornamentales en las esquinas
- Efecto shimmer/brillo
- Texturas de patrones geométricos
- Bordes dorados delgados
- Imágenes en escala de grises con hover a color

### **BotanicalGarden:**
- Hojas y elementos florales
- Colores verdes naturales
- Texturas orgánicas
- Iconos de naturaleza (`<Leaf />`)

---

## 🔧 Consideraciones Técnicas

### **A. Performance**
- Lazy loading de imágenes
- `pointer-events-none` en decoraciones
- `will-change` para animaciones pesadas
- Limitar número de partículas animadas

### **B. Accesibilidad**
- `alt` text en todas las imágenes
- Contraste de colores adecuado
- Tamaños de fuente legibles
- Botones con áreas de click suficientes

### **C. SEO**
- Estructura semántica HTML5 (`<header>`, `<section>`, `<footer>`)
- Headings jerárquicos (`<h1>`, `<h2>`, `<h3>`)
- Meta información (manejada por Next.js)

### **D. Compatibilidad**
- Soporte para navegadores modernos
- Fallbacks para características no soportadas
- Testing en móvil y desktop

---

## 📊 Checklist de Creación de Plantilla

- [ ] **Tema y concepto** definido claramente
- [ ] **Paleta de colores** (mínimo 3 colores)
- [ ] **Tipografías** importadas y aplicadas
- [ ] **Hero section** con animaciones
- [ ] **Countdown** implementado
- [ ] **Detalles del evento** con mapa
- [ ] **Control de música** funcional
- [ ] **Galería de fotos** (si aplica)
- [ ] **Álbum compartido** integrado
- [ ] **Trivia/Quiz** integrado
- [ ] **Información de regalos** con copy-to-clipboard
- [ ] **RSVP form** personalizado
- [ ] **Mensaje final** (opcional)
- [ ] **Efectos de scroll** suaves
- [ ] **Animaciones de entrada** en todas las secciones
- [ ] **Decoraciones temáticas** únicas
- [ ] **Responsive design** verificado
- [ ] **Performance** optimizado
- [ ] **Accesibilidad** básica cumplida

---

## 🎯 Ejemplos de Referencia

### **Plantilla Minimalista:**
- Espacios en blanco generosos
- Tipografía grande y clara
- Animaciones sutiles
- Paleta monocromática o dual

### **Plantilla Maximalista:**
- Decoraciones abundantes
- Múltiples capas visuales
- Animaciones llamativas
- Paleta colorida y vibrante

### **Plantilla Temática:**
- Elementos visuales coherentes con el tema
- Iconografía específica
- Lenguaje visual consistente
- Experiencia inmersiva

---

## 📝 Notas Finales

1. **Consistencia**: Mantener el estilo visual a lo largo de toda la plantilla
2. **Flexibilidad**: Permitir personalización de colores y contenido
3. **Modularidad**: Usar componentes reutilizables cuando sea posible
4. **Documentación**: Comentar código complejo o decisiones de diseño
5. **Testing**: Probar en múltiples dispositivos y navegadores

---

## 🚀 Próximos Pasos

Para crear una nueva plantilla:

1. **Definir el concepto** y tema visual
2. **Seleccionar paleta de colores** y tipografías
3. **Crear estructura base** con todas las secciones
4. **Implementar decoraciones** temáticas
5. **Añadir animaciones** y efectos
6. **Optimizar performance** y accesibilidad
7. **Testing completo** en diferentes dispositivos
8. **Documentar** características únicas

---

## 🎨 Plantillas Implementadas - Nuevas Adiciones

### **1. Vintage Elegance Template** 
*Inspirada en diseños Art Deco y estética vintage de los años 20-30*

#### Concepto Visual
Plantilla premium que evoca la elegancia atemporal del Art Deco, con marcos ornamentales, tipografía serif clásica y detalles en tonos dorados/sepia. Perfecta para bodas clásicas y eventos de alta gama.

#### Paleta de Colores
```typescript
Primary: #B48E60    // Dorado vintage/bronce
Secondary: #8B6F47  // Marrón cálido
Background: #FBF8F3 // Crema suave
Text Dark: #4A3F35  // Marrón oscuro
Text Light: #8B6F47 // Marrón medio
Accent: #D4AF37     // Dorado brillante
```

#### Tipografías
```tsx
// Google Fonts importadas
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600&family=Great+Vibes&display=swap');

.font-vintage-serif    // Cormorant Garamond - Títulos principales
.font-vintage-sans     // Montserrat - Cuerpo de texto
.font-vintage-script   // Great Vibes - Nombres y elementos decorativos
```

#### Elementos Decorativos Únicos
- **Marcos de esquina**: Bordes en L en las 4 esquinas del hero
- **Círculos concéntricos**: Ornamentos SVG con opacidad baja
- **Patrón Art Deco**: Background con líneas diagonales cruzadas
- **Efecto shimmer**: Animación de brillo sutil en degradado
- **Bordes ornamentales**: Marcos con esquinas decorativas en secciones
- **Imágenes en escala de grises**: Con efecto hover a color

#### Características Técnicas
```tsx
// Animaciones personalizadas
@keyframes shimmer-vintage {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
}

// Patrón de fondo
.art-deco-pattern {
    background-image: 
        repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(180, 142, 96, 0.05) 10px, rgba(180, 142, 96, 0.05) 20px),
        repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(180, 142, 96, 0.05) 10px, rgba(180, 142, 96, 0.05) 20px);
}
```

#### Secciones Implementadas
- ✅ Hero con nombres en tipografía script grande y marcos ornamentales SVG
- ✅ Countdown con cajas decorativas (border-2 border-[#B48E60]) y 4 esquinas ornamentales por box
- ✅ Detalles del evento con marco Art Deco (esquinas de 16x16px con bordes de 4px)
- ✅ Galería con efecto sepia → color en hover y marcos de 4px
- ✅ Trivia con contenedor decorado y esquinas ornamentales de 12x12px
- ✅ Álbum compartido con bordes superiores/inferiores de 2px
- ✅ Información de regalo con diseño clásico y copy-to-clipboard
- ✅ RSVP form con inputs estilo vintage y esquinas ornamentales de 8x8px
- ✅ Control de música con estilo vintage
- ✅ Footer con diseño completo y variables CSS para QuizTrivia
- ✅ Mensaje final con tipografía script y divisor decorativo

#### Casos de Uso Ideales
- Bodas clásicas y elegantes
- Aniversarios de oro/plata
- Eventos formales
- Celebraciones de época/temáticas
- Quinceañeros estilo Gatsby

---

### **2. Aurora Dreamy Template**
*Inspirada en gradientes holográficos, efectos iridiscentes y estética dreamy moderna*

#### Concepto Visual
Plantilla ultra-moderna con gradientes holográficos vibrantes, efectos de glassmorphism evolucionado y animaciones fluidas. Colores iridiscentes que cambian con el scroll y la interacción. Perfecta para eventos juveniles y contemporáneos.

#### Paleta de Colores (Gradiente Holográfico)
```typescript
// Gradiente principal multicolor
gradient: linear-gradient(135deg, 
    #667eea 0%,    // Púrpura brillante
    #764ba2 25%,   // Violeta
    #f093fb 50%,   // Rosa
    #4facfe 75%,   // Azul cielo
    #00f2fe 100%   // Cyan
)

Background: #0a0a1f       // Azul oscuro casi negro
Glass: rgba(255, 255, 255, 0.1)  // Glassmorphism
Glow: #a78bfa             // Violeta luminoso
Text: #ffffff             // Blanco puro
```

#### Tipografías
```tsx
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Space+Grotesk:wght@300;400;600&display=swap');

.font-aurora-display  // Orbitron - Títulos futuristas
.font-aurora-body     // Space Grotesk - Cuerpo moderno
```

#### Elementos Decorativos Únicos
- **Partículas flotantes**: Burbujas de colores iridiscentes animadas
- **Blur orbs**: Esferas difuminadas con gradiente holográfico
- **Glass cards**: Tarjetas con backdrop-filter y bordes luminosos
- **Glow effects**: Sombras de color que cambian con hover
- **Animated mesh**: Gradiente animado en bucle
- **Glassmorphism layers**: Múltiples capas semitransparentes

#### Características Técnicas
```tsx
// Gradiente animado
@keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.aurora-gradient {
    background: linear-gradient(270deg, #667eea, #764ba2, #f093fb, #4facfe);
    background-size: 400% 400%;
    animation: gradient-shift 15s ease infinite;
}

// Glassmorphism avanzado
.glass-morphism {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

#### Efectos de Scroll
```tsx
// Parallax de partículas
const particleY = useTransform(scrollYProgress, [0, 1], [0, -300]);

// Cambio de opacidad en orbs
const orbOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 0.5, 0.8, 0.3]);

// Rotación de elementos
const rotation = useTransform(scrollYProgress, [0, 1], [0, 360]);
```

#### Secciones Implementadas
- ✅ Hero con gradiente holográfico animado, estrella giratoria (360° en 20s) y 20 partículas flotantes
- ✅ Countdown con glass-aurora cards, hover scale-105 y overlay holográfico al hover
- ✅ Detalles con glassmorphism (.glass-aurora) y overlay holográfico interactivo
- ✅ Imagen de pareja con overlay holográfico al hover (opacity-0 → opacity-20)
- ✅ Galería con glass-aurora frames y efecto scale-110 en hover
- ✅ Trivia con contenedor glass-aurora y variables CSS personalizadas
- ✅ Álbum compartido con bordes purple-400/30
- ✅ Información de regalo con glassmorphism y copy-to-clipboard
- ✅ RSVP form con inputs futuristas (bg-white/5, border-purple-400)
- ✅ Control de música con glass-aurora y z-50
- ✅ Footer con glass-aurora y variables CSS para QuizTrivia
- ✅ Mensaje final con texto holográfico y divisor degradado
- ✅ Partículas animadas generadas dinámicamente con posiciones y delays aleatorios

#### Casos de Uso Ideales
- Quinceañeros modernos
- Fiestas juveniles
- Eventos tech/gaming
- Bodas contemporáneas
- Celebraciones trendy
- Eventos nocturnos/clubes

---

## 📊 Comparativa de Plantillas

| Característica | Vintage Elegance | Aurora Dreamy |
|---|---|---|
| **Estilo** | Clásico Art Deco | Moderno Holográfico |
| **Paleta** | Tonos cálidos sepia/dorado | Gradientes vibrantes multicolor |
| **Tipografía** | Serif clásica + Script | Sans futurista |
| **Efectos** | Shimmer + Ornamentos | Glassmorphism + Glow |
| **Mood** | Elegante y atemporal | Energético y juvenil |
| **Complejidad** | Media | Alta |
| **Performance** | Óptimo | Bueno (por animaciones) |

---

## 🛠️ Implementación Técnica

### Archivos Creados
```
src/components/templates/
  ├── VintageEleganceTemplate.tsx  (531 líneas - completo)
  └── AuroraDreamyTemplate.tsx     (502 líneas - completo)

src/lib/
  └── theme-config.ts              (actualizado con vintage y aurora)

src/components/wizard/
  └── StepPreview.tsx              (actualizado con imports y rendering)
```

### Configuración en theme-config.ts
```typescript
vintage: {
    id: 'vintage',
    name: 'Vintage Elegance',
    description: 'Diseño Art Deco con marcos ornamentales y tipografía clásica',
},
aurora: {
    id: 'aurora',
    name: 'Aurora Dreamy',
    description: 'Gradientes holográficos con efectos iridiscentes y glassmorphism',
}
```

### Uso en Wizard
Las plantillas están disponibles en el selector de diseño del wizard de creación y pueden combinarse con cualquier paleta de colores del sistema.

### Integración con Componentes Reutilizables
Ambas plantillas integran correctamente:
- **QuizTrivia**: Con variables CSS personalizadas (--color-background, --color-primary, --color-text-light)
- **SharedAlbum**: Con props de color primario adaptado al tema
- **Hooks personalizados**: useCountdown para cuenta regresiva
- **Framer Motion**: Animaciones de scroll y viewport con `initial`, `whileInView`, `variants`
- **Lucide Icons**: Heart, Sparkles, Gift, Star, Copy, Volume2, VolumeX, ChevronDown

### Detalles de Renderizado
```tsx
// En StepPreview.tsx
{themeConfig.layout === 'vintage' && (
  <VintageEleganceTemplate data={formData} themeConfig={themeConfig} />
)}
{themeConfig.layout === 'aurora' && (
  <AuroraDreamyTemplate data={formData} themeConfig={themeConfig} />
)}
```

---

## 🕺 Plantilla: Disco Night

### Descripción General
Plantilla enérgica y vibrante para fiestas nocturnas, eventos de discoteca o celebraciones con ambiente de club. Inspirada en el neón de los años 80 y el futurismo cyberpunk.

### Paleta de Colores
```css
--neon-pink: #FF006E;      /* Rosa neón vibrante */
--electric-purple: #8338EC; /* Púrpura eléctrico */
--cyber-blue: #3A86FF;     /* Azul cibernético */
--blazing-orange: #FB5607; /* Naranja ardiente */
--dark-base: #0a0a0a;      /* Fondo oscuro profundo */
--neon-gradient: linear-gradient(135deg, #FF006E, #8338EC, #3A86FF);
```

### Tipografías
- **Display:** Audiowide (futurista, tech)
- **Títulos:** Righteous (bold, impactante)
- **Texto:** Orbitron (legible, sci-fi)

### Decoraciones Distintivas
- **Confetti animado:** 30 partículas con colores neón cayendo continuamente
- **Spotlights rotativos:** 3 focos de luz que giran en el fondo
- **Efectos de luces estroboscópicas:** Parpadeo sutil en elementos clave
- **Glassmorphism disco:** Cards con efecto vidrio y brillo neón

### Animaciones CSS Personalizadas
```css
@keyframes neon-pulse {
  0%, 100% { 
    text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
  }
  50% { 
    text-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor;
  }
}

@keyframes strobe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes disco-gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes confetti-fall {
  0% { transform: translateY(-100vh) rotate(0deg); }
  100% { transform: translateY(100vh) rotate(720deg); }
}

@keyframes spotlight-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### Características Especiales
- **Fondo dinámico:** Gradiente animado con efecto disco
- **Neon pulse:** Texto con efecto de neón pulsante
- **Glass-disco cards:** Cards con glassmorphism y bordes neón
- **Iconos temáticos:** Zap, Sparkles, Music para secciones clave

### Secciones Implementadas
1. **Hero:** Gradiente neón animado con título pulsante
2. **Countdown:** Contador con glow effects en cada unidad
3. **Event Details:** Cards glass-disco con información del evento
4. **Photo Gallery:** Grid con hover effects neón
5. **Quiz/Trivia:** Preguntas interactivas con tema cyberpunk
6. **Shared Album:** Álbum colaborativo con borde neón
7. **Gift Info/Bank Details:** Información bancaria con iconos tech
8. **RSVP Form:** Formulario con inputs neón y validación visual
9. **Footer:** Despedida con efecto strobe sutil

### Casos de Uso Ideales
- 🎉 Fiestas de cumpleaños 18-30 años
- 💃 Eventos de discoteca/club
- 🎊 Celebraciones nocturnas temáticas
- 🌃 Fiestas de año nuevo o eventos nocturnos

### Especificaciones Técnicas
- **Archivo:** `src/components/templates/DiscoNightTemplate.tsx`
- **Layout ID:** `disco`
- **Template ID:** `DISCO_NIGHT`
- **Categoría:** THEMATIC
- **Líneas de código:** ~700
- **Dependencias:** SharedAlbum, QuizTrivia, useCountdown, Framer Motion

---

## 🎈 Plantilla: Kids Party

### Descripción General
Plantilla alegre y colorida diseñada para fiestas infantiles. Con animaciones bounce, globos flotantes y paleta de colores arcoíris que cautiva a los niños.

### Paleta de Colores
```css
--happy-red: #FF6B6B;      /* Rojo alegre */
--playful-teal: #4ECDC4;   /* Turquesa juguetón */
--sunny-yellow: #FFE66D;   /* Amarillo soleado */
--mint-fresh: #95E1D3;     /* Menta fresca */
--lavender-soft: #C7CEEA;  /* Lavanda suave */
--rainbow-gradient: linear-gradient(90deg, #FF6B6B, #4ECDC4, #FFE66D, #95E1D3, #C7CEEA);
--cream-base: #FFF4E6;     /* Base crema suave */
```

### Tipografías
- **Display:** Bubblegum Sans (infantil, redondeada)
- **Títulos:** Chewy (divertida, orgánica)
- **Texto:** Fredoka (legible, amigable)

### Decoraciones Distintivas
- **Globos flotantes SVG:** 15 globos con cuerdas que flotan suavemente
- **Confetti colorido:** 25 piezas de confetti con colores del arcoíris
- **Bounce animations:** Elementos que rebotan de forma juguetona
- **Cards redondeadas:** Border-radius de 30px para look amigable

### Animaciones CSS Personalizadas
```css
@keyframes bounce-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes rainbow-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes confetti-pop {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(-200px) rotate(720deg); opacity: 0; }
}
```

### Características Especiales
- **Globos SVG personalizados:** Diseñados con ellipse y líneas como cuerdas
- **Gradiente arcoíris:** Fondo dinámico con colores infantiles
- **Iconos emoji:** Uso de emojis en countdown (📅⏰⏱️⚡)
- **Tarjetas redondeadas:** Cards con border-radius pronunciado

### Secciones Implementadas
1. **Hero:** Fondo arcoíris con título bounce y globos flotantes
2. **Countdown:** Contador con emojis y animaciones de rebote
3. **Event Details:** Información con iconos Star y MapPin coloridos
4. **Photo Gallery:** Galería con frames redondeados
5. **Quiz/Trivia:** Trivia interactiva con tema infantil
6. **Shared Album:** Álbum colaborativo con decoración de globos
7. **Gift Info:** Información de regalos con icono Gift
8. **RSVP Form:** Formulario colorido con inputs redondeados
9. **Footer:** Despedida alegre con confetti

### Casos de Uso Ideales
- 🎂 Cumpleaños infantiles (1-12 años)
- 🎪 Fiestas temáticas de niños
- 🎨 Eventos escolares y recreativos
- 🧸 Baby showers con tema alegre

### Especificaciones Técnicas
- **Archivo:** `src/components/templates/KidsPartyTemplate.tsx`
- **Layout ID:** `kidsparty`
- **Template ID:** `KIDS_PARTY`
- **Categoría:** KIDS
- **Líneas de código:** ~750
- **Dependencias:** SharedAlbum, QuizTrivia, useCountdown, Framer Motion, SVG balloons

---

## 👶 Plantilla: Baby Baptism

### Descripción General
Plantilla tierna y delicada para celebraciones de bebés como bautismos, baby showers o primer cumpleaños. Con paleta pastel, nubes flotantes y efectos acuarela.

### Paleta de Colores
```css
--cream-soft: #FFF4E6;     /* Crema suave */
--lavender-mist: #E8E9F3;  /* Lavanda niebla */
--beige-warm: #F0E5CF;     /* Beige cálido */
--pink-blush: #FADADD;     /* Rosa rubor */
--pastel-gradient: linear-gradient(135deg, #FFF4E6, #F0E5CF, #E8E9F3);
```

### Tipografías
- **Display:** Comfortaa (redondeada, suave)
- **Script:** Pacifico (manuscrita, delicada)
- **Texto:** Quicksand (legible, moderna)

### Decoraciones Distintivas
- **Nubes flotantes SVG:** 8 nubes con movimiento suave
- **Estrellas titilantes:** 20 estrellas con efecto twinkle
- **Watercolor blobs:** 3 manchas de acuarela con blur
- **Cards ultra-redondeadas:** Border-radius de 40px

### Animaciones CSS Personalizadas
```css
@keyframes cloud-float {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(20px) translateY(-10px); }
}

@keyframes gentle-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes watercolor-spread {
  0%, 100% { filter: blur(40px); opacity: 0.3; }
  50% { filter: blur(60px); opacity: 0.5; }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}
```

### Características Especiales
- **Nubes SVG personalizadas:** Diseñadas con paths curvos
- **Efecto acuarela:** Blobs con filtro blur animado
- **Iconos temáticos:** Moon, Cloud, Sparkles
- **Paleta ultra-suave:** Colores pasteles que transmiten ternura

### Secciones Implementadas
1. **Hero:** Gradiente pastel con título manuscrito y luna
2. **Countdown:** Contador suave con animación gentle-bounce
3. **Event Details:** Información con iconos Cloud y MapPin
4. **Photo Gallery:** Galería con frames redondeados y pastel
5. **Quiz/Trivia:** Trivia interactiva tema bebé
6. **Shared Album:** Álbum con decoración de nubes y estrellas
7. **Gift Info:** Información de regalos con icono Gift
8. **RSVP Form:** Formulario delicado con inputs redondeados
9. **Footer:** Despedida tierna con estrellas

### Casos de Uso Ideales
- 🍼 Bautismos y presentaciones
- 👶 Baby showers
- 🎂 Primer cumpleaños
- 🌟 Celebraciones de bebés (0-2 años)

### Especificaciones Técnicas
- **Archivo:** `src/components/templates/BabyBaptismTemplate.tsx`
- **Layout ID:** `baby`
- **Template ID:** `BABY_BAPTISM`
- **Categoría:** KIDS
- **Líneas de código:** ~700
- **Dependencias:** SharedAlbum, QuizTrivia, useCountdown, Framer Motion, Cloud SVG

---

## 🎯 Próximas Mejoras Sugeridas

### Para Disco Night
- [ ] Agregar más efectos de luz estroboscópica
- [ ] Implementar música de fondo automática (opcional)
- [ ] Añadir efectos de partículas 3D
- [ ] Incluir modo de bajo consumo

### Para Kids Party
- [ ] Agregar más variantes de globos (formas, colores)
- [ ] Implementar sonidos de celebración
- [ ] Añadir animaciones de personajes
- [ ] Incluir stickers interactivos

### Para Baby Baptism
- [ ] Optimizar nubes para mejor performance
- [ ] Agregar más variantes de acuarela
- [ ] Implementar modo nocturno (luna y estrellas)
- [ ] Añadir efectos de música de cuna

### Para Vintage Elegance
- [ ] Agregar más ornamentos SVG personalizados
- [ ] Implementar variantes de marcos (rectangular, circular, oval)
- [ ] Añadir efectos de tinta vintage
- [ ] Incluir texturas de papel antiguo

### Para Aurora Dreamy
- [ ] Optimizar animaciones para mejor performance
- [ ] Agregar más variantes de partículas
- [ ] Implementar modo de bajo consumo (menos efectos)
- [ ] Añadir efectos de sonido sutiles

---

## ✅ Estado de Implementación

### Build Status
- **Última compilación:** Pendiente de verificar
- **TypeScript:** Pendiente de compilar
- **Nuevas plantillas:** 3 (Disco Night, Kids Party, Baby Baptism)
- **Templates totales:** 14 plantillas

### Templates Implementados
- ✅ DiscoNightTemplate: Código completo (700 líneas)
- ✅ KidsPartyTemplate: Código completo (750 líneas)
- ✅ BabyBaptismTemplate: Código completo (700 líneas)
- ✅ VintageEleganceTemplate: Compilado y funcional
- ✅ AuroraDreamyTemplate: Compilado y funcional
- ✅ Integración con theme-config.ts: Completa (3 nuevos layouts)
- ✅ Integración con templatesConfig.ts: Completa (3 nuevas entradas)
- ✅ Integración con StepPreview.tsx: Completa (imports y rendering)
- ✅ Integración con InvitationContent.tsx: Completa (3 nuevos condicionales)
- ✅ TemplateSelector UX mejorado: Tabs por categorías implementadas

### Archivos Modificados en esta Implementación
```
Modificados:
- src/lib/theme-config.ts (agregados layouts: disco, kidsparty, baby)
- src/lib/templatesConfig.ts (agregados: DISCO_NIGHT, KIDS_PARTY, BABY_BAPTISM)
- src/components/wizard/StepPreview.tsx (3 imports y rendering)
- src/components/invitation/InvitationContent.tsx (3 imports y condicionales)
- src/components/dashboard/TemplateSelector.tsx (UX mejorado con Tabs)

Creados:
- src/components/templates/DiscoNightTemplate.tsx (100% nuevo, 700 líneas)
- src/components/templates/KidsPartyTemplate.tsx (100% nuevo, 750 líneas)
- src/components/templates/BabyBaptismTemplate.tsx (100% nuevo, 700 líneas)

Actualizados:
- docs/CRITERIOS_PLANTILLAS.md (documentación completa de 3 nuevas plantillas)
```

### Template Selector Improvements
- ✅ Tabs component para navegación por categorías
- ✅ Contador de templates por categoría
- ✅ Búsqueda mejorada con botón de limpieza
- ✅ Hover effects mejorados en cards
- ✅ Dialog más grande (max-w-6xl, h-85vh)
- ✅ Grid adaptativo (4 columnas en xl)
- ✅ Animaciones de transición mejoradas

---

**Última actualización:** 2026-01-29 01:15
**Versión:** 1.3
**Nuevas plantillas:** 5 totales (Vintage Elegance, Aurora Dreamy, Disco Night, Kids Party, Baby Baptism)
**Estado:** ✅ Implementación Completa - Pendiente de Build Verification
