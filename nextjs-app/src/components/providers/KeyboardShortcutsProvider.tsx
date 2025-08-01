'use client';

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function KeyboardShortcutsProvider() {
  useKeyboardShortcuts();
  
  // This component renders nothing, it just sets up keyboard listeners
  return null;
}