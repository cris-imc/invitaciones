# 📋 Criterios de Creación de Plantillas

## Resumen Ejecutivo

Este documento detalla los **criterios y estándares** que se siguen para crear plantillas de invitaciones digitales en el sistema. Estos criterios aseguran consistencia, calidad visual premium y funcionalidad completa.

---

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
- ✅ Hero con nombres en tipografía script grande
- ✅ Countdown con cajas decorativas y esquinas ornamentales
- ✅ Detalles del evento con iconografía vintage
- ✅ Galería con efecto grayscale → color
- ✅ Información de regalo con diseño clásico
- ✅ Control de música con estilo vintage
- ✅ Footer con divisores decorativos

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
- ✅ Hero con gradiente holográfico y partículas flotantes
- ✅ Countdown con glass cards y glow effects
- ✅ Detalles con glassmorphism y bordes luminosos
- ✅ Galería con efectos de hover holográfico
- ✅ RSVP form con diseño futurista
- ✅ Música con controles estilo aurora
- ✅ Footer con gradiente de cierre

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
  ├── VintageEleganceTemplate.tsx  (466 líneas)
  └── AuroraDreamyTemplate.tsx     (420 líneas)
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

---

## 🎯 Próximas Mejoras Sugeridas

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

**Última actualización:** 2026-01-28
**Versión:** 1.1
**Nuevas plantillas:** 2 (Vintage Elegance, Aurora Dreamy)
