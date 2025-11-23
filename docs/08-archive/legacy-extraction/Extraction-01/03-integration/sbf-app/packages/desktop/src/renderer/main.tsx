/**
 * SBF Desktop - Renderer Entry Point
 * React application with SBF UI architecture
 * 
 * Based on:
 * - SBF frontend-spec.md (UI/UX design)
 * - FreedomGPT/Obsidian UI patterns (extracted)
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
