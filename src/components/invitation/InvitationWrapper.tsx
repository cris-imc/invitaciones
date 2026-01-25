"use client";

import React, { ReactNode } from "react";
import { ThemeConfig, generateCSSVariables, FONT_FAMILIES } from "@/lib/theme-config";
import { InvitationConfigProvider, useInvitationConfig } from "@/contexts/InvitationConfigContext";
import { usePersistConfig } from "@/hooks/usePersistConfig";

// Internal component to handle styles consumption
function InvitationStyleApplicator({ children }: { children: ReactNode }) {
  const { config } = useInvitationConfig();

  // Generate base CSS variables from helper
  const baseVariables = generateCSSVariables(config);
  
  // Get font details
  const fontConfig = FONT_FAMILIES[config.fontFamily as keyof typeof FONT_FAMILIES];

  // Map to Shadcn UI variables and specific prompt requirements
  const styleVariables = {
    ...baseVariables,
    // Explicit mapping requested
    "--primary": config.primaryColor,
    "--background": config.backgroundColor,
    "--font-family": fontConfig ? fontConfig.cssValue : "inherit",
    
    // Mapping for Shadcn components to inherit look
    "--foreground": config.textDark,
    "--muted": "#f4f4f5", // Fallback or calculated
    "--muted-foreground": config.textSecondary,
    "--card": config.backgroundColor,
    "--card-foreground": config.textDark,
    "--border": `${config.primaryColor}20`, // 20% opacity for borders
    "--radius": "0.5rem",
    
    // Ensure font applies to sans variable often used by Shadcn
    "--font-sans": fontConfig ? fontConfig.cssValue : "sans-serif",
  } as React.CSSProperties;

  return (
    <div 
      style={styleVariables}
      className={`min-h-screen w-full bg-background text-foreground font-sans ${fontConfig && fontConfig.id === 'playfair' ? 'font-serif' : ''}`}
    >
      {/* Inject Google Font Link */}
      {fontConfig && (
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=${fontConfig.googleFont}&display=swap');
          
          body {
            font-family: ${fontConfig.cssValue};
          }
        `}</style>
      )}
      {children}
    </div>
  );
}

interface InvitationWrapperProps {
  initialConfig: ThemeConfig;
  invitationId?: string; // Optional ID for persistence
  children: ReactNode;
}

export default function InvitationWrapper({ 
  initialConfig, 
  invitationId, 
  children 
}: InvitationWrapperProps) {
  // Initialize config state
  const configState = usePersistConfig(initialConfig, invitationId);

  return (
    <InvitationConfigProvider value={configState}>
      <InvitationStyleApplicator>
        {children}
      </InvitationStyleApplicator>
    </InvitationConfigProvider>
  );
}
