# Visual Status Indicators - Next.js Exams Viewer

> **Modern React components with TypeScript interfaces, Zustand state management, and accessible design patterns**

This document covers the comprehensive visual status indicator system in the Next.js Exams Viewer, providing immediate feedback about question states, user interactions, and study progress with modern React component architecture.

## 🏗️ Architecture Overview

The visual status indicator system is built with:
- **React Components** - Modular indicator components with TypeScript interfaces
- **Zustand Integration** - Real-time state updates and status calculations
- **Radix UI Primitives** - Accessible badge and indicator components
- **Tailwind CSS** - Utility-first styling with theme adaptation
- **Custom Hooks** - Reusable status logic and state management
- **Framer Motion** - Smooth status transitions and animations

## 📊 Status Component System

### Core Status Types

```typescript
// types/status.ts
type QuestionStatus = 'unanswered' | 'viewed' | 'correct' | 'incorrect';

interface QuestionState {
  status: QuestionStatus;
  userAnswer: string | null;
  isCorrect: boolean | null;
  isFavorite: boolean;
  notes: string;
  category: string | null;
  viewedAt: Date | null;
  answeredAt: Date | null;
}

interface StatusIndicatorProps {
  status: QuestionStatus;
  isFavorite?: boolean;
  hasNotes?: boolean;
  category?: string | null;
  className?: string;
  variant?: 'badge' | 'dot' | 'icon';
  showLabel?: boolean;
}
```

### Primary Status Indicators

#### Status Badge Component

```typescript
// components/status/StatusBadge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig = {
  unanswered: {
    label: 'NEW',
    color: 'bg-muted text-muted-foreground',
    icon: Circle,
  },
  viewed: {
    label: 'VIEWED',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    icon: Eye,
  },
  correct: {
    label: 'CORRECT',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    icon: CheckCircle,
  },
  incorrect: {
    label: 'WRONG',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    icon: XCircle,
  },
} as const;

export function StatusBadge({ 
  status, 
  variant = 'badge',
  showLabel = true,
  className 
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  if (variant === 'dot') {
    return (
      <div 
        className={cn(
          "w-2 h-2 rounded-full",
          config.color.split(' ')[0],
          className
        )}
        aria-label={config.label}
      />
    );
  }

  if (variant === 'icon') {
    return (
      <Icon 
        className={cn("h-4 w-4", config.color.split(' ')[1], className)}
        aria-label={config.label}
      />
    );
  }

  return (
    <Badge 
      variant="secondary"
      className={cn(config.color, className)}
    >
      <Icon className="h-3 w-3 mr-1" />
      {showLabel && config.label}
    </Badge>
  );
}
```

### Secondary Status Indicators

#### Multi-Status Indicator Component

```typescript
// components/status/MultiStatusIndicator.tsx
export function MultiStatusIndicator({
  status,
  isFavorite,
  hasNotes,
  category,
  className
}: StatusIndicatorProps & { hasNotes: boolean }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <StatusBadge status={status} />
      
      {isFavorite && (
        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
          <Star className="h-3 w-3 mr-1 fill-current" />
          FAV
        </Badge>
      )}
      
      {hasNotes && (
        <Badge variant="outline" className="text-purple-600 border-purple-300">
          <StickyNote className="h-3 w-3 mr-1" />
          NOTES
        </Badge>
      )}
      
      {category && (
        <Badge variant="outline" className="text-cyan-600 border-cyan-300">
          <Tag className="h-3 w-3 mr-1" />
          {category.slice(0, 8)}
        </Badge>
      )}
    </div>
  );
}
```

## 🔗 Zustand Integration

### Status Store Hook

```typescript
// hooks/useQuestionStatus.ts
export function useQuestionStatus(questionIndex: number) {
  const questionStates = useExamStore(state => state.questionStates);
  const toggleFavorite = useExamStore(state => state.toggleFavorite);
  const updateNotes = useExamStore(state => state.updateNotes);
  const setCategory = useExamStore(state => state.setQuestionCategory);
  
  const questionState = questionStates[questionIndex] || {
    status: 'unanswered',
    userAnswer: null,
    isCorrect: null,
    isFavorite: false,
    notes: '',
    category: null,
    viewedAt: null,
    answeredAt: null,
  };
  
  const statusMetrics = useMemo(() => ({
    hasNotes: questionState.notes.trim().length > 0,
    isAnswered: questionState.status !== 'unanswered',
    accuracy: questionState.isCorrect,
    timeSpent: questionState.answeredAt && questionState.viewedAt
      ? questionState.answeredAt.getTime() - questionState.viewedAt.getTime()
      : 0,
  }), [questionState]);
  
  return {
    questionState,
    statusMetrics,
    actions: {
      toggleFavorite: () => toggleFavorite(questionIndex),
      updateNotes: (notes: string) => updateNotes(questionIndex, notes),
      setCategory: (category: string) => setCategory(questionIndex, category),
    },
  };
}
```

### Aggregate Status Hook

