"use client";

import React from "react";
import { FilterState } from "./Product";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeFilters: FilterState;
  onClearFilters: () => void;
  onSaveFilter: () => void;
  onShareUrl: () => string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  activeFilters,
  onClearFilters,
  onSaveFilter,
  onShareUrl,
}) => {
  const handleShare = async () => {
    const url = onShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      // Show success feedback
      const event = new CustomEvent("show-toast", {
        detail: { message: "URL copied to clipboard!", type: "success" },
      });
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <div className="mb-6 bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              data-testid="search-input"
              type="text"
              placeholder="Search products by name, brand, or any attribute..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {Object.keys(activeFilters).length > 0 && (
            <button
              data-testid="clear-filters-button"
              onClick={onClearFilters}
              className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Clear All Filters ({Object.keys(activeFilters).length})
            </button>
          )}

          <button
            data-testid="save-filter-button"
            onClick={onSaveFilter}
            disabled={Object.keys(activeFilters).length === 0 && !searchTerm}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Save Filter
          </button>

          <button
            data-testid="share-url-button"
            onClick={handleShare}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Share URL
          </button>
        </div>
      </div>

      {/* Active filters display */}
      {Object.keys(activeFilters).length > 0 && (
        <div data-testid="filter-tags" className="mt-4 flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => (
            <>
              {value && (
                <span
                  key={key}
                  data-testid="filter-tag"
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {key}: {String(value)}
                  <button
                    onClick={() => onClearFilters()}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </>
          ))}
        </div>
      )}
    </div>
  );
};
