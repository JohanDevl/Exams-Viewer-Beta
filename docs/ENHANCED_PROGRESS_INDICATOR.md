# Enhanced Progress Indicator - Next.js Exams Viewer

> **Modern progress visualization built with React components, Framer Motion animations, and Zustand state management**

This document covers the comprehensive progress indicator system in the Next.js Exams Viewer, providing real-time progress tracking, animated visualizations, and milestone celebrations with modern React patterns.

## 🏗️ Architecture Overview

The progress indicator system is built with:
- **React Components** - Modular progress components with TypeScript interfaces
- **Framer Motion** - Smooth animations and transitions with hardware acceleration
- **Zustand Integration** - Real-time state updates and progress calculations
- **Tailwind CSS** - Responsive styling with theme adaptation
- **Custom Hooks** - Reusable progress logic and animation management
- **Accessibility Features** - ARIA attributes and screen reader support

## 📊 Progress Components

### Core Progress Interface

```typescript
// types/progress.ts
interface ProgressData {
  currentQuestion: number;
  totalQuestions: number;
  answered: number;
  correct: number;
  incorrect: number;
  favorites: number;
  percentage: number;
  accuracy: number;
  timeSpent: number;
}

interface ProgressIndicatorProps {
  className?: string;
  variant?: 'compact' | 'detailed' | 'minimal';
  showMilestones?: boolean;
  animationDuration?: number;
}
```

### Main Progress Component

```typescript
// components/progress/ProgressIndicator.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useExamStore } from '@/stores/examStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function ProgressIndicator({ 
  variant = 'detailed',
  showMilestones = true,
  animationDuration = 0.8,
  className 
}: ProgressIndicatorProps) {
  const { 
    currentQuestionIndex, 
    questionStates, 
    currentExam,
    getProgress 
  } = useExamStore();
  
  const { settings } = useSettingsStore();
  
  const progressData = useMemo(() => {
    if (!currentExam) return null;
    
    const progress = getProgress();
    return {
      currentQuestion: currentQuestionIndex + 1,
      totalQuestions: currentExam.questions.length,
      answered: progress.answered,
      correct: progress.correct,
      incorrect: progress.answered - progress.correct,
      favorites: Object.values(questionStates)
        .filter(state => state.isFavorite).length,
      percentage: Math.round((progress.answered / progress.total) * 100),
      accuracy: progress.answered > 0 
        ? Math.round((progress.correct / progress.answered) * 100) 
        : 0,
      timeSpent: 0, // Would come from statistics store
    };
  }, [currentQuestionIndex, questionStates, currentExam, getProgress]);
  
  if (!progressData || !settings.showProgressIndicator) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "progress-indicator bg-card border rounded-lg p-4 shadow-sm",
        className
      )}
    >
      <div className="space-y-4">
        <ProgressHeader data={progressData} />
        <ProgressBar 
          data={progressData} 
          showMilestones={showMilestones}
          animationDuration={animationDuration}
        />
        {variant === 'detailed' && (
          <ProgressStats data={progressData} />
        )}
      </div>
    </motion.div>
  );
}
```

### Progress Header Component

```typescript
// components/progress/ProgressHeader.tsx
function ProgressHeader({ data }: { data: ProgressData }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h3 className="text-sm font-medium text-foreground">
          Question {data.currentQuestion} of {data.totalQuestions}
        </h3>
        <motion.div
          key={data.percentage}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
        >
          {data.percentage}%
        </motion.div>
      </div>
      
      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <AnimatedCounter value={data.answered} />
        </div>
        <div className="flex items-center space-x-1">
          <Star className="h-3 w-3 text-yellow-500" />
          <AnimatedCounter value={data.favorites} />
        </div>
        <div className="flex items-center space-x-1">
          <Circle className="h-3 w-3 text-muted-foreground" />
          <AnimatedCounter value={data.totalQuestions - data.answered} />
        </div>
      </div>
    </div>
  );
}
```

### Animated Progress Bar

```typescript
// components/progress/ProgressBar.tsx
function ProgressBar({ 
  data, 
  showMilestones, 
  animationDuration 
}: {
  data: ProgressData;
  showMilestones: boolean;
  animationDuration: number;
}) {
  const getMilestoneColor = (percentage: number) => {
    if (percentage >= 100) return 'from-green-500 via-yellow-500 to-green-500';
    if (percentage >= 75) return 'from-orange-500 via-red-500 to-orange-500';
    if (percentage >= 50) return 'from-green-500 via-yellow-500 to-orange-500';
    if (percentage >= 25) return 'from-green-400 to-green-500';
    return 'from-blue-400 to-blue-500';
  };
  
  const isAtMilestone = (percentage: number) => {
    return percentage > 0 && (
      percentage === 25 || 
      percentage === 50 || 
      percentage === 75 || 
      percentage === 100
    );
  };
  
  return (
    <div className="space-y-2">
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "h-full bg-gradient-to-r rounded-full",
            getMilestoneColor(data.percentage)
          )}
          initial={{ width: 0 }}
          animate={{ width: `${data.percentage}%` }}
          transition={{ 
            duration: animationDuration,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        />
        
        {/* Milestone markers */}
        {showMilestones && (
          <div className="absolute inset-0">
            {[25, 50, 75].map(milestone => (
              <div
                key={milestone}
                className="absolute top-0 h-full w-0.5 bg-background/50"
                style={{ left: `${milestone}%` }}
              />
            ))}
          </div>
        )}
        
        {/* Glow effect for milestones */}
        <AnimatePresence>
          {isAtMilestone(data.percentage) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 2,
                repeat: 3,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Progress line with percentages */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        {showMilestones && (
          <>
            <span className={data.percentage >= 25 ? 'text-green-500' : ''}>25%</span>
            <span className={data.percentage >= 50 ? 'text-yellow-500' : ''}>50%</span>
            <span className={data.percentage >= 75 ? 'text-orange-500' : ''}>75%</span>
          </>
        )}
        <span className={data.percentage === 100 ? 'text-green-500 font-medium' : ''}>
          100%
        </span>
      </div>
    </div>
  );
}
```

