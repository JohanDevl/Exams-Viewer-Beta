# Statistics System - Next.js Exams Viewer

> **Advanced analytics and session tracking for the modern Next.js architecture**

This document covers the comprehensive statistics system built with Zustand state management, TypeScript interfaces, and React components for tracking user performance and study analytics.

## 🏗️ Architecture Overview

The statistics system is built with:
- **Zustand Store** - Centralized statistics state management
- **TypeScript Interfaces** - Type-safe statistics contracts
- **React Components** - Modern statistics dashboard
- **Persistent Storage** - Zustand persistence middleware
- **Real-time Analytics** - Live performance tracking
- **Data Visualization** - Interactive charts with Framer Motion

## 📊 Zustand Statistics Store

### Store Interface

```typescript
// stores/statisticsStore.ts
interface StatisticsStore {
  statistics: Statistics;
  
  startSession: (examCode: string, examName: string) => string;
  updateCurrentSession: (sessionId: string, update: Partial<ExamSession>) => void;
  endSession: (sessionId: string, finalStats: Partial<ExamSession>) => void;
  getCurrentSession: (examCode: string) => ExamSession | null;
  finalizePendingSessions: () => void;
  exportStatistics: () => void;
  clearStatistics: () => void;
  calculateGlobalStats: () => GlobalStats;
  getExamProgress: (examCode: string) => ExamProgress;
  getDailyProgress: () => DailyProgress[];
}
```

### Core Data Structures

#### ExamSession Interface

Represents a complete exam study session with comprehensive tracking:

```typescript
interface ExamSession {
  id: string;
  examCode: string;
  examName: string;
  startTime: Date;
  endTime?: Date;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  previewAnswers: number;
  accuracy: number;
  timeSpent: number; // in seconds
  completionPercentage: number;
  difficultyBreakdown: Record<string, {
    answered: number;
    correct: number;
    total: number;
  }>;
  questionAttempts: QuestionAttempt[];
  isCompleted: boolean;
  tags: string[];
  notes?: string;
}
```

#### QuestionAttempt Interface

Tracks individual question interactions with detailed analytics:

```typescript
interface QuestionAttempt {
  questionIndex: number;
  questionId: string;
  startTime: Date;
  endTime?: Date;
  timeSpent: number;
  attempts: AttemptData[];
  finalAnswer: string[];
  isCorrect: boolean;
  wasHighlighted: boolean;
  difficulty?: DifficultyLevel;
  resetCount: number;
  firstAttemptCorrect: boolean;
  totalAttempts: number;
  hintsUsed: number;
  confidence?: number; // 1-5 rating
}

interface AttemptData {
  timestamp: Date;
  selectedAnswers: string[];
  isCorrect: boolean;
  timeSpent: number;
  wasPreview: boolean;
}
```

#### Statistics Interface

Main statistics container with comprehensive analytics:

```typescript
interface Statistics {
  totalQuestionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  previewAnswers: number;
  accuracy: number;
  timeSpent: number;
  favoriteQuestions: number;
  
  examProgress: Record<string, ExamProgressData>;
  dailyProgress: Record<string, DailyProgressData>;
  sessions: ExamSession[];
  pendingSessions: ExamSession[];
  
  lastUpdated: Date;
  version: string;
}

interface ExamProgressData {
  examCode: string;
  examName: string;
  answered: number;
  correct: number;
  total: number;
  accuracy: number;
  timeSpent: number;
  lastAccessed: Date;
  completionPercentage: number;
  averageTimePerQuestion: number;
  bestSession?: ExamSession;
  difficultyBreakdown: Record<DifficultyLevel, {
    answered: number;
    correct: number;
    accuracy: number;
  }>;
  trendsData: {
    accuracyTrend: number; // positive/negative percentage
    speedTrend: number;
    consistencyScore: number;
  };
}

interface DailyProgressData {
  date: string; // YYYY-MM-DD
  questionsAnswered: number;
  timeSpent: number;
  accuracy: number;
  sessionsCount: number;
  examsStudied: string[];
}
```

