'use client';

import { 
  ChevronLeft, 
  ChevronRight, 
  Shuffle,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExamStore } from '@/stores/examStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function MobileNavigationBar() {
  const { 
    currentQuestionIndex,
    filteredQuestionIndices,
    goToPreviousQuestion,
    goToNextQuestion,
    goToRandomQuestion
  } = useExamStore();

  const { sidebarVisible, setSidebarVisible } = useSettingsStore();

  const currentIndexInFiltered = filteredQuestionIndices.indexOf(currentQuestionIndex);
  const totalFiltered = filteredQuestionIndices.length;

  const canGoPrevious = currentIndexInFiltered > 0;
  const canGoNext = currentIndexInFiltered < totalFiltered - 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Sidebar toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="flex items-center gap-2"
          >
            <Menu className="h-4 w-4" />
            <span className="text-xs">Sidebar</span>
          </Button>

          {/* Navigation controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousQuestion}
              disabled={!canGoPrevious}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">Prev</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToRandomQuestion}
              disabled={totalFiltered === 0}
              className="flex items-center gap-1"
            >
              <Shuffle className="h-4 w-4" />
              <span className="text-xs">Random</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextQuestion}
              disabled={!canGoNext}
              className="flex items-center gap-1"
            >
              <span className="text-xs">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}