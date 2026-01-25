"use client";

import { ReactNode, useMemo } from 'react';
import { ThemeConfig, generateCSSVariables, DEFAULT_THEME_CONFIG } from '@/lib/theme-config';

interface InvitationThemeProviderProps {
  children: ReactNode;
  themeConfig?: Partial<ThemeConfig>;
}

export function InvitationThemeProvider({ 
  children, 
  themeConfig 
}: InvitationThemeProviderProps) {
  
  // Combinar configuración por defecto con la proporcionada
  const config = useMemo<ThemeConfig>(() => ({
    ...DEFAULT_THEME_CONFIG,
    ...themeConfig
  }), [themeConfig]);
  
  // Generar variables CSS
  const cssVariables = useMemo(() => {
    return generateCSSVariables(config);
  }, [config]);
  
  return (
    <div 
      className="invitation-theme-wrapper" 
      style={cssVariables as React.CSSProperties}
    >
      {children}
    </div>
  );
}
