'use client';

import { ArrowLeft, FileText, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useExamStore } from '@/stores/examStore';
import { useStatisticsStore } from '@/stores/statisticsStore';
import { Badge } from '@/components/ui/badge';

export function ExamHeader() {
  const { 
    currentExamInfo, 
    currentQuestionIndex, 
    filteredQuestionIndices,
    getProgress,
    resetExam 
  } = useExamStore();
  
  const { getExamStatistics } = useStatisticsStore();

  if (!currentExamInfo) return null;

  const progress = getProgress();
  const stats = getExamStatistics(currentExamInfo.code);
  const currentIndexInFiltered = filteredQuestionIndices.indexOf(currentQuestionIndex);
  const totalFiltered = filteredQuestionIndices.length;

  const handleBackToSelector = () => {
    resetExam();
  };

  return (
    <div className="border-b bg-muted/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Back button and exam info */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToSelector}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-medium">
                {currentExamInfo.code}
              </Badge>
              <div className="hidden md:block">
                <h2 className="font-semibold text-foreground">
                  {currentExamInfo.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentExamInfo.description}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics and progress */}
          <div className="flex items-center gap-4 text-sm">
            {/* Current position */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>
                {currentIndexInFiltered + 1} / {totalFiltered}
                {totalFiltered !== currentExamInfo.questionCount && (
                  <span className="text-xs ml-1">
                    (of {currentExamInfo.questionCount})
                  </span>
                )}
              </span>
            </div>

            {/* Success rate */}
            {stats.answered > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>{Math.round(stats.accuracy)}%</span>
              </div>
            )}

            {/* Answers */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-green-600 dark:text-green-400">
                {progress.correct}
              </span>
              <span>/</span>
              <span>{progress.answered}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Overall progress</span>
            <span>
              {progress.total > 0 ? Math.round((progress.answered / progress.total) * 100) : 0}% 
              ({progress.answered}/{progress.total})
            </span>
          </div>
          <Progress 
            value={progress.total > 0 ? (progress.answered / progress.total) * 100 : 0} 
            className="h-2"
          />
        </div>
      </div>
    </div>
  );
}