## 🗃️ Zustand Store Implementation

### Store Creation with Persistence

```typescript
// stores/statisticsStore.ts
export const useStatisticsStore = create<StatisticsStore>()(
  persist(
    (set, get) => ({
      statistics: {
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        previewAnswers: 0,
        accuracy: 0,
        timeSpent: 0,
        favoriteQuestions: 0,
        examProgress: {},
        dailyProgress: {},
        sessions: [],
        pendingSessions: [],
        lastUpdated: new Date(),
        version: '2.0.0',
      },
      
      startSession: (examCode: string, examName: string) => {
        const sessionId = generateSessionId();
        const newSession: ExamSession = {
          id: sessionId,
          examCode,
          examName,
          startTime: new Date(),
          questionsAnswered: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          previewAnswers: 0,
          accuracy: 0,
          timeSpent: 0,
          completionPercentage: 0,
          difficultyBreakdown: {},
          questionAttempts: [],
          isCompleted: false,
          tags: [],
        };
        
        set(state => ({
          statistics: {
            ...state.statistics,
            pendingSessions: [...state.statistics.pendingSessions, newSession],
            lastUpdated: new Date(),
          }
        }));
        
        return sessionId;
      },
      
      updateCurrentSession: (sessionId: string, update: Partial<ExamSession>) => {
        set(state => ({
          statistics: {
            ...state.statistics,
            pendingSessions: state.statistics.pendingSessions.map(session =>
              session.id === sessionId ? { ...session, ...update } : session
            ),
            lastUpdated: new Date(),
          }
        }));
      },
      
      endSession: (sessionId: string, finalStats: Partial<ExamSession>) => {
        set(state => {
          const pendingIndex = state.statistics.pendingSessions.findIndex(
            session => session.id === sessionId
          );
          
          if (pendingIndex === -1) return state;
          
          const completedSession = {
            ...state.statistics.pendingSessions[pendingIndex],
            ...finalStats,
            endTime: new Date(),
            isCompleted: true,
          };
          
          const newPendingSessions = [...state.statistics.pendingSessions];
          newPendingSessions.splice(pendingIndex, 1);
          
          return {
            statistics: {
              ...state.statistics,
              sessions: [...state.statistics.sessions, completedSession],
              pendingSessions: newPendingSessions,
              ...calculateGlobalStatsFromSessions([...state.statistics.sessions, completedSession]),
              lastUpdated: new Date(),
            }
          };
        });
      },
      
      // Additional methods...
    }),
    {
      name: 'statistics-store',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // Handle data migration from older versions
        if (version === 1) {
          return migrateFromV1ToV2(persistedState);
        }
        return persistedState;
      },
      partialize: (state) => ({
        statistics: {
          ...state.statistics,
          // Only persist completed sessions, not pending ones
          pendingSessions: [],
        },
      }),
    }
  )
);
```

### Session ID Generation

```typescript
// Generate unique session IDs
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `session_${timestamp}_${randomStr}`;
}
```

## 📈 Statistics Analytics

### Real-time Calculations

