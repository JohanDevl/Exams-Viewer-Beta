# 🛠️ Development Guide - Exams Viewer

> **Comprehensive guide for developers working with the modern Next.js architecture**

This guide covers the development setup, architecture patterns, and contribution guidelines for the Next.js Exams Viewer project.

## 🏗️ Project Architecture

### Modern Next.js Structure

```
Exams-Viewer/
├── 📁 src/                        # Application source code
│   ├── 📄 app/                    # Next.js App Router
│   │   ├── globals.css            # Global styles and CSS variables
│   │   ├── layout.tsx             # Root layout with providers
│   │   └── page.tsx               # Main application page
│   ├── 🧩 components/             # React components
│   │   ├── exam/                  # Exam-specific components
│   │   │   ├── ExamHeader.tsx     # Exam information display
│   │   │   ├── ExamSelector.tsx   # Exam selection dropdown
│   │   │   └── ExamViewer.tsx     # Main exam viewing component
│   │   ├── question/              # Question display components
│   │   │   └── QuestionDisplay.tsx # Individual question component
│   │   ├── navigation/            # Navigation components
│   │   │   ├── MobileNavigationBar.tsx # Mobile navigation
│   │   │   ├── NavigationControls.tsx  # Question navigation
│   │   │   └── Sidebar.tsx        # Question overview sidebar
│   │   ├── modals/                # Modal dialog components
│   │   │   ├── ExportModal.tsx    # Data export functionality
│   │   │   ├── FavoritesModal.tsx # Favorites management
│   │   │   ├── SettingsModal.tsx  # Application settings
│   │   │   ├── StatisticsModal.tsx # Analytics and stats
│   │   │   └── index.ts           # Modal exports
│   │   ├── providers/             # React context providers
│   │   │   ├── KeyboardShortcutsProvider.tsx # Keyboard shortcuts
│   │   │   ├── ModalsProvider.tsx # Modal state management
│   │   │   ├── SessionPersistenceProvider.tsx # Session handling
│   │   │   ├── ThemeInitializer.tsx # Theme initialization
│   │   │   └── ToastProvider.tsx  # Notification system
│   │   └── ui/                    # Reusable UI components
│   │       ├── button.tsx         # Custom button component
│   │       ├── dialog.tsx         # Dialog primitives
│   │       ├── input.tsx          # Form input components
│   │       └── ... (Radix UI components)
│   ├── 🪝 hooks/                  # Custom React hooks
│   │   ├── useKeyboardShortcuts.ts # Keyboard shortcut management
│   │   ├── useScrollLock.ts       # Body scroll lock for modals
│   │   ├── useSessionPersistence.ts # Session data persistence
│   │   ├── useSoundEffects.ts     # Audio feedback system
│   │   └── useToastWithSound.ts   # Toast notifications with audio
│   ├── 🗃️ stores/                 # Zustand state management
│   │   ├── examStore.ts           # Exam data and question states
│   │   ├── settingsStore.ts       # User preferences
│   │   └── statisticsStore.ts     # Session tracking and analytics
│   ├── 🏷️ types/                  # TypeScript type definitions
│   │   └── index.ts               # Comprehensive type system
│   └── 🔧 utils/                  # Utility functions
│       ├── exportUtils.ts         # Data export functionality
│       └── linkUtils.tsx          # External link processing
├── 📁 public/                     # Static assets
│   ├── data/                      # Exam data repository
│   │   ├── manifest.json          # Exam catalog
│   │   └── {EXAM_CODE}/           # Individual exam folders
│   │       ├── exam.json          # Questions and answers
│   │       └── links.json         # Resource metadata
│   └── ... (static assets)
├── 🐍 scripts/                    # Python data management
│   ├── scraper.py                 # Web scraping functionality
│   ├── update_all_exams.py        # Batch exam updates
│   └── update_manifest.py         # Manifest generation
├── 📚 docs/                       # Documentation
├── 🔧 Configuration files
│   ├── next.config.ts             # Next.js configuration
│   ├── tsconfig.json              # TypeScript configuration
│   ├── tailwind.config.ts         # Tailwind CSS configuration
│   ├── components.json            # Shadcn/ui configuration
│   └── package.json               # Node.js dependencies and scripts
└── 📋 requirements.txt            # Python dependencies
```

## 🔧 Development Setup

### Prerequisites

- **Node.js 18+** - For Next.js and modern JavaScript features
- **npm or yarn** - Package manager for Node.js dependencies
- **Python 3.11+** - For data management scripts
- **Git** - Version control and collaboration
- **Modern Browser** - Chrome, Firefox, Safari, Edge with DevTools
- **Code Editor** - VS Code recommended with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint

