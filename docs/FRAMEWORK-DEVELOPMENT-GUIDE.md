# Framework Development Guide

## 🎯 Purpose

This guide explains how to build reusable **framework modules** for the Second Brain Foundation that enable rapid development of domain-specific modules with 85%+ code reuse.

---

## 📐 Framework Architecture

### What is a Framework module?

A **framework module** provides:
- **Base entity types** - Shared data structures for a domain
- **Reusable workflows** - Common business logic and aggregations
- **Utility functions** - Helpers, validators, calculators
- **Type definitions** - TypeScript types for type safety

### Framework vs Domain module

```
┌─────────────────────────────────────────────────────┐
│           FRAMEWORK module                          │
│  (Financial, Health, Knowledge, etc.)               │
│                                                     │
│  ✓ Base entities (FinancialEvent, HealthEvent)     │
│  ✓ Common workflows (Aggregation, Correlation)     │
│  ✓ Shared utilities (Validation, Calculation)      │
│  ✓ Type definitions (CurrencyCode, MetricType)     │
└─────────────────────────────────────────────────────┘
                        ▲
                        │ Extends (85% reuse)
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼─────┐  ┌──────▼──────┐  ┌────▼────────┐
│   Domain    │  │   Domain    │  │   Domain    │
│  module 1   │  │  module 2   │  │  module 3   │
│ (Budgeting) │  │ (Portfolio) │  │  (Fitness)  │
│             │  │             │  │             │
│ +15% custom │  │ +15% custom │  │ +15% custom │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## 🏗️ Building a Framework

### Step 1: Identify the Domain Cluster

Look for **3+ use cases** that share common patterns:

**Example - Financial Cluster:**
- Budgeting (transactions, categories)
- Portfolio (holdings, valuations)
- Goals (targets, progress)
- Tax (deductions, filing)

**Common Patterns:**
- All involve money amounts with currency
- All need date-based tracking
- All require aggregation and reporting
- All have similar privacy requirements (confidential)

### Step 2: Define Base Entities

Create abstract/base entity types that capture **80% of shared structure**.

**Example - Financial Framework:**

```typescript
/**
 * Base Entity interface
 */
export interface Entity {
  uid: string;
  type: string;
  title: string;
  lifecycle: { state: string };
  sensitivity: {
    level: string;
    privacy: {
      cloud_ai_allowed: boolean;
      local_ai_allowed: boolean;
      export_allowed: boolean;
    };
  };
  created: string;
  updated: string;
  metadata: Record<string, any>;
}

/**
 * Financial Event - Base for all financial events
 */
export interface FinancialEventEntity extends Entity {
  type: string; // Subclasses define specific type
  metadata: {
    date: string;
    amount: number;
    currency: string;
    category?: string;
    account_uid?: string;
    description?: string;
    tags?: string[];
  } & Record<string, any>; // Allow extensions
}
```

**Key Principles:**
- ✅ Use `metadata: Record<string, any>` to allow module extensions
- ✅ Include common fields (date, amount, currency)
- ✅ Use optional fields (`?`) for non-universal properties
- ✅ Keep it minimal - only truly common fields

### Step 3: Create Reusable Workflows

Build workflows that solve **common domain problems**.

**Example - Financial Aggregation:**

```typescript
export class FinancialAggregationWorkflow {
  constructor(
    private memoryEngine: SimpleMemoryEngine,
    private currencyConverter: CurrencyConverter,
    private baseCurrency: string = 'USD'
  ) {}

  /**
   * Aggregate by time period
   */
  async aggregateByPeriod(
    startDate: string,
    endDate: string,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    eventTypes?: string[]
  ): Promise<AggregationResult[]> {
    // Implementation handles:
    // - Querying events in date range
    // - Grouping by period
    // - Currency conversion
    // - Income/expense categorization
    // - Statistical calculations
  }
}
```

**Workflow Patterns:**
- Aggregation (sum, average, group by)
- Correlation (find patterns between entities)
- Validation (check business rules)
- Synchronization (import/export)

### Step 4: Add Utility Functions

Create helpers that domain modules will commonly need.

**Example - Financial Utilities:**

```typescript
/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    CAD: 'C$',
    EUR: '€',
    GBP: '£',
  };
  return `${symbols[currency] || currency}${amount.toFixed(2)}`;
}

/**
 * Validate financial event data
 */
export function validateFinancialEvent(event: Partial<FinancialEventEntity>): string[] {
  const errors: string[] = [];
  if (!event.uid) errors.push('UID is required');
  if (!event.metadata?.date) errors.push('Date is required');
  if (event.metadata?.amount === undefined) errors.push('Amount is required');
  // More validation...
  return errors;
}
```

### Step 5: Define Type System

Create comprehensive TypeScript types.

**Example:**

```typescript
/**
 * Common types for the framework
 */
