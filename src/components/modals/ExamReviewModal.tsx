'use client';

import { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Flag, FileText, Timer, ArrowRight, AlertTriangle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExamStore } from '@/stores/examStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { ClientOnly } from '@/components/ui/ClientOnly';
import { cn } from '@/lib/utils';

interface ExamReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToQuestion: (questionIndex: number) => void;
  onSubmitExam: () => void;
}

export function ExamReviewModal({ 
  isOpen, 
  onClose, 
  onNavigateToQuestion, 
  onSubmitExam 
}: ExamReviewModalProps) {
  const { 
    currentExam, 
    currentExamInfo, 
    questionStates, 
    examState, 
    filteredQuestionIndices 
  } = useExamStore();
  const { addToast } = useSettingsStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentExam || !currentExamInfo || examState.mode !== 'exam') return null;

  // Calculate statistics
  const totalQuestions = filteredQuestionIndices.length;
  const answeredQuestions = filteredQuestionIndices.filter(i => 
    questionStates[i]?.userAnswer
  ).length;
  const unansweredQuestions = totalQuestions - answeredQuestions;
  const markedForReview = filteredQuestionIndices.filter(i => 
    examState.questionsMarkedForReview.has(i)
  ).length;

  // Timer information
  const hasTimeLimit = examState.timer.duration !== null;
  const timeRemaining = examState.timer.remainingTime;
  const timeRemainingMinutes = timeRemaining ? Math.ceil(timeRemaining / (1000 * 60)) : null;

  // Format time display
  const formatTime = (milliseconds: number): string => {
    if (milliseconds <= 0) return '00:00';
    
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleNavigateToQuestion = (questionIndex: number) => {
    onNavigateToQuestion(questionIndex);
    onClose();
  };

  const handleSubmitExam = async () => {
    if (unansweredQuestions > 0) {
      // Show confirmation for unanswered questions
      const confirmSubmit = window.confirm(
        `You have ${unansweredQuestions} unanswered question${unansweredQuestions > 1 ? 's' : ''}. Are you sure you want to submit your exam?`
      );
      
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    
    try {
      onSubmitExam();
      addToast({
        type: 'success',
        title: 'Exam submitted!',
        description: 'Your exam has been submitted successfully.',
        duration: 3000
      });
      onClose();
    } catch {
      addToast({
        type: 'error',
        title: 'Submission failed',
        description: 'There was an error submitting your exam. Please try again.',
        duration: 5000
      });
      setIsSubmitting(false);
    }
  };

  const getQuestionStatus = (questionIndex: number) => {
    const hasAnswer = Boolean(questionStates[questionIndex]?.userAnswer);
    const isMarkedForReview = examState.questionsMarkedForReview.has(questionIndex);
    
    if (isMarkedForReview && hasAnswer) return 'answered-flagged';
    if (isMarkedForReview) return 'flagged';
    if (hasAnswer) return 'answered';
    return 'unanswered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'flagged':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
      case 'answered-flagged':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered':
        return <CheckCircle className="h-3 w-3" />;
      case 'flagged':
        return <Flag className="h-3 w-3" />;
      case 'answered-flagged':
        return (
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <Flag className="h-3 w-3" />
          </div>
        );
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  return (
    <ClientOnly>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Review Your Exam
            </DialogTitle>
            <DialogDescription>
              Review your answers before final submission for {currentExamInfo.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6 overflow-hidden">
            {/* Summary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{answeredQuestions}</div>
                  <div className="text-sm text-muted-foreground">Answered</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{unansweredQuestions}</div>
                  <div className="text-sm text-muted-foreground">Unanswered</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{markedForReview}</div>
                  <div className="text-sm text-muted-foreground">Flagged</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{totalQuestions}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </CardContent>
              </Card>
            </div>

            {/* Timer Information */}
            {hasTimeLimit && timeRemaining !== null && (
              <Card className={cn(
                'border-2',
                timeRemainingMinutes && timeRemainingMinutes <= 5
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : timeRemainingMinutes && timeRemainingMinutes <= 15
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className={cn(
                        'h-5 w-5',
                        timeRemainingMinutes && timeRemainingMinutes <= 5
                          ? 'text-red-600'
                          : timeRemainingMinutes && timeRemainingMinutes <= 15
                          ? 'text-orange-600'
                          : 'text-blue-600'
                      )} />
                      <span className="font-medium">Time Remaining:</span>
                      <span className={cn(
                        'font-mono text-lg font-bold',
                        timeRemainingMinutes && timeRemainingMinutes <= 5
                          ? 'text-red-600'
                          : timeRemainingMinutes && timeRemainingMinutes <= 15
                          ? 'text-orange-600'
                          : 'text-blue-600'
                      )}>
                        {formatTime(timeRemaining)}
                      </span>
                    </div>
                    
                    {timeRemainingMinutes && timeRemainingMinutes <= 5 && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Critical Time!</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Questions Grid */}
            <Card className="flex-1 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Question Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64 p-4">
                  <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 xl:grid-cols-20 gap-2">
                    {filteredQuestionIndices.map((questionIndex) => {
                      const status = getQuestionStatus(questionIndex);
                      
                      return (
                        <Button
                          key={questionIndex}
                          variant="outline"
                          size="sm"
                          onClick={() => handleNavigateToQuestion(questionIndex)}
                          className={cn(
                            'h-12 w-12 p-0 border-2 flex flex-col items-center justify-center gap-1 transition-all hover:scale-105',
                            getStatusColor(status)
                          )}
                          title={`Question ${questionIndex + 1} - ${
                            status === 'answered' ? 'Answered' :
                            status === 'flagged' ? 'Flagged for Review' :
                            status === 'answered-flagged' ? 'Answered & Flagged' :
                            'Unanswered'
                          }`}
                        >
                          <span className="text-xs font-medium">{questionIndex + 1}</span>
                          <div className="flex items-center justify-center">
                            {getStatusIcon(status)}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Answered</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Flag className="h-3 w-3 text-orange-600" />
                      <span>Flagged for Review</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-blue-600" />
                      <Flag className="h-3 w-3 text-blue-600" />
                      <span>Answered & Flagged</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-gray-600" />
                      <span>Unanswered</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warnings */}
            {unansweredQuestions > 0 && (
              <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">
                      Warning: You have {unansweredQuestions} unanswered question{unansweredQuestions > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Unanswered questions will be marked as incorrect. Consider reviewing them before submitting.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Continue Exam
              </Button>
              
              {markedForReview > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Navigate to first flagged question
                    const firstFlagged = filteredQuestionIndices.find(i => 
                      examState.questionsMarkedForReview.has(i)
                    );
                    if (firstFlagged !== undefined) {
                      handleNavigateToQuestion(firstFlagged);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Flag className="h-4 w-4" />
                  Review Flagged
                </Button>
              )}
            </div>
            
            <Button 
              onClick={handleSubmitExam}
              disabled={isSubmitting}
              className="flex items-center gap-2"
              variant={unansweredQuestions > 0 ? "destructive" : "default"}
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  Submit Exam
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ClientOnly>
  );
}