### Local Development Setup

1. **Clone and Initialize**
   ```bash
   # Clone the repository
   git clone https://github.com/JohanDevl/Exams-Viewer-Beta.git
   cd Exams-Viewer-Beta
   
   # Install Node.js dependencies
   npm install
   
   # Install Python dependencies (for data scripts)
   pip install -r requirements.txt
   ```

2. **Development Environment**
   ```bash
   # Start Next.js development server with Turbopack
   npm run dev
   
   # Open browser to http://localhost:3000
   # Hot reload enabled for instant development feedback
   ```

3. **Additional Commands**
   ```bash
   # Build for production
   npm run build
   
   # Start production server
   npm run start
   
   # Run linting
   npm run lint
   
   # TypeScript type checking (automatic in development)
   npx tsc --noEmit
   ```

## 🏛️ Architecture Patterns

### Next.js App Router

#### File-based Routing
```typescript
// src/app/layout.tsx - Root layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeInitializer />
        <ToastProvider />
        <ModalsProvider />
        <KeyboardShortcutsProvider />
        <div id="root" className="min-h-screen bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>
  )
}
```

#### Server and Client Components
```typescript
// Server Component (default)
async function ExamData({ examCode }: { examCode: string }) {
  const data = await fetchExamData(examCode); // Server-side data fetching
  return <ExamContent data={data} />;
}

// Client Component
'use client'
function InteractiveComponent() {
  const [state, setState] = useState(false);
  return <button onClick={() => setState(!state)}>Toggle</button>;
}
```

### State Management with Zustand

#### Store Definition Pattern
```typescript
// stores/examStore.ts
interface ExamStore {
  // State
  currentExam: ExamData | null;
  currentQuestionIndex: number;
  isLoading: boolean;
  
  // Actions
  loadExam: (examCode: string) => Promise<void>;
  setCurrentQuestion: (index: number) => void;
}

export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentExam: null,
      currentQuestionIndex: 0,
      isLoading: false,
      
      // Actions
      loadExam: async (examCode: string) => {
        set({ isLoading: true });
        try {
          const data = await fetchExamData(examCode);
          set({ currentExam: data, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },
      
      setCurrentQuestion: (index: number) => {
        set({ currentQuestionIndex: index });
      },
    }),
    {
      name: 'exam-store',
      partialize: (state) => ({
        // Only persist certain state
        examData: state.examData,
        searchFilters: state.searchFilters,
      }),
    }
  )
);
```

#### Store Usage in Components
```typescript
// Component using Zustand store
function ExamViewer() {
  const { 
    currentExam, 
    currentQuestionIndex, 
    isLoading, 
    loadExam, 
    setCurrentQuestion 
  } = useExamStore();

  useEffect(() => {
    loadExam('CAD');
  }, [loadExam]);

  if (isLoading) return <LoadingSpinner />;
  if (!currentExam) return <NoExamSelected />;

  return (
    <div>
      <QuestionDisplay 
        question={currentExam.questions[currentQuestionIndex]}
        onNext={() => setCurrentQuestion(currentQuestionIndex + 1)}
      />
    </div>
  );
}
```

### Component Architecture

#### Component Composition Pattern
```typescript
// High-level component composition
function ExamViewer() {
  return (
    <div className="exam-viewer">
      <ExamHeader />
      <div className="exam-content">
        <Sidebar />
        <MainContent>
          <QuestionDisplay />
          <NavigationControls />
        </MainContent>
      </div>
    </div>
  );
}
```

#### Props Interface Pattern
```typescript
// Clear component interfaces
interface QuestionDisplayProps {
  question: Question;
  questionIndex: number;
  questionState: QuestionState;
  onAnswerSelect: (answers: string[]) => void;
  onPreview: () => void;
  onReset: () => void;
  className?: string;
}

function QuestionDisplay({
  question,
  questionIndex,
  questionState,
  onAnswerSelect,
  onPreview,
  onReset,
  className
}: QuestionDisplayProps) {
  // Component implementation
}
```

## 🎯 Development Guidelines

### TypeScript Best Practices

#### Type Definition
```typescript
// Define comprehensive interfaces
interface Question {
  question: string;
  answers: string[];
  comments: Comment[];
  correct_answers?: string[];
  explanation?: string;
  most_voted?: string;
  images?: Record<string, { webp: string; jpeg: string }>;
  question_number?: string;
}

// Use union types for controlled values
type QuestionStatus = "unanswered" | "answered" | "correct" | "incorrect" | "preview";
type DifficultyLevel = "easy" | "medium" | "hard" | null;
```

