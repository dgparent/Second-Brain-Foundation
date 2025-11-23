/**
 * SBF Desktop - Queue View
 * Organization queue for pending suggestions
 */

import React from 'react';
import './QueueView.css';

interface QueueViewProps {
  vaultPath: string | null;
}

export function QueueView({ vaultPath }: QueueViewProps) {
  return (
    <div className="queue-view">
      <header className="view-header">
        <h1>Organization Queue</h1>
        <p>Pending suggestions and review items</p>
      </header>

      <div className="queue-content">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>Nothing in Queue</h2>
          <p>All caught up! No pending organization items.</p>
        </div>
      </div>
    </div>
  );
}
