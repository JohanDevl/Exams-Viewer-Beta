# Enhanced Export System - Next.js Exams Viewer

> **Modern export functionality built with TypeScript, Zustand state management, and React components**

This document covers the comprehensive export system in the Next.js Exams Viewer, providing multiple formats, intelligent filtering, and seamless user experience with modern React patterns.

## 🏗️ Architecture Overview

The export system is built with:
- **TypeScript Interfaces** - Type-safe export contracts and data structures
- **Zustand Integration** - State-aware export with store data access
- **React Components** - Modern modal interface with hooks and context
- **Utility Functions** - Modular export processing with error handling
- **File Management** - Browser-based file downloads with proper naming
- **Progressive Enhancement** - Client-side processing with fallback support

## 📤 Export Formats

### Supported Formats

```typescript
// Export format types
type ExportFormat = 'json' | 'csv' | 'txt' | 'pdf';

interface ExportOptions {
  format: ExportFormat;
  includeAnswers: boolean;
  includeExplanations: boolean;
  includeComments: boolean;
  includeImages: boolean;
  includeUserData: boolean;
  includeMetadata: boolean;
  filterBy?: ExportFilter;
}

type ExportFilter = 
  | 'all' 
  | 'favorites' 
  | 'answered' 
  | 'unanswered' 
  | 'correct' 
  | 'incorrect' 
  | 'notes'
  | 'category';
```

### 1. JSON Export

**Purpose**: Complete data backup and programmatic access
**Integration**: Full Zustand store state integration

```typescript
// JSON export structure
interface JSONExportData {
  metadata: {
    exportDate: string;
    examCode: string;
    examName: string;
    version: string;
    exportOptions: ExportOptions;
    questionCount: number;
    userSessionData?: {
      totalAnswered: number;
      accuracy: number;
      timeSpent: number;
    };
  };
  questions: ProcessedQuestion[];
  userAnnotations?: {
    favorites: number[];
    notes: Record<number, string>;
    categories: Record<number, string>;
    difficulty: Record<number, DifficultyLevel>;
  };
  statistics?: ExportStatistics;
}
```

**File naming**: `{examCode}-complete-export-{timestamp}.json`

### 2. CSV Export

**Purpose**: Spreadsheet analysis and data processing
**Structure**: Optimized for Excel and data analysis tools

```typescript
// CSV column structure
interface CSVRow {
  questionNumber: number;
  questionText: string;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  correctAnswer: string;
  mostVoted: string;
  userAnswer?: string;
  isCorrect?: boolean;
  difficulty?: DifficultyLevel;
  category?: string;
  notes?: string;
  isFavorite: boolean;
  commentCount: number;
}
```

**File naming**: `{examCode}-data-export-{timestamp}.csv`

### 3. TXT Export

**Purpose**: Human-readable format for sharing and documentation
**Features**: Clean formatting with markdown-style structure

```txt
# ServiceNow CAD Exam Questions
Export Date: 2024-01-15 14:30:25
Questions: 25 (Favorites Only)
Exam: Certified Application Developer

## Question 1
What is the purpose of ServiceNow's Application Portfolio Management?

A) To manage hardware inventory
B) To track software licenses and compliance
C) To monitor network performance
D) To manage user authentication

**Correct Answer**: B
**Most Voted**: B
**Your Answer**: B ✓
**Difficulty**: Medium
**Category**: APM Fundamentals
**Notes**: Key concept for APM certification

### Discussion (3 comments)
1. User123: This is a fundamental concept...
2. Expert456: Remember that APM also includes...

---
```

**File naming**: `{examCode}-questions-{timestamp}.txt`

### 4. PDF Export

**Purpose**: Professional print-ready documents
**Features**: Modern styling with Next.js integration

```typescript
// PDF generation with modern libraries
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFExportOptions extends ExportOptions {
  pageSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  includeTableOfContents: boolean;
  questionsPerPage: number;
}
```

**File naming**: `{examCode}-study-guide-{timestamp}.pdf`

## 🎯 Export Modal Component

### React Component Structure

