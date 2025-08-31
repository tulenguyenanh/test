"use client";

import React, { useState } from "react";
import { ColumnConfig } from "./Product";

interface ColumnManagerProps {
  columns: ColumnConfig[];
  onToggleColumn: (key: string) => void;
}

export const ColumnManager: React.FC<ColumnManagerProps> = ({
  columns,
  onToggleColumn,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter columns based on search term
  const filteredColumns = columns.filter(
    (col) =>
      col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group columns by category for better organization
  const coreColumns = filteredColumns.filter((col) =>
    ["id", "skuId", "name", "brand", "createdAt", "updatedAt"].includes(col.key)
  );

  const attributeColumns = filteredColumns.filter(
    (col) =>
      !["id", "skuId", "name", "brand", "createdAt", "updatedAt"].includes(
        col.key
      )
  );

  const visibleCount = columns.filter((col) => col.visible).length;
  const totalCount = columns.length;

  return (
    <div className="mb-6 bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Manage Columns
          </h2>
          <p className="text-sm text-gray-600">
            {visibleCount} of {totalCount} columns visible
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => columns.forEach((col) => onToggleColumn(col.key))}
            className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 text-sm"
          >
            Show All
          </button>

          <button
            onClick={() => {
              // Hide all except core columns
              columns.forEach((col) => {
                if (
                  !["id", "skuId", "name", "brand"].includes(col.key) &&
                  col.visible
                ) {
                  onToggleColumn(col.key);
                }
              });
            }}
            className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            Reset to Default
          </button>
        </div>
      </div>

      {/* Search for columns */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search columns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Core Columns */}
      {coreColumns.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-800 mb-3">
            Core Columns
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {coreColumns.map((col) => (
              <label
                key={col.key}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={col.visible}
                  onChange={() => onToggleColumn(col.key)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 block truncate">
                    {col.name}
                  </span>
                  <span className="text-xs text-gray-500 block truncate">
                    {col.key}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Attribute Columns */}
      {attributeColumns.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-gray-800 mb-3">
            Attribute Columns ({attributeColumns.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {attributeColumns.map((col) => (
              <label
                key={col.key}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={col.visible}
                  onChange={() => onToggleColumn(col.key)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 block truncate">
                    {col.name}
                  </span>
                  <span className="text-xs text-gray-500 block truncate">
                    {col.key}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {filteredColumns.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          <p>No columns found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};
