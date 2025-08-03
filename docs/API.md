# API Documentation - Exams Viewer

This document provides comprehensive API documentation for the modern Next.js Exams Viewer application, including TypeScript interfaces, React components, Zustand stores, and utility functions.

## 🏗️ Next.js Architecture Overview

The application is built with:
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Zustand** for state management
- **Radix UI** for accessible components
- **Tailwind CSS** for styling

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx          # Main application page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── exam/            # Exam-specific components
│   ├── question/        # Question display components
│   ├── navigation/      # Navigation components
│   ├── modals/         # Modal dialogs
│   ├── providers/      # Context providers
│   └── ui/             # Reusable UI components
├── stores/             # Zustand state management
├── types/              # TypeScript definitions
├── hooks/              # Custom React hooks
└── utils/              # Utility functions
```

## 🗃️ State Management (Zustand)

### ExamStore

Manages exam data, question states, and session tracking.

#### Interface

```typescript
interface ExamStore {
  // Current state
  currentExam: ExamData | null;
  currentExamInfo: ExamInfo | null;
  currentQuestionIndex: number;
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;

  // Question states
  questionStates: Record<number, QuestionState>;
  examData: Record<string, Record<number, Partial<QuestionState>>>;
  
  // Search and filtering
  searchFilters: SearchFilters;
  filteredQuestionIndices: number[];

  // Actions
  loadExam: (examCode: string) => Promise<void>;
  setCurrentQuestion: (index: number) => void;
  submitAnswer: (questionIndex: number, selectedAnswers: string[]) => void;
  markQuestionAsPreview: (questionIndex: number) => void;
  resetQuestion: (questionIndex: number) => void;
  toggleFavorite: (questionIndex: number) => void;
  setQuestionDifficulty: (questionIndex: number, difficulty: DifficultyLevel) => void;
  setQuestionNotes: (questionIndex: number, notes: string) => void;
  setQuestionCategory: (questionIndex: number, category: string) => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  updateFilteredQuestions: () => void;
  resetExam: () => void;
  getQuestionStatus: (questionIndex: number) => QuestionStatus;
  getFirstAnswerStatus: (questionIndex: number) => QuestionStatus;
  getProgress: () => { answered: number; correct: number; total: number };
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  goToRandomQuestion: () => void;
}
```

#### Usage Examples

```typescript
import { useExamStore } from '@/stores/examStore';

// Load exam
const { loadExam, currentExam, isLoading } = useExamStore();
await loadExam('CAD');

// Submit answer
const { submitAnswer } = useExamStore();
submitAnswer(0, ['A', 'C']);

// Navigate questions
const { goToNextQuestion, goToPreviousQuestion } = useExamStore();
goToNextQuestion();

// Set filters
const { setSearchFilters } = useExamStore();
setSearchFilters({ status: 'correct', difficulty: 'hard' });
```

### SettingsStore

Manages user preferences and application settings.

#### Interface

```typescript
interface SettingsStore {
  settings: UserSettings;
  sidebarPosition: SidebarPosition;
  
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  setSidebarPosition: (position: SidebarPosition) => void;
  resetSettings: () => void;
}
```

#### Usage Examples

```typescript
import { useSettingsStore } from '@/stores/settingsStore';

// Update theme
const { updateSettings } = useSettingsStore();
updateSettings({ theme: 'dark' });

// Toggle sidebar
const { setSidebarPosition } = useSettingsStore();
setSidebarPosition('expanded');
```

### StatisticsStore

Manages session tracking and performance analytics.

#### Interface

```typescript
interface StatisticsStore {
  statistics: Statistics;
  
  startSession: (examCode: string, examName: string) => string;
  updateCurrentSession: (sessionId: string, update: Partial<ExamSession>) => void;
  endSession: (sessionId: string, finalStats: Partial<ExamSession>) => void;
  getCurrentSession: (examCode: string) => ExamSession | null;
  finalizePendingSessions: () => void;
  exportStatistics: () => void;
  clearStatistics: () => void;
}
```

#### Usage Examples

```typescript
import { useStatisticsStore } from '@/stores/statisticsStore';

// Start session
const { startSession } = useStatisticsStore();
const sessionId = startSession('CAD', 'Certified Application Developer');

// Update session
const { updateCurrentSession } = useStatisticsStore();
updateCurrentSession(sessionId, { questionsAnswered: 5, correctAnswers: 4 });

