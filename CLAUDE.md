# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build**: `npm run build` (includes manifest generation)
- **GitHub Pages build**: `npm run build:github` (optimized for static deployment)
- **Production server**: `npm start`
- **Linting**: `npm run lint`
- **Generate manifest**: `npm run generate-manifest` (updates exam catalog)

## Data Management Scripts

Python scripts are located in `/scripts/` for managing exam data:

### Batch Processing (Recommended)
- **ServiceNow batch scraper**: `python3 scripts/servicenow_batch_scraper.py` - Optimized scraper for all ServiceNow exams with multi-level progress bars and detailed update summaries
- **ServiceNow links only**: `python3 scripts/servicenow_batch_scraper.py --links-only` - Collect links for all ServiceNow exams in single pass
- **ServiceNow questions only**: `python3 scripts/servicenow_batch_scraper.py --questions-only` - Process questions using pre-collected links
- **Single exam**: `python3 scripts/servicenow_batch_scraper.py --exam [EXAM_CODE]` - Process specific exam with progress tracking

### Individual Scripts
- **Update manifest**: `python3 scripts/update_manifest.py` - Run after data changes
- **Scrape exam**: `python3 scripts/scraper.py [EXAM_CODE]` - Add/update specific exam with smart update detection

### Progress Tracking Features
- **Multi-level progress bars**: Main progress for overall workflow, sub-progress for individual phases
- **ETA calculations**: Precise time estimates based on observed delays (2-4s between pages, 5-10s between questions, 15s between exams)
- **Detailed update summaries**: After each exam processing, displays counts of new, updated, and skipped questions
- **Global statistics**: Final summary showing total changes across all processed exams

### Update Summary Format
After processing each exam, the scraper displays:
```
📊 Update Summary:
   ✅ New questions added: X
   🔄 Existing questions updated: X
   ⏭️ Questions skipped (no changes): X
✅ EXAM-CODE: X questions updated successfully
```

Requirements: Python 3.6+, `tqdm` library, write access to `public/data/` directory.

## Architecture Overview

This is a modern Next.js 15 application with App Router for ServiceNow certification exam preparation.

### Core Architecture

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **State Management**: Zustand stores with persistence
- **UI Framework**: Radix UI components with custom styling
- **Data Storage**: Static JSON files in `/public/data/` with client-side processing

### Key Stores (Zustand)

- `examStore` (`src/stores/examStore.ts`): Manages exam data, question states, progress tracking, exam mode, and session management
- `settingsStore` (`src/stores/settingsStore.ts`): User preferences, application settings, and modal state management  
- `statisticsStore` (`src/stores/statisticsStore.ts`): Session tracking, performance analytics, and exam statistics

### Data Structure

```
public/data/
├── manifest.json          # Central exam catalog with metadata
├── [EXAM_CODE]/
│   ├── exam.json          # Questions and answers
│   └── links.json         # External resources
```

### Component Organization

- `src/components/exam/` - Exam-specific components (ExamViewer, ExamSelector, ExamTimer, ExamHeader)
- `src/components/question/` - Question display and interaction logic
- `src/components/navigation/` - Navigation controls and sidebar management
- `src/components/modals/` - Modal dialogs (Settings, Statistics, Export, Favorites, Exam Configuration/Results)
- `src/components/providers/` - Context providers for theme, keyboard shortcuts, etc.
- `src/components/ui/` - Reusable UI components based on Radix UI
- `src/components/layout/` - Layout components (AppHeader with responsive navigation)

### Session Management

The application tracks user sessions for statistics:
- Sessions auto-start when loading an exam
- Real-time progress tracking during question interactions
- Sessions persist across browser refreshes
- Automatic session finalization on exam reset or navigation

### Question State Tracking

Each question maintains:
- `status`: Current answer state (unanswered, correct, incorrect, preview)
- `userAnswer`: Latest answer attempt
- `firstAnswer`: Permanent record for statistics (never overwritten)
- `isFavorite`, `difficulty`, `notes`, `category`: User annotations

### Path Aliases

- `@/*` maps to `src/*` for clean imports

