import { get, post } from "./api";

export type VendType =
  | "freeissue"
  | "maxpower"
  | "tampertoken"
  | "cleartoken"
  | "keychange";

interface BaseEngineeringTokenPayload {
  meter_number: string;
  reason: string;
}

export interface FreeIssuePayload extends BaseEngineeringTokenPayload {
  vend_type: "freeissue";
  units: string;
}

export interface MaxPowerPayload extends BaseEngineeringTokenPayload {
  vend_type: "maxpower";
  kilowatt: string;
}

export interface TamperTokenPayload extends BaseEngineeringTokenPayload {
  vend_type: "tampertoken";
}

export interface ClearTokenPayload extends BaseEngineeringTokenPayload {
  vend_type: "cleartoken";
}

export interface KeyChangePayload extends BaseEngineeringTokenPayload {
  vend_type: "keychange";
  to_ti: string;
  to_sgc: string;
  to_krn: string;
}

export type EngineeringTokenPayload =
  | FreeIssuePayload
  | MaxPowerPayload
  | TamperTokenPayload
  | ClearTokenPayload
  | KeyChangePayload;

export interface EngineeringTokenResponse {
  status: string;
  token: string;
  token2?: string;
  value: string;
  description: string;
  invoice_id: string;
  token_type: VendType;
}

// Static metadata driving the dropdown + which fields to render per type.
export const VEND_TYPE_OPTIONS: {
  value: VendType;
  label: string;
  helperText: string;
  fields: Array<"units" | "kilowatt" | "to_ti" | "to_sgc" | "to_krn">;
}[] = [
  {
    value: "freeissue",
    label: "Free Issue (Engineering Credit)",
    helperText: "Credits units to a meter without a financial transaction.",
    fields: ["units"],
  },
  {
    value: "maxpower",
    label: "Max Power (Load Limit)",
    helperText: "Sets the meter's maximum power / load limit.",
    fields: ["kilowatt"],
  },
  {
    value: "tampertoken",
    label: "Clear Tamper",
    helperText: "Clears a tamper flag on the meter. No units required.",
    fields: [],
  },
  {
    value: "cleartoken",
    label: "Clear Credit",
    helperText: "Clears existing credit on the meter. No units required.",
    fields: [],
  },
  {
    value: "keychange",
    label: "Key Change",
    helperText: "Rekeys the meter to a new TI / SGC / KRN. Returns two tokens.",
    fields: ["to_ti", "to_sgc", "to_krn"],
  },
];

export const issueEngineeringToken = (payload: EngineeringTokenPayload) => {
  return post<EngineeringTokenResponse>("/vendor/tokens/engineering/", payload);
};

// ═════════════════════════════════════════════════════════════════════════
// BULK UPLOAD — added for the Bulk Engineering page. Nothing above this
// line was touched, so the single-token page that already imports from
// here keeps working exactly as before.
// ═════════════════════════════════════════════════════════════════════════

/** A single issued token, as returned in `results[]` on a 200 response */
export interface BulkEngineeringResultRow {
  token: string;
  token2?: string;
  description: string;
  value: string;
  units?: string;
  invoice_id: string;
  krn?: string;
  ti?: string;
  sgc?: string;
}

/** JSON summary returned on a full (200) success */
export interface BulkEngineeringSummary {
  status: string;
  issued: number;
  results: BulkEngineeringResultRow[];
}

/**
 * Outcome of a bulk upload attempt. The endpoint returns three very different
 * shapes depending on what happened, so this normalizes them for the UI:
 *   - success  → 200, every row issued, JSON summary
 *   - partial  → 207, validation passed but some rows failed at the gateway,
 *                a CSV report is returned instead of JSON
 *   - error    → 400 (validation failed) or 502 (all rows failed at the
 *                gateway) or any other failure; a CSV report may be present
 */
export type BulkEngineeringOutcome =
  | { kind: "success"; summary: BulkEngineeringSummary; httpStatus: 200 }
  | { kind: "partial"; message: string; csvReport: string; httpStatus: 207 }
  | { kind: "error"; message: string; csvReport?: string; httpStatus?: number };

