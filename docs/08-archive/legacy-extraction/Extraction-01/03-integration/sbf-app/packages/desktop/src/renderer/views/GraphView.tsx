/**
 * SBF Desktop - Graph View
 * Knowledge graph visualization
 */

import React from 'react';
import './GraphView.css';

interface GraphViewProps {
  vaultPath: string | null;
}

export function GraphView({ vaultPath }: GraphViewProps) {
  return (
    <div className="graph-view">
      <header className="view-header">
        <h1>Knowledge Graph</h1>
        <p>Visualize relationships between entities</p>
      </header>

      <div className="graph-content">
        <div className="empty-state">
          <div className="empty-icon">🕸️</div>
          <h2>Graph View Coming Soon</h2>
          <p>Knowledge graph visualization will be available in Phase 1</p>
        </div>
      </div>
    </div>
  );
}
