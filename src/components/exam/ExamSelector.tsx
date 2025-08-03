'use client';

import { useEffect, useState } from 'react';
import { Search, Calendar, FileText, Loader2, Grid, List } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useExamStore } from '@/stores/examStore';
import { useStatisticsStore } from '@/stores/statisticsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { Manifest, ExamInfo } from '@/types';
import { cn } from '@/lib/utils';
import { getDataPath } from '@/lib/assets';

export function ExamSelector() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [filteredExams, setFilteredExams] = useState<ExamInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingExam, setLoadingExam] = useState<string | null>(null);

  const { loadExam } = useExamStore();
  const { getExamStatistics } = useStatisticsStore();
  const { currentView, toggleView } = useSettingsStore();

  // Load manifest on mount
  useEffect(() => {
    const fetchManifest = async () => {
      try {
        const response = await fetch(getDataPath('manifest.json'));
        const data: Manifest = await response.json();
        setManifest(data);
        setFilteredExams(data.exams);
      } catch (error) {
        console.error('Error loading manifest:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchManifest();
  }, []);

  // Filter exams based on search
  useEffect(() => {
    if (!manifest) return;

    if (!searchQuery.trim()) {
      setFilteredExams(manifest.exams);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = manifest.exams.filter(exam => 
      exam.code.toLowerCase().includes(query) ||
      exam.name.toLowerCase().includes(query) ||
      exam.description.toLowerCase().includes(query)
    );
    
    setFilteredExams(filtered);
  }, [searchQuery, manifest]);

  const handleSelectExam = async (examCode: string) => {
    setLoadingExam(examCode);
    try {
      await loadExam(examCode);
    } catch (error) {
      console.error('Error loading exam:', error);
    } finally {
      setLoadingExam(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const getExamTypeColor = (code: string) => {
    if (code.startsWith('CIS-')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    if (code === 'CSA') return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    if (code === 'CAD') return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    if (code.startsWith('CAS-')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin"  />
          <span className="text-muted-foreground">Loading exams...</span>
        </div>
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load exam list.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search bar and view toggle */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"  />
          <Input
            placeholder="Search exams (code, name, description)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          size="default"
          onClick={toggleView}
          className="flex items-center gap-2 px-4"
          title={`Switch to ${currentView === 'list' ? 'card' : 'list'} view`}
        >
          {currentView === "list" ? (
            <>
              <Grid className="h-4 w-4"  />
              Cards
            </>
          ) : (
            <>
              <List className="h-4 w-4"  />
              List
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {filteredExams.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No exams found for &quot;{searchQuery}&quot;
          </p>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            {filteredExams.length} exam{filteredExams.length > 1 ? 's' : ''} found
          </div>

          <div className={cn(
            "gap-4",
            currentView === "card" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "space-y-4"
          )}>
            {filteredExams.map((exam) => {
              const stats = getExamStatistics(exam.code);
              const isLoadingThis = loadingExam === exam.code;

              return currentView === "card" ? (
                // Card view (existing)
                <Card 
                  key={exam.code} 
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
                    "hover:border-primary/20 group",
                    isLoadingThis && "opacity-75 cursor-not-allowed"
                  )}
                  onClick={() => !isLoadingThis && handleSelectExam(exam.code)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs font-medium", getExamTypeColor(exam.code))}
                      >
                        {exam.code}
                      </Badge>
                      {stats.answered > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(stats.accuracy)}% success rate
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {exam.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {exam.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Statistics */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <FileText className="h-4 w-4"  />
                          <span>{exam.questionCount} questions</span>
                        </div>
                        {stats.answered > 0 && (
                          <div className="text-muted-foreground">
                            {stats.answered}/{exam.questionCount} answered
                          </div>
                        )}
                      </div>

                      {/* Progress */}
                      {stats.answered > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{Math.round((stats.answered / exam.questionCount) * 100)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${(stats.answered / exam.questionCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Last updated date */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3"  />
                        <span>Updated on {formatDate(exam.lastUpdated)}</span>
                      </div>

                      {/* Button */}
                      <Button 
                        className="w-full mt-4" 
                        disabled={isLoadingThis}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isLoadingThis) handleSelectExam(exam.code);
                        }}
                      >
                        {isLoadingThis ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin"  />
                            Loading...
                          </>
                        ) : stats.answered > 0 ? (
                          'Continue'
                        ) : (
                          'Start'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // List view (compact horizontal)
                <Card
                  key={exam.code}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                    "hover:border-primary/20 group",
                    isLoadingThis && "opacity-75 cursor-not-allowed"
                  )}
                  onClick={() => !isLoadingThis && handleSelectExam(exam.code)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left side - Exam info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs font-medium w-fit", getExamTypeColor(exam.code))}
                          >
                            {exam.code}
                          </Badge>
                          {stats.answered > 0 && (
                            <Badge variant="outline" className="text-xs w-fit">
                              {Math.round(stats.accuracy)}% success
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                            {exam.name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {exam.description}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3"  />
                              <span>{exam.questionCount} questions</span>
                            </div>
                            {stats.answered > 0 && (
                              <span>{stats.answered}/{exam.questionCount} answered</span>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3"  />
                              <span>{formatDate(exam.lastUpdated)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Progress and button */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {stats.answered > 0 && (
                          <div className="text-right min-w-20">
                            <div className="text-sm font-medium">
                              {Math.round((stats.answered / exam.questionCount) * 100)}%
                            </div>
                            <div className="h-1 bg-muted rounded-full overflow-hidden w-20">
                              <div 
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${(stats.answered / exam.questionCount) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          disabled={isLoadingThis}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isLoadingThis) handleSelectExam(exam.code);
                          }}
                        >
                          {isLoadingThis ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin"  />
                              Loading...
                            </>
                          ) : stats.answered > 0 ? (
                            'Continue'
                          ) : (
                            'Start'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}