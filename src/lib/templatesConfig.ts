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
    {
        id: 'LUXURY',
        label: 'Luxury Minimalist',
        description: 'Minimalismo editorial de alto nivel con tipografía serif.',
        category: 'ELEGANT',
        icon: '💎',
        colors: ['#1a1a1a', '#ffffff', '#f5f5f5']
    },

    // --- MODERN (Fiestas, XV, Eventos) ---
    {
        id: 'NEON',
        label: 'Neon Night',
        description: 'Estilo nocturno, modo oscuro y luces de neón.',
        category: 'MODERN',
        icon: '⚡',
        colors: ['#000000', '#00F3FF', '#FF00FF']
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
        id: 'LIQUID',
        label: 'Liquid Crystal',
        description: 'Estilo etéreo de cristal líquido con gradientes suaves.',
        category: 'MODERN',
        icon: '🧊',
        colors: ['#818cf8', '#c4b5fd', '#e0e7ff']
    },
    {
        id: 'BENTO',
        label: 'Modern Bento',
        description: 'Diseño estructurado ultra-moderno estilo Grid.',
        category: 'MODERN',
        icon: '🎨',
        colors: ['#a3e635', '#84cc16', '#65a30d']
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
        id: 'BOTANICAL',
        label: 'Botanical Garden',
        description: 'Acuarelas botánicas y mucha naturaleza.',
        category: 'RUSTIC',
        icon: '🌿',
        colors: ['#F0FFF0', '#2E8B57', '#8FBC8F']
    },

    // --- THEMATIC (Romántico, Retro, Temas) ---
    {
        id: 'DISCO_NIGHT',
        label: 'Disco Night',
        description: 'Fiesta de discoteca con neón vibrante y luces estroboscópicas.',
        category: 'THEMATIC',
        icon: '🕺',
        colors: ['#FF006E', '#8338EC', '#3A86FF']
    },

    // --- KIDS (Infantil, Baby Shower) ---
    {
        id: 'KIDS_PARTY',
        label: 'Kids Party',
        description: 'Fiesta infantil colorida con animaciones bounce y confetti.',
        category: 'KIDS',
        icon: '🎈',
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D']
    },
    {
        id: 'BABY_BAPTISM',
        label: 'Baby Baptism',
        description: 'Diseño tierno para bebés con paleta pastel y elementos suaves.',
        category: 'KIDS',
        icon: '👶',
        colors: ['#FADADD', '#E8E9F3', '#F0E5CF']
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
