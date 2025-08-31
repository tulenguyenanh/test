"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Save,
  Share,
  Download,
  Settings,
  Calendar,
  Hash,
  Type,
  DollarSign,
  Link as LinkIcon,
  Ruler,
  FileText,
  List,
  Image,
  TreePine,
  RefreshCw,
} from "lucide-react";

// Types (based on provided interfaces)
type ProductAttributeValue = string | object | string[] | number | null;

interface ProductAttribute {
  key: string;
  value: ProductAttributeValue;
}

interface Product {
  id: string;
  skuId: string;
  updatedAt: number;
  createdAt: number;
  attributes: ProductAttribute[];
}

type InternalFilterValue = {
  $eq?: string | number | boolean | null;
  $ne?: string | number | boolean | null;
  $gt?: number;
  $gte?: number;
  $lt?: number;
  $lte?: number;
  $in?: (string | number | boolean | null)[];
  $exists?: boolean;
  $regex?: string;
};

interface InternalQueryFilter {
  [key: string]: InternalFilterValue;
}

interface InternalQuerySort {
  field: string;
  order: "ASC" | "DESC";
}

interface InternalQueryPagination {
  offset: number;
  limit: number;
}

interface InternalQueryResponse<T> {
  data: T[];
  total: number;
  pagination: {
    offset: number;
    limit: number;
    hasMore: boolean;
  };
  debugInfo: {
    duration: number;
  };
}

enum AttributeFieldType {
  TEXT = "TEXT",
  DATE = "DATE",
  DATETIME = "DATETIME",
  NUMBER = "NUMBER",
  PRICE = "PRICE",
  URL = "URL",
  MEASURE = "MEASURE",
  RICH_TEXT = "RICH_TEXT",
  LONG_TEXT = "LONG_TEXT",
  MULTI_SELECT = "MULTI_SELECT",
  DROPDOWN = "DROPDOWN",
  MEDIA_GALLERY = "MEDIA_GALLERY",
  TREE_NODE = "TREE_NODE",
}

enum AttributeGroup {
  BASIC_INFO = "Basic Info",
  SPECIFICATIONS = "Specifications",
  SAFETY_AND_COMPLIANCE = "Safety & Compliance",
  DESCRIPTIONS = "Descriptions",
  MARKETING = "Marketing",
  VARIANTS = "Variants",
  MAGENTO = "Magento",
  SHOPIFY = "Shopify",
  WOOCOMMERCE = "WooCommerce",
  SHOPEE = "Shopee",
  LAZADA = "Lazada",
  AMAZON = "Amazon",
  PRICING_AND_INVENTORY = "Pricing & Inventory",
  SHIPPING = "Shipping",
}

interface SupplierAttribute {
  id: string;
  createdAt: number;
  updatedAt: number;
  type: AttributeFieldType;
  name: string;
  key: string;
  description?: string;
  group?: AttributeGroup;
  placeHolder?: string;
}

interface SavedFilter {
  id: string;
  name: string;
  filter: InternalQueryFilter;
  sort?: InternalQuerySort;
  hiddenColumns: string[];
  createdAt: number;
  shared: boolean;
}

interface FilterCondition {
  field: string;
  operator: string;
  value: string | number | boolean | null;
  id: string;
}

// Mock Data
const mockProducts: Product[] = [
  {
    id: "1",
    skuId: "SKU-001",
    updatedAt: Date.now() - 86400000,
    createdAt: Date.now() - 2592000000,
    attributes: [
      { key: "name", value: "Wireless Headphones" },
      { key: "brand", value: "TechAudio" },
      { key: "price", value: { value: 99.99, unit: "USD" } },
      { key: "category", value: "Electronics" },
      { key: "color", value: ["Black", "White", "Blue"] },
      { key: "weight", value: { value: 250, unit: "g" } },
      {
        key: "description",
        value: "Premium wireless headphones with noise cancellation",
      },
    ],
  },
  {
    id: "2",
    skuId: "SKU-002",
    updatedAt: Date.now() - 172800000,
    createdAt: Date.now() - 2592000000,
    attributes: [
      { key: "name", value: "Gaming Mouse" },
      { key: "brand", value: "GameTech" },
      { key: "price", value: { value: 79.99, unit: "USD" } },
      { key: "category", value: "Electronics" },
      { key: "color", value: ["RGB", "Black"] },
      { key: "weight", value: { value: 120, unit: "g" } },
      { key: "dpi", value: 16000 },
    ],
  },
  {
    id: "3",
    skuId: "SKU-003",
    updatedAt: Date.now() - 259200000,
    createdAt: Date.now() - 2592000000,
    attributes: [
      { key: "name", value: "Mechanical Keyboard" },
      { key: "brand", value: "TypeMaster" },
      { key: "price", value: { value: 149.99, unit: "USD" } },
      { key: "category", value: "Electronics" },
      { key: "color", value: ["Black", "Silver"] },
      { key: "switch_type", value: "Cherry MX Blue" },
      { key: "backlight", value: true },
    ],
  },
];

