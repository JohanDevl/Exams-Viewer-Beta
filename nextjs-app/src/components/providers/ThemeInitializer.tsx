'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

export function ThemeInitializer() {
  const { applyTheme, settings } = useSettingsStore();
  
  useEffect(() => {
    // Apply initial theme
    applyTheme();
    
    // Listen for system preference changes if theme is set to "system"
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme, applyTheme]);

  // This component renders nothing, it just serves to initialize the theme
  return null;
}