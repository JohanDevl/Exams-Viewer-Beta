'use client';

import { useExamStore } from '@/stores/examStore';
import { QuestionDisplay } from '@/components/question/QuestionDisplay';
import { NavigationControls } from '@/components/navigation/NavigationControls';
import { ExamHeader } from '@/components/exam/ExamHeader';

export function ExamViewer() {
  const { currentExam, currentQuestionIndex } = useExamStore();

  if (!currentExam || !currentExam.questions) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">No question to display</p>
        </div>
      </div>
    );
  }

  const currentQuestion = currentExam.questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Question not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Exam header */}
      <ExamHeader />

      {/* Navigation controls */}
      <NavigationControls />

      {/* Current question */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 pb-20 md:pb-6">
          <QuestionDisplay 
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
          />
        </div>
      </div>
    </div>
  );
}