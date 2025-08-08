'use client';

import { useState } from 'react';
import { TrendingUp, Clock, Target, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStatisticsStore } from '@/stores/statisticsStore';
import { getDomainInfo, getAccuracyColorClass, formatAccuracy, getPerformanceLevel } from '@/utils/domainMapping';
import type { ServiceNowDomain, DomainStatistics, HeatmapData } from '@/types';

interface PerformanceHeatmapProps {
  onDomainClick?: (domain: ServiceNowDomain) => void;
  className?: string;
}

interface HeatmapCellProps {
  domain: DomainStatistics;
  onClick?: (domain: ServiceNowDomain) => void;
}

function HeatmapCell({ domain, onClick }: HeatmapCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const domainInfo = getDomainInfo(domain.domain);
  
  if (!domainInfo) return null;

  const accuracyColor = getAccuracyColorClass(domain.accuracy);
  const performanceLevel = getPerformanceLevel(domain.accuracy);
  const hasData = domain.answeredQuestions > 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Card 
        className={`h-32 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
          hasData ? 'opacity-100' : 'opacity-50'
        }`}
        onClick={() => onClick?.(domain.domain)}
      >
        <CardContent className="p-4 h-full flex flex-col justify-between">
          <div>
            <div className={`w-4 h-4 rounded-full mb-2 ${hasData ? accuracyColor : 'bg-gray-300'}`} />
            <div className="text-sm font-medium text-foreground truncate">
              {domainInfo.name}
            </div>
          </div>
          
          <div className="space-y-1">
            {hasData ? (
              <>
                <div className="text-lg font-bold text-foreground">
                  {formatAccuracy(domain.accuracy)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {domain.answeredQuestions}/{domain.totalQuestions} questions
                </div>
              </>
            ) : (
              <div className="text-xs text-muted-foreground">
                No data yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tooltip */}
      {showTooltip && hasData && (
        <div className="absolute z-50 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-popover border rounded-lg shadow-lg p-3 min-w-64">
          <div className="space-y-2">
            <div className="font-semibold text-sm text-foreground">
              {domainInfo.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {domainInfo.description}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-green-500" />
                <span>Accuracy: {formatAccuracy(domain.accuracy)}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-blue-500" />
                <span>Level: {performanceLevel}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-orange-500" />
                <span>Answered: {domain.answeredQuestions}</span>
              </div>
              <div className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-purple-500" />
                <span>Total: {domain.totalQuestions}</span>
              </div>
            </div>
            
            {domain.lastAccessed && (
              <div className="text-xs text-muted-foreground border-t pt-2">
                Last accessed: {domain.lastAccessed.toLocaleDateString('en-US')}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              Click to explore domain questions
            </div>
          </div>
          
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
        </div>
      )}
    </div>
  );
}

export function PerformanceHeatmap({ onDomainClick, className }: PerformanceHeatmapProps) {
  const [timeFrame, setTimeFrame] = useState<"7d" | "30d" | "all">("all");
  const { getHeatmapData } = useStatisticsStore();
  
  const heatmapData: HeatmapData = getHeatmapData(timeFrame);
  
  // Filter domains with data for summary stats
  const domainsWithData = heatmapData.domains.filter(d => d.answeredQuestions > 0);
  const averageAccuracy = domainsWithData.length > 0 
    ? domainsWithData.reduce((sum, d) => sum + d.accuracy, 0) / domainsWithData.length 
    : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Performance Heatmap by Domain
          </CardTitle>
          <div className="flex gap-1 w-full sm:w-auto">
            <Button
              variant={timeFrame === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFrame("7d")}
              className="flex-1 sm:flex-none"
            >
              7d
            </Button>
            <Button
              variant={timeFrame === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFrame("30d")}
              className="flex-1 sm:flex-none"
            >
              30d
            </Button>
            <Button
              variant={timeFrame === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFrame("all")}
              className="flex-1 sm:flex-none"
            >
              All
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Badge variant="outline" className="text-xs w-fit">
              {domainsWithData.length}/{heatmapData.totalDomains} domains active
            </Badge>
            <Badge variant="outline" className="text-xs w-fit">
              Avg accuracy: {formatAccuracy(averageAccuracy)}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Updated: {heatmapData.lastUpdated.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        {/* Heatmap grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {heatmapData.domains.map((domain) => (
            <HeatmapCell
              key={domain.domain}
              domain={domain}
              onClick={onDomainClick}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Needs Improvement (0-60%)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Average (60-80%)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Excellent (80%+)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}