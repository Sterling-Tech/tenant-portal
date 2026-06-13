import { VendorForm } from '../components/OnboardingUser/OnboardingVendor';
import { get, post, patch, del, put } from './api';

export interface CreateVendorPayload {
    business_name: string;
    email: string;
    phone_number: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    hierachy: string;
    //related_vendor: string | null;
    domain: string;
    sub_domain: string;
    slug: string;
    trial_ends: string | null;
    description: string;
    industry: string;
    category: string;
    registration_number: string;
    cac_registration_number: string;
    website: string;
    contact_name: string;
    email1: string;
    email2: string;
    bank_name: string;
    account_name: string;
    account_number: string;
    owner_name: string;
    dob: string | null;
    nationality: string;
    id_type: string;
    id_number: string;
    owner_address: string;
    entity_name: string;
    company_website: string;
    company_address: string;
    signatory_name: string;
    signatory_phone_number: string;
    signatory_email: string;
    funding_cap: string;
    transaction_max: string;
    commission_rate: number | null;
    monthly_target: string;
}
export interface RelatedVendorProp {
    id: number;
    email: string;
    business_name: string;
    account_status: string;
    hierachy: string;
}

export interface WalletType {
    name: string;
    description: string;
}

export interface Wallet {
    wallet_type: WalletType;
    balance: string;
}

export interface RelatedVendorResponse {
    id: number;
    business_name: string;
    email: string;
    phone_number: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    account_status: string;
    hierachy: string;

    //related_vendor: RelatedVendorProp | null;

    token: string;

    wallet: Wallet;

    created_at: string;
}
export const createVendor = async (payload: CreateVendorPayload) => {
    return post("/vendor/create/", payload);
};

export const relatedVendort = async ()=>{
    return get<RelatedVendorResponse[]>('/vendor/retrieve/related-children/');
}