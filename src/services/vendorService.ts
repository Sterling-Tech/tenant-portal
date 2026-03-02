import { get, post, patch, del } from './api';

export interface Vendor {
    id: string;
    tenant: string | null;
    tenant_name?: string | null;
    name: string;
    slug: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postal_code?: string | null;
    is_active: boolean;
    is_verified: boolean;
    verification_date?: string | null;
    organisation_count?: number;
    admin_count?: number;
    metadata?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface VendorForm {
    tenant?: string | null;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    is_active?: boolean;
    is_verified?: boolean;
    metadata?: Record<string, unknown>;
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

export const fetchVendors = (params?: { tenant?: string; is_active?: boolean; is_verified?: boolean; search?: string }) =>
    get<Vendor[]>(`/vendors/vendors/${buildQuery(params)}`);

export const fetchVendor = (id: string) =>
    get<Vendor>(`/vendors/vendors/${id}/`);

export const createVendor = (payload: VendorForm) =>
    post<Vendor>('/vendors/vendors/', payload);

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

