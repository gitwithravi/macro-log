/**
 * Nutrition Data Validator - Validates AI-generated nutrition data
 * Ensures data is reasonable and not fabricated by prompt injection
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ParsedMealData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: FoodItem[];
}

// Reasonable ranges for nutrition values
const LIMITS = {
  // Total per entry limits (single meal/snack)
  MAX_CALORIES: 5000,
  MAX_PROTEIN: 500, // grams
  MAX_CARBS: 800, // grams
  MAX_FAT: 300, // grams

  // Per-item limits
  MAX_ITEM_CALORIES: 3000,
  MAX_ITEM_PROTEIN: 200,
  MAX_ITEM_CARBS: 400,
  MAX_ITEM_FAT: 150,

  // Minimum thresholds (to catch all-zero responses)
  MIN_TOTAL_CALORIES: 1,

  // Calorie calculation tolerance
  CALORIE_TOLERANCE: 100,

  // Macro ratio limits (percentage of total calories)
  MIN_MACRO_RATIO: 0, // 0% minimum
  MAX_MACRO_RATIO: 0.9, // 90% maximum (allows very high protein/carb/fat meals)

  // Maximum items in a single entry
  MAX_ITEMS: 50,
};

/**
 * Validates that nutrition data falls within reasonable ranges
 * and hasn't been manipulated by prompt injection
 */
