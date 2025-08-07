'use client';

import { useState, useEffect } from 'react';
import { Clock, FileText, Shuffle, Settings, Play, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSettingsStore } from '@/stores/settingsStore';
import { ClientOnly } from '@/components/ui/ClientOnly';
import type { ExamConfig, ExamInfo } from '@/types';

interface ExamConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (config: ExamConfig) => void;
  examInfo: ExamInfo | null;
}

export function ExamConfigModal({ isOpen, onClose, onStart, examInfo }: ExamConfigModalProps) {
  const { addToast } = useSettingsStore();

  // Configuration state
  const [timeLimit, setTimeLimit] = useState<number | null>(90); // Default 90 minutes
  const [customTimeLimit, setCustomTimeLimit] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(60); // Default 60 questions
  const [questionSelection, setQuestionSelection] = useState<'all' | 'random' | 'custom'>('random');
  const [customQuestionCount, setCustomQuestionCount] = useState<string>('');

  // Predefined options
  const timeLimitOptions = [
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '60 minutes' },
    { value: 90, label: '90 minutes (Recommended)' },
    { value: 120, label: '120 minutes' },
    { value: 180, label: '180 minutes' }
  ];

  const questionCountOptions = [
    { value: 20, label: '20 questions (Quick)' },
    { value: 40, label: '40 questions' },
    { value: 60, label: '60 questions (Typical)' },
    { value: 80, label: '80 questions' },
    { value: 100, label: '100 questions' }
  ];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeLimit(90);
      setCustomTimeLimit('');
      setQuestionCount(60);
      setQuestionSelection('random');
      setCustomQuestionCount('');
    }
  }, [isOpen]);

  // Calculate available questions
  const availableQuestions = examInfo?.questionCount || 0;
  const maxQuestionCount = Math.min(availableQuestions, questionCount);

  // Validation
  const isValidTimeLimit = timeLimit === null || (timeLimit >= 5 && timeLimit <= 300);
  const isValidQuestionCount = questionSelection === 'all' || 
                               (questionCount > 0 && questionCount <= availableQuestions);
  const isValidConfig = isValidTimeLimit && isValidQuestionCount;

  // Calculate estimated time per question
  const estimatedTimePerQuestion = timeLimit && maxQuestionCount > 0 
    ? Math.round((timeLimit * 60) / maxQuestionCount) 
    : null;

  const handleTimeLimitChange = (value: string) => {
    if (value === 'none') {
      setTimeLimit(null);
    } else if (value === 'custom') {
      setTimeLimit(parseInt(customTimeLimit) || 90);
    } else {
      setTimeLimit(parseInt(value));
    }
  };

  const handleCustomTimeLimitChange = (value: string) => {
    setCustomTimeLimit(value);
    const numValue = parseInt(value);
    if (numValue >= 5 && numValue <= 300) {
      setTimeLimit(numValue);
    }
  };


  const handleQuestionCountChange = (value: string) => {
    if (value === 'all') {
      setQuestionSelection('all');
      setQuestionCount(availableQuestions);
    } else if (value === 'custom') {
      setQuestionSelection('custom');
      setQuestionCount(parseInt(customQuestionCount) || 60);
    } else {
      setQuestionSelection('random');
      setQuestionCount(parseInt(value));
    }
  };

  const handleCustomQuestionCountChange = (value: string) => {
    setCustomQuestionCount(value);
    const numValue = parseInt(value);
    if (numValue > 0 && numValue <= availableQuestions) {
      setQuestionCount(numValue);
    }
  };

  const handleStart = () => {
    if (!isValidConfig) {
      addToast({
        type: 'error',
        title: 'Invalid configuration',
        description: 'Please check your exam configuration settings.',
        duration: 3000
      });
      return;
    }

    const config: ExamConfig = {
      timeLimit,
      questionCount: questionSelection === 'all' ? availableQuestions : questionCount,
      questionSelection,
      randomSeed: Date.now().toString() // For reproducible random selection
    };

    onStart(config);
    onClose();
  };

  if (!examInfo) return null;

  return (
    <ClientOnly>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Exam Configuration
            </DialogTitle>
            <DialogDescription>
              Configure your {examInfo.name} exam settings
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6">
            {/* Exam Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Exam Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exam:</span>
                    <span className="font-medium">{examInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Questions Available:</span>
                    <span className="font-medium">{availableQuestions} questions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exam Code:</span>
                    <Badge variant="secondary">{examInfo.code}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Limit Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Time Limit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Time Limit</Label>
                  <Select 
                    value={timeLimit === null ? 'none' : timeLimit.toString()}
                    onValueChange={handleTimeLimitChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeLimitOptions.map(option => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Time Limit</SelectItem>
                      <SelectItem value="none">No Time Limit (Practice Mode)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom time limit input */}
                {timeLimit !== null && !timeLimitOptions.find(opt => opt.value === timeLimit) && (
                  <div className="space-y-2">
                    <Label htmlFor="customTime">Custom Time Limit (minutes)</Label>
                    <Input
                      id="customTime"
                      type="number"
                      min="5"
                      max="300"
                      value={customTimeLimit}
                      onChange={(e) => handleCustomTimeLimitChange(e.target.value)}
                      placeholder="Enter minutes (5-300)"
                    />
                    {!isValidTimeLimit && (
                      <p className="text-sm text-red-500">Time limit must be between 5 and 300 minutes</p>
                    )}
                  </div>
                )}

                {timeLimit === null && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Practice mode - no time pressure, no auto-submission</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Question Count Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Question Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Number of Questions</Label>
                  <Select 
                    value={questionSelection === 'all' ? 'all' : questionSelection === 'custom' ? 'custom' : questionCount.toString()}
                    onValueChange={handleQuestionCountChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Questions ({availableQuestions})</SelectItem>
                      <Separator />
                      {questionCountOptions
                        .filter(option => option.value <= availableQuestions)
                        .map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))
                      }
                      <SelectItem value="custom">Custom Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom question count input */}
                {questionSelection === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="customQuestions">Custom Question Count</Label>
                    <Input
                      id="customQuestions"
                      type="number"
                      min="1"
                      max={availableQuestions}
                      value={customQuestionCount}
                      onChange={(e) => handleCustomQuestionCountChange(e.target.value)}
                      placeholder={`Enter number (1-${availableQuestions})`}
                    />
                    {!isValidQuestionCount && (
                      <p className="text-sm text-red-500">
                        Question count must be between 1 and {availableQuestions}
                      </p>
                    )}
                  </div>
                )}

                {/* Random selection info */}
                {questionSelection === 'random' && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Shuffle className="h-4 w-4 text-blue-600" />
                    <div className="text-sm">
                      <p>Questions will be randomly selected from all available questions</p>
                      <p className="text-muted-foreground">Selection maintains proportional domain coverage</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configuration Summary */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Configuration Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Mode:</span>
                    <Badge variant="default">Exam Mode</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Time Limit:</span>
                    <span className="font-medium">
                      {timeLimit ? `${timeLimit} minutes` : 'No limit (Practice)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Questions:</span>
                    <span className="font-medium">
                      {questionSelection === 'all' ? availableQuestions : questionCount} questions
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Selection:</span>
                    <span className="font-medium capitalize">{questionSelection}</span>
                  </div>
                  {estimatedTimePerQuestion && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Est. time per question:</span>
                      <span className="font-medium">~{estimatedTimePerQuestion} seconds</span>
                    </div>
                  )}
                </div>

                {/* Warnings */}
                <div className="mt-4 space-y-2">
                  {timeLimit && timeLimit < 60 && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      <span>Short time limit - this will be challenging!</span>
                    </div>
                  )}
                  {questionCount > 100 && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                      <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span>Large question set - this will be a comprehensive exam.</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleStart}
              disabled={!isValidConfig}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ClientOnly>
  );
}