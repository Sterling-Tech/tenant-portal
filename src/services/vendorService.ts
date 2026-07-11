import { get, post, patch, del, put } from './api';


// export interface Vendor {
//   id: string
//   business_name: string
//   email: string
//   phone_number: string
//   address: string
//   city: string
//   state: string
//   country: string
//   postal_code: string
//   account_status: "active" | "inactive"
//   hierachy: string
//   related_vendor: number | null
//   token: string
//   wallet?: {
//     wallet_type?: {
//       name: string
//       description?: string
//     }
//     balance: string
//   }
//   created_at: string
// }
export interface VendorQuery {
  page?: number;
  vendor_id?: number;
  main_vendor?: boolean;
  account_status?: "all" | "active" | "inactive" | "suspended";
  search?: string;
}


export interface Vendor {
  id: string;
  business_name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;

  account_status: "active" | "inactive" | "suspended";

  hierachy: string;

  related_vendor: number | null;

  funding_cap: number | null;
  transaction_max: number | null;
  commission_rate: number | null;
  monthly_target: number | null;

  token: string;

  wallet?: {
    wallet_type?: {
      name: string;
      description: string;
    };
    balance: string;
  };

  domain?: string;
  sub_domain?: string;
  slug?: string;

  description?: string;
  industry?: string;
  category?: string;

  registration_number?: string;
  cac_registration_number?: string;

  website?: string;

  contact_name?: string;

  email1?: string;
  email2?: string;

  bank_name?: string;
  account_name?: string;
  account_number?: string;

  owner_name?: string;
  dob?: string;
  nationality?: string;

  id_type?: string;
  id_number?: string;

  owner_address?: string;

  entity_name?: string;
  company_website?: string;
  company_address?: string;

  signatory_name?: string;
  signatory_phone_number?: string;
  signatory_email?: string;

  created_at: string;
}


export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
export interface PaginatedVendorResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Vendor[];
}
export interface Debt {
    id: string,
    customer: {
      name: string
      address: string
    }
    description: string
    payment_plan: {
      id: number
      name: string
      description: string
      code: string
    }
    effective_date: string
    rate: number
    debt_type: string
    balance: string
    last_debit: string
}


export interface DebtHistory {
  transaction_ref: string
  amount_paid: string
  timestamp: string
}

export interface PaginatedDebtHistory {
  count: number;
  next: string | null;
  previous: string | null;
  results: DebtHistory[];
}

export interface CustomerTransaction {
  id: number;
  vendor?: {
    id?: number;
    email?: string;
    business_name?: string;
    account_status?: string;
    hierachy?: string;
  };

  transaction_ref?: string;
  token?: string;
  amount?: string;
  timestamp?: string;
}

export interface PaginatedCustomerTransactions {
  count: number;
  next: string | null;
  previous: string | null;
  results: CustomerTransaction[];
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone_number?: string;
  account_number?: string;
  meter_number?: string;

  customer_category?: {
    id: number;
    name: string;
    description?: string;
  };

  customer_class?: {
    id: number;
    name: string;
    description?: string;
    category?: {
      id: number;
      name: string;
    };
  };

  metering_type?: {
    id: number;
    name: string;
    description?: string;
  };

  wallet?: {
    id: number;
    balance?: string;

    wallet_type?: {
      name?: string;
      description?: string;
    };
  };

  extra_info?: {
    address?: string;
    district?: string;
    feeder?: string;
    transformer?: string;
    service_center?: string;
    band?: string;
    tariff?: string | null;
    krn?: string | null;
    ti?: string | null;
    sgc?: string | null;
    kct1?: string | null;
    kct2?: string | null;
  };

  transactions?: CustomerTransaction[];
}


export interface PaginatedCustomerResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
}

export interface VendorForm {
    tenant?: string | null;
    business_name: string;
    email: string;
    phone_number?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    hierachy: string;
    related_vendor?: string;
}
export interface VendorFormMvp {
  // Basic Information
  business_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;

  // Hierarchy
  hierachy: string;
  related_vendor?: string | null;

  // Tenant Information
  domain?: string;
  sub_domain?: string;
  slug?: string;
  trial_ends?: string | null;
  description?: string;
  industry?: string;
  category?: string;

  // Business Registration
  registration_number?: string;
  cac_registration_number?: string;
  website?: string;

  // Contact Information
  contact_name?: string;
  email1?: string;
  email2?: string;

