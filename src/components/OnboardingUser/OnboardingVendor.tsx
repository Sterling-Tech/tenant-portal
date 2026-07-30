
/**
 * OnboardingVendor
 * Entity: Vendor   Parent: Tenant (fixed)
 * API endpoint: POST /api/vendors
 */

import React, { useEffect, useState } from "react";
import { Box, Typography, FormControl, Select, MenuItem } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WizardShell from "./WizardShell";
import StepBasic from "./Stepbasic";
import StepProfile from "./Stepprofile";
import StepKYC from "./Stepkyc";
import StepControls from "./Stepcontrols";
import StepAgreement from "./Stepagreement";
import {
    BasicFormData, ProfileFormData, KYCFormData,
    ControlsFormData, AgreementFormData,
    EMPTY_BASIC, EMPTY_PROFILE, EMPTY_KYC, EMPTY_CONTROLS, EMPTY_AGREEMENT,
    DEFAULT_TX_TYPES,
} from "./WizardTypes";
import {
    createVendor,
} from "../../services/onbordingService";
import { validateProfile, validateBasic, validateKYC, validateControls, validateAgreement, saveDraft, getDraft, clearDraft, DRAFT_KEYS } from "./validation";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
// ─── Form shape ───────────────────────────────────────────────────────────────
export interface VendorForm {
    // Step 1 – parent is always "Tenant", no user input needed
    basic: BasicFormData;
    profile: ProfileFormData;
    kyc: KYCFormData;
    controls: ControlsFormData;
    agreement: AgreementFormData;
}

const EMPTY_FORM: VendorForm = {
    basic: { ...EMPTY_BASIC },
    profile: { ...EMPTY_PROFILE },
    kyc: { ...EMPTY_KYC },
    controls: { ...EMPTY_CONTROLS, permittedTxTypes: { ...DEFAULT_TX_TYPES } },
    agreement: { ...EMPTY_AGREEMENT },
};
//api/vendors

// ─── Step 1 — fixed parent display ───────────────────────────────────────────
function StepParentVendor() {
    return (
        <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ border: "1px solid #D6E0F5", borderRadius: 2, bgcolor: "#F0F4FB", p: 2.5 }}>
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.1em", color: "#0F2D6B", mb: 1.5 }}>
                    PARENT — TENANT (FIXED)
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {[{ label: "Tenant", fixed: true }, { label: "New vendor", fixed: false }].map((item, i) => (
                        <React.Fragment key={item.label}>
                            {i > 0 && <Typography sx={{ color: "#9AA4B2" }}>›</Typography>}
                            <Box sx={{
                                px: 1.8, py: 0.6, borderRadius: 20,
                                border: item.fixed ? "1.5px solid #B0BFD8" : "1.5px dashed #B0BFD8",
                                bgcolor: item.fixed ? "#fff" : "#EEF2FB",
                                fontSize: "0.85rem", fontWeight: item.fixed ? 600 : 500,
                                color: item.fixed ? "#0F2D6B" : "#6B7A8D",
                            }}>
                                {item.label}
                            </Box>
                        </React.Fragment>
                    ))}
                </Box>
            </Box>
            {/* <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Vendors (e.g. BAXI, Moneypoint, OPay) sit directly under this Disco tenant.
                All subvendors, agents, cashiers and POS must be created under a vendor.
            </Typography> */}
        </Box>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props { open: boolean; onClose: () => void; }

