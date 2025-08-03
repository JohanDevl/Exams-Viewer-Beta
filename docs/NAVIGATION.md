# Navigation System - Next.js Exams Viewer

> **Comprehensive navigation system for the modern Next.js architecture**

This document covers the advanced navigation features in the Next.js Exams Viewer, including keyboard shortcuts, interactive components, mobile navigation, and state-aware navigation patterns.

## 🏗️ Architecture Overview

The navigation system is built with:
- **React 19 Components** - Server and client components with hooks
- **Zustand State Management** - Centralized navigation state
- **TypeScript Interfaces** - Type-safe navigation contracts
- **Tailwind CSS** - Responsive styling system
- **Framer Motion** - Smooth animations and transitions
- **Custom Hooks** - Reusable navigation logic

## 🧭 Navigation Components

### Core Navigation Architecture

```typescript
// Navigation component structure
src/components/navigation/
├── NavigationControls.tsx      # Main navigation buttons and controls
├── MobileNavigationBar.tsx     # Bottom navigation for mobile
├── Sidebar.tsx                 # Question overview sidebar
└── KeyboardShortcuts.tsx       # Keyboard navigation handler
```

## ⌨️ Keyboard Shortcuts System

### React Hook Implementation

The keyboard system uses a custom React hook with TypeScript:

```typescript
// hooks/useKeyboardShortcuts.ts
interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[], 
  enabled = true
): void {
  // Implementation with modern event handling
}
```

### Navigation Shortcuts

#### Core Navigation
| Shortcut | Action | Component | Store Action |
|----------|--------|-----------|---------------|
| `←` / `ArrowLeft` | Previous question | NavigationControls | `goToPreviousQuestion()` |
| `→` / `ArrowRight` | Next question | NavigationControls | `goToNextQuestion()` |
| `Home` | First question | NavigationControls | `setCurrentQuestion(0)` |
| `End` | Last question | NavigationControls | `setCurrentQuestion(total-1)` |
| `r` | Random question | NavigationControls | `goToRandomQuestion()` |

#### Answer Management
| Shortcut | Action | Component | Store Action |
|----------|--------|-----------|---------------|
| `Space` | Submit answer | QuestionDisplay | `submitAnswer()` |
| `Enter` | Submit answer | QuestionDisplay | `submitAnswer()` |
| `h` | Toggle preview | QuestionDisplay | `markQuestionAsPreview()` |
| `Ctrl + r` | Reset question | QuestionDisplay | `resetQuestion()` |

#### Interface Control
| Shortcut | Action | Component | Store Action |
|----------|--------|-----------|---------------|
| `f` | Toggle favorite | QuestionDisplay | `toggleFavorite()` |
| `Ctrl + s` | Toggle sidebar | Sidebar | `setSidebarPosition()` |
| `Esc` | Close modals | ModalsProvider | Various close actions |
| `?` | Show help | App | Open shortcuts modal |

#### Difficulty Rating
| Shortcut | Action | Component | Store Action |
|----------|--------|-----------|---------------|
| `1` | Easy difficulty | QuestionDisplay | `setQuestionDifficulty('easy')` |
| `2` | Medium difficulty | QuestionDisplay | `setQuestionDifficulty('medium')` |
| `3` | Hard difficulty | QuestionDisplay | `setQuestionDifficulty('hard')` |
| `0` | Clear difficulty | QuestionDisplay | `setQuestionDifficulty(null)` |

## 🧩 Sidebar Component

### Component Architecture

```typescript
// components/navigation/Sidebar.tsx
interface SidebarProps {
  position: SidebarPosition;
  onPositionChange: (position: SidebarPosition) => void;
  questions: Question[];
  questionStates: Record<number, QuestionState>;
  currentIndex: number;
  onQuestionSelect: (index: number) => void;
  className?: string;
}

type SidebarPosition = "hidden" | "collapsed" | "expanded";
```

### State Management Integration

```typescript
// Zustand store integration
const { 
  currentExam, 
  currentQuestionIndex, 
  questionStates, 
  setCurrentQuestion 
} = useExamStore();

const { 
  sidebarPosition, 
  setSidebarPosition 
} = useSettingsStore();
```

