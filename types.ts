
export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other'
}

export enum Goal {
  LoseWeight = 'Lose Weight',
  Maintain = 'Maintain',
  GainMuscle = 'Gain Muscle'
}

export type Language = 'ar' | 'en';

export enum MealType {
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  Snack = 'Snack'
}

export enum EntrySource {
  Camera = 'Camera',
  Manual = 'Manual'
}

export interface UserProfile {
  name: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  gender: Gender;
  goal: Goal;
  tdee: number; // Total Daily Energy Expenditure
  language?: Language;
}

export interface MacroNutrients {
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
}

export interface FoodItem {
  name: string;
  calories: number;
  weight: string; // e.g., "150g"
  macros: MacroNutrients;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  imageUrl?: string; // Base64 string for display
  foodItems: FoodItem[];
  totalCalories: number;
  totalMacros: MacroNutrients;
  healthRating: 'Healthy' | 'Moderate' | 'Unhealthy';
  suggestions: string;
  mealType: MealType;
  source: EntrySource;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
}

export interface MeasurementsEntry {
  id: string;
  date: string; // YYYY-MM-DD
  waistCm: number;
  hipCm: number;
  chestCm?: number;
  neckCm?: number;
  thighCm?: number;
  armCm?: number;
}

export type ViewState = 'PROFILE_SETUP' | 'DASHBOARD' | 'CAMERA' | 'ANALYSIS_RESULT' | 'MANUAL_ENTRY' | 'HISTORY' | 'CALENDAR' | 'ANALYTICS' | 'BODY';