### Performance Optimizations

- Turbopack for fast development builds
- Package import optimization for lucide-react
- Static asset caching with proper headers
- Manifest system reduces initial HTTP requests by ~90%

## Exam Mode System

The application features a comprehensive exam mode system designed to simulate real certification exam conditions with strict feedback controls and anti-cheating measures.

### Exam Mode Features

- **Timed Examinations**: Configurable timer with visual warnings and auto-submission
- **Question Selection**: Smart filtering with customizable question counts and difficulty levels
- **Feedback Control**: Complete answer hiding during active exam sessions
- **Manual Finish**: Early exam completion with double-confirmation safety
- **Progress Tracking**: Context-aware progress bars (exam questions vs all questions)
- **No Time Limit Support (v5.1.0)**: Finish Exam button remains available even when timer is disabled
- **Smart Question Auto-Selection (v5.1.0)**: Automatically selects all questions for exams with less than 60 questions
- **Security Measures**: Statistics and export features disabled during active exams
- **Answer Modification**: Ability to change answers during exam using reset-based system

### Exam Phases and States

1. **Configuration Phase** (`phase: 'config'`):
   - Question count selection (10-100 questions)
   - Difficulty filtering options
   - Timer configuration (15-180 minutes)
   - Custom exam setup via modal interface

2. **Active Phase** (`phase: 'active'`):
   - Timer countdown with color-coded warnings (15min, 5min, 1min, 30s)
   - Answers hidden to prevent cheating
   - Score display completely masked
   - Navigation restricted to selected questions only
   - Change answer functionality available via reset button
   - Manual finish button with confirmation system

3. **Completed Phase** (`phase: 'completed'`):
   - Full results display with score and breakdown
   - Detailed question review with correct answers
   - Navigation through all attempted questions
   - Auto-reveal for unanswered questions
   - Export and statistics features re-enabled

### Timer System (`ExamTimer.tsx`)

- **Visual Indicators**: Color-coded progress bar (green → yellow → orange → red)
- **Progressive Warnings**: Toast notifications at 15, 5, 1, and 0.5 minutes remaining
- **Manual Finish**: Double-click confirmation system to prevent accidental submission
- **Auto-submission**: Automatic exam completion when timer reaches zero
- **Integration**: Seamlessly integrated into exam header with progress tracking

### Feedback Control System

The application implements strict feedback control during exam mode:

```typescript
const shouldHideFeedback = examState.mode === 'exam' && 
                          examState.phase === 'active' && 
                          !examState.isSubmitted;
```

**During Active Exam**:
- ❌ Correct/incorrect answer indicators hidden
- ❌ Score display (X/Y correct) completely masked
- ❌ Community comments hidden
- ❌ Explanation text hidden
- ❌ Statistics and export buttons disabled
- ✅ Answer modification allowed via "Change Answer" button
- ✅ Question navigation within selected subset

**After Exam Completion**:
- ✅ All feedback revealed with color-coded answers
- ✅ Detailed explanations shown
- ✅ Community comments available
- ✅ Statistics and export re-enabled
- ❌ No retry buttons (results are final)
- ✅ Free navigation through all questions

### Question State Management

Questions track different answer states for exam vs study modes:

- **Study Mode**: Uses `firstAnswer` for permanent statistics
- **Exam Mode**: Uses `userAnswer` for resettable answers during exam
- **Progress Tracking**: Context-aware calculation based on relevant question subset
- **Auto-revelation**: Unanswered questions automatically show correct answers after exam ends

### Anti-Cheating Measures

- **Interface Lockdown**: Core functionality disabled during active exams
- **State Validation**: Server-side style state management prevents manipulation
- **Answer Masking**: Complete visual hiding of correct answers and scores
- **Limited Navigation**: Restricted to selected exam questions only
- **Session Integrity**: Exam state persists across browser refreshes

### Components Architecture

- `ExamConfigModal.tsx`: Exam setup and configuration interface
- `ExamTimer.tsx`: Comprehensive timer with warnings and manual finish
- `ExamHeader.tsx`: Integrated progress tracking and timer display
- `ExamResultsModal.tsx`: Post-exam results and score breakdown
- `ExamReviewModal.tsx`: Detailed question-by-question review
- `QuestionDisplay.tsx`: Context-aware rendering based on exam state

