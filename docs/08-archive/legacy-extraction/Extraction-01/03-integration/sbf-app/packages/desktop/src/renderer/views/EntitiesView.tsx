/**
 * SBF Desktop - Entities View
 * Entity dashboard (People, Places, Topics, Projects)
 */

import React from 'react';
import './EntitiesView.css';

interface EntitiesViewProps {
  vaultPath: string | null;
}

export function EntitiesView({ vaultPath }: EntitiesViewProps) {
  return (
    <div className="entities-view">
      <header className="view-header">
        <h1>Entities</h1>
        <p>Manage people, places, topics, and projects</p>
      </header>

      <div className="entities-content">
        <div className="entity-grid">
          <div className="entity-card">
            <div className="entity-icon">👥</div>
            <h3>People</h3>
            <p className="entity-count">0 entities</p>
          </div>

          <div className="entity-card">
            <div className="entity-icon">📍</div>
            <h3>Places</h3>
            <p className="entity-count">0 entities</p>
          </div>

          <div className="entity-card">
            <div className="entity-icon">💡</div>
            <h3>Topics</h3>
            <p className="entity-count">0 entities</p>
          </div>

          <div className="entity-card">
            <div className="entity-icon">🎯</div>
            <h3>Projects</h3>
            <p className="entity-count">0 entities</p>
          </div>
        </div>
      </div>
    </div>
  );
}
