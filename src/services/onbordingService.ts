// import { VendorForm } from '../components/OnboardingUser/OnboardingVendor';
// import { get, post, patch, del, put } from './api';

// export interface CreateVendorPayload {
//     business_name: string;
//     email: string;
//     phone_number: string;
//     address: string;
//     city: string;
//     state: string;
//     country: string;
//     postal_code: string;
//     hierachy: string;
//     //related_vendor: string | null;
//     domain: string;
//     sub_domain: string;
//     slug: string;
//     trial_ends: string | null;
//     description: string;
//     industry: string;
//     category: string;
//     registration_number: string;
//     cac_registration_number: string;
//     website: string;
//     contact_name: string;
//     email1: string;
//     email2: string;
//     bank_name: string;
//     account_name: string;
//     account_number: string;
//     owner_name: string;
//     dob: string | null;
//     nationality: string;
//     id_type: string;
//     id_number: string;
//     owner_address: string;
//     entity_name: string;
//     company_website: string;
//     company_address: string;
//     signatory_name: string;
//     signatory_phone_number: string;
//     signatory_email: string;
//     funding_cap: string;
//     transaction_max: string;
//     commission_rate: string | null;
//     monthly_target: string;
// }

// export interface ConfigureVendorPayload {
//     funding_cap: string;
//     transaction_max: string;
//     commission_rate: string | null;
//     monthly_target: string;
// }
// export interface ConfigureVendorResponse {
//     id: number;
//     business_name: string;
//     email: string;
//     phone_number: string;
//     address: string;
//     city: string;
//     state: string;
//     country: string;
//     postal_code: string;
//     account_status: string;
//     hierachy: string;

//     related_vendor: RelatedVendorProp | null;

//     funding_cap: string;
//     transaction_max: string;
//     commission_rate: string | null;
//     monthly_target: string;

//     token: string;

//     wallet: Wallet;

//     domain: string;
//     sub_domain: string;
//     slug: string;
//     trial_ends: string | null;
//     description: string;
//     industry: string;
//     category: string;
//     registration_number: string;
//     cac_registration_number: string;
//     website: string;
//     contact_name: string;
//     email1: string;
//     email2: string;
//     bank_name: string;
//     account_name: string;
//     account_number: string;
//     owner_name: string;
//     dob: string | null;
//     nationality: string;
//     id_type: string;
//     id_number: string;
//     owner_address: string;
//     entity_name: string;
//     company_website: string;
//     company_address: string;
//     signatory_name: string;
//     signatory_phone_number: string;
//     signatory_email: string;

//     created_at: string;
// }

// export interface RelatedVendorResponse{
//     id: number;
//     email: string;
//     business_name: string;
//     account_status: AccountStatus;
//     vendor_type: "internal" | "external";
//     kyc_status?: "pending" | "approved" | "rejected";
//     hierachy: VendorHierarchy;
//     onboarding_status?: "invited" | "onboarded" | "rejected";
//     kyc_submitted_at?: string | null;
//     kyc_reviewed_at?: string | null;
//     kyc_rejection_reason?: string | null;
// }

// export interface OnboardVendorPayload{
//     email:string;
//     password:string;
//     business_name:string;
// }
// // export interface OnboardVendorPayload {
// //   email: string;
// //   password: string;
// //   business_name: string;
// //   hierachy: VendorHierarchy;
// //   related_vendor?: number | null;
// // }
// export interface Contacts {
//     id: number;
//     name: string;
//     email: string;
//     phone: string;
//     is_primary: boolean;
// }
// export type VerificationStatus = "pending" | "verified" | "rejected";

// export interface Owners {
//     id: number;
//     name: string;
//     dob: string;
//     nationality: string;
//     id_type: string;
//     id_number: string;
//     address: string;
//     verification_status: VerificationStatus;
// }
// export interface BankAccounts {
//     id: number;
//     bank_name: string;
//     account_name: string;
//     account_number: string;
//     is_primary: boolean;
//     verification_status: VerificationStatus;
// }
// export interface Wallet {
//     balance: string;
//     credit_balance: string;
//     credit_limit: string;
// }
// // export interface Profile {
// //     additionalProp1: string;
// //     additionalProp2: string;
// //     additionalProp3: string;
// // }
// export interface Profile {
//     description: string | null;
//     industry: string | null;
//     category: string | null;
//     registration_number: string | null;
//     cac_registration_number: string | null;
//     website: string | null;
//     address?: string;
//     city?: string;
//     state?: string;
//     country?: string;
//     postal_code?: string | null;
//     domain: string | null;
//     sub_domain: string | null;
//     slug: string | null;
//     trial_ends: string | null;
// }
// // export interface Agreement {
// //     additionalProp1: string;
// //     additionalProp2: string;
// //     additionalProp3: string;
// // }
// export interface Agreement {
//     accepted: boolean;
//     accepted_at: string | null;
//     document_url: string;
// }
// export type AccountStatus = "active" | "inactive" | "suspended";
// export type VendorHierarchy = "vendor" | "sub_vendor" | "agent" | "cashier" | "pos";

