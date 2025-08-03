import type { Question, ExamData, QuestionState, ExportOptions } from '@/types';

interface ExportData {
  questions: Question[];
  questionStates: Record<number, QuestionState>;
  examInfo?: {
    name: string;
    code: string;
    totalQuestions: number;
    exportDate: string;
  };
  options: ExportOptions;
}

export class ExportService {
  private static cleanHtml(html: string): string {
    // Remove HTML tags and decode entities
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .trim();
  }

  private static processLinksForPDF(html: string): string {
    // Convert URLs to clickable links for PDF
    const urlRegex = /(https?:\/\/[^\s<>"]{2,})/gi;
    
    // First, handle existing <a> tags - ensure they're properly formatted
    let processed = html.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi, 
      '<a href="$1" target="_blank" style="color: #007bff; text-decoration: underline;">$2</a>'
    );
    
    // Then find plain URLs that aren't already in <a> tags and convert them
    processed = processed.replace(urlRegex, (match) => {
      // Check if this URL is already inside an <a> tag
      const beforeMatch = processed.substring(0, processed.indexOf(match));
      const lastOpenTag = beforeMatch.lastIndexOf('<a');
      const lastCloseTag = beforeMatch.lastIndexOf('</a>');
      
      // If we're inside an <a> tag, don't modify
      if (lastOpenTag > lastCloseTag) {
        return match;
      }
      
      return `<a href="${match}" target="_blank" style="color: #007bff; text-decoration: underline;">${match}</a>`;
    });
    
    return processed;
  }

  private static filterQuestions(
    questions: Question[], 
    questionStates: Record<number, QuestionState>,
    contentFilter: string
  ): { questions: Question[], indices: number[] } {
    const filteredData: { questions: Question[], indices: number[] } = {
      questions: [],
      indices: []
    };

    questions.forEach((question, index) => {
      const state = questionStates[index];
      let include = false;

      switch (contentFilter) {
        case 'all':
          include = true;
          break;
        case 'favorites':
          include = state?.isFavorite || false;
          break;
        case 'answered':
          include = !!state?.userAnswer;
          break;
        case 'notes':
          include = !!state?.notes;
          break;
        default:
          include = true;
      }

      if (include) {
        filteredData.questions.push(question);
        filteredData.indices.push(index);
      }
    });

    return filteredData;
  }

  static async exportAsJSON(data: ExportData, contentFilter: string = 'all'): Promise<void> {
    const { questions, questionStates, examInfo, options } = data;
    const { questions: filteredQuestions, indices } = this.filterQuestions(questions, questionStates, contentFilter);

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        examInfo,
        totalQuestions: filteredQuestions.length,
        exportOptions: options
      },
      questions: filteredQuestions.map((question, index) => {
        const originalIndex = indices[index];
        const state = questionStates[originalIndex];
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const exportQuestion: Record<string, any> = {
          questionNumber: question.question_number || (originalIndex + 1).toString(),
          question: options.includeAnswers ? question.question : this.cleanHtml(question.question),
        };

        if (options.includeAnswers) {
          exportQuestion.answers = question.answers;
          exportQuestion.correctAnswers = question.correct_answers || (question.correct_answer ? [question.correct_answer] : []);
          exportQuestion.mostVoted = question.most_voted || '';
        }

        if (options.includeExplanations && question.explanation) {
          exportQuestion.explanation = question.explanation;
        }

        if (options.includeStatistics && question.comments) {
          exportQuestion.comments = question.comments;
        }

        if (state) {
          exportQuestion.userState = {
            isFavorite: state.isFavorite,
            difficulty: state.difficulty,
            userAnswer: state.userAnswer,
            notes: state.notes
          };
        }

        return exportQuestion;
      })
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${examInfo?.code || 'exam'}-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async exportAsCSV(data: ExportData, contentFilter: string = 'all'): Promise<void> {
    const { questions, questionStates, examInfo, options } = data;
    const { questions: filteredQuestions, indices } = this.filterQuestions(questions, questionStates, contentFilter);

    const headers = [
      'Question Number',
      'Question',
      ...(options.includeAnswers ? ['Answer A', 'Answer B', 'Answer C', 'Answer D', 'Correct Answer'] : []),
      ...(options.includeExplanations ? ['Explanation'] : []),
      ...(options.includeStatistics ? ['Comments Count'] : []),
      'Is Favorite',
      'Difficulty',
      'User Answer',
      'Notes'
    ];

    const csvRows = [headers.join(',')];

    filteredQuestions.forEach((question, index) => {
      const originalIndex = indices[index];
      const state = questionStates[originalIndex];
      
      const row = [
        `"${question.question_number || (originalIndex + 1).toString()}"`,
        `"${this.cleanHtml(question.question).replace(/"/g, '""')}"`,
      ];

      if (options.includeAnswers) {
        // Add up to 4 answers (A, B, C, D)
        for (let i = 0; i < 4; i++) {
          row.push(`"${question.answers[i] ? this.cleanHtml(question.answers[i]).replace(/"/g, '""') : ''}"`);
        }
        
        const correctAnswer = question.correct_answers?.join(', ') || question.correct_answer || question.most_voted || '';
        row.push(`"${correctAnswer}"`);
      }

      if (options.includeExplanations) {
        row.push(`"${question.explanation ? this.cleanHtml(question.explanation).replace(/"/g, '""') : ''}"`);
      }

      if (options.includeStatistics) {
        row.push(`"${question.comments ? question.comments.length : 0}"`);
      }

      // User state data
      row.push(`"${state?.isFavorite ? 'Yes' : 'No'}"`);
      row.push(`"${state?.difficulty || ''}"`);
      row.push(`"${state?.userAnswer?.selectedAnswers.join(', ') || ''}"`);
      row.push(`"${state?.notes || ''}"`);

      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${examInfo?.code || 'exam'}-export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async exportAsText(data: ExportData, contentFilter: string = 'all'): Promise<void> {
    const { questions, questionStates, examInfo, options } = data;
    const { questions: filteredQuestions, indices } = this.filterQuestions(questions, questionStates, contentFilter);

    let textContent = '';

    // Header
    if (examInfo) {
      textContent += `${examInfo.name} (${examInfo.code})\n`;
      textContent += `Export Date: ${new Date().toLocaleDateString()}\n`;
      textContent += `Total Questions: ${filteredQuestions.length}\n`;
      textContent += `${'='.repeat(60)}\n\n`;
    }

    filteredQuestions.forEach((question, index) => {
      const originalIndex = indices[index];
      const state = questionStates[originalIndex];
      const questionNumber = question.question_number || (originalIndex + 1).toString();

      textContent += `Question ${questionNumber}\n`;
      textContent += `${'-'.repeat(20)}\n`;
      textContent += `${this.cleanHtml(question.question)}\n\n`;

      if (options.includeAnswers && question.answers) {
        question.answers.forEach((answer, i) => {
          const letter = String.fromCharCode(65 + i); // A, B, C, D...
          const isCorrect = question.correct_answers?.includes(letter) || 
                           question.correct_answer === letter || 
                           question.most_voted?.includes(letter);
          textContent += `${letter}. ${this.cleanHtml(answer)}${isCorrect ? ' ✓' : ''}\n`;
        });
        textContent += '\n';
      }

      if (options.includeExplanations && question.explanation) {
        textContent += `Explanation:\n${this.cleanHtml(question.explanation)}\n\n`;
      }

      if (state) {
        if (state.isFavorite) textContent += `⭐ Favorite\n`;
        if (state.difficulty) textContent += `Difficulty: ${state.difficulty}\n`;
        if (state.userAnswer) {
          textContent += `Your Answer: ${state.userAnswer.selectedAnswers.join(', ')}\n`;
        }
        if (state.notes) textContent += `Notes: ${state.notes}\n`;
        textContent += '\n';
      }

      if (options.includeStatistics && question.comments && question.comments.length > 0) {
        textContent += `Comments (${question.comments.length}):\n`;
        question.comments.forEach((comment, i) => {
          textContent += `${i + 1}. `;
          if (comment.selected_answer) {
            textContent += `Selected answer: ${comment.selected_answer}\n    `;
          }
          textContent += `${this.cleanHtml(comment.content)}\n`;
        });
        textContent += '\n';
      }

      textContent += `${'='.repeat(60)}\n\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${examInfo?.code || 'exam'}-export.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async exportAsPDF(data: ExportData, contentFilter: string = 'all'): Promise<void> {
    // For PDF export, we'll use a more basic approach for now
    // In a real implementation, you might want to use libraries like jsPDF or similar
    const { questions, questionStates, examInfo, options } = data;
    const { questions: filteredQuestions, indices } = this.filterQuestions(questions, questionStates, contentFilter);

    // Create HTML content for printing
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${examInfo?.name || 'Exam Export'}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .question { margin-bottom: 30px; page-break-inside: avoid; }
          .question-number { font-weight: bold; font-size: 18px; color: #333; }
          .question-text { margin: 10px 0; }
          .answers { margin: 15px 0; }
          .answer { margin: 5px 0; padding: 5px; }
          .correct { background-color: #d4edda; border-left: 4px solid #28a745; }
          .explanation { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0; }
          .user-info { background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 10px 0; }
          .comments { background-color: #f8f9fa; padding: 10px; margin: 10px 0; }
          a { color: #007bff; text-decoration: underline; }
          a:hover { color: #0056b3; }
          @media print { 
            body { margin: 20px; } 
            a { color: #007bff !important; text-decoration: underline !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${examInfo?.name || 'Exam Export'}</h1>
          <p><strong>Code:</strong> ${examInfo?.code || 'N/A'} | <strong>Questions:</strong> ${filteredQuestions.length} | <strong>Export Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
    `;

    filteredQuestions.forEach((question, index) => {
      const originalIndex = indices[index];
      const state = questionStates[originalIndex];
      const questionNumber = question.question_number || (originalIndex + 1).toString();

      htmlContent += `
        <div class="question">
          <div class="question-number">Question ${questionNumber}</div>
          <div class="question-text">${this.processLinksForPDF(question.question)}</div>
      `;

      if (options.includeAnswers && question.answers) {
        htmlContent += '<div class="answers">';
        question.answers.forEach((answer, i) => {
          const letter = String.fromCharCode(65 + i);
          const isCorrect = question.correct_answers?.includes(letter) || 
                           question.correct_answer === letter || 
                           question.most_voted?.includes(letter);
          htmlContent += `<div class="answer ${isCorrect ? 'correct' : ''}">${letter}. ${this.processLinksForPDF(answer)}</div>`;
        });
        htmlContent += '</div>';
      }

      if (options.includeExplanations && question.explanation) {
        htmlContent += `<div class="explanation"><strong>Explanation:</strong><br>${this.processLinksForPDF(question.explanation)}</div>`;
      }

      if (state && (state.isFavorite || state.difficulty || state.userAnswer || state.notes)) {
        htmlContent += '<div class="user-info">';
        if (state.isFavorite) htmlContent += '<span>⭐ Favorite</span><br>';
        if (state.difficulty) htmlContent += `<strong>Difficulty:</strong> ${state.difficulty}<br>`;
        if (state.userAnswer) htmlContent += `<strong>Your Answer:</strong> ${state.userAnswer.selectedAnswers.join(', ')}<br>`;
        if (state.notes) htmlContent += `<strong>Notes:</strong> ${this.processLinksForPDF(state.notes)}<br>`;
        htmlContent += '</div>';
      }

      if (options.includeStatistics && question.comments && question.comments.length > 0) {
        htmlContent += `<div class="comments"><strong>Comments (${question.comments.length}):</strong><br>`;
        question.comments.slice(0, 5).forEach((comment, i) => { // Limit to first 5 comments
          htmlContent += `<div style="margin-bottom: 10px;">${i + 1}. `;
          if (comment.selected_answer) {
            htmlContent += `<strong>Selected answer: ${comment.selected_answer}</strong><br>`;
          }
          htmlContent += `${this.processLinksForPDF(comment.content)}</div>`;
        });
        htmlContent += '</div>';
      }

      htmlContent += '</div>';
    });

    htmlContent += '</body></html>';

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
  }

  static async exportData(
    examData: ExamData,
    questionStates: Record<number, QuestionState>,
    options: ExportOptions,
    contentFilter: string = 'all',
    examInfo?: { name: string; code: string }
  ): Promise<void> {
    const data: ExportData = {
      questions: examData.questions,
      questionStates,
      examInfo: examInfo ? {
        ...examInfo,
        totalQuestions: examData.questions.length,
        exportDate: new Date().toISOString()
      } : undefined,
      options
    };

    switch (options.format) {
      case 'json':
        await this.exportAsJSON(data, contentFilter);
        break;
      case 'csv':
        await this.exportAsCSV(data, contentFilter);
        break;
      case 'txt':
        await this.exportAsText(data, contentFilter);
        break;
      case 'pdf':
        await this.exportAsPDF(data, contentFilter);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }
}