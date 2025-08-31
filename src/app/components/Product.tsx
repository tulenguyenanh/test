"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Product } from "@/app/types/product";
import { SupplierAttribute } from "@/app/types/attribute";
import { ProductQuery } from "@/app/types/query-engine/product";
import { InternalQueryResponse } from "@/app/types/query-engine/common";
import ErrorBoundary from "./ErrorBoundary";
import { ProductTable } from "./ProductTable";
import { FilterPanel } from "./FilterPanel";
import { ColumnManager } from "./ColumnManager";
import { SearchBar } from "./SearchBar";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";
import { mockAttributes } from "@/app/mockData/mock-attributes";

// Types for our UI components
export interface FilterState {
  [key: string]: string | number | boolean | string[];
}

export interface ColumnConfig {
  key: string;
  name: string;
  visible: boolean;
  width?: number;
}

export interface SavedFilter {
  id: string;
  name: string;
  filter: FilterState;
  createdAt: number;
}

const ProductDataPlatform: React.FC = () => {
  const { startMeasure, endMeasure } = usePerformanceMonitor();

  // Core data state
  const [products, setProducts] = useState<Product[]>([]);
  const [attributes, setAttributes] = useState<SupplierAttribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtering and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Table configuration
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100); // As per requirements
  const [totalItems, setTotalItems] = useState(0);

  // UI state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showSaveFilterDialog, setShowSaveFilterDialog] = useState(false);

  // Load initial data
  useEffect(() => {
    loadAttributes();
    loadProducts();
  }, []);

  // Load URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get("search");
    const filters: FilterState = {};

    for (const [key, value] of urlParams.entries()) {
      if (key.startsWith("filter_")) {
        const filterKey = key.replace("filter_", "");
        filters[filterKey] = value;
      }
    }

    if (search) setSearchTerm(search);
    if (Object.keys(filters).length > 0) setActiveFilters(filters);
  }, []);

  // Load attributes for filter configuration
  const loadAttributes = async () => {
    const measureId = startMeasure("loadAttributes");

    try {
      const response = await fetch("/api/attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error("Failed to load attributes");

      const result: InternalQueryResponse<SupplierAttribute> =
        await response.json();
      setAttributes(result.data);

      // Initialize default columns
      if (result.data.length > 0) {
        const defaultColumns: ColumnConfig[] = [
          { key: "id", name: "ID", visible: true },
          { key: "skuId", name: "SKU ID", visible: true },
          { key: "name", name: "Product Name", visible: true },
          { key: "brand", name: "Brand", visible: true },
          { key: "createdAt", name: "Created", visible: true },
          { key: "updatedAt", name: "Updated", visible: true },
        ];

        // Add attribute columns
        mockAttributes.forEach((attr) => {
          defaultColumns.push({
            key: attr.key,
            name: attr.name,
            visible: false,
          });
        });

        setColumns(defaultColumns);
      }
    } catch (err) {
      setError("Failed to load attributes: " + (err as Error).message);
    } finally {
      endMeasure(measureId);
    }
  };

  // Load products with current filters
  const loadProducts = useCallback(async () => {
    const measureId = startMeasure("loadProducts");
    setLoading(true);
    setError(null);

    try {
      const query: ProductQuery = {
        pagination: {
          offset: (currentPage - 1) * itemsPerPage,
          limit: itemsPerPage,
        },
      };

      // Add filters if any
      if (Object.keys(activeFilters).length > 0 || searchTerm) {
        query.filter = {};

        // Add search term filter (search in product name and brand)
        if (searchTerm) {
          query.filter.attributes = {
            name: { $regex: searchTerm },
          };
        }

        // Add other filters
        Object.entries(activeFilters).forEach(([key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            if (!query.filter!.attributes) {
              query.filter!.attributes = {};
            }

            if (typeof value === "string") {
              query.filter!.attributes![key] = { $regex: value };
            } else if (typeof value === "number") {
              query.filter!.attributes![key] = { $eq: value };
            } else if (Array.isArray(value)) {
              query.filter!.attributes![key] = { $in: value };
            } else {
              query.filter!.attributes![key] = { $eq: value };
            }
          }
        });
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      });

      if (!response.ok) throw new Error("Failed to load products");

      const result: InternalQueryResponse<Product> = await response.json();
      setProducts(result.data);
      setTotalItems(result.total);
    } catch (err) {
      setError("Failed to load products: " + (err as Error).message);
    } finally {
      setLoading(false);
      endMeasure(measureId);
    }
  }, [
    currentPage,
    itemsPerPage,
    activeFilters,
    searchTerm,
    startMeasure,
    endMeasure,
  ]);

  // Reload products when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [activeFilters, searchTerm]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Get attribute value from product
  const getAttributeValue = (
    product: Product,
    attributeKey: string
  ): string => {
    const attr = product.attributes.find((a) => a.key === attributeKey);
    if (!attr || attr.value === null || attr.value === undefined) return "";

    if (typeof attr.value === "object" && !Array.isArray(attr.value)) {
      return JSON.stringify(attr.value);
    }

    if (Array.isArray(attr.value)) {
      return attr.value.join(", ");
    }

    return String(attr.value);
  };

  // Handle filter changes
  const handleFilterChange = (
    key: string,
    value: string | number | boolean | string[]
  ) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm("");
  };

  // Save current filter
  const saveCurrentFilter = (name: string) => {
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      filter: { ...activeFilters, searchTerm },
      createdAt: Date.now(),
    };

    setSavedFilters((prev) => [...prev, newFilter]);
    setShowSaveFilterDialog(false);
  };

  // Load saved filter
  const loadSavedFilter = (filter: SavedFilter) => {
    setActiveFilters(filter.filter);
    if (filter.filter.searchTerm) {
      setSearchTerm(String(filter.filter.searchTerm));
    }
  };

  // Column management
  const toggleColumnVisibility = (key: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Visible columns for rendering
  const visibleColumns = useMemo(
    () => columns.filter((col) => col.visible),
    [columns]
  );

  // Pagination helpers
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate shareable URL
  const generateShareableUrl = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    Object.entries(activeFilters).forEach(([key, value]) => {
      params.set(`filter_${key}`, String(value));
    });
    return `${window.location.origin}${
      window.location.pathname
    }?${params.toString()}`;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Trustana Product Platform
                </h1>
                <p className="text-sm text-gray-600">
                  Manage and explore your product data
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showFilterPanel ? "Hide Filters" : "Show Filters"}
                </button>

                <button
                  onClick={() => setShowColumnManager(!showColumnManager)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Manage Columns
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            activeFilters={activeFilters}
            onClearFilters={clearAllFilters}
            onSaveFilter={() => setShowSaveFilterDialog(true)}
            onShareUrl={generateShareableUrl}
          />

          {/* Filter Panel */}
          {showFilterPanel && (
            <FilterPanel
              attributes={attributes}
              activeFilters={activeFilters}
              savedFilters={savedFilters}
              onFilterChange={handleFilterChange}
              onLoadSavedFilter={loadSavedFilter}
            />
          )}

          {/* Column Manager */}
          {showColumnManager && (
            <ColumnManager
              columns={columns}
              onToggleColumn={toggleColumnVisibility}
            />
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Products Table */}
          <ProductTable
            products={products}
            visibleColumns={visibleColumns}
            selectedProducts={selectedProducts}
            loading={loading}
            totalItems={totalItems}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onSelectionChange={setSelectedProducts}
            onPageChange={setCurrentPage}
            getAttributeValue={getAttributeValue}
          />
        </div>

        {/* Save Filter Dialog */}
        {showSaveFilterDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Save Current Filter
              </h3>
              <input
                type="text"
                placeholder="Filter name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    saveCurrentFilter((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowSaveFilterDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const input = document.querySelector(
                      'input[placeholder="Filter name..."]'
                    ) as HTMLInputElement;
                    if (input?.value) {
                      saveCurrentFilter(input.value);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ProductDataPlatform;
