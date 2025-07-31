'use client';

import { Settings, Palette, Eye, Navigation, Keyboard, Volume2, Star, Grid, List, RotateCcw } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
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
import { useSettingsStore } from '@/stores/settingsStore';

export function SettingsModal() {
  const { 
    isSettingsModalOpen, 
    closeSettingsModal, 
    settings, 
    updateSettings, 
    resetSettings 
  } = useSettingsStore();

  const handleSettingChange = (key: keyof typeof settings, value: string | boolean) => {
    updateSettings({ [key]: value });
  };

  const handleReset = () => {
    resetSettings();
  };

  return (
    <Dialog open={isSettingsModalOpen} onOpenChange={closeSettingsModal}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            Application Settings
          </DialogTitle>
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
                    <Label htmlFor="showExplanations">Show explanations</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically shows explanations after an answer
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
                    <div className="flex justify-between">
                      <span>Next question</span>
                      <code className="bg-muted px-1 rounded">→</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Previous question</span>
                      <code className="bg-muted px-1 rounded">←</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Add to favorites</span>
                      <code className="bg-muted px-1 rounded">F</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Submit answer</span>
                      <code className="bg-muted px-1 rounded">Enter</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Show statistics</span>
                      <code className="bg-muted px-1 rounded">S</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Show settings</span>
                      <code className="bg-muted px-1 rounded">Ctrl+,</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
  );
}