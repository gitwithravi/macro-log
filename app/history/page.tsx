"use client";

import { useEffect, useState } from "react";
import { Entry } from "@/lib/types/database";
import { EntryCard } from "@/components/entry-card";
import Link from "next/link";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

interface DaySummary {
  date: string;
  entries: Entry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"day" | "week">("day");

  useEffect(() => {
    fetchEntries();
  }, [selectedDate, dateRange]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      let url = "/api/entries";

      if (dateRange === "day") {
        url += `?date=${selectedDate}`;
      } else {
        const start = startOfWeek(new Date(selectedDate));
        const end = endOfWeek(new Date(selectedDate));
        url += `?startDate=${format(start, "yyyy-MM-dd")}&endDate=${format(
          end,
          "yyyy-MM-dd"
        )}`;
      }

      const response = await fetch(url);
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
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              History
            </h1>
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setDateRange("day")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  dateRange === "day"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setDateRange("week")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  dateRange === "week"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Week
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={() =>
                  setSelectedDate(
                    subDays(
                      new Date(selectedDate),
                      dateRange === "week" ? 7 : 1
                    )
                      .toISOString()
                      .split("T")[0]
                  )
                }
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />

              <button
                onClick={() =>
                  setSelectedDate(new Date().toISOString().split("T")[0])
                }
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Today
              </button>
            </div>
          </div>
        </div>

        {/* Entries */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : daySummaries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No entries found for the selected {dateRange}.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {daySummaries.map((daySummary) => (
              <div key={daySummary.date} className="space-y-4">
                {/* Day Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {format(new Date(daySummary.date), "EEEE, MMMM d, yyyy")}
                    </h3>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {Math.round(daySummary.totalCalories)}
                        </span>{" "}
                        cal
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {Math.round(daySummary.totalProtein)}
                        </span>
                        g protein
                      </span>
                    </div>
                  </div>
                </div>

                {/* Entries for this day */}
                <div className="space-y-4 pl-4">
                  {daySummary.entries.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      onDelete={handleDeleteEntry}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