// End session
const { endSession } = useStatisticsStore();
endSession(sessionId, { completionPercentage: 100 });
```

## 🧩 TypeScript Interfaces

### Core Data Types

```typescript
interface ExamData {
  status: "complete" | "partial" | "error";
  error?: string;
  questions: Question[];
}

interface Question {
  question: string;
  answers: string[];
  comments: Comment[];
  correct_answers?: string[];
  explanation?: string;
  most_voted?: string;
  correct_answer?: string;
  images?: Record<string, { webp: string; jpeg: string }>;
  question_number?: string;
}

interface Comment {
  content: string;
  selected_answer: string;
  replies: Comment[];
}

interface ExamInfo {
  code: string;
  name: string;
  description: string;
  questionCount: number;
  lastUpdated: string;
}
```

### Application State Types

```typescript
type QuestionStatus = "unanswered" | "answered" | "correct" | "incorrect" | "preview";
type DifficultyLevel = "easy" | "medium" | "hard" | null;
type SidebarPosition = "hidden" | "collapsed" | "expanded";

interface QuestionState {
  status: QuestionStatus;
  userAnswer?: UserAnswer;
  firstAnswer?: UserAnswer;
  isFavorite: boolean;
  difficulty?: DifficultyLevel;
  notes?: string;
  category?: string;
}

interface UserAnswer {
  selectedAnswers: string[];
  timestamp: Date;
  isCorrect?: boolean;
}

interface SearchFilters {
  query: string;
  status: QuestionStatus | "all";
  difficulty: DifficultyLevel | "all";
  favorites: boolean;
  category: string | "all";
}
```

### Statistics Types

```typescript
interface ExamSession {
  id: string;
  examCode: string;
  examName: string;
  startTime: Date;
  endTime?: Date;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  timeSpent: number;
  completionPercentage: number;
  difficultyBreakdown: Record<string, {
    answered: number;
    correct: number;
    total: number;
  }>;
}

interface Statistics {
  totalQuestionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  timeSpent: number;
  favoriteQuestions: number;
  examProgress: Record<string, {
    answered: number;
    correct: number;
    total: number;
    lastAccessed: Date;
  }>;
  dailyProgress: Record<string, {
    questionsAnswered: number;
    timeSpent: number;
    accuracy: number;
  }>;
  sessions: ExamSession[];
}
```

### UI Component Types

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  action: () => void;
}

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  description: string;
  action: () => void;
}
```

## ⚛️ React Components API

### Core Components

#### ExamViewer
Main component for displaying exam questions.

```typescript
interface ExamViewerProps {
  className?: string;
}

export function ExamViewer({ className }: ExamViewerProps): JSX.Element;
```

#### QuestionDisplay
Displays individual question with answers and interactions.

```typescript
interface QuestionDisplayProps {
  question: Question;
  questionIndex: number;
  questionState: QuestionState;
  onAnswerSelect: (answers: string[]) => void;
  onPreview: () => void;
  onReset: () => void;
  className?: string;
}

export function QuestionDisplay(props: QuestionDisplayProps): JSX.Element;
```

#### ExamSelector
Dropdown component for selecting exams.

```typescript
interface ExamSelectorProps {
  onExamSelect: (examCode: string) => void;
  selectedExam?: string;
  className?: string;
}

export function ExamSelector(props: ExamSelectorProps): JSX.Element;
```

### Navigation Components

#### NavigationControls
Previous/Next navigation with keyboard shortcuts.

```typescript
interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onRandom: () => void;
  onJumpTo: (index: number) => void;
  currentIndex: number;
  totalQuestions: number;
  className?: string;
}

export function NavigationControls(props: NavigationControlsProps): JSX.Element;
```

#### Sidebar
Collapsible sidebar with question overview.

```typescript
interface SidebarProps {
  position: SidebarPosition;
  onPositionChange: (position: SidebarPosition) => void;
  questions: Question[];
  questionStates: Record<number, QuestionState>;
  currentIndex: number;
  onQuestionSelect: (index: number) => void;
  className?: string;
}

export function Sidebar(props: SidebarProps): JSX.Element;
```

### Modal Components

#### StatisticsModal
Displays comprehensive statistics and analytics.