### Interactive Features

#### Progress Visualization
- **Animated progress bar** using Framer Motion
- **Real-time completion percentage** calculated from store state
- **Color-coded status indicators** based on question states
- **Smooth transitions** between different states

#### Question Overview
```typescript
// Question status calculation
const getQuestionStatus = (index: number): QuestionStatus => {
  const state = questionStates[index];
  if (!state) return "unanswered";
  return state.status;
};

// Visual indicators
const statusStyles = {
  unanswered: "border-l-4 border-gray-300",
  answered: "border-l-4 border-blue-500",
  correct: "border-l-4 border-green-500",
  incorrect: "border-l-4 border-red-500",
  preview: "border-l-4 border-yellow-500"
};
```

#### Navigation Interface
- **Direct question navigation** via click handlers
- **Keyboard navigation** within sidebar
- **Search integration** with filtered questions
- **Favorites highlighting** with star indicators

### Responsive Design

#### Tailwind CSS Implementation
```typescript
// Responsive sidebar classes
const sidebarClasses = cn(
  "fixed top-0 right-0 h-full bg-background border-l",
  "transition-transform duration-300 ease-in-out z-50",
  {
    "translate-x-0": position === "expanded",
    "translate-x-full": position === "hidden",
    "w-80": true, // Desktop width
    "w-full sm:w-80": true, // Mobile full width, desktop 320px
  }
);
```

#### Mobile Adaptations
- **Full-screen overlay** on mobile devices
- **Touch-optimized controls** with proper sizing
- **Gesture support** for closing sidebar
- **Bottom sheet alternative** for better mobile UX

## 🧭 Navigation Controls Component

### Component Interface

```typescript
// components/navigation/NavigationControls.tsx
interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onRandom: () => void;
  onJumpTo: (index: number) => void;
  currentIndex: number;
  totalQuestions: number;
  className?: string;
}
```

### Modern Navigation Features

#### Smart Navigation Logic
```typescript
// Advanced navigation with bounds checking
const handlePrevious = () => {
  if (currentQuestionIndex > 0) {
    setCurrentQuestion(currentQuestionIndex - 1);
  }
};

const handleNext = () => {
  if (currentQuestionIndex < totalQuestions - 1) {
    setCurrentQuestion(currentQuestionIndex + 1);
  }
};

const handleRandom = () => {
  const randomIndex = Math.floor(Math.random() * totalQuestions);
  if (randomIndex !== currentQuestionIndex) {
    setCurrentQuestion(randomIndex);
  }
};
```

#### Progress Indicators
```typescript
// Progress calculation
const progress = useMemo(() => {
  const answered = Object.values(questionStates)
    .filter(state => state.status !== "unanswered").length;
  return {
    answered,
    total: totalQuestions,
    percentage: Math.round((answered / totalQuestions) * 100)
  };
}, [questionStates, totalQuestions]);
```

#### Direct Navigation Input
```typescript
// Jump to specific question with validation
const [jumpToValue, setJumpToValue] = useState("");

const handleJumpTo = (e: React.FormEvent) => {
  e.preventDefault();
  const questionNumber = parseInt(jumpToValue);
  if (questionNumber >= 1 && questionNumber <= totalQuestions) {
    setCurrentQuestion(questionNumber - 1); // Convert to 0-based index
    setJumpToValue("");
  }
};
```

### Button Components

#### Modern Button Design
```typescript
// Using shadcn/ui Button component
import { Button } from "@/components/ui/button";

<Button
  variant="outline"
  size="sm"
  onClick={handlePrevious}
  disabled={currentQuestionIndex === 0}
  className="flex items-center gap-2"
>
  <ChevronLeft className="h-4 w-4" />
  Previous
</Button>
```

## 📱 Mobile Navigation

### Mobile Navigation Bar Component

```typescript
// components/navigation/MobileNavigationBar.tsx
interface MobileNavigationBarProps {
  onPrevious: () => void;
  onNext: () => void;
  onRandom: () => void;
  onToggleSidebar: () => void;
  currentIndex: number;
  totalQuestions: number;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
}
```

### Touch-Optimized Design

