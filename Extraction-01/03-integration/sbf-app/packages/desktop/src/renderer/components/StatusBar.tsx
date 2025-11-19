/**
 * SBF Desktop - Status Bar Component
 * Bottom status bar showing vault context
 */

import React from 'react';
import './StatusBar.css';

interface StatusBarProps {
  vaultPath: string | null;
}

export function StatusBar({ vaultPath }: StatusBarProps) {
  const displayPath = vaultPath 
    ? vaultPath.split(/[/\\]/).slice(-2).join('/')
    : 'No vault selected';

  return (
    <div className="status-bar">
      <div className="status-item">
        <span className="status-icon">📁</span>
        <span className="status-text">{displayPath}</span>
      </div>
      
      <div className="status-item">
        <span className="status-icon">●</span>
        <span className="status-text">Ready</span>
      </div>
    </div>
  );
}
