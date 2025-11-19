/**
 * SkeletonLoader Component
 * Placeholder for loading content
 */

import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'list';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'text', 
  count = 1,
  className = ''
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {items.map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-3" />
            <div className="h-3 bg-gray-700 rounded w-full mb-2" />
            <div className="h-3 bg-gray-700 rounded w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((i) => (
          <div key={i} className="flex items-center space-x-3 animate-pulse">
            <div className="w-10 h-10 bg-gray-700 rounded" />
            <div className="flex-1">
              <div className="h-3 bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-2 bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: text skeleton
  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((i) => (
        <div key={i} className="h-4 bg-gray-700 rounded animate-pulse w-full" />
      ))}
    </div>
  );
};