#### Bottom Navigation Bar
```typescript
// Mobile-first bottom navigation
<div className="fixed bottom-0 left-0 right-0 bg-background border-t">
  <div className="flex items-center justify-between px-4 py-3">
    <Button
      variant="ghost"
      size="sm"
      onClick={onPrevious}
      disabled={!canNavigatePrevious}
      className="min-h-[44px] min-w-[44px]"
    >
      <ChevronLeft className="h-5 w-5" />
    </Button>
    
    <div className="text-sm text-muted-foreground">
      {currentIndex + 1} / {totalQuestions}
    </div>
    
    <Button
      variant="ghost"
      size="sm"
      onClick={onNext}
      disabled={!canNavigateNext}
      className="min-h-[44px] min-w-[44px]"
    >
      <ChevronRight className="h-5 w-5" />
    </Button>
  </div>
</div>
```

#### Swipe Gestures Support
```typescript
// Custom hook for swipe gestures
const useSwipeNavigation = () => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrevious();
  };
  
  return { onTouchStart, onTouchMove, onTouchEnd };
};
```

### Responsive Breakpoints

#### Tailwind CSS Media Queries
```typescript
// Responsive navigation visibility
const navigationClasses = cn(
  // Desktop navigation
  "hidden md:flex items-center gap-4",
  // Mobile navigation (separate component)
  "md:hidden"
);

// Mobile bottom bar
const mobileBarClasses = cn(
  "fixed bottom-0 left-0 right-0 z-40",
  "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
  "border-t border-border",
  "md:hidden" // Hide on desktop
);
```

## ⚙️ Navigation State Management

### Zustand Store Integration

#### Settings Store
```typescript
// stores/settingsStore.ts
interface SettingsStore {
  settings: UserSettings;
  sidebarPosition: SidebarPosition;
  
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  setSidebarPosition: (position: SidebarPosition) => void;
  resetSettings: () => void;
}

interface UserSettings {
  theme: "light" | "dark" | "system";
  keyboardShortcuts: boolean;
  soundEffects: boolean;
  animationsEnabled: boolean;
  sidebarDefaultState: SidebarPosition;
}
```

#### Exam Store Navigation Actions
```typescript
// stores/examStore.ts - Navigation methods
interface ExamStore {
  // Navigation state
  currentQuestionIndex: number;
  filteredQuestionIndices: number[];
  
  // Navigation actions
  setCurrentQuestion: (index: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  goToRandomQuestion: () => void;
  getProgress: () => {
    answered: number;
    correct: number;
    total: number;
  };
}
```

### Persistence with Zustand

#### Automatic Persistence
```typescript
// Persistent settings with middleware
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      sidebarPosition: "collapsed",
      
      setSidebarPosition: (position) => {
        set({ sidebarPosition: position });
      },
      
      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },
    }),
    {
      name: 'settings-store',
      partialize: (state) => ({
        settings: state.settings,
        sidebarPosition: state.sidebarPosition,
      }),
    }
  )
);
```

### Session Restoration

#### Navigation State Recovery
```typescript
// hooks/useSessionPersistence.ts
interface NavigationSession {
  examCode: string;
  questionIndex: number;
  sidebarPosition: SidebarPosition;
  timestamp: number;
}

export function useSessionPersistence() {
  const saveNavigationState = (session: NavigationSession) => {
    localStorage.setItem('navigation-session', JSON.stringify(session));
  };
  
  const restoreNavigationState = (): NavigationSession | null => {
    const saved = localStorage.getItem('navigation-session');
    return saved ? JSON.parse(saved) : null;
  };
  
  return { saveNavigationState, restoreNavigationState };
}
```

## 🔧 Technical Implementation

### Component Architecture

#### React Component Hierarchy
```typescript
// Navigation component tree
App
├── ExamViewer
│   ├── NavigationControls
│   │   ├── PreviousButton
│   │   ├── NextButton
│   │   ├── RandomButton
│   │   └── ProgressIndicator
│   ├── MobileNavigationBar
│   │   ├── MobileNavButton
│   │   └── QuestionCounter
│   └── Sidebar
│       ├── SidebarHeader
│       ├── ProgressBar
│       ├── QuestionList
│       │   └── QuestionItem
│       └── SidebarControls
└── KeyboardShortcutsProvider
```

