'use client';

import { BarChart3, Target, Clock, TrendingUp, Star, Award, Heart, History, Calendar, Trash2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettingsStore } from '@/stores/settingsStore';
import { useExamStore } from '@/stores/examStore';
import { useStatisticsStore } from '@/stores/statisticsStore';
import { PerformanceHeatmap } from '@/components/statistics/PerformanceHeatmap';
import { getExamsForDomain } from '@/utils/domainMapping';
import { useToastWithSound } from '@/hooks/useToastWithSound';
import type { ServiceNowDomain } from '@/types';

export function StatisticsModal() {
  const { isStatisticsModalOpen, closeStatisticsModal } = useSettingsStore();
  const { 
    currentExam, 
    currentExamInfo, 
    questionStates, 
    getProgress,
    loadExam 
  } = useExamStore();
  const { addToast } = useToastWithSound();

  // Handle domain navigation
  const handleDomainClick = async (domain: ServiceNowDomain) => {
    const examCodes = getExamsForDomain(domain);
    
    if (examCodes.length === 0) {
      addToast({
        type: 'warning',
        title: 'No exams found',
        description: `No exams found for ${domain} domain`
      });
      return;
    }

    // Close the statistics modal
    closeStatisticsModal();
    
    // If the current exam is already from this domain, don't reload
    if (currentExamInfo && examCodes.includes(currentExamInfo.code)) {
      // TODO: Implement domain-specific filtering within current exam
      addToast({
        type: 'info',
        title: 'Already in domain',
        description: `Currently viewing ${currentExamInfo.code} from ${domain} domain. Domain-specific filtering coming soon!`
      });
      return;
    }
    
    // Load the first exam from this domain
    try {
      await loadExam(examCodes[0]);
      
      // Show success message
      addToast({
        type: 'success',
        title: 'Domain loaded',
        description: `Loaded ${examCodes[0]} from ${domain} domain (${examCodes.length} total exams)`
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Loading failed',
        description: `Error loading exam from ${domain} domain: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

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

  Object.entries(questionStates).forEach(([, state]) => {
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
    color = "text-muted-foreground"
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
  }) => (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
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

  const SessionHistoryTab = ({ examCode }: { examCode?: string }) => {
    // Use the store hook to ensure reactivity
    const statisticsStore = useStatisticsStore();
    const sessionHistory = statisticsStore.getSessionHistory(examCode);
    const allSessions = statisticsStore.getSessionHistory();
    const { clearSessionHistory } = useStatisticsStore();
    
    const handleClearSessions = () => {
      const confirmMessage = examCode 
        ? `Clear session history for ${examCode}? (keeps latest session only)`
        : 'Clear session history for all exams? (keeps latest session for each exam)';
      
      if (window.confirm(confirmMessage)) {
        clearSessionHistory(examCode);
      }
    };
    
    // Calculate evolution metrics
    const getEvolutionTrend = () => {
      if (sessionHistory.length < 2) return null;
      
      const recent = sessionHistory.slice(0, 5); // Last 5 sessions
      const accuracyTrend = recent.map(s => s.accuracy);
      const completionTrend = recent.map(s => s.completionPercentage);
      
      return {
        accuracy: {
          current: accuracyTrend[0] || 0,
          previous: accuracyTrend[1] || 0,
          trend: accuracyTrend.length > 1 ? accuracyTrend[0] - accuracyTrend[1] : 0
        },
        completion: {
          current: completionTrend[0] || 0,
          previous: completionTrend[1] || 0,
          trend: completionTrend.length > 1 ? completionTrend[0] - completionTrend[1] : 0
        }
      };
    };
    
    const evolution = getEvolutionTrend();
    
    
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    if (sessionHistory.length === 0) {
      return (
        <div className="text-center py-12">
          <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No session history</h3>
          <p className="text-muted-foreground">
            Complete some exam sessions to see your progress evolution
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* Evolution overview */}
        {evolution && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Evolution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Accuracy Trend</div>
                  <div className="text-2xl font-bold">
                    {evolution.accuracy.current.toFixed(1)}%
                  </div>
                  <div className={`text-sm flex items-center justify-center gap-1 ${
                    evolution.accuracy.trend >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {evolution.accuracy.trend >= 0 ? '↗' : '↘'}
                    {Math.abs(evolution.accuracy.trend).toFixed(1)}% vs last session
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Completion Trend</div>
                  <div className="text-2xl font-bold">
                    {evolution.completion.current.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">exam progress</div>
                  <div className={`text-sm flex items-center justify-center gap-1 ${
                    evolution.completion.trend >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {evolution.completion.trend >= 0 ? '↗' : '↘'}
                    {Math.abs(evolution.completion.trend).toFixed(1)}% vs last session
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Session list */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Session History ({sessionHistory.length} sessions)
              </CardTitle>
              {sessionHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSessions}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Old Sessions
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessionHistory.map((session, index) => (
                <div 
                  key={session.id} 
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {session.examName}
                        {!session.endTime && (
                          <Badge variant="secondary" className="text-xs">
                            En cours
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Started: {formatDate(session.startTime)}
                      </div>
                    </div>
                    <Badge variant={index === 0 ? "default" : "outline"}>
                      {index === 0 ? "Latest" : `#${index + 1}`}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {session.completionPercentage.toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Completion</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {session.accuracy.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {session.questionsAnswered}
                      </div>
                      <div className="text-xs text-muted-foreground">Questions</div>
                    </div>
                  </div>
                  
                  {/* Difficulty breakdown if available */}
                  {Object.keys(session.difficultyBreakdown).length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-muted-foreground mb-2">Difficulty Performance</div>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(session.difficultyBreakdown).map(([difficulty, stats]) => (
                          <Badge key={difficulty} variant="outline" className="text-xs">
                            {difficulty}: {stats.correct}/{stats.answered}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Global statistics across all exams */}
        {examCode && allSessions.length > sessionHistory.length && (
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress Across All Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">{allSessions.length}</div>
                <div className="text-muted-foreground">Total sessions completed</div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Average accuracy: {(
                    allSessions.reduce((sum, s) => sum + s.accuracy, 0) / allSessions.length
                  ).toFixed(1)}%
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isStatisticsModalOpen} onOpenChange={closeStatisticsModal}>
      <DialogContent className="max-w-6xl max-h-[80vh]" aria-describedby="statistics-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Performance Statistics
            {currentExamInfo && (
              <Badge variant="outline">{currentExamInfo.name}</Badge>
            )}
          </DialogTitle>
          <DialogDescription id="statistics-description">
            View detailed statistics and performance metrics for your exam progress
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[600px] w-full">
          {!currentExam ? (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No exam loaded</h3>
              <p className="text-muted-foreground">
                Load an exam to view your statistics
              </p>
            </div>
          ) : (
            <Tabs defaultValue="current" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="current" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Current Session
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Session History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="current" className="space-y-6 mt-6">
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
                    subtitle={`${progress.correct} correct answers`}
                    icon={Target}
                    color="text-green-500"
                  />
                  <StatCard
                    title="Remaining"
                    value={progress.total - progress.answered}
                    subtitle="Questions left"
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

                {/* Domain Performance Heatmap */}
                <PerformanceHeatmap 
                  onDomainClick={handleDomainClick}
                />

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
              </TabsContent>
              
              <TabsContent value="history" className="space-y-6 mt-6">
                <SessionHistoryTab examCode={currentExamInfo?.code} />
              </TabsContent>
            </Tabs>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}