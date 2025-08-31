"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Filter,
  Eye,
  EyeOff,
  Download,
  Share2,
  Save,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import useProducts from "../hooks/useProduct";
import { Product } from "@/app/types/product";
import { formatDate } from "@/app/utils/date";
import TablePagination from "@/app/components/TablePagination";

const renderArrayPreview = (arr: string[], limit = 3): string => {
  if (!arr || arr.length === 0) return "";
  const preview = arr.slice(0, limit).join(", ");
  const remaining = arr.length - limit;
  return remaining > 0 ? `${preview} ... +${remaining}` : preview;
};

// Types and Enums (would typically be in separate files)
enum ProductStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISCONTINUED = "discontinued",
}

enum ProductCategory {
  ELECTRONICS = "electronics",
  CLOTHING = "clothing",
  HOME = "home",
  SPORTS = "sports",
  BOOKS = "books",
}

interface FilterConfig {
  id: string;
  name: string;
  filters: {
    search?: string;
    category?: ProductCategory[];
    status?: ProductStatus[];
    priceRange?: { min: number; max: number };
    stockRange?: { min: number; max: number };
    ratingRange?: { min: number; max: number };
  };
  columns: string[];
  sortBy?: { field: string; direction: "asc" | "desc" };
  createdBy: string;
  isPublic: boolean;
}

// Mock API functions
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Bluetooth Headphones",
    category: ProductCategory.ELECTRONICS,
    price: 99.99,
    stock: 150,
    status: ProductStatus.ACTIVE,
    description: "High-quality wireless headphones with noise cancellation",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-02-20T14:45:00Z",
    supplier: "TechCorp",
    sku: "WBH-001",
    rating: 4.5,
  },
  {
    id: "2",
    name: "Cotton T-Shirt",
    category: ProductCategory.CLOTHING,
    price: 24.99,
    stock: 200,
    status: ProductStatus.ACTIVE,
    description: "Comfortable 100% cotton t-shirt",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-02-15T11:30:00Z",
    supplier: "FashionHub",
    sku: "CTS-002",
    rating: 4.2,
  },
  {
    id: "3",
    name: "Smart Home Speaker",
    category: ProductCategory.ELECTRONICS,
    price: 149.99,
    stock: 75,
    status: ProductStatus.ACTIVE,
    description: "Voice-controlled smart speaker with AI assistant",
    createdAt: "2024-01-20T16:20:00Z",
    updatedAt: "2024-02-25T10:15:00Z",
    supplier: "SmartTech",
    sku: "SHS-003",
    rating: 4.7,
  },
  {
    id: "4",
    name: "Vintage Lamp",
    category: ProductCategory.HOME,
    price: 79.99,
    stock: 25,
    status: ProductStatus.DISCONTINUED,
    description: "Classic vintage-style table lamp",
    createdAt: "2023-12-05T12:00:00Z",
    updatedAt: "2024-01-30T09:45:00Z",
    supplier: "HomeDecor Inc",
    sku: "VL-004",
    rating: 3.8,
  },
  {
    id: "5",
    name: "Running Shoes",
    category: ProductCategory.SPORTS,
    price: 129.99,
    stock: 0,
    status: ProductStatus.INACTIVE,
    description: "Professional running shoes for athletes",
    createdAt: "2024-01-08T14:30:00Z",
    updatedAt: "2024-02-18T16:00:00Z",
    supplier: "SportsPro",
    sku: "RS-005",
    rating: 4.4,
  },
  {
    id: "6",
    name: "Programming Guide",
    category: ProductCategory.BOOKS,
    price: 49.99,
    stock: 100,
    status: ProductStatus.ACTIVE,
    description: "Complete guide to modern programming",
    createdAt: "2024-01-25T11:15:00Z",
    updatedAt: "2024-02-22T13:20:00Z",
    supplier: "BookWorld",
    sku: "PG-006",
    rating: 4.6,
  },
];

const mockFilterConfigs: FilterConfig[] = [
  {
    id: "1",
    name: "Active Electronics",
    filters: {
      category: [ProductCategory.ELECTRONICS],
      status: [ProductStatus.ACTIVE],
    },
    columns: ["name", "price", "stock", "rating"],
    sortBy: { field: "price", direction: "desc" },
    createdBy: "user1",
    isPublic: true,
  },
];

