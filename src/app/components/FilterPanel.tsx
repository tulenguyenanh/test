"use client";

import React, { useState } from "react";
import { SupplierAttribute } from "@/app/types/attribute";
import { FilterState, SavedFilter } from "./Product";

interface FilterPanelProps {
  attributes: SupplierAttribute[];
  activeFilters: FilterState;
  savedFilters: SavedFilter[];
  onFilterChange: (
    key: string,
    value: string | number | boolean | string[]
  ) => void;
  onLoadSavedFilter: (filter: SavedFilter) => void;
  onClearAllFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  attributes,
  activeFilters,
  savedFilters,
  onFilterChange,
  onLoadSavedFilter,
  onClearAllFilters,
}) => {
  const [dateRange, setDateRange] = useState<string | number>("");

  // Practical filters based on common product attributes
  const practicalFilters = [
    {
      key: "brand",
      label: "Brand",
      type: "text",
      placeholder: "Filter by brand (e.g., Apple, Samsung)",
      testId: "brand-filter",
    },
    {
      key: "_basicInfoProductNameColor",
      label: "Color",
      type: "text",
      placeholder: "Filter by color (e.g., Black, White, Blue)",
      testId: "color-filter",
    },
    {
      key: "_basicInfoGeneralCategory",
      label: "Product Category",
      type: "text",
      placeholder: "Filter by category path",
      testId: "category-filter",
    },
  ];

  // Handle date range filter
  const handleDateRangeChange = (
    type: "created_date" | "updated_date",
    value: string | number
  ) => {
    setDateRange(value);

    if (type === "created_date") {
      onFilterChange("createdAt", new Date(value).getTime());
    } else {
      onFilterChange("createdAt", "");
    }
  };

  const renderFilterInput = (filter: (typeof practicalFilters)[0]) => {
    const value = activeFilters[filter.key];

    switch (filter.type) {
      case "text":
        return (
          <input
            data-testid={filter.testId}
            type="text"
            value={String(value || "")}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder={filter.placeholder}
          />
        );

      default:
        return (
          <input
            data-testid={filter.testId}
            type="text"
            value={String(value || "")}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder={filter.placeholder}
          />
        );
    }
  };

  const activeFilterCount = Object.keys(activeFilters).filter(
    (key) => activeFilters[key] && activeFilters[key] !== ""
  ).length;

  return (
    <div
      data-testid="filter-panel"
      className="mb-6 bg-white rounded-lg shadow p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Product Filters
          </h2>
          <p className="text-sm text-gray-600">
            {activeFilterCount} active filter
            {activeFilterCount !== 1 ? "s" : ""}
          </p>
        </div>

        {activeFilterCount > 0 && (
          <button
            data-testid="clear-all-filters"
            onClick={onClearAllFilters}
            className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Main Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {practicalFilters.map((filter) => (
          <div key={filter.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            {renderFilterInput(filter)}
          </div>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-md font-medium text-gray-800 mb-4">
          Advanced Filters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Date Range */}
          <div className="space-y-2 col-span-full md:col-span-1 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700">
              Created Date
            </label>
            <div className="flex space-x-2">
              <input
                data-testid="date-filter"
                type="date"
                value={dateRange}
                onChange={(e) =>
                  handleDateRangeChange("created_date", e.target.value)
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="border-t border-gray-200 pt-4 mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Active Filters:
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters)
              .filter(([, value]) => value && value !== "")
              .map(([key, value]) => {
                const filterLabel =
                  practicalFilters.find((f) => f.key === key)?.label || key;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {filterLabel}: {String(value)}
                    <button
                      onClick={() => onFilterChange(key, "")}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
          </div>
        </div>
      )}

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-md font-medium text-gray-800 mb-3">
            Saved Filters
          </h3>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((filter) => (
              <button
                key={filter.id}
                data-testid={`saved-filter-${filter.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                onClick={() => onLoadSavedFilter(filter)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                title={`Created: ${new Date(
                  filter.createdAt
                ).toLocaleDateString()}`}
              >
                📁 {filter.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
