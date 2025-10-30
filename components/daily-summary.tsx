"use client";

import { Entry, Profile } from "@/lib/types/database";

interface DailySummaryProps {
  entries: Entry[];
  profile: Profile | null;
}

export function DailySummary({ entries, profile }: DailySummaryProps) {
  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + (entry.parsed_data.calories || 0),
      protein: acc.protein + (entry.parsed_data.protein || 0),
      carbs: acc.carbs + (entry.parsed_data.carbs || 0),
      fat: acc.fat + (entry.parsed_data.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const goals = {
    calories: profile?.daily_goal_calories || 2000,
    protein: profile?.daily_goal_protein || 150,
    carbs: profile?.daily_goal_carbs || 200,
    fat: profile?.daily_goal_fat || 65,
  };

  const getProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Today&apos;s Summary
      </h2>

      <div className="space-y-6">
        {/* Calories */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Calories
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {Math.round(totals.calories)} / {goals.calories}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getProgress(totals.calories, goals.calories)}%` }}
            />
          </div>
        </div>

        {/* Protein */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Protein
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {Math.round(totals.protein)}g / {goals.protein}g
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getProgress(totals.protein, goals.protein)}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Carbs
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {Math.round(totals.carbs)}g / {goals.carbs}g
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-yellow-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getProgress(totals.carbs, goals.carbs)}%` }}
            />
          </div>
        </div>

        {/* Fat */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Fat
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {Math.round(totals.fat)}g / {goals.fat}g
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-orange-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getProgress(totals.fat, goals.fat)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {entries.length} meal{entries.length !== 1 ? "s" : ""} logged today
        </p>
      </div>
    </div>
  );
}