```typescript
// components/modals/ExportModal.tsx
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  examData: ExamData | null;
  onExport: (options: ExportOptions) => void;
}

export function ExportModal({ 
  isOpen, 
  onClose, 
  examData, 
  onExport 
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeAnswers: true,
    includeExplanations: true,
    includeComments: true,
    includeImages: true,
    includeUserData: true,
    includeMetadata: true,
  });
  
  const { 
    questionStates, 
    searchFilters, 
    currentExam 
  } = useExamStore();
  
  const { statistics } = useStatisticsStore();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Exam Data</DialogTitle>
          <DialogDescription>
            Export questions and data in your preferred format
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <FormatSelector 
            value={selectedFormat}
            onChange={setSelectedFormat}
          />
          
          <FilterOptions
            options={exportOptions}
            onChange={setExportOptions}
            questionStates={questionStates}
            examData={examData}
          />
          
          <ContentOptions
            options={exportOptions}
            onChange={setExportOptions}
          />
          
          <ExportPreview
            options={exportOptions}
            examData={examData}
            questionCount={calculateFilteredQuestions(exportOptions)}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onExport(exportOptions)}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Format Selector Component

```typescript
// components/export/FormatSelector.tsx
interface FormatSelectorProps {
  value: ExportFormat;
  onChange: (format: ExportFormat) => void;
}

