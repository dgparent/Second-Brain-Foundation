/**
 * RelationshipList Component
 * 
 * Displays entity relationships in a structured list
 */

import React from 'react';

interface Relationship {
  type: string;
  target: string;
}

interface RelationshipListProps {
  relationships: Relationship[];
}

export const RelationshipList: React.FC<RelationshipListProps> = ({ relationships }) => {
  const getRelationshipIcon = (type: string): string => {
    const icons: Record<string, string> = {
      references: '📚',
      'referenced-by': '🔗',
      'child-of': '⬆️',
      'parent-of': '⬇️',
      'related-to': '🔄',
      depends: '⚡',
      'dependency-of': '💫',
      mentions: '💬',
      'mentioned-in': '📝',
    };
    return icons[type] || '🔗';
  };

  const getRelationshipColor = (type: string): string => {
    const colors: Record<string, string> = {
      references: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'referenced-by': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'child-of': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'parent-of': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'related-to': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      depends: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'dependency-of': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      mentions: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      'mentioned-in': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const formatRelationType = (type: string): string => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Group relationships by type
  const groupedRelationships = relationships.reduce((acc, rel) => {
    if (!acc[rel.type]) {
      acc[rel.type] = [];
    }
    acc[rel.type].push(rel);
    return acc;
  }, {} as Record<string, Relationship[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedRelationships).map(([type, rels]) => (
        <div key={type} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getRelationshipIcon(type)}</span>
            <h4 className={`text-sm font-semibold px-2 py-0.5 rounded ${getRelationshipColor(type)}`}>
              {formatRelationType(type)}
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({rels.length})
            </span>
          </div>
          
          <ul className="space-y-1">
            {rels.map((rel, idx) => (
              <li
                key={idx}
                className="text-sm text-gray-700 dark:text-gray-300 pl-7 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                title={`Click to view ${rel.target}`}
              >
                <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                  {rel.target}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {relationships.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">No relationships found</p>
        </div>
      )}
    </div>
  );
};