  // Bank Details
  bank_name?: string;
  account_name?: string;
  account_number?: string;

  // Owner Details
  owner_name?: string;
  dob?: string; // YYYY-MM-DD
  nationality?: string;
  id_type?: string;
  id_number?: string;
  owner_address?: string;

  // Company Details
  entity_name?: string;
  company_website?: string;
  company_address?: string;

  // Signatory Details
  signatory_name?: string;
  signatory_phone_number?: string;
  signatory_email?: string;
}
export interface VendorResponse extends VendorFormMvp {
  id: number;
  account_status: string;
  token: string;
  created_at: string;

  wallet: {
    wallet_type: {
      name: string;
      description: string;
    };
    balance: string;
  };
}

export interface Category {
    id: string;
    name: string;
    description: string;
}
export interface Ledger {
  transaction_ref: string
  debit_amount: string
  credit_amount: string
  timestamp: string
}
export interface PaginatedLedgerResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Ledger[];
  summary: {
    total_debits: number;
    total_credits: number;
  }
}
export interface AnalyticsCount {
  analytics: {
    total_revenue: number
    total_customers: number
    total_debt: number
    average_revenue: string
    collection_efficiency: number
    suspended_custommers: number
    days_collection: [
      {
        name: string,
        total_day_collection: string
      }
    ],
  }
}
export interface AnalyticsBreakdown {
  customer_category: {
    category_name: string;
    count: number;
  }[];

  metering_type: {
    name: string;
    count: number;
  }[];

  daily_transaction: {
    day: string;   // ISO date string
    total: number;
  }[];
  debt_exposure: {
    category_name: string
    total_collections: string
  }[],
    
}
export interface AnalyticsDashboad {
  vendor_summary: {
    all: string,
    inactive: string,
    active: string,
    aggregated_wallet_balance: string
  },
  user_summary: {
    customer_count: string,
    inactive_users: string
  },
  customer_summary: {
    total_customers: number,
    active_customers: string
  },
  transactions_today: string
}

export interface Class {
    id: number;
    category: {
      id: string;
      name: string;
      description: string;
    };
    name: string;
    description: string;
}
export interface MeteringType {
    id: string;
    name: string;
    description: string;
}
export interface CustomerForm {
  name: string;
  email: string;
  phone_number: string;
  address: string;

  customer_category: number;
  customer_class: number;
  metering_type: number;

  district: string;
  feeder: string;
  transformer: string;
  service_center: string;

  band: string;
  tariff: string;

  krn: string;
  ti: string;
  sgc: string;
  kct1: string;
  kct2: string;
}
export interface VendorAdminProfile {
    id: string;
    vendor: string;
    vendor_name?: string;
    user: string;
    user_email?: string;
    user_name?: string;
    organisation?: string | null;
    title?: string | null;
    department?: string | null;
    can_manage_users: boolean;
    can_manage_organisations: boolean;
    can_manage_configurations: boolean;
    can_view_analytics: boolean;
    created_at: string;
    updated_at: string;
}
export interface VendorPermissions {
    vendor_id: string;
    metadata: Record<string, unknown>;
    is_active: boolean;
    is_verified: boolean;
}
export interface VendorT {
  id: number;
  email: string;
  business_name: string;
  account_status: string;
  hierachy: string;
}
export type FundingRequestStatus =
    | "pending_review"
    | "pending_approval"
    | "approved"
    | "rejected";

export interface FundingRequest {
    id: number;
    transaction_ref: string;
    vendor: VendorT;
    amount: string;
    status: FundingRequestStatus;
    request_time: string;
}

export interface FundingRequestResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FundingRequest[];
}

export interface FundingRequestParams {
  page?: number;
  search?: string;
  ordering?: string;
  request_status?: FundingRequestStatus;
}
export type FundingAction =
    | "review"
    | "approve"
    | "reject";

export interface FundingOperationPayload {
    funding_request: number;
    action: FundingAction;
}

export const buildQuery = (params?: Record<string, unknown>) => {
    if (!params || Object.keys(params).length === 0) return '';
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            query.append(key, String(value));
        }
    });
    return query.toString() ? `?${query.toString()}` : '';
};


export const fetchTransactions = (params?: {
  start_date?: string;
  end_date?: string;
  vendor_id?: string;
  page?: number;
}) =>
  get<PaginatedLedgerResponse>(`/vendor/ledger/${buildQuery(params)}`)

