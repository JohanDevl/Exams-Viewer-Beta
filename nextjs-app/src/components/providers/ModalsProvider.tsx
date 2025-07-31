'use client';

import { FavoritesModal, StatisticsModal, SettingsModal } from '@/components/modals';

export function ModalsProvider() {
  return (
    <>
      <FavoritesModal />
      <StatisticsModal />
      <SettingsModal />
    </>
  );
}