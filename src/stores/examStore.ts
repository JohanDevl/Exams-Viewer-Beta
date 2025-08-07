import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getDataPath } from '@/lib/assets';
import type { 
  ExamData, 
  ExamInfo, 
  QuestionState, 
  QuestionStatus, 
  UserAnswer,
  DifficultyLevel,
  SearchFilters,
  ExamMode,
  ExamPhase,
  ExamConfig,
  ExamState,
  ExamResult
} from '@/types';

interface ExamStore {
  // Current state
  currentExam: ExamData | null;
  currentExamInfo: ExamInfo | null;
  currentQuestionIndex: number;
  isLoading: boolean;
  error: string | null;
  sessionId: string | null; // Pour détecter les nouvelles sessions

  // Question states
  questionStates: Record<number, QuestionState>;
  // Persistent data by exam
  examData: Record<string, Record<number, Partial<QuestionState>>>;
  
  // Filters and search
  searchFilters: SearchFilters;
  filteredQuestionIndices: number[];

  // Exam mode state
  examState: ExamState;

  // Actions to load data
  loadExam: (examCode: string) => Promise<void>;
  setCurrentQuestion: (index: number) => void;
  
  // Actions for answers
  submitAnswer: (questionIndex: number, selectedAnswers: string[]) => void;
  markQuestionAsPreview: (questionIndex: number) => void;
  resetQuestion: (questionIndex: number) => void;
  
  // Favorite actions
  toggleFavorite: (questionIndex: number) => void;
  setQuestionDifficulty: (questionIndex: number, difficulty: DifficultyLevel) => void;
  setQuestionNotes: (questionIndex: number, notes: string) => void;
  setQuestionCategory: (questionIndex: number, category: string) => void;
  
  // Search and filter actions
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  updateFilteredQuestions: () => void;
  
  // Actions utilitaires
  resetExam: () => void;
  getQuestionStatus: (questionIndex: number) => QuestionStatus;
  getFirstAnswerStatus: (questionIndex: number) => QuestionStatus;
  getProgress: () => { answered: number; correct: number; total: number };
  
  // Navigation
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  goToRandomQuestion: () => void;

  // Exam mode actions
  setExamMode: (mode: ExamMode) => void;
  setExamPhase: (phase: ExamPhase) => void;
  setExamConfig: (config: ExamConfig) => void;
  startExam: (config: ExamConfig) => void;
  toggleQuestionForReview: (questionIndex: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  updateTimer: () => void;
  addTimerWarning: (minutes: number) => void;
  submitExam: () => ExamResult | null;
  finishExam: () => void;
  resetExamState: () => void;
}

export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentExam: null,
      currentExamInfo: null,
      currentQuestionIndex: 0,
      isLoading: false,
      error: null,
      sessionId: null,
      questionStates: {},
      examData: {},
      searchFilters: {
        query: '',
        status: 'all',
        difficulty: 'all',
        favorites: false,
        category: 'all'
      },
      filteredQuestionIndices: [],
      
      // Initial exam mode state
      examState: {
        mode: 'study',
        phase: 'configuration',
        config: null,
        timer: {
          isActive: false,
          startTime: null,
          duration: null,
          remainingTime: null,
          isPaused: false,
          warningsShown: new Set()
        },
        questionsMarkedForReview: new Set(),
        startTime: null,
        submissionTime: null,
        finalScore: null,
        isSubmitted: false
      },

