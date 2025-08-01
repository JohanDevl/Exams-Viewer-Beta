'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye, EyeOff, RotateCcw, ThumbsDown, Minus, ThumbsUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useExamStore } from '@/stores/examStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useToastWithSound } from '@/hooks/useToastWithSound';
import type { Question, DifficultyLevel } from '@/types';
import { cn } from '@/lib/utils';

interface QuestionDisplayProps {
  question: Question;
  questionIndex: number;
}

export function QuestionDisplay({ question, questionIndex }: QuestionDisplayProps) {
  const { 
    questionStates, 
    submitAnswer, 
    toggleFavorite, 
    setQuestionDifficulty,
    markQuestionAsPreview,
    resetQuestion,
    getQuestionStatus,
    goToNextQuestion,
    currentExam
  } = useExamStore();

  const { settings } = useSettingsStore();
  const { playSound } = useSoundEffects();
  const { addToast } = useToastWithSound();

  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questionState = questionStates[questionIndex];
  const status = getQuestionStatus(questionIndex);
  const isFavorite = questionState?.isFavorite || false;
  const difficulty = questionState?.difficulty;

  // Determine if this is a multiple choice question
  const isMultipleChoice = question.most_voted && question.most_voted.length > 1;

  // Initialize selected answers
  useEffect(() => {
    if (questionState?.userAnswer) {
      setSelectedAnswers(questionState.userAnswer.selectedAnswers);
      setIsSubmitted(true);
      if (settings.showExplanations) {
        setShowExplanation(true);
      }
    } else {
      setSelectedAnswers([]);
      setIsSubmitted(false);
      // Ne pas réinitialiser showExplanation si on est en mode preview
      if (questionState?.status !== 'preview') {
        setShowExplanation(false);
      }
    }
  }, [questionIndex, questionState, settings.showExplanations]);

  // Auto-activate View answer when showExplanations setting is enabled
  useEffect(() => {
    if (settings.showExplanations && !isSubmitted && status !== 'preview' && !questionState?.userAnswer) {
      markQuestionAsPreview(questionIndex);
      setShowExplanation(true);
      
      addToast({
        type: 'info',
        title: 'Answer revealed',
        description: 'Answers are automatically shown based on your settings.',
        duration: 2000
      });
    }
  }, [questionIndex, settings.showExplanations, isSubmitted, status, questionState, markQuestionAsPreview, addToast]);

  const handleAnswerSelect = (answerLetter: string) => {
    if (isSubmitted) return;

    if (isMultipleChoice) {
      setSelectedAnswers(prev => 
        prev.includes(answerLetter) 
          ? prev.filter(a => a !== answerLetter)
          : [...prev, answerLetter]
      );
    } else {
      setSelectedAnswers([answerLetter]);
    }
  };

  const checkAnswerCorrectness = (userAnswers: string[], question: Question): boolean => {
    const correctAnswers = question.correct_answers || (question.correct_answer ? [question.correct_answer] : []);
    if (correctAnswers.length === 0) return true; // No correct answer defined
    
    // Sort both arrays to compare them properly
    const sortedUserAnswers = [...userAnswers].sort();
    const sortedCorrectAnswers = [...correctAnswers].sort();
    
    return sortedUserAnswers.length === sortedCorrectAnswers.length &&
           sortedUserAnswers.every((answer, index) => answer === sortedCorrectAnswers[index]);
  };

  const handleSubmit = () => {
    if (selectedAnswers.length === 0) {
      addToast({
        type: 'warning',
        title: 'Select an answer',
        description: 'Please select at least one answer before submitting.',
        duration: 3000
      });
      return;
    }

    submitAnswer(questionIndex, selectedAnswers);
    setIsSubmitted(true);
    
    // Check if answer is correct and play appropriate sound
    const isCorrect = checkAnswerCorrectness(selectedAnswers, question);
    playSound(isCorrect ? 'correct' : 'incorrect');
    
    if (settings.showExplanations) {
      setShowExplanation(true);
    }

    addToast({
      type: isCorrect ? 'success' : 'info',
      title: isCorrect ? 'Correct answer!' : 'Answer saved',
      description: isCorrect 
        ? 'Well done! You got it right.' 
        : 'Your answer has been saved successfully.',
      duration: 2000
    });

    // Auto progress: move to next question if enabled
    if (settings.autoProgress && currentExam && questionIndex < currentExam.questions.length - 1) {
      setTimeout(() => {
        goToNextQuestion();
      }, 1500); // Small delay to let user see the result
    }
  };

  const handlePreview = () => {
    markQuestionAsPreview(questionIndex);
    setShowExplanation(true);
    
    addToast({
      type: 'info',
      title: 'Answer revealed',
      description: 'The correct answer is now visible.',
      duration: 2000
    });
  };

  const handleHideAnswer = () => {
    setShowExplanation(false);
    
    addToast({
      type: 'info',
      title: 'Answer hidden',
      description: 'You can now answer this question.',
      duration: 2000
    });
  };

  const handleReset = () => {
    resetQuestion(questionIndex);
    setSelectedAnswers([]);
    setIsSubmitted(false);
    setShowExplanation(false);
    
    addToast({
      type: 'info',
      title: 'Question reset',
      description: 'You can now answer this question again.',
      duration: 2000
    });
  };

  const handleToggleFavorite = () => {
    toggleFavorite(questionIndex);
    
    // Play favorite sound
    playSound('favorite');
    
    addToast({
      type: isFavorite ? 'info' : 'success',
      title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      description: isFavorite 
        ? 'This question has been removed from your favorites.'
        : 'This question has been added to your favorites.',
      duration: 2000
    });
  };

  const handleDifficultyChange = (newDifficulty: DifficultyLevel) => {
    setQuestionDifficulty(questionIndex, newDifficulty);
    
    addToast({
      type: 'success',
      title: 'Difficulty updated',
      description: `Difficulty set to ${newDifficulty === 'easy' ? 'Easy' : newDifficulty === 'medium' ? 'Medium' : 'Hard'}.`,
      duration: 2000
    });
  };

  const getAnswerLetter = (index: number) => String.fromCharCode(65 + index); // A, B, C, D...

  const getDifficultyIcon = (level: DifficultyLevel, isSelected = false) => {
    switch (level) {
      case 'easy':
        return <ThumbsUp className={cn("h-3 w-3", isSelected ? "text-white" : "text-green-500")} />;
      case 'medium':
        return <Minus className={cn("h-3 w-3", isSelected ? "text-white" : "text-yellow-500")} />;
      case 'hard':
        return <ThumbsDown className={cn("h-3 w-3", isSelected ? "text-white" : "text-red-500")} />;
      default:
        return null;
    }
  };

  const isAnswerCorrect = (answerLetter: string) => {
    return question.most_voted?.includes(answerLetter) || false;
  };

  const getAnswerStyle = (answerLetter: string) => {
    if (!showExplanation) {
      return selectedAnswers.includes(answerLetter) 
        ? 'border-primary bg-primary/10' 
        : '';
    }

    // Mode explanation
    const isSelected = selectedAnswers.includes(answerLetter);
    const isCorrect = isAnswerCorrect(answerLetter);

    if (isCorrect) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    } else if (isSelected && !isCorrect) {
      return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    }

    return '';
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
  };

  const statusColors = {
    unanswered: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    answered: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    correct: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    incorrect: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    preview: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Question header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className={statusColors[status]}>
                  {status === 'unanswered' ? 'Unanswered' :
                   status === 'answered' ? 'Answered' :
                   status === 'correct' ? 'Correct' :
                   status === 'incorrect' ? 'Incorrect' :
                   'Preview'}
                </Badge>
                
                {difficulty && (
                  <Badge variant="secondary" className={cn(
                    "flex items-center gap-1",
                    difficultyColors[difficulty]
                  )}>
                    {getDifficultyIcon(difficulty, false)}
                    {difficulty === 'easy' ? 'Easy' : 
                     difficulty === 'medium' ? 'Medium' : 
                     'Hard'}
                  </Badge>
                )}

                {isMultipleChoice && (
                  <Badge variant="outline">
                    Multiple choice
                  </Badge>
                )}
              </div>

              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: question.question }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="sm"
                onClick={handleToggleFavorite}
                className={cn(
                  "h-9 w-9 p-0",
                  isFavorite && "text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                )}
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Answers */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {question.answers.map((answer, index) => {
              const answerLetter = getAnswerLetter(index);
              const isSelected = selectedAnswers.includes(answerLetter);
              
              return (
                <div
                  key={index}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all duration-200",
                    getAnswerStyle(answerLetter),
                    !isSubmitted && !showExplanation && "hover:border-primary/50 hover:bg-muted/50"
                  )}
                  onClick={() => handleAnswerSelect(answerLetter)}
                >
                  <div className="flex items-start gap-3">
                    {isMultipleChoice ? (
                      <Checkbox
                        checked={isSelected}
                        disabled={isSubmitted || showExplanation}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center mt-1">
                        <div className={cn(
                          "w-4 h-4 border-2 rounded-full",
                          isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                        )}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full m-auto" />}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <span className="flex-1">{answer}</span>
                        
                        {showExplanation && isAnswerCorrect(answerLetter) && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            Correct
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              {/* Difficulty rating */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Difficulty:</span>
                <div className="flex items-center gap-1">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <Button
                      key={level}
                      variant={difficulty === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleDifficultyChange(level)}
                      className={cn(
                        "h-7 px-2 text-xs",
                        difficulty === level && level === 'easy' && "bg-green-500 hover:bg-green-600 text-white border-green-500",
                        difficulty === level && level === 'medium' && "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500",
                        difficulty === level && level === 'hard' && "bg-red-500 hover:bg-red-600 text-white border-red-500"
                      )}
                      title={`Mark as ${level} difficulty`}
                    >
                      {getDifficultyIcon(level, difficulty === level)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isSubmitted && status !== 'preview' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreview}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View answer
                  </Button>
                  
                  <Button 
                    onClick={handleSubmit}
                    disabled={selectedAnswers.length === 0}
                    className="flex items-center gap-2"
                  >
                    Submit
                  </Button>
                </>
              )}

              {status === 'preview' && !isSubmitted && (
                <>
                  {showExplanation ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleHideAnswer}
                      className="flex items-center gap-2"
                    >
                      <EyeOff className="h-4 w-4" />
                      Hide answer
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreview}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View answer
                      </Button>
                      
                      <Button 
                        onClick={handleSubmit}
                        disabled={selectedAnswers.length === 0}
                        className="flex items-center gap-2"
                      >
                        Submit
                      </Button>
                    </>
                  )}
                </>
              )}
              
              {isSubmitted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Explanation */}
      {showExplanation && question.explanation && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">Explanation</span>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: question.explanation }}
            />
          </CardContent>
        </Card>
      )}

      {/* Community comments */}
      {question.comments && question.comments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">Community comments</span>
              <Badge variant="secondary">{question.comments.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {question.comments.map((comment, index) => (
                <div key={index} className="border-l-2 border-muted pl-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    {comment.selected_answer && (
                      <span>Selected answer: <strong>{comment.selected_answer}</strong></span>
                    )}
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}