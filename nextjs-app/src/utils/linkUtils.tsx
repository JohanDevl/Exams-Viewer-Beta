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
 * Handles both HTML links and plain text URLs, and processes images
 */
interface LinkifiedHtmlProps {
  content: string;
  images?: Record<string, { webp: string; jpeg: string }>;
  className?: string;
}

export function LinkifiedHtml({ content, images, className = '' }: LinkifiedHtmlProps) {
  // If content contains HTML tags, use dangerouslySetInnerHTML with image processing
  if (content.includes('<') && content.includes('>')) {
    const processedContent = processImageContent(content, images);
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: processedContent }}
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

/**
 * Process HTML content to ensure images are properly handled
 * Replaces truncated base64 images with complete data from images object
 */
function processImageContent(htmlContent: string, images?: Record<string, { webp: string; jpeg: string }>): string {
  // If there are no img tags, return as is
  if (!htmlContent.includes('<img')) {
    return htmlContent;
  }

  let processedContent = htmlContent;

  // Replace img tags with proper base64 data URLs from images object
  processedContent = processedContent.replace(
    /<img([^>]*?)data-img-id=["']([^"']*?)["']([^>]*?)src=["'][^"']*?["']/g,
    (match, beforeId, imgId, afterId) => {
      // If we have the complete image data, use it
      if (images && images[imgId]) {
        const imageData = images[imgId];
        // Prefer webp format, fallback to jpeg
        const base64Data = imageData.webp || imageData.jpeg;
        const format = imageData.webp ? 'webp' : 'jpeg';
        const dataUrl = `data:image/${format};base64,${base64Data}`;
        
        const styling = 'style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e5e7eb; margin: 10px 0;"';
        const altText = 'alt="Question image"';
        
        return `<img${beforeId}data-img-id="${imgId}"${afterId}src="${dataUrl}" ${altText} ${styling}`;
      }
      
      // If no image data available, add error handling
      const errorHandling = 'onerror="this.style.display=\'none\'"';
      const altText = 'alt="Question image (not available)"';
      const styling = 'style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e5e7eb; margin: 10px 0;"';
      
      return `<img${beforeId}data-img-id="${imgId}"${afterId}src="" ${errorHandling} ${altText} ${styling}`;
    }
  );

  return processedContent;
}

/**
 * Component specifically for question content that may contain images
 */
interface QuestionContentProps {
  content: string;
  images?: Record<string, { webp: string; jpeg: string }>;
  className?: string;
}

export function QuestionContent({ content, images, className = '' }: QuestionContentProps) {
  const processedContent = processImageContent(content, images);
  
  return (
    <div 
      className={`${className} prose dark:prose-invert max-w-none`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}