## Development Notes

### Key Features
- Application supports both French and English interfaces
- PWA capabilities with offline support and service worker caching
- Mobile-responsive design with collapsible navigation and touch optimizations
- Comprehensive keyboard shortcuts system with context-aware bindings
- Sound effects and toast notifications with mobile-aware feedback
- Advanced search and filtering capabilities with real-time updates
- Data export functionality (JSON, CSV, TXT, PDF) with custom filtering

### Important Implementation Details
- **Static Deployment**: Built for GitHub Pages with static generation and proper routing
- **Performance**: Turbopack for development, optimized builds with manifest system
- **State Persistence**: Zustand stores with localStorage persistence and conflict resolution
- **Error Handling**: Comprehensive error boundaries and user feedback systems
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## Mobile Optimization

### Ultra-Aggressive Scroll Lock System
The application features a sophisticated scroll lock system specifically designed for mobile devices to prevent any unwanted scrolling during user interactions:

- **Complete Page Freeze**: During button interactions (validate, show answer, reset), the entire page is locked using `position: fixed` on both `body` and `html` elements
- **Event Prevention**: All scroll-related events (`scroll`, `touchmove`, `touchstart`, `touchend`, `wheel`) are completely blocked during interactions
- **300ms Lock Duration**: Extended lock time on mobile ensures zero scroll clipping
- **Automatic Mobile Detection**: Intelligent detection via user agent and screen width
- **Sound Interference Prevention**: Audio effects are disabled on mobile to prevent `setTimeout` conflicts
- **CSS Reinforcement**: Additional CSS classes (`.scroll-locked`, `.ultra-locked`) provide bulletproof scroll prevention
- **Position Restoration**: Multiple attempts to restore exact scroll position after interaction

This system ensures users experience zero scroll movement during question interactions, maintaining perfect position stability.

### Revolutionary Sidebar Navigation (v5.1.0)
The sidebar has been completely redesigned for mobile devices with native scroll integration:
- **Native Scroll Replacement**: Replaced Radix ScrollArea with native `overflow-y: auto` for superior mobile compatibility
- **Body Scroll Isolation**: Implemented body scroll lock (`position: fixed`) when sidebar is open to prevent background page scrolling
- **Advanced Event Management**: Touch and wheel events are captured and prevented from propagating to parent elements
- **Flexbox Layout Architecture**: Complete restructure using `flex flex-col` for precise height management across all screen sizes
- **Platform-Specific Rendering**: Separate mobile (`md:hidden`) and desktop (`hidden md:block`) rendering paths for optimal UX
- **Fixed Positioning with Hardware Acceleration**: Sidebar maintains fixed position during page scroll using `transform: translateZ(0)`
- **Precise Height Calculations**: Smart mobile height using `calc(100vh - 4rem - 60px - 4rem - 4rem)` accounting for all UI elements

### Enhanced Mobile Input Experience (v5.1.0)
Optimized touch interactions and input handling for mobile devices:
- **Automatic Numeric Keyboards**: Custom exam inputs trigger `inputMode="numeric"` for seamless number entry
- **Force Card View**: Mobile devices automatically use card view layout for optimal touch browsing
- **Responsive Modal System**: All dialogs and modals fully optimized for mobile screen constraints
- **Touch Event Optimization**: Advanced touch handling with proper event propagation control and performance optimization

## Dynamic Domain Management System (v5.2.0)

The application features a sophisticated, configurable domain management system that automatically categorizes ServiceNow exams into knowledge domains for advanced analytics and performance tracking.

### Three-Tiered Detection System
1. **Manifest Integration**: Domains explicitly defined in `manifest.json` take highest priority
2. **Pattern-Based Auto-Detection**: RegExp patterns automatically categorize exams based on exam codes
3. **Configuration Overrides**: Manual assignments override auto-detection for specific exams
4. **Fallback System**: Unrecognized exams default to "Development" domain

