# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build**: `npm run build` 
- **Production server**: `npm start`
- **Linting**: `npm run lint`

## Data Management Scripts

Python scripts are located in `/scripts/` for managing exam data:

- **Update manifest**: `python3 scripts/update_manifest.py` - Run after data changes
- **Scrape exam**: `python3 scripts/scraper.py [EXAM_CODE]` - Add/update specific exam
- **Update all exams**: `python3 scripts/update_all_exams.py` - Batch update all exams

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

## Documentation

Comprehensive documentation is available in the `/docs/` directory:
- All documentation has been updated to reflect the modern Next.js architecture
- Complete API documentation with TypeScript interfaces
- Component architecture and state management patterns
- Performance optimizations and deployment guides
- Development workflows and testing strategies

Last updated: January 2025 - Complete documentation migration to Next.js architecture