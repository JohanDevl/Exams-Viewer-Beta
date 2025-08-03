'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSoundEffects, type SoundType } from '@/hooks/useSoundEffects';
import type { ToastMessage } from '@/types';

export const useToastWithSound = () => {
  const { addToast } = useSettingsStore();
  const { playSound } = useSoundEffects();
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile on client-side only to avoid SSR mismatch
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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