```typescript
// hooks/useStatusSummary.ts
export function useStatusSummary() {
  const { questionStates, currentExam } = useExamStore();
  
  return useMemo(() => {
    if (!currentExam) return null;
    
    const states = Object.values(questionStates);
    const total = currentExam.questions.length;
    
    return {
      total,
      answered: states.filter(s => s.status !== 'unanswered').length,
      correct: states.filter(s => s.status === 'correct').length,
      incorrect: states.filter(s => s.status === 'incorrect').length,
      favorites: states.filter(s => s.isFavorite).length,
      withNotes: states.filter(s => s.notes.trim().length > 0).length,
      categories: [...new Set(states.map(s => s.category).filter(Boolean))],
      percentage: Math.round((states.filter(s => s.status !== 'unanswered').length / total) * 100),
    };
  }, [questionStates, currentExam]);
}
```

## 📱 Display Components

### Progress Sidebar Integration

```typescript
// components/progress/ProgressSidebar.tsx
function QuestionListItem({ 
  questionIndex, 
  question 
}: { 
  questionIndex: number; 
  question: Question;
}) {
  const { questionState, statusMetrics } = useQuestionStatus(questionIndex);
  const { currentQuestionIndex, setCurrentQuestion } = useExamStore();
  
  const isActive = currentQuestionIndex === questionIndex;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: questionIndex * 0.02 }}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors",
        isActive && "bg-accent border-primary"
      )}
      onClick={() => setCurrentQuestion(questionIndex)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">Q{questionIndex + 1}</span>
          <StatusBadge 
            status={questionState.status}
            variant="dot"
          />
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {question.questionText.slice(0, 60)}...
        </p>
      </div>
      
      <div className="flex flex-col items-end gap-1 ml-2">
        <MultiStatusIndicator
          status={questionState.status}
          isFavorite={questionState.isFavorite}
          hasNotes={statusMetrics.hasNotes}
          category={questionState.category}
        />
      </div>
    </motion.div>
  );
}
```

### Main Progress Bar Component

```typescript
// components/progress/MainProgressBar.tsx
export function MainProgressBar() {
  const statusSummary = useStatusSummary();
  
  if (!statusSummary) return null;
  
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Progress Overview</h3>
          <Badge variant="outline">
            {statusSummary.percentage}% Complete
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusMetric
            icon={CheckCircle}
            label="Answered"
            value={statusSummary.answered}
            total={statusSummary.total}
            color="text-blue-600"
          />
          <StatusMetric
            icon={CheckCheck}
            label="Correct"
            value={statusSummary.correct}
            total={statusSummary.answered}
            color="text-green-600"
          />
          <StatusMetric
            icon={Star}
            label="Favorites"
            value={statusSummary.favorites}
            color="text-yellow-600"
          />
          <StatusMetric
            icon={StickyNote}
            label="Notes"
            value={statusSummary.withNotes}
            color="text-purple-600"
          />
        </div>
        
        <ProgressVisualization summary={statusSummary} />
      </div>
    </Card>
  );
}
```

### Status Metric Component

```typescript
// components/status/StatusMetric.tsx
function StatusMetric({
  icon: Icon,
  label,
  value,
  total,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  total?: number;
  color: string;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Icon className={cn("h-4 w-4", color)} />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={cn("text-sm font-medium", color)}>
          {value}{total && `/${total}`}
        </div>
      </div>
    </div>
  );
}
```

## 🎨 Visual Theming

### Theme-Aware Status Colors

```typescript
// lib/statusTheme.ts
export const statusTheme = {
  light: {
    unanswered: 'bg-gray-100 text-gray-600',
    viewed: 'bg-orange-100 text-orange-700',
    correct: 'bg-green-100 text-green-700',
    incorrect: 'bg-red-100 text-red-700',
  },
  dark: {
    unanswered: 'bg-gray-800 text-gray-400',
    viewed: 'bg-orange-900/30 text-orange-300',
    correct: 'bg-green-900/30 text-green-300',
    incorrect: 'bg-red-900/30 text-red-300',
  },
} as const;

export function getStatusColor(
  status: QuestionStatus,
  theme: 'light' | 'dark' = 'light'
): string {
  return statusTheme[theme][status];
}
```

### Responsive Status Display

```typescript
// components/status/ResponsiveStatusDisplay.tsx
export function ResponsiveStatusDisplay({ 
  questionIndex 
}: { 
  questionIndex: number 
}) {
  const { questionState, statusMetrics } = useQuestionStatus(questionIndex);
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  
  if (isMobile) {
    return (
      <div className="flex flex-col gap-1">
        <StatusBadge status={questionState.status} variant="badge" />
        <div className="flex gap-1">
          {questionState.isFavorite && (
            <StatusBadge status="favorite" variant="icon" />
          )}
          {statusMetrics.hasNotes && (
            <StatusBadge status="notes" variant="icon" />
          )}
        </div>
      </div>
    );
  }
  
  return (
    <MultiStatusIndicator
      status={questionState.status}
      isFavorite={questionState.isFavorite}
      hasNotes={statusMetrics.hasNotes}
      category={questionState.category}
    />
  );
}
```

