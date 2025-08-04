'use client';

import { useCallback, useRef } from 'react';

export const useScrollLock = () => {
  const isLocked = useRef<boolean>(false);
  const lockQueue = useRef<number>(0);

  // ULTRA-AGGRESSIVE scroll lock for mobile - NO COMPROMISES
  const withUltraScrollLock = useCallback(<T extends unknown[]>(callback: (...args: T) => void) => {
    return (...args: T) => {
      // Detect mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      
      if (!isMobile) {
        // Desktop: simple callback execution
        callback(...args);
        return;
      }

      // Mobile: ULTRA-AGGRESSIVE lock
      const scrollY = window.scrollY;
      const body = document.body;
      const html = document.documentElement;
      
      // Increment lock queue
      lockQueue.current++;
      const currentLockId = lockQueue.current;
      
      // Store ALL original styles and properties
      const originalBodyStyle = body.style.cssText;
      const originalHtmlStyle = html.style.cssText;
      const originalBodyClass = body.className;
      const originalHtmlClass = html.className;
      
      // NUCLEAR OPTION: Complete page freeze
      body.style.cssText = `
        position: fixed !important;
        top: -${scrollY}px !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        height: 100vh !important;
        overflow: hidden !important;
        overscroll-behavior: none !important;
        touch-action: none !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      `;
      
      html.style.cssText = `
        overflow: hidden !important;
        height: 100% !important;
        overscroll-behavior: none !important;
        touch-action: none !important;
        position: fixed !important;
        width: 100% !important;
      `;
      
      // Add lock classes for additional CSS control
      body.classList.add('scroll-locked', 'ultra-locked');
      html.classList.add('scroll-locked', 'ultra-locked');
      
      // Disable ALL scroll-related events during lock
      const preventAllScrollEvents = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      };
      
      const scrollEvents = ['scroll', 'touchmove', 'touchstart', 'touchend', 'wheel', 'mousewheel'];
      scrollEvents.forEach(event => {
        document.addEventListener(event, preventAllScrollEvents, { passive: false, capture: true });
        window.addEventListener(event, preventAllScrollEvents, { passive: false, capture: true });
      });
      
      isLocked.current = true;
      
      try {
        // Execute callback immediately while completely locked
        callback(...args);
      } finally {
        // EXTENDED delay for mobile - NO RUSH
        const restoreDelay = 300; // 300ms pour être sûr
        
        setTimeout(() => {
          // Only restore if we're still the current lock
          if (lockQueue.current === currentLockId) {
            // Remove event listeners
            scrollEvents.forEach(event => {
              document.removeEventListener(event, preventAllScrollEvents, { capture: true });
              window.removeEventListener(event, preventAllScrollEvents, { capture: true });
            });
            
            // Restore classes
            body.className = originalBodyClass;
            html.className = originalHtmlClass;
            
            // Restore styles
            body.style.cssText = originalBodyStyle;
            html.style.cssText = originalHtmlStyle;
            
            // Restore scroll position with multiple attempts
            const restoreScroll = () => {
              window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
              // Double-check after a tick
              requestAnimationFrame(() => {
                if (window.scrollY !== scrollY) {
                  window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
                }
              });
            };
            
            restoreScroll();
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