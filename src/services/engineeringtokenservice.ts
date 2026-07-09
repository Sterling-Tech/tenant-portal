import { post } from "./api";

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