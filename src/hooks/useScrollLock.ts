'use client';

import { useCallback } from 'react';

/**
 * Mobile-safe scroll lock hook
 * 
 * Completely bypasses scroll lock on mobile devices to prevent scroll repositioning issues.
 * On desktop, provides simple scroll lock during button interactions.
 * 
 * Mobile detection: User agent + screen width check
 * Mobile behavior: Direct callback execution without scroll manipulation
 * Desktop behavior: Simple overflow hidden + position restoration
 */
export const useScrollLock = () => {

  // SCROLL LOCK - simplified and mobile-safe
  const withUltraScrollLock = useCallback(<T extends unknown[]>(callback: (...args: T) => void) => {
    return (...args: T) => {
      // BULLETPROOF mobile detection - prioritize user agent over window.innerWidth
      const isIOSDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isAndroidDevice = /Android/i.test(navigator.userAgent);
      const isMobileUA = /webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isMobileScreen = window.innerWidth < 768;
      
      // If ANY mobile indicator is true, skip scroll lock
      const isMobile = isIOSDevice || isAndroidDevice || isMobileUA || isMobileScreen;
      
      if (isMobile) {
        // Mobile: Execute callback directly - NO scroll manipulation whatsoever
        callback(...args);
        return;
      }

      // Desktop: Simple scroll lock for better UX
      const body = document.body;
      const html = document.documentElement;
      const startScrollY = window.scrollY;
      
      // Store original overflow
      const originalBodyOverflow = body.style.overflow;
      const originalHtmlOverflow = html.style.overflow;
      
      // Apply scroll lock
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
      
      try {
        // Execute callback immediately
        callback(...args);
      } finally {
        // Restore after a short delay
        setTimeout(() => {
          body.style.overflow = originalBodyOverflow;
          html.style.overflow = originalHtmlOverflow;
          window.scrollTo({ top: startScrollY, left: 0, behavior: 'instant' });
        }, 50);
      }
    };
  }, []);

  // Alias both methods to the ultra version for consistency
  return { 
    withScrollLock: withUltraScrollLock, 
    withInvisibleScrollLock: withUltraScrollLock 
  };
};