// export interface RelatedVendorProp {
//     id: number;
//     email: string;
//     business_name: string;
//     account_status: AccountStatus;
//     hierachy: VendorHierarchy;
//     vendor_type: string;
// }

// export interface Vendor {
//     id: number;
//     business_name: string;
//     email: string;
//     phone_number: string;
//     account_status: AccountStatus;
//     hierachy: VendorHierarchy;
//     vendor_type: "internal" | "external";
//     related_vendor: RelatedVendorProp | null;
//     funding_cap: string;
//     transaction_max: string;
//     commission_rate: string | null;
//     monthly_target: string;
//     onboarding_status: "invited"| "onboarded" | "rejected";
//     kyc_submitted_at: string | null;
//     kyc_reviewed_at: string | null;
//     kyc_rejection_reason: string | null;
//     token: string;
//     test_token: string;
//     test_token_expires_at: string;
//     test_balance: string;
//     wallet: Wallet;
//     profile: Profile;
//     agreement: Agreement;
//     bank_accounts: BankAccounts[];
//     owners: Owners[];
//     contacts: Contacts[];
//     created_at: string;
// }
// export type OnboardVendorResponse = Vendor;

// export interface PaginatedResponse<T> {
//   count: number;
//   next: string | null;
//   previous: string | null;
//   results: T[];
// }

// export interface VendorKycReviewPayload {
//   vendor: number;
//   action: "approve" | "reject";
//   reason?: string;
// }
// export interface OnboardingPolicy {
//   test_key_validity_days: number;
//   test_starting_balance: string;
//   updated_at: string;
// }

// export interface UpdateOnboardingPolicyPayload {
//   test_key_validity_days: number;
//   test_starting_balance: string;
// }

// export const createVendor = async (payload: CreateVendorPayload) => {
//     return post("/vendor/create/", payload);
// };

// export const getAllVendors = async () => {
//     return get<RelatedVendorResponse[]>(
//         "/vendor/retrieve/all/"
//     );
// };

// export const onboardVendor=(payload:OnboardVendorPayload)=>{
//     return post<Vendor>("/vendor/create/",payload)
// }
// export const getPendingKycVendors = async (): Promise<Vendor[]> => {
//   const data = await get<PaginatedResponse<Vendor>>(
//     "/vendor/kyc/pending/"
//   );

//   console.log("KYC pending response:", data);

//   return data.results ?? [];
// };

// export const reviewVendorKyc = async (payload: VendorKycReviewPayload): Promise<Vendor> => {
//   return put<Vendor>("/vendor/kyc/review/", payload);
// };


// export const getOnboardingPolicy = async (): Promise<OnboardingPolicy> => {
//   return get("/vendor/onboarding/policy/");
// };

// export const updateOnboardingPolicy = async (payload: UpdateOnboardingPolicyPayload): Promise<OnboardingPolicy> => {
//   return put<OnboardingPolicy>("/vendor/onboarding/policy/", (payload));
// };


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
    commission_rate: string | null;
    monthly_target: string;
}

export interface ConfigureVendorPayload {
    funding_cap: string;
    transaction_max: string;
    commission_rate: string | null;
    monthly_target: string;
}
export interface ConfigureVendorResponse {
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

    related_vendor: RelatedVendorProp | null;

    funding_cap: string;
    transaction_max: string;
    commission_rate: string | null;
    monthly_target: string;

    token: string;

    wallet: Wallet;

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

    created_at: string;
}

export interface RelatedVendorResponse{
    id: number;
    email: string;
    business_name: string;
    account_status: AccountStatus;
    vendor_type: "internal" | "external";
    kyc_status?: "pending" | "approved" | "rejected";
    hierachy: VendorHierarchy;
    onboarding_status?: "invited" | "onboarded" | "rejected";
    kyc_submitted_at?: string | null;
    kyc_reviewed_at?: string | null;
    kyc_rejection_reason?: string | null;
}

