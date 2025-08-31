/**
 * Internal types for the query engine.
 * If you need to modify these, please state your reasons in the SUBMISSION.md file.
 */

import {
  InternalFilterValue,
  InternalQueryPagination,
  InternalQuerySort,
} from "./common";

export interface SupplierAttributeQuery {
  filter?: {
    id?: InternalFilterValue;
    key?: InternalFilterValue;
    name?: InternalFilterValue;
    type?: InternalFilterValue;
    group?: InternalFilterValue;
    placeHolder?: InternalFilterValue;
    description?: InternalFilterValue;
    createdAt?: InternalFilterValue;
    updatedAt?: InternalFilterValue;
  };
  sort?: InternalQuerySort;
  pagination?: InternalQueryPagination;
}
