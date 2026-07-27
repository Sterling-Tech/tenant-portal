// auditTypes.ts

/**
 * ============================================================
 * Common Pagination
 * ============================================================
 */

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string |null;
  results: T[];
}

/**
 * ============================================================
 * Audit History
 * GET /audit/history/
 * ============================================================
 */

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE";

export interface ObjectHistory {
  id: number;

  model_name: string;

  object_id: string;

  action: AuditAction;

  previous: Record<string, any> | null;

  present: Record<string, any> | null;

  actor: number | null;

  actor_email: string;

  ip_address: string;

  request_id: string;

  timestamp: string;
}

export interface AuditHistoryQuery {
  page?: number;

  page_size?: number;

  start_date?: string;

  end_date?: string;

  action?: AuditAction | "";

  model_name?: string;

  actor_id?: number;

  object_id?: string;

  request_id?: string;
}

export type PaginatedAuditHistory =
  PaginatedResponse<ObjectHistory>;

/**
 * ============================================================
 * Audit Logs
 * GET /audit/logs/
 * ============================================================
 */

export interface AuditLog {
  id: number;

  actor: number | null;

  actor_email: string;

  action: string;

  summary: string;

  ip_address: string;

  request_id: string;

  timestamp: string;
}

export interface AuditLogQuery {
  page?: number;

  page_size?: number;

  start_date?: string;

  end_date?: string;

  action?: string;

  actor_id?: number;

  request_id?: string;
}

export type PaginatedAuditLogs =
  PaginatedResponse<AuditLog>;