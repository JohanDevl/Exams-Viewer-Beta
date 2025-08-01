'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useExamStore } from '@/stores/examStore';
import { useRouter } from 'next/navigation';

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
  const { openSettingsModal, openFavoritesModal, openStatisticsModal } = useSettingsStore();
  const router = useRouter();

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

      // Difficulty shortcuts
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

      // Modal shortcuts (with Ctrl)
      if (event.ctrlKey) {
        if (key === 's') {
          event.preventDefault();
          openSettingsModal();
          return;
        }

        if (key === 'f') {
          event.preventDefault();
          openFavoritesModal();
          return;
        }

        if (key === 't') {
          event.preventDefault();
          openStatisticsModal();
          return;
        }

        if (key === 'h') {
          event.preventDefault();
          router.push('/');
          return;
        }
      }

      // Number shortcuts for direct question navigation (1-9, 0 for 10th)
      if (key >= '0' && key <= '9' && event.ctrlKey) {
        event.preventDefault();
        const questionNum = key === '0' ? 10 : parseInt(key);
        const questionIndex = questionNum - 1;
        if (currentExam && questionIndex >= 0 && questionIndex < currentExam.questions.length) {
          setCurrentQuestion(questionIndex);
        }
        return;
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
    currentQuestionIndex,
    currentExam,
    setCurrentQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    submitAnswer,
    toggleFavorite,
    setQuestionDifficulty,
    openSettingsModal,
    openFavoritesModal,
    openStatisticsModal,
    router
  ]);

  // Return the available shortcuts for display
  const shortcuts = [
    { key: '←/A', description: 'Previous question' },
    { key: '→/D', description: 'Next question' },
    { key: 'F', description: 'Toggle favorite' },
    { key: '1', description: 'Mark as easy' },
    { key: '2', description: 'Mark as medium' },
    { key: '3', description: 'Mark as hard' },
    { key: 'Ctrl+S', description: 'Open settings' },
    { key: 'Ctrl+F', description: 'Open favorites' },
    { key: 'Ctrl+T', description: 'Open statistics' },
    { key: 'Ctrl+H', description: 'Go to home' },
    { key: 'Ctrl+1-9', description: 'Go to question 1-9' },
    { key: 'Ctrl+0', description: 'Go to question 10' },
    { key: 'Esc', description: 'Close modal/Go back' }
  ];

  return { shortcuts };
}