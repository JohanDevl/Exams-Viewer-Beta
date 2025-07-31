import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Statistics } from '@/types';

interface StatisticsStore {
  // Statistical data
  statistics: Statistics;
  
  // Actions to update statistics
  recordAnswer: (examCode: string, isCorrect: boolean, timeSpent: number) => void;
  recordQuestionAccess: (examCode: string) => void;
  addFavorite: (examCode: string) => void;
  removeFavorite: (examCode: string) => void;
  recordTimeSpent: (examCode: string, timeSpent: number) => void;
  
  // Actions to get statistics
  getExamStatistics: (examCode: string) => {
    answered: number;
    correct: number;
    total: number;
    accuracy: number;
    lastAccessed?: Date;
  };
  
  getOverallStatistics: () => {
    totalAnswered: number;
    totalCorrect: number;
    overallAccuracy: number;
    totalTimeSpent: number;
    favoriteCount: number;
    examsStarted: number;
  };
  
  getDailyStatistics: (date?: Date) => {
    questionsAnswered: number;
    timeSpent: number;
    accuracy: number;
  };
  
  getWeeklyProgress: () => Array<{
    date: string;
    questionsAnswered: number;
    accuracy: number;
    timeSpent: number;
  }>;
  
  getTopPerformingExams: (limit?: number) => Array<{
    examCode: string;
    accuracy: number;
    questionsAnswered: number;
  }>;
  
  // Actions utilitaires
  resetStatistics: () => void;
  resetExamStatistics: (examCode: string) => void;
  exportStatistics: () => string;
  importStatistics: (data: string) => boolean;
}

const defaultStatistics: Statistics = {
  totalQuestionsAnswered: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  accuracy: 0,
  timeSpent: 0,
  favoriteQuestions: 0,
  examProgress: {},
  dailyProgress: {}
};

