'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { Toast } from '@/components/ui/Toast';

export function ToastProvider() {
  const { toasts, removeToast } = useSettingsStore();
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile on client-side only to avoid SSR mismatch
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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