import { SupplierAttribute } from "../../types/attribute";
import {
  InternalFilterValue,
  InternalQueryFilter,
  InternalQueryPagination,
  InternalQueryResponse,
  InternalQuerySort,
} from "../../types/query-engine/common";

export class SupplierAttributeQueryEngine {
  private attributes: SupplierAttribute[];

  constructor(attributes: SupplierAttribute[]) {
    this.attributes = attributes;
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
  } = {}): Promise<InternalQueryResponse<SupplierAttribute>> {
    const artificialDelay = Math.random() * 700 + 300;
    const start = Date.now();
    await new Promise((resolve) => setTimeout(resolve, artificialDelay));

    let filteredAttributes = [...this.attributes];

    if (filter) {
      filteredAttributes = this.applyFilters(filteredAttributes, filter);
    }

    if (sort) {
      filteredAttributes = this.applySorting(filteredAttributes, sort);
    }

    const total = filteredAttributes.length;

    if (pagination) {
      const { offset, limit } = pagination;
      filteredAttributes = filteredAttributes.slice(offset, offset + limit);

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
        data: filteredAttributes,
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
      data: filteredAttributes,
    };
  }

  private applyFilters(
    attributes: SupplierAttribute[],
    filter: InternalQueryFilter
  ): SupplierAttribute[] {
    return attributes.filter((attribute) => {
      return Object.entries(filter).every(([field, filterValue]) => {
        return this.matchesFilter(attribute, field, filterValue);
      });
    });
  }

  private matchesFilter(
    attribute: SupplierAttribute,
    field: string,
    filterValue: InternalFilterValue
  ): boolean {
    // Handle all SupplierAttribute fields
    const validFields = [
      "id",
      "key",
      "name",
      "type",
      "group",
      "placeHolder",
      "description",
      "createdAt",
      "updatedAt",
    ];

    if (validFields.includes(field)) {
      const attributeValue = attribute[field as keyof SupplierAttribute];
      return this.evaluateCondition(attributeValue, filterValue);
    }

    return false;
  }

  private evaluateCondition(
    targetValue: unknown,
    filterValue: InternalFilterValue
  ): boolean {
    // FilterValue is always an object with operators
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
    attributes: SupplierAttribute[],
    sort: InternalQuerySort
  ): SupplierAttribute[] {
    const { field, order } = sort;

    return attributes.sort((a, b) => {
      let aValue: unknown;
      let bValue: unknown;

      // Handle direct SupplierAttribute fields
      const validFields = [
        "id",
        "key",
        "name",
        "type",
        "group",
        "placeHolder",
        "description",
        "createdAt",
        "updatedAt",
      ];

      if (validFields.includes(field)) {
        aValue = a[field as keyof SupplierAttribute];
        bValue = b[field as keyof SupplierAttribute];
      } else {
        return 0;
      }

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return order === "ASC" ? -1 : 1;
      if (bValue == null) return order === "ASC" ? 1 : -1;

      // Compare values
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      else if (aValue > bValue) comparison = 1;

      return order === "ASC" ? comparison : -comparison;
    });
  }
}
