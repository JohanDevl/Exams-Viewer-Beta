'use client';

import { useCallback, useRef } from 'react';

export const useScrollLock = () => {
  const originalScrollY = useRef<number>(0);
  const isLocked = useRef<boolean>(false);

  const gentleScrollPrevent = useCallback(() => {
    if (isLocked.current) {
      // Check if scroll position has changed
      if (Math.abs(window.scrollY - originalScrollY.current) > 5) {
        // Gently restore position without jarring effects
        window.scrollTo({
          top: originalScrollY.current,
          behavior: 'instant' as ScrollBehavior
        });
      }
    }
  }, []);


  const withScrollLock = useCallback(<T extends unknown[]>(callback: (...args: T) => void) => {
    return (...args: T) => {
      // Store initial position
      originalScrollY.current = window.scrollY;
      isLocked.current = true;
      
      // Set up gentle monitoring with minimal frequency
      const monitorInterval = setInterval(gentleScrollPrevent, 16); // ~60fps
      
      try {
        callback(...args);
      } finally {
        // Release lock after minimal delay (just one animation frame)
        setTimeout(() => {
          isLocked.current = false;
          clearInterval(monitorInterval);
        }, 16); // Just one frame to let React update
      }
    };
  }, [gentleScrollPrevent]);

  // Ultra-aggressive invisible scroll lock - complete body locking without clipping
  const withInvisibleScrollLock = useCallback(<T extends unknown[]>(callback: (...args: T) => void) => {
    return (...args: T) => {
      // Store current state
      const scrollY = window.scrollY;
      const body = document.body;
      const html = document.documentElement;
      
      // Store original styles
      const originalBodyStyle = body.style.cssText;
      const originalHtmlStyle = html.style.cssText;
      
      // Apply ultra-aggressive scroll lock before any action
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      body.style.height = '100vh';
      body.style.overflow = 'hidden';
      
      // Also lock html element
      html.style.overflow = 'hidden';
      html.style.height = '100%';
      
      // Disable touch actions on the entire document
      body.style.touchAction = 'none';
      html.style.touchAction = 'none';
      
      try {
        // Execute the callback immediately while locked
        callback(...args);
      } finally {
        // Restore everything with proper delay for mobile to prevent clipping
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        const restoreDelay = isMobile ? 100 : 16; // Longer delay on mobile
        
        setTimeout(() => {
          // Restore original styles
          body.style.cssText = originalBodyStyle;
          html.style.cssText = originalHtmlStyle;
          
          // Restore scroll position silently
          window.scrollTo(0, scrollY);
        }, restoreDelay);
      }
    };
  }, []);

  return { withScrollLock, withInvisibleScrollLock };
};