# Domain Services Reference

This document provides a reference for the domain services available in the Second Brain Foundation framework. These services are exposed to the Desktop application via IPC and the `sbfAPI` global object.

## Core Domains

### Task Management
**Module:** `@sbf/personal-tasks`
**Namespace:** `tasks`

| Method | Description | Parameters |
|--------|-------------|------------|
| `create` | Create a new task | `{ title, priority, options }` |
| `getAll` | Get all tasks | - |
| `updateStatus` | Update task status | `{ uid, status }` |

### Financial Tracking
**Module:** `@sbf/budgeting`
**Namespace:** `finance`

| Method | Description | Parameters |
|--------|-------------|------------|
| `createAccount` | Create a financial account | `{ title, type, currency, institution, initialBalance }` |
| `logTransaction` | Log a transaction | `{ title, amount, currency, accountUid, date, category, merchant }` |
| `getAccounts` | Get all accounts | - |
| `getTransactions` | Get transactions for an account | `accountUid` |
| `getNetWorth` | Calculate total net worth | - |

### Fitness Tracking
**Module:** `@sbf/fitness-tracking`
**Namespace:** `fitness`

| Method | Description | Parameters |
|--------|-------------|------------|
| `logMetric` | Log a health metric (weight, HR, etc.) | `{ metricType, value, unit, date, time, source }` |
| `logWorkout` | Log a workout session | `{ title, activityType, durationMinutes, date, caloriesBurned, notes }` |
| `getMetrics` | Get metrics history | `metricType` |
| `getWorkouts` | Get workout history | - |
| `getLatestMetric` | Get most recent value for a metric | `metricType` |

### Relationship CRM
**Module:** `@sbf/relationship-crm`
**Namespace:** `crm`

| Method | Description | Parameters |
|--------|-------------|------------|
| `createContact` | Create a new contact | `{ fullName, category, email, phone, company, jobTitle, notes }` |
| `logInteraction` | Log an interaction with contacts | `{ title, type, date, contactUids, summary, notes }` |
| `getContacts` | Get all contacts | - |
| `getInteractions` | Get interactions for a contact | `contactUid` |

## Extended Domains

### Portfolio Tracking
**Module:** `@sbf/portfolio-tracking`
**Namespace:** `finance` (Shared)

| Method | Description | Parameters |
|--------|-------------|------------|
| `addAsset` | Add an investment asset | `{ name, assetType, quantity, symbol, currentPrice, currency, accountUid }` |
| `getAssets` | Get assets for an account | `accountUid` |
| `getPortfolioValue` | Calculate total portfolio value | `currency` |
| `getAllocation` | Get asset allocation breakdown | - |

### Nutrition Tracking
**Module:** `@sbf/nutrition-tracking`
**Namespace:** `fitness` (Shared)

| Method | Description | Parameters |
|--------|-------------|------------|
| `logMeal` | Log a meal entry | `{ title, mealType, foods, date, time, notes }` |
| `getMeals` | Get meals for a date range | `{ startDate, endDate }` |
| `getDailyNutrition` | Get daily macro summary | `date` |

### Medication Tracking
**Module:** `@sbf/medication-tracking`
**Namespace:** `fitness` (Shared)

| Method | Description | Parameters |
|--------|-------------|------------|
| `addMedication` | Add a new medication | `{ name, dosage, frequency, startDate, instructions, endDate }` |
| `getActiveMedications` | Get currently active medications | - |
| `logDose` | Log a medication dose | `{ medicationId, timestamp }` |

### Learning Tracker
**Module:** `@sbf/learning-tracker`
**Namespace:** `learning`

| Method | Description | Parameters |
|--------|-------------|------------|
| `addResource` | Add a learning resource | `{ title, type, url, topics }` |
| `getResources` | Get resources by status | `status` |
| `updateProgress` | Update resource progress | `{ uid, percent, status }` |

## Specialized Domains

### Legal Operations
**Module:** `@sbf/legal-ops`
**Namespace:** `legal`

| Method | Description | Parameters |
|--------|-------------|------------|
| `createCase` | Create a new legal case | `{ title, caseNumber, caseType, client, description }` |
| `getCases` | Get cases by status | `status` |

### Property Management
**Module:** `@sbf/property-mgmt`
**Namespace:** `property`

| Method | Description | Parameters |
|--------|-------------|------------|
| `addProperty` | Add a real estate property | `{ title, address, propertyType, purchasePrice, purchaseDate }` |
| `getProperties` | Get properties by status | `status` |

### Restaurant HACCP
**Module:** `@sbf/restaurant-haccp`
**Namespace:** `haccp`

| Method | Description | Parameters |
|--------|-------------|------------|
| `logEntry` | Log a HACCP entry | `{ item, logType, value, performedBy, isCCP, correctiveAction }` |
| `getLogs` | Get HACCP logs for a date range | `{ startDate, endDate }` |
