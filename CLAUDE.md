# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build**: `npm run build` 
- **Production server**: `npm start`
- **Linting**: `npm run lint`

## Data Management Scripts

Python scripts are located in `/scripts/` for managing exam data:

### Batch Processing (Recommended)
- **ServiceNow batch scraper**: `python3 scripts/servicenow_batch_scraper.py` - Optimized scraper for all ServiceNow exams (85% fewer requests, 75% faster)
- **ServiceNow links only**: `python3 scripts/servicenow_batch_scraper.py --links-only` - Collect links for all ServiceNow exams in single pass
- **ServiceNow questions only**: `python3 scripts/servicenow_batch_scraper.py --questions-only` - Process questions using pre-collected links

### Individual Scripts
- **Update manifest**: `python3 scripts/update_manifest.py` - Run after data changes
- **Scrape exam**: `python3 scripts/scraper.py [EXAM_CODE]` - Add/update specific exam

Requirements: Python 3.6+, write access to `public/data/` directory.

## Architecture Overview

This is a modern Next.js 15 application with App Router for ServiceNow certification exam preparation.

### Core Architecture

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **State Management**: Zustand stores with persistence
- **UI Framework**: Radix UI components with custom styling
- **Data Storage**: Static JSON files in `/public/data/` with client-side processing

### Key Stores (Zustand)

- `examStore` (`src/stores/examStore.ts`): Manages exam data, question states, progress tracking, and session management
- `settingsStore` (`src/stores/settingsStore.ts`): User preferences and application settings
- `statisticsStore` (`src/stores/statisticsStore.ts`): Session tracking and performance analytics

### Data Structure

```
public/data/
├── manifest.json          # Central exam catalog with metadata
├── [EXAM_CODE]/
│   ├── exam.json          # Questions and answers
│   └── links.json         # External resources
```

### Component Organization

- `src/components/exam/` - Exam-specific components (ExamViewer, ExamSelector)
- `src/components/question/` - Question display and interaction
- `src/components/navigation/` - Navigation controls and sidebar
- `src/components/modals/` - Settings, statistics, export, favorites modals
- `src/components/providers/` - Context providers for theme, keyboard shortcuts, etc.
- `src/components/ui/` - Reusable UI components based on Radix UI

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

## Development Notes

- Application supports both French and English interfaces
- PWA capabilities with offline support
- Mobile-responsive design with collapsible navigation
- Comprehensive keyboard shortcuts system
- Sound effects and toast notifications for user feedback
- Advanced search and filtering capabilities
- Data export functionality (JSON, CSV, TXT, PDF)

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

## Documentation

Comprehensive documentation is available in the `/docs/` directory:
- All documentation has been updated to reflect the modern Next.js architecture
- Complete API documentation with TypeScript interfaces
- Component architecture and state management patterns
- Performance optimizations and deployment guides
- Development workflows and testing strategies

Last updated: January 2025 - Complete documentation migration to Next.js architecture