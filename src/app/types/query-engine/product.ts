/**
 * Internal types for the query engine.
 * If you need to modify these, please state your reasons in the SUBMISSION.md file.
 */

import {
  InternalFilterValue,
  InternalQueryPagination,
  InternalQuerySort,
} from "./common";

export interface ProductQuery {
  filter?: {
    id?: InternalFilterValue;
    skuId?: InternalFilterValue;
    updatedAt?: InternalFilterValue;
    createdAt?: InternalFilterValue;
    attributes?: {
      [attributeKey: string]:
        | InternalFilterValue
        | {
            value?: InternalFilterValue;
            unit?: InternalFilterValue;
          };
    };
  };
  sort?: InternalQuerySort;
  pagination?: InternalQueryPagination;
}