```typescript
// Calculate comprehensive statistics
function calculateGlobalStatsFromSessions(sessions: ExamSession[]): Partial<Statistics> {
  const totalQuestions = sessions.reduce((sum, session) => sum + session.questionsAnswered, 0);
  const correctAnswers = sessions.reduce((sum, session) => sum + session.correctAnswers, 0);
  const incorrectAnswers = sessions.reduce((sum, session) => sum + session.incorrectAnswers, 0);
  const previewAnswers = sessions.reduce((sum, session) => sum + session.previewAnswers, 0);
  const totalTime = sessions.reduce((sum, session) => sum + session.timeSpent, 0);
  
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  
  // Calculate exam-specific progress
  const examProgress: Record<string, ExamProgressData> = {};
  sessions.forEach(session => {
    if (!examProgress[session.examCode]) {
      examProgress[session.examCode] = {
        examCode: session.examCode,
        examName: session.examName,
        answered: 0,
        correct: 0,
        total: 0,
        accuracy: 0,
        timeSpent: 0,
        lastAccessed: session.startTime,
        completionPercentage: 0,
        averageTimePerQuestion: 0,
        difficultyBreakdown: {},
        trendsData: {
          accuracyTrend: 0,
          speedTrend: 0,
          consistencyScore: 0,
        },
      };
    }
    
    const examData = examProgress[session.examCode];
    examData.answered += session.questionsAnswered;
    examData.correct += session.correctAnswers;
    examData.timeSpent += session.timeSpent;
    examData.lastAccessed = new Date(Math.max(
      examData.lastAccessed.getTime(),
      session.startTime.getTime()
    ));
  });
  
  // Calculate daily progress
  const dailyProgress: Record<string, DailyProgressData> = {};
  sessions.forEach(session => {
    const dateKey = session.startTime.toISOString().split('T')[0];
    if (!dailyProgress[dateKey]) {
      dailyProgress[dateKey] = {
        date: dateKey,
        questionsAnswered: 0,
        timeSpent: 0,
        accuracy: 0,
        sessionsCount: 0,
        examsStudied: [],
      };
    }
    
    const dayData = dailyProgress[dateKey];
    dayData.questionsAnswered += session.questionsAnswered;
    dayData.timeSpent += session.timeSpent;
    dayData.sessionsCount += 1;
    
    if (!dayData.examsStudied.includes(session.examCode)) {
      dayData.examsStudied.push(session.examCode);
    }
  });
  
  return {
    totalQuestionsAnswered: totalQuestions,
    correctAnswers,
    incorrectAnswers,
    previewAnswers,
    accuracy,
    timeSpent: totalTime,
    examProgress,
    dailyProgress,
  };
}
```

### Performance Metrics

```typescript
// Advanced analytics calculations
function calculateTrendsData(sessions: ExamSession[]): TrendsData {
  if (sessions.length < 2) {
    return {
      accuracyTrend: 0,
      speedTrend: 0,
      consistencyScore: 0,
    };
  }
  
  // Calculate accuracy trend (recent vs older sessions)
  const recentSessions = sessions.slice(-5);
  const olderSessions = sessions.slice(0, -5);
  
  const recentAccuracy = recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length;
  const olderAccuracy = olderSessions.length > 0 
    ? olderSessions.reduce((sum, s) => sum + s.accuracy, 0) / olderSessions.length
    : recentAccuracy;
  
  const accuracyTrend = recentAccuracy - olderAccuracy;
  
  // Calculate speed trend (time per question)
  const recentSpeed = recentSessions.reduce((sum, s) => 
    sum + (s.timeSpent / s.questionsAnswered), 0) / recentSessions.length;
  const olderSpeed = olderSessions.length > 0
    ? olderSessions.reduce((sum, s) => 
        sum + (s.timeSpent / s.questionsAnswered), 0) / olderSessions.length
    : recentSpeed;
  
  const speedTrend = olderSpeed - recentSpeed; // Positive means getting faster
  
  // Calculate consistency score (lower variance = higher consistency)
  const accuracies = sessions.map(s => s.accuracy);
  const variance = calculateVariance(accuracies);
  const consistencyScore = Math.max(0, 100 - variance);
  
  return {
    accuracyTrend,
    speedTrend,
    consistencyScore,
  };
}
```

## 🔄 Data Migration & Versioning

### Zustand Persist Migration

