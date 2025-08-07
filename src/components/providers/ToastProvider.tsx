'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { Toast } from '@/components/ui/Toast';

export function ToastProvider() {
  const { toasts, removeToast } = useSettingsStore();
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

  return (
    <div className={`fixed z-50 flex flex-col gap-2 max-w-sm transition-all duration-200 ${
      isMobile 
        ? 'top-2 left-2 right-2 max-w-none' // Full width on mobile, positioned at top
        : 'top-4 right-4' // Standard positioning on desktop
    }`}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}