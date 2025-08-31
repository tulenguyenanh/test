import { Product } from "../../types/product";
import {
  InternalFilterValue,
  InternalQueryFilter,
  InternalQueryPagination,
  InternalQueryResponse,
  InternalQuerySort,
} from "../../types/query-engine/common";

export class ProductQueryEngine {
  private products: Product[];

  constructor(products: Product[]) {
    this.products = products;
  }

  async query({
    filter,
    sort,
    pagination = {
      offset: 0,
      limit: 25,
    },
  }: {
    filter?: InternalQueryFilter;
    sort?: InternalQuerySort;
    pagination?: InternalQueryPagination;
  } = {}): Promise<InternalQueryResponse<Product>> {
    const artificialDelay = Math.random() * 700 + 300;
    const start = Date.now();
    await new Promise((resolve) => setTimeout(resolve, artificialDelay));

    let filteredProducts = [...this.products];

    if (filter) {
      filteredProducts = this.applyFilters(filteredProducts, filter);
    }

    if (sort) {
      filteredProducts = this.applySorting(filteredProducts, sort);
    }

    const total = filteredProducts.length;

    if (pagination) {
      const { offset, limit } = pagination;
      filteredProducts = filteredProducts.slice(offset, offset + limit);

      return {
        total,
        pagination: {
          offset,
          limit,
          hasMore: offset + limit < total,
        },
        debugInfo: {
          duration: Date.now() - start,
        },
        data: filteredProducts,
      };
    }

    return {
      total,
      pagination: {
        offset: 0,
        limit: total,
        hasMore: false,
      },
      debugInfo: {
        duration: Date.now() - start,
      },
      data: filteredProducts,
    };
  }

  private applyFilters(
    products: Product[],
    filter: InternalQueryFilter
  ): Product[] {
    return products.filter((product) => {
      return Object.entries(filter).every(([field, filterValue]) => {
        return this.matchesFilter(product, field, filterValue);
      });
    });
  }

  private matchesFilter(
    product: Product,
    field: string,
    filterValue: InternalFilterValue
  ): boolean {
    // For fixed product fields
    if (["id", "skuId", "updatedAt", "createdAt"].includes(field)) {
      const productValue = product[field as keyof Product];
      return this.evaluateCondition(productValue, filterValue);
    }

    // For specific attributes filtering
    if (field === "attributes") {
      return this.matchesAttributesFilter(product, filterValue);
    }

    return false;
  }

  private matchesAttributesFilter(
    product: Product,
    attributesFilter: InternalFilterValue
  ): boolean {
    // Check if attributesFilter is an object
    if (
      typeof attributesFilter !== "object" ||
      attributesFilter === null ||
      Array.isArray(attributesFilter)
    ) {
      return false;
    }

    // Check if it's a comparison operator object
    if (
      "$eq" in attributesFilter ||
      "$ne" in attributesFilter ||
      "$gt" in attributesFilter ||
      "$gte" in attributesFilter ||
      "$lt" in attributesFilter ||
      "$lte" in attributesFilter ||
      "$in" in attributesFilter ||
      "$exists" in attributesFilter ||
      "$regex" in attributesFilter
    ) {
      return false; // Attributes filter should be a plain object, not a comparison object
    }

    // Treat as attributes object: { brand: "value", name: { $regex: "pattern" } }
    const attributesObj = attributesFilter as Record<
      string,
      InternalFilterValue
    >;

    return Object.entries(attributesObj).every(
      ([attributeKey, attributeFilterValue]) => {
        return this.matchesAttributeFilter(
          product,
          attributeKey,
          attributeFilterValue
        );
      }
    );
  }

