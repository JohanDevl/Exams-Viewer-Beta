import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Statistics, ExamSession, ServiceNowDomain, DomainStatistics, HeatmapData } from '@/types';
import { getExamsForDomain, getAllDomains } from '@/utils/domainMapping';

interface StatisticsStore {
  // Statistical data
  statistics: Statistics;
  
  // Actions to update statistics
  recordAnswer: (examCode: string, isCorrect: boolean, timeSpent: number) => void;
  recordQuestionAccess: (examCode: string) => void;
  addFavorite: (examCode: string) => void;
  removeFavorite: (examCode: string) => void;
  recordTimeSpent: (examCode: string, timeSpent: number) => void;
  
  // Session management
  startSession: (examCode: string, examName: string) => string;
  endSession: (sessionId: string, currentStats: {
    questionsAnswered: number;
    correctAnswers: number;
    timeSpent: number;
    completionPercentage: number;
    difficultyBreakdown: Record<string, { answered: number; correct: number; total: number; }>;
  }) => void;
  updateCurrentSession: (sessionId: string, currentStats: {
    questionsAnswered: number;
    correctAnswers: number;
    timeSpent: number;
    completionPercentage: number;
    difficultyBreakdown: Record<string, { answered: number; correct: number; total: number; }>;
  }) => void;
  getCurrentSession: (examCode: string) => ExamSession | null;
  getSessionHistory: (examCode?: string) => ExamSession[];
  finalizePendingSessions: () => void;
  clearSessionHistory: (examCode?: string) => void;
  
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
  
  // Domain-based analytics
  getDomainStatistics: (domain: ServiceNowDomain, timeFrame?: "7d" | "30d" | "all") => DomainStatistics;
  getAllDomainStatistics: (timeFrame?: "7d" | "30d" | "all") => DomainStatistics[];
  getHeatmapData: (timeFrame?: "7d" | "30d" | "all") => HeatmapData;
  
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
  dailyProgress: {},
  sessions: []
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
      addFavorite: () => {
        const { statistics } = get();
        set({
          statistics: {
            ...statistics,
            favoriteQuestions: statistics.favoriteQuestions + 1
          }
        });
      },

