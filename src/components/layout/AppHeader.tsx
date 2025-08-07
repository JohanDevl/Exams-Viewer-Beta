'use client';

import { useState } from 'react';
import { Moon, Sun, Settings, BarChart3, Heart, Menu, Github, Download, Code, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientOnly } from '@/components/ui/ClientOnly';
import { RaycastLogo } from '@/components/ui/RaycastLogo';
import { useSettingsStore } from '@/stores/settingsStore';
import { useExamStore } from '@/stores/examStore';
import { getProjectLinks } from '@/lib/assets';
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
  
  const { currentExam, questionStates, examState } = useExamStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const projectLinks = getProjectLinks();
  
  // Check if we have data to enable/disable certain buttons
  const hasExamData = !!currentExam;
  const hasUserActivity = hasExamData && Object.values(questionStates).some(state => state?.userAnswer || state?.isFavorite);
  
  // Disable certain features during active exam mode
  const isExamActive = examState.mode === 'exam' && examState.phase === 'active' && !examState.isSubmitted;

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
    disabled = false,
    title
  }: { 
    onClick: () => void; 
    icon: React.ComponentType<{ className?: string }>; 
    label: string; 
    className?: string;
    disabled?: boolean;
    title?: string;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn("h-9 w-9 p-0", className)}
      title={title || (disabled ? `${label} (No data available)` : label)}
      aria-label={label}
    >
      <Icon className={cn("h-4 w-4", disabled && "opacity-50")} />
    </Button>
  );

  return (
    <>
    <header 
      className="border-b bg-background/95 md:backdrop-blur md:supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40"
      style={{
        // Mobile-specific optimizations to prevent iOS scroll repositioning
        WebkitTransform: 'translateZ(0)', // Force hardware acceleration
        transform: 'translateZ(0)',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        willChange: 'transform' // Stabilize rendering
      }}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <ClientOnly>
                <div className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" className="h-6 w-6 sm:h-8 sm:w-8">
                    <rect width="32" height="32" fill="#2563eb" rx="4"/>
                    <rect x="6" y="8" width="20" height="16" fill="white" rx="2"/>
                    <rect x="9" y="12" width="14" height="1" fill="#2563eb"/>
                    <rect x="9" y="15" width="10" height="1" fill="#2563eb"/>
                    <rect x="9" y="18" width="12" height="1" fill="#2563eb"/>
                    <circle cx="20" cy="18" r="2" fill="#10b981"/>
                  </svg>
                </div>
              </ClientOnly>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
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
              disabled={!hasUserActivity || isExamActive}
              title={isExamActive ? "Statistics (Disabled during exam mode)" : !hasUserActivity ? "Statistics (No data available)" : "Statistics"}
            />

            <HeaderButton
              onClick={openExportModal}
              icon={Download}
              label="Export"
              disabled={!hasExamData || isExamActive}
              title={isExamActive ? "Export (Disabled during exam mode)" : !hasExamData ? "Export (No data available)" : "Export"}
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

            <div className="text-xs text-muted-foreground hidden lg:block mr-2">
              Created by Johan
            </div>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
              title="GitHub Profile"
            >
              <a
                href={projectLinks.creatorGitHub}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <Github className="h-4 w-4" />
              </a>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
              title="Raycast Profile"
            >
              <a
                href={projectLinks.creatorRaycast}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <RaycastLogo className="h-4 w-4" />
              </a>
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
              title="Project Repository"
            >
              <a
                href={projectLinks.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <Code className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Menu mobile */}
          <div className="md:hidden flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "h-10 w-10 p-0 rounded-lg",
                mobileMenuOpen && "bg-muted"
              )}
              aria-label="Menu"
              title="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

      </div>
    </header>

    {/* Mobile menu panel - slides down from header */}
    <div className={cn(
      "md:hidden sticky top-0 left-0 right-0 z-30 bg-background border-b border-border shadow-lg overflow-hidden transition-all duration-300 ease-in-out",
      mobileMenuOpen ? "max-h-96 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2"
    )}>
      <div className="px-4 py-4 space-y-4">
        <div className="text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-md text-center">
          Data from ExamTopics.com for educational purposes only
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <span className="text-sm font-medium text-foreground">Actions</span>
          </div>
          <div className="grid grid-cols-5 gap-3 justify-items-center">
            <HeaderButton
              onClick={() => {
                openFavoritesModal();
                setMobileMenuOpen(false);
              }}
              icon={Heart}
              label="Favorites"
              disabled={!hasExamData}
              className="w-10 h-10 rounded-lg bg-muted/50 border hover:bg-muted"
            />

            <HeaderButton
              onClick={() => {
                openStatisticsModal();
                setMobileMenuOpen(false);
              }}
              icon={BarChart3}
              label="Statistics"
              disabled={!hasUserActivity || isExamActive}
              title={isExamActive ? "Statistics (Disabled during exam mode)" : !hasUserActivity ? "Statistics (No data available)" : "Statistics"}
              className="w-10 h-10 rounded-lg bg-muted/50 border hover:bg-muted"
            />

            <HeaderButton
              onClick={() => {
                openExportModal();
                setMobileMenuOpen(false);
              }}
              icon={Download}
              label="Export"
              disabled={!hasExamData || isExamActive}
              title={isExamActive ? "Export (Disabled during exam mode)" : !hasExamData ? "Export (No data available)" : "Export"}
              className="w-10 h-10 rounded-lg bg-muted/50 border hover:bg-muted"
            />

            <ClientOnly>
              <HeaderButton
                onClick={toggleTheme}
                icon={getThemePreference() === 'dark' ? Sun : Moon}
                label={getThemePreference() === 'dark' ? 'Light mode' : 'Dark mode'}
                className="w-10 h-10 rounded-lg bg-muted/50 border hover:bg-muted"
              />
            </ClientOnly>

            <HeaderButton
              onClick={() => {
                openSettingsModal();
                setMobileMenuOpen(false);
              }}
              icon={Settings}
              label="Settings"
              className="w-10 h-10 rounded-lg bg-muted/50 border hover:bg-muted"
            />
          </div>
          
          <div className="space-y-3 pt-3 border-t border-border/50">
            <div className="text-center">
              <span className="text-sm font-medium text-foreground">Created by Johan</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted border rounded-lg h-9"
              >
                <a
                  href={projectLinks.creatorGitHub}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted border rounded-lg h-9"
              >
                <a
                  href={projectLinks.creatorRaycast}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <RaycastLogo className="h-4 w-4" />
                  <span>Raycast</span>
                </a>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted border rounded-lg h-9"
              >
                <a
                  href={projectLinks.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Code className="h-4 w-4" />
                  <span>Source Code</span>
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted border rounded-lg h-9"
              >
                <a
                  href={projectLinks.issues}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bug className="h-4 w-4" />
                  <span>Report Bug</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}