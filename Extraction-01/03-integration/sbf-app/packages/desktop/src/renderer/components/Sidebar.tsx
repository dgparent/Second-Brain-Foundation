/**
 * SBF Desktop - Sidebar Component
 * Left navigation sidebar with view switching
 * 
 * Design:
 * - Terminal-inspired aesthetic (SBF principle)
 * - Keyboard shortcuts (Cmd/Ctrl + 1-5)
 * - Icons + labels
 */

import React from 'react';
import { ViewType } from '../App';
import './Sidebar.css';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

interface NavItem {
  id: ViewType;
  label: string;
  icon: string;
  shortcut: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'chat', label: 'Chat', icon: '💬', shortcut: '1' },
  { id: 'queue', label: 'Queue', icon: '📋', shortcut: '2' },
  { id: 'entities', label: 'Entities', icon: '🔗', shortcut: '3' },
  { id: 'graph', label: 'Graph', icon: '🕸️', shortcut: '4' },
  { id: 'settings', label: 'Settings', icon: '⚙️', shortcut: ',' },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const item = NAV_ITEMS.find(item => item.shortcut === e.key);
        if (item) {
          e.preventDefault();
          onViewChange(item.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onViewChange]);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">SBF</h1>
        <span className="sidebar-subtitle">Second Brain</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
            title={`${item.label} (${
              item.shortcut === ',' ? 'Cmd/Ctrl + ,' : `Cmd/Ctrl + ${item.shortcut}`
            })`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            <span className="nav-shortcut">{item.shortcut}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="version">v0.1.0-alpha</span>
      </div>
    </aside>
  );
}
