'use client';

import { useEffect } from 'react';
import { useExamStore } from '@/stores/examStore';
import { useStatisticsStore } from '@/stores/statisticsStore';

export function useSessionPersistence() {
  const { sessionId, currentExamInfo, questionStates, getProgress } = useExamStore();
  const { updateCurrentSession, endSession, getCurrentSession, finalizePendingSessions } = useStatisticsStore();

  // Initialize on mount
  useEffect(() => {
    // Finalize any old pending sessions when the app starts
    finalizePendingSessions();
  }, [finalizePendingSessions]);

  // Save and finalize session before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId && currentExamInfo) {
        const currentSession = getCurrentSession(currentExamInfo.code);
        
        if (currentSession && currentSession.id === sessionId && !currentSession.endTime) {
          const progress = getProgress();
          const difficultyBreakdown: Record<string, { answered: number; correct: number; total: number; }> = {};
          
          // Calculate difficulty breakdown
          Object.entries(questionStates).forEach(([index, state]) => {
            const difficulty = state.difficulty || 'unrated';
            if (!difficultyBreakdown[difficulty]) {
              difficultyBreakdown[difficulty] = { answered: 0, correct: 0, total: 0 };
            }
            difficultyBreakdown[difficulty].total++;
            
            if (state.firstAnswer) {
              difficultyBreakdown[difficulty].answered++;
              if (state.firstAnswer.isCorrect) {
                difficultyBreakdown[difficulty].correct++;
              }
            }
          });
          
          // Finalize the session when leaving the page
          endSession(sessionId, {
            questionsAnswered: progress.answered,
            correctAnswers: progress.correct,
            timeSpent: Date.now() - new Date(currentSession.startTime).getTime(),
            completionPercentage: progress.total > 0 ? (progress.answered / progress.total) * 100 : 0,
            difficultyBreakdown
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Save session data on visibility change (but don't finalize)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && sessionId && currentExamInfo) {
        const currentSession = getCurrentSession(currentExamInfo.code);
        
        if (currentSession && currentSession.id === sessionId && !currentSession.endTime) {
          const progress = getProgress();
          const difficultyBreakdown: Record<string, { answered: number; correct: number; total: number; }> = {};
          
          // Calculate difficulty breakdown
          Object.entries(questionStates).forEach(([index, state]) => {
            const difficulty = state.difficulty || 'unrated';
            if (!difficultyBreakdown[difficulty]) {
              difficultyBreakdown[difficulty] = { answered: 0, correct: 0, total: 0 };
            }
            difficultyBreakdown[difficulty].total++;
            
            if (state.firstAnswer) {
              difficultyBreakdown[difficulty].answered++;
              if (state.firstAnswer.isCorrect) {
                difficultyBreakdown[difficulty].correct++;
              }
            }
          });
          
          // Only UPDATE the session, don't finalize it
          updateCurrentSession(sessionId, {
            questionsAnswered: progress.answered,
            correctAnswers: progress.correct,
            timeSpent: Date.now() - new Date(currentSession.startTime).getTime(),
            completionPercentage: progress.total > 0 ? (progress.answered / progress.total) * 100 : 0,
            difficultyBreakdown
          });
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionId, currentExamInfo, questionStates, getProgress, updateCurrentSession, endSession, getCurrentSession]);

  // Periodic auto-save every 30 seconds
  useEffect(() => {
    if (!sessionId || !currentExamInfo) return;

    const interval = setInterval(() => {
      const currentSession = getCurrentSession(currentExamInfo.code);
      
      if (currentSession && currentSession.id === sessionId) {
        const progress = getProgress();
        const difficultyBreakdown: Record<string, { answered: number; correct: number; total: number; }> = {};
        
        // Calculate difficulty breakdown
        Object.entries(questionStates).forEach(([index, state]) => {
          const difficulty = state.difficulty || 'unrated';
          if (!difficultyBreakdown[difficulty]) {
            difficultyBreakdown[difficulty] = { answered: 0, correct: 0, total: 0 };
          }
          difficultyBreakdown[difficulty].total++;
          
          if (state.firstAnswer) {
            difficultyBreakdown[difficulty].answered++;
            if (state.firstAnswer.isCorrect) {
              difficultyBreakdown[difficulty].correct++;
            }
          }
        });
        
        updateCurrentSession(sessionId, {
          questionsAnswered: progress.answered,
          correctAnswers: progress.correct,
          timeSpent: Date.now() - new Date(currentSession.startTime).getTime(),
          completionPercentage: progress.total > 0 ? (progress.answered / progress.total) * 100 : 0,
          difficultyBreakdown
        });
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [sessionId, currentExamInfo, questionStates, getProgress, updateCurrentSession, getCurrentSession]);
}