'use client';

import { 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  Search,
  Filter,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useExamStore } from '@/stores/examStore';
import { useState } from 'react';

export function NavigationControls() {
  const { 
    currentQuestionIndex,
    filteredQuestionIndices,
    searchFilters,
    setSearchFilters,
    goToPreviousQuestion,
    goToNextQuestion,
    goToRandomQuestion
  } = useExamStore();

  const [showFilters, setShowFilters] = useState(false);
  const [tempQuery, setTempQuery] = useState(searchFilters.query);

  const currentIndexInFiltered = filteredQuestionIndices.indexOf(currentQuestionIndex);
  const totalFiltered = filteredQuestionIndices.length;

  const canGoPrevious = currentIndexInFiltered > 0;
  const canGoNext = currentIndexInFiltered < totalFiltered - 1;

  const handleSearch = (query: string) => {
    setTempQuery(query);
    setSearchFilters({ query });
  };

  const handleFilterChange = (key: keyof typeof searchFilters, value: string | boolean) => {
    setSearchFilters({ [key]: value });
  };

  const clearFilters = () => {
    setSearchFilters({
      query: '',
      status: 'all',
      difficulty: 'all',
      favorites: false,
      category: 'all'
    });
    setTempQuery('');
  };

  const hasActiveFilters = searchFilters.query || 
                          searchFilters.status !== 'all' ||
                          searchFilters.difficulty !== 'all' ||
                          searchFilters.favorites ||
                          searchFilters.category !== 'all';

  return (
    <div className="border-b bg-background">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousQuestion}
              disabled={!canGoPrevious}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextQuestion}
              disabled={!canGoNext}
              className="flex items-center gap-2"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToRandomQuestion}
              disabled={totalFiltered === 0}
              className="flex items-center gap-2"
            >
              <Shuffle className="h-4 w-4" />
              <span className="hidden sm:inline">Random</span>
            </Button>
          </div>

          {/* Search and filters */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={tempQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10"
              />
              {tempQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSearch('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 relative"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  !
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filter by status */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <select
                  value={searchFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                >
                  <option value="all">All</option>
                  <option value="unanswered">Unanswered</option>
                  <option value="answered">Answered</option>
                  <option value="correct">Correct</option>
                  <option value="incorrect">Incorrect</option>
                  <option value="preview">Preview</option>
                </select>
              </div>

              {/* Filter by difficulty */}
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <select
                  value={searchFilters.difficulty || 'all'}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                >
                  <option value="all">All</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Favorites filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Favorites</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="favorites-filter"
                    checked={searchFilters.favorites}
                    onChange={(e) => handleFilterChange('favorites', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="favorites-filter" className="text-sm">
                    Favorites only
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="w-full"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Filter summary */}
            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Active filters:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {searchFilters.query && (
                      <Badge variant="secondary" className="text-xs">
                        Search: &quot;{searchFilters.query}&quot;
                      </Badge>
                    )}
                    {searchFilters.status !== 'all' && (
                      <Badge variant="secondary" className="text-xs">
                        Status: {searchFilters.status}
                      </Badge>
                    )}
                    {searchFilters.difficulty !== 'all' && (
                      <Badge variant="secondary" className="text-xs">
                        Difficulty: {searchFilters.difficulty}
                      </Badge>
                    )}
                    {searchFilters.favorites && (
                      <Badge variant="secondary" className="text-xs">
                        Favorites
                      </Badge>
                    )}
                  </div>
                  <span className="ml-auto">
                    {totalFiltered} question{totalFiltered > 1 ? 's' : ''} found
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}