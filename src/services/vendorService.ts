import { get, post, patch, del, put } from './api';

// export interface Vendor {
//     id: string;
//     tenant: string | null;
//     tenant_name?: string | null;
//     name: string;
//     slug: string;
//     email: string;
//     phone?: string | null;
//     address?: string | null;
//     city?: string | null;
//     state?: string | null;
//     country?: string | null;
//     postal_code?: string | null;
//     is_active: boolean;
//     is_verified: boolean;
//     verification_date?: string | null;
//     organisation_count?: number;
//     admin_count?: number;
//     metadata?: Record<string, unknown>;
//     created_at: string;
//     updated_at: string;
//     deleted_at?: string | null;
// }

// export interface VendorForm {
//     tenant?: string | null;
//     name: string;
//     email: string;
//     phone?: string;
//     address?: string;
//     city?: string;
//     state?: string;
//     country?: string;
//     postal_code?: string;
//     is_active?: boolean;
//     is_verified?: boolean;
//     metadata?: Record<string, unknown>;
// }
export interface Vendor {
  id: string
  business_name: string
  email: string
  phone_number: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  account_status: "active" | "inactive"
  hierachy: string
  related_vendor: number | null
  token: string
  wallet?: {
    wallet_type?: {
      name: string
      description?: string
    }
    balance: string
  }
  created_at: string
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
  name: string
  email: string
  phone_number: string
  address: string
  customer_category: number
  customer_class: number
  metering_type: number
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

const buildQuery = (params?: Record<string, unknown>) => {
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

export const fetchVendors = (params?: {
  page?: number;
  vendor_id?: number;
  main_vendor?: boolean;
  tenant?: string;
  account_status?: string;
  is_verified?: boolean;
  search?: string;
}) =>
  get<PaginatedVendorResponse>(
    `/vendor/retrieve/${buildQuery(params)}`
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

export const searchVendors = (keyword: string) =>
  get<Vendor[] | PaginatedVendorResponse>(
    `/vendor/search/?keyword=${keyword}`
  );
  
export const fundVendorWallet = (payload: {
  vendor: string;
  amount: number;
}) =>
  put(`/vendor/wallet/load/`, payload);

export const toggleVendorStatus = (vendorId: string) =>
  put(`/vendor/activate-deactivate/`, {
    vendor: vendorId,
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

