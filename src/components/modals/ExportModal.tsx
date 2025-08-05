'use client';

import { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileJson, 
  FileSpreadsheet, 
  FileType,
  List,
  Star,
  CheckCircle,
  Filter,
  Settings as SettingsIcon,
  Info
} from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ClientOnly } from '@/components/ui/ClientOnly';
import { useSettingsStore } from '@/stores/settingsStore';
import { useExamStore } from '@/stores/examStore';
import { ExportService } from '@/utils/exportUtils';
import type { ExportFormat, ExportOptions } from '@/types';
import { cn } from '@/lib/utils';

interface ExportFormatOption {
  format: ExportFormat;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const exportFormats: ExportFormatOption[] = [
  {
    format: 'pdf',
    label: 'PDF Document',
    icon: FileText,
    description: 'Formatted document with questions and answers'
  },
  {
    format: 'json',
    label: 'JSON Data',
    icon: FileJson,
    description: 'Structured data format for developers'
  },
  {
    format: 'txt',
    label: 'Plain Text',
    icon: FileType,
    description: 'Simple text file format'
  },
  {
    format: 'csv',
    label: 'CSV Spreadsheet',
    icon: FileSpreadsheet,
    description: 'Tabular format for analysis'
  }
];



export function ExportModal() {
  const { 
    isExportModalOpen, 
    closeExportModal,
    addToast 
  } = useSettingsStore();
  
  const { currentExam, questionStates } = useExamStore();
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeAnswers: true,
    includeExplanations: true,
    includeStatistics: true,
    filterByStatus: undefined,
    filterByDifficulty: undefined
  });
  
  const [contentFilter] = useState<'all' | 'favorites' | 'answered'>('all');
  const [includeQuestions, setIncludeQuestions] = useState(true);
  const [includeImages, setIncludeImages] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);

  const handleFormatChange = (format: ExportFormat) => {
    setExportOptions(prev => ({ ...prev, format }));
  };

  const handleOptionChange = (key: keyof ExportOptions, value: boolean) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };


  const getQuestionCount = () => {
    if (!currentExam) return 0;
    
    let count = currentExam.questions.length;
    
    // Apply filters
    if (contentFilter === 'favorites') {
      count = Object.values(questionStates).filter(state => state?.isFavorite).length;
    } else if (contentFilter === 'answered') {
      count = Object.values(questionStates).filter(state => state?.userAnswer).length;
    }
    
    return count;
  };

  const getEstimatedSize = () => {
    const questionCount = getQuestionCount();
    const baseSize = questionCount * 0.07; // ~70KB per question base
    
    let multiplier = 1;
    if (exportOptions.includeAnswers) multiplier += 0.3;
    if (exportOptions.includeExplanations) multiplier += 0.2;
    if (exportOptions.includeStatistics) multiplier += 0.4;
    if (includeImages) multiplier += 2; // Images significantly increase size
    
    const estimatedMB = (baseSize * multiplier).toFixed(1);
    return `~${estimatedMB} MB`;
  };

  const handleExport = async () => {
    if (!currentExam) return;
    
    try {
      addToast({
        type: 'info',
        title: 'Exporting...',
        description: `Preparing ${exportOptions.format.toUpperCase()} file with ${getQuestionCount()} questions`,
        duration: 2000
      });

      const examInfo = {
        name: `ServiceNow Certification Exam`, // You might want to get this from examStore
        code: currentExam.questions[0]?.question_number ? 'EXAM' : 'PRACTICE' // Basic logic for exam code
      };

      await ExportService.exportData(
        currentExam,
        questionStates,
        exportOptions,
        contentFilter,
        examInfo
      );

      addToast({
        type: 'success',
        title: 'Export completed!',
        description: `Successfully exported ${getQuestionCount()} questions as ${exportOptions.format.toUpperCase()}`,
        duration: 4000
      });

      closeExportModal();
    } catch (error) {
      console.error('Export failed:', error);
      addToast({
        type: 'error',
        title: 'Export failed',
        description: 'There was an error while exporting the data. Please try again.',
        duration: 5000
      });
    }
  };

  return (
    <ClientOnly>
      <Dialog open={isExportModalOpen} onOpenChange={closeExportModal}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-gray-500" />
              Export Options
            </DialogTitle>
            <DialogDescription>
              Choose your export format and content options
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] w-full pr-4">
            <div className="space-y-6">
              {/* Export Format */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Export Format
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {exportFormats.map((format) => {
                    const Icon = format.icon;
                    const isSelected = exportOptions.format === format.format;
                    
                    return (
                      <button
                        key={format.format}
                        className={cn(
                          "p-4 border rounded-xl cursor-pointer transition-all text-left group hover:border-primary/50",
                          isSelected ? "border-primary bg-primary/10 ring-1 ring-primary/20" : "border-border hover:bg-muted/50"
                        )}
                        onClick={() => handleFormatChange(format.format)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-muted"
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{format.label}</span>
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                              {format.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Content Filter
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { key: 'all', label: 'All Questions', icon: List, description: 'Export all available questions' },
                    { key: 'favorites', label: 'Favorites Only', icon: Star, description: 'Only export favorited questions' },
                    { key: 'answered', label: 'Answered Questions', icon: CheckCircle, description: 'Questions you have answered' }
                  ].map((filter) => {
                    const Icon = filter.icon;
                    const isSelected = contentFilter === filter.key;
                    
                    return (
                      <button
                        key={filter.key}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-all text-left group hover:border-primary/50",
                          isSelected ? "border-primary bg-primary/10 ring-1 ring-primary/20" : "border-border hover:bg-muted/50"
                        )}
                        onClick={() => handleOptionChange(filter.key as keyof ExportOptions, !exportOptions[filter.key as keyof ExportOptions])}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-muted"
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{filter.label}</span>
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                              {filter.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  Content Options
                </h3>
                <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg bg-muted/20">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="includeQuestions" className="text-sm font-medium">
                          Include Questions
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Include the question text
                        </p>
                      </div>
                      <Switch
                        id="includeQuestions"
                        checked={includeQuestions}
                        onCheckedChange={setIncludeQuestions}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="includeAnswers" className="text-sm font-medium">
                          Include Answers
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Include answer choices
                        </p>
                      </div>
                      <Switch
                        id="includeAnswers"
                        checked={exportOptions.includeAnswers}
                        onCheckedChange={(checked) => handleOptionChange('includeAnswers', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="includeCorrect" className="text-sm font-medium">
                          Include Correct Answers
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Mark correct answers
                        </p>
                      </div>
                      <Switch
                        id="includeCorrect"
                        checked={exportOptions.includeExplanations}
                        onCheckedChange={(checked) => handleOptionChange('includeExplanations', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="includeDiscussions" className="text-sm font-medium">
                          Include Discussions
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Include community comments
                        </p>
                      </div>
                      <Switch
                        id="includeDiscussions"
                        checked={exportOptions.includeStatistics}
                        onCheckedChange={(checked) => handleOptionChange('includeStatistics', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="includeImages" className="text-sm font-medium">
                          Include Images
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Include question images
                        </p>
                      </div>
                      <Switch
                        id="includeImages"
                        checked={includeImages}
                        onCheckedChange={setIncludeImages}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="includeMetadata" className="text-sm font-medium">
                          Include Metadata
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Include question metadata
                        </p>
                      </div>
                      <Switch
                        id="includeMetadata"
                        checked={includeMetadata}
                        onCheckedChange={setIncludeMetadata}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Summary */}
              <div className="p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Info className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Ready to export as {exportOptions.format.toUpperCase()}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {getQuestionCount()} questions
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {getEstimatedSize()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={closeExportModal}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={!currentExam || getQuestionCount() === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export {exportOptions.format.toUpperCase()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ClientOnly>
  );
}