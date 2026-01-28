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

**Última actualización:** 2026-01-27
**Versión:** 1.0
