export interface Profile {
  id: string;
  name: string | null;
  daily_goal_calories: number | null;
  daily_goal_protein: number | null;
  daily_goal_carbs: number | null;
  daily_goal_fat: number | null;
  created_at: string;
  updated_at: string;
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

export interface Entry {
  id: number;
  user_id: string;
  date: string;
  raw_text: string;
  parsed_data: ParsedMealData;
  created_at: string;
  updated_at: string;
}

export interface DailyNote {
  id: number;
  user_id: string;
  date: string;
  mood: string | null;
  energy: string | null;
  weight: number | null;
  note_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailySummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  entry_count: number;
  entries: Entry[];
}
