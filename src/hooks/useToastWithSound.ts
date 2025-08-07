'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSoundEffects, type SoundType } from '@/hooks/useSoundEffects';
import type { ToastMessage } from '@/types';

export const useToastWithSound = () => {
  const { addToast } = useSettingsStore();
  const { playSound } = useSoundEffects();
  const [isMobile, setIsMobile] = useState(false);
  
  // Static mobile detection to avoid iOS Safari viewport resize issues
  useEffect(() => {
    const detectMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    
    // Only detect once on mount - no resize listener to avoid Safari repositioning bug
    detectMobile();
    
    // Don't add resize listener on iOS Safari to prevent scroll repositioning
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOSSafari) {
      // Only add resize listener on non-iOS devices
      window.addEventListener('resize', detectMobile);
      return () => window.removeEventListener('resize', detectMobile);
    }
  }, []);

  const addToastWithSound = (toast: Omit<ToastMessage, 'id'>) => {
    // Play appropriate sound based on toast type
    let soundType: SoundType;
    switch (toast.type) {
      case 'success':
        soundType = 'success';
        break;
      case 'error':
        soundType = 'error';
        break;
      case 'warning':
        soundType = 'warning';
        break;
      case 'info':
      default:
        soundType = 'notification';
        break;
    }

    playSound(soundType);
    
    // TEMPORARY: Skip ALL toasts on mobile to test scroll issue
    if (isMobile) {
      console.log('Toast skipped on mobile:', toast.title); // For debugging
      return; // Skip all toasts on mobile temporarily
    }
    
    addToast(toast);
  };

  return { addToast: addToastWithSound };
};