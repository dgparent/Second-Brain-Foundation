import { EntityManager } from '@sbf/core-entity-manager';
import { BaseAIProvider } from '@sbf/aei';
import { 
  MealEntity, 
  createMeal, 
  MealMetadata
} from '@sbf/frameworks-health-tracking';

export class NutritionService {
  constructor(
    private entityManager: EntityManager,
    private aiProvider: BaseAIProvider
  ) {}

  /**
   * Log a meal
   */
  async logMeal(
    title: string,
    mealType: MealMetadata['meal_type'],
    foods: MealMetadata['foods'],
    date: string = new Date().toISOString().split('T')[0],
    time?: string,
    notes?: string
  ): Promise<MealEntity> {
    const uid = `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const meal = createMeal({
      uid,
      title,
      meal_type: mealType,
      date,
      time,
      foods,
      notes
    });

    await this.entityManager.create(meal);
    return meal;
  }

  /**
   * Get meals for a date range
   */
  async getMeals(startDate?: string, endDate?: string): Promise<MealEntity[]> {
    const entities = await this.entityManager.getAll();
    let meals = entities.filter(e => e.type === 'health.meal') as MealEntity[];
    
    if (startDate) {
      meals = meals.filter(m => m.metadata.date >= startDate);
    }
    
    if (endDate) {
      meals = meals.filter(m => m.metadata.date <= endDate);
    }
    
    return meals.sort((a, b) => {
      const dateA = new Date(a.metadata.date + (a.metadata.time ? 'T' + a.metadata.time : ''));
      const dateB = new Date(b.metadata.date + (b.metadata.time ? 'T' + b.metadata.time : ''));
      return dateB.getTime() - dateA.getTime();
    });
  }

  /**
   * Get daily nutrition summary
   */
  async getDailySummary(date: string): Promise<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    meals: number;
  }> {
    const meals = await this.getMeals(date, date);
    
    return meals.reduce((summary, meal) => {
      return {
        calories: summary.calories + (meal.metadata.total_calories || 0),
        protein: summary.protein + (meal.metadata.total_macros?.protein || 0),
        carbs: summary.carbs + (meal.metadata.total_macros?.carbs || 0),
        fat: summary.fat + (meal.metadata.total_macros?.fat || 0),
        meals: summary.meals + 1
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      meals: 0
    });
  }
}
