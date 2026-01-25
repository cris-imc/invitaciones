import { useState, useEffect, useCallback } from 'react';
import { ThemeConfig, DEFAULT_THEME_CONFIG } from '@/lib/theme-config';

export function usePersistConfig(
  initialConfig?: ThemeConfig,
  invitationId?: string
) {
  const [config, setConfigState] = useState<ThemeConfig>(
    initialConfig || DEFAULT_THEME_CONFIG
  );

  // Initialize from props if provided (and different from default state)
  useEffect(() => {
    if (initialConfig) {
      setConfigState(initialConfig);
    }
  }, [initialConfig]);

  const setConfig = useCallback((newConfig: ThemeConfig) => {
    setConfigState(newConfig);
    
    // Here we would implement the API sync logic
    if (invitationId) {
      // TODO: Implement sync with API
      // syncConfigWithApi(invitationId, newConfig);
      // console.log('Syncing config with API for invitation:', invitationId);
    }
  }, [invitationId]);

  const updateConfig = useCallback((updates: Partial<ThemeConfig>) => {
    setConfigState((prev) => {
      const newConfig = { ...prev, ...updates };
      
      if (invitationId) {
        // TODO: Implement sync with API
        // console.log('Syncing partial update with API:', updates);
      }
      
      return newConfig;
    });
  }, [invitationId]);

  return {
    config,
    setConfig,
    updateConfig
  };
}
