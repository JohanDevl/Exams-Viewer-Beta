'use client';

import { BarChart3, Target, Clock, TrendingUp, Star, Award, Heart } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettingsStore } from '@/stores/settingsStore';
import { useExamStore } from '@/stores/examStore';

export function StatisticsModal() {
  const { isStatisticsModalOpen, closeStatisticsModal } = useSettingsStore();
  const { 
    currentExam, 
    currentExamInfo, 
    questionStates, 
    getProgress 
  } = useExamStore();

  // Calculate statistics
  const progress = getProgress();
  const accuracyPercentage = progress.answered > 0 ? Math.round((progress.correct / progress.answered) * 100) : 0;
  const completionPercentage = progress.total > 0 ? Math.round((progress.answered / progress.total) * 100) : 0;

  // Statistics by difficulty
  const difficultyStats = {
    easy: { total: 0, correct: 0, answered: 0 },
    medium: { total: 0, correct: 0, answered: 0 },
    hard: { total: 0, correct: 0, answered: 0 },
    unrated: { total: 0, correct: 0, answered: 0 }
  };

  // Calculate statistics by status
  const statusStats = {
    correct: 0,
    incorrect: 0,
    unanswered: 0,
    preview: 0,
    favorites: 0
  };

  Object.entries(questionStates).forEach(([index, state]) => {
    const difficulty = state.difficulty || 'unrated';
    
    // Stats by difficulty
    if (difficulty in difficultyStats) {
      difficultyStats[difficulty as keyof typeof difficultyStats].total++;
      if (state.status !== 'unanswered') {
        difficultyStats[difficulty as keyof typeof difficultyStats].answered++;
        if (state.status === 'correct') {
          difficultyStats[difficulty as keyof typeof difficultyStats].correct++;
        }
      }
    }

    // Stats by status
    switch (state.status) {
      case 'correct':
        statusStats.correct++;
        break;
      case 'incorrect':
        statusStats.incorrect++;
        break;
      case 'preview':
        statusStats.preview++;
        break;
      default:
        statusStats.unanswered++;
    }

    if (state.isFavorite) {
      statusStats.favorites++;
    }
  });

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color = "text-foreground" 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );

  const DifficultyProgress = ({ 
    difficulty, 
    data, 
    color 
  }: {
    difficulty: string;
    data: { total: number; correct: number; answered: number };
    color: string;
  }) => {
    const percentage = data.answered > 0 ? Math.round((data.correct / data.answered) * 100) : 0;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className={`h-4 w-4 ${color}`} />
            <span className="text-sm font-medium capitalize">{difficulty}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {data.correct}/{data.answered} ({percentage}%)
          </Badge>
        </div>
        <Progress 
          value={percentage} 
          className="h-2"
        />
        <div className="text-xs text-muted-foreground">
          {data.total} questions total
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isStatisticsModalOpen} onOpenChange={closeStatisticsModal}>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Performance Statistics
            {currentExamInfo && (
              <Badge variant="outline">{currentExamInfo.name}</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            View detailed statistics and performance metrics for your exam progress
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[600px] w-full">
          <div className="space-y-6">
            {!currentExam ? (
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No exam loaded</h3>
                <p className="text-muted-foreground">
                  Load an exam to view your statistics
                </p>
              </div>
            ) : (
              <>
                {/* General statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Progress"
                    value={`${completionPercentage}%`}
                    subtitle={`${progress.answered}/${progress.total} questions`}
                    icon={TrendingUp}
                    color="text-blue-500"
                  />
                  <StatCard
                    title="Accuracy"
                    value={`${accuracyPercentage}%`}
                    subtitle={`${progress.correct} correct`}
                    icon={Target}
                    color="text-green-500"
                  />
                  <StatCard
                    title="Remaining Questions"
                    value={progress.total - progress.answered}
                    subtitle="Unanswered"
                    icon={Clock}
                    color="text-orange-500"
                  />
                  <StatCard
                    title="Favorites"
                    value={statusStats.favorites}
                    subtitle="Saved questions"
                    icon={Heart}
                    color="text-red-500"
                  />
                </div>

                {/* Progress chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Overall Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>General progress</span>
                        <span>{completionPercentage}%</span>
                      </div>
                      <Progress value={completionPercentage} className="h-3" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Accuracy</span>
                        <span>{accuracyPercentage}%</span>
                      </div>
                      <Progress value={accuracyPercentage} className="h-3" />
                    </div>
                  </CardContent>
                </Card>

                {/* Statistics by difficulty */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Performance by Difficulty
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <DifficultyProgress
                      difficulty="Easy"
                      data={difficultyStats.easy}
                      color="text-green-500"
                    />
                    <DifficultyProgress
                      difficulty="Medium"
                      data={difficultyStats.medium}
                      color="text-yellow-500"
                    />
                    <DifficultyProgress
                      difficulty="Hard"
                      data={difficultyStats.hard}
                      color="text-red-500"
                    />
                    <DifficultyProgress
                      difficulty="Unrated"
                      data={difficultyStats.unrated}
                      color="text-gray-500"
                    />
                  </CardContent>
                </Card>

                {/* Answer distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Answer Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {statusStats.correct}
                        </div>
                        <div className="text-sm text-muted-foreground">Correct</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {statusStats.incorrect}
                        </div>
                        <div className="text-sm text-muted-foreground">Incorrect</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {statusStats.preview}
                        </div>
                        <div className="text-sm text-muted-foreground">Previewed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">
                          {statusStats.unanswered}
                        </div>
                        <div className="text-sm text-muted-foreground">Unanswered</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Exam information */}
                {currentExamInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Exam Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium">Exam code</div>
                          <div className="text-lg">{currentExamInfo.code}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Name</div>
                          <div className="text-lg">{currentExamInfo.name}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Total questions</div>
                          <div className="text-lg">{currentExamInfo.questionCount}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Last updated</div>
                          <div className="text-lg">
                            {new Date(currentExamInfo.lastUpdated).toLocaleDateString('en-US')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}