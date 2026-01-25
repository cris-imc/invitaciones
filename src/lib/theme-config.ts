// Plantillas de colores predefinidas
export const COLOR_TEMPLATES = {
  'rosa-salmon': {
    id: 'rosa-salmon',
    name: 'Elegancia Rosa',
    primaryColor: '#c7757f',
    backgroundColor: '#ffffff',
    textDark: '#1a1a1a',
    textLight: '#ffffff',
    textSecondary: '#666666',
  },
  'azul-noche': {
    id: 'azul-noche',
    name: 'Azul Noche',
    primaryColor: '#4a90e2',
    backgroundColor: '#ffffff',
    textDark: '#1a1a1a',
    textLight: '#ffffff',
    textSecondary: '#666666',
  },
  'verde-menta': {
    id: 'verde-menta',
    name: 'Verde Menta',
    primaryColor: '#6fcf97',
    backgroundColor: '#ffffff',
    textDark: '#1a1a1a',
    textLight: '#ffffff',
    textSecondary: '#666666',
  },
  'purpura': {
    id: 'purpura',
    name: 'Púrpura Elegante',
    primaryColor: '#9b59b6',
    backgroundColor: '#ffffff',
    textDark: '#1a1a1a',
    textLight: '#ffffff',
    textSecondary: '#666666',
  },
  'dorado': {
    id: 'dorado',
    name: 'Dorado Sofisticado',
    primaryColor: '#d4af37',
    backgroundColor: '#ffffff',
    textDark: '#1a1a1a',
    textLight: '#ffffff',
    textSecondary: '#666666',
  },
  'coral': {
    id: 'coral',
    name: 'Coral Moderno',
    primaryColor: '#ff6b6b',
    backgroundColor: '#ffffff',
    textDark: '#1a1a1a',
    textLight: '#ffffff',
    textSecondary: '#666666',
  },
  'turquesa': {
    id: 'turquesa',
    name: 'Turquesa Tropical',
    primaryColor: '#1dd1a1',
    backgroundColor: '#ffffff',
    textDark: '#1a1a1a',
    textLight: '#ffffff',
    textSecondary: '#666666',
  },
  'borgona': {
    id: 'borgona',
    name: 'Borgoña Clásico',
    primaryColor: '#8e2d56',
    backgroundColor: '#ffffff',
    textDark: '#1a1a1a',
    textLight: '#ffffff',
    textSecondary: '#666666',
  },
} as const;

export type ColorTemplateId = keyof typeof COLOR_TEMPLATES;

// Configuración de tipografía
export const FONT_FAMILIES = {
  poppins: {
    id: 'poppins',
    name: 'Poppins (Moderna)',
    cssValue: "'Poppins', sans-serif",
    googleFont: 'Poppins:300,400,500,600,700',
  },
  montserrat: {
    id: 'montserrat',
    name: 'Montserrat (Elegante)',
    cssValue: "'Montserrat', sans-serif",
    googleFont: 'Montserrat:300,400,500,600,700',
  },
  raleway: {
    id: 'raleway',
    name: 'Raleway (Sofisticada)',
    cssValue: "'Raleway', sans-serif",
    googleFont: 'Raleway:300,400,500,600,700',
  },
  playfair: {
    id: 'playfair',
    name: 'Playfair Display (Clásica)',
    cssValue: "'Playfair Display', serif",
    googleFont: 'Playfair+Display:400,500,600,700',
  },
  lato: {
    id: 'lato',
    name: 'Lato (Limpia)',
    cssValue: "'Lato', sans-serif",
    googleFont: 'Lato:300,400,700',
  },
  roboto: {
    id: 'roboto',
    name: 'Roboto (Universal)',
    cssValue: "'Roboto', sans-serif",
    googleFont: 'Roboto:300,400,500,700',
  },
} as const;

export type FontFamilyId = keyof typeof FONT_FAMILIES;

// Configuración de espaciado
export const LETTER_SPACING_OPTIONS = {
  tight: { id: 'tight', name: 'Compacto', multiplier: 0.8 },
  normal: { id: 'normal', name: 'Normal', multiplier: 1.0 },
  wide: { id: 'wide', name: 'Amplio', multiplier: 1.2 },
  wider: { id: 'wider', name: 'Muy Amplio', multiplier: 1.4 },
} as const;

export const LINE_HEIGHT_OPTIONS = {
  tight: { id: 'tight', name: 'Compacto', multiplier: 0.9 },
  normal: { id: 'normal', name: 'Normal', multiplier: 1.0 },
  relaxed: { id: 'relaxed', name: 'Relajado', multiplier: 1.1 },
  loose: { id: 'loose', name: 'Amplio', multiplier: 1.2 },
} as const;

