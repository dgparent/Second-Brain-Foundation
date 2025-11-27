import { Entity, createHealthPrivacy } from './HealthEventEntity';

/**
 * Metadata for meals and nutrition
 */
export interface MealMetadata {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink' | 'supplement';
  date: string;
  time?: string;
  foods: Array<{
    name: string;
    quantity?: number;
    unit?: string;
    calories?: number;
    macros?: {
      protein?: number;
      carbs?: number;
      fat?: number;
    };
  }>;
  total_calories?: number;
  total_macros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  notes?: string;
  photo_url?: string;
}

/**
 * Meal entity
 */
export interface MealEntity extends Entity {
  type: 'health.meal';
  metadata: MealMetadata;
}

/**
 * Helper function to create a meal
 */
export function createMeal(data: {
  uid: string;
  title: string;
  meal_type: MealMetadata['meal_type'];
  date: string;
  time?: string;
  foods?: MealMetadata['foods'];
  notes?: string;
}): MealEntity {
  // Calculate totals if foods provided
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  if (data.foods) {
    data.foods.forEach(food => {
      totalCalories += food.calories || 0;
      totalProtein += food.macros?.protein || 0;
      totalCarbs += food.macros?.carbs || 0;
      totalFat += food.macros?.fat || 0;
    });
  }

  return {
    uid: data.uid,
    type: 'health.meal',
    title: data.title,
    lifecycle: { state: 'permanent' as const },
    sensitivity: createHealthPrivacy('personal'),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      meal_type: data.meal_type,
      date: data.date,
      time: data.time,
      foods: data.foods || [],
      total_calories: totalCalories,
      total_macros: {
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
      },
      notes: data.notes,
    },
  };
}
