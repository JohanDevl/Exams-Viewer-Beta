'use client';

import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import type { ReactNode } from 'react';

interface SessionPersistenceProviderProps {
  children: ReactNode;
}

export function SessionPersistenceProvider({ children }: SessionPersistenceProviderProps) {
  useSessionPersistence();
  
  return <>{children}</>;
}