# UI Implementation Guide

## Overview

This document details the implementation of the User Interface (UI) for the Second Brain Foundation Desktop Application. The UI is built using **React 18**, **Vite**, and **Ant Design**, running within an **Electron** renderer process.

## Architecture

### Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Ant Design (antd)
- **Icons**: @ant-design/icons
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Simple state-based routing (for now)

### Directory Structure
```
packages/@sbf/desktop/src/renderer/
├── components/          # Domain-specific components
│   ├── dashboard/       # Dashboard widgets
│   ├── privacy/         # Privacy management
│   ├── Dashboard.tsx    # Main Dashboard view
│   ├── Finance.tsx      # Finance view
│   ├── Health.tsx       # Health view
│   ├── Knowledge.tsx    # Knowledge view
│   ├── Legal.tsx        # Legal Ops view
│   ├── Property.tsx     # Property Mgmt view
│   └── HACCP.tsx        # HACCP view
├── types/               # TypeScript definitions
│   └── window.d.ts      # Global window augmentation
├── App.tsx              # Main application shell
├── index.tsx            # Entry point
└── index.html           # HTML template
```

## Components

### App Shell (`App.tsx`)
The main layout uses Ant Design's `Layout` component with a collapsible `Sider` for navigation. It manages the `currentView` state to switch between different domain components.

### Dashboard (`Dashboard.tsx`)
Displays high-level system statistics:
- Total Entities
- Privacy Level
- Active Lifecycle Count
- Recent Notifications

### Finance (`Finance.tsx`)
Visualizes financial data:
- Net Worth
- Portfolio Value
- Active Accounts
- Recent Transactions table

### Health (`Health.tsx`)
Tracks wellness metrics:
- Calories & Nutrition
- Active Medications
- Weight trends
- Workouts list

### Specialized Domains
- **Legal (`Legal.tsx`)**: Case management table.
- **Property (`Property.tsx`)**: Property cards with status and value.
- **HACCP (`HACCP.tsx`)**: Food safety logs with pass/fail status.
- **Knowledge (`Knowledge.tsx`)**: Learning resources list.

## Data Integration

The UI communicates with the backend (Electron Main process) via the `window.sbfAPI` bridge. This API is fully typed in `src/global.d.ts` (and `src/renderer/types/window.d.ts` historically).

### Example Usage
```typescript
useEffect(() => {
  const fetchData = async () => {
    const stats = await window.sbfAPI.lifecycle.getStats();
    setStats(stats);
  };
  fetchData();
}, []);
```

## Build System

The project uses a dual-build strategy:
1. **Main Process**: Compiled with `tsc` to `dist/main`.
2. **Renderer Process**: Bundled with `vite` to `dist/renderer`.

Commands:
- `npm run build`: Runs both builds.
- `npm run dev`: Runs `tsc` for main and `vite` dev server (requires concurrent setup).

## Future Improvements

- **Routing**: Migrate to `react-router-dom` for better navigation state.
- **State Management**: Introduce Redux or Zustand for complex global state.
- **Theming**: Implement dark/light mode toggle (currently dark sidebar, light content).
- **Real-time Updates**: Use WebSockets or IPC events for live data updates instead of polling/fetch-on-mount.
