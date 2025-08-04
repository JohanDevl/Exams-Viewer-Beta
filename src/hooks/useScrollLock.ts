'use client';

import { useCallback, useRef } from 'react';

export const useScrollLock = () => {
  const isLocked = useRef<boolean>(false);
  const lockQueue = useRef<number>(0);

  // INVISIBLE SCROLL LOCK for mobile - effective but seamless  
  const withUltraScrollLock = useCallback(<T extends unknown[]>(callback: (...args: T) => void) => {
    return (...args: T) => {
      // Detect mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      
      if (!isMobile) {
        // Desktop: simple callback execution
        callback(...args);
        return;
      }

      // Mobile: SMART INVISIBLE lock
      const startScrollY = window.scrollY;
      const body = document.body;
      const html = document.documentElement;
      
      // Increment lock queue
      lockQueue.current++;
      const currentLockId = lockQueue.current;
      
      // Store original overflow only
      const originalBodyOverflow = body.style.overflow;
      const originalHtmlOverflow = html.style.overflow;
      const originalBodyTouchAction = body.style.touchAction;
      const originalHtmlTouchAction = html.style.touchAction;
      
      // MINIMAL but effective lock - preserve visual appearance
      body.style.overflow = 'hidden';
      body.style.touchAction = 'none';
      html.style.overflow = 'hidden';
      html.style.touchAction = 'none';
      
      // Smart scroll prevention that maintains position
      const smartScrollPrevent = (e: Event) => {
        // Only prevent scroll events, not touch events for buttons
        if (e.type === 'scroll' || e.type === 'touchmove') {
          e.preventDefault();
          e.stopPropagation();
          // Instantly restore scroll position if it changed
          if (window.scrollY !== startScrollY) {
            window.scrollTo(0, startScrollY);
          }
        }
      };
      
      const criticalScrollEvents = ['scroll', 'touchmove'];
      criticalScrollEvents.forEach(event => {
        document.addEventListener(event, smartScrollPrevent, { passive: false, capture: true });
        window.addEventListener(event, smartScrollPrevent, { passive: false, capture: true });
      });
      
      isLocked.current = true;
      
      try {
        // Execute callback immediately
        callback(...args);
      } finally {
        // MINIMAL delay for mobile - just enough
        const restoreDelay = 100; // 100ms minimum
        
        setTimeout(() => {
          // Only restore if we're still the current lock
          if (lockQueue.current === currentLockId) {
            // Remove event listeners
            criticalScrollEvents.forEach(event => {
              document.removeEventListener(event, smartScrollPrevent, { capture: true });
              window.removeEventListener(event, smartScrollPrevent, { capture: true });
            });
            
            // Restore original overflow styles only
            body.style.overflow = originalBodyOverflow;
            body.style.touchAction = originalBodyTouchAction;
            html.style.overflow = originalHtmlOverflow;  
            html.style.touchAction = originalHtmlTouchAction;
            
            // Final position check
            if (window.scrollY !== startScrollY) {
              window.scrollTo({ top: startScrollY, left: 0, behavior: 'instant' });
            }
            
            isLocked.current = false;
          }
        }, restoreDelay);
      }
    };
  }, []);

  // Alias both methods to the ultra version for consistency
  return { 
    withScrollLock: withUltraScrollLock, 
    withInvisibleScrollLock: withUltraScrollLock 
  };
};