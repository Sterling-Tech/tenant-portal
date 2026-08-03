import {
    BasicFormData,
    ProfileFormData,
    KYCFormData,
    ControlsFormData,
    AgreementFormData,
} from "./WizardTypes";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const accountRegex = /^\d{10}$/;
const urlRegex =
    /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i;
export function validateBasic(data: BasicFormData) {
    const errors: Partial<
        Record<keyof BasicFormData, string>
    > = {};

    if (!data.entityName.trim()) {
        errors.entityName = "Entity name is required";
    }

    if (!data.license.trim()) {
        errors.license = "License / Domain is required";
    }

    if (!data.subdomain.trim()) {
        errors.subdomain = "Subdomain is required";
    }

    if (!data.adminEmail.trim()) {
        errors.adminEmail = "Admin email is required";
    } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.adminEmail)
    ) {
        errors.adminEmail = "Enter a valid email address";
    }

    if (!data.trialEnds) {
        errors.trialEnds = "Trial end date is required";
    }
    return errors;
}
export function validateProfile(
    data: ProfileFormData
) {
    const errors: Partial<
        Record<keyof ProfileFormData, string>
    > = {};

    if (!data.businessName.trim())
        errors.businessName =
            "Business name is required";

    if (!data.businessType)
        errors.businessType =
            "Business type is required";

    // if (!data.website.trim()) {
    //     errors.website =
    //         "Website is required";
            
    // } 
    // else if (!urlRegex.test(data.website)) {
    //     errors.website =
    //         "Enter a valid website";
    // }

    if (!data.streetAddress.trim())
        errors.streetAddress =
            "Street address is required";

    if (!data.nationality)
        errors.nationality =
            "Nationality is required";

    if (!data.city.trim())
        errors.city = "City is required";

    if (!data.state.trim())
        errors.state = "State is required";

    if (!data.postalCode.trim())
        errors.postalCode =
            "Postal code is required";

    if (!data.phone.trim())
        errors.phone =
            "Phone number is required";

    if (!data.contactEmail.trim()) {
        errors.contactEmail =
            "Contact email is required";
    } else if (!emailRegex.test(data.contactEmail)) {
        errors.contactEmail =
            "Invalid email";
    }

    if (!data.secondaryEmail.trim()) {
        errors.secondaryEmail =
            "Secondary email is required";
    } else if (
        !emailRegex.test(data.secondaryEmail)
    ) {
        errors.secondaryEmail =
            "Invalid email";
    }

    if (!data.bankName.trim())
        errors.bankName =
            "Bank name is required";

    if (!data.accountNumber.trim()) {
        errors.accountNumber =
            "Account number is required";
    } else if (
        !accountRegex.test(data.accountNumber)
    ) {
        errors.accountNumber =
            "Account number must be 10 digits";
    }

    if (!data.accountName.trim())
        errors.accountName =
            "Account name is required";

    return errors;
}
export function validateKYC(
    data: KYCFormData
) {
    const errors: Partial<
        Record<keyof KYCFormData, string>
    > = {};
    if (!data.cacNumber.trim()) {
        errors.cacNumber =
            "CAC registration number is required";
    }

    if (!data.taxId.trim()) {
        errors.taxId =
            "Tax Identification Number is required";
    }

    if (!data.directorName.trim()) {
        errors.directorName =
            "Director / Owner name is required";
    }

    if (!data.dateOfBirth) {
        errors.dateOfBirth =
            "Date of birth is required";
    }

    if (!data.idType) {
        errors.idType =
            "Please select an ID type";
    }

    if (!data.idNumber.trim()) {
        errors.idNumber =
            "ID number is required";
    }

    return errors;
}
export function validateControls(
    data: ControlsFormData
) {
    const errors: Partial<
        Record<keyof ControlsFormData, string>
    > = {};
    if (!data.dailyFundingCap.trim()) {
        errors.dailyFundingCap =
            "Daily funding cap is required";
    }

    if (!data.maxPerTransaction.trim()) {
        errors.maxPerTransaction =
            "Maximum transaction amount is required";
    }

    if (!data.commissionRate.trim()) {
        errors.commissionRate =
            "Commission rate is required";
    }

    if (!data.monthlyVolumeTarget.trim()) {
        errors.monthlyVolumeTarget =
            "Monthly volume target is required";
    }

    return errors;
}
export function validateAgreement(
    data: AgreementFormData
) {
    const errors: Partial<
        Record<keyof AgreementFormData, string>
    > = {};
    if (!data.agreementType) {
        errors.agreementType =
            "Please select an agreement type";
    }

    if (!data.companyWebsite.trim()) {
        errors.companyWebsite =
            "Company website is required";
    } else {
        const urlRegex =
            /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i;

        if (
            !urlRegex.test(
                data.companyWebsite
            )
        ) {
            errors.companyWebsite =
                "Enter a valid website";
        }
    }

    if (!data.effectiveDate) {
        errors.effectiveDate =
            "Effective date is required";
    }

    if (!data.agreedToTerms) {
        errors.agreedToTerms =
            "You must accept the agreement before continuing.";
    }

    return errors;
}

export const saveDraft = (
    key: string,
    data: unknown
) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const getDraft = <T,>(key: string): T | null => {
    const data = localStorage.getItem(key);

    if (!data) return null;

    return JSON.parse(data);
};

export const clearDraft = (key: string) => {
    localStorage.removeItem(key);
};
export const DRAFT_KEYS = {
    VENDOR: "vendor_onboarding_draft",
    SUBVENDOR: "subvendor_onboarding_draft",
    AGENT: "agent_onboarding_draft",
    CASHIER: "cashier_onboarding_draft",
    POS: "pos_onboarding_draft",
} as const;
