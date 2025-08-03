'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useExamStore } from '@/stores/examStore';

export function useKeyboardShortcuts() {
  const { settings } = useSettingsStore();
  const { 
    currentExam, 
    currentQuestionIndex, 
    setCurrentQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    submitAnswer,
    toggleFavorite,
    setQuestionDifficulty
  } = useExamStore();

  useEffect(() => {
    if (!settings.keyboardShortcuts) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or content editable
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      // Prevent default for our shortcuts to avoid browser actions
      const key = event.key.toLowerCase();
      
      // Navigation shortcuts
      if (key === 'arrowleft' || key === 'a') {
        event.preventDefault();
        goToPreviousQuestion();
        return;
      }
      
      if (key === 'arrowright' || key === 'd') {
        event.preventDefault();
        goToNextQuestion();
        return;
      }

      // Question actions
      if (key === 'enter' || key === ' ') {
        event.preventDefault();
        // submitAnswer needs selected answers - this will be a placeholder for now
        // The actual submission logic would need to be implemented based on current UI state
        return;
      }

      if (key === 'f') {
        event.preventDefault();
        toggleFavorite(currentQuestionIndex);
        return;
      }

      // Difficulty shortcuts (only if difficulty display is enabled)
      if (settings.showDifficulty) {
        if (key === '1') {
          event.preventDefault();
          setQuestionDifficulty(currentQuestionIndex, 'easy');
          return;
        }

        if (key === '2') {
          event.preventDefault();
          setQuestionDifficulty(currentQuestionIndex, 'medium');
          return;
        }

        if (key === '3') {
          event.preventDefault();
          setQuestionDifficulty(currentQuestionIndex, 'hard');
          return;
        }
      }



      // Escape key to close modals or go back
      if (key === 'escape') {
        event.preventDefault();
        // Could implement modal closing logic here
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    settings.keyboardShortcuts,
    settings.showDifficulty,
    currentQuestionIndex,
    currentExam,
    setCurrentQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    submitAnswer,
    toggleFavorite,
    setQuestionDifficulty
  ]);

  // Return the available shortcuts for display
  const shortcuts = [
    { key: '←/A', description: 'Previous question' },
    { key: '→/D', description: 'Next question' },
    { key: 'F', description: 'Toggle favorite' },
    // Only show difficulty shortcuts if difficulty display is enabled
    ...(settings.showDifficulty ? [
      { key: '1', description: 'Mark as easy' },
      { key: '2', description: 'Mark as medium' },
      { key: '3', description: 'Mark as hard' }
    ] : []),
    { key: 'Esc', description: 'Close modal/Go back' }
  ];

  return { shortcuts };
}