/**
 * CopyButton Component
 * 
 * Button for copying text to clipboard with visual feedback
 */

import React, { useState } from 'react';
import { showSuccess } from '../../utils/toast';

export interface CopyButtonProps {
  text: string;
  label?: string;
  successMessage?: string;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = 'Copy',
  successMessage = 'Copied to clipboard!',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showSuccess(successMessage);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors ${className}`}
      aria-label={label}
    >
      {copied ? (
        <>
          <span className="mr-1">✓</span>
          Copied!
        </>
      ) : (
        <>
          <span className="mr-1">📋</span>
          {label}
        </>
      )}
    </button>
  );
};
