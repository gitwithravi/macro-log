"use client";

import { useEffect, useState } from "react";
import { Entry } from "@/lib/types/database";
import { EntryCard } from "@/components/entry-card";
import Link from "next/link";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface DaySummary {
  date: string;
  entries: Entry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (menuOpen && !target.closest('.menu-container')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      // Fetch last 7 days of data
      const endDate = new Date();
      const startDate = subDays(endDate, 6); // Last 7 days including today

      const url = `/api/entries?startDate=${format(startDate, "yyyy-MM-dd")}&endDate=${format(endDate, "yyyy-MM-dd")}`;

      // Get the access token from the current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(url, { headers });
      const data = await response.json();
      if (data.entries) {
        setEntries(data.entries);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      // Get the access token from the current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/entries?id=${id}`, {
        method: "DELETE",
        headers,
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

  const toggleDayExpanded = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const groupEntriesByDate = (): DaySummary[] => {
    const grouped: { [key: string]: Entry[] } = {};

    entries.forEach((entry) => {
      const date = entry.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(entry);
    });

    return Object.entries(grouped)
      .map(([date, dayEntries]) => {
        const totals = dayEntries.reduce(
          (acc, entry) => ({
            totalCalories: acc.totalCalories + (entry.parsed_data.calories || 0),
            totalProtein: acc.totalProtein + (entry.parsed_data.protein || 0),
            totalCarbs: acc.totalCarbs + (entry.parsed_data.carbs || 0),
            totalFat: acc.totalFat + (entry.parsed_data.fat || 0),
          }),
          { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
        );

        return {
          date,
          entries: dayEntries,
          ...totals,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  const daySummaries = groupEntriesByDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="h-6">
              <Image
                src="/images/logo.png"
                alt="Macro Log"
                width={144}
                height={32}
                className="h-6 w-auto dark:invert"
                priority
              />
            </div>

            {/* Hamburger Menu Button */}
            <div className="menu-container relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                aria-label="Menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {menuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 py-2 w-48 z-50">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Last 7 Days
        </h2>

        {/* Entries */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : daySummaries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
              No entries found for the last 7 days.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {daySummaries.map((daySummary) => {
              const isExpanded = expandedDays.has(daySummary.date);
              return (
                <div key={daySummary.date} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Day Header - Clickable */}
                  <button
                    onClick={() => toggleDayExpanded(daySummary.date)}
                    className="w-full p-4 sm:p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                  >
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {format(new Date(daySummary.date), "dd/MM/yyyy")}
                      </h3>
                      <svg
                        className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* 4 Macro Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                      {/* Calories Card */}
                      <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-3 sm:p-4 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium mb-1">
                          Calories
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-100">
                          {Math.round(daySummary.totalCalories)}
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400">
                          kcal
                        </div>
                      </div>

                      {/* Protein Card */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                          Protein
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">
                          {Math.round(daySummary.totalProtein)}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          grams
                        </div>
                      </div>

                      {/* Carbs Card */}
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-3 sm:p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 font-medium mb-1">
                          Carbs
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                          {Math.round(daySummary.totalCarbs)}
                        </div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-400">
                          grams
                        </div>
                      </div>

                      {/* Fat Card */}
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                          Fat
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">
                          {Math.round(daySummary.totalFat)}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          grams
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expandable Entries Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                        Meal Details
                      </h4>
                      <div className="space-y-3 sm:space-y-4">
                        {daySummary.entries.map((entry) => (
                          <EntryCard
                            key={entry.id}
                            entry={entry}
                            onDelete={handleDeleteEntry}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
