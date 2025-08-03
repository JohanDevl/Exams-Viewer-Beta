'use client';

import { Heart, ExternalLink, Star, Clock } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSettingsStore } from '@/stores/settingsStore';
import { useExamStore } from '@/stores/examStore';

export function FavoritesModal() {
  const { isFavoritesModalOpen, closeFavoritesModal } = useSettingsStore();
  const { 
    currentExam, 
    currentExamInfo, 
    questionStates, 
    setCurrentQuestion,
    getQuestionStatus 
  } = useExamStore();

  // Get all favorite questions
  const favoriteQuestions = currentExam?.questions.map((question, index) => ({
    question,
    index,
    isFavorite: questionStates[index]?.isFavorite || false,
    status: getQuestionStatus(index),
    difficulty: questionStates[index]?.difficulty,
    notes: questionStates[index]?.notes
  })).filter(item => item.isFavorite) || [];

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index);
    closeFavoritesModal();
  };

  const getDifficultyColor = (difficulty: string | null | undefined) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct': return 'bg-green-100 text-green-800 border-green-200';
      case 'incorrect': return 'bg-red-100 text-red-800 border-red-200';
      case 'answered': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preview': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'correct': return 'Correct';
      case 'incorrect': return 'Incorrect';
      case 'answered': return 'Answered';
      case 'preview': return 'Preview';
      default: return 'Unanswered';
    }
  };

  return (
    <Dialog open={isFavoritesModalOpen} onOpenChange={closeFavoritesModal}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Favorite Questions
            {currentExamInfo && (
              <Badge variant="outline">{currentExamInfo.name}</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            View and manage your saved favorite questions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {favoriteQuestions.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No favorite questions</h3>
              <p className="text-muted-foreground">
                Add questions to your favorites by clicking the heart icon
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {favoriteQuestions.length} favorite question{favoriteQuestions.length > 1 ? 's' : ''}
                </p>
              </div>

              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-3">
                  {favoriteQuestions.map(({ question, index, status, difficulty, notes }) => (
                    <div
                      key={index}
                      className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              Question {index + 1}
                            </Badge>
                            <Badge className={getStatusColor(status)}>
                              {getStatusLabel(status)}
                            </Badge>
                            {difficulty && (
                              <Badge className={getDifficultyColor(difficulty)}>
                                <Star className="h-3 w-3 mr-1" />
                                {difficulty}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm mb-3 line-clamp-3">
                            {question.question}
                          </p>

                          {notes && (
                            <div className="mb-3 p-2 bg-muted rounded text-xs">
                              <Clock className="h-3 w-3 inline mr-1" />
                              <strong>Note:</strong> {notes}
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground">
                            {question.answers.length} possible answer{question.answers.length > 1 ? 's' : ''}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToQuestion(index)}
                          className="shrink-0"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}