#### Generic Types
```typescript
// Utility types for better type safety
type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Usage example
type PartialExamState = DeepPartial<ExamState>;
type ExamWithRequiredCode = RequiredFields<ExamInfo, 'code'>;
```

### React Patterns

#### Custom Hooks Pattern
```typescript
// Custom hook for keyboard shortcuts
function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      const shortcut = shortcuts.find(s => 
        s.key === event.key &&
        s.ctrlKey === event.ctrlKey &&
        s.altKey === event.altKey &&
        s.shiftKey === event.shiftKey
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}
```

#### Error Boundary Pattern
```typescript
// Error boundary for graceful error handling
class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  { hasError: boolean; error?: Error }
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
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

### Styling with Tailwind CSS

#### Component Styling Pattern
```typescript
// Use Tailwind classes with conditional styling
function Button({ 
  variant = 'default', 
  size = 'md', 
  className, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        
        // Variant styles
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === 'default',
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === 'destructive',
          "border border-input bg-background hover:bg-accent": variant === 'outline',
        },
        
        // Size styles
        {
          "h-10 px-4 py-2": size === 'default',
          "h-9 rounded-md px-3": size === 'sm',
          "h-11 rounded-md px-8": size === 'lg',
        },
        
        className
      )}
      {...props}
    />
  );
}
```

#### CSS Custom Properties Integration
```css
/* globals.css - Theme variables */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... other variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark theme variables */
  }
}
```

### File Organization

#### Component Structure
```typescript
// components/question/QuestionDisplay.tsx
interface QuestionDisplayProps {
  // Props interface
}

function QuestionDisplay(props: QuestionDisplayProps) {
  // Component logic
}

export default QuestionDisplay;
export type { QuestionDisplayProps };
```

#### Barrel Exports
```typescript
// components/modals/index.ts
export { default as ExportModal } from './ExportModal';
export { default as FavoritesModal } from './FavoritesModal';
export { default as SettingsModal } from './SettingsModal';
export { default as StatisticsModal } from './StatisticsModal';

export type { ExportModalProps } from './ExportModal';
export type { FavoritesModalProps } from './FavoritesModal';
// ... other prop types
```

### Performance Considerations

#### Code Splitting
```typescript
// Lazy load heavy components
const StatisticsModal = lazy(() => import('./StatisticsModal'));
const ExportModal = lazy(() => import('./ExportModal'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {showStatistics && <StatisticsModal />}
      {showExport && <ExportModal />}
    </Suspense>
  );
}
```

#### Memoization
```typescript
// Memoize expensive calculations
const memoizedStats = useMemo(() => {
  return calculateComplexStatistics(sessionData);
}, [sessionData]);

// Memoize components to prevent unnecessary re-renders
const MemoizedQuestionDisplay = memo(QuestionDisplay);
```

#### Zustand Selectors
```typescript
// Use selectors to minimize re-renders
const currentQuestion = useExamStore(state => 
  state.currentExam?.questions[state.currentQuestionIndex]
);

const isLoading = useExamStore(state => state.isLoading);
```

## 🧪 Testing and Debugging

### Development Tools

#### Next.js DevTools
- **Fast Refresh** - Instant feedback on code changes
- **Error Overlay** - Detailed error information with stack traces
- **Build Analyzer** - Bundle size analysis and optimization suggestions

#### Browser DevTools
```typescript
// Debug mode detection
const isDevelopment = process.env.NODE_ENV === 'development';

// Conditional logging
if (isDevelopment) {
  console.log('Store state:', useExamStore.getState());
}
```

#### TypeScript Integration
```bash
# Real-time type checking in development
npm run dev # TypeScript checking included

# Manual type checking
npx tsc --noEmit

# Watch mode for type checking
npx tsc --noEmit --watch
```

### Common Debugging Patterns

#### Store Debugging
```typescript
// Add store debugging
const useExamStore = create<ExamStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Store implementation
      }),
      { name: 'exam-store' }
    ),
    { name: 'ExamStore' }
  )
);
```

#### Component Debugging
```typescript
// Debug component renders
function DebugComponent({ name, ...props }) {
  console.log(`${name} rendered with props:`, props);
  return <Component {...props} />;
}
```

#### Performance Monitoring
```typescript
// Monitor component performance
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Profiler:', { id, phase, actualDuration });
}

<Profiler id="QuestionDisplay" onRender={onRenderCallback}>
  <QuestionDisplay />
</Profiler>
```

## 🚀 Build and Deployment

### Production Build

#### Build Process
```bash
# Build the application
npm run build

# Analyze bundle size
npm run build -- --analyze

# Start production server
npm run start
```

#### Build Optimization
```typescript
// next.config.ts optimizations
const nextConfig: NextConfig = {
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // Bundle analyzer
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
      };
    }
    return config;
  },
  
  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};
