import { get, post, patch, del, put } from './api';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
export interface Supplier {
    id: number;
    name: string;
    code: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    is_active: boolean;
    created_at: string;
}
export interface SupplierProp {
    name: string;
    code: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    is_active: boolean;
}
export interface Ringfences {
    id: number;
    name: string;
    description: string;
    code: string;
    is_active: boolean;
    vendor_count: number;
    customer_count: number;
    created_at: string;
    supplier: Supplier;
}
export interface CreateSchemePayload {
    supplier: number;
    name: string;
    code: string;
    description: string;
}
export interface UpdateSchemePayload {
    name: string;
    description: string;
    is_active: boolean;
}

export interface AssignVendorPayload {
    scheme: number;
    vendors: number[];
}

export interface AssignCustomerPayload {
    scheme: number;
    customers: number[];
}

export interface AssignedVendor {
    id: number;
    vendor: {
        id: number;
        email: string;
        business_name: string;
        account_status: string;
        hierarchy: string;
    };
    is_active: boolean;
    assigned_at: string;
}

export const retrieveSchemes = ()=>{
  return get<PaginatedResponse<Ringfences>>("/scheme/")
}

export const retrieveSuppliers = ()=>{
    return get<PaginatedResponse<Supplier>>("/scheme/supplier/")
}
export const createSupplier = (payload:SupplierProp)=>{
    return post<Supplier>("/scheme/supplier/",payload)
}

export const createScheme = (
    payload: CreateSchemePayload
) => {
    return post<Ringfences>(
        "/scheme/",
        payload
    );
};

export const updateScheme = (
    schemeId: number,
    payload: UpdateSchemePayload
) => {
    return put<Ringfences>(
        `/scheme/?scheme_id=${schemeId}`,
        payload
    );
};


export const assignVendors = (
    payload: AssignVendorPayload
) => {
    return post("/scheme/vendors/", payload);
};

export const assignCustomers = (
    payload: AssignCustomerPayload
) => {
    return put("/scheme/customers/", payload);
};



export const retrieveAssignedVendors = (
    schemeId: number
) => {
    return get<AssignedVendor[]>(
        `/scheme/vendors/?scheme_id=${schemeId}`
    );
};

export const unassignVendor = (
    schemeId: number,
    vendorId: number
) => {
    return del(
        `/scheme/vendors/?scheme_id=${schemeId}&vendor_id=${vendorId}`
    );
};