  private matchesAttributeFilter(
    product: Product,
    attributeKey: string,
    filterValue:
      | InternalFilterValue
      | { value?: InternalFilterValue; unit?: InternalFilterValue }
  ): boolean {
    const attribute = product.attributes.find(
      (attr) => attr.key === attributeKey
    );

    if (!attribute) {
      if (
        typeof filterValue === "object" &&
        filterValue !== null &&
        !Array.isArray(filterValue) &&
        "$exists" in filterValue
      ) {
        return !filterValue.$exists;
      }
      return false;
    }

    const { value } = attribute;

    // Check if filterValue is a nested object with value/unit filters
    if (
      typeof filterValue === "object" &&
      filterValue !== null &&
      !Array.isArray(filterValue) &&
      ("value" in filterValue || "unit" in filterValue) &&
      !(
        "$eq" in filterValue ||
        "$ne" in filterValue ||
        "$gt" in filterValue ||
        "$gte" in filterValue ||
        "$lt" in filterValue ||
        "$lte" in filterValue ||
        "$in" in filterValue ||
        "$exists" in filterValue ||
        "$regex" in filterValue
      )
    ) {
      const nestedFilter = filterValue as {
        value?: InternalFilterValue;
        unit?: InternalFilterValue;
      };

      // Check if value is an object with value/unit properties
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const valueObj = value as Record<string, unknown>;

        // Check value.value if specified
        if (nestedFilter.value !== undefined) {
          if (!this.evaluateCondition(valueObj.value, nestedFilter.value)) {
            return false;
          }
        }

        // Check value.unit if specified
        if (nestedFilter.unit !== undefined) {
          if (!this.evaluateCondition(valueObj.unit, nestedFilter.unit)) {
            return false;
          }
        }

        return true;
      }

      return false;
    }

    // Original logic for simple filters
    const simpleFilterValue = filterValue as InternalFilterValue;

    if (this.evaluateCondition(value, simpleFilterValue)) {
      return true;
    }

    // Check value.value (if value is an object)
    if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      "value" in value
    ) {
      if (
        this.evaluateCondition(
          (value as Record<string, unknown>).value,
          simpleFilterValue
        )
      ) {
        return true;
      }
    }

    // Check value.unit (if value is an object)
    if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      "unit" in value
    ) {
      if (
        this.evaluateCondition(
          (value as Record<string, unknown>).unit,
          simpleFilterValue
        )
      ) {
        return true;
      }
    }

    return false;
  }

  private evaluateCondition(
    targetValue: unknown,
    filterValue: InternalFilterValue
  ): boolean {
    // FilterValue is now always an object with operators
    return Object.entries(filterValue).every(([operator, operatorValue]) => {
      return this.compareValues(targetValue, operatorValue, operator);
    });
  }

  private compareValues(
    targetValue: unknown,
    filterValue: unknown,
    operator: string
  ): boolean {
    switch (operator) {
      case "$eq":
        return targetValue === filterValue;

      case "$ne":
        return targetValue !== filterValue;

      case "$gt":
        return (
          typeof targetValue === "number" &&
          typeof filterValue === "number" &&
          targetValue > filterValue
        );

      case "$gte":
        return (
          typeof targetValue === "number" &&
          typeof filterValue === "number" &&
          targetValue >= filterValue
        );

      case "$lt":
        return (
          typeof targetValue === "number" &&
          typeof filterValue === "number" &&
          targetValue < filterValue
        );

      case "$lte":
        return (
          typeof targetValue === "number" &&
          typeof filterValue === "number" &&
          targetValue <= filterValue
        );

      case "$in":
        return Array.isArray(filterValue) && filterValue.includes(targetValue);

      case "$exists":
        return (
          typeof filterValue === "boolean" &&
          (targetValue !== null && targetValue !== undefined) === filterValue
        );

      case "$regex":
        if (
          typeof targetValue === "string" &&
          typeof filterValue === "string"
        ) {
          try {
            const regex = new RegExp(filterValue, "i");
            return regex.test(targetValue);
          } catch {
            return false;
          }
        }
        return false;

      default:
        return targetValue === filterValue;
    }
  }

  private applySorting(
    products: Product[],
    sort: InternalQuerySort
  ): Product[] {
    const { field, order } = sort;

    return products.sort((a, b) => {
      let aValue: unknown;
      let bValue: unknown;

      if (
        field === "id" ||
        field === "skuId" ||
        field === "updatedAt" ||
        field === "createdAt"
      ) {
        aValue = a[field as keyof Product];
        bValue = b[field as keyof Product];
      } else if (field.startsWith("attributes.")) {
        const attributeKey = field.replace("attributes.", "");
        const aAttr = a.attributes.find((attr) => attr.key === attributeKey);
        const bAttr = b.attributes.find((attr) => attr.key === attributeKey);

        aValue = aAttr?.value;
        bValue = bAttr?.value;
      } else {
        return 0;
      }

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return order === "ASC" ? -1 : 1;
      if (bValue == null) return order === "ASC" ? 1 : -1;

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      else if (aValue > bValue) comparison = 1;

      return order === "ASC" ? comparison : -comparison;
    });
  }
}
