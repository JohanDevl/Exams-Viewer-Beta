'use client';

import { useSettingsStore } from '@/stores/settingsStore';
import { useSoundEffects, type SoundType } from '@/hooks/useSoundEffects';
import type { ToastMessage } from '@/types';

export const useToastWithSound = () => {
  const { addToast } = useSettingsStore();
  const { playSound } = useSoundEffects();

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
    addToast(toast);
  };

  return { addToast: addToastWithSound };
};