### Animated Counter Component

```typescript
// components/progress/AnimatedCounter.tsx
function AnimatedCounter({ 
  value, 
  duration = 0.5 
}: { 
  value: number; 
  duration?: number; 
}) {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    let startTime: number;
    let startValue = displayValue;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(startValue + (value - startValue) * easeOutQuart);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration, displayValue]);
  
  return (
    <motion.span
      key={value}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
      className="tabular-nums"
    >
      {displayValue}
    </motion.span>
  );
}
```

### Progress Statistics Component

```typescript
// components/progress/ProgressStats.tsx
function ProgressStats({ data }: { data: ProgressData }) {
  const stats = [
    {
      label: 'Answered',
      value: data.answered,
      total: data.totalQuestions,
      color: 'text-blue-600',
      icon: CheckCircle,
    },
    {
      label: 'Correct',
      value: data.correct,
      total: data.answered,
      color: 'text-green-600',
      icon: CheckCheck,
    },
    {
      label: 'Accuracy',
      value: `${data.accuracy}%`,
      color: data.accuracy >= 70 ? 'text-green-600' : 'text-yellow-600',
      icon: Target,
    },
    {
      label: 'Favorites',
      value: data.favorites,
      color: 'text-yellow-600',
      icon: Star,
    },
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-2 p-2 rounded-md bg-muted/50"
        >
          <stat.icon className={cn("h-4 w-4", stat.color)} />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground truncate">
              {stat.label}
            </div>
            <div className={cn("text-sm font-medium", stat.color)}>
              {typeof stat.value === 'number' ? (
                <AnimatedCounter value={stat.value} />
              ) : (
                stat.value
              )}
              {stat.total && (
                <span className="text-muted-foreground">
                  /{stat.total}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
```

## 🎯 Milestone Celebrations

### Milestone Detection Hook

```typescript
// hooks/useProgressMilestones.ts
export function useProgressMilestones() {
  const [celebratedMilestones, setCelebratedMilestones] = useState<Set<number>>(new Set());
  
  const checkMilestone = useCallback((percentage: number) => {
    const milestones = [25, 50, 75, 100];
    const currentMilestone = milestones.find(m => 
      percentage >= m && !celebratedMilestones.has(m)
    );
    
    if (currentMilestone) {
      setCelebratedMilestones(prev => new Set(prev).add(currentMilestone));
      return currentMilestone;
    }
    
    return null;
  }, [celebratedMilestones]);
  
  const resetMilestones = useCallback(() => {
    setCelebratedMilestones(new Set());
  }, []);
  
  return { checkMilestone, resetMilestones };
}
```

### Celebration Effects Component

