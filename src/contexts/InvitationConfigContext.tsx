import React, { createContext, useContext, ReactNode } from 'react';
import { ThemeConfig } from '@/lib/theme-config';

// Re-export ThemeConfig as InvitationConfig for consistency with the request
export type InvitationConfig = ThemeConfig;

interface InvitationConfigContextType {
  config: InvitationConfig;
  setConfig: (config: InvitationConfig) => void;
  updateConfig: (updates: Partial<InvitationConfig>) => void;
}

const InvitationConfigContext = createContext<InvitationConfigContextType | undefined>(undefined);

export function useInvitationConfig() {
  const context = useContext(InvitationConfigContext);
  if (!context) {
    throw new Error('useInvitationConfig must be used within an InvitationConfigProvider');
  }
  return context;
}

interface InvitationConfigProviderProps {
  children: ReactNode;
  value: InvitationConfigContextType;
}

export function InvitationConfigProvider({
  children,
  value,
}: InvitationConfigProviderProps) {
  return (
    <InvitationConfigContext.Provider value={value}>
      {children}
    </InvitationConfigContext.Provider>
  );
}
