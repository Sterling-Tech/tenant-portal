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
    // suppliers: Supplier;
    supplier: Supplier;
}
export interface CreateSchemePayload {
    supplier: number;
    name: string;
    code: string;
    description: string;
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