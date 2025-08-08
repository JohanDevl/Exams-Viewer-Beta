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
  images?: Record<string, { webp: string; jpeg: string }>;
  question_number?: string;
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
  isMarkedForReview?: boolean; // For exam mode review flagging
}

export interface ExamProgress {
  examCode: string;
  currentQuestionIndex: number;
  questionStates: Record<number, QuestionState>;
  startTime: Date;
  totalTimeSpent: number;
}

export type SidebarPosition = "hidden" | "collapsed" | "expanded";

export interface UserSettings {
  theme: "light" | "dark" | "system";
  showExplanations: boolean;
  autoProgress: boolean;
  keyboardShortcuts: boolean;
  soundEffects: boolean;
  showDifficulty: boolean;
  showComments: boolean;
  defaultView: "list" | "card";
  defaultSidebarPosition: SidebarPosition;
}

export interface ExamSession {
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
  sessions: ExamSession[];
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

// Types for exam mode

export type ExamMode = "study" | "exam";

export type ExamPhase = "configuration" | "active" | "review" | "completed";

export interface ExamConfig {
  timeLimit: number | null; // minutes, null for no limit
  questionCount: number; // number of questions to include
  questionSelection: "all" | "random" | "custom";
  customQuestionIndices?: number[]; // for custom selection
  randomSeed?: string; // for reproducible random selection
}

export interface TimerState {
  isActive: boolean;
  startTime: number | null; // timestamp
  duration: number | null; // duration in milliseconds
  remainingTime: number | null; // remaining time in milliseconds
  isPaused: boolean;
  warningsShown: Set<number>; // track shown warnings (15, 5, 1 minutes)
}

export interface ExamState {
  mode: ExamMode;
  phase: ExamPhase;
  config: ExamConfig | null;
  timer: TimerState;
  questionsMarkedForReview: Set<number>;
  startTime: number | null;
  submissionTime: number | null;
  finalScore: number | null;
  isSubmitted: boolean;
}

export interface ExamResult {
  examCode: string;
  examName: string;
  mode: ExamMode;
  config: ExamConfig;
  startTime: Date;
  endTime: Date;
  timeSpent: number; // milliseconds
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  score: number; // percentage
  passed: boolean;
  domainBreakdown: Record<string, {
    total: number;
    answered: number;
    correct: number;
    accuracy: number;
  }>;
  questionResults: Array<{
    questionIndex: number;
    wasCorrect: boolean;
    timeSpent: number;
    attempts: number;
    finalAnswer: string[];
    correctAnswer: string[];
  }>;
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

// Types for domain-based performance analytics

export type ServiceNowDomain = 
  | "ITSM" 
  | "Security" 
  | "HR" 
  | "Asset Management" 
  | "Service Management" 
  | "Portfolio Management" 
  | "Development" 
  | "Infrastructure";

export interface DomainInfo {
  id: ServiceNowDomain;
  name: string;
  description: string;
  examCodes: string[];
  color: string; // Tailwind color class for the domain
}

export interface DomainStatistics {
  domain: ServiceNowDomain;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  accuracy: number; // percentage 0-100
  averageTimePerQuestion: number; // milliseconds
  lastAccessed?: Date;
  improvementTrend: number; // positive/negative percentage change
  examBreakdown: Record<string, {
    answered: number;
    correct: number;
    total: number;
    accuracy: number;
  }>;
}

export interface HeatmapData {
  domains: DomainStatistics[];
  totalDomains: number;
  overallAccuracy: number;
  lastUpdated: Date;
  timeFrame: "7d" | "30d" | "all";
}

export interface HeatmapCellProps {
  domain: DomainStatistics;
  size: "small" | "medium" | "large";
  onClick?: (domain: ServiceNowDomain) => void;
  showTooltip?: boolean;
}