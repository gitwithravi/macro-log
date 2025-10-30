"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Entry, Profile } from "@/lib/types/database";
import { MealInput } from "@/components/meal-input";
import { EntryCard } from "@/components/entry-card";
import { DailySummary } from "@/components/daily-summary";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingEntries, setFetchingEntries] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchProfile();
    fetchEntries();
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch("/api/profile", { headers });
      const data = await response.json();
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchEntries = async () => {
    try {
      setFetchingEntries(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/entries?date=${today}`, { headers });
      const data = await response.json();
      if (data.entries) {
        setEntries(data.entries);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setFetchingEntries(false);
    }
  };

  const handleMealSubmit = async (text: string) => {
    setLoading(true);
    setError(null);

    try {
      // Get the access token from the current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };

      // First, parse the meal using OpenAI
      const parseResponse = await fetch("/api/parse", {
        method: "POST",
        headers,
        body: JSON.stringify({ text }),
      });

      if (!parseResponse.ok) {
        throw new Error("Failed to parse meal");
      }

      const parsedData = await parseResponse.json();

      // Then, save the entry
      const entryResponse = await fetch("/api/entries", {
        method: "POST",
        headers,
        body: JSON.stringify({
          date: today,
          raw_text: text,
          parsed_data: parsedData,
        }),
      });

      if (!entryResponse.ok) {
        throw new Error("Failed to save entry");
      }

      const { entry } = await entryResponse.json();

      // Add the new entry to the list
      setEntries([entry, ...entries]);
    } catch (error: any) {
      setError(error.message || "Failed to add meal");
      console.error("Error adding meal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await fetch(`/api/entries?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete entry");
      }

      setEntries(entries.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pb-[120px] lg:pb-8">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Macro Journal
            </h1>
            <div className="flex gap-4">
              <Link
                href="/history"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                History
              </Link>
              <Link
                href="/profile"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mobile: Summary First, Desktop: Right Column */}
          <div className="lg:col-span-1 lg:order-2">
            <DailySummary entries={entries} profile={profile} />
          </div>

          {/* Mobile: Entries Second, Desktop: Left Column */}
          <div className="lg:col-span-2 lg:order-1 space-y-6">
            {/* Entries List */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Today's Meals
              </h2>
              {fetchingEntries ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : entries.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">
                    No meals logged today. Add your first meal below!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      onDelete={handleDeleteEntry}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Meal Input - Fixed at bottom on mobile, inline on desktop */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-50">
        <div className="max-w-7xl mx-auto px-3 py-3">
          <MealInput onSubmit={handleMealSubmit} loading={loading} />
          {error && (
            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg text-xs">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Meal Input - Shown only on large screens */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Log a Meal
          </h2>
          <MealInput onSubmit={handleMealSubmit} loading={loading} />
          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
