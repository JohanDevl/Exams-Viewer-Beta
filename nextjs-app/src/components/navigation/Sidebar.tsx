"use client";

import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Eye,
  Heart,
  Circle,
  Grid,
  List,
  ThumbsDown,
  Minus,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useExamStore } from "@/stores/examStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { cn } from "@/lib/utils";
import type { QuestionStatus, DifficultyLevel } from "@/types";

export function Sidebar() {
  const {
    currentExam,
    currentQuestionIndex,
    filteredQuestionIndices,
    questionStates,
    setCurrentQuestion,
    getQuestionStatus,
    getFirstAnswerStatus,
  } = useExamStore();

  const { sidebarCollapsed, setSidebarCollapsed, toggleSidebarVisibility, currentView, toggleView } =
    useSettingsStore();

  if (!currentExam) return null;

  const getStatusIcon = (status: QuestionStatus) => {
    switch (status) {
      case "correct":
        return <Check className="h-3 w-3 text-green-600" />;
      case "incorrect":
        return <X className="h-3 w-3 text-red-600" />;
      case "preview":
        return <Eye className="h-3 w-3 text-orange-600" />;
      case "answered":
        return <Circle className="h-3 w-3 text-blue-600 fill-current" />;
      default:
        return <Circle className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: QuestionStatus, isActive: boolean) => {
    if (isActive) return "bg-primary text-primary-foreground border-primary";

    switch (status) {
      case "correct":
        return "bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:border-green-800";
      case "incorrect":
        return "bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:border-red-800";
      case "preview":
        return "bg-orange-50 hover:bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:border-orange-800";
      case "answered":
        return "bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:border-blue-800";
      default:
        return "bg-muted hover:bg-muted/80 border-border";
    }
  };

  const getDifficultyIcon = (difficulty: DifficultyLevel) => {
    if (!difficulty) return null;

    switch (difficulty) {
      case 'easy':
        return <ThumbsUp className="h-3 w-3 text-green-500" />;
      case 'medium':
        return <Minus className="h-3 w-3 text-yellow-500" />;
      case 'hard':
        return <ThumbsDown className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const handleQuestionClick = (questionIndex: number) => {
    setCurrentQuestion(questionIndex);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div
      className={cn(
        "fixed right-0 top-16 h-[calc(100vh-4rem)] bg-background border-l transition-all duration-300 z-30 overflow-hidden",
        sidebarCollapsed ? "w-16" : "w-64 sm:w-72 lg:w-80 xl:w-84"
      )}
    >
      {/* Header */}
      <div className="h-16 border-b flex items-center justify-between px-2 overflow-hidden">
        {!sidebarCollapsed && (
          <div>
            <h3 className="font-semibold text-sm">Navigation</h3>
            <p className="text-xs text-muted-foreground">
              {filteredQuestionIndices.length} question
              {filteredQuestionIndices.length > 1 ? "s" : ""}
            </p>
          </div>
        )}

        <div className="flex items-center gap-1">
          {!sidebarCollapsed && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleView}
                className="h-8 w-8 p-0"
                title={`Switch to ${currentView === 'list' ? 'card' : 'list'} view`}
              >
                {currentView === "list" ? (
                  <Grid className="h-4 w-4" />
                ) : (
                  <List className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebarVisibility}
                className="h-8 w-8 p-0"
                title="Hide sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="h-8 w-8 p-0"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 h-[calc(100vh-8rem)]">
        {sidebarCollapsed ? (
          /* Compact view */
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {filteredQuestionIndices.map((questionIndex) => {
                const status = getFirstAnswerStatus(questionIndex);
                const questionState = questionStates[questionIndex];
                const isActive = questionIndex === currentQuestionIndex;
                const isFavorite = questionState?.isFavorite;

                return (
                  <Button
                    key={questionIndex}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuestionClick(questionIndex)}
                    className={cn(
                      "w-full h-10 p-0 border relative",
                      getStatusColor(status, isActive)
                    )}
                    title={`Question ${questionIndex + 1} - ${status}`}
                  >
                    <div className="flex items-center justify-center w-full">
                      {getStatusIcon(status)}
                    </div>

                    {isFavorite && (
                      <Heart className="absolute top-1 right-1 h-2 w-2 text-red-500 fill-current" />
                    )}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        ) : currentView === "list" ? (
          /* List view */
          <ScrollArea className="h-full">
            <div className="p-2 space-y-2">
              {filteredQuestionIndices.map((questionIndex) => {
                const status = getFirstAnswerStatus(questionIndex);
                const questionState = questionStates[questionIndex];
                const isActive = questionIndex === currentQuestionIndex;
                const isFavorite = questionState?.isFavorite;
                const difficulty = questionState?.difficulty;

                return (
                  <Button
                    key={questionIndex}
                    variant="ghost"
                    onClick={() => handleQuestionClick(questionIndex)}
                    className={cn(
                      "w-full h-auto p-2 border justify-start text-left overflow-hidden",
                      getStatusColor(status, isActive)
                    )}
                  >
                    <div className="flex items-center gap-2 w-full overflow-hidden">
                      {/* Status icon */}
                      <div className="flex-shrink-0">
                        {getStatusIcon(status)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm truncate">
                            Question {questionIndex + 1}
                          </span>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {difficulty && getDifficultyIcon(difficulty)}
                            {isFavorite && (
                              <Heart className="h-3 w-3 text-red-500 fill-current" />
                            )}
                          </div>
                        </div>

                        {/* Question excerpt */}
                        <div className="text-xs text-muted-foreground mt-1 truncate overflow-hidden">
                          {currentExam.questions[questionIndex]?.question
                            .replace(/<[^>]*>/g, "") // Remove HTML tags
                            .substring(0, 40)}
                          ...
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          /* Card view */
          <ScrollArea className="h-full">
            <div className="p-2 grid grid-cols-2 gap-2">
              {filteredQuestionIndices.map((questionIndex) => {
                const status = getFirstAnswerStatus(questionIndex);
                const questionState = questionStates[questionIndex];
                const isActive = questionIndex === currentQuestionIndex;
                const isFavorite = questionState?.isFavorite;
                const difficulty = questionState?.difficulty;

                return (
                  <Button
                    key={questionIndex}
                    variant="ghost"
                    onClick={() => handleQuestionClick(questionIndex)}
                    className={cn(
                      "w-full h-20 p-2 border justify-start text-left overflow-hidden flex-col",
                      getStatusColor(status, isActive)
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-1">
                        <div className="flex-shrink-0">
                          {getStatusIcon(status)}
                        </div>
                        <span className="font-medium text-xs truncate">
                          Q{questionIndex + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {difficulty && getDifficultyIcon(difficulty)}
                        {isFavorite && (
                          <Heart className="h-2 w-2 text-red-500 fill-current" />
                        )}
                      </div>
                    </div>

                    {/* Question excerpt */}
                    <div className="text-xs text-muted-foreground text-left w-full overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {currentExam.questions[questionIndex]?.question
                        .replace(/<[^>]*>/g, "") // Remove HTML tags
                        .substring(0, 60)}
                      ...
                    </div>
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Bottom statistics */}
      {!sidebarCollapsed && (
        <div className="border-t p-2 bg-muted/50 overflow-hidden">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium">
                {Math.round(
                  (filteredQuestionIndices.filter(
                    (i) => getFirstAnswerStatus(i) !== "unanswered"
                  ).length /
                    filteredQuestionIndices.length) *
                    100
                ) || 0}
                %
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                <span>
                  {
                    filteredQuestionIndices.filter(
                      (i) => getFirstAnswerStatus(i) === "correct"
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center gap-1">
                <X className="h-3 w-3 text-red-600" />
                <span>
                  {
                    filteredQuestionIndices.filter(
                      (i) => getFirstAnswerStatus(i) === "incorrect"
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3 text-orange-600" />
                <span>
                  {
                    filteredQuestionIndices.filter(
                      (i) => getFirstAnswerStatus(i) === "preview"
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-red-500" />
                <span>
                  {
                    filteredQuestionIndices.filter(
                      (i) => questionStates[i]?.isFavorite
                    ).length
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