```typescript
// Migration from v1 to v2
function migrateFromV1ToV2(oldState: any): StatisticsStore {
  const oldStatistics = oldState.statistics || {};
  
  // Convert old session format to new format
  const migratedSessions: ExamSession[] = (oldStatistics.sessions || []).map((session: any) => ({
    id: session.id || generateSessionId(),
    examCode: session.examCode || session.ec || '',
    examName: session.examName || session.en || '',
    startTime: new Date(session.startTime || session.st || Date.now()),
    endTime: session.endTime ? new Date(session.endTime) : undefined,
    questionsAnswered: session.questionsAnswered || session.tq || 0,
    correctAnswers: session.correctAnswers || session.ca || 0,
    incorrectAnswers: session.incorrectAnswers || session.ia || 0,
    previewAnswers: session.previewAnswers || session.pa || 0,
    accuracy: session.accuracy || 0,
    timeSpent: session.timeSpent || session.tt || 0,
    completionPercentage: session.completionPercentage || 0,
    difficultyBreakdown: session.difficultyBreakdown || {},
    questionAttempts: migrateQuestionAttempts(session.questionAttempts || session.q || []),
    isCompleted: session.isCompleted || session.c || false,
    tags: session.tags || [],
    notes: session.notes,
  }));
  
  return {
    statistics: {
      ...calculateGlobalStatsFromSessions(migratedSessions),
      sessions: migratedSessions,
      pendingSessions: [],
      lastUpdated: new Date(),
      version: '2.0.0',
    },
    // Store methods will be added by create()
    startSession: () => '',
    updateCurrentSession: () => {},
    endSession: () => {},
    getCurrentSession: () => null,
    finalizePendingSessions: () => {},
    exportStatistics: () => {},
    clearStatistics: () => {},
    calculateGlobalStats: () => ({}) as GlobalStats,
    getExamProgress: () => ({}) as ExamProgress,
    getDailyProgress: () => [],
  };
}

// Migrate question attempts to new format
function migrateQuestionAttempts(oldAttempts: any[]): QuestionAttempt[] {
  return oldAttempts.map(attempt => ({
    questionIndex: attempt.questionIndex || attempt.qn || 0,
    questionId: attempt.questionId || `q_${attempt.questionIndex || 0}`,
    startTime: new Date(attempt.startTime || attempt.st || Date.now()),
    endTime: attempt.endTime ? new Date(attempt.endTime) : undefined,
    timeSpent: attempt.timeSpent || attempt.ts || 0,
    attempts: migrateAttemptData(attempt.attempts || attempt.att || []),
    finalAnswer: attempt.finalAnswer || attempt.ua || [],
    isCorrect: attempt.isCorrect || attempt.ic || false,
    wasHighlighted: attempt.wasHighlighted || attempt.h || false,
    difficulty: attempt.difficulty,
    resetCount: attempt.resetCount || attempt.rc || 0,
    firstAttemptCorrect: attempt.firstAttemptCorrect || false,
    totalAttempts: attempt.totalAttempts || 1,
    hintsUsed: attempt.hintsUsed || 0,
    confidence: attempt.confidence,
  }));
}
```

## 📊 React Statistics Components

### Statistics Modal Component

