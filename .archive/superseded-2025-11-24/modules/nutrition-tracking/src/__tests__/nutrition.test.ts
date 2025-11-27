import { describe, test, expect } from '@jest/globals';
import { logMeal, setNutritionGoal, calculateDailyTotals } from '../index.js';

describe('Nutrition Tracking Module', () => {
  test('should log a meal', () => {
    const meal = logMeal({
      uid: 'meal-1',
      meal_type: 'breakfast',
      date: '2025-01-15',
      time: '07:30',
      foods: ['Oatmeal', 'Banana'],
      calories: 350,
      protein_g: 12,
      carbs_g: 65,
      fat_g: 5
    });

    expect(meal.type).toBe('health.meal');
    expect(meal.metadata.meal_type).toBe('breakfast');
    expect(meal.metadata.calories).toBe(350);
    expect(meal.metadata.foods).toHaveLength(2);
  });

  test('should set nutrition goal', () => {
    const goal = setNutritionGoal({
      uid: 'goal-1',
      goal_type: 'calorie_target',
      target_value: 2000,
      start_date: '2025-01-01'
    });

    expect(goal.type).toBe('health.nutrition_goal');
    expect(goal.metadata.target_value).toBe(2000);
    expect(goal.metadata.goal_type).toBe('calorie_target');
  });

  test('should calculate daily totals', () => {
    const meals = [
      { metadata: { calories: 350, protein_g: 12, carbs_g: 65, fat_g: 5 } },
      { metadata: { calories: 500, protein_g: 25, carbs_g: 50, fat_g: 20 } },
      { metadata: { calories: 400, protein_g: 18, carbs_g: 40, fat_g: 15 } },
    ];

    const totals = calculateDailyTotals(meals as any[]);
    expect(totals.calories).toBe(1250);
    expect(totals.protein_g).toBe(55);
    expect(totals.carbs_g).toBe(155);
    expect(totals.fat_g).toBe(40);
  });
});
