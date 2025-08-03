'use client';

import { useEffect } from 'react';
import { useExamStore } from '@/stores/examStore';
import { useStatisticsStore } from '@/stores/statisticsStore';

interface HomeSessionFinalizerProps {
  children: React.ReactNode;
}

export function HomeSessionFinalizer({ children }: HomeSessionFinalizerProps) {
  const { sessionId, currentExamInfo, questionStates, getProgress } = useExamStore();
  const { endSession, getCurrentSession, finalizePendingSessions } = useStatisticsStore();

  useEffect(() => {
    // When arriving on home page, finalize any active sessions
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
        
        // Finalize the session when returning to home
        endSession(sessionId, {
          questionsAnswered: progress.answered,
          correctAnswers: progress.correct,
          timeSpent: Date.now() - new Date(currentSession.startTime).getTime(),
          completionPercentage: progress.total > 0 ? (progress.answered / progress.total) * 100 : 0,
          difficultyBreakdown
        });
      }
    }

    // Also finalize any other pending sessions
    finalizePendingSessions();
  }, [sessionId, currentExamInfo, questionStates, getProgress, endSession, getCurrentSession, finalizePendingSessions]);

  return <>{children}</>;
}