// Interface para la configuración del tema
export interface ThemeConfig {
  // Colores
  colorTemplate: ColorTemplateId;
  primaryColor: string;
  backgroundColor: string;
  textDark: string;
  textLight: string;
  textSecondary: string;
  
  // Tipografía
  fontFamily: FontFamilyId;
  fontScale: number;
  letterSpacing: keyof typeof LETTER_SPACING_OPTIONS;
  lineHeight: keyof typeof LINE_HEIGHT_OPTIONS;
  
  // Espaciado
  sectionSpacing: number;
  sectionPadding: number;
}

// Configuración por defecto
export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  colorTemplate: 'rosa-salmon',
  primaryColor: '#c7757f',
  backgroundColor: '#ffffff',
  textDark: '#1a1a1a',
  textLight: '#ffffff',
  textSecondary: '#666666',
  fontFamily: 'poppins',
  fontScale: 1.0,
  letterSpacing: 'normal',
  lineHeight: 'normal',
  sectionSpacing: 100,
  sectionPadding: 50,
};

// Utilidades para convertir colores
export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `${r}, ${g}, ${b}`;
}

// Generar variables CSS a partir de la configuración
export function generateCSSVariables(config: ThemeConfig): Record<string, string> {
  const letterSpacingMultiplier = LETTER_SPACING_OPTIONS[config.letterSpacing].multiplier;
  const lineHeightMultiplier = LINE_HEIGHT_OPTIONS[config.lineHeight].multiplier;
  const fontFamily = FONT_FAMILIES[config.fontFamily].cssValue;
  
  // Calculate derived colors (e.g., background-alt slightly darker than background)
  // Simple heuristic: if background is white, alt is f8f9fa. If dark, slightly lighter.
  const isDarkBg = config.backgroundColor.toLowerCase() === '#000000' || config.backgroundColor.toLowerCase() === '#1a1a1a';
  const backgroundAlt = isDarkBg ? '#2d2d2d' : '#f8fafc'; // slate-50 equivalent

  return {
    // Colores
    '--color-primary': config.primaryColor,
    '--color-primary-rgb': hexToRgb(config.primaryColor),
    '--color-background': config.backgroundColor,
    '--color-background-alt': backgroundAlt, 
    '--color-text-dark': config.textDark,
    '--color-text-light': config.textLight,
    '--color-text-secondary': config.textSecondary,
    
    // Tipografía
    '--font-primary': fontFamily,
    '--font-serif': fontFamily, // Map chosen font to serif/heading usage
    '--font-sans': '"Lato", sans-serif', // Keep body text readable always
    '--font-light': '300',
    '--font-normal': '400',
    '--font-medium': '500',
    '--font-semibold': '600',
    '--font-bold': '700',
    
    // Tamaños de texto
    '--text-xs': `${12 * config.fontScale}px`, // Slight bump for readability
    '--text-sm': `${14 * config.fontScale}px`,
    '--text-base': `${16 * config.fontScale}px`,
    '--text-lg': `${20 * config.fontScale}px`,
    '--text-xl': `${24 * config.fontScale}px`,
    '--text-2xl': `${32 * config.fontScale}px`,
    '--text-3xl': `${40 * config.fontScale}px`, // Adjusted for better hierarchy
    '--text-4xl': `${56 * config.fontScale}px`,
    
    // Letter spacing
    '--letter-spacing-tight': `${0.02 * letterSpacingMultiplier}em`,
    '--letter-spacing-normal': `${0.05 * letterSpacingMultiplier}em`,
    '--letter-spacing-wide': `${0.1 * letterSpacingMultiplier}em`,
    '--letter-spacing-wider': `${0.15 * letterSpacingMultiplier}em`,
    
    // Line height
    '--line-height-tight': String(1.1 * lineHeightMultiplier),
    '--line-height-snug': String(1.3 * lineHeightMultiplier),
    '--line-height-normal': String(1.5 * lineHeightMultiplier),
    '--line-height-relaxed': String(1.7 * lineHeightMultiplier),
    '--line-height-loose': String(1.8 * lineHeightMultiplier),
    
    // Espaciado
    '--section-spacing': `${config.sectionSpacing}px`,
    '--section-padding': `${config.sectionPadding}px`,
    '--element-spacing': `${config.sectionSpacing / 4}px`,
  };
}
