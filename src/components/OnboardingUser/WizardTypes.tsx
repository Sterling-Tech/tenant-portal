
// ─── Shared wizard step definitions ─────────────────────────────────────────
export interface WizardStep {
  label: string;
  description: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { label: "Parent",    description: "Select required parent entity" },
  { label: "Basic",     description: "Name, license and status" },
  { label: "Profile",   description: "Address, contact and business info" },
  { label: "KYC",       description: "Identity and compliance documents" },
  { label: "Controls",  description: "Limits, commissions and tx types" },
  { label: "Agreement", description: "Review and confirm" },
];

// ─── Shared step field shapes (steps 2–6 are identical across all entities) ──

export interface BasicFormData {
  entityName: string;   // "Vendor name", "Subvendor name", etc.
  license: string;
  subdomain: string;
  adminEmail: string;
  adminPassword: string;
  trialEnds: string;
  relatedVendor:string;
}

export interface ProfileFormData {
  businessName: string;
  businessType: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  contactEmail: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  website: string;
  secondaryEmail: string;
  nationality: string;
}

export interface KYCFormData {
  cacNumber: string;
  taxId: string;
  directorName: string;
  idType: string;
  idNumber: string;
  dateOfBirth: string;
}

export interface ControlsFormData {
  dailyFundingCap: string;
  maxPerTransaction: string;
  // commissionRate: string | null;
  commissionRate: string;
  monthlyVolumeTarget: string;
  permittedTxTypes: Record<string, boolean>;
}

export interface AgreementFormData {
  agreementType: string;
  effectiveDate: string;
  agreedToTerms: boolean;
  companyWebsite: string;
}

export const DEFAULT_TX_TYPES: Record<string, boolean> = {
  "Vend - prepaid token": true,
  "Vend - postpaid": true,
  "Debt collection": true,
  "Refund": true,
  "Wallet transfer": true,
};
export const NATIONALITY_OPTIONS = [
    'Nigerian',
    'Ghanaian',
    'Kenyan',
    'South African',
    'Ugandan',
    'Tanzanian',
    'Rwandan',
    'Ethiopian',
    'Egyptian',
    'Moroccan',
    'Other African',
    'British',
    'American',
    'Canadian',
    'Indian',
    'Chinese',
    'Other',
];
export const RELATEDVENDORS=[
    'DISCO',
    'BEDC',
    'Others'
]
export const EMPTY_BASIC: BasicFormData = {
  entityName: "", license: "", subdomain: "", adminEmail: "", 
  adminPassword: "", trialEnds:"", relatedVendor:"",
};

export const EMPTY_PROFILE: ProfileFormData = {
  businessName: "", businessType: "Fintech / Payment company",
  streetAddress: "", city: "", state: "", postalCode: "",
  phone: "", contactEmail: "", bankName: "", accountNumber: "", 
  accountName: "", website:" ", secondaryEmail: "", nationality:"",
};

export const EMPTY_KYC: KYCFormData = {
  cacNumber: "", taxId: "", directorName: "",
  idType: "National ID (NIN)", idNumber: "", dateOfBirth: "",
};

export const EMPTY_CONTROLS: ControlsFormData = {
  dailyFundingCap: "", maxPerTransaction: "",
  commissionRate: "", monthlyVolumeTarget: "",
  permittedTxTypes: { ...DEFAULT_TX_TYPES },
};

export const EMPTY_AGREEMENT: AgreementFormData = {
  agreementType: "Standard Disco vendor agreement",
  effectiveDate: "",
  agreedToTerms: false,
  companyWebsite: "",
};

