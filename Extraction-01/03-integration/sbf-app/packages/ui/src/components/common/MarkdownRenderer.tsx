/**
 * MarkdownRenderer Component
 * 
 * Reusable component for rendering markdown with syntax highlighting
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyButton } from './CopyButton';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  onWikilinkClick?: (entityName: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '',
  onWikilinkClick
}) => {
  // Pre-process content to convert wikilinks to markdown links
  const processedContent = content.replace(
    /\[\[([^\]]+)\]\]/g,
    (match, entityName) => `[${entityName}](wikilink:${entityName})`
  );
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={className}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');
          
          return !inline && match ? (
            <div className="relative group">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton text={codeString} label="Copy" />
              </div>
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {codeString}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        // Handle wikilinks [[entity-name]]
        a({ node, children, href, ...props }) {
          if (href?.startsWith('wikilink:')) {
            const entityName = href.replace('wikilink:', '');
            return (
              <button
                onClick={() => onWikilinkClick?.(entityName)}
                className="text-blue-500 underline cursor-pointer hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                type="button"
              >
                {children}
              </button>
            );
          }
          return (
            <a 
              href={href} 
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          );
        },
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};