## 🎯 Interactive Status Actions

### Status Action Toolbar

```typescript
// components/status/StatusActionToolbar.tsx
export function StatusActionToolbar({ 
  questionIndex 
}: { 
  questionIndex: number 
}) {
  const { questionState, actions } = useQuestionStatus(questionIndex);
  const [notesOpen, setNotesOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  
  return (
    <Card className="p-3 border-dashed">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={questionState.isFavorite ? "default" : "outline"}
            size="sm"
            onClick={actions.toggleFavorite}
            className={questionState.isFavorite ? "text-yellow-600" : ""}
          >
            <Star className={cn(
              "h-4 w-4 mr-1",
              questionState.isFavorite && "fill-current"
            )} />
            Favorite
          </Button>
          
          <NotesDialog
            open={notesOpen}
            onOpenChange={setNotesOpen}
            notes={questionState.notes}
            onSave={actions.updateNotes}
          />
          
          <CategorySelector
            open={categoryOpen}
            onOpenChange={setCategoryOpen}
            currentCategory={questionState.category}
            onSelect={actions.setCategory}
          />
        </div>
        
        <MultiStatusIndicator
          status={questionState.status}
          isFavorite={questionState.isFavorite}
          hasNotes={questionState.notes.trim().length > 0}
          category={questionState.category}
        />
      </div>
    </Card>
  );
}
```

## 🚀 Performance Optimizations

### Virtualized Status Lists

```typescript
// components/status/VirtualizedStatusList.tsx
import { FixedSizeList as List } from 'react-window';

export function VirtualizedStatusList({ 
  questions 
}: { 
  questions: Question[] 
}) {
  const Row = useCallback(({ index, style }: any) => {
    return (
      <div style={style}>
        <QuestionListItem
          questionIndex={index}
          question={questions[index]}
        />
      </div>
    );
  }, [questions]);
  
  return (
    <List
      height={400}
      itemCount={questions.length}
      itemSize={80}
      className="status-list"
    >
      {Row}
    </List>
  );
}
```

### Memoized Status Calculations

```typescript
// hooks/useOptimizedStatus.ts
export function useOptimizedStatus() {
  const questionStates = useExamStore(state => state.questionStates);
  
  return useMemo(() => {
    const statusCounts = Object.values(questionStates).reduce(
      (acc, state) => {
        acc[state.status] = (acc[state.status] || 0) + 1;
        if (state.isFavorite) acc.favorites++;
        if (state.notes.trim()) acc.withNotes++;
        return acc;
      },
      {
        unanswered: 0,
        viewed: 0,
        correct: 0,
        incorrect: 0,
        favorites: 0,
        withNotes: 0,
      }
    );
    
    return statusCounts;
  }, [questionStates]);
}
```

## ♿ Accessibility Features

### Screen Reader Support

```typescript
// components/status/AccessibleStatusIndicator.tsx
export function AccessibleStatusIndicator({ 
  status,
  questionNumber 
}: { 
  status: QuestionStatus;
  questionNumber: number;
}) {
  const statusText = {
    unanswered: 'not answered',
    viewed: 'viewed but not answered',
    correct: 'answered correctly',
    incorrect: 'answered incorrectly',
  }[status];
  
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Question ${questionNumber} is ${statusText}`}
    >
      <StatusBadge status={status} />
      <span className="sr-only">
        Question {questionNumber} status: {statusText}
      </span>
    </div>
  );
}
```

### Keyboard Navigation

```typescript
// hooks/useStatusKeyboardShortcuts.ts
export function useStatusKeyboardShortcuts(questionIndex: number) {
  const { actions } = useQuestionStatus(questionIndex);
  
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      
      switch (event.key.toLowerCase()) {
        case 'f':
          event.preventDefault();
          actions.toggleFavorite();
          break;
        case 'n':
          event.preventDefault();
          // Open notes dialog
          break;
        case 'c':
          event.preventDefault();
          // Open category selector
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [actions]);
}
```

## 🧪 Testing Status Components

### Status Component Tests

```typescript
// __tests__/StatusBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/status/StatusBadge';

describe('StatusBadge', () => {
  it('displays correct status for each type', () => {
    const statuses: QuestionStatus[] = ['unanswered', 'viewed', 'correct', 'incorrect'];
    
    statuses.forEach(status => {
      render(<StatusBadge status={status} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
  
  it('has proper ARIA labels', () => {
    render(<StatusBadge status="correct" />);
    expect(screen.getByLabelText('CORRECT')).toBeInTheDocument();
  });
  
  it('supports different variants', () => {
    const { rerender } = render(
      <StatusBadge status="correct" variant="dot" />
    );
    expect(screen.getByLabelText('CORRECT')).toHaveClass('w-2 h-2');
    
    rerender(<StatusBadge status="correct" variant="icon" />);
    expect(screen.getByLabelText('CORRECT')).toHaveClass('h-4 w-4');
  });
});
```

---

**The visual status indicator system provides modern, accessible, and performant status visualization with full Next.js integration and React component architecture.**