const isCsvLike = (data: unknown): data is string =>
  typeof data === "string" && data.trim().length > 0;

const extractBulkEngineeringError = (data: any): string => {
  if (!data) return "The bulk upload failed. Please try again.";
  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;
  if (typeof data.error === "string") return data.error;
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
    return data.non_field_errors.join(" ");
  }
  const msgs: string[] = [];
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v)) msgs.push(`${k}: ${(v as string[]).join(", ")}`);
  }
  return msgs.length ? msgs.join(" | ") : "The bulk upload failed. Please try again.";
};

/**
 * POST /vendor/tokens/engineering/bulk/
 * multipart/form-data — single `file` field (CSV of engineering token rows,
 * one row per token: vend_type, meter_number, units, kilowatt, to_ti, to_sgc,
 * to_krn, reason). Requires `issue_engineering_tokens`.
 *
 *   200 — every row succeeded; JSON summary { status, issued, results[] }
 *   207 — validation passed but some rows failed at the gateway; CSV report
 *   400 — validation failed; CSV error report returned, nothing issued
 *   502 — every row failed at the gateway; CSV report returned
 */
export const uploadBulkEngineeringTokens = async (
  file: File
): Promise<BulkEngineeringOutcome> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const data = await post<any>("/vendor/tokens/engineering/bulk/", formData);

    // 200 — full success, JSON summary
    if (data && typeof data === "object" && "issued" in data) {
      return { kind: "success", summary: data as BulkEngineeringSummary, httpStatus: 200 };
    }
    // 207 — partial success, CSV report of gateway failures
    if (isCsvLike(data)) {
      return {
        kind: "partial",
        message:
          "Validation passed, but some rows failed at the gateway. Review the report below.",
        csvReport: data,
        httpStatus: 207,
      };
    }
    // Unexpected shape on a 2xx — treat cautiously as a success with whatever we got
    return { kind: "success", summary: data as BulkEngineeringSummary, httpStatus: 200 };
  } catch (err: any) {
    const status = err?.response?.status;
    const respData = err?.response?.data;

    if (isCsvLike(respData)) {
      const message =
        status === 502
          ? "Every row failed at the gateway. Review the report below."
          : "Validation failed for one or more rows. Review the report below.";
      return { kind: "error", message, csvReport: respData, httpStatus: status };
    }
    return {
      kind: "error",
      message: extractBulkEngineeringError(respData) || err?.message,
      httpStatus: status,
    };
  }
};

/** Trigger a browser download of a raw CSV string (used for the error/partial reports above) */
export const downloadCsvReport = (csvText: string, filename = "bulk-engineering-report.csv") => {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// ═════════════════════════════════════════════════════════════════════════
// SAVED TOKENS — for the "Engineering Tokens" tab on the customer detail
// view. Nothing above this line was touched.
// ═════════════════════════════════════════════════════════════════════════

/** A single previously-issued engineering token, as returned by the saved-tokens endpoint */
export interface SavedEngineeringToken {
  id: number;
  meter_number: string;
  vend_type: VendType;
  token: string;
  token2?: string;
  token_type: string;
  units?: string;
  amount?: string;
  reason: string;
  invoice_id: string;
  krn?: string;
  ti?: string;
  sgc?: string;
  timestamp: string;
  issued_by: string;
}

/**
 * GET /vendor/tokens/engineering/saved/?customer_id=
 * Previously issued engineering tokens for a customer, most recent first.
 * Requires `issue_engineering_tokens`. The documented response is a plain
 * array, but this also tolerates a paginated `{ results: [...] }` shape in
 * case that changes later.
 */
export const getSavedEngineeringTokens = async (
  customerId: number | string
): Promise<SavedEngineeringToken[]> => {
  const data = await get<any>(`/vendor/tokens/engineering/saved/?customer_id=${customerId}`);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};