function FormatSelector({ value, onChange }: FormatSelectorProps) {
  const formats: Array<{
    id: ExportFormat;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'json',
      label: 'JSON',
      description: 'Complete data with metadata',
      icon: FileCode,
    },
    {
      id: 'csv',
      label: 'CSV',
      description: 'Spreadsheet compatible',
      icon: FileSpreadsheet,
    },
    {
      id: 'txt',
      label: 'Text',
      description: 'Human readable format',
      icon: FileText,
    },
    {
      id: 'pdf',
      label: 'PDF',
      description: 'Print-ready document',
      icon: FileDown,
    },
  ];
  
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Export Format</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="grid grid-cols-2 gap-3">
          {formats.map((format) => (
            <div key={format.id}>
              <RadioGroupItem
                value={format.id}
                id={format.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={format.id}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <format.icon className="h-6 w-6 mb-2" />
                <div className="text-center">
                  <div className="font-medium">{format.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {format.description}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
```

## 🔍 Intelligent Filtering

### Filter Options

```typescript
// Smart filtering with state integration
function FilterOptions({ 
  options, 
  onChange, 
  questionStates, 
  examData 
}: FilterOptionsProps) {
  const filterCounts = useMemo(() => ({
    all: examData?.questions.length || 0,
    favorites: Object.values(questionStates)
      .filter(state => state.isFavorite).length,
    answered: Object.values(questionStates)
      .filter(state => state.status !== 'unanswered').length,
    correct: Object.values(questionStates)
      .filter(state => state.status === 'correct').length,
    incorrect: Object.values(questionStates)
      .filter(state => state.status === 'incorrect').length,
    notes: Object.values(questionStates)
      .filter(state => state.notes && state.notes.trim()).length,
  }), [questionStates, examData]);
  
  const filters: FilterOption[] = [
    {
      id: 'all',
      label: 'All Questions',
      count: filterCounts.all,
      description: 'Export complete question set',
    },
    {
      id: 'favorites',
      label: 'Favorites Only',
      count: filterCounts.favorites,
      description: 'Export starred questions',
      disabled: filterCounts.favorites === 0,
    },
    {
      id: 'answered',
      label: 'Answered Questions',
      count: filterCounts.answered,
      description: 'Questions with responses',
      disabled: filterCounts.answered === 0,
    },
    {
      id: 'correct',
      label: 'Correct Answers',
      count: filterCounts.correct,
      description: 'Questions answered correctly',
      disabled: filterCounts.correct === 0,
    },
    {
      id: 'notes',
      label: 'Questions with Notes',
      count: filterCounts.notes,
      description: 'Questions with annotations',
      disabled: filterCounts.notes === 0,
    },
  ];
  
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Content Filter</Label>
      <RadioGroup 
        value={options.filterBy || 'all'} 
        onValueChange={(value) => onChange({ ...options, filterBy: value as ExportFilter })}
      >
        <div className="space-y-2">
          {filters.map((filter) => (
            <div key={filter.id} className="flex items-center space-x-3">
              <RadioGroupItem
                value={filter.id}
                id={filter.id}
                disabled={filter.disabled}
              />
              <Label 
                htmlFor={filter.id}
                className={cn(
                  "flex-1 cursor-pointer",
                  filter.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{filter.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {filter.description}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {filter.count} available
                  </Badge>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
```

### Dynamic Content Preview

```typescript
// Real-time export preview
function ExportPreview({ 
  options, 
  examData, 
  questionCount 
}: ExportPreviewProps) {
  const estimatedSize = useMemo(() => {
    let baseSize = questionCount * 1.5; // KB per question
    
    if (options.includeComments) baseSize *= 2;
    if (options.includeImages) baseSize *= 1.8;
    if (options.includeUserData) baseSize *= 1.2;
    
    return Math.round(baseSize);
  }, [options, questionCount]);
  
  const filterDescription = useMemo(() => {
    switch (options.filterBy) {
      case 'favorites':
        return 'Favorites Only';
      case 'answered':
        return 'Answered Questions';
      case 'correct':
        return 'Correct Answers';
      case 'notes':
        return 'Questions with Notes';
      default:
        return 'All Questions';
    }
  }, [options.filterBy]);
  
  return (
    <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
      <h4 className="font-medium">Export Preview</h4>
      <div className="space-y-1 text-sm text-muted-foreground">
        <div>Format: {options.format.toUpperCase()}</div>
        <div>Questions: {questionCount} ({filterDescription})</div>
        <div>Estimated size: ~{estimatedSize}KB</div>
        <div className="flex flex-wrap gap-1 mt-2">
          {options.includeAnswers && <Badge variant="outline">Answers</Badge>}
          {options.includeComments && <Badge variant="outline">Comments</Badge>}
          {options.includeUserData && <Badge variant="outline">User Data</Badge>}
          {options.includeMetadata && <Badge variant="outline">Metadata</Badge>}
        </div>
      </div>
    </div>
  );
}
```

## 🛠️ Export Processing

### Core Export Function

```typescript
// utils/exportUtils.ts
export async function exportExamData(
  examData: ExamData,
  options: ExportOptions,
  questionStates: Record<number, QuestionState>,
  statistics?: Statistics
): Promise<void> {
  try {
    // Filter questions based on options
    const filteredQuestions = filterQuestions(
      examData.questions,
      options.filterBy,
      questionStates
    );
    
    if (filteredQuestions.length === 0) {
      throw new Error('No questions match the selected filter criteria');
    }
    
    // Generate export data
    const exportData = await generateExportData(
      filteredQuestions,
      options,
      questionStates,
      statistics
    );
    
    // Process based on format
    switch (options.format) {
      case 'json':
        await exportAsJSON(exportData, examData.examCode || 'exam');
        break;
      case 'csv':
        await exportAsCSV(exportData, examData.examCode || 'exam');
        break;
      case 'txt':
        await exportAsTXT(exportData, examData.examCode || 'exam');
        break;
      case 'pdf':
        await exportAsPDF(exportData, examData.examCode || 'exam');
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
    
    // Track export in statistics
    trackExportEvent(options.format, filteredQuestions.length);
    
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to export data. Please try again.'
    );
  }
}

// Question filtering logic
function filterQuestions(
  questions: Question[],
  filterBy: ExportFilter = 'all',
  questionStates: Record<number, QuestionState>
): Question[] {
  if (filterBy === 'all') {
    return questions;
  }
  
  return questions.filter((question, index) => {
    const state = questionStates[index];
    if (!state) return false;
    
    switch (filterBy) {
      case 'favorites':
        return state.isFavorite;
      case 'answered':
        return state.status !== 'unanswered';
      case 'correct':
        return state.status === 'correct';
      case 'incorrect':
        return state.status === 'incorrect';
      case 'notes':
        return state.notes && state.notes.trim().length > 0;
      default:
        return true;
    }
  });
}
```

### Format-Specific Processors

```typescript
// JSON export implementation
async function exportAsJSON(data: ExportData, examCode: string): Promise<void> {
  const jsonData = {
    metadata: {
      exportDate: new Date().toISOString(),
      examCode,
      version: '2.0.0',
      exportOptions: data.options,
      questionCount: data.questions.length,
    },
    questions: data.questions,
    userAnnotations: data.userAnnotations,
    statistics: data.statistics,
  };
  
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: 'application/json',
  });
  
  downloadFile(
    blob, 
    `${examCode}-complete-export-${getTimestamp()}.json`
  );
}

// CSV export implementation
async function exportAsCSV(data: ExportData, examCode: string): Promise<void> {
  const headers = [
    'Question Number',
    'Question Text',
    'Answer A',
    'Answer B', 
    'Answer C',
    'Answer D',
    'Correct Answer',
    'Most Voted',
    'User Answer',
    'Is Correct',
    'Difficulty',
    'Category',
    'Notes',
    'Is Favorite',
    'Comment Count',
  ];
  
  const csvRows = [
    headers.join(','),
    ...data.questions.map((question, index) => 
      formatQuestionAsCSVRow(question, index, data.userAnnotations)
    ),
  ];
  
  const blob = new Blob([csvRows.join('\n')], {
    type: 'text/csv',
  });
  
  downloadFile(
    blob,
    `${examCode}-data-export-${getTimestamp()}.csv`
  );
}

// File download utility
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Timestamp utility
function getTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);
}
```

## 📊 Export Analytics

### Usage Tracking

```typescript
// Track export usage in statistics store
function trackExportEvent(
  format: ExportFormat,
  questionCount: number
): void {
  const { updateExportStats } = useStatisticsStore.getState();
  
  updateExportStats({
    format,
    questionCount,
    timestamp: new Date(),
  });
}

// Export statistics interface
interface ExportStats {
  totalExports: number;
  formatBreakdown: Record<ExportFormat, number>;
  averageQuestionCount: number;
  lastExport: Date;
  popularFilters: Array<{
    filter: ExportFilter;
    count: number;
  }>;
}
```

## 🔧 Error Handling

### Comprehensive Error Management

```typescript
// Error types for export system
type ExportError = 
  | 'NO_QUESTIONS'
  | 'INVALID_FORMAT'
  | 'GENERATION_FAILED'
  | 'DOWNLOAD_FAILED'
  | 'USER_CANCELLED';

interface ExportErrorDetails {
  type: ExportError;
  message: string;
  context?: Record<string, any>;
}

// Error handling hook
function useExportError() {
  const [error, setError] = useState<ExportErrorDetails | null>(null);
  
  const handleError = useCallback((
    type: ExportError,
    message: string,
    context?: Record<string, any>
  ) => {
    setError({ type, message, context });
    
    // Log for debugging
    console.error('Export error:', { type, message, context });
    
    // Show user-friendly toast
    toast.error(message);
  }, []);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return { error, handleError, clearError };
}
```

## 🚀 Performance Optimizations

### Efficient Processing

```typescript
// Optimize for large datasets
function processLargeExport(
  questions: Question[],
  options: ExportOptions
): Promise<ExportData> {
  return new Promise((resolve) => {
    // Use requestIdleCallback for non-blocking processing
    const processChunk = (startIndex: number) => {
      const endIndex = Math.min(startIndex + 100, questions.length);
      const chunk = questions.slice(startIndex, endIndex);
      
      // Process chunk
      const processedChunk = chunk.map(question => 
        processQuestionForExport(question, options)
      );
      
      if (endIndex < questions.length) {
        // Schedule next chunk
        requestIdleCallback(() => processChunk(endIndex));
      } else {
        // Complete processing
        resolve(combineProcessedChunks(processedChunk));
      }
    };
    
    processChunk(0);
  });
}

// Memory-efficient streaming for large exports
async function streamLargeExport(
  data: ExportData,
  format: ExportFormat
): Promise<void> {
  const stream = new ReadableStream({
    start(controller) {
      // Stream data in chunks
      processDataInChunks(data, controller, format);
    }
  });
  
  // Download streamed data
  const response = new Response(stream);
  const blob = await response.blob();
  downloadFile(blob, generateFilename(data.examCode, format));
}
```

---

**The enhanced export system provides a modern, type-safe, and user-friendly way to export exam data with full Next.js integration and React component architecture.**