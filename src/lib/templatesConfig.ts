export interface TemplateConfig {
    id: string;
    label: string;
    description: string;
    category: 'ELEGANT' | 'MODERN' | 'RUSTIC' | 'KIDS' | 'THEMATIC' | 'CORPORATE';
    icon: string; // Emoji for now, can be image URL later
    colors: string[]; // Preview colors
}

export const TEMPLATES_CONFIG: TemplateConfig[] = [
    // --- ELEGANT (Bodas, Galas) ---
    {
        id: 'GOLDEN',
        label: 'Golden Luxury',
        description: 'Lujo editorial con acentos dorados y tipografía serif.',
        category: 'ELEGANT',
        icon: '👑',
        colors: ['#D4AF37', '#FDFCF8', '#1a1a1a']
    },
    {
        id: 'ROYAL',
        label: 'Royal Velvet',
        description: 'Elegancia real con texturas de terciopelo y oro.',
        category: 'ELEGANT',
        icon: '⚜️',
        colors: ['#300000', '#D4AF37', '#000000']
    },
    {
        id: 'CHAMPAGNE',
        label: 'Champagne Gala',
        description: 'Burbujas doradas animadas, festivo y sofisticado.',
        category: 'ELEGANT',
        icon: '🥂',
        colors: ['#F7E7CE', '#D4AF37', '#FFFFFF']
    },
    {
        id: 'ORIGINAL',
        label: 'Classic Original',
        description: 'El diseño clásico original con detalles suaves.',
        category: 'ELEGANT',
        icon: '✨',
        colors: ['#c7757f', '#ffffff', '#000000']
    },
    {
        id: 'VINTAGE_ELEGANCE',
        label: 'Vintage Elegance',
        description: 'Art Deco con marcos ornamentales y tipografía clásica.',
        category: 'ELEGANT',
        icon: '🎭',
        colors: ['#B48E60', '#FBF8F3', '#8B6F47']
    },

    // --- MODERN (Fiestas, XV, Eventos) ---
    {
        id: 'CINEMATIC',
        label: 'Cinematic Love',
        description: 'Estilo película con video de fondo y tipografía minimal.',
        category: 'MODERN',
        icon: '🎬',
        colors: ['#000000', '#FFFFFF', '#333333']
    },
    {
        id: 'NEON',
        label: 'Neon Night',
        description: 'Estilo nocturno, modo oscuro y luces de neón.',
        category: 'MODERN',
        icon: '⚡',
        colors: ['#000000', '#00F3FF', '#FF00FF']
    },
    {
        id: 'CYBERPUNK',
        label: 'Cyberpunk Party',
        description: 'Glitch art, tecnología agresiva y colores vibrantes.',
        category: 'MODERN',
        icon: '🤖',
        colors: ['#000000', '#FCEE09', '#00F3FF']
    },
    {
        id: 'PARALLAX',
        label: 'Modern Parallax',
        description: 'Efectos de profundidad y scroll suave.',
        category: 'MODERN',
        icon: '🖼️',
        colors: ['#ffffff', '#000000', '#666666']
    },
    {
        id: 'GALLERY',
        label: 'Minimal Gallery',
        description: 'Limpio, estilo museo, foco en fotografía.',
        category: 'MODERN',
        icon: '🎨',
        colors: ['#ffffff', '#000000', '#f5f5f5']
    },
    {
        id: 'GLASS',
        label: 'Ethereal Glass',
        description: 'Glassmorphism, transparencias y 3D flotante.',
        category: 'MODERN',
        icon: '🧊',
        colors: ['#e0f2fe', '#ffffff', '#bae6fd']
    },
    {
        id: 'AURORA_DREAMY',
        label: 'Aurora Dreamy',
        description: 'Gradientes holográficos con efectos iridiscentes modernos.',
        category: 'MODERN',
        icon: '🌈',
        colors: ['#667eea', '#f093fb', '#4facfe']
    },

    // --- RUSTIC (Bodas aire libre) ---
    {
        id: 'BOHO',
        label: 'Boho Chic',
        description: 'Rústico, tonos tierra, texturas naturales.',
        category: 'RUSTIC',
        icon: '🌾',
        colors: ['#F7F5F0', '#C17C74', '#D4C5B0']
    },
    {
        id: 'BOTANICAL',
        label: 'Botanical Garden',
        description: 'Acuarelas botánicas y mucha naturaleza.',
        category: 'RUSTIC',
        icon: '🌿',
        colors: ['#F0FFF0', '#2E8B57', '#8FBC8F']
    },
    {
        id: 'SUNSET',
        label: 'Beach Sunset',
        description: 'Gradientes cálidos de atardecer en la playa.',
        category: 'RUSTIC',
        icon: '🌅',
        colors: ['#FF7F50', '#8A2BE2', '#FFD700']
    },

    // --- THEMATIC (Romántico, Retro, Temas) ---
    {
        id: 'FLORAL',
        label: 'Floral Dream',
        description: 'Romántico y femenino con flores pastel y pétalos.',
        category: 'THEMATIC',
        icon: '🌸',
        colors: ['#FFF0F5', '#FF69B4', '#FFB6C1']
    },
    {
        id: 'VINTAGE',
        label: 'Vintage Story',
        description: 'Nostalgia, papel envejecido y estilo typewriter.',
        category: 'THEMATIC',
        icon: '📜',
        colors: ['#F4E4BC', '#8B4513', '#2F1B12']
    },
    {
        id: 'RETRO',
        label: 'Retro 80s',
        description: 'Vaporwave, palmeras y gradientes ochenteros.',
        category: 'THEMATIC',
        icon: '📼',
        colors: ['#FF00FF', '#00FFFF', '#FFFF00']
    },
    {
        id: 'VIBRANT',
        label: 'Vibrant Fiesta',
        description: 'Explosión de color, confetti y pura alegría.',
        category: 'THEMATIC',
        icon: '🎉',
        colors: ['#FF0000', '#FFFF00', '#0000FF']
    },

    // --- KIDS (Infantil, Baby Shower) ---
    {
        id: 'KIDS_PLAYFUL',
        label: 'Playful Kids',
        description: 'Alegre, formas suaves y colores primarios.',
        category: 'KIDS',
        icon: '🎈',
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D']
    },
    {
        id: 'KIDS_JUNGLE',
        label: 'Jungle Safari',
        description: 'Animales de la selva, hojas y aventuras.',
        category: 'KIDS',
        icon: '🦁',
        colors: ['#8DA399', '#D4C5B0', '#4A5D23']
    },
    {
        id: 'KIDS_SPACE',
        label: 'Space Explorer',
        description: 'Cohetes, estrellas y planetas animados.',
        category: 'KIDS',
        icon: '🚀',
        colors: ['#0B1026', '#4B0082', '#FFD700']
    },
    {
        id: 'KIDS_DINO',
        label: 'Dino Party',
        description: 'Dinosaurios divertidos y texturas prehistóricas.',
        category: 'KIDS',
        icon: '🦕',
        colors: ['#6B8E23', '#D2691E', '#F5DEB3']
    },
    {
        id: 'KIDS_CLOUDS',
        label: 'Pastel Clouds',
        description: 'Nubes esponjosas, ideal Baby Shower.',
        category: 'KIDS',
        icon: '☁️',
        colors: ['#E0FFFF', '#E6E6FA', '#FFFFFF']
    }
];

export const CATEGORY_LABELS: Record<string, string> = {
    'ELEGANT': 'Elegante & Formal',
    'MODERN': 'Moderno & Trendy',
    'RUSTIC': 'Rústico & Natural',
    'THEMATIC': 'Temáticos',
    'KIDS': 'Infantil & Baby',
    'CORPORATE': 'Corporativo'
};
