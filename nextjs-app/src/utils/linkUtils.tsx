import React from 'react';

// Regular expression to match URLs
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

/**
 * Converts text with URLs into clickable links
 * @param text - The text content that may contain URLs
 * @returns JSX with clickable links
 */
export function makeLinksClickable(text: string): React.ReactNode {
  if (!text) return text;

  const parts = text.split(URL_REGEX);
  
  return parts.map((part, index) => {
    if (URL_REGEX.test(part)) {
      // Reset regex state for next use
      URL_REGEX.lastIndex = 0;
      
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

/**
 * Component that renders text with clickable links
 */
interface LinkifiedTextProps {
  children: string;
  className?: string;
}

export function LinkifiedText({ children, className = '' }: LinkifiedTextProps) {
  return (
    <span className={className}>
      {makeLinksClickable(children)}
    </span>
  );
}

/**
 * Component that renders HTML content with additional link processing
 * Handles both HTML links and plain text URLs
 */
interface LinkifiedHtmlProps {
  content: string;
  className?: string;
}

export function LinkifiedHtml({ content, className = '' }: LinkifiedHtmlProps) {
  // If content contains HTML tags, use dangerouslySetInnerHTML
  if (content.includes('<') && content.includes('>')) {
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  
  // If it's plain text, use our link parsing
  return (
    <div className={className}>
      {makeLinksClickable(content)}
    </div>
  );
}