export function validateNutritionData(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Type validation
  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format: expected object');
    return { valid: false, errors, warnings };
  }

  // Check for required fields
  const requiredFields = ['calories', 'protein', 'carbs', 'fat', 'items'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  const { calories, protein, carbs, fat, items } = data as ParsedMealData;

  // Validate that macros are numbers
  if (typeof calories !== 'number' || isNaN(calories)) {
    errors.push('Calories must be a valid number');
  }
  if (typeof protein !== 'number' || isNaN(protein)) {
    errors.push('Protein must be a valid number');
  }
  if (typeof carbs !== 'number' || isNaN(carbs)) {
    errors.push('Carbs must be a valid number');
  }
  if (typeof fat !== 'number' || isNaN(fat)) {
    errors.push('Fat must be a valid number');
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // Validate items array
  if (!Array.isArray(items)) {
    errors.push('Items must be an array');
    return { valid: false, errors, warnings };
  }

  if (items.length === 0) {
    errors.push('At least one food item is required');
    return { valid: false, errors, warnings };
  }

  if (items.length > LIMITS.MAX_ITEMS) {
    errors.push(`Too many items (max ${LIMITS.MAX_ITEMS})`);
    return { valid: false, errors, warnings };
  }

  // Range validation for totals
  if (calories < LIMITS.MIN_TOTAL_CALORIES) {
    errors.push('Calories too low (minimum 1)');
  }
  if (calories > LIMITS.MAX_CALORIES) {
    errors.push(`Calories too high (max ${LIMITS.MAX_CALORIES})`);
  }
  if (protein < 0 || protein > LIMITS.MAX_PROTEIN) {
    errors.push(`Protein out of range (0-${LIMITS.MAX_PROTEIN}g)`);
  }
  if (carbs < 0 || carbs > LIMITS.MAX_CARBS) {
    errors.push(`Carbs out of range (0-${LIMITS.MAX_CARBS}g)`);
  }
  if (fat < 0 || fat > LIMITS.MAX_FAT) {
    errors.push(`Fat out of range (0-${LIMITS.MAX_FAT}g)`);
  }

  // Validate calorie calculation
  // Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
  const expectedCalories = (protein * 4) + (carbs * 4) + (fat * 9);
  const calorieDiff = Math.abs(calories - expectedCalories);

  if (calorieDiff > LIMITS.CALORIE_TOLERANCE) {
    warnings.push(
      `Calorie calculation mismatch: ${calories} cal vs expected ${Math.round(expectedCalories)} cal`
    );
  }

  // Validate macro ratios (detect unrealistic distributions)
  if (calories > 0) {
    const proteinCalories = protein * 4;
    const carbCalories = carbs * 4;
    const fatCalories = fat * 9;
    const totalMacroCalories = proteinCalories + carbCalories + fatCalories;

    if (totalMacroCalories > 0) {
      const proteinRatio = proteinCalories / totalMacroCalories;
      const carbRatio = carbCalories / totalMacroCalories;
      const fatRatio = fatCalories / totalMacroCalories;

      // Check if any macro dominates unrealistically (> 90%)
      if (proteinRatio > LIMITS.MAX_MACRO_RATIO) {
        warnings.push(`Protein ratio very high (${Math.round(proteinRatio * 100)}%)`);
      }
      if (carbRatio > LIMITS.MAX_MACRO_RATIO) {
        warnings.push(`Carb ratio very high (${Math.round(carbRatio * 100)}%)`);
      }
      if (fatRatio > LIMITS.MAX_MACRO_RATIO) {
        warnings.push(`Fat ratio very high (${Math.round(fatRatio * 100)}%)`);
      }
    }
  }

  // Validate each item
  let itemIndex = 0;
  for (const item of items) {
    itemIndex++;

    // Check item structure
    if (!item || typeof item !== 'object') {
      errors.push(`Item ${itemIndex}: invalid format`);
      continue;
    }

    const { name, calories: itemCal, protein: itemProt, carbs: itemCarbs, fat: itemFat } = item;

    // Validate name
    if (!name || typeof name !== 'string') {
      errors.push(`Item ${itemIndex}: missing or invalid name`);
      continue;
    }

    // Check for suspicious names (potential injection artifacts)
    if (name.length > 100) {
      errors.push(`Item ${itemIndex}: name too long`);
    }

    // Check for code-like patterns in name
    if (/<|>|script|function|{|}|\[|\]/.test(name)) {
      errors.push(`Item ${itemIndex}: name contains invalid characters`);
    }

    // Validate item macros
    if (typeof itemCal !== 'number' || isNaN(itemCal)) {
      errors.push(`Item ${itemIndex}: invalid calories`);
    } else if (itemCal < 0 || itemCal > LIMITS.MAX_ITEM_CALORIES) {
      errors.push(`Item ${itemIndex}: calories out of range (0-${LIMITS.MAX_ITEM_CALORIES})`);
    }

    if (typeof itemProt !== 'number' || isNaN(itemProt)) {
      errors.push(`Item ${itemIndex}: invalid protein`);
    } else if (itemProt < 0 || itemProt > LIMITS.MAX_ITEM_PROTEIN) {
      errors.push(`Item ${itemIndex}: protein out of range (0-${LIMITS.MAX_ITEM_PROTEIN}g)`);
    }

    if (typeof itemCarbs !== 'number' || isNaN(itemCarbs)) {
      errors.push(`Item ${itemIndex}: invalid carbs`);
    } else if (itemCarbs < 0 || itemCarbs > LIMITS.MAX_ITEM_CARBS) {
      errors.push(`Item ${itemIndex}: carbs out of range (0-${LIMITS.MAX_ITEM_CARBS}g)`);
    }

    if (typeof itemFat !== 'number' || isNaN(itemFat)) {
      errors.push(`Item ${itemIndex}: invalid fat`);
    } else if (itemFat < 0 || itemFat > LIMITS.MAX_ITEM_FAT) {
      errors.push(`Item ${itemIndex}: fat out of range (0-${LIMITS.MAX_ITEM_FAT}g)`);
    }

    // Check if item has all zeros (suspicious)
    if (itemCal === 0 && itemProt === 0 && itemCarbs === 0 && itemFat === 0) {
      warnings.push(`Item ${itemIndex} (${name}): all macros are zero`);
    }

    // Validate item calorie calculation
    const expectedItemCal = (itemProt * 4) + (itemCarbs * 4) + (itemFat * 9);
    const itemCalDiff = Math.abs(itemCal - expectedItemCal);
    if (itemCalDiff > LIMITS.CALORIE_TOLERANCE / 2) {
      warnings.push(
        `Item ${itemIndex} (${name}): calorie mismatch (${itemCal} vs expected ${Math.round(expectedItemCal)})`
      );
    }
  }

  // Check if sum of items roughly equals totals
  const sumCalories = items.reduce((sum, item) => sum + (item.calories || 0), 0);
  const sumProtein = items.reduce((sum, item) => sum + (item.protein || 0), 0);
  const sumCarbs = items.reduce((sum, item) => sum + (item.carbs || 0), 0);
  const sumFat = items.reduce((sum, item) => sum + (item.fat || 0), 0);

  if (Math.abs(sumCalories - calories) > 10) {
    warnings.push(
      `Total calories (${calories}) doesn't match sum of items (${Math.round(sumCalories)})`
    );
  }
  if (Math.abs(sumProtein - protein) > 5) {
    warnings.push(
      `Total protein (${protein}g) doesn't match sum of items (${Math.round(sumProtein)}g)`
    );
  }
  if (Math.abs(sumCarbs - carbs) > 5) {
    warnings.push(
      `Total carbs (${carbs}g) doesn't match sum of items (${Math.round(sumCarbs)}g)`
    );
  }
  if (Math.abs(sumFat - fat) > 5) {
    warnings.push(
      `Total fat (${fat}g) doesn't match sum of items (${Math.round(sumFat)}g)`
    );
  }

  // Detect suspiciously round numbers (potential injection artifacts)
  const allRound = [calories, protein, carbs, fat].every(
    (val) => val % 100 === 0 && val > 0
  );
  if (allRound && calories > 100) {
    warnings.push('All macros are round hundreds (suspicious pattern)');
  }

  // Detect repeated patterns (e.g., all values are 42)
  const uniqueValues = new Set([calories, protein, carbs, fat]);
  if (uniqueValues.size === 1 && calories > 0) {
    warnings.push('All macro values are identical (suspicious pattern)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Quick validation for basic sanity checks
 * Use this for fast pre-validation
 */
export function quickValidate(data: any): boolean {
  if (!data || typeof data !== 'object') return false;

  const { calories, protein, carbs, fat, items } = data;

  // Check all required fields exist and are numbers
  if (
    typeof calories !== 'number' ||
    typeof protein !== 'number' ||
    typeof carbs !== 'number' ||
    typeof fat !== 'number' ||
    !Array.isArray(items)
  ) {
    return false;
  }

  // Check basic ranges
  if (
    calories < 0 || calories > LIMITS.MAX_CALORIES ||
    protein < 0 || protein > LIMITS.MAX_PROTEIN ||
    carbs < 0 || carbs > LIMITS.MAX_CARBS ||
    fat < 0 || fat > LIMITS.MAX_FAT ||
    items.length === 0 || items.length > LIMITS.MAX_ITEMS
  ) {
    return false;
  }

  return true;
}