const ProductDataManager: React.FC = () => {
  const {
    products,
    loading,
    error,
    refetch,
    totalCount,
    pagination,
    debugInfo,
  } = useProducts();
  const [filterConfigs, setFilterConfigs] = useState<FilterConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    ProductCategory[]
  >([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ProductStatus[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [stockRange, setStockRange] = useState({ min: 0, max: 500 });
  const [ratingRange, setRatingRange] = useState({ min: 0, max: 5 });
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "id",
    "skuId",
    "attributes",
    "createdAt",
    "updatedAt",
  ]);
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showSaveFilter, setShowSaveFilter] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterIsPublic, setFilterIsPublic] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const totalItems = 347;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refetch({ pagination: { offset: page, limit: pageSize } });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const allColumns = [
    { key: "id", label: "ID" },
    { key: "skuId", label: "SKU" },
    { key: "attributes", label: "Attributes" },
    { key: "createdAt", label: "Created Date" },
    { key: "updatedAt", label: "Updated Date" },
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(product.status);

      const matchesPrice =
        product.price >= priceRange.min && product.price <= priceRange.max;
      const matchesStock =
        product.stock >= stockRange.min && product.stock <= stockRange.max;
      const matchesRating =
        product.rating >= ratingRange.min && product.rating <= ratingRange.max;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesPrice &&
        matchesStock &&
        matchesRating
      );
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.field as keyof Product];
        const bVal = b[sortConfig.field as keyof Product];

        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        if (aVal > bVal) comparison = 1;

        return sortConfig.direction === "desc" ? comparison * -1 : comparison;
      });
    }

    return filtered;
  }, [
    products,
    searchTerm,
    selectedCategories,
    selectedStatuses,
    priceRange,
    stockRange,
    ratingRange,
    sortConfig,
  ]);

  const handleSort = (field: string) => {
    setSortConfig((current) => {
      if (current?.field === field) {
        return {
          field,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { field, direction: "asc" };
    });
  };

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns((current) =>
      current.includes(columnKey)
        ? current.filter((col) => col !== columnKey)
        : [...current, columnKey]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setPriceRange({ min: 0, max: 1000 });
    setStockRange({ min: 0, max: 500 });
    setRatingRange({ min: 0, max: 5 });
  };

  const saveCurrentFilter = () => {
    if (!filterName.trim()) return;

    const newFilter: FilterConfig = {
      id: Date.now().toString(),
      name: filterName,
      filters: {
        search: searchTerm || undefined,
        category:
          selectedCategories.length > 0 ? selectedCategories : undefined,
        status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        priceRange:
          priceRange.min > 0 || priceRange.max < 1000 ? priceRange : undefined,
        stockRange:
          stockRange.min > 0 || stockRange.max < 500 ? stockRange : undefined,
        ratingRange:
          ratingRange.min > 0 || ratingRange.max < 5 ? ratingRange : undefined,
      },
      columns: visibleColumns,
      sortBy: sortConfig || undefined,
      createdBy: "current-user",
      isPublic: filterIsPublic,
    };

    setFilterConfigs((current) => [...current, newFilter]);
    setShowSaveFilter(false);
    setFilterName("");
    setFilterIsPublic(false);
  };

  const loadFilter = (filter: FilterConfig) => {
    setSearchTerm(filter.filters.search || "");
    setSelectedCategories(filter.filters.category || []);
    setSelectedStatuses(filter.filters.status || []);
    setPriceRange(filter.filters.priceRange || { min: 0, max: 1000 });
    setStockRange(filter.filters.stockRange || { min: 0, max: 500 });
    setRatingRange(filter.filters.ratingRange || { min: 0, max: 5 });
    setVisibleColumns(filter.columns);
    setSortConfig(filter.sortBy || null);
  };

  const formatValue = (product: Product, column: string): string => {
    if (column === "id") return product.id;
    if (column === "skuId") return product.skuId;
    if (column === "createdAt") return formatDate(product.createdAt);
    if (column === "updatedAt") return formatDate(product.updatedAt);
    return "";
  };

  useEffect(() => {
    refetch({ pagination: { offset: 1, limit: itemsPerPage } });
  }, [itemsPerPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Data Manager
          </h1>
          <p className="text-gray-600">
            Manage and filter your product inventory with advanced search and
            custom views
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-md border flex items-center gap-2 transition-colors ${
                  showFilters
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <button
                onClick={() => setShowColumnManager(!showColumnManager)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Columns
              </button>

              <button
                onClick={() => setShowSaveFilter(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Filter
              </button>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="space-y-2">
                    {Object.values(ProductCategory).map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([
                                ...selectedCategories,
                                category,
                              ]);
                            } else {
                              setSelectedCategories(
                                selectedCategories.filter((c) => c !== category)
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="space-y-2">
                    {Object.values(ProductStatus).map((status) => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStatuses([
                                ...selectedStatuses,
                                status,
                              ]);
                            } else {
                              setSelectedStatuses(
                                selectedStatuses.filter((s) => s !== status)
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {status}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          min: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          max: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {/* Column Manager */}
          {showColumnManager && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Manage Columns
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {allColumns.map((column) => (
                  <label key={column.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(column.key)}
                      onChange={() => handleColumnToggle(column.key)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {column.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Saved Filters */}
        {filterConfigs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Saved Filters
            </h3>
            <div className="flex flex-wrap gap-2">
              {filterConfigs.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => loadFilter(filter)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {allColumns
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((column) => (
                      <th
                        key={column.key}
                        onClick={() => handleSort(column.key)}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      >
                        <div className="flex items-center gap-1">
                          {column.label}
                          {sortConfig?.field === column.key &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    ))}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    {allColumns
                      .filter((col) => visibleColumns.includes(col.key))
                      .map((column) => (
                        <td
                          key={column.key}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {column.key === "attributes" ? (
                            <div>
                              <div>
                                Name: {String(product.attributes[0].value)}
                              </div>
                              <div>
                                Brand: {String(product.attributes[1].value)}
                              </div>
                              <div>
                                ... + {product.attributes.length - 2} more
                              </div>
                            </div>
                          ) : (
                            formatValue(product, column.key)
                          )}
                        </td>
                      ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2 justify-end">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            showPageSizeSelector={true}
            showInfo={true}
            maxVisiblePages={7}
          />

          {filteredAndSortedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No products match your current filters
              </p>
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Save Filter Modal */}
        {showSaveFilter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Save Current Filter
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter Name
                  </label>
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="Enter filter name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterIsPublic}
                      onChange={(e) => setFilterIsPublic(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Make this filter public
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowSaveFilter(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCurrentFilter}
                  disabled={!filterName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Filter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDataManager;
