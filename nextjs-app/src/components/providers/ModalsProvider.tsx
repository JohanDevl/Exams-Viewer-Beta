'use client';

import { FavoritesModal, StatisticsModal, SettingsModal } from '@/components/modals';
import { ExportModal } from '@/components/modals/ExportModal';

export function ModalsProvider() {
  return (
    <>
      <FavoritesModal />
      <StatisticsModal />
      <SettingsModal />
      <ExportModal />
    </>
  );
}