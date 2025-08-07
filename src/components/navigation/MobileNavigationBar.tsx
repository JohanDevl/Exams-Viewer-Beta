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
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden"
      style={{
        // Disable iOS safe area to prevent scroll repositioning
        // paddingBottom: 'env(safe-area-inset-bottom)',
        // Static positioning to avoid iOS scroll issues
        position: 'fixed',
        height: '60px', // Fixed height instead of padding
        WebkitTransform: 'translateZ(0)', // Force hardware acceleration
        transform: 'translateZ(0)'
      }}
    >
      <div className="container mx-auto px-4 py-3 h-full flex items-center">
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Sidebar toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="flex items-center gap-2"
            style={{
              // Prevent iOS scroll repositioning on button interactions
              WebkitTouchCallout: 'none',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
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
              style={{
                // Prevent iOS scroll repositioning on button interactions
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
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
              style={{
                // Prevent iOS scroll repositioning on button interactions
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
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
              style={{
                // Prevent iOS scroll repositioning on button interactions
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
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