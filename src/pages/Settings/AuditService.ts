

import { get } from "../../services";
import {
  AuditHistoryQuery,
  PaginatedAuditHistory,
} from "./auditTypes";

/**
 * Converts an object to query string
 */
const buildQuery = (params: Record<string, any>) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      search.append(key, String(value));
    }
  });

  return search.toString()
    ? `?${search.toString()}`
    : "";
};

export const auditService = {
  /**
   * GET /audit/history/
   */
  getHistory(params: AuditHistoryQuery) {
    return get<PaginatedAuditHistory>(
      `/audit/history/${buildQuery(params)}`
    );
  },
};

export default auditService;