export const fetchCustomers = (params?: {
  account_status?: string;
  metering_type_id?: string;
  class_id?: string;
  category_id ?: string;
  customer_id?: string;
    }) =>
    get<PaginatedCustomerResponse>(`/customer/${buildQuery(params)}`);

export const Customercategory = () =>
    get<Category[]>(`/customer/category/`);

export const MeteringTypeS = () =>
    get<MeteringType[]>(`/customer/metering-type/`);

export const CustomerClass = () =>
    get<Class[]>(`/customer/class/`);

//paginated vendors with optional filters
// export const fetchVendors = (params?: {
//   page?: number;
//   vendor_id?: number;
//   main_vendor?: boolean;
//   tenant?: string;
//   account_status?: string;
//   is_verified?: boolean;
//   search?: string;
// }) =>
//   get<PaginatedVendorResponse>(
//     `/vendor/retrieve/${buildQuery(params)}`
//   );

//   export const fetchVendors = (params?: VendorQuery) => {
//   const search = new URLSearchParams();

//   if (params?.page)
//     search.append("page", String(params.page));

//   if (params?.vendor_id)
//     search.append("vendor_id", String(params.vendor_id));

//   if (params?.main_vendor !== undefined)
//     search.append("main_vendor", String(params.main_vendor));

//   if (params?.account_status)
//     search.append("account_status", params.account_status);

//   return get<PaginatedResponse<Vendor>>(
//     `/vendor/retrieve/?${search.toString()}`
//   );
// };
export const fetchVendors = (params?: VendorQuery) => {
  const search = new URLSearchParams();

  if (params?.page) {
    search.append("page", String(params.page));
  }

  if (params?.vendor_id) {
    search.append("vendor_id", String(params.vendor_id));
  }

  if (params?.main_vendor !== undefined) {
    search.append("main_vendor", String(params.main_vendor));
  }

  if (params?.account_status && params.account_status !== "all") {
    search.append("account_status", params.account_status);
  }

  if (params?.search) {
    search.append("search", params.search);
  }

  return get<PaginatedResponse<Vendor>>(
    `/vendor/retrieve/?${search.toString()}`
  );
};
  // fetch all vendors without pagination

  export const fetchAllVendors = () =>
    get<Vendor[]>(`/vendor/retrieve/all/`);

export const fetchAllVendorsOnly = () =>
    get<PaginatedResponse<Vendor>>(
        "/vendor/retrieve/?main_vendor=true"
    );
export const fetchVendor = (id: string) =>
    get<Vendor>(`/vendor/retrieve/?vendor_id=${id}/`);

export const fetchVendorchildren = (id: string) =>
    get<Vendor[]>(`/vendor/retrieve-children/?vendor_id=${id}`);

export const searchCustomers = (keyword: string) =>
  get<PaginatedCustomerResponse>(
    `/customer/search/?keyword=${keyword}`
  );
export const fetchCustomer = (params?: {
  account_status?: string;
  metering_type_id?: string;
  class_id?: string;
  category_id ?: string;
  customer_id?: string;
    }) =>
    get<Customer>(`/customer/${buildQuery(params)}`);

export const fetchCustomerTransactions = (
  customerId: string | number,
  page?: number
) =>
  get<PaginatedCustomerTransactions>(
    `/customer/transactions/?customer_id=${customerId}${
      page ? `&page=${page}` : ""
    }`
  );

export const fetchDebt = (id?: string) =>
    get<Debt[]>(`/customer/debt/?customer_id=${id}`);

export const fetchDebtHistory = (id?: string) =>
  get<PaginatedDebtHistory>(
    id
      ? `/customer/debt/history/?debt_id=${id}`
      : `/customer/debt/history/`
  );

export interface PaymentPlan {
  name: string;
  description: string;
  code: string;
}

export const fetchPaymentPlans = () =>
  get<PaymentPlan[]>(`/customer/debt-plan/`);

// 🔹 Debt Analytics (GLOBAL KPI)
export const fetchDebtAnalytics = () =>
  get<{
    debt_summary: {
      customers_with_debt: number;
      total_outstanding_debts: number;
      recovered_this_month: number | null;
      total_debts: number;
    };
  }>("/customer/dashboard/analytics/");

// 🔹 Single Customer Debt Analytic
export const fetchCustomerDebtAnalytic = (customerId: string) =>
  get<{
    recovered_debt: number;
    remaining_debt: number;
    last_deduction: string;
  }>(`/customer/debt/analytic/?customer_id=${customerId}`);