```

### Deployment Strategies

#### Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Environment variables in Vercel dashboard
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

#### Static Export
```typescript
// next.config.ts for static export
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
};
```

## 🤝 Contributing Guidelines

### Git Workflow

#### Branch Strategy
```bash
# Feature development
git checkout -b feature/exam-filtering-system

# Bug fixes  
git checkout -b fix/session-persistence-issue

# Documentation updates
git checkout -b docs/api-documentation-update
```

#### Commit Message Convention
```bash
# Format: type(scope): description
feat(exam): add difficulty rating system
fix(navigation): resolve keyboard shortcut conflicts
docs(api): update TypeScript interfaces
refactor(stores): optimize Zustand store structure
style(ui): improve mobile responsiveness
test(components): add unit tests for QuestionDisplay
```

### Code Review Process

#### Pre-commit Checklist
- [ ] TypeScript compilation successful (`npx tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] All tests pass (if applicable)
- [ ] Build succeeds (`npm run build`)
- [ ] Mobile responsiveness tested
- [ ] Dark mode compatibility verified
- [ ] Accessibility considerations addressed

#### Review Criteria
```typescript
// Example of good component structure for review
interface ComponentProps {
  // Well-defined props interface
}

function Component({ prop1, prop2, ...props }: ComponentProps) {
  // Clear variable names and logic
  const { state, action } = useStore();
  
  // Proper error handling
  if (error) return <ErrorState />;
  if (loading) return <LoadingState />;
  
  // Clean JSX structure
  return (
    <div className="component-wrapper" {...props}>
      <Header />
      <Content />
      <Footer />
    </div>
  );
}

export default Component;
```

### Documentation Standards

#### Component Documentation
```typescript
/**
 * QuestionDisplay component renders individual exam questions with interactive features.
 * 
 * @param question - The question data to display
 * @param questionIndex - Zero-based index of the question
 * @param questionState - Current state of the question (answered, favorites, etc.)
 * @param onAnswerSelect - Callback when user selects answers
 * @param onPreview - Callback when user toggles answer preview
 * @param onReset - Callback when user resets the question
 * 
 * @example
 * ```tsx
 * <QuestionDisplay
 *   question={examData.questions[0]}
 *   questionIndex={0}
 *   questionState={questionStates[0]}
 *   onAnswerSelect={(answers) => handleAnswerSelection(0, answers)}
 *   onPreview={() => handlePreview(0)}
 *   onReset={() => handleReset(0)}
 * />
 * ```
 */
function QuestionDisplay(props: QuestionDisplayProps) {
  // Implementation
}
```

#### README Updates
When adding new features, update relevant documentation:
- API documentation for new interfaces
- Component documentation for new components
- Usage examples for new functionality
- Configuration options for new settings

## 📊 Data Management Scripts

### Python Script Development

#### Script Integration
```bash
# Update exam data
python3 scripts/update_all_exams.py

# Update specific exam
python3 scripts/scraper.py CAD

# Generate manifest
python3 scripts/update_manifest.py
```

#### Script Development Pattern
```python
# scripts/example_script.py
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def process_exam_data(exam_code: str) -> Dict:
    """Process exam data with proper error handling."""
    try:
        # Implementation
        logger.info(f"Processing exam: {exam_code}")
        return {"status": "success", "data": processed_data}
    except Exception as e:
        logger.error(f"Error processing {exam_code}: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    # Script execution
    result = process_exam_data("CAD")
    logger.info(f"Result: {result}")
```

## 📚 Additional Resources

### Learning Resources
- **[Next.js Documentation](https://nextjs.org/docs)** - Official Next.js documentation
- **[React 19 Features](https://react.dev/blog/2024/04/25/react-19)** - Latest React features
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - TypeScript fundamentals
- **[Zustand Documentation](https://zustand.docs.pmnd.rs/)** - State management guide
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives

### Development Tools
- **VS Code Extensions**:
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
- **Browser Extensions**:
  - React Developer Tools
  - Redux DevTools (for Zustand debugging)
- **Performance Tools**:
  - Lighthouse
  - Web Vitals Extension
  - Next.js Bundle Analyzer

### Project Resources
- **[API Documentation](API.md)** - Comprehensive API reference
- **[Usage Guide](USAGE.md)** - End-user functionality guide
- **[Performance Guide](PERFORMANCE_OPTIMIZATIONS.md)** - Optimization techniques
- **[Features Overview](FEATURES.md)** - Complete feature documentation

---

This development guide provides the foundation for contributing to and extending the modern Next.js Exams Viewer project. The architecture is designed for scalability, maintainability, and excellent developer experience.