const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const useStatisticsStore = create<StatisticsStore>()(
  persist(
    (set, get) => ({
      statistics: defaultStatistics,

      // Record an answer
      recordAnswer: (examCode: string, isCorrect: boolean, timeSpent: number) => {
        const { statistics } = get();
        const today = formatDateKey(new Date());
        
        // Update global statistics
        const totalAnswered = statistics.totalQuestionsAnswered + 1;
        const correctAnswers = statistics.correctAnswers + (isCorrect ? 1 : 0);
        const incorrectAnswers = statistics.incorrectAnswers + (isCorrect ? 0 : 1);
        const accuracy = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;
        
        // Update exam statistics
        const examProgress = { ...statistics.examProgress };
        if (!examProgress[examCode]) {
          examProgress[examCode] = {
            answered: 0,
            correct: 0,
            total: 0, // Will be updated when exam is loaded
            lastAccessed: new Date()
          };
        }
        
        examProgress[examCode] = {
          ...examProgress[examCode],
          answered: examProgress[examCode].answered + 1,
          correct: examProgress[examCode].correct + (isCorrect ? 1 : 0),
          lastAccessed: new Date()
        };
        
        // Update daily statistics
        const dailyProgress = { ...statistics.dailyProgress };
        if (!dailyProgress[today]) {
          dailyProgress[today] = {
            questionsAnswered: 0,
            timeSpent: 0,
            accuracy: 0
          };
        }
        
        const dayStats = dailyProgress[today];
        const dayTotalAnswered = dayStats.questionsAnswered + 1;
        const dayCorrectAnswers = Math.round((dayStats.accuracy / 100) * dayStats.questionsAnswered) + (isCorrect ? 1 : 0);
        const dayAccuracy = dayTotalAnswered > 0 ? (dayCorrectAnswers / dayTotalAnswered) * 100 : 0;
        
        dailyProgress[today] = {
          questionsAnswered: dayTotalAnswered,
          timeSpent: dayStats.timeSpent + timeSpent,
          accuracy: dayAccuracy
        };
        
        set({
          statistics: {
            ...statistics,
            totalQuestionsAnswered: totalAnswered,
            correctAnswers,
            incorrectAnswers,
            accuracy,
            timeSpent: statistics.timeSpent + timeSpent,
            examProgress,
            dailyProgress
          }
        });
      },

      // Record question access
      recordQuestionAccess: (examCode: string) => {
        const { statistics } = get();
        const examProgress = { ...statistics.examProgress };
        
        if (!examProgress[examCode]) {
          examProgress[examCode] = {
            answered: 0,
            correct: 0,
            total: 0,
            lastAccessed: new Date()
          };
        } else {
          examProgress[examCode] = {
            ...examProgress[examCode],
            lastAccessed: new Date()
          };
        }
        
        set({
          statistics: {
            ...statistics,
            examProgress
          }
        });
      },

      // Ajouter un favori
      addFavorite: (examCode: string) => {
        const { statistics } = get();
        set({
          statistics: {
            ...statistics,
            favoriteQuestions: statistics.favoriteQuestions + 1
          }
        });
      },

      // Supprimer un favori
      removeFavorite: (examCode: string) => {
        const { statistics } = get();
        set({
          statistics: {
            ...statistics,
            favoriteQuestions: Math.max(0, statistics.favoriteQuestions - 1)
          }
        });
      },

      // Record time spent
      recordTimeSpent: (examCode: string, timeSpent: number) => {
        const { statistics } = get();
        const today = formatDateKey(new Date());
        
        // Update global time
        const newTotalTime = statistics.timeSpent + timeSpent;
        
        // Update daily time
        const dailyProgress = { ...statistics.dailyProgress };
        if (!dailyProgress[today]) {
          dailyProgress[today] = {
            questionsAnswered: 0,
            timeSpent: 0,
            accuracy: 0
          };
        }
        
        dailyProgress[today] = {
          ...dailyProgress[today],
          timeSpent: dailyProgress[today].timeSpent + timeSpent
        };
        
        set({
          statistics: {
            ...statistics,
            timeSpent: newTotalTime,
            dailyProgress
          }
        });
      },

      // Get exam statistics
      getExamStatistics: (examCode: string) => {
        const { statistics } = get();
        const examProgress = statistics.examProgress[examCode];
        
        if (!examProgress) {
          return {
            answered: 0,
            correct: 0,
            total: 0,
            accuracy: 0
          };
        }
        
        const accuracy = examProgress.answered > 0 
          ? (examProgress.correct / examProgress.answered) * 100 
          : 0;
        
        return {
          answered: examProgress.answered,
          correct: examProgress.correct,
          total: examProgress.total,
          accuracy,
          lastAccessed: examProgress.lastAccessed
        };
      },

      // Get global statistics
      getOverallStatistics: () => {
        const { statistics } = get();
        
        const examsStarted = Object.keys(statistics.examProgress).length;
        
        return {
          totalAnswered: statistics.totalQuestionsAnswered,
          totalCorrect: statistics.correctAnswers,
          overallAccuracy: statistics.accuracy,
          totalTimeSpent: statistics.timeSpent,
          favoriteCount: statistics.favoriteQuestions,
          examsStarted
        };
      },

      // Get daily statistics
      getDailyStatistics: (date?: Date) => {
        const { statistics } = get();
        const dateKey = formatDateKey(date || new Date());
        
        return statistics.dailyProgress[dateKey] || {
          questionsAnswered: 0,
          timeSpent: 0,
          accuracy: 0
        };
      },

      // Get weekly progress
      getWeeklyProgress: () => {
        const { statistics } = get();
        const now = new Date();
        const weekProgress = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateKey = formatDateKey(date);
          
          const dayStats = statistics.dailyProgress[dateKey] || {
            questionsAnswered: 0,
            timeSpent: 0,
            accuracy: 0
          };
          
          weekProgress.push({
            date: dateKey,
            questionsAnswered: dayStats.questionsAnswered,
            accuracy: dayStats.accuracy,
            timeSpent: dayStats.timeSpent
          });
        }
        
        return weekProgress;
      },

      // Get best performing exams
      getTopPerformingExams: (limit: number = 5) => {
        const { statistics } = get();
        
        return Object.entries(statistics.examProgress)
          .filter(([_, progress]) => progress.answered > 0)
          .map(([examCode, progress]) => ({
            examCode,
            accuracy: (progress.correct / progress.answered) * 100,
            questionsAnswered: progress.answered
          }))
          .sort((a, b) => b.accuracy - a.accuracy)
          .slice(0, limit);
      },

      // Reset all statistics
      resetStatistics: () => {
        set({ statistics: defaultStatistics });
      },

      // Reset exam statistics
      resetExamStatistics: (examCode: string) => {
        const { statistics } = get();
        const examProgress = { ...statistics.examProgress };
        
        if (examProgress[examCode]) {
          delete examProgress[examCode];
          
          set({
            statistics: {
              ...statistics,
              examProgress
            }
          });
        }
      },

      // Exporter les statistiques
      exportStatistics: () => {
        const { statistics } = get();
        return JSON.stringify(statistics, null, 2);
      },

      // Importer les statistiques
      importStatistics: (data: string) => {
        try {
          const imported = JSON.parse(data) as Statistics;
          
          // Validation basique
          if (typeof imported.totalQuestionsAnswered === 'number' &&
              typeof imported.correctAnswers === 'number' &&
              typeof imported.incorrectAnswers === 'number') {
            
            set({ statistics: imported });
            return true;
          }
          
          return false;
        } catch {
          return false;
        }
      }
    }),
    {
      name: 'statistics-store'
    }
  )
);