"use client";

import React from "react";
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
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  attributes,
  activeFilters,
  savedFilters,
  onFilterChange,
  onLoadSavedFilter,
}) => {
  // Group attributes by type for better organization
  const groupedAttributes = attributes.reduce((acc, attr) => {
    const group = attr.group || "Other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(attr);
    return acc;
  }, {} as Record<string, SupplierAttribute[]>);

  const renderFilterInput = (attr: SupplierAttribute) => {
    const value = activeFilters[attr.key];

    switch (attr.type) {
      case "TEXT":
      case "LONG_TEXT":
      case "RICH_TEXT":
        return (
          <input
            type="text"
            value={String(value || "")}
            onChange={(e) => onFilterChange(attr.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder={`Filter by ${attr.name}`}
          />
        );

      case "NUMBER":
      case "PRICE":
        return (
          <input
            type="number"
            value={Number(value) || ""}
            onChange={(e) =>
              onFilterChange(attr.key, Number(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder={`Filter by ${attr.name}`}
          />
        );

      case "DROPDOWN":
        if (attr.option?.selection) {
          return (
            <select
              value={String(value || "")}
              onChange={(e) => onFilterChange(attr.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All</option>
              {attr.option.selection.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="text"
            value={String(value || "")}
            onChange={(e) => onFilterChange(attr.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder={`Filter by ${attr.name}`}
          />
        );

      case "MULTI_SELECT":
        if (attr.option?.selection) {
          return (
            <select
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={(e) => {
                const selectedValues = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                onFilterChange(attr.key, selectedValues);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              size={3}
            >
              {attr.option.selection.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="text"
            value={String(value || "")}
            onChange={(e) => onFilterChange(attr.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder={`Filter by ${attr.name}`}
          />
        );

      case "DATE":
      case "DATETIME":
        return (
          <input
            type="date"
            value={String(value || "")}
            onChange={(e) => onFilterChange(attr.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        );

      case "URL":
        return (
          <input
            type="url"
            value={String(value || "")}
            onChange={(e) => onFilterChange(attr.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder={`Filter by ${attr.name}`}
          />
        );

      default:
        return (
          <input
            type="text"
            value={String(value || "")}
            onChange={(e) => onFilterChange(attr.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder={`Filter by ${attr.name}`}
          />
        );
    }
  };

  return (
    <div className="mb-6 bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Advanced Filters
        </h2>
        <span className="text-sm text-gray-500">
          {Object.keys(activeFilters).length} active filters
        </span>
      </div>

      {/* Filter Groups */}
      <div className="space-y-6">
        {Object.entries(groupedAttributes).map(([groupName, groupAttrs]) => (
          <div key={groupName} className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-md font-medium text-gray-800 mb-3">
              {groupName}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupAttrs.slice(0, 6).map((attr) => (
                <div key={attr.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {attr.name}
                    {attr.option?.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {renderFilterInput(attr)}
                  {attr.description && (
                    <p className="text-xs text-gray-500">{attr.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-md font-medium text-gray-800 mb-3">
            Saved Filters
          </h3>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onLoadSavedFilter(filter)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                title={`Created: ${new Date(
                  filter.createdAt
                ).toLocaleDateString()}`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
