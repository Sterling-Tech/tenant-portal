
import { get } from "./api";
import { buildQuery } from "./vendorService";

export interface AuditActor {
  id: number;
  name: string;
  email: string;
}

export interface AuditLog {
  actor: AuditActor;
  actor_email: string;
  action: string;
  summary: string;
  ip_address: string;
  timestamp: string;
}

export interface PaginatedAuditLogs {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLog[];
}

export interface AuditHistory<T = any> {
  id: number;
  object_id: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  previous: T | null;
  present: T | null;
  timestamp: string;
}

export interface AuditLogQuery {
//   [key: string]: unknown;
  [key: string]: string | number | undefined | unknown;
  start_date: string;
  end_date: string;
  page?: number;
}

export interface CustomerCategory {
    id: number;
    name: string;
    description: string;
}


export const auditService = {
  /**
   * Audit Logs
   * GET /audit/logs/
   */
  getLogs(params: AuditLogQuery) {
    return get<PaginatedAuditLogs>(
      `/audit/logs/${buildQuery(params)}`
    );
  },

  /**
   * Vendor History
   */
  getVendorHistory(vendorId: number | string) {
    return get<AuditHistory[]>(
      `/audit/history/vendor/?vendor_id=${vendorId}`
    );
  },

  /**
   * Customer History
   */
  getCustomerHistory(customerId: number | string) {
    return get<AuditHistory[]>(
      `/audit/history/customer/?customer_id=${customerId}`
    );
  },

  /**
   * Customer Category History
   */
  getCustomerCategoryHistory(categoryId: number | string) {
    return get<AuditHistory[]>(
      `/audit/history/customer-category/?category_id=${categoryId}`
    );
  },

  /**
   * User History
   */
  getUserHistory(userId: number | string) {
    return get<AuditHistory[]>(
      `/audit/history/user/?user_id=${userId}`
    );
  },
};

export const fetchCustomerCategories = () => {
    return get<CustomerCategory[]>("/customer/category/");
};