# Phase 3 Execution Plan: Frontend & Client Applications

**Date:** 2025-11-24  
**Status:** 🚀 IN PROGRESS  
**Previous:** Phase 2 Complete (Core Domain & API)

---

## Overview

Phase 3 transforms SBF into a multi-platform system with:
- ✅ Web Application (Next.js on Vercel)
- 📱 Mobile Foundation (iOS/Android structure)
- 🎤 Voice Integration (Alexa/Google setup)
- 📊 Analytics Dashboard Embedding
- 🔌 IoT Connectivity (already established in Phase 1)

---

## Execution Sequence

### Part 1: Web Application Enhancement (Current)
**Estimated:** 2-3 hours

1. **Authentication System**
   - Login/Signup pages
   - JWT token management
   - Protected routes
   - Tenant selector

2. **Dashboard Layouts**
   - Multi-tenant routing (`/[tenant]/...`)
   - Navigation structure
   - Responsive layouts
   - Dark mode support

3. **Entity Management UI**
   - Entity list view
   - Entity detail view
   - Create/Edit forms
   - Delete confirmations

4. **Task Management UI**
   - Task board/list views
   - Task creation
   - Status updates
   - Priority management

5. **Analytics Integration**
   - Embedded dashboard components
   - Superset iframe integration
   - Grafana iframe integration
   - Dashboard customization

### Part 2: API Client Library
**Estimated:** 1 hour

- API wrapper with axios
- Request interceptors for auth
- Error handling
- Type-safe endpoints

### Part 3: Mobile Foundation
**Estimated:** 1-2 hours

- iOS project structure
- Android project structure
- Shared API client configs
- Push notification setup

### Part 4: Voice Integration Setup
**Estimated:** 1 hour

- Alexa skill endpoint
- Google Assistant endpoint
- Account linking flow
- Intent handlers

---

## Implementation Details

### Web App Structure
```
apps/web/src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── [tenant]/
│   │   │   ├── entities/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── automations/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── auth/
│   │       ├── login/
│   │       │   └── route.ts
│   │       └── signup/
│   │           └── route.ts
│   └── layout.tsx (root)
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── dashboard/
│   │   ├── Navigation.tsx
│   │   ├── TenantSelector.tsx
│   │   └── Header.tsx
│   ├── entities/
│   │   ├── EntityList.tsx
│   │   ├── EntityCard.tsx
│   │   ├── EntityForm.tsx
│   │   └── EntityDetail.tsx
│   ├── tasks/
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   └── TaskBoard.tsx
│   ├── analytics/
│   │   ├── SupersetEmbed.tsx
│   │   ├── GrafanaEmbed.tsx
│   │   ├── DashboardGrid.tsx
│   │   └── ChartCard.tsx
│   └── shared/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       └── Loading.tsx
├── lib/
│   ├── api-client.ts
│   ├── auth.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useEntities.ts
│   │   ├── useTasks.ts
│   │   └── useTenant.ts
│   └── store/
│       ├── auth-store.ts
│       └── tenant-store.ts
└── types/
    ├── api.ts
    └── models.ts
```

---

## Progress Tracking

### Phase 3.1: Web Application ✅ IN PROGRESS
- [ ] Authentication pages
- [ ] Dashboard layout
- [ ] Entity management UI
- [ ] Task management UI
- [ ] Analytics dashboard embedding
- [ ] API client library

### Phase 3.2: Mobile Foundation
- [ ] iOS project structure
- [ ] Android project structure
- [ ] Push notification setup
- [ ] Offline data sync

### Phase 3.3: Voice Integration
- [ ] Alexa skill endpoint
- [ ] Google Assistant endpoint
- [ ] Account linking
- [ ] Intent handlers

### Phase 3.4: Analytics Dashboards
- [ ] Superset container deployment
- [ ] Grafana container deployment
- [ ] Dashboard creation scripts
- [ ] Embedding authentication

---

## Technical Decisions

### State Management
- **Auth:** Zustand store with persistence
- **Data:** TanStack Query (React Query) for server state
- **Global:** Zustand for app-wide state

### Styling
- **Framework:** Tailwind CSS
- **Components:** Custom + shadcn/ui
- **Theme:** Dark mode support via CSS variables

### Routing
- **Next.js App Router:** File-based routing
- **Dynamic Routes:** `/[tenant]/...` for multi-tenancy
- **Middleware:** Auth check on protected routes

### API Communication
- **Library:** axios with interceptors
- **Auth:** JWT in headers
- **Tenant:** X-Tenant-ID header
- **Error Handling:** Centralized error boundary

---

## Environment Variables

### Web App (.env.local)
```env
NEXT_PUBLIC_API_URL=https://sbf-api.fly.dev
NEXT_PUBLIC_AUTH_URL=https://sbf-auth.fly.dev
NEXT_PUBLIC_SUPERSET_URL=https://superset.fly.dev
NEXT_PUBLIC_GRAFANA_URL=https://grafana.fly.dev
```

---

## Next Actions

1. Create authentication pages ✅
2. Build dashboard layout ✅
3. Implement entity CRUD UI ✅
4. Implement task management UI ✅
5. Add analytics dashboard embedding ✅
6. Create mobile project structures 📱
7. Set up voice integration endpoints 🎤

---

**Last Updated:** 2025-11-24  
**Current Step:** Creating web application structure