export interface OnboardVendorPayload{
    email:string;
    password:string;
    business_name:string;
}
export interface Contacts {
    id: number;
    name: string;
    email: string;
    phone: string;
    is_primary: boolean;
}
export type VerificationStatus = "pending" | "verified" | "rejected";

export interface Owners {
    id: number;
    name: string;
    dob: string;
    nationality: string;
    id_type: string;
    id_number: string;
    address: string;
    verification_status: VerificationStatus;
}
export interface BankAccounts {
    id: number;
    bank_name: string;
    account_name: string;
    account_number: string;
    is_primary: boolean;
    verification_status: VerificationStatus;
}
export interface Wallet {
    balance: string;
    credit_balance: string;
    credit_limit: string;
}
// export interface Profile {
//     additionalProp1: string;
//     additionalProp2: string;
//     additionalProp3: string;
// }
export interface Profile {
    description: string | null;
    industry: string | null;
    category: string | null;
    registration_number: string | null;
    cac_registration_number: string | null;
    website: string | null;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string | null;
    domain: string | null;
    sub_domain: string | null;
    slug: string | null;
    trial_ends: string | null;
}
// export interface Agreement {
//     additionalProp1: string;
//     additionalProp2: string;
//     additionalProp3: string;
// }
export interface Agreement {
    accepted: boolean;
    accepted_at: string | null;
    document_url: string;
}
export type AccountStatus = "active" | "inactive" | "suspended";
export type VendorHierarchy = "vendor" | "sub_vendor" | "agent" | "cashier" | "pos";

export interface RelatedVendorProp {
    id: number;
    email: string;
    business_name: string;
    account_status: AccountStatus;
    hierachy: VendorHierarchy;
    vendor_type: string;
}

export interface Vendor {
    id: number;
    business_name: string;
    email: string;
    phone_number: string;
    account_status: AccountStatus;
    hierachy: VendorHierarchy;
    vendor_type: "internal" | "external";
    related_vendor: RelatedVendorProp | null;
    funding_cap: string;
    transaction_max: string;
    commission_rate: string | null;
    monthly_target: string;
    onboarding_status: "invited"| "onboarded" | "rejected";
    kyc_submitted_at: string | null;
    kyc_reviewed_at: string | null;
    kyc_rejection_reason: string | null;
    token: string;
    test_token: string;
    test_token_expires_at: string;
    test_balance: string;
    wallet: Wallet;
    profile: Profile;
    agreement: Agreement;
    bank_accounts: BankAccounts[];
    owners: Owners[];
    contacts: Contacts[];
    created_at: string;
}
export type OnboardVendorResponse = Vendor;

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface VendorKycReviewPayload {
  vendor: number;
  action: "approve" | "reject";
  reason?: string;
}
export interface OnboardingPolicy {
  test_key_validity_days: number;
  test_starting_balance: string;
  updated_at: string;
}

export interface UpdateOnboardingPolicyPayload {
  test_key_validity_days: number;
  test_starting_balance: string;
}

export const createVendor = async (payload: CreateVendorPayload) => {
    return post("/vendor/create/", payload);
};

export const getAllVendors = async () => {
    return get<RelatedVendorResponse[]>(
        "/vendor/retrieve/all/"
    );
};

export const onboardVendor=(payload:OnboardVendorPayload)=>{
    return post<Vendor>("/vendor/create/",payload)
}
export const getPendingKycVendors = async (): Promise<Vendor[]> => {
  const data = await get<PaginatedResponse<Vendor>>(
    "/vendor/kyc/pending/"
  );

  console.log("KYC pending response:", data);

  return data.results ?? [];
};

export const reviewVendorKyc = async (payload: VendorKycReviewPayload): Promise<Vendor> => {
  return put<Vendor>("/vendor/kyc/review/", payload);
};


export const getOnboardingPolicy = async (): Promise<OnboardingPolicy> => {
  return get("/vendor/onboarding/policy/");
};

export const updateOnboardingPolicy = async (payload: UpdateOnboardingPolicyPayload): Promise<OnboardingPolicy> => {
  return put<OnboardingPolicy>("/vendor/onboarding/policy/", (payload));
};