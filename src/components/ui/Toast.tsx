'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToastMessage } from '@/types';

interface ToastProps extends ToastMessage {
  onClose: () => void;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
};

export function Toast({ type, title, description, duration, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const Icon = toastIcons[type];

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

  useEffect(() => {
    // Entry animation - instant on mobile to prevent scroll repositioning
    const timer = setTimeout(() => setIsVisible(true), isMobile ? 0 : 50);
    return () => clearTimeout(timer);
  }, [isMobile]);

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => {
          onClose();
        }, isMobile ? 0 : 200); // Instant close on mobile
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, isMobile]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, isMobile ? 0 : 200); // Instant close on mobile
  };

  return (
    <div
      className={cn(
        // Disable animations on mobile to prevent scroll repositioning
        isMobile ? '' : 'transform transition-all duration-200 ease-in-out will-change-transform',
        'border rounded-lg shadow-lg p-3 sm:p-4 max-w-sm w-full',
        toastStyles[type],
        // Only apply transform classes on desktop
        !isMobile && (isVisible && !isLeaving ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'),
        // Always show on mobile to prevent animations
        isMobile && 'opacity-100'
      )}
      role="alert"
      aria-live="polite"
      style={isMobile ? {
        // Simple static positioning on mobile - no transforms
        position: 'static',
        zIndex: 'auto'
      } : { 
        // Use transform3d for better desktop performance
        transform: isVisible && !isLeaving 
          ? 'translate3d(0, 0, 0)' 
          : 'translate3d(0, -100%, 0)',
        position: 'relative',
        zIndex: 1
      }}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{title}</p>
          {description && (
            <p className="text-sm opacity-90 mt-1">{description}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}