```typescript
// components/progress/MilestoneCelebration.tsx
function MilestoneCelebration({ 
  milestone, 
  onComplete 
}: { 
  milestone: number | null;
  onComplete: () => void;
}) {
  if (!milestone) return null;
  
  const celebrationConfig = {
    25: { emoji: '🎯', message: 'Great start!', color: 'text-green-500' },
    50: { emoji: '⚡', message: 'Halfway there!', color: 'text-yellow-500' },
    75: { emoji: '🔥', message: 'Almost done!', color: 'text-orange-500' },
    100: { emoji: '🎉', message: 'Completed!', color: 'text-green-600' },
  };
  
  const config = celebrationConfig[milestone as keyof typeof celebrationConfig];
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.2, 1],
          opacity: [0, 1, 1, 0]
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ 
          duration: 2,
          times: [0, 0.3, 0.7, 1],
          ease: "easeInOut"
        }}
        onAnimationComplete={onComplete}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-2xl border">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-6xl mb-4"
          >
            {config.emoji}
          </motion.div>
          <h3 className={cn("text-2xl font-bold mb-2", config.color)}>
            {milestone}% Complete
          </h3>
          <p className="text-muted-foreground">
            {config.message}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

## ⚙️ Settings Integration

### Progress Settings Component

```typescript
// components/settings/ProgressSettings.tsx
function ProgressSettings() {
  const { settings, updateSettings } = useSettingsStore();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="show-progress">Show Progress Indicator</Label>
        <Switch
          id="show-progress"
          checked={settings.showProgressIndicator}
          onCheckedChange={(checked) => 
            updateSettings({ showProgressIndicator: checked })
          }
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="show-milestones">Milestone Celebrations</Label>
        <Switch
          id="show-milestones"
          checked={settings.showMilestoneCelebrations}
          onCheckedChange={(checked) => 
            updateSettings({ showMilestoneCelebrations: checked })
          }
          disabled={!settings.showProgressIndicator}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Progress Variant</Label>
        <RadioGroup
          value={settings.progressVariant}
          onValueChange={(value) => 
            updateSettings({ progressVariant: value as ProgressVariant })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="minimal" id="minimal" />
            <Label htmlFor="minimal">Minimal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="compact" id="compact" />
            <Label htmlFor="compact">Compact</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="detailed" id="detailed" />
            <Label htmlFor="detailed">Detailed</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
```

## 🎨 Theme Integration

### Progress Theme Variants

```typescript
// components/progress/ProgressTheme.tsx
const progressThemes = {
  default: {
    background: 'bg-muted',
    fill: 'from-blue-400 to-blue-500',
    text: 'text-foreground',
    accent: 'text-primary',
  },
  success: {
    background: 'bg-green-100 dark:bg-green-900/20',
    fill: 'from-green-400 to-green-500',
    text: 'text-green-800 dark:text-green-200',
    accent: 'text-green-600',
  },
  warning: {
    background: 'bg-yellow-100 dark:bg-yellow-900/20',
    fill: 'from-yellow-400 to-yellow-500',
    text: 'text-yellow-800 dark:text-yellow-200',
    accent: 'text-yellow-600',
  },
};

function ThemedProgressBar({ 
  percentage, 
  theme = 'default' 
}: {
  percentage: number;
  theme?: keyof typeof progressThemes;
}) {
  const themeClasses = progressThemes[theme];
  
  return (
    <div className={cn("h-3 rounded-full overflow-hidden", themeClasses.background)}>
      <motion.div
        className={cn("h-full bg-gradient-to-r rounded-full", themeClasses.fill)}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
```

## 🔧 Performance Optimizations

### Optimized Progress Updates

```typescript
// hooks/useOptimizedProgress.ts
export function useOptimizedProgress() {
  const { questionStates, currentExam } = useExamStore();
  
  // Memoize expensive calculations
  const progressData = useMemo(() => {
    if (!currentExam) return null;
    
    const answered = Object.values(questionStates)
      .filter(state => state.status !== 'unanswered').length;
    const correct = Object.values(questionStates)
      .filter(state => state.status === 'correct').length;
    const favorites = Object.values(questionStates)
      .filter(state => state.isFavorite).length;
    
    return {
      answered,
      correct,
      favorites,
      total: currentExam.questions.length,
      percentage: Math.round((answered / currentExam.questions.length) * 100),
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    };
  }, [questionStates, currentExam]);
  
  // Debounce rapid updates
  const debouncedProgress = useDebounce(progressData, 100);
  
  return debouncedProgress;
}

// Debounce hook for performance
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}
```

## ♿ Accessibility Features

### ARIA Integration

```typescript
// Accessible progress component
function AccessibleProgressIndicator({ data }: { data: ProgressData }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={data.percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${data.percentage}% complete, ${data.answered} of ${data.totalQuestions} questions answered`}
      className="progress-indicator"
    >
      <div className="sr-only">
        Question {data.currentQuestion} of {data.totalQuestions}.
        {data.answered} questions answered.
        {data.correct} correct answers.
        Current accuracy: {data.accuracy}%.
      </div>
      
      {/* Visual progress components */}
      <ProgressBar data={data} />
    </div>
  );
}
```

### Reduced Motion Support

```typescript
// Respect user motion preferences
function MotionSafeProgressBar({ percentage }: { percentage: number }) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      className="h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
      transition={{ 
        duration: prefersReducedMotion ? 0.1 : 0.8,
        ease: "easeOut"
      }}
    />
  );
}

// Hook to detect motion preferences
function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);
  
  return prefersReducedMotion;
}
```

## 🧪 Testing Integration

### Progress Component Tests

```typescript
// __tests__/ProgressIndicator.test.tsx
import { render, screen } from '@testing-library/react';
import { ProgressIndicator } from '@/components/progress/ProgressIndicator';

describe('ProgressIndicator', () => {
  it('displays correct progress percentage', () => {
    const mockData = {
      currentQuestion: 5,
      totalQuestions: 10,
      answered: 4,
      correct: 3,
      percentage: 40,
    };
    
    render(<ProgressIndicator data={mockData} />);
    
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('Question 5 of 10')).toBeInTheDocument();
  });
  
  it('has proper ARIA attributes', () => {
    render(<ProgressIndicator data={mockData} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '40');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });
});
```

---

**The enhanced progress indicator provides modern, accessible, and performant progress visualization with full Next.js integration and React component architecture.**