"use client";

import React from "react";
import { Product } from "@/app/types/product";
import { ColumnConfig } from "./Product";

interface ProductTableProps {
  products: Product[];
  visibleColumns: ColumnConfig[];
  selectedProducts: Set<string>;
  loading: boolean;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onSelectionChange: (selected: Set<string>) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  getAttributeValue: (product: Product, attributeKey: string) => string;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  visibleColumns,
  selectedProducts,
  loading,
  totalItems,
  currentPage,
  itemsPerPage,
  onSelectionChange,
  onPageChange,
  onItemsPerPageChange,
  getAttributeValue,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set(products.map((p) => p.id)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    onSelectionChange(newSelected);
  };

  const getCellValue = (product: Product, columnKey: string): string => {
    switch (columnKey) {
      case "id":
        return product.id;
      case "skuId":
        return product.skuId;
      case "createdAt":
        return new Date(product.createdAt).toLocaleDateString();
      case "updatedAt":
        return new Date(product.updatedAt).toLocaleDateString();
      case "name":
        return getAttributeValue(product, "name") || "-";
      case "brand":
        return getAttributeValue(product, "brand") || "-";
      default:
        return getAttributeValue(product, columnKey) || "-";
    }
  };

  const renderPaginationButton = (page: number, label?: string) => (
    <button
      key={page}
      data-testid={`page-${page}`}
      onClick={() => onPageChange(page)}
      className={`px-3 py-2 text-sm font-medium rounded-md ${
        currentPage === page
          ? "bg-blue-600 text-white"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label || page}
    </button>
  );

  const renderPagination = () => {
    const buttons = [];
    const maxVisible = 7;

    // Always show first page
    if (totalPages > 1) {
      buttons.push(renderPaginationButton(1));
    }

    // Show ellipsis if needed
    if (currentPage > 4) {
      buttons.push(
        <span key="ellipsis1" className="px-3 py-2 text-gray-500">
          ...
        </span>
      );
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        buttons.push(renderPaginationButton(i));
      }
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 3) {
      buttons.push(
        <span key="ellipsis2" className="px-3 py-2 text-gray-500">
          ...
        </span>
      );
    }

    // Always show last page
    if (totalPages > 1) {
      buttons.push(renderPaginationButton(totalPages));
    }

    return buttons;
  };

  return (
    <div
      data-testid="products-table"
      className="bg-white rounded-lg shadow overflow-hidden"
    >
      {/* Table Header with Stats */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Products</h2>
            <p className="text-sm text-gray-600">
              Showing {startItem}-{endItem} of {totalItems} products
              {selectedProducts.size > 0 &&
                ` (${selectedProducts.size} selected)`}
            </p>
          </div>

          {loading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={
                    selectedProducts.size === products.length &&
                    products.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>

              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  style={{ width: col.width }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.name}</span>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-sm">
                      Try adjusting your search criteria or filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  data-testid="product-row"
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedProducts.has(product.id) ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={(e) =>
                        handleSelectProduct(product.id, e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>

                  {visibleColumns.map((col) => {
                    const cellValue = getCellValue(product, col.key);
                    const isLongContent = cellValue.length > 50;

                    return (
                      <td
                        key={col.key}
                        className="px-6 py-4 text-sm text-gray-900"
                      >
                        <div
                          className={`${
                            isLongContent ? "max-w-xs" : "max-w-sm"
                          } truncate`}
                          title={cellValue}
                        >
                          {cellValue}
                        </div>
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
      {totalPages > 1 && (
        <div className="bg-white px-6 py-3 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                data-testid="items-per-page-select"
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">per page</span>
            </div>

            {/* Page info */}
            <div className="text-sm text-gray-700">
              <span data-testid="page-info">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            {/* Page navigation */}
            <div className="flex items-center space-x-1">
              <button
                data-testid="previous-page"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {renderPagination()}

              <button
                data-testid="next-page"
                onClick={() =>
                  onPageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