```typescript
// components/modals/StatisticsModal.tsx
interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statistics: Statistics;
  onExport: () => void;
  onClear: () => void;
}

export function StatisticsModal({ 
  isOpen, 
  onClose, 
  statistics, 
  onExport, 
  onClear 
}: StatisticsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'exams' | 'sessions'>('overview');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Study Statistics</DialogTitle>
          <DialogDescription>
            Comprehensive analytics for your exam preparation
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab as any}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="exams">Per Exam</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <OverviewTab statistics={statistics} />
          </TabsContent>
          
          <TabsContent value="exams" className="space-y-4">
            <ExamsTab examProgress={statistics.examProgress} />
          </TabsContent>
          
          <TabsContent value="sessions" className="space-y-4">
            <SessionsTab sessions={statistics.sessions} />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="destructive" onClick={onClear}>
            <Trash className="h-4 w-4 mr-2" />
            Clear Statistics
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Overview Tab Component

```typescript
// components/statistics/OverviewTab.tsx
function OverviewTab({ statistics }: { statistics: Statistics }) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Questions Answered"
        value={statistics.totalQuestionsAnswered}
        icon={<HelpCircle className="h-4 w-4" />}
      />
      
      <StatCard
        title="Overall Accuracy"
        value={`${statistics.accuracy.toFixed(1)}%`}
        icon={<Target className="h-4 w-4" />}
        trend={calculateAccuracyTrend(statistics.sessions)}
      />
      
      <StatCard
        title="Study Time"
        value={formatTime(statistics.timeSpent)}
        icon={<Clock className="h-4 w-4" />}
      />
      
      <StatCard
        title="Favorite Questions"
        value={statistics.favoriteQuestions}
        icon={<Star className="h-4 w-4" />}
      />
      
      <div className="col-span-full">
        <ProgressChart dailyProgress={statistics.dailyProgress} />
      </div>
    </div>
  );
}
```

### Custom Hooks for Statistics

```typescript
// hooks/useStatistics.ts
export function useStatistics() {
  const { 
    statistics, 
    startSession, 
    updateCurrentSession, 
    endSession,
    exportStatistics,
    clearStatistics 
  } = useStatisticsStore();
  
  const currentSession = useMemo(() => {
    const examCode = useExamStore(state => state.currentExam?.code);
    return statistics.pendingSessions.find(session => session.examCode === examCode) || null;
  }, [statistics.pendingSessions]);
  
  const trackAnswer = useCallback((questionIndex: number, isCorrect: boolean, timeSpent: number) => {
    if (!currentSession) return;
    
    const update: Partial<ExamSession> = {
      questionsAnswered: currentSession.questionsAnswered + 1,
      correctAnswers: currentSession.correctAnswers + (isCorrect ? 1 : 0),
      incorrectAnswers: currentSession.incorrectAnswers + (isCorrect ? 0 : 1),
      timeSpent: currentSession.timeSpent + timeSpent,
      accuracy: calculateAccuracy(
        currentSession.correctAnswers + (isCorrect ? 1 : 0),
        currentSession.questionsAnswered + 1
      ),
    };
    
    updateCurrentSession(currentSession.id, update);
  }, [currentSession, updateCurrentSession]);
  
  return {
    statistics,
    currentSession,
    startSession,
    trackAnswer,
    endSession,
    exportStatistics,
    clearStatistics,
  };
}
```

## 🐛 Troubleshooting

### Common Statistics Issues

#### Store State Problems
**Symptoms**: Statistics not updating or persisting
**Solutions**:
```typescript
// Debug store state
const statisticsState = useStatisticsStore.getState();
console.log('Statistics store state:', {
  totalSessions: statisticsState.statistics.sessions.length,
  pendingSessions: statisticsState.statistics.pendingSessions.length,
  lastUpdated: statisticsState.statistics.lastUpdated,
});

// Check persistence
const persistedData = localStorage.getItem('statistics-store');
console.log('Persisted statistics size:', persistedData?.length || 0);

// Reset store if corrupted
statisticsState.clearStatistics();
```

#### Migration Issues
**Symptoms**: Old data not appearing after update
**Solutions**:
```typescript
// Check migration status
const version = useStatisticsStore.getState().statistics.version;
console.log('Statistics version:', version);

// Manual migration trigger
if (version !== '2.0.0') {
  // Force remigration
  localStorage.removeItem('statistics-store');
  window.location.reload();
}
```

#### Performance Issues
**Symptoms**: Slow statistics loading
**Solutions**:
```typescript
// Monitor performance
const startTime = performance.now();
const stats = useStatisticsStore.getState().statistics;
const loadTime = performance.now() - startTime;
console.log(`Statistics loaded in ${loadTime.toFixed(2)}ms`);

// Check data size
const dataSize = JSON.stringify(stats).length;
console.log(`Statistics data size: ${(dataSize / 1024).toFixed(2)}KB`);

// Cleanup old sessions if too many
if (stats.sessions.length > 100) {
  // Keep only recent 50 sessions
  const recentSessions = stats.sessions.slice(-50);
  useStatisticsStore.setState(state => ({
    statistics: {
      ...state.statistics,
      sessions: recentSessions,
    }
  }));
}
```

## 📤 Export & Data Management

### Export Functionality

```typescript
// Export statistics in multiple formats
export function exportStatistics(format: 'json' | 'csv' | 'pdf' = 'json') {
  const statistics = useStatisticsStore.getState().statistics;
  
  switch (format) {
    case 'json':
      exportAsJSON(statistics);
      break;
    case 'csv':
      exportAsCSV(statistics);
      break;
    case 'pdf':
      exportAsPDF(statistics);
      break;
  }
}