```typescript
interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statistics: Statistics;
  onExport: () => void;
  onClear: () => void;
}

export function StatisticsModal(props: StatisticsModalProps): JSX.Element;
```

#### SettingsModal
User preferences and configuration.

```typescript
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSettingsChange: (settings: Partial<UserSettings>) => void;
}

export function SettingsModal(props: SettingsModalProps): JSX.Element;
```

#### ExportModal
Export functionality with format options.

```typescript
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  examData: ExamData | null;
  onExport: (options: ExportOptions) => void;
}

export function ExportModal(props: ExportModalProps): JSX.Element;
```

## 🪝 Custom Hooks

### useKeyboardShortcuts
Manages keyboard shortcuts throughout the application.

```typescript
interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ 
  shortcuts, 
  enabled = true 
}: UseKeyboardShortcutsProps): void;
```

### useSessionPersistence
Handles session persistence and restoration.

```typescript
interface SessionData {
  examCode: string;
  questionIndex: number;
  timestamp: number;
}

export function useSessionPersistence(): {
  saveSession: (data: SessionData) => void;
  restoreSession: () => SessionData | null;
  clearSession: () => void;
};
```

### useScrollLock
Manages body scroll lock for modals.

```typescript
export function useScrollLock(isLocked: boolean): void;
```

### useSoundEffects
Manages sound effects for user interactions.

```typescript
interface SoundEffectsConfig {
  enabled: boolean;
  volume: number;
}

export function useSoundEffects(config: SoundEffectsConfig): {
  playSuccess: () => void;
  playError: () => void;
  playClick: () => void;
  playNotification: () => void;
};
```

### useToastWithSound
Combines toast notifications with sound effects.

```typescript
export function useToastWithSound(): {
  showToast: (message: ToastMessage) => void;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
};
```

## 🔧 Utility Functions

### Export Utilities

```typescript
// Export to different formats
export function exportToJSON(data: any, filename: string): void;
export function exportToCSV(data: any[], filename: string): void;
export function exportToTXT(content: string, filename: string): void;
export function exportToPDF(content: string, filename: string): Promise<void>;

// Export options
interface ExportOptions {
  format: ExportFormat;
  includeAnswers: boolean;
  includeExplanations: boolean;
  includeStatistics: boolean;
  filterByStatus?: QuestionStatus;
  filterByDifficulty?: DifficultyLevel;
}
```

### Link Utilities

```typescript
// Process and validate external links
export function processLinks(content: string): JSX.Element;
export function validateUrl(url: string): boolean;
export function openExternalLink(url: string): void;
```

### Data Processing

```typescript
// Question processing
export function processQuestion(question: Question): ProcessedQuestion;
export function calculateQuestionDifficulty(
  question: Question, 
  attempts: UserAnswer[]
): DifficultyLevel;

// Progress calculations
export function calculateProgress(
  questionStates: Record<number, QuestionState>
): ProgressStats;

export function calculateSessionStats(
  session: ExamSession
): SessionAnalytics;
```

## 🎨 Styling and Theming

### CSS Custom Properties

The application uses CSS custom properties for theming:

```css
:root {
  /* Light theme colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark theme variables */
}
```

### Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... additional color definitions
      },
    },
  },
  plugins: [],
} satisfies Config;
```

## 🐍 Python Scripts API

### Data Management Scripts

#### scraper.py

```python
def update_exam_data(
    exam_code: str, 
    progress_callback: Optional[Callable] = None,
    rapid_scraping: bool = False
) -> Dict[str, Any]:
    """
    Updates exam data for a specific exam code.
    
    Args:
        exam_code: The exam code (e.g., 'CAD', 'CIS-ITSM')
        progress_callback: Optional progress tracking callback
        rapid_scraping: Enable rapid scraping mode (no delays)
    
    Returns:
        Dict containing exam data with questions and metadata
    """

def load_json(filename: str) -> Dict[str, Any]:
    """Loads JSON data from file with error handling."""

def save_json(data: Dict[str, Any], filename: str) -> bool:
    """Saves data to JSON file with proper formatting."""
```

#### update_all_exams.py

```python
def get_available_exam_codes() -> List[str]:
    """Scans data directory for available exam codes."""

def update_single_exam(
    exam_code: str, 
    progress_tracker: 'ProgressTracker'
) -> Dict[str, Any]:
    """Updates a single exam with error handling."""

