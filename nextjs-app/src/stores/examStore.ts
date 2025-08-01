import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  ExamData, 
  ExamInfo, 
  Question, 
  QuestionState, 
  QuestionStatus, 
  UserAnswer,
  DifficultyLevel,
  SearchFilters
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

      // Charger un examen
      loadExam: async (examCode: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Charger les infos de l'examen depuis le manifest
          const manifestResponse = await fetch('/data/manifest.json');
          const manifest = await manifestResponse.json();
          const examInfo = manifest.exams.find((exam: ExamInfo) => exam.code === examCode);
          
          if (!examInfo) {
            throw new Error(`Exam ${examCode} not found`);
          }

          // Load exam data
          const examResponse = await fetch(`/data/${examCode}/exam.json`);
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
        const { searchFilters } = get();
        const newFilters = { ...searchFilters, ...filters };
        set({ searchFilters: newFilters });
        get().updateFilteredQuestions();
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
        set({
          currentExam: null,
          currentExamInfo: null,
          currentQuestionIndex: 0,
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
        const { currentExam, questionStates } = get();
        if (!currentExam) return { answered: 0, correct: 0, total: 0 };

        const total = currentExam.questions.length;
        let answered = 0;
        let correct = 0;

        Object.values(questionStates).forEach(state => {
          // Utilise firstAnswer pour les statistiques permanentes
          if (state.firstAnswer) {
            answered++;
            if (state.firstAnswer.isCorrect) {
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