      // Supprimer un favori
      removeFavorite: () => {
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
          .filter(([, progress]) => progress.answered > 0)
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

      // Session management
      startSession: (examCode: string, examName: string) => {
        const sessionId = `${examCode}-${Date.now()}`;
        const newSession: ExamSession = {
          id: sessionId,
          examCode,
          examName,
          startTime: new Date(),
          questionsAnswered: 0,
          correctAnswers: 0,
          accuracy: 0,
          timeSpent: 0,
          completionPercentage: 0,
          difficultyBreakdown: {}
        };
        
        const { statistics } = get();
        set({
          statistics: {
            ...statistics,
            sessions: [...statistics.sessions, newSession]
          }
        });
        
        return sessionId;
      },

      endSession: (sessionId: string, currentStats) => {
        const { statistics } = get();
        const sessions = statistics.sessions.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              endTime: new Date(),
              questionsAnswered: currentStats.questionsAnswered,
              correctAnswers: currentStats.correctAnswers,
              accuracy: currentStats.questionsAnswered > 0 
                ? (currentStats.correctAnswers / currentStats.questionsAnswered) * 100 
                : 0,
              timeSpent: currentStats.timeSpent,
              completionPercentage: currentStats.completionPercentage,
              difficultyBreakdown: currentStats.difficultyBreakdown
            };
          }
          return session;
        });
        
        set({
          statistics: {
            ...statistics,
            sessions
          }
        });
      },

      updateCurrentSession: (sessionId: string, currentStats) => {
        const { statistics } = get();
        const sessions = statistics.sessions.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              questionsAnswered: currentStats.questionsAnswered,
              correctAnswers: currentStats.correctAnswers,
              accuracy: currentStats.questionsAnswered > 0 
                ? (currentStats.correctAnswers / currentStats.questionsAnswered) * 100 
                : 0,
              timeSpent: currentStats.timeSpent,
              completionPercentage: currentStats.completionPercentage,
              difficultyBreakdown: currentStats.difficultyBreakdown
            };
          }
          return session;
        });
        
        set({
          statistics: {
            ...statistics,
            sessions
          }
        });
      },

      getCurrentSession: (examCode: string) => {
        const { statistics } = get();
        return statistics.sessions.find(session => 
          session.examCode === examCode && !session.endTime
        ) || null;
      },

      getSessionHistory: (examCode?: string) => {
        const { statistics } = get();
        
        let sessions = [...statistics.sessions]
          .filter(session => session.endTime); // Only include completed sessions
        
        if (examCode) {
          sessions = sessions.filter(session => session.examCode === examCode);
        }
        
        // Sort by end time (newest first)
        return sessions.sort((a, b) => {
          return new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime();
        });
      },

      finalizePendingSessions: () => {
        const { statistics } = get();
        const now = new Date();
        
        const sessions = statistics.sessions.map(session => {
          // Auto-finalize sessions that are older than 1 hour and not ended
          if (!session.endTime && 
              (now.getTime() - new Date(session.startTime).getTime()) > 60 * 60 * 1000) {
            return {
              ...session,
              endTime: new Date(new Date(session.startTime).getTime() + session.timeSpent)
            };
          }
          return session;
        });
        
        set({
          statistics: {
            ...statistics,
            sessions
          }
        });
      },

      clearSessionHistory: (examCode?: string) => {
        const { statistics } = get();
        
        let sessions = [...statistics.sessions];
        
        if (examCode) {
          // Clear sessions for specific exam, but keep the latest one
          const examSessions = sessions
            .filter(session => session.examCode === examCode)
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
          
          const latestExamSession = examSessions[0]; // Keep the most recent session
          
          // Filter out all sessions for this exam, then add back only the latest
          sessions = sessions.filter(session => session.examCode !== examCode);
          if (latestExamSession) {
            sessions.push(latestExamSession);
          }
        } else {
          // Clear all sessions but keep the latest for each exam
          const examGroups = sessions.reduce((groups, session) => {
            if (!groups[session.examCode]) {
              groups[session.examCode] = [];
            }
            groups[session.examCode].push(session);
            return groups;
          }, {} as Record<string, typeof sessions>);
          
          // Keep only the latest session for each exam
          sessions = Object.values(examGroups).map(examSessions => {
            return examSessions.sort((a, b) => 
              new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            )[0]; // Keep the most recent
          });
        }
        
        set({
          statistics: {
            ...statistics,
            sessions
          }
        });
      },

      // Importer les statistiques
      importStatistics: (data: string) => {
        try {
          const imported = JSON.parse(data) as Statistics;
          
          // Validation basique
          if (typeof imported.totalQuestionsAnswered === 'number' &&
              typeof imported.correctAnswers === 'number' &&
              typeof imported.incorrectAnswers === 'number') {
            
            // Ensure sessions array exists
            if (!imported.sessions) {
              imported.sessions = [];
            }
            
            set({ statistics: imported });
            return true;
          }
          
          return false;
        } catch {
          return false;
        }
      },

      // Get domain-specific statistics
      getDomainStatistics: (domain: ServiceNowDomain, timeFrame: "7d" | "30d" | "all" = "all") => {
        const { statistics } = get();
        // TODO: Load exam codes from manifest dynamically
        // For now, fallback to static mapping
        const examCodes = getExamsForDomain(domain);
        
        let totalQuestions = 0;
        let answeredQuestions = 0;
        let correctAnswers = 0;
        let lastAccessed: Date | undefined;
        
        const examBreakdown: Record<string, { answered: number; correct: number; total: number; accuracy: number; }> = {};
        
        // Calculate cutoff date based on timeFrame
        const now = new Date();
        let cutoffDate: Date | null = null;
        if (timeFrame === "7d") {
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (timeFrame === "30d") {
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        
        // Aggregate statistics for all exams in this domain
        examCodes.forEach(examCode => {
          const examProgress = statistics.examProgress[examCode];
          if (examProgress) {
            // Check if we should include this exam based on timeFrame
            if (cutoffDate && examProgress.lastAccessed && new Date(examProgress.lastAccessed) < cutoffDate) {
              return; // Skip this exam if it's outside the time frame
            }
            
            totalQuestions += examProgress.total;
            answeredQuestions += examProgress.answered;
            correctAnswers += examProgress.correct;
            
            const accuracy = examProgress.answered > 0 ? (examProgress.correct / examProgress.answered) * 100 : 0;
            
            examBreakdown[examCode] = {
              answered: examProgress.answered,
              correct: examProgress.correct,
              total: examProgress.total,
              accuracy
            };
            
            // Update lastAccessed to most recent
            if (examProgress.lastAccessed && (!lastAccessed || new Date(examProgress.lastAccessed) > lastAccessed)) {
              lastAccessed = new Date(examProgress.lastAccessed);
            }
          }
        });
        
        // Calculate overall accuracy for this domain
        const accuracy = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;
        
        // Calculate average time per question (simplified - using global average)
        const averageTimePerQuestion = answeredQuestions > 0 ? statistics.timeSpent / statistics.totalQuestionsAnswered : 0;
        
        // Calculate improvement trend (simplified - comparing last 7 days vs previous 7 days)
        const improvementTrend = 0; // TODO: Implement proper trend calculation based on sessions
        
        return {
          domain,
          totalQuestions,
          answeredQuestions,
          correctAnswers,
          accuracy,
          averageTimePerQuestion,
          lastAccessed,
          improvementTrend,
          examBreakdown
        };
      },

      // Get all domain statistics
      getAllDomainStatistics: (timeFrame: "7d" | "30d" | "all" = "all") => {
        const domains = getAllDomains();
        return domains.map(domain => get().getDomainStatistics(domain, timeFrame));
      },

      // Get heatmap data
      getHeatmapData: (timeFrame: "7d" | "30d" | "all" = "all") => {
        const domainStats = get().getAllDomainStatistics(timeFrame);
        const totalDomains = domainStats.length;
        
        // Calculate overall accuracy across all domains
        const totalAnswered = domainStats.reduce((sum, domain) => sum + domain.answeredQuestions, 0);
        const totalCorrect = domainStats.reduce((sum, domain) => sum + domain.correctAnswers, 0);
        const overallAccuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;
        
        return {
          domains: domainStats,
          totalDomains,
          overallAccuracy,
          lastUpdated: new Date(),
          timeFrame
        };
      }
    }),
    {
      name: 'statistics-store'
    }
  )
);