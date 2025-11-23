# module Development Guide

## 🎯 Purpose

Learn how to build domain-specific **modules** for Second Brain Foundation in **30-60 minutes** by leveraging existing framework modules.

---

## 🚀 Quick Start

### Prerequisites

1. A **framework module** exists for your domain (Financial, Health, Knowledge, etc.)
2. You have an idea for a specific use case (Budgeting, Fitness, Notes, etc.)
3. Basic TypeScript knowledge
4. Node.js installed

### 5-Minute module Setup

```bash
# 1. Create module directory
cd packages/@sbf/modules
mkdir my-module
cd my-module

# 2. Initialize package
npm init -y

# 3. Create TypeScript config
cat > tsconfig.json << EOF
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../../frameworks/your-framework" }
  ]
}
EOF

# 4. Create src directory
mkdir src

# 5. Build!
npm run build
```

---

## 📐 module Architecture

### What is a Domain module?

A **domain module** is a **specialized implementation** of a framework that adds:

- **15% custom code** - Domain-specific entities and logic
- **85% framework reuse** - Inherited from framework module
- **Specific use case** - Focused on one problem domain

---

## 🏗️ Building a module

### Step 1: Choose Your Framework

Pick the framework that best matches your domain:

| Framework | Use Cases | Examples |
|-----------|-----------|----------|
| **Financial** | Money, transactions | Budgeting, Portfolio, Tax, Goals |
| **Health** | Body, wellness, medical | Fitness, Nutrition, Medication |

### Step 2: Define Your Entities

Extend framework base entities with domain-specific metadata.

**Example - Portfolio module:**

```typescript
export interface AssetHoldingEntity extends Entity {
  type: 'portfolio.holding';
  metadata: {
    asset_type: 'stock' | 'etf' | 'bond' | 'crypto';
    ticker_symbol?: string;
    asset_name: string;
    quantity: number;
    purchase_price: number;
    current_price?: number;
  };
}
```

### Step 3: Create Helper Functions

```typescript
export function createAssetHolding(data: {
  uid: string;
  asset_name: string;
  quantity: number;
  purchase_price: number;
}): AssetHoldingEntity {
  return {
    uid: data.uid,
    type: 'portfolio.holding',
    title: `${data.asset_name} (${data.quantity} shares)`,
    // ... standard Entity fields
    metadata: {
      asset_name: data.asset_name,
      quantity: data.quantity,
      purchase_price: data.purchase_price,
    },
  };
}
```

---

## ✅ module Development Checklist

- [ ] Create module directory structure
- [ ] Define entities extending framework base
- [ ] Create helper functions
- [ ] Add domain-specific logic
- [ ] Build and test
- [ ] Document usage

---

## 🎯 Real-World Examples

See `/packages/@sbf/modules/` for complete examples:

- **budgeting** - Financial Framework (1 hour build)
- **portfolio-tracking** - Financial Framework (45 mins build)
- **fitness-tracking** - Health Framework (45 mins build)
- **nutrition-tracking** - Health Framework (45 mins build)
- **medication-tracking** - Health Framework (30 mins build)

---

**More details:** See `/docs/FRAMEWORK-DEVELOPMENT-GUIDE.md`
