'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

export function ThemeInitializer() {
  const { applyTheme, applyDefaultSidebarPosition, settings } = useSettingsStore();
  
  useEffect(() => {
    // Apply initial theme
    applyTheme();
    
    // Apply initial sidebar position
    applyDefaultSidebarPosition();
    
    // Listen for system preference changes if theme is set to "system"
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme, settings.defaultSidebarPosition, applyTheme, applyDefaultSidebarPosition]);

  // This component renders nothing, it just serves to initialize theme and sidebar
  return null;
}