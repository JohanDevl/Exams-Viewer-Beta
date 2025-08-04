'use client';

import { useCallback } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

// Sound types that can be played
export type SoundType = 
  | 'submit' 
  | 'correct' 
  | 'incorrect' 
  | 'favorite' 
  | 'navigation' 
  | 'notification' 
  | 'success' 
  | 'error' 
  | 'warning';

// Web Audio API based sound generation
const createAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return AudioContextClass ? new AudioContextClass() : null;
};

// Generate different tones for different actions
const generateTone = (frequency: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine') => {
  const audioContext = createAudioContext();
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = type;

  // Envelope for smoother sound
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

// Generate chord/multiple tones
const generateChord = (frequencies: number[], duration: number) => {
  frequencies.forEach(freq => generateTone(freq, duration));
};

export const useSoundEffects = () => {
  const { settings } = useSettingsStore();

  const playSound = useCallback((soundType: SoundType) => {
    if (!settings.soundEffects) return;
    
    // COMPLETELY disable sounds on mobile to prevent setTimeout interference with scroll lock
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) return;
    
    // Only play sounds if the user has interacted with the page (browser requirement)
    if (typeof window === 'undefined' || (!window.AudioContext && !(window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)) {
      return;
    }

    try {
      switch (soundType) {
        case 'submit':
          // Higher pitched tone for submission
          generateTone(800, 0.15);
          break;
          
        case 'correct':
          // Success chord - major triad
          generateChord([523, 659, 784], 0.3); // C5, E5, G5
          break;
          
        case 'incorrect':
          // Error tone - lower, dissonant
          generateTone(200, 0.3, 'square');
          setTimeout(() => generateTone(180, 0.2, 'square'), 100);
          break;
          
        case 'favorite':
          // Quick high-pitched blip
          generateTone(1000, 0.1);
          setTimeout(() => generateTone(1200, 0.1), 120);
          break;
          
        case 'navigation':
          // Subtle click sound
          generateTone(600, 0.05, 'triangle');
          break;
          
        case 'notification':
          // Gentle notification sound
          generateTone(440, 0.1);
          setTimeout(() => generateTone(554, 0.1), 150);
          break;
          
        case 'success':
          // Positive ascending tone
          generateTone(523, 0.1); // C5
          setTimeout(() => generateTone(659, 0.1), 100); // E5
          setTimeout(() => generateTone(784, 0.2), 200); // G5
          break;
          
        case 'error':
          // Descending error tone
          generateTone(400, 0.15, 'square');
          setTimeout(() => generateTone(300, 0.15, 'square'), 100);
          break;
          
        case 'warning':
          // Double beep
          generateTone(600, 0.1);
          setTimeout(() => generateTone(600, 0.1), 200);
          break;
          
        default:
          // Default gentle tone
          generateTone(440, 0.1);
          break;
      }
    } catch (error) {
      // Silently fail if audio context creation fails
      console.warn('Could not play sound effect:', error);
    }
  }, [settings.soundEffects]);

  return { playSound };
};