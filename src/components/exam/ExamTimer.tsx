'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, AlertTriangle, Timer, CheckCircle, Check, X, Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useExamStore } from '@/stores/examStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { cn } from '@/lib/utils';

interface ExamTimerProps {
  className?: string;
  compact?: boolean; // For different display modes
}

export function ExamTimer({ className, compact = false }: ExamTimerProps) {
  const { 
    examState, 
    updateTimer, 
    addTimerWarning, 
    submitExam, 
    filteredQuestionIndices,
    getFirstAnswerStatus 
  } = useExamStore();
  const { addToast } = useSettingsStore();
  const { playSound } = useSoundEffects();
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [displayTime, setDisplayTime] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastWarningRef = useRef<Set<number>>(new Set());

  // Only show timer if exam mode is active and timer is configured
  const shouldShowTimer = examState.mode === 'exam' && 
                         examState.phase === 'active' && 
                         examState.timer.isActive &&
                         examState.timer.duration !== null;
  
  // Show finish button even without timer in active exam mode
  const shouldShowFinishOnly = examState.mode === 'exam' && 
                              examState.phase === 'active' && 
                              (!examState.timer.isActive || examState.timer.duration === null);

  // Show exam results when exam is completed
  const shouldShowResults = examState.mode === 'exam' && examState.phase === 'completed';

  // Calculate exam statistics
  const calculateExamStats = () => {
    const stats = {
      correct: 0,
      incorrect: 0,
      unanswered: 0,
      total: filteredQuestionIndices.length
    };

    filteredQuestionIndices.forEach(questionIndex => {
      const status = getFirstAnswerStatus(questionIndex);
      if (status === 'correct') {
        stats.correct++;
      } else if (status === 'incorrect') {
        stats.incorrect++;
      } else {
        stats.unanswered++;
      }
    });

    return stats;
  };

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

  // Get time color based on remaining time
  const getTimeColor = (remainingTime: number | null): string => {
    if (!remainingTime) return 'text-foreground';
    
    const minutes = remainingTime / (1000 * 60);
    if (minutes <= 1) return 'text-red-600 dark:text-red-400';
    if (minutes <= 5) return 'text-orange-600 dark:text-orange-400';
    if (minutes <= 15) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  // Get background color for warnings
  const getBackgroundColor = (remainingTime: number | null): string => {
    if (!remainingTime) return '';
    
    const minutes = remainingTime / (1000 * 60);
    if (minutes <= 1) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (minutes <= 5) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    if (minutes <= 15) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return '';
  };

  // Check for warnings and show alerts
  const checkWarnings = useCallback((remainingTime: number) => {
    const minutes = remainingTime / (1000 * 60);
    const currentWarnings = new Set(examState.timer.warningsShown);
    
    // 15 minute warning
    if (minutes <= 15 && !currentWarnings.has(15)) {
      addTimerWarning(15);
      playSound('warning');
      addToast({
        type: 'warning',
        title: '15 minutes remaining',
        description: 'You have 15 minutes left to complete the exam.',
        duration: 5000
      });
    }
    
    // 5 minute warning
    if (minutes <= 5 && !currentWarnings.has(5)) {
      addTimerWarning(5);
      playSound('warning');
      addToast({
        type: 'warning',
        title: '5 minutes remaining!',
        description: 'Please review and submit your answers soon.',
        duration: 8000
      });
    }
    
    // 1 minute warning
    if (minutes <= 1 && !currentWarnings.has(1)) {
      addTimerWarning(1);
      playSound('error');
      addToast({
        type: 'error',
        title: '1 minute remaining!',
        description: 'The exam will auto-submit when time expires.',
        duration: 10000
      });
    }

    // 30 second warning
    if (minutes <= 0.5 && !currentWarnings.has(0.5)) {
      addTimerWarning(0.5);
      playSound('error');
      addToast({
        type: 'error',
        title: '30 seconds remaining!',
        description: 'Exam will auto-submit very soon!',
        duration: 5000
      });
    }
  }, [examState.timer.warningsShown, addTimerWarning, playSound, addToast]);

  // Auto-submit when time is up
  const handleTimeUp = useCallback(() => {
    playSound('error');
    const result = submitExam();
    
    addToast({
      type: 'info',
      title: 'Time\'s up!',
      description: `Exam has been automatically submitted. Score: ${result?.score.toFixed(1)}%`,
      duration: 10000
    });
  }, [playSound, submitExam, addToast]);

  // Manual exam finish
  const handleFinishExam = useCallback(() => {
    if (!showConfirm) {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 5000); // Auto-hide after 5 seconds
      return;
    }
    
    playSound('success');
    const result = submitExam();
    
    addToast({
      type: 'success',
      title: 'Exam finished!',
      description: `Exam has been manually submitted. Score: ${result?.score.toFixed(1)}%`,
      duration: 10000
    });
    
    setShowConfirm(false);
  }, [showConfirm, playSound, submitExam, addToast]);

  // Update timer effect
  useEffect(() => {
    if (!shouldShowTimer) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start interval to update timer
    intervalRef.current = setInterval(() => {
      updateTimer();
      const { remainingTime } = examState.timer;
      
      if (remainingTime !== null) {
        setDisplayTime(formatTime(remainingTime));
        checkWarnings(remainingTime);
        
        // Auto-submit when time is up
        if (remainingTime <= 0) {
          handleTimeUp();
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shouldShowTimer, examState.timer, updateTimer, submitExam, checkWarnings, handleTimeUp]);

  // Initial time display
  useEffect(() => {
    if (examState.timer.remainingTime !== null) {
      setDisplayTime(formatTime(examState.timer.remainingTime));
    }
  }, [examState.timer.remainingTime]);

  // Reset warning state when timer resets
  useEffect(() => {
    if (examState.timer.warningsShown.size === 0) {
      lastWarningRef.current = new Set();
    }
  }, [examState.timer.warningsShown]);

  // Show exam results when completed
  if (shouldShowResults) {
    const stats = calculateExamStats();
    const percentage = stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : '0.0';
    
    return (
      <Card className={cn('transition-all duration-300', className)}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-xs text-muted-foreground">Exam Completed</div>
                <div className="text-sm font-medium text-foreground">
                  Score: {percentage}% ({stats.correct}/{stats.total})
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              {/* Correct answers */}
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">{stats.correct}</span>
              </div>
              
              {/* Incorrect answers */}
              <div className="flex items-center gap-1">
                <X className="h-4 w-4 text-red-600" />
                <span className="text-red-600 font-medium">{stats.incorrect}</span>
              </div>
              
              {/* Unanswered */}
              <div className="flex items-center gap-1">
                <Circle className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 font-medium">{stats.unanswered}</span>
              </div>
            </div>
          </div>

          {/* Progress bar showing results */}
          <div className="mt-3">
            <div className="h-2 bg-muted rounded-full overflow-hidden flex">
              {/* Correct portion */}
              {stats.correct > 0 && (
                <div 
                  className="bg-green-500"
                  style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                />
              )}
              {/* Incorrect portion */}
              {stats.incorrect > 0 && (
                <div 
                  className="bg-red-500"
                  style={{ width: `${(stats.incorrect / stats.total) * 100}%` }}
                />
              )}
              {/* Unanswered portion */}
              {stats.unanswered > 0 && (
                <div 
                  className="bg-gray-400"
                  style={{ width: `${(stats.unanswered / stats.total) * 100}%` }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Results Breakdown</span>
              <span>{stats.total} questions total</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show finish button only when no timer but in exam mode
  if (shouldShowFinishOnly) {
    return (
      <Card className={cn('transition-all duration-300', className)}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xs text-muted-foreground">No Time Limit</div>
                <div className="text-sm font-medium text-foreground">
                  Finish when ready
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Finish Exam Button */}
              {showConfirm ? (
                <Button
                  onClick={handleFinishExam}
                  size="sm"
                  variant="destructive"
                  className="animate-pulse"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirm Finish
                </Button>
              ) : (
                <Button
                  onClick={handleFinishExam}
                  size="sm"
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Finish Exam
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!shouldShowTimer) {
    return null;
  }

  const remainingTime = examState.timer.remainingTime;
  const minutes = remainingTime ? remainingTime / (1000 * 60) : 0;

  // Compact display for mobile/small spaces
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Clock className={cn('h-4 w-4', getTimeColor(remainingTime))} />
        <span className={cn('font-mono font-semibold text-sm', getTimeColor(remainingTime))}>
          {displayTime}
        </span>
        {minutes <= 5 && minutes > 0 && (
          <Badge variant="destructive" className="text-xs animate-pulse">
            URGENT
          </Badge>
        )}
        
        {/* Finish button for compact mode */}
        {showConfirm ? (
          <Button
            onClick={handleFinishExam}
            size="sm"
            variant="destructive"
            className="animate-pulse text-xs px-2 py-1 h-6"
          >
            Confirm
          </Button>
        ) : (
          <Button
            onClick={handleFinishExam}
            size="sm"
            variant="outline"
            className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs px-2 py-1 h-6"
          >
            Finish
          </Button>
        )}
      </div>
    );
  }

  // Full timer display
  return (
    <Card className={cn(
      'transition-all duration-300',
      getBackgroundColor(remainingTime),
      className
    )}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className={cn('h-5 w-5', getTimeColor(remainingTime))} />
            <div>
              <div className="text-xs text-muted-foreground">Time Remaining</div>
              <div className={cn('font-mono text-lg font-bold', getTimeColor(remainingTime))}>
                {displayTime}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Finish Exam Button */}
            <div className="flex items-center gap-2">
              {showConfirm ? (
                <Button
                  onClick={handleFinishExam}
                  size="sm"
                  variant="destructive"
                  className="animate-pulse"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirm Finish
                </Button>
              ) : (
                <Button
                  onClick={handleFinishExam}
                  size="sm"
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Finish Exam
                </Button>
              )}
            </div>

            {/* Time warnings */}
            {minutes <= 15 && minutes > 5 && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                15 min warning
              </Badge>
            )}
            {minutes <= 5 && minutes > 1 && (
              <Badge variant="destructive" className="animate-pulse">
                5 min warning
              </Badge>
            )}
            {minutes <= 1 && minutes > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
                <Badge variant="destructive" className="animate-bounce">
                  FINAL MINUTE
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {examState.timer.duration && (
          <div className="mt-3">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full transition-all duration-1000',
                  minutes > 15 ? 'bg-green-500' :
                  minutes > 5 ? 'bg-yellow-500' :
                  minutes > 1 ? 'bg-orange-500' : 'bg-red-500'
                )}
                style={{ 
                  width: remainingTime && examState.timer.duration ? 
                    `${Math.max(0, (remainingTime / examState.timer.duration) * 100)}%` : '0%' 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Started</span>
              <span>Time Up</span>
            </div>
          </div>
        )}

        {/* Auto-submit warning */}
        {minutes <= 2 && minutes > 0 && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
              <AlertTriangle className="h-4 w-4" />
              <span>Exam will auto-submit when timer reaches 00:00</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}