class ProgressTracker:
    """Simple progress tracking utility."""
    
    def __init__(self, description: str = ""):
        self.description = description
    
    def progress(self, value: float, text: str = "") -> None:
        """Log progress message."""
```

#### update_manifest.py

```python
def generate_manifest() -> Dict[str, Any]:
    """Generates optimized manifest.json for Next.js application."""

def calculate_exam_stats(exam_data: Dict[str, Any]) -> Dict[str, int]:
    """Calculates statistics for exam data."""
```

## 📊 Data Structures

### Exam Data Format

```json
{
  "status": "complete",
  "error": null,
  "questions": [
    {
      "question": "Question text content",
      "answers": [
        "A. First option",
        "B. Second option",
        "C. Third option",
        "D. Fourth option"
      ],
      "comments": [
        {
          "content": "Comment text",
          "selected_answer": "A",
          "replies": []
        }
      ],
      "most_voted": "A",
      "question_number": "1",
      "explanation": "Optional explanation text",
      "images": {
        "image1": {
          "webp": "/images/exam/question1.webp",
          "jpeg": "/images/exam/question1.jpg"
        }
      }
    }
  ]
}
```

### Manifest Format

```json
{
  "version": "4.0.0",
  "generated": "2024-01-04T10:30:00.000Z",
  "totalExams": 20,
  "totalQuestions": 3000,
  "exams": [
    {
      "code": "CAD",
      "name": "Certified Application Developer",
      "description": "ServiceNow Certified Application Developer",
      "questionCount": 150,
      "lastUpdated": "2024-01-04T09:15:00.000Z"
    }
  ]
}
```

### Statistics Storage Format

```json
{
  "totalQuestionsAnswered": 150,
  "correctAnswers": 120,
  "incorrectAnswers": 25,
  "accuracy": 80.0,
  "timeSpent": 3600,
  "favoriteQuestions": 15,
  "sessions": [
    {
      "id": "session_2024_01_04_12345",
      "examCode": "CAD",
      "examName": "Certified Application Developer",
      "startTime": "2024-01-04T10:00:00.000Z",
      "endTime": "2024-01-04T11:30:00.000Z",
      "questionsAnswered": 50,
      "correctAnswers": 40,
      "accuracy": 80.0,
      "timeSpent": 5400,
      "completionPercentage": 33.3,
      "difficultyBreakdown": {
        "easy": { "answered": 20, "correct": 18, "total": 25 },
        "medium": { "answered": 20, "correct": 15, "total": 30 },
        "hard": { "answered": 10, "correct": 7, "total": 20 }
      }
    }
  ]
}
```

## 🔧 Configuration

### Next.js Configuration

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async headers() {
    return [
      {
        source: '/data/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};
```

### Environment Variables

```bash
# Development
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Python Scripts
RAPID_SCRAPING=false
MAX_RETRIES=3
DELAY_SECONDS=5
```

## 🚨 Error Handling

### React Error Boundaries

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### Zustand Error Handling

```typescript
// Error handling in stores
const useExamStore = create<ExamStore>()((set, get) => ({
  loadExam: async (examCode: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const examData = await fetchExamData(examCode);
      set({ currentExam: examData, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  },
}));
```

## 🔍 Development Utilities

### Debug Functions

```typescript
// Development mode detection
export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === 'development';
}

// Debug logging
export function devLog(message: string, data?: any): void {
  if (isDevelopmentMode()) {
    console.log(`[DEBUG] ${message}`, data);
  }
}

// Error logging
export function devError(message: string, error: Error): void {
  if (isDevelopmentMode()) {
    console.error(`[ERROR] ${message}`, error);
  }
}
```

### Performance Monitoring

```typescript
// Performance measurement
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  if (isDevelopmentMode()) {
    performance.mark(`${name}-start`);
    const result = fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    return result;
  }
  return fn();
}

// Component performance monitoring
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  displayName: string
): React.ComponentType<P> {
  const MonitoredComponent = (props: P) => {
    React.useEffect(() => {
      if (isDevelopmentMode()) {
        console.log(`${displayName} rendered`);
      }
    });

    return <WrappedComponent {...props} />;
  };

  MonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  return MonitoredComponent;
}
```

This comprehensive API documentation covers the modern Next.js architecture with TypeScript, React components, Zustand state management, and all the utilities and hooks used in the application.