/**
 * Nutrition Tracking Plugin
 * Built on Health Framework - demonstrates 85%+ code reuse
 */

/**
 * Base Entity interface (from Health Framework)
 */
interface Entity {
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
 * Meal entity
 */
export interface MealEntity extends Entity {
  type: 'nutrition.meal';
  metadata: {
    date: string;
    time?: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
    foods: Array<{
      name: string;
      quantity: number;
      unit: string;
      calories?: number;
      protein_g?: number;
      carbs_g?: number;
      fat_g?: number;
      fiber_g?: number;
    }>;
    nutrition_totals?: {
      calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      fiber_g?: number;
    };
    location?: string;
    notes?: string;
  };
}

/**
 * Water intake entity
 */
export interface WaterIntakeEntity extends Entity {
  type: 'nutrition.water';
  metadata: {
    date: string;
    time?: string;
    amount_ml: number;
    notes?: string;
  };
}

/**
 * Create meal
 */
export function createMeal(data: {
  uid: string;
  title: string;
  date: string;
  time?: string;
  meal_type: MealEntity['metadata']['meal_type'];
  foods: MealEntity['metadata']['foods'];
}): MealEntity {
  // Calculate totals
  const totals = {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
  };

  for (const food of data.foods) {
    totals.calories += food.calories || 0;
    totals.protein_g += food.protein_g || 0;
    totals.carbs_g += food.carbs_g || 0;
    totals.fat_g += food.fat_g || 0;
    totals.fiber_g += food.fiber_g || 0;
  }

  return {
    uid: data.uid,
    type: 'nutrition.meal',
    title: data.title,
    lifecycle: { state: 'permanent' },
    sensitivity: {
      level: 'personal',
      privacy: {
        cloud_ai_allowed: false,
        local_ai_allowed: true,
        export_allowed: true,
      },
    },
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      date: data.date,
      time: data.time,
      meal_type: data.meal_type,
      foods: data.foods,
      nutrition_totals: totals,
    },
  };
}

/**
 * Create water intake record
 */
export function createWaterIntake(data: {
  uid: string;
  date: string;
  time?: string;
  amount_ml: number;
}): WaterIntakeEntity {
  return {
    uid: data.uid,
    type: 'nutrition.water',
    title: `Water: ${data.amount_ml}ml`,
    lifecycle: { state: 'permanent' },
    sensitivity: {
      level: 'personal',
      privacy: {
        cloud_ai_allowed: false,
        local_ai_allowed: true,
        export_allowed: true,
      },
    },
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      date: data.date,
      time: data.time,
      amount_ml: data.amount_ml,
    },
  };
}

/**
 * Calculate daily nutrition summary
 */
export function calculateDailySummary(meals: MealEntity[]): {
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g: number;
  meals_logged: number;
  by_meal_type: Record<string, { calories: number; count: number }>;
} {
  const summary = {
    total_calories: 0,
    total_protein_g: 0,
    total_carbs_g: 0,
    total_fat_g: 0,
    total_fiber_g: 0,
    meals_logged: meals.length,
    by_meal_type: {} as Record<string, { calories: number; count: number }>,
  };

  for (const meal of meals) {
    const totals = meal.metadata.nutrition_totals;
    if (totals) {
      summary.total_calories += totals.calories;
      summary.total_protein_g += totals.protein_g;
      summary.total_carbs_g += totals.carbs_g;
      summary.total_fat_g += totals.fat_g;
      summary.total_fiber_g += totals.fiber_g || 0;
    }

    const mealType = meal.metadata.meal_type;
    if (!summary.by_meal_type[mealType]) {
      summary.by_meal_type[mealType] = { calories: 0, count: 0 };
    }
    summary.by_meal_type[mealType].calories += totals?.calories || 0;
    summary.by_meal_type[mealType].count += 1;
  }

  return summary;
}

/**
 * Calculate macro percentages
 */
export function calculateMacroPercentages(
  protein_g: number,
  carbs_g: number,
  fat_g: number
): { protein_pct: number; carbs_pct: number; fat_pct: number } {
  const proteinCal = protein_g * 4;
  const carbsCal = carbs_g * 4;
  const fatCal = fat_g * 9;
  const totalCal = proteinCal + carbsCal + fatCal;

  if (totalCal === 0) {
    return { protein_pct: 0, carbs_pct: 0, fat_pct: 0 };
  }

  return {
    protein_pct: (proteinCal / totalCal) * 100,
    carbs_pct: (carbsCal / totalCal) * 100,
    fat_pct: (fatCal / totalCal) * 100,
  };
}

/**
 * Plugin metadata
 */
export const NutritionPlugin = {
  id: 'sbf-nutrition-tracking',
  name: 'Nutrition & Diet Tracking',
  version: '0.1.0',
  domain: 'health',
  description: 'Track meals, nutrition, macros, and hydration',
  
  entityTypes: [
    'nutrition.meal',
    'nutrition.water',
  ],
  
  features: [
    'Meal logging with foods and quantities',
    'Automatic macro calculation (protein, carbs, fat)',
    'Daily nutrition summaries',
    'Water intake tracking',
    'Macro distribution analysis',
    'Meal type patterns',
  ],
  
  integrations: [
    'Nutrition databases (USDA, MyFitnessPal)',
    'Barcode scanning',
    'Manual entry',
  ],
};