const mockAttributes: SupplierAttribute[] = [
  {
    id: "1",
    key: "name",
    name: "Product Name",
    type: AttributeFieldType.TEXT,
    group: AttributeGroup.BASIC_INFO,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "2",
    key: "brand",
    name: "Brand",
    type: AttributeFieldType.TEXT,
    group: AttributeGroup.BASIC_INFO,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "3",
    key: "price",
    name: "Price",
    type: AttributeFieldType.PRICE,
    group: AttributeGroup.PRICING_AND_INVENTORY,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "4",
    key: "category",
    name: "Category",
    type: AttributeFieldType.DROPDOWN,
    group: AttributeGroup.BASIC_INFO,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "5",
    key: "color",
    name: "Colors",
    type: AttributeFieldType.MULTI_SELECT,
    group: AttributeGroup.VARIANTS,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "6",
    key: "weight",
    name: "Weight",
    type: AttributeFieldType.MEASURE,
    group: AttributeGroup.SPECIFICATIONS,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "7",
    key: "description",
    name: "Description",
    type: AttributeFieldType.LONG_TEXT,
    group: AttributeGroup.DESCRIPTIONS,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// Mock Query Engine (simplified for demo)
class MockProductQueryEngine {
  private products: Product[];

  constructor(products: Product[]) {
    this.products = products;
  }

  async query({
    filter = {},
    sort,
    pagination = { offset: 0, limit: 25 },
  }: {
    filter?: InternalQueryFilter;
    sort?: InternalQuerySort;
    pagination?: InternalQueryPagination;
  } = {}): Promise<InternalQueryResponse<Product>> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filteredProducts = [...this.products];

    // Apply filters
    if (filter && Object.keys(filter).length > 0) {
      filteredProducts = filteredProducts.filter((product) => {
        return Object.entries(filter).every(([field, filterValue]) => {
          if (
            field === "attributes" &&
            typeof filterValue === "object" &&
            filterValue !== null
          ) {
            return Object.entries(
              filterValue as Record<string, InternalFilterValue>
            ).every(([attrKey, attrFilter]) => {
              const attr = product.attributes.find((a) => a.key === attrKey);
              if (!attr) return false;
              return this.evaluateCondition(attr.value, attrFilter);
            });
          } else if (
            ["id", "skuId", "updatedAt", "createdAt"].includes(field)
          ) {
            return this.evaluateCondition(
              product[field as keyof Product],
              filterValue
            );
          }
          return true;
        });
      });
    }

    // Apply sorting
    if (sort) {
      filteredProducts.sort((a, b) => {
        let aValue: any, bValue: any;

        if (["id", "skuId", "updatedAt", "createdAt"].includes(sort.field)) {
          aValue = a[sort.field as keyof Product];
          bValue = b[sort.field as keyof Product];
        } else if (sort.field.startsWith("attributes.")) {
          const attrKey = sort.field.replace("attributes.", "");
          aValue = a.attributes.find((attr) => attr.key === attrKey)?.value;
          bValue = b.attributes.find((attr) => attr.key === attrKey)?.value;
        }

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sort.order === "ASC" ? -1 : 1;
        if (bValue == null) return sort.order === "ASC" ? 1 : -1;

        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;

        return sort.order === "ASC" ? comparison : -comparison;
      });
    }

    const total = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(
      pagination.offset,
      pagination.offset + pagination.limit
    );

    return {
      data: paginatedProducts,
      total,
      pagination: {
        offset: pagination.offset,
        limit: pagination.limit,
        hasMore: pagination.offset + pagination.limit < total,
      },
      debugInfo: { duration: 300 },
    };
  }

  private evaluateCondition(
    targetValue: any,
    filterValue: InternalFilterValue
  ): boolean {
    return Object.entries(filterValue).every(([operator, operatorValue]) => {
      switch (operator) {
        case "$eq":
          return targetValue === operatorValue;
        case "$ne":
          return targetValue !== operatorValue;
        case "$regex":
          if (
            typeof targetValue === "string" &&
            typeof operatorValue === "string"
          ) {
            return new RegExp(operatorValue, "i").test(targetValue);
          }
          return false;
        case "$in":
          return (
            Array.isArray(operatorValue) && operatorValue.includes(targetValue)
          );
        case "$exists":
          return (targetValue != null) === operatorValue;
        default:
          return true;
      }
    });
  }
}

const queryEngine = new MockProductQueryEngine(mockProducts);

export default function ProductDataApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [attributes, setAttributes] =
    useState<SupplierAttribute[]>(mockAttributes);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [sort, setSort] = useState<InternalQuerySort | undefined>();
  const [pagination, setPagination] = useState({ offset: 0, limit: 25 });
  const [total, setTotal] = useState(0);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState("");

  // Get all unique attribute keys from products
  const allAttributeKeys = useMemo(() => {
    const keys = new Set<string>();
    products.forEach((product) => {
      product.attributes.forEach((attr) => {
        keys.add(attr.key);
      });
    });
    return Array.from(keys);
  }, [products]);

  // Get visible columns
  const visibleColumns = useMemo(() => {
    const baseColumns = ["id", "skuId", "updatedAt", "createdAt"];
    const attributeColumns = allAttributeKeys.map((key) => `attributes.${key}`);
    return [...baseColumns, ...attributeColumns].filter(
      (col) => !hiddenColumns.includes(col)
    );
  }, [allAttributeKeys, hiddenColumns]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Build filter object
      const queryFilter: InternalQueryFilter = {};

      // Add search filter
      if (searchTerm) {
        queryFilter.attributes = {
          name: { $regex: searchTerm },
        };
      }

      // Add custom filters
      filters.forEach((filter) => {
        if (filter.field.startsWith("attributes.")) {
          const attrKey = filter.field.replace("attributes.", "");
          if (!queryFilter.attributes) queryFilter.attributes = {};
          queryFilter.attributes[attrKey] = {
            [filter.operator]: filter.value,
          } as InternalFilterValue;
        } else {
          queryFilter[filter.field] = {
            [filter.operator]: filter.value,
          } as InternalFilterValue;
        }
      });

      const result = await queryEngine.query({
        filter: Object.keys(queryFilter).length > 0 ? queryFilter : undefined,
        sort,
        pagination,
      });

      setProducts(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, sort, pagination]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      field: "attributes.name",
      operator: "$regex",
      value: "",
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleSort = (field: string) => {
    if (sort?.field === field) {
      setSort({ field, order: sort.order === "ASC" ? "DESC" : "ASC" });
    } else {
      setSort({ field, order: "ASC" });
    }
  };

  const toggleColumnVisibility = (column: string) => {
    if (hiddenColumns.includes(column)) {
      setHiddenColumns(hiddenColumns.filter((col) => col !== column));
    } else {
      setHiddenColumns([...hiddenColumns, column]);
    }
  };

  const saveFilter = () => {
    if (!filterName.trim()) return;

    const queryFilter: InternalQueryFilter = {};

    if (searchTerm) {
      queryFilter.attributes = {
        name: { $regex: searchTerm },
      };
    }

    filters.forEach((filter) => {
      if (filter.field.startsWith("attributes.")) {
        const attrKey = filter.field.replace("attributes.", "");
        if (!queryFilter.attributes) queryFilter.attributes = {};
        queryFilter.attributes[attrKey] = {
          [filter.operator]: filter.value,
        } as InternalFilterValue;
      } else {
        queryFilter[filter.field] = {
          [filter.operator]: filter.value,
        } as InternalFilterValue;
      }
    });

    const newSavedFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      filter: queryFilter,
      sort,
      hiddenColumns: [...hiddenColumns],
      createdAt: Date.now(),
      shared: false,
    };

    setSavedFilters([...savedFilters, newSavedFilter]);
    setFilterName("");
    setShowSaveDialog(false);
  };

  const applySavedFilter = (savedFilter: SavedFilter) => {
    // Reset current state
    setSearchTerm("");
    setFilters([]);

    // Apply saved filter
    if (savedFilter.filter.attributes?.name?.$regex) {
      setSearchTerm(savedFilter.filter.attributes.name.$regex as string);
    }

    // Convert saved filter back to filter conditions
    const newFilters: FilterCondition[] = [];
    Object.entries(savedFilter.filter).forEach(([field, filterValue]) => {
      if (field === "attributes" && typeof filterValue === "object") {
        Object.entries(
          filterValue as Record<string, InternalFilterValue>
        ).forEach(([attrKey, attrFilter]) => {
          Object.entries(attrFilter).forEach(([operator, value]) => {
            if (attrKey !== "name" || operator !== "$regex") {
              // Skip search term
              newFilters.push({
                id: Date.now().toString() + Math.random(),
                field: `attributes.${attrKey}`,
                operator,
                value: value as any,
              });
            }
          });
        });
      } else {
        Object.entries(filterValue as InternalFilterValue).forEach(
          ([operator, value]) => {
            newFilters.push({
              id: Date.now().toString() + Math.random(),
              field,
              operator,
              value: value as any,
            });
          }
        );
      }
    });

    setFilters(newFilters);
    setSort(savedFilter.sort);
    setHiddenColumns(savedFilter.hiddenColumns);
  };

  const formatValue = (value: ProductAttributeValue): string => {
    if (value === null || value === undefined) return "-";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") {
      if ("value" in value && "unit" in value) {
        return `${value.value} ${value.unit}`;
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  const getAttributeTypeIcon = (type: AttributeFieldType) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case AttributeFieldType.TEXT:
        return <Type className={iconClass} />;
      case AttributeFieldType.NUMBER:
        return <Hash className={iconClass} />;
      case AttributeFieldType.PRICE:
        return <DollarSign className={iconClass} />;
      case AttributeFieldType.DATE:
      case AttributeFieldType.DATETIME:
        return <Calendar className={iconClass} />;
      case AttributeFieldType.URL:
        return <LinkIcon className={iconClass} />;
      case AttributeFieldType.MEASURE:
        return <Ruler className={iconClass} />;
      case AttributeFieldType.LONG_TEXT:
      case AttributeFieldType.RICH_TEXT:
        return <FileText className={iconClass} />;
      case AttributeFieldType.MULTI_SELECT:
      case AttributeFieldType.DROPDOWN:
        return <List className={iconClass} />;
      case AttributeFieldType.MEDIA_GALLERY:
        return <Image className={iconClass} />;
      case AttributeFieldType.TREE_NODE:
        return <TreePine className={iconClass} />;
      default:
        return <Type className={iconClass} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Product Data Management
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save View
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <Share className="w-4 h-4" />
              Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilterPanel
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters ({filters.length})
            </button>

            {/* Column Settings */}
            <button
              onClick={() => setShowColumnPanel(!showColumnPanel)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Columns
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadProducts}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <span className="text-sm text-gray-500">{total} products</span>
          </div>
        </div>

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700">
              Saved Views:
            </span>
            <div className="flex gap-2">
              {savedFilters.map((savedFilter) => (
                <button
                  key={savedFilter.id}
                  onClick={() => applySavedFilter(savedFilter)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                >
                  {savedFilter.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Advanced Filters</h3>
              <button
                onClick={addFilter}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Filter
              </button>
            </div>

            {filters.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No filters applied. Click "Add Filter" to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {filters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center gap-3 bg-white p-3 rounded border"
                  >
                    <select
                      value={filter.field}
                      onChange={(e) =>
                        updateFilter(filter.id, { field: e.target.value })
                      }
                      className="border border-gray-300 rounded px-3 py-1 text-sm"
                    >
                      <option value="id">ID</option>
                      <option value="skuId">SKU ID</option>
                      <option value="createdAt">Created At</option>
                      <option value="updatedAt">Updated At</option>
                      {allAttributeKeys.map((key) => (
                        <option key={key} value={`attributes.${key}`}>
                          {key} (attribute)
                        </option>
                      ))}
                    </select>

                    <select
                      value={filter.operator}
                      onChange={(e) =>
                        updateFilter(filter.id, { operator: e.target.value })
                      }
                      className="border border-gray-300 rounded px-3 py-1 text-sm"
                    >
                      <option value="$eq">equals</option>
                      <option value="$ne">not equals</option>
                      <option value="$regex">contains</option>
                      <option value="$gt">greater than</option>
                      <option value="$gte">greater or equal</option>
                      <option value="$lt">less than</option>
                      <option value="$lte">less or equal</option>
                      <option value="$in">in list</option>
                      <option value="$exists">exists</option>
                    </select>

                    <input
                      type="text"
                      value={filter.value as string}
                      onChange={(e) =>
                        updateFilter(filter.id, { value: e.target.value })
                      }
                      placeholder="Value"
                      className="border border-gray-300 rounded px-3 py-1 text-sm flex-1"
                    />

                    <button
                      onClick={() => removeFilter(filter.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Column Panel */}
        {showColumnPanel && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-3">
              Column Visibility
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {/* Base columns */}
              {["id", "skuId", "updatedAt", "createdAt"].map((col) => (
                <label key={col} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!hiddenColumns.includes(col)}
                    onChange={() => toggleColumnVisibility(col)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="capitalize">{col}</span>
                </label>
              ))}

              {/* Attribute columns */}
              {allAttributeKeys.map((key) => {
                const attr = attributes.find((a) => a.key === key);
                const columnKey = `attributes.${key}`;
                return (
                  <label
                    key={columnKey}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={!hiddenColumns.includes(columnKey)}
                      onChange={() => toggleColumnVisibility(columnKey)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-1">
                      {attr && getAttributeTypeIcon(attr.type)}
                      <span>{attr?.name || key}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {visibleColumns.map((column) => {
                    const isAttribute = column.startsWith("attributes.");
                    const attributeKey = isAttribute
                      ? column.replace("attributes.", "")
                      : "";
                    const attribute = isAttribute
                      ? attributes.find((a) => a.key === attributeKey)
                      : null;
                    const displayName = isAttribute
                      ? attribute?.name || attributeKey
                      : column;

                    return (
                      <th
                        key={column}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort(column)}
                      >
                        <div className="flex items-center gap-2">
                          {isAttribute &&
                            attribute &&
                            getAttributeTypeIcon(attribute.type)}
                          <span>{displayName}</span>
                          {sort?.field === column &&
                            (sort.order === "ASC" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={visibleColumns.length}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                        <span className="text-gray-500">
                          Loading products...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumns.length}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No products found. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {visibleColumns.map((column) => {
                        let cellValue: string;

                        if (column.startsWith("attributes.")) {
                          const attributeKey = column.replace(
                            "attributes.",
                            ""
                          );
                          const attribute = product.attributes.find(
                            (attr) => attr.key === attributeKey
                          );
                          cellValue = formatValue(attribute?.value);
                        } else if (
                          column === "updatedAt" ||
                          column === "createdAt"
                        ) {
                          cellValue = new Date(
                            product[column]
                          ).toLocaleDateString();
                        } else {
                          cellValue = String(product[column as keyof Product]);
                        }

                        return (
                          <td
                            key={column}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {cellValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {pagination.offset + 1} to{" "}
              {Math.min(pagination.offset + pagination.limit, total)} of {total}{" "}
              products
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    offset: Math.max(0, prev.offset - prev.limit),
                  }))
                }
                disabled={pagination.offset === 0}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {Math.floor(pagination.offset / pagination.limit) + 1} of{" "}
                {Math.ceil(total / pagination.limit)}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    offset: prev.offset + prev.limit,
                  }))
                }
                disabled={pagination.offset + pagination.limit >= total}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Save Current View</h3>
            <input
              type="text"
              placeholder="Enter view name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={saveFilter}
                disabled={!filterName.trim()}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save View
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setFilterName("");
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Panels */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform z-40 ${
          showColumnPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Column Management</h3>
            <button
              onClick={() => setShowColumnPanel(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Base Fields</h4>
              <div className="space-y-2">
                {["id", "skuId", "updatedAt", "createdAt"].map((col) => (
                  <label
                    key={col}
                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!hiddenColumns.includes(col)}
                      onChange={() => toggleColumnVisibility(col)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="capitalize text-sm">
                      {col.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    {!hiddenColumns.includes(col) ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Attributes</h4>
              <div className="space-y-2">
                {allAttributeKeys.map((key) => {
                  const attr = attributes.find((a) => a.key === key);
                  const columnKey = `attributes.${key}`;
                  return (
                    <label
                      key={columnKey}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.includes(columnKey)}
                        onChange={() => toggleColumnVisibility(columnKey)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        {attr && getAttributeTypeIcon(attr.type)}
                        <div>
                          <div className="text-sm font-medium">
                            {attr?.name || key}
                          </div>
                          {attr?.group && (
                            <div className="text-xs text-gray-500">
                              {attr.group}
                            </div>
                          )}
                        </div>
                      </div>
                      {!hiddenColumns.includes(columnKey) ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for sidebar */}
      {showColumnPanel && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setShowColumnPanel(false)}
        />
      )}
    </div>
  );
}
