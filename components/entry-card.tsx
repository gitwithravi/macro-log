"use client";

import { Entry } from "@/lib/types/database";

interface EntryCardProps {
  entry: Entry;
  onDelete: (id: number) => void;
}

export function EntryCard({ entry, onDelete }: EntryCardProps) {
  const { raw_text, parsed_data, created_at } = entry;
  const time = new Date(created_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <p className="text-gray-900 dark:text-white font-medium">{raw_text}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{time}</p>
        </div>
        <button
          onClick={() => onDelete(entry.id)}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-2"
          aria-label="Delete entry"
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
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Calories</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {parsed_data.calories}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Protein</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {parsed_data.protein}g
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Carbs</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {parsed_data.carbs}g
          </p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Fat</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {parsed_data.fat}g
          </p>
        </div>
      </div>

      {parsed_data.items && parsed_data.items.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Items:</p>
          <div className="space-y-1">
            {parsed_data.items.map((item, index) => (
              <div
                key={index}
                className="text-sm text-gray-700 dark:text-gray-300 flex justify-between"
              >
                <span>{item.name}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {item.calories} cal
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
