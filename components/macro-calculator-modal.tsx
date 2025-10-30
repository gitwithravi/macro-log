"use client";

import { useState } from "react";

interface MacroCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalculate: (macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
}

export function MacroCalculatorModal({
  isOpen,
  onClose,
  onCalculate,
}: MacroCalculatorModalProps) {
  const [formData, setFormData] = useState({
    gender: "male",
    height: "",
    weight: "",
    targetWeight: "",
    targetDate: "",
    age: "",
    activityLevel: "moderate",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    explanation: string;
    weeklyWeightChangeGoal?: number;
    estimatedTimeframe?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Validate required fields
      if (!formData.height || !formData.weight || !formData.targetWeight || !formData.targetDate) {
        throw new Error("Please fill in all required fields");
      }

      const response = await fetch("/api/calculate-macros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: formData.gender,
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          targetWeight: parseFloat(formData.targetWeight),
          targetDate: formData.targetDate,
          age: formData.age ? parseInt(formData.age) : undefined,
          activityLevel: formData.activityLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to calculate macros");
      }

      setResult({
        explanation: data.explanation,
        weeklyWeightChangeGoal: data.weeklyWeightChangeGoal,
        estimatedTimeframe: data.estimatedTimeframe,
      });

      // Pass calculated macros to parent
      onCalculate(data.macros);
    } catch (err: any) {
      setError(err.message || "Failed to calculate macros");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      gender: "male",
      height: "",
      weight: "",
      targetWeight: "",
      targetDate: "",
      age: "",
      activityLevel: "moderate",
    });
    setError(null);
    setResult(null);
    onClose();
  };

  // Get minimum date (7 days from now)
  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Calculate Macro Goals
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 rounded-lg">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                Macros Calculated Successfully!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                {result.explanation}
              </p>
              {result.weeklyWeightChangeGoal && (
                <p className="text-sm text-green-700 dark:text-green-300">
                  Target: {Math.abs(result.weeklyWeightChangeGoal).toFixed(2)} kg per week
                </p>
              )}
              {result.estimatedTimeframe && (
                <p className="text-sm text-green-700 dark:text-green-300">
                  {result.estimatedTimeframe}
                </p>
              )}
              <button
                onClick={handleClose}
                className="mt-3 text-sm font-semibold text-green-800 dark:text-green-200 underline"
              >
                Close and use these goals
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter your details to get AI-powered personalized macro goals based on your
              fitness objectives.
            </p>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Male</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Female</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age (years)
                </label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="25"
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Height (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="170"
                />
              </div>

              {/* Current Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="70.5"
                />
              </div>

              {/* Target Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  value={formData.targetWeight}
                  onChange={(e) =>
                    setFormData({ ...formData, targetWeight: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="65.0"
                />
              </div>
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={getMinDate()}
                value={formData.targetDate}
                onChange={(e) =>
                  setFormData({ ...formData, targetDate: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Must be at least 7 days in the future
              </p>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Activity Level
              </label>
              <select
                value={formData.activityLevel}
                onChange={(e) =>
                  setFormData({ ...formData, activityLevel: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="sedentary">Sedentary (little to no exercise)</option>
                <option value="light">Light (exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                <option value="active">Active (exercise 6-7 days/week)</option>
                <option value="very_active">Very Active (intense exercise daily)</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Calculating..." : "Calculate Macros"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
