'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

export function ThemeInitializer() {
  const { applyTheme, applyDefaultSidebarPosition, setCurrentView, settings } = useSettingsStore();
  
  useEffect(() => {
    // Apply initial theme
    applyTheme();
    
    // Apply initial sidebar position
    applyDefaultSidebarPosition();
    
    // Force card view on mobile, respect defaultView on desktop
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setCurrentView('card');
    } else {
      setCurrentView(settings.defaultView);
    }
    
    // Listen for system preference changes if theme is set to "system"
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme, settings.defaultSidebarPosition, settings.defaultView, applyTheme, applyDefaultSidebarPosition, setCurrentView]);

  // This component renders nothing, it just serves to initialize theme, sidebar and view mode
  return null;
}