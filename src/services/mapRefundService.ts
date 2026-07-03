import { refundGet } from "./apiService";

export interface RefundRequest {
  id: number;
  customer_name: string;
  account_number: string;
  meter_number: string;
  tariff_index: string;
  tariff: string;
  krn: string;
  sgc: string;
  amount: number;
  units: number;
  initial_balance: number;
  month: number;
  year: number;
  customer_id: string;
  subaccount_id: string;
  token: string;
  status: string;
  api_message: string;
  phone_no: string;
  email: string;
  email_delivered: boolean;
  sms_sent: boolean;
  tag: string;
  arrears_code: string;
  created_at: string;
  updated_at: string;
}

export interface RefundRequestResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RefundRequest[];
}

export interface RefundRequestParams {
  page?: number;
  search?: string;
  ordering?: string;
  status?: string;
  month?: number;
  year?: number;
  arrears_code?: string;
  email_delivered?: boolean;
  sms_sent?: boolean;
}
export interface RefundStatsResponse {
  period: string;
  month: number;
  year: number;
  total: number;
  pending: number;
  success: number;
  failed: number;
  success_rate: number;
  failure_rate: number;
}

interface StatsParams {
  month?: number;
  year?: number;
}


export const getRefundRequests = (
  params?: RefundRequestParams
) => {
  const query = new URLSearchParams();

  if (params?.page)
    query.append("page", params.page.toString());

  if (params?.search)
    query.append("search", params.search);

  if (params?.ordering)
    query.append("ordering", params.ordering);

  if (params?.status)
    query.append("status", params.status);

  if (params?.month)
    query.append("month", params.month.toString());

  if (params?.year)
    query.append("year", params.year.toString());

  if (params?.arrears_code)
    query.append("arrears_code", params.arrears_code);

  if (params?.email_delivered !== undefined)
    query.append(
      "email_delivered",
      String(params.email_delivered)
    );

  if (params?.sms_sent !== undefined)
    query.append(
      "sms_sent",
      String(params.sms_sent)
    );

  return refundGet<RefundRequestResponse>(
    `/meter-requests/${query.toString() ? `?${query}` : ""}`
  );
};
export const getStats = ({ month, year }: StatsParams = {}) => {
  const params = new URLSearchParams();

  if (month) params.append("month", String(month));
  if (year) params.append("year", String(year));

  return refundGet<RefundStatsResponse>(
    `/meter-requests/stats/${params.toString() ? `?${params.toString()}` : ""}`
  );
};