### Supported ServiceNow Domains
- **ITSM** (IT Service Management): CIS-ITSM, CIS-EM, CIS-Discovery, CIS-SM
- **Security**: CIS-SIR, CIS-VR, CIS-VRM, CIS-RC  
- **HR** (Human Resources): CIS-HR, HR-related exams
- **Asset Management**: CIS-HAM, CIS-SAM, Asset-related exams
- **Service Management**: CIS-SM, Service-related certifications
- **Portfolio Management**: CIS-PPM, Portfolio-related exams
- **Development**: CAD, CSA, CIS-CSM, Development-related exams
- **Infrastructure**: Server-related and infrastructure exams

### Auto-Detection Patterns (`src/utils/domainMapping.ts`)
```typescript
export const DOMAIN_DETECTION_PATTERNS: Record<ServiceNowDomain, DomainPattern> = {
  "ITSM": { pattern: /^(CIS-ITSM|CIS-EM|CIS-Discovery|CIS-SM)$/i, priority: 10 },
  "Security": { pattern: /^(CIS-SIR|CIS-VR|CIS-VRM|CIS-RC)$/i, priority: 9 },
  // ... other patterns with priority-based matching
};
```

### Domain Management Interface
- **Settings Integration**: Access via Settings → Domain Management
- **Visual Domain Overview**: Grid layout showing exam distribution across domains
- **Real-Time Editing**: Click-to-edit domain assignments with immediate updates
- **Confidence Indicators**: Visual feedback on auto-detection confidence levels
- **Reset to Auto-Detected**: Restore original auto-detected domain assignments
- **Override Management**: View and manage manual domain overrides

### Python Integration (`scripts/update_manifest.py`)
The manifest generation script automatically detects domains during processing:
```python
def detect_servicenow_domain(exam_code):
    domain_patterns = {
        'ITSM': [r'^CIS-ITSM', r'^CIS-EM', r'^CIS-Discovery', r'^CIS-SM'],
        'Security': [r'^CIS-SIR', r'^CIS-VR', r'^CIS-VRM', r'^CIS-RC'],
        # ... mirrors TypeScript patterns exactly
    }
```

### Analytics Integration
- **Performance Heatmaps**: Visual representation of accuracy across domains
- **Domain-Specific Statistics**: Detailed metrics per knowledge area
- **Temporal Filtering**: 7d/30d/all-time analysis per domain
- **Exam Breakdown**: Individual exam performance within domains
- **Improvement Tracking**: Trend analysis for focused learning

### Configuration Management
- **Runtime Updates**: Changes take effect immediately without restart
- **Persistent Storage**: Domain overrides saved in localStorage
- **Bulk Operations**: Efficient batch updates for multiple exams
- **Validation**: Ensures data consistency across all domain assignments

## Documentation

Comprehensive documentation is available in the `/docs/` directory:
- All documentation has been updated to reflect the modern Next.js architecture
- Complete API documentation with TypeScript interfaces
- Component architecture and state management patterns
- Performance optimizations and deployment guides
- Development workflows and testing strategies

## TypeScript Architecture

### Core Type Definitions (`src/types/index.ts`)
- **Question & Exam Types**: `Question`, `ExamData`, `ExamInfo`, `Manifest` for data structure
- **State Management**: `QuestionState`, `ExamProgress`, `UserAnswer` for application state  
- **Exam Mode**: `ExamMode`, `ExamPhase`, `ExamState`, `TimerState`, `ExamResult` for exam functionality
- **Settings & UI**: `UserSettings`, `SearchFilters`, `ToastMessage` for user interface
- **Export & Analytics**: `ExportOptions`, `ExamSession`, `Statistics` for data export and tracking

### State Management Pattern
All stores use Zustand with:
- Persistent storage via localStorage
- Computed derived state for performance
- Action-based mutations for predictable updates
- TypeScript integration for type safety

Last updated: January 2025 - Dynamic Domain Management System with configurable ServiceNow domain analytics, mobile experience revolution with native sidebar navigation, enhanced exam mode with flexible timer options, and optimized responsive design (v5.2.0)