      // Charger un examen  
      loadExam: async (examCode: string) => {
        set({ isLoading: true, error: null });
        
        // Reset exam state when loading a new exam
        get().resetExamState();
        
        try {
          // Charger les infos de l'examen depuis le manifest
          const manifestResponse = await fetch(getDataPath('manifest.json'));
          const manifest = await manifestResponse.json();
          const examInfo = manifest.exams.find((exam: ExamInfo) => exam.code === examCode);
          
          if (!examInfo) {
            throw new Error(`Exam ${examCode} not found`);
          }

          // Load exam data
          const examResponse = await fetch(getDataPath(`${examCode}/exam.json`));
          const examData: ExamData = await examResponse.json();

          // Reset question states for a new attempt
          const state = get();
          const isNewSession = !state.sessionId; // Session ID is null after refresh
          const newQuestionStates: Record<number, QuestionState> = {};
          
          examData.questions.forEach((_, index) => {
            // Récupère les données persistantes pour cet examen spécifique
            const examPersistentData = state.examData[examCode];
            const persistentState = examPersistentData?.[index];
            const currentState = state.questionStates[index];
            
            if (isNewSession) {
              // Nouvelle session (après refresh) : reset complet sauf favoris/difficulty/notes
              newQuestionStates[index] = {
                status: 'unanswered',
                isFavorite: persistentState?.isFavorite || false,
                difficulty: persistentState?.difficulty || null,
                notes: persistentState?.notes,
                category: persistentState?.category
                // firstAnswer et userAnswer sont volontairement omis pour une nouvelle session
              } as QuestionState;
            } else {
              // Même session : garde firstAnswer mais reset userAnswer
              newQuestionStates[index] = {
                status: 'unanswered',
                isFavorite: persistentState?.isFavorite || false,
                difficulty: persistentState?.difficulty || null,
                notes: persistentState?.notes,
                category: persistentState?.category,
                firstAnswer: currentState?.firstAnswer // Garde l'historique pour les stats
                // userAnswer est volontairement omis pour une nouvelle tentative
              } as QuestionState;
            }
          });

          // Generate new session ID for this exam attempt
          const newSessionId = `${examCode}-${Date.now()}`;

          set({
            currentExam: examData,
            currentExamInfo: examInfo,
            currentQuestionIndex: 0,
            sessionId: newSessionId,
            questionStates: newQuestionStates,
            isLoading: false,
            filteredQuestionIndices: Array.from({ length: examData.questions.length }, (_, i) => i)
          });

          // Start a new session in statistics store
          if (typeof window !== 'undefined') {
            const { useStatisticsStore } = await import('@/stores/statisticsStore');
            const { startSession, finalizePendingSessions, getCurrentSession } = useStatisticsStore.getState();
            
            // Finalize any pending sessions first
            finalizePendingSessions();
            
            // Check if there's already an active session for this exam
            const existingSession = getCurrentSession(examCode);
            
            let actualSessionId;
            if (existingSession) {
              // Use existing session
              actualSessionId = existingSession.id;
            } else {
              // Create new session
              actualSessionId = startSession(examCode, examInfo.name);
            }
            
            // Update the sessionId to match what was actually created/found
            set(state => ({ ...state, sessionId: actualSessionId }));
          }

          // Update filtered questions
          get().updateFilteredQuestions();
          
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error loading exam',
            isLoading: false 
          });
        }
      },

      // Set current question
      setCurrentQuestion: (index: number) => {
        const { currentExam } = get();
        if (currentExam && index >= 0 && index < currentExam.questions.length) {
          set({ currentQuestionIndex: index });
        }
      },

      // Submit an answer
      submitAnswer: (questionIndex: number, selectedAnswers: string[]) => {
        const { currentExam, questionStates } = get();
        if (!currentExam) return;

        const question = currentExam.questions[questionIndex];
        if (!question) return;

        // Determine if answer is correct
        let isCorrect = false;
        if (question.most_voted) {
          // Le champ most_voted peut contenir plusieurs lettres (ex: "AD", "ACE")
          const correctAnswers = question.most_voted.split('');
          isCorrect = selectedAnswers.length === correctAnswers.length &&
                     selectedAnswers.every(answer => correctAnswers.includes(answer)) &&
                     correctAnswers.every(answer => selectedAnswers.includes(answer));
        }

        const userAnswer: UserAnswer = {
          selectedAnswers,
          timestamp: new Date(),
          isCorrect
        };

        const currentState = questionStates[questionIndex];
        const newQuestionStates = {
          ...questionStates,
          [questionIndex]: {
            ...currentState,
            status: isCorrect ? 'correct' as QuestionStatus : 'incorrect' as QuestionStatus,
            userAnswer,
            // Garde seulement la toute première réponse (ne jamais écraser)
            firstAnswer: currentState?.firstAnswer ? currentState.firstAnswer : userAnswer
          }
        };

        set({ questionStates: newQuestionStates });

        // Update current session in real-time
        if (typeof window !== 'undefined') {
          import('@/stores/statisticsStore').then(({ useStatisticsStore }) => {
            const { updateCurrentSession, getCurrentSession } = useStatisticsStore.getState();
            const { sessionId, currentExamInfo } = get();
            
            if (currentExamInfo) {
              // Try to get the current session to make sure we have the right ID
              const currentSession = getCurrentSession(currentExamInfo.code);
              const actualSessionId = currentSession?.id || sessionId;
              
              if (actualSessionId) {
                const progress = get().getProgress();
                const difficultyBreakdown: Record<string, { answered: number; correct: number; total: number; }> = {};
                
                // Calculate difficulty breakdown
                Object.entries(get().questionStates).forEach(([, state]) => {
                  const difficulty = state.difficulty || 'unrated';
                  if (!difficultyBreakdown[difficulty]) {
                    difficultyBreakdown[difficulty] = { answered: 0, correct: 0, total: 0 };
                  }
                  difficultyBreakdown[difficulty].total++;
                  
                  if (state.firstAnswer) {
                    difficultyBreakdown[difficulty].answered++;
                    if (state.firstAnswer.isCorrect) {
                      difficultyBreakdown[difficulty].correct++;
                    }
                  }
                });
                
                // Get session start time to calculate total time spent
                const sessionStartTime = currentSession ? new Date(currentSession.startTime).getTime() : Date.now();
                
                const sessionUpdate = {
                  questionsAnswered: progress.answered,
                  correctAnswers: progress.correct,
                  timeSpent: Date.now() - sessionStartTime,
                  completionPercentage: progress.total > 0 ? (progress.answered / progress.total) * 100 : 0,
                  difficultyBreakdown
                };
                
                
                updateCurrentSession(actualSessionId, sessionUpdate);
              }
            }
          });
        }
      },

      // Mark a question as preview
      markQuestionAsPreview: (questionIndex: number) => {
        const { questionStates } = get();
        const currentState = questionStates[questionIndex];
        
        // Si c'est la première action sur cette question, enregistrer comme firstAnswer
        const isFirstAction = !currentState?.firstAnswer;
        const previewAnswer: UserAnswer = {
          selectedAnswers: [], // Aucune réponse sélectionnée pour une action preview
          timestamp: new Date(),
          isCorrect: undefined // Non défini pour une action preview
        };
        
        const newQuestionStates = {
          ...questionStates,
          [questionIndex]: {
            ...currentState,
            status: 'preview' as QuestionStatus,
            // Enregistrer comme firstAnswer seulement si c'est la première action
            firstAnswer: isFirstAction ? previewAnswer : currentState?.firstAnswer
          }
        };

        set({ questionStates: newQuestionStates });

        // Update current session for preview action
        if (typeof window !== 'undefined') {
          import('@/stores/statisticsStore').then(({ useStatisticsStore }) => {
            const { updateCurrentSession } = useStatisticsStore.getState();
            const { sessionId, currentExamInfo } = get();
            
            if (sessionId && currentExamInfo) {
              const progress = get().getProgress();
              const difficultyBreakdown: Record<string, { answered: number; correct: number; total: number; }> = {};
              
              // Calculate difficulty breakdown
              Object.entries(get().questionStates).forEach(([, state]) => {
                const difficulty = state.difficulty || 'unrated';
                if (!difficultyBreakdown[difficulty]) {
                  difficultyBreakdown[difficulty] = { answered: 0, correct: 0, total: 0 };
                }
                difficultyBreakdown[difficulty].total++;
                
                if (state.firstAnswer) {
                  difficultyBreakdown[difficulty].answered++;
                  if (state.firstAnswer.isCorrect) {
                    difficultyBreakdown[difficulty].correct++;
                  }
                }
              });
              
              // Get session start time to calculate total time spent
              const currentSession = useStatisticsStore.getState().getCurrentSession(currentExamInfo.code);
              const sessionStartTime = currentSession ? new Date(currentSession.startTime).getTime() : Date.now();
              
              updateCurrentSession(sessionId, {
                questionsAnswered: progress.answered,
                correctAnswers: progress.correct,
                timeSpent: Date.now() - sessionStartTime,
                completionPercentage: progress.total > 0 ? (progress.answered / progress.total) * 100 : 0,
                difficultyBreakdown
              });
            }
          });
        }
      },

      // Reset a question (keep first answer)
      resetQuestion: (questionIndex: number) => {
        const { questionStates } = get();
        const currentState = questionStates[questionIndex];
        
        if (!currentState?.userAnswer) return; // No answer to reset
        
        const newQuestionStates = {
          ...questionStates,
          [questionIndex]: {
            ...currentState,
            status: 'unanswered' as QuestionStatus,
            userAnswer: undefined // Clear current answer but keep firstAnswer
          }
        };

        set({ questionStates: newQuestionStates });
      },

      // Basculer le statut favori
      toggleFavorite: (questionIndex: number) => {
        const { questionStates, examData, currentExamInfo } = get();
        if (!currentExamInfo) return;
        
        const currentState = questionStates[questionIndex];
        const newIsFavorite = !currentState?.isFavorite;
        
        const newQuestionStates = {
          ...questionStates,
          [questionIndex]: {
            ...currentState,
            isFavorite: newIsFavorite
          }
        };

        // Save to persistent exam data
        const examCode = currentExamInfo.code;
        const newExamData = {
          ...examData,
          [examCode]: {
            ...examData[examCode],
            [questionIndex]: {
              ...examData[examCode]?.[questionIndex],
              isFavorite: newIsFavorite
            }
          }
        };

        set({ questionStates: newQuestionStates, examData: newExamData });
      },

      // Set question difficulty
      setQuestionDifficulty: (questionIndex: number, difficulty: DifficultyLevel) => {
        const { questionStates } = get();
        
        const newQuestionStates = {
          ...questionStates,
          [questionIndex]: {
            ...questionStates[questionIndex],
            difficulty
          }
        };

        set({ questionStates: newQuestionStates });
      },

      // Set question notes
      setQuestionNotes: (questionIndex: number, notes: string) => {
        const { questionStates } = get();
        
        const newQuestionStates = {
          ...questionStates,
          [questionIndex]: {
            ...questionStates[questionIndex],
            notes
          }
        };

        set({ questionStates: newQuestionStates });
      },

      // Set question category
      setQuestionCategory: (questionIndex: number, category: string) => {
        const { questionStates } = get();
        
        const newQuestionStates = {
          ...questionStates,
          [questionIndex]: {
            ...questionStates[questionIndex],
            category
          }
        };

        set({ questionStates: newQuestionStates });
      },

      // Set search filters
      setSearchFilters: (filters: Partial<SearchFilters>) => {
        const { searchFilters, currentQuestionIndex } = get();
        const newFilters = { ...searchFilters, ...filters };
        set({ searchFilters: newFilters });
        get().updateFilteredQuestions();
        
        // Auto-navigate to first filtered question if current question is not in filtered results
        const { filteredQuestionIndices: newFilteredIndices } = get();
        if (newFilteredIndices.length > 0 && !newFilteredIndices.includes(currentQuestionIndex)) {
          set({ currentQuestionIndex: newFilteredIndices[0] });
        }
      },

      // Update filtered questions
      updateFilteredQuestions: () => {
        const { currentExam, questionStates, searchFilters } = get();
        if (!currentExam) return;

        let filteredIndices = Array.from({ length: currentExam.questions.length }, (_, i) => i);

        // Filter by status
        if (searchFilters.status !== 'all') {
          filteredIndices = filteredIndices.filter(index => 
            get().getQuestionStatus(index) === searchFilters.status
          );
        }

        // Filter by difficulty
        if (searchFilters.difficulty !== 'all') {
          filteredIndices = filteredIndices.filter(index => 
            questionStates[index]?.difficulty === searchFilters.difficulty
          );
        }

        // Filter by favorites
        if (searchFilters.favorites) {
          filteredIndices = filteredIndices.filter(index => 
            questionStates[index]?.isFavorite
          );
        }

        // Filter by category
        if (searchFilters.category !== 'all') {
          filteredIndices = filteredIndices.filter(index => 
            questionStates[index]?.category === searchFilters.category
          );
        }

        // Filter by search text
        if (searchFilters.query.trim()) {
          const query = searchFilters.query.toLowerCase();
          filteredIndices = filteredIndices.filter(index => {
            const question = currentExam.questions[index];
            return question.question.toLowerCase().includes(query) ||
                   question.answers.some(answer => answer.toLowerCase().includes(query));
          });
        }

        set({ filteredQuestionIndices: filteredIndices });
      },

      // Reset exam
      resetExam: () => {
        // End current session before resetting
        const { currentExamInfo, sessionId, questionStates } = get();
        if (currentExamInfo && sessionId && typeof window !== 'undefined') {
          import('@/stores/statisticsStore').then(({ useStatisticsStore }) => {
            const { endSession, getCurrentSession } = useStatisticsStore.getState();
            const currentSession = getCurrentSession(currentExamInfo.code);
            
            if (currentSession && currentSession.id === sessionId) {
              const progress = get().getProgress();
              const difficultyBreakdown: Record<string, { answered: number; correct: number; total: number; }> = {};
              
              // Calculate difficulty breakdown
              Object.entries(questionStates).forEach(([, state]) => {
                const difficulty = state.difficulty || 'unrated';
                if (!difficultyBreakdown[difficulty]) {
                  difficultyBreakdown[difficulty] = { answered: 0, correct: 0, total: 0 };
                }
                difficultyBreakdown[difficulty].total++;
                
                if (state.firstAnswer) {
                  difficultyBreakdown[difficulty].answered++;
                  if (state.firstAnswer.isCorrect) {
                    difficultyBreakdown[difficulty].correct++;
                  }
                }
              });
              
              endSession(sessionId, {
                questionsAnswered: progress.answered,
                correctAnswers: progress.correct,
                timeSpent: Date.now() - new Date(currentSession.startTime).getTime(),
                completionPercentage: progress.total > 0 ? (progress.answered / progress.total) * 100 : 0,
                difficultyBreakdown
              });
            }
          });
        }
        
        // Reset exam state including exam mode
        get().resetExamState();
        
        set({
          currentExam: null,
          currentExamInfo: null,
          currentQuestionIndex: 0,
          sessionId: null,
          questionStates: {},
          searchFilters: {
            query: '',
            status: 'all',
            difficulty: 'all',
            favorites: false,
            category: 'all'
          },
          filteredQuestionIndices: [],
          error: null
        });
      },

      // Get question status
      getQuestionStatus: (questionIndex: number): QuestionStatus => {
        const { questionStates } = get();
        return questionStates[questionIndex]?.status || 'unanswered';
      },

      // Get first answer status (for sidebar display)
      getFirstAnswerStatus: (questionIndex: number): QuestionStatus => {
        const { questionStates } = get();
        const state = questionStates[questionIndex];
        
        // Si on a une première réponse, on l'utilise pour les stats
        if (state?.firstAnswer) {
          // Si isCorrect est undefined, c'est une action preview
          if (state.firstAnswer.isCorrect === undefined) {
            return 'preview';
          }
          return state.firstAnswer.isCorrect ? 'correct' : 'incorrect';
        }
        
        // Sinon, on regarde le statut actuel
        if (state?.status === 'preview') {
          return 'preview';
        }
        
        return 'unanswered';
      },

      // Get progress
      getProgress: () => {
        const { currentExam, questionStates, filteredQuestionIndices, examState } = get();
        if (!currentExam) return { answered: 0, correct: 0, total: 0 };

        // In exam mode, use filtered questions, otherwise use all questions
        const relevantIndices = examState.mode === 'exam' ? filteredQuestionIndices : Array.from({ length: currentExam.questions.length }, (_, i) => i);
        const total = relevantIndices.length;
        let answered = 0;
        let correct = 0;

        relevantIndices.forEach(questionIndex => {
          const state = questionStates[questionIndex];
          // In exam mode, use current userAnswer for progress tracking (allows reset)
          // In study mode, use firstAnswer for permanent statistics
          const answerToCheck = examState.mode === 'exam' ? state?.userAnswer : state?.firstAnswer;
          
          if (answerToCheck) {
            answered++;
            if (answerToCheck.isCorrect) {
              correct++;
            }
          }
        });

        return { answered, correct, total };
      },

      // Navigation
      goToNextQuestion: () => {
        const { currentQuestionIndex, filteredQuestionIndices } = get();
        const currentIndexInFiltered = filteredQuestionIndices.indexOf(currentQuestionIndex);
        
        if (currentIndexInFiltered >= 0 && currentIndexInFiltered < filteredQuestionIndices.length - 1) {
          const nextIndex = filteredQuestionIndices[currentIndexInFiltered + 1];
          set({ currentQuestionIndex: nextIndex });
        }
      },

      goToPreviousQuestion: () => {
        const { currentQuestionIndex, filteredQuestionIndices } = get();
        const currentIndexInFiltered = filteredQuestionIndices.indexOf(currentQuestionIndex);
        
        if (currentIndexInFiltered > 0) {
          const prevIndex = filteredQuestionIndices[currentIndexInFiltered - 1];
          set({ currentQuestionIndex: prevIndex });
        }
      },

      goToRandomQuestion: () => {
        const { filteredQuestionIndices } = get();
        if (filteredQuestionIndices.length > 0) {
          const randomIndex = Math.floor(Math.random() * filteredQuestionIndices.length);
          const questionIndex = filteredQuestionIndices[randomIndex];
          set({ currentQuestionIndex: questionIndex });
        }
      },

      // Exam mode actions
      setExamMode: (mode: ExamMode) => {
        set(state => ({ 
          examState: { 
            ...state.examState, 
            mode,
            phase: 'configuration'
          } 
        }));
      },

      setExamPhase: (phase: ExamPhase) => {
        set(state => ({ 
          examState: { 
            ...state.examState, 
            phase 
          } 
        }));
      },

      setExamConfig: (config: ExamConfig) => {
        set(state => ({ 
          examState: { 
            ...state.examState, 
            config 
          } 
        }));
      },

      startExam: (config: ExamConfig) => {
        const { currentExam } = get();
        if (!currentExam) return;

        let selectedQuestionIndices: number[];
        
        if (config.questionSelection === 'all') {
          selectedQuestionIndices = Array.from({ length: currentExam.questions.length }, (_, i) => i);
        } else if (config.questionSelection === 'random' || config.questionSelection === 'custom') {
          // Random selection for both 'random' and 'custom' (custom just means custom count)
          const allIndices = Array.from({ length: currentExam.questions.length }, (_, i) => i);
          const shuffled = allIndices.sort(() => Math.random() - 0.5);
          selectedQuestionIndices = shuffled.slice(0, config.questionCount);
        } else {
          // Fallback to random selection
          const allIndices = Array.from({ length: currentExam.questions.length }, (_, i) => i);
          const shuffled = allIndices.sort(() => Math.random() - 0.5);
          selectedQuestionIndices = shuffled.slice(0, config.questionCount);
        }

        const startTime = Date.now();
        const duration = config.timeLimit ? config.timeLimit * 60 * 1000 : null; // convert minutes to milliseconds

        set(state => ({
          examState: {
            ...state.examState,
            mode: 'exam',
            phase: 'active',
            config,
            startTime,
            timer: {
              isActive: Boolean(duration),
              startTime: duration ? startTime : null,
              duration,
              remainingTime: duration,
              isPaused: false,
              warningsShown: new Set()
            },
            questionsMarkedForReview: new Set(),
            isSubmitted: false
          },
          filteredQuestionIndices: selectedQuestionIndices,
          currentQuestionIndex: selectedQuestionIndices[0] || 0
        }));

        // Start timer if time limit is set
        if (duration) {
          get().startTimer();
        }
      },

      toggleQuestionForReview: (questionIndex: number) => {
        set(state => {
          const newMarkedQuestions = new Set(state.examState.questionsMarkedForReview);
          if (newMarkedQuestions.has(questionIndex)) {
            newMarkedQuestions.delete(questionIndex);
          } else {
            newMarkedQuestions.add(questionIndex);
          }
          
          return {
            examState: {
              ...state.examState,
              questionsMarkedForReview: newMarkedQuestions
            }
          };
        });
      },

      startTimer: () => {
        const { examState } = get();
        if (!examState.timer.duration) return;

        const startTime = Date.now();
        set(state => ({
          examState: {
            ...state.examState,
            timer: {
              ...state.examState.timer,
              isActive: true,
              startTime,
              isPaused: false
            }
          }
        }));
      },

      pauseTimer: () => {
        set(state => ({
          examState: {
            ...state.examState,
            timer: {
              ...state.examState.timer,
              isPaused: true
            }
          }
        }));
      },

      resumeTimer: () => {
        set(state => ({
          examState: {
            ...state.examState,
            timer: {
              ...state.examState.timer,
              isPaused: false
            }
          }
        }));
      },

      updateTimer: () => {
        const { examState } = get();
        if (!examState.timer.isActive || examState.timer.isPaused || !examState.timer.startTime || !examState.timer.duration) {
          return;
        }

        const now = Date.now();
        const elapsed = now - examState.timer.startTime;
        const remainingTime = Math.max(0, examState.timer.duration - elapsed);

        set(state => ({
          examState: {
            ...state.examState,
            timer: {
              ...state.examState.timer,
              remainingTime
            }
          }
        }));

        // Auto submit when time is up
        if (remainingTime <= 0) {
          get().submitExam();
        }
      },

      addTimerWarning: (minutes: number) => {
        set(state => {
          const newWarnings = new Set(state.examState.timer.warningsShown);
          newWarnings.add(minutes);
          
          return {
            examState: {
              ...state.examState,
              timer: {
                ...state.examState.timer,
                warningsShown: newWarnings
              }
            }
          };
        });
      },

      submitExam: (): ExamResult | null => {
        const { currentExam, currentExamInfo, questionStates, examState, filteredQuestionIndices } = get();
        if (!currentExam || !currentExamInfo || !examState.config) return null;

        const submissionTime = Date.now();
        const totalQuestions = filteredQuestionIndices.length;
        let answeredQuestions = 0;
        let correctAnswers = 0;

        // Calculate results
        const questionResults = filteredQuestionIndices.map(questionIndex => {
          const state = questionStates[questionIndex];
          const question = currentExam.questions[questionIndex];
          const wasAnswered = Boolean(state?.userAnswer);
          const wasCorrect = Boolean(state?.userAnswer?.isCorrect);
          
          if (wasAnswered) answeredQuestions++;
          if (wasCorrect) correctAnswers++;

          return {
            questionIndex,
            wasCorrect,
            timeSpent: 0, // TODO: implement per-question timing
            attempts: 1,
            finalAnswer: state?.userAnswer?.selectedAnswers || [],
            correctAnswer: question.most_voted ? question.most_voted.split('') : []
          };
        });

        const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        const passed = score >= 70; // ServiceNow typical passing score

        const result: ExamResult = {
          examCode: currentExamInfo.code,
          examName: currentExamInfo.name,
          mode: examState.mode,
          config: examState.config,
          startTime: new Date(examState.startTime || submissionTime),
          endTime: new Date(submissionTime),
          timeSpent: examState.startTime ? submissionTime - examState.startTime : 0,
          totalQuestions,
          answeredQuestions,
          correctAnswers,
          score,
          passed,
          domainBreakdown: {}, // TODO: implement domain analysis
          questionResults
        };

        // Update exam state
        set(state => ({
          examState: {
            ...state.examState,
            phase: 'completed',
            submissionTime,
            finalScore: score,
            isSubmitted: true,
            timer: {
              ...state.examState.timer,
              isActive: false
            }
          }
        }));

        return result;
      },

      finishExam: () => {
        set(state => ({
          examState: {
            ...state.examState,
            phase: 'completed'
          }
        }));
      },

      resetExamState: () => {
        set(() => ({
          examState: {
            mode: 'study',
            phase: 'configuration',
            config: null,
            timer: {
              isActive: false,
              startTime: null,
              duration: null,
              remainingTime: null,
              isPaused: false,
              warningsShown: new Set()
            },
            questionsMarkedForReview: new Set(),
            startTime: null,
            submissionTime: null,
            finalScore: null,
            isSubmitted: false
          }
        }));
      }
    }),
    {
      name: 'exam-store',
      partialize: (state) => {
        return {
          examData: state.examData, // Save persistent data by exam
          searchFilters: state.searchFilters
          // sessionId, questionStates, currentQuestionIndex are not saved
        };
      }
    }
  )
);