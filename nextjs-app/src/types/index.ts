// Types for the Exams Viewer application

export interface Comment {
  content: string;
  selected_answer: string;
  replies: Comment[];
}

export interface Question {
  question: string;
  answers: string[];
  comments: Comment[];
  correct_answers?: string[];
  explanation?: string;
  most_voted?: string;
  correct_answer?: string;
}

export interface ExamData {
  status: "complete" | "partial" | "error";
  error?: string;
  questions: Question[];
}

export interface ExamInfo {
  code: string;
  name: string;
  description: string;
  questionCount: number;
  lastUpdated: string;
}

export interface Manifest {
  version: string;
  generated: string;
  totalExams: number;
  totalQuestions: number;
  exams: ExamInfo[];
}

export interface Links {
  [key: string]: string;
}

// Types for application state

export type QuestionStatus = "unanswered" | "answered" | "correct" | "incorrect" | "preview";

export type DifficultyLevel = "easy" | "medium" | "hard" | null;

export interface UserAnswer {
  selectedAnswers: string[];
  timestamp: Date;
  isCorrect?: boolean;
}

export interface QuestionState {
  status: QuestionStatus;
  userAnswer?: UserAnswer;
  firstAnswer?: UserAnswer; // Keep first action for statistics
  isFavorite: boolean;
  difficulty?: DifficultyLevel;
  notes?: string;
  category?: string;
}

export interface ExamProgress {
  examCode: string;
  currentQuestionIndex: number;
  questionStates: Record<number, QuestionState>;
  startTime: Date;
  totalTimeSpent: number;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  showExplanations: boolean;
  autoProgress: boolean;
  keyboardShortcuts: boolean;
  soundEffects: boolean;
  showDifficulty: boolean;
  defaultView: "list" | "card";
}

export interface Statistics {
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
}

export interface SearchFilters {
  query: string;
  status: QuestionStatus | "all";
  difficulty: DifficultyLevel | "all";
  favorites: boolean;
  category: string | "all";
}

// Types pour les composants UI

export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  action: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

// Types for data export

export type ExportFormat = "json" | "csv" | "txt" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  includeAnswers: boolean;
  includeExplanations: boolean;
  includeStatistics: boolean;
  filterByStatus?: QuestionStatus;
  filterByDifficulty?: DifficultyLevel;
}

// Types pour les raccourcis clavier

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  description: string;
  action: () => void;
}

// Types pour les animations et transitions

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

// Types pour les erreurs

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
}

// Types for analytics events

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: Date;
}

// Utility types

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;