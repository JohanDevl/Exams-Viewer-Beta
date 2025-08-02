import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';
import type { UserSettings, ToastMessage } from '@/types';

interface SettingsStore {
  // User settings
  settings: UserSettings;
  
  // UI state
  isSettingsModalOpen: boolean;
  isStatisticsModalOpen: boolean;
  isFavoritesModalOpen: boolean;
  isExportModalOpen: boolean;
  sidebarCollapsed: boolean;
  sidebarVisible: boolean;
  currentView: "list" | "card";
  
  // Messages toast
  toasts: ToastMessage[];
  
  
  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  
  // Modal actions
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openStatisticsModal: () => void;
  closeStatisticsModal: () => void;
  openFavoritesModal: () => void;
  closeFavoritesModal: () => void;
  openExportModal: () => void;
  closeExportModal: () => void;
  
  // Sidebar actions
  toggleSidebar: () => void;
  toggleSidebarVisibility: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarVisible: (visible: boolean) => void;

  // View actions
  setCurrentView: (view: "list" | "card") => void;
  toggleView: () => void;
  
  // Toast actions
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  
  // Utilitaires
  getThemePreference: () => 'light' | 'dark';
  applyTheme: () => void;
  applyDefaultSidebarPosition: () => void;
}

const defaultSettings: UserSettings = {
  theme: 'system',
  showExplanations: false,
  autoProgress: false,
  keyboardShortcuts: true,
  soundEffects: false,
  showDifficulty: true,
  showComments: false,
  defaultView: 'card',
  defaultSidebarPosition: 'hidden'
};

const generateToastId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: defaultSettings,
      isSettingsModalOpen: false,
      isStatisticsModalOpen: false,
      isFavoritesModalOpen: false,
      isExportModalOpen: false,
      sidebarCollapsed: false,
      sidebarVisible: true,
      currentView: defaultSettings.defaultView,
      toasts: [],

      // Update settings
      updateSettings: (newSettings: Partial<UserSettings>) => {
        const { settings } = get();
        const updatedSettings = { ...settings, ...newSettings };
        
        set({ settings: updatedSettings });
        
        // Apply theme if changed
        if (newSettings.theme) {
          get().applyTheme();
        }

        // Update current view if defaultView changed
        if (newSettings.defaultView) {
          set({ currentView: newSettings.defaultView });
        }

        // Apply sidebar position if changed
        if (newSettings.defaultSidebarPosition) {
          get().applyDefaultSidebarPosition();
        }
        
        // Afficher un toast de confirmation
        get().addToast({
          type: 'success',
          title: 'Settings updated',
          description: 'Your preferences have been saved',
          duration: 3000
        });
      },

      // Reset settings
      resetSettings: () => {
        set({ 
          settings: defaultSettings,
          currentView: defaultSettings.defaultView 
        });
        get().applyTheme();
        get().applyDefaultSidebarPosition();
        
        get().addToast({
          type: 'info',
          title: 'Settings reset',
          description: 'Default settings have been restored',
          duration: 3000
        });
      },

      // Gestion des modales
      openSettingsModal: () => set({ isSettingsModalOpen: true }),
      closeSettingsModal: () => set({ isSettingsModalOpen: false }),
      openStatisticsModal: () => set({ isStatisticsModalOpen: true }),
      closeStatisticsModal: () => set({ isStatisticsModalOpen: false }),
      openFavoritesModal: () => set({ isFavoritesModalOpen: true }),
      closeFavoritesModal: () => set({ isFavoritesModalOpen: false }),
      openExportModal: () => set({ isExportModalOpen: true }),
      closeExportModal: () => set({ isExportModalOpen: false }),

      // Gestion de la sidebar
      toggleSidebar: () => {
        const { sidebarCollapsed } = get();
        set({ sidebarCollapsed: !sidebarCollapsed });
      },

      toggleSidebarVisibility: () => {
        const { sidebarVisible } = get();
        set({ sidebarVisible: !sidebarVisible });
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      setSidebarVisible: (visible: boolean) => {
        set({ sidebarVisible: visible });
      },

      // Gestion des vues
      setCurrentView: (view: "list" | "card") => {
        set({ currentView: view });
      },

      toggleView: () => {
        const { currentView } = get();
        const newView = currentView === "list" ? "card" : "list";
        set({ currentView: newView });
        
        get().addToast({
          type: 'info',
          title: `Switched to ${newView} view`,
          description: `Questions are now displayed in ${newView} format`,
          duration: 2000
        });
      },

      // Gestion des toasts
      addToast: (toast: Omit<ToastMessage, 'id'>) => {
        const { toasts } = get();
        const newToast: ToastMessage = {
          ...toast,
          id: generateToastId()
        };
        
        set({ toasts: [...toasts, newToast] });
        
        // Auto-remove after specified duration
        if (toast.duration && toast.duration > 0) {
          setTimeout(() => {
            get().removeToast(newToast.id);
          }, toast.duration);
        }
      },

      removeToast: (id: string) => {
        const { toasts } = get();
        set({ toasts: toasts.filter(toast => toast.id !== id) });
      },

      clearToasts: () => {
        set({ toasts: [] });
      },


      // Get theme preference
      getThemePreference: (): 'light' | 'dark' => {
        const { settings } = get();
        
        if (settings.theme === 'system') {
          // Detect system preference
          if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }
          return 'light';
        }
        
        return settings.theme;
      },

      // Apply theme
      applyTheme: () => {
        if (typeof window === 'undefined') return;
        
        const theme = get().getThemePreference();
        const root = document.documentElement;
        
        // Remove existing theme classes
        root.classList.remove('light', 'dark');
        
        // Add new theme class
        root.classList.add(theme);
        
        // Update meta tag for mobile status bar color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
        }
      },

      // Apply default sidebar position
      applyDefaultSidebarPosition: () => {
        const { settings } = get();
        const { defaultSidebarPosition } = settings;
        
        switch (defaultSidebarPosition) {
          case 'hidden':
            set({ sidebarVisible: false, sidebarCollapsed: false });
            break;
          case 'collapsed':
            set({ sidebarVisible: true, sidebarCollapsed: true });
            break;
          case 'expanded':
            set({ sidebarVisible: true, sidebarCollapsed: false });
            break;
        }
      }
    }),
    {
      name: 'settings-store',
      partialize: (state) => ({
        settings: state.settings,
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarVisible: state.sidebarVisible,
        currentView: state.currentView
      })
    }
  )
);

// Hook to initialize theme on load
export const useInitializeTheme = () => {
  const { applyTheme, settings } = useSettingsStore();
  
  useEffect(() => {
    applyTheme();
    
    // Listen for system preference changes
    if (settings.theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme, applyTheme]);
};

// Hook to initialize sidebar position on load
export const useInitializeSidebar = () => {
  const { applyDefaultSidebarPosition, settings } = useSettingsStore();
  
  useEffect(() => {
    applyDefaultSidebarPosition();
  }, [settings.defaultSidebarPosition, applyDefaultSidebarPosition]);
};