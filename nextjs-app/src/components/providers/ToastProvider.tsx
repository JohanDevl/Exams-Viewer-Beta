'use client';

import { useSettingsStore } from '@/stores/settingsStore';
import { Toast } from '@/components/ui/Toast';

export function ToastProvider() {
  const { toasts, removeToast } = useSettingsStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}