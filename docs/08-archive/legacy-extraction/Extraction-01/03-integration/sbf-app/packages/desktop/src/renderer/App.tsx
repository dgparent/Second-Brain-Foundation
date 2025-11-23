/**
 * SBF Desktop - Main App Component
 * Root component with navigation and routing
 * 
 * Architecture:
 * - Left Sidebar: Main navigation (Chat, Queue, Entities, Graph, Settings)
 * - Main Area: Active view
 * - Status Bar: Context info
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './views/ChatView';
import { QueueView } from './views/QueueView';
import { EntitiesView } from './views/EntitiesView';
import { GraphView } from './views/GraphView';
import { SettingsView } from './views/SettingsView';
import { StatusBar } from './components/StatusBar';
import './App.css';

export type ViewType = 'chat' | 'queue' | 'entities' | 'graph' | 'settings';

export function App() {
  const [currentView, setCurrentView] = useState<ViewType>('chat');
  const [vaultPath, setVaultPath] = useState<string | null>(null);

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return <ChatView vaultPath={vaultPath} />;
      case 'queue':
        return <QueueView vaultPath={vaultPath} />;
      case 'entities':
        return <EntitiesView vaultPath={vaultPath} />;
      case 'graph':
        return <GraphView vaultPath={vaultPath} />;
      case 'settings':
        return <SettingsView vaultPath={vaultPath} onVaultChange={setVaultPath} />;
      default:
        return <ChatView vaultPath={vaultPath} />;
    }
  };

  return (
    <div className="app">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="main-content">
        {renderView()}
      </main>
      <StatusBar vaultPath={vaultPath} />
    </div>
  );
}
