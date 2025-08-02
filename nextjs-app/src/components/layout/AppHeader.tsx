'use client';

import { useState } from 'react';
import { Moon, Sun, Settings, BarChart3, Heart, Menu, Github, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientOnly } from '@/components/ui/ClientOnly';
import { useSettingsStore } from '@/stores/settingsStore';
import { useExamStore } from '@/stores/examStore';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { 
    updateSettings, 
    openSettingsModal, 
    openStatisticsModal, 
    openFavoritesModal,
    openExportModal,
    getThemePreference 
  } = useSettingsStore();
  
  const { currentExam, questionStates } = useExamStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if we have data to enable/disable certain buttons
  const hasExamData = !!currentExam;
  const hasFavorites = hasExamData && Object.values(questionStates).some(state => state?.isFavorite);
  const hasUserActivity = hasExamData && Object.values(questionStates).some(state => state?.userAnswer || state?.isFavorite);

  const toggleTheme = () => {
    const currentTheme = getThemePreference();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  const HeaderButton = ({ 
    onClick, 
    icon: Icon, 
    label, 
    className,
    disabled = false
  }: { 
    onClick: () => void; 
    icon: React.ComponentType<{ className?: string }>; 
    label: string; 
    className?: string;
    disabled?: boolean;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn("h-9 w-9 p-0", className)}
      title={disabled ? `${label} (No data available)` : label}
      aria-label={label}
    >
      <Icon className={cn("h-4 w-4", disabled && "opacity-50")} />
    </Button>
  );

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" className="h-8 w-8">
                  <rect width="32" height="32" fill="#2563eb" rx="4"/>
                  <rect x="6" y="8" width="20" height="16" fill="white" rx="2"/>
                  <rect x="9" y="12" width="14" height="1" fill="#2563eb"/>
                  <rect x="9" y="15" width="10" height="1" fill="#2563eb"/>
                  <rect x="9" y="18" width="12" height="1" fill="#2563eb"/>
                  <circle cx="20" cy="18" r="2" fill="#10b981"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">
                  Exams Viewer
                </h1>
                <p className="text-xs text-muted-foreground hidden md:block">
                  ServiceNow Certification Training
                </p>
              </div>
            </div>
          </div>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center gap-2">
            <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md mr-2">
              Data from ExamTopics.com for educational purposes only
            </div>
            
            <HeaderButton
              onClick={openFavoritesModal}
              icon={Heart}
              label="Favorites"
              disabled={!hasExamData}
            />

            <HeaderButton
              onClick={openStatisticsModal}
              icon={BarChart3}
              label="Statistics"
              disabled={!hasUserActivity}
            />

            <HeaderButton
              onClick={openExportModal}
              icon={Download}
              label="Export"
              disabled={!hasExamData}
            />

            <ClientOnly>
              <HeaderButton
                onClick={toggleTheme}
                icon={getThemePreference() === 'dark' ? Sun : Moon}
                label={getThemePreference() === 'dark' ? 'Light mode' : 'Dark mode'}
              />
            </ClientOnly>

            <HeaderButton
              onClick={openSettingsModal}
              icon={Settings}
              label="Settings"
            />

            <div className="w-px h-6 bg-border mx-2" />

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <a
                href="https://github.com/JohanDevl/exams-viewer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                <span className="hidden lg:inline">GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>

          {/* Menu mobile */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Extended mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-4">
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
              Data from ExamTopics.com for educational purposes only
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Actions</span>
              <div className="flex items-center gap-2">
                <HeaderButton
                  onClick={() => {
                    openFavoritesModal();
                    setMobileMenuOpen(false);
                  }}
                  icon={Heart}
                  label="Favorites"
                  disabled={!hasExamData}
                />

                <HeaderButton
                  onClick={() => {
                    openStatisticsModal();
                    setMobileMenuOpen(false);
                  }}
                  icon={BarChart3}
                  label="Statistics"
                  disabled={!hasUserActivity}
                />

                <HeaderButton
                  onClick={() => {
                    openExportModal();
                    setMobileMenuOpen(false);
                  }}
                  icon={Download}
                  label="Export"
                  disabled={!hasExamData}
                />

                <ClientOnly>
                  <HeaderButton
                    onClick={toggleTheme}
                    icon={getThemePreference() === 'dark' ? Sun : Moon}
                    label={getThemePreference() === 'dark' ? 'Light mode' : 'Dark mode'}
                  />
                </ClientOnly>

                <HeaderButton
                  onClick={() => {
                    openSettingsModal();
                    setMobileMenuOpen(false);
                  }}
                  icon={Settings}
                  label="Settings"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Links</span>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground"
              >
                <a
                  href="https://github.com/JohanDevl/exams-viewer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}