// 🔹 Create Debt
export const createDebt = (payload: {
  customer: string;
  description: string;
  payment_plan: number;
  effective_date: string;
  rate: number;
  debt_type: string;
  amount: number;
}) => post("/customer/debt/", payload);

export const fetchanalytics = (params?: {
  start_date?: string
  end_date?: string
}) =>
  get<AnalyticsCount>(`/user/dashboard/analytics/${buildQuery(params)}`)

export const fetchAnalyticsDashboad = () =>
  get<AnalyticsDashboad>(`/user/dashboard-summary/`)

  
export const fetchAnalyticsBreakdown = () =>
    get<AnalyticsBreakdown>(`/user/dashboard/classification/`);

export const createCustomer = (payload: CustomerForm) =>
    post<Customer>('/customer/', payload);

export const createVendor = (payload: VendorForm) =>
    post<Vendor>('/vendor/create/', payload);

export const createVendorMvp = (payload: VendorFormMvp) =>
    post<VendorResponse>('/vendor/create/', payload);

// export const searchVendors = (keyword: string) =>
//   get<Vendor[] | PaginatedVendorResponse>(
//     `/vendor/search/?keyword=${keyword}`,
//     //`http://188.166.161.13:8061/vendor/search/?keyword=mama`
//   );
  export const searchVendors = (
  keyword: string,
  page = 1
) =>
  get<PaginatedVendorResponse>(
    `/vendor/search/?keyword=${encodeURIComponent(keyword)}&page=${page}`
  );
export const fundVendorWallet = (payload: {
  vendor: string;
  amount: number;
}) =>
  put(`/vendor/wallet/load/`, payload);

export const toggleVendorStatus = (vendorId: number | string) =>
  put(`/vendor/activate-deactivate/`, {
    vendor: String(vendorId),
  });
export const updateVendor = (id: string, payload: Partial<VendorForm>) =>
    patch<Vendor>(`/vendors/vendors/${id}/`, payload);

export const deleteVendor = (id: string) =>
    del<void>(`/vendors/vendors/${id}/`);

export const verifyVendor = (id: string) =>
    post<{ message: string; vendor: Vendor }>(`/vendors/vendors/${id}/verify/`, {});

export const fetchVendorApiKeys = (id: string) =>
    get<any[]>(`/vendors/vendors/${id}/api_keys/`);

export const createVendorApiKey = (id: string, payload: { scopes?: string[]; expires_at?: string | null }) =>
    post<any>(`/vendors/vendors/${id}/api_keys/`, payload);

export const fetchVendorAdmins = (id: string) =>
    get<VendorAdminProfile[]>(`/vendors/vendors/${id}/admins/`);

export const createVendorAdmin = (id: string, payload: Partial<VendorAdminProfile>) =>
    post<VendorAdminProfile>(`/vendors/vendors/${id}/admins/`, payload);

export const fetchVendorPermissions = (id: string) =>
    get<VendorPermissions>(`/vendors/vendors/${id}/permissions/`);

export const updateVendorPermissions = (id: string, payload: Partial<VendorPermissions>) =>
    patch<VendorPermissions>(`/vendors/vendors/${id}/permissions/`, payload);

export const fetchAllVendorAdmins = (params?: { vendor?: string }) =>
    get<VendorAdminProfile[]>(`/vendors/vendor-admins/${buildQuery(params)}`);

export const updateVendorAdmin = (id: string, payload: Partial<VendorAdminProfile>) =>
    patch<VendorAdminProfile>(`/vendors/vendor-admins/${id}/`, payload);

export const deleteVendorAdmin = (id: string) =>
    del<void>(`/vendors/vendor-admins/${id}/`);


export const getFundingRequests = (
    params?: FundingRequestParams
) => {

    const query = new URLSearchParams();

    if (params?.page)
        query.append("page", String(params.page));

    if (params?.search)
        query.append("search", params.search);

    if (params?.ordering)
        query.append("ordering", params.ordering);

    if (params?.request_status)
    query.append(
        "request_status",
        params.request_status
    );

    return get<FundingRequestResponse>(
        `/vendor/request-funding/${
            query.toString()
                ? `?${query}`
                : ""
        }`
    );
};

export const fundingOperation = (
    payload: FundingOperationPayload
) => {
    return put(
        "/vendor/funding/ops/",
        payload
    );
};