export default function OnboardingVendor({ open, onClose }: Props) {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<VendorForm>(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    // const [relatedVends, setRelatedVends] = useState<RelatedVendorResponse[]>([]);
    const [basicErrors, setBasicErrors] = useState<Partial<Record<keyof BasicFormData, string>>>({});
    const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
    const [kycErrors, setKycErrors] = useState<Partial<Record<keyof KYCFormData, string>>>({});
    const [controlErrors, setControlErrors] = useState<Partial<Record<keyof ControlsFormData, string>>>({});
    const [agreementErrors, setAgreementErrors] = useState<Partial<Record<keyof AgreementFormData, string>>>({});

    function resetAndClose() {
        setStep(0);
        setForm(EMPTY_FORM);
        onClose();
    }

    async function handleSubmit() {
        try {
            setLoading(true);
            const payload = {
                business_name: form.profile.businessName,

                email: form.basic.adminEmail,

                phone_number: form.profile.phone,

                address: form.profile.streetAddress,

                city: form.profile.city,

                state: form.profile.state,

                country: form.profile.nationality,

                postal_code: form.profile.postalCode,

                hierachy: "vendor",

                domain: form.basic.license,

                sub_domain: form.basic.subdomain,

                slug: form.basic.entityName
                    .toLowerCase()
                    .replace(/\s+/g, "-"),

                trial_ends: form.basic.trialEnds,

                description: form.profile.businessType,

                industry: form.profile.businessType,

                category: form.profile.businessType,

                registration_number: form.kyc.taxId,

                cac_registration_number: form.kyc.cacNumber,

                website: form.profile.website,

                contact_name: form.kyc.directorName,

                email1: form.profile.contactEmail,

                email2: form.profile.secondaryEmail,

                bank_name: form.profile.bankName,

                account_name: form.profile.accountName,

                account_number: form.profile.accountNumber,

                owner_name: form.kyc.directorName,

                dob: form.kyc.dateOfBirth,

                nationality: form.profile.nationality,

                id_type: form.kyc.idType,

                id_number: form.kyc.idNumber,

                owner_address: form.profile.streetAddress,

                entity_name: form.profile.businessName,

                company_website: form.agreement.companyWebsite,

                company_address: form.profile.streetAddress,

                signatory_name: form.kyc.directorName,

                signatory_phone_number: form.profile.phone,

                signatory_email: form.profile.contactEmail,

                funding_cap: form.controls.dailyFundingCap,

                transaction_max: form.controls.maxPerTransaction,

                commission_rate: form.controls.commissionRate,

                monthly_target: form.controls.monthlyVolumeTarget,
            };

            console.log("PAYLOAD:", payload);

            await createVendor(payload);
            clearDraft(STORAGE_KEY);
            resetAndClose();
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error))
        } finally {
            setLoading(false);
        }
    }

    function setSection<K extends keyof VendorForm>(section: K) {
        return (field: keyof VendorForm[K], value: string) =>
            setForm((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    }

    function toggleTxType(txType: string) {
        setForm((prev) => ({
            ...prev,
            controls: {
                ...prev.controls,
                permittedTxTypes: { ...prev.controls.permittedTxTypes, [txType]: !prev.controls.permittedTxTypes[txType] },
            },
        }));
    }

    function toggleAgreed() {
        setForm((prev) => ({ ...prev, agreement: { ...prev.agreement, agreedToTerms: !prev.agreement.agreedToTerms } }));
    }

    const handleNext = () => {

        if (step === 1) {
            const errors = validateBasic(form.basic);
            setBasicErrors(errors);
            if (Object.keys(errors).length > 0)
                return;
        }
        if (step === 2) {
            const errors = validateProfile(form.profile);
            setProfileErrors(errors);
            if (Object.keys(errors).length > 0)
                return;
        }

        if (step === 3) {
            const errors = validateKYC(form.kyc);
            setKycErrors(errors);
            if (Object.keys(errors).length > 0)
                return;
        }

        if (step === 4) {
            const errors = validateControls(form.controls);
            setControlErrors(errors);
            if (Object.keys(errors).length > 0)
                return;
        }

        if (step === 5) {
            const errors = validateAgreement(form.agreement);
            setAgreementErrors(errors);
            if (Object.keys(errors).length > 0)
                return;

            handleSubmit();
            return;
        }

        setStep((s) => s + 1);
    };

    // save and continue
    const STORAGE_KEY = DRAFT_KEYS.VENDOR;

    const handleSaveDraft = () => {
        saveDraft(STORAGE_KEY, {
            step,
            form,
        });

        toast.success("Draft saved successfully.");
    };

    useEffect(() => {
        if (!open) return;

        try {
            const draft = getDraft<{
                step: number;
                form: VendorForm;
            }>(STORAGE_KEY);

            if (!draft) return;

            setStep(draft.step ?? 0);
            setForm(draft.form ?? EMPTY_FORM);

            toast.info("Draft restored.");
        } catch {
            clearDraft(STORAGE_KEY);
        }
    }, [open]);

    const discardDraft = () => {
        clearDraft(STORAGE_KEY);

        setStep(0);
        setForm(EMPTY_FORM);

        toast.success("Draft discarded.");
    };
    return (
        <WizardShell
            open={open}
            onClose={resetAndClose}
            entityLabel="vendor"
            step={step}
            // onNext={() => step === 5 ? handleSubmit() : setStep((s) => s + 1)}
            onNext={handleNext}
            onPrev={() => setStep((s) => Math.max(0, s - 1))}
            canSubmit={form.agreement.agreedToTerms}
            onDiscardDraft={discardDraft}
            onSaveDraft={handleSaveDraft}
        >
            {step === 0 && <StepParentVendor />}
            {step === 1 && <StepBasic data={form.basic} onChange={setSection("basic")} entityLabel="Vendor" errors={basicErrors} />}
            {step === 2 && <StepProfile data={form.profile} onChange={setSection("profile")} errors={profileErrors} />}
            {step === 3 && <StepKYC data={form.kyc} onChange={setSection("kyc")} errors={kycErrors} />}
            {step === 4 && <StepControls data={form.controls} onChange={setSection("controls")} onToggleTxType={toggleTxType} errors={controlErrors} />}
            {step === 5 && <StepAgreement data={form.agreement} onChange={setSection("agreement")} onToggleAgreed={toggleAgreed} errors={agreementErrors} />}
        </WizardShell>
    );
}