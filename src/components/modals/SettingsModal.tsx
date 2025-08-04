'use client';

import { Settings, Palette, Eye, Navigation, Keyboard, Volume2, Star, Grid, List, RotateCcw, Sidebar, MessageCircle, User, Github, ExternalLink, Bug, Code } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ClientOnly } from '@/components/ui/ClientOnly';
import { RaycastLogo } from '@/components/ui/RaycastLogo';
import { useSettingsStore } from '@/stores/settingsStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { getProjectLinks } from '@/lib/assets';
import type { SidebarPosition } from '@/types';

export function SettingsModal() {
  const { 
    isSettingsModalOpen, 
    closeSettingsModal, 
    settings, 
    updateSettings, 
    resetSettings 
  } = useSettingsStore();
  
  const { shortcuts } = useKeyboardShortcuts();
  const projectLinks = getProjectLinks();

  const handleSettingChange = (key: keyof typeof settings, value: string | boolean) => {
    updateSettings({ [key]: value });
  };

  // On mobile, if defaultSidebarPosition is "collapsed", show "expanded" instead
  const getDisplayedSidebarPosition = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile && settings.defaultSidebarPosition === 'collapsed') {
      return 'expanded';
    }
    return settings.defaultSidebarPosition;
  };

  const handleReset = () => {
    resetSettings();
  };

  return (
    <ClientOnly>
      <Dialog open={isSettingsModalOpen} onOpenChange={closeSettingsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500" />
              Application Settings
            </DialogTitle>
            <DialogDescription>
              Customize your application preferences and behavior
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] w-full pr-4">
            <div className="space-y-6">
              {/* Appearance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Palette className="h-4 w-4" />
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select 
                      value={settings.theme} 
                      onValueChange={(value: 'light' | 'dark' | 'system') => 
                        handleSettingChange('theme', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      System theme automatically adapts to your system preferences
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultView">Default view</Label>
                    <Select 
                      value={settings.defaultView} 
                      onValueChange={(value: 'list' | 'card') => 
                        handleSettingChange('defaultView', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="list">
                          <div className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            List
                          </div>
                        </SelectItem>
                        <SelectItem value="card">
                          <div className="flex items-center gap-2">
                            <Grid className="h-4 w-4" />
                            Cards
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultSidebarPosition">Default sidebar position</Label>
                    <Select 
                      value={getDisplayedSidebarPosition()} 
                      onValueChange={(value: SidebarPosition) => 
                        handleSettingChange('defaultSidebarPosition', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hidden">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 opacity-50" />
                            Hidden
                          </div>
                        </SelectItem>
                        <SelectItem value="collapsed" className="hidden md:flex">
                          <div className="flex items-center gap-2">
                            <Sidebar className="h-4 w-4" />
                            Collapsed
                          </div>
                        </SelectItem>
                        <SelectItem value="expanded">
                          <div className="flex items-center gap-2">
                            <Navigation className="h-4 w-4" />
                            Expanded
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose the default sidebar position when the app loads
                      <span className="md:hidden block mt-1">
                        Note: Collapsed mode is not available on mobile devices
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Eye className="h-4 w-4" />
                    Display
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showExplanations">Show answers</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically shows answers after an answer
                      </p>
                    </div>
                    <Switch
                      id="showExplanations"
                      checked={settings.showExplanations}
                      onCheckedChange={(checked) => 
                        handleSettingChange('showExplanations', checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showDifficulty">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Show difficulty
                        </div>
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Displays difficulty indicators for questions
                      </p>
                    </div>
                    <Switch
                      id="showDifficulty"
                      checked={settings.showDifficulty}
                      onCheckedChange={(checked) => 
                        handleSettingChange('showDifficulty', checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showComments">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Show comments
                        </div>
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Displays community comments for questions
                      </p>
                    </div>
                    <Switch
                      id="showComments"
                      checked={settings.showComments}
                      onCheckedChange={(checked) => 
                        handleSettingChange('showComments', checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Navigation className="h-4 w-4" />
                    Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoProgress">Auto progress</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically moves to the next question after an answer
                      </p>
                    </div>
                    <Switch
                      id="autoProgress"
                      checked={settings.autoProgress}
                      onCheckedChange={(checked) => 
                        handleSettingChange('autoProgress', checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="keyboardShortcuts">
                        <div className="flex items-center gap-2">
                          <Keyboard className="h-4 w-4" />
                          Keyboard shortcuts
                        </div>
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Enables keyboard shortcuts for quick navigation
                      </p>
                    </div>
                    <Switch
                      id="keyboardShortcuts"
                      checked={settings.keyboardShortcuts}
                      onCheckedChange={(checked) => 
                        handleSettingChange('keyboardShortcuts', checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Audio and feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Volume2 className="h-4 w-4" />
                    Audio and Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="soundEffects">Sound effects</Label>
                      <p className="text-xs text-muted-foreground">
                        Plays sounds during interactions (correct/incorrect answers)
                      </p>
                    </div>
                    <Switch
                      id="soundEffects"
                      checked={settings.soundEffects}
                      onCheckedChange={(checked) => 
                        handleSettingChange('soundEffects', checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Available keyboard shortcuts */}
              {settings.keyboardShortcuts && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Keyboard className="h-4 w-4" />
                      Available Keyboard Shortcuts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {shortcuts.map((shortcut, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{shortcut.description}</span>
                          <code className="bg-muted px-1 rounded">{shortcut.key}</code>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-3">
                      ServiceNow Certification Exam Viewer - A comprehensive tool for exam preparation with advanced features and analytics.
                    </p>
                    <p className="font-medium text-foreground mb-2">Created by Johan</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <a
                          href={projectLinks.creatorGitHub}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <Github className="h-4 w-4" />
                          GitHub Profile
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <a
                          href={projectLinks.creatorRaycast}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <RaycastLogo className="h-4 w-4" />
                          Raycast Profile
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <a
                          href={projectLinks.repository}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <Code className="h-4 w-4" />
                          Source Code
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <a
                          href={projectLinks.issues}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <Bug className="h-4 w-4" />
                          Report Bug
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-xs text-muted-foreground">
                    <p>Data from ExamTopics.com for educational purposes only.</p>
                    <p className="mt-1">Open source project built with Next.js, React, and TypeScript.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button onClick={closeSettingsModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ClientOnly>
  );
}