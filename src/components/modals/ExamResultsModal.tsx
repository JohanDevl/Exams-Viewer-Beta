'use client';

import { useState } from 'react';
import { Trophy, Clock, Target, CheckCircle, XCircle, BarChart3, FileText, RotateCcw, BookOpen, Share } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExamStore } from '@/stores/examStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { ClientOnly } from '@/components/ui/ClientOnly';
import { cn } from '@/lib/utils';
import type { ExamResult } from '@/types';

interface ExamResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examResult: ExamResult;
  onRetakeExam: () => void;
  onReviewAnswers: () => void;
}

export function ExamResultsModal({ 
  isOpen, 
  onClose, 
  examResult, 
  onRetakeExam,
  onReviewAnswers 
}: ExamResultsModalProps) {
  const { resetExamState } = useExamStore();
  const { addToast } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'analysis'>('overview');

  // Calculate additional statistics
  const accuracy = examResult.score;
  const passed = examResult.passed;
  const passingScore = 70; // ServiceNow typical passing score
  
  // Time formatting
  const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  // Average time per question
  const avgTimePerQuestion = examResult.totalQuestions > 0 
    ? examResult.timeSpent / examResult.totalQuestions 
    : 0;

  const handleRetakeExam = () => {
    resetExamState();
    onRetakeExam();
    onClose();
  };

  const handleReviewAnswers = () => {
    onReviewAnswers();
    onClose();
  };

  const handleShareResults = async () => {
    const shareText = `🎓 ServiceNow Exam Results\n\n` +
      `📋 ${examResult.examName}\n` +
      `📊 Score: ${examResult.score.toFixed(1)}%\n` +
      `✅ ${examResult.correctAnswers}/${examResult.totalQuestions} correct\n` +
      `⏱️ Time: ${formatDuration(examResult.timeSpent)}\n` +
      `${passed ? '🏆 PASSED!' : '📚 Keep studying!'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ServiceNow Exam Results',
          text: shareText,
        });
      } catch {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        addToast({
          type: 'success',
          title: 'Results copied!',
          description: 'Exam results have been copied to clipboard.',
          duration: 3000
        });
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        addToast({
          type: 'success',
          title: 'Results copied!',
          description: 'Exam results have been copied to clipboard.',
          duration: 3000
        });
      } catch {
        addToast({
          type: 'error',
          title: 'Share failed',
          description: 'Unable to share results.',
          duration: 3000
        });
      }
    }
  };

  return (
    <ClientOnly>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className={cn(
                'h-5 w-5',
                passed ? 'text-green-600' : 'text-orange-600'
              )} />
              Exam Results
            </DialogTitle>
            <DialogDescription>
              Your performance on {examResult.examName}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Overall Results Card */}
            <Card className={cn(
              'border-2',
              passed 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
            )}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn(
                        'text-4xl font-bold',
                        passed ? 'text-green-600' : 'text-orange-600'
                      )}>
                        {accuracy.toFixed(1)}%
                      </div>
                      <Badge 
                        variant={passed ? "default" : "secondary"}
                        className={cn(
                          'text-base px-3 py-1',
                          passed 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                        )}
                      >
                        {passed ? 'PASSED' : 'NOT PASSED'}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">
                      {examResult.correctAnswers} out of {examResult.totalQuestions} questions correct
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Passing score: {passingScore}%
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatDuration(examResult.timeSpent)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total time spent
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ~{formatDuration(avgTimePerQuestion)} per question
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Progress to Passing Score</span>
                    <span>{Math.min(100, (accuracy / passingScore) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(100, (accuracy / passingScore) * 100)} 
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-1 border-b">
              <Button
                variant={activeTab === 'overview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('overview')}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Overview
              </Button>
              <Button
                variant={activeTab === 'questions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('questions')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Questions ({examResult.totalQuestions})
              </Button>
              <Button
                variant={activeTab === 'analysis' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('analysis')}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Analysis
              </Button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'overview' && (
                <div className="grid gap-4">
                  {/* Statistics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">
                          {examResult.correctAnswers}
                        </div>
                        <div className="text-sm text-muted-foreground">Correct</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-red-600">
                          {examResult.totalQuestions - examResult.correctAnswers}
                        </div>
                        <div className="text-sm text-muted-foreground">Incorrect</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">
                          {formatDuration(avgTimePerQuestion)}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg per Q</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-600">
                          {examResult.answeredQuestions}
                        </div>
                        <div className="text-sm text-muted-foreground">Answered</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Domain Breakdown (if available) */}
                  {Object.keys(examResult.domainBreakdown).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Domain Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(examResult.domainBreakdown).map(([domain, stats]) => (
                            <div key={domain}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{domain}</span>
                                <span className="text-sm text-muted-foreground">
                                  {stats.correct}/{stats.total} ({stats.accuracy.toFixed(1)}%)
                                </span>
                              </div>
                              <Progress value={stats.accuracy} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        {passed ? (
                          <div className="flex items-start gap-2 text-green-700 dark:text-green-300">
                            <Trophy className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>
                              <strong>Congratulations!</strong> You&apos;ve passed the exam with a score of {accuracy.toFixed(1)}%. 
                              You&apos;ve demonstrated solid understanding of ServiceNow concepts.
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 text-orange-700 dark:text-orange-300">
                            <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>
                              <strong>Keep studying!</strong> You scored {accuracy.toFixed(1)}%, which is below the {passingScore}% passing threshold. 
                              Review the questions you missed and focus on those areas.
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>
                            You averaged {formatDuration(avgTimePerQuestion)} per question. 
                            {avgTimePerQuestion < 90000 
                              ? 'Good time management!' 
                              : 'Consider practicing time management for the actual exam.'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'questions' && (
                <Card className="h-full overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base">Question Review</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-96">
                      <div className="p-4 space-y-3">
                        {examResult.questionResults.map((result) => (
                          <div
                            key={result.questionIndex}
                            className={cn(
                              'p-3 rounded-lg border',
                              result.wasCorrect
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {result.wasCorrect ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                )}
                                <span className="font-medium text-sm">
                                  Question {result.questionIndex + 1}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDuration(result.timeSpent)}
                              </div>
                            </div>
                            
                            <div className="mt-2 text-xs space-y-1">
                              <div>
                                <span className="text-muted-foreground">Your answer: </span>
                                <span className="font-medium">
                                  {result.finalAnswer.join(', ') || 'No answer'}
                                </span>
                              </div>
                              {!result.wasCorrect && (
                                <div>
                                  <span className="text-muted-foreground">Correct answer: </span>
                                  <span className="font-medium text-green-700 dark:text-green-300">
                                    {result.correctAnswer.join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'analysis' && (
                <div className="space-y-4">
                  {/* Performance Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Strengths</h4>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            {accuracy >= 90 && (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                Excellent overall performance
                              </div>
                            )}
                            {avgTimePerQuestion < 90000 && (
                              <div className="flex items-center gap-2 text-green-600">
                                <Clock className="h-3 w-3" />
                                Good time management
                              </div>
                            )}
                            {examResult.answeredQuestions === examResult.totalQuestions && (
                              <div className="flex items-center gap-2 text-green-600">
                                <Target className="h-3 w-3" />
                                Completed all questions
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm mb-2">Areas for Improvement</h4>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            {accuracy < passingScore && (
                              <div className="flex items-center gap-2 text-orange-600">
                                <Target className="h-3 w-3" />
                                Need higher overall accuracy
                              </div>
                            )}
                            {avgTimePerQuestion > 120000 && (
                              <div className="flex items-center gap-2 text-orange-600">
                                <Clock className="h-3 w-3" />
                                Work on time management
                              </div>
                            )}
                            {examResult.answeredQuestions < examResult.totalQuestions && (
                              <div className="flex items-center gap-2 text-orange-600">
                                <FileText className="h-3 w-3" />
                                Answer all questions
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Study Tips */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Study Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <BookOpen className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                          <div>
                            <strong>Review incorrect answers:</strong> Focus on understanding why you got questions wrong rather than just memorizing correct answers.
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                          <div>
                            <strong>Practice time management:</strong> Try to average 1.5-2 minutes per question to ensure you can complete the entire exam.
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <RotateCcw className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                          <div>
                            <strong>Take practice exams:</strong> Regular practice helps build confidence and identify knowledge gaps.
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleShareResults}
                className="flex items-center gap-2"
              >
                <Share className="h-4 w-4" />
                Share
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleReviewAnswers}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Review Answers
              </Button>
              
              <Button 
                onClick={handleRetakeExam}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Exam
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ClientOnly>
  );
}