#### Modern React Patterns

##### Custom Navigation Hook
```typescript
// hooks/useNavigation.ts
export function useNavigation() {
  const { 
    currentQuestionIndex, 
    filteredQuestionIndices,
    setCurrentQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    goToRandomQuestion,
  } = useExamStore();
  
  const canNavigatePrevious = currentQuestionIndex > 0;
  const canNavigateNext = currentQuestionIndex < filteredQuestionIndices.length - 1;
  
  return {
    currentIndex: currentQuestionIndex,
    totalQuestions: filteredQuestionIndices.length,
    canNavigatePrevious,
    canNavigateNext,
    goToPrevious: goToPreviousQuestion,
    goToNext: goToNextQuestion,
    goToRandom: goToRandomQuestion,
    goToQuestion: setCurrentQuestion,
  };
}
```

##### Keyboard Shortcuts Provider
```typescript
// providers/KeyboardShortcutsProvider.tsx
export function KeyboardShortcutsProvider({ children }: PropsWithChildren) {
  const navigation = useNavigation();
  const { submitAnswer, resetQuestion, toggleFavorite } = useExamStore();
  
  const shortcuts = useMemo((): KeyboardShortcut[] => [
    {
      key: 'ArrowLeft',
      description: 'Previous question',
      action: navigation.goToPrevious,
    },
    {
      key: 'ArrowRight', 
      description: 'Next question',
      action: navigation.goToNext,
    },
    {
      key: ' ', // Space
      description: 'Submit answer',
      action: () => submitAnswer(navigation.currentIndex, selectedAnswers),
    },
    // ... additional shortcuts
  ], [navigation, submitAnswer, resetQuestion, toggleFavorite]);
  
  useKeyboardShortcuts(shortcuts, true);
  
  return <>{children}</>;
}
```

### Performance Optimizations

#### React Optimization Techniques
```typescript
// Memoized navigation components
const MemoizedNavigationControls = memo(NavigationControls);

// Optimized question list rendering
const QuestionList = memo(({ questions, onQuestionSelect }) => {
  return (
    <div className="space-y-1">
      {questions.map((question, index) => (
        <QuestionItem
          key={index}
          question={question}
          index={index}
          onClick={() => onQuestionSelect(index)}
        />
      ))}
    </div>
  );
});

// Efficient state selectors
const currentQuestionIndex = useExamStore(state => state.currentQuestionIndex);
const totalQuestions = useExamStore(state => 
  state.currentExam?.questions.length ?? 0
);
```

#### Animation Performance
```typescript
// Framer Motion optimizations
const sidebarVariants = {
  hidden: { 
    x: "100%",
    transition: { type: "tween", duration: 0.3 }
  },
  visible: { 
    x: 0,
    transition: { type: "tween", duration: 0.3 }
  }
};

<motion.div
  variants={sidebarVariants}
  initial="hidden"
  animate={isOpen ? "visible" : "hidden"}
  className="fixed inset-y-0 right-0 w-80 bg-background"
>
  {/* Sidebar content */}
</motion.div>
```

### TypeScript Integration

#### Strict Type Safety
```typescript
// Type-safe navigation interfaces
interface NavigationState {
  currentIndex: number;
  totalQuestions: number;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
}

interface NavigationActions {
  goToPrevious: () => void;
  goToNext: () => void;
  goToRandom: () => void;
  goToQuestion: (index: number) => void;
}

type NavigationHook = NavigationState & NavigationActions;
```

## 🐛 Troubleshooting

### Common Navigation Issues

#### Keyboard Shortcuts Not Working
**Symptoms**: Key presses not triggering navigation
**Solutions**:
```typescript
// Check if keyboard shortcuts are enabled
const { settings } = useSettingsStore();
console.log('Keyboard shortcuts enabled:', settings.keyboardShortcuts);

// Verify event listeners are attached
console.log('Active shortcuts:', useKeyboardShortcuts.getShortcuts());

// Check for focus conflicts
document.activeElement?.tagName; // Should not be INPUT/TEXTAREA
```

