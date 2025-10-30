"use client";

import { useState } from "react";

interface MealInputProps {
  onSubmit: (text: string) => Promise<void>;
  loading: boolean;
}

export function MealInput({ onSubmit, loading }: MealInputProps) {
  const [mealText, setMealText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealText.trim() || loading) return;

    await onSubmit(mealText);
    setMealText("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="meal-input"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Log your meal
        </label>
        <textarea
          id="meal-input"
          value={mealText}
          onChange={(e) => setMealText(e.target.value)}
          placeholder="e.g., Lunch: 2 eggs, 1 roti, 1 tsp ghee, 1 cup dal"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={!mealText.trim() || loading}
        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Analyzing..." : "Add Meal"}
      </button>
    </form>
  );
}
