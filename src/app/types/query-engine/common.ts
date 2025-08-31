/**
 * Internal types for the query engine.
 * If you need to modify these, please state your reasons in the SUBMISSION.md file.
 */

export type InternalFilterValue = {
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

export interface InternalQueryFilter {
  [key: string]: InternalFilterValue;
}

export interface InternalQuerySort {
  field: string;
  order: "ASC" | "DESC";
}

export interface InternalQueryPagination {
  offset: number;
  limit: number;
}

export interface InternalQueryResponse<T> {
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