#### Sidebar State Issues
**Symptoms**: Sidebar not opening/closing properly
**Solutions**:
```typescript
// Debug sidebar state
const { sidebarPosition, setSidebarPosition } = useSettingsStore();
console.log('Current sidebar position:', sidebarPosition);

// Reset sidebar state
setSidebarPosition('collapsed');

// Check for CSS conflicts
const sidebarElement = document.querySelector('[data-sidebar]');
console.log('Sidebar classes:', sidebarElement?.className);
```

#### Store State Synchronization
**Symptoms**: Navigation state out of sync
**Solutions**:
```typescript
// Debug store state
const examStore = useExamStore.getState();
console.log('Exam store state:', {
  currentQuestionIndex: examStore.currentQuestionIndex,
  totalQuestions: examStore.currentExam?.questions.length,
  questionStates: Object.keys(examStore.questionStates).length,
});

// Reset store if corrupted
examStore.resetExam();
```

### Mobile-Specific Issues

#### Touch Navigation Problems
**Symptoms**: Swipe gestures not working
**Solutions**:
```typescript
// Check touch event support
console.log('Touch support:', 'ontouchstart' in window);

// Verify gesture thresholds
const minSwipeDistance = 50; // Adjust if needed

// Check for conflicting event listeners
document.addEventListener('touchmove', (e) => {
  console.log('Touch move detected:', e.touches[0].clientX);
}, { passive: true });
```

### Development Debugging

#### React DevTools Integration
```typescript
// Add debugging data to components
function NavigationControls(props) {
  // Debug props in React DevTools
  useDebugValue({
    currentIndex: props.currentIndex,
    canNavigate: {
      previous: props.currentIndex > 0,
      next: props.currentIndex < props.totalQuestions - 1,
    }
  });
  
  return /* component JSX */;
}
```

#### Performance Monitoring
```typescript
// Monitor navigation performance
const useNavigationPerformance = () => {
  const startTime = useRef<number>();
  
  const measureNavigation = (action: string) => {
    if (process.env.NODE_ENV === 'development') {
      performance.mark(`navigation-${action}-start`);
      startTime.current = performance.now();
    }
  };
  
  const endMeasurement = (action: string) => {
    if (process.env.NODE_ENV === 'development' && startTime.current) {
      const duration = performance.now() - startTime.current;
      console.log(`Navigation ${action} took ${duration.toFixed(2)}ms`);
    }
  };
  
  return { measureNavigation, endMeasurement };
};
```

## 🚀 Future Enhancements

### Planned Navigation Features

#### Advanced Navigation Patterns
- **Breadcrumb navigation** for complex question paths
- **Question grouping** by topics or difficulty
- **Smart navigation** based on performance patterns
- **Voice navigation** for accessibility

#### Enhanced Mobile Experience
- **Gesture customization** for different navigation styles
- **Haptic feedback** integration for touch interactions
- **Picture-in-picture mode** for multitasking
- **Offline navigation** with cached content

#### Analytics Integration
- **Navigation heatmaps** to understand user patterns
- **Performance metrics** for navigation efficiency
- **A/B testing** for navigation improvements
- **Usage analytics** for feature optimization

### Contributing to Navigation

#### Component Development
```typescript
// Example: Adding a new navigation component
interface CustomNavigationProps {
  // Define your component props
}

export function CustomNavigation(props: CustomNavigationProps) {
  // Use existing navigation hooks
  const navigation = useNavigation();
  const { settings } = useSettingsStore();
  
  // Implement your navigation logic
  return (
    <div className="custom-navigation">
      {/* Your navigation UI */}
    </div>
  );
}
```

#### Hook Extensions
```typescript
// Example: Extending navigation hooks
export function useAdvancedNavigation() {
  const baseNavigation = useNavigation();
  
  // Add your advanced navigation logic
  const navigateToSimilarQuestions = () => {
    // Implementation
  };
  
  return {
    ...baseNavigation,
    navigateToSimilarQuestions,
  };
}
```

---

**The navigation system is built for extensibility and performance. All components follow React 19 patterns with TypeScript safety and modern state management through Zustand.**