// JSON export with full data
function exportAsJSON(statistics: Statistics) {
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      version: statistics.version,
      totalSessions: statistics.sessions.length,
    },
    statistics,
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `exam-statistics-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

// CSV export for spreadsheet analysis
function exportAsCSV(statistics: Statistics) {
  const csvRows = [
    ['Session ID', 'Exam Code', 'Exam Name', 'Start Time', 'Questions Answered', 'Correct', 'Accuracy', 'Time Spent'],
    ...statistics.sessions.map(session => [
      session.id,
      session.examCode,
      session.examName,
      session.startTime.toISOString(),
      session.questionsAnswered.toString(),
      session.correctAnswers.toString(),
      `${session.accuracy.toFixed(1)}%`,
      formatTime(session.timeSpent),
    ])
  ];
  
  const csvContent = csvRows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `exam-statistics-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  URL.revokeObjectURL(url);
}
```

### Data Cleanup Utilities

```typescript
// Clean up old or corrupted data
export function cleanupStatistics() {
  const store = useStatisticsStore.getState();
  
  // Remove sessions older than 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const recentSessions = store.statistics.sessions.filter(
    session => new Date(session.startTime) > sixMonthsAgo
  );
  
  // Remove corrupted sessions (missing required fields)
  const validSessions = recentSessions.filter(session => 
    session.id && 
    session.examCode && 
    session.startTime &&
    typeof session.questionsAnswered === 'number'
  );
  
  // Update store with cleaned data
  useStatisticsStore.setState(state => ({
    statistics: {
      ...calculateGlobalStatsFromSessions(validSessions),
      sessions: validSessions,
      pendingSessions: [], // Clear any pending sessions
      lastUpdated: new Date(),
      version: '2.0.0',
    }
  }));
  
  return {
    removed: store.statistics.sessions.length - validSessions.length,
    kept: validSessions.length,
  };
}
```

## 🚀 Performance Optimizations

### Efficient State Updates

```typescript
// Optimized session updates to prevent unnecessary re-renders
const updateCurrentSession = useCallback((sessionId: string, update: Partial<ExamSession>) => {
  useStatisticsStore.setState(state => {
    const sessionIndex = state.statistics.pendingSessions.findIndex(
      session => session.id === sessionId
    );
    
    if (sessionIndex === -1) return state;
    
    // Only update if there are actual changes
    const currentSession = state.statistics.pendingSessions[sessionIndex];
    const hasChanges = Object.keys(update).some(
      key => currentSession[key as keyof ExamSession] !== update[key as keyof ExamSession]
    );
    
    if (!hasChanges) return state;
    
    const newPendingSessions = [...state.statistics.pendingSessions];
    newPendingSessions[sessionIndex] = { ...currentSession, ...update };
    
    return {
      statistics: {
        ...state.statistics,
        pendingSessions: newPendingSessions,
        lastUpdated: new Date(),
      }
    };
  });
}, []);
```

### Memory Management

```typescript
// Automatic cleanup of large datasets
const MAX_SESSIONS = 100;
const MAX_DAILY_ENTRIES = 365; // 1 year of daily data

// Cleanup function called periodically
function performMaintenanceCleanup() {
  const state = useStatisticsStore.getState();
  
  // Keep only recent sessions
  if (state.statistics.sessions.length > MAX_SESSIONS) {
    const recentSessions = state.statistics.sessions
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, MAX_SESSIONS);
    
    useStatisticsStore.setState(prevState => ({
      statistics: {
        ...calculateGlobalStatsFromSessions(recentSessions),
        sessions: recentSessions,
        pendingSessions: prevState.statistics.pendingSessions,
        lastUpdated: new Date(),
        version: '2.0.0',
      }
    }));
  }
}

// Run cleanup monthly
setInterval(performMaintenanceCleanup, 30 * 24 * 60 * 60 * 1000);
```

---

**The statistics system is built with modern React patterns, TypeScript safety, and optimized Zustand state management for excellent performance and developer experience.**