export type CurrencyCode = 'USD' | 'CAD' | 'EUR' | 'GBP' | string;
export type AccountType = 'checking' | 'savings' | 'credit' | 'investment';
export type AccountStatus = 'active' | 'closed' | 'frozen';

// Export everything
export * from './entities/FinancialEventEntity';
export * from './workflows/FinancialAggregationWorkflow';
export * from './utils/financialHelpers';
```

---

## 📁 Framework Directory Structure

```
packages/@sbf/frameworks/your-framework/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Main exports
│   ├── types.ts              # Shared type definitions
│   ├── entities/
│   │   ├── BaseEntity.ts
│   │   └── DomainEntity.ts
│   ├── workflows/
│   │   ├── AggregationWorkflow.ts
│   │   └── CorrelationWorkflow.ts
│   └── utils/
│       ├── validators.ts
│       ├── formatters.ts
│       └── helpers.ts
└── dist/                     # Generated by TypeScript
```

---

## 🎨 Framework Templates

### Financial Framework Template

**Best for:** Money, transactions, accounts, investments
**Examples:** Budgeting, Portfolio, Tax, Financial Goals

**Key Entities:**
- FinancialEventEntity (base for all money events)
- FinancialAccountEntity (accounts, wallets)

**Key Workflows:**
- Aggregation by time period
- Currency conversion
- Account reconciliation

### Health Framework Template

**Best for:** Body metrics, medical data, wellness tracking
**Examples:** Fitness, Nutrition, Medication, Symptoms

**Key Entities:**
- HealthEventEntity (workouts, meals, doses)
- HealthMetricEntity (weight, HR, blood pressure)

**Key Workflows:**
- Metric correlation
- Trend analysis
- Adherence calculation

### Knowledge Framework Template

**Best for:** Learning, research, notes, content
**Examples:** Learning, Research, Notes, Highlights

**Key Entities:**
- KnowledgeNodeEntity (hierarchical knowledge)
- ResourceEntity (articles, books, videos)
- SessionEntity (practice, study sessions)

**Key Workflows:**
- Synthesis and insight extraction
- Progress tracking
- Spaced repetition

---

## ✅ Framework Checklist

Before publishing a framework, ensure:

- [ ] Base entities defined with extensible metadata
- [ ] At least 2 reusable workflows implemented
- [ ] 5+ utility functions for common operations
- [ ] Comprehensive TypeScript types
- [ ] All code compiles without errors
- [ ] Example usage documented
- [ ] At least 1 domain module built to validate
- [ ] 80%+ code reuse demonstrated

---

## 🚀 Publishing a Framework

### 1. Build the Framework

```bash
cd packages/@sbf/frameworks/your-framework
npm run build
```

### 2. Add to Workspace

Edit `package.json` at project root:

```json
{
  "workspaces": [
    "packages/@sbf/frameworks/your-framework"
  ]
}
```

### 3. Document Usage

Create `README.md` with:
- Purpose and use cases
- Entity types provided
- Workflow capabilities
- Example code
- Link to example modules

### 4. Test with Domain module

Build at least 1 domain module using your framework to validate the design.

---

## 📊 Success Metrics

A well-designed framework achieves:

- **85%+ Code Reuse** - Domain modules only add 15% custom code
- **3+ modules** - Framework supports multiple use cases
- **< 1 hour** - module development time (after framework)
- **Type Safe** - Full TypeScript coverage
- **Tested** - All workflows have examples

---

## 🎯 Real-World Examples

### Financial Framework

**Created:** Phase 4A  
**modules Built:** Budgeting, Portfolio  
**Code Reuse:** 85%  
**Build Time:** Framework (3h), Each module (45min)

**Files:**
- `packages/@sbf/frameworks/financial-tracking/`
- Example modules in `packages/@sbf/modules/budgeting/`

### Health Framework

**Created:** Phase 4B  
**modules Built:** Fitness, Nutrition, Medication  
**Code Reuse:** 85%  
**Build Time:** Framework (2.5h), Each module (30-45min)

**Files:**
- `packages/@sbf/frameworks/health-tracking/`
- Example modules in `packages/@sbf/modules/fitness-tracking/`

---

## 🎓 Next Steps

1. Review existing frameworks for patterns
2. Identify your domain cluster (3+ use cases)
3. Design base entities on paper first
4. Build framework incrementally
5. Validate with first domain module
6. Refactor based on learnings
7. Build 2nd module to prove reuse
8. Document and share!

---

## 💡 Pro Tips

- **Start small** - Begin with 2-3 core entities
- **Think extensible** - Use `Record<string, any>` for metadata
- **Avoid over-abstraction** - Don't build for imaginary use cases
- **Test early** - Build a module as soon as framework is minimal
- **Document as you go** - Future you will thank you
- **Study existing frameworks** - Learn from Financial & Health

---

**Questions?** Check `/docs/module-CLUSTER-STRATEGY.md` for cluster analysis and planning.
