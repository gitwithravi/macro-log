"use client";

import { useEffect, useState } from "react";
import { Profile } from "@/lib/types/database";
import Link from "next/link";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    daily_goal_calories: "",
    daily_goal_protein: "",
    daily_goal_carbs: "",
    daily_goal_fat: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      if (data.profile) {
        setProfile(data.profile);
        setFormData({
          name: data.profile.name || "",
          daily_goal_calories: data.profile.daily_goal_calories?.toString() || "",
          daily_goal_protein: data.profile.daily_goal_protein?.toString() || "",
          daily_goal_carbs: data.profile.daily_goal_carbs?.toString() || "",
          daily_goal_fat: data.profile.daily_goal_fat?.toString() || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name || null,
          daily_goal_calories: formData.daily_goal_calories
            ? parseInt(formData.daily_goal_calories)
            : null,
          daily_goal_protein: formData.daily_goal_protein
            ? parseInt(formData.daily_goal_protein)
            : null,
          daily_goal_carbs: formData.daily_goal_carbs
            ? parseInt(formData.daily_goal_carbs)
            : null,
          daily_goal_fat: formData.daily_goal_fat
            ? parseInt(formData.daily_goal_fat)
            : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setProfile(data.profile);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Profile Settings
            </h1>
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/history"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                History
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Personal Information & Goals
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your name"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Daily Macro Goals
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Set your daily nutrition targets. Leave blank to use defaults.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Calories */}
                <div>
                  <label
                    htmlFor="calories"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Calories
                  </label>
                  <input
                    id="calories"
                    type="number"
                    min="0"
                    value={formData.daily_goal_calories}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        daily_goal_calories: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="2000"
                  />
                </div>

                {/* Protein */}
                <div>
                  <label
                    htmlFor="protein"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Protein (g)
                  </label>
                  <input
                    id="protein"
                    type="number"
                    min="0"
                    value={formData.daily_goal_protein}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        daily_goal_protein: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="150"
                  />
                </div>

                {/* Carbs */}
                <div>
                  <label
                    htmlFor="carbs"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Carbs (g)
                  </label>
                  <input
                    id="carbs"
                    type="number"
                    min="0"
                    value={formData.daily_goal_carbs}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        daily_goal_carbs: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="200"
                  />
                </div>

                {/* Fat */}
                <div>
                  <label
                    htmlFor="fat"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Fat (g)
                  </label>
                  <input
                    id="fat"
                    type="number"
                    min="0"
                    value={formData.daily_goal_fat}
                    onChange={(e) =>
                      setFormData({ ...formData, daily_goal_fat: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="65"
                  />
                </div>
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 border border-green-400 dark:border-green-700"
                    : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 border border-red-400 dark:border-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
