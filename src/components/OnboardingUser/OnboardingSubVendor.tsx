
/**
 * OnboardingSubVendor
 * Entity: Subvendor   Parent: Vendor (user selects)
 * API endpoint: POST /api/subvendors
 */
import React, { useState, useEffect } from "react";
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
    getAllVendors,
    RelatedVendorResponse,
} from "../../services/onbordingService";
import { validateProfile, validateBasic, validateKYC, validateControls, validateAgreement, DRAFT_KEYS, saveDraft, getDraft, clearDraft } from "./validation";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
// ─── Form shape ───────────────────────────────────────────────────────────────
export interface SubVendorForm {
    parentVendorId: string;   // selected vendor ID / name
    basic: BasicFormData;
    profile: ProfileFormData;
    kyc: KYCFormData;
    controls: ControlsFormData;
    agreement: AgreementFormData;
}

const EMPTY_FORM: SubVendorForm = {
    parentVendorId: "",
    basic: { ...EMPTY_BASIC },
    profile: { ...EMPTY_PROFILE },
    kyc: { ...EMPTY_KYC },
    controls: { ...EMPTY_CONTROLS, permittedTxTypes: { ...DEFAULT_TX_TYPES } },
    agreement: { ...EMPTY_AGREEMENT },
};

// ─── Step 1 — select parent Vendor ───────────────────────────────────────────
function StepParentSubVendor({
    selectedVendor,
    onSelect,
    relatedVends,
    error,
}: {
    selectedVendor: string;
    onSelect: (v: string) => void;
    relatedVends: RelatedVendorResponse[];
    error?: string;
}) {
    const chainVendor = selectedVendor || "[Vendor]";

    return (
        <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Warning banner */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, bgcolor: "#FFF7ED", border: "1px solid #F5C98A", borderRadius: 2, px: 2, py: 1.5 }}>
                <ErrorOutlineIcon sx={{ color: "#C0521A", fontSize: 20, mt: "1px", flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: "#7A3B10", fontWeight: 500, lineHeight: 1.6 }}>
                    A Subvendor must be assigned to a parent Vendor before it can be created.
                </Typography>
            </Box>

            {/* Vendor dropdown */}
            <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.8 }}>
                    Select parent Vendor <span style={{ color: "#C0392B" }}>*</span>
                </Typography>
                <FormControl
                    fullWidth
                    size="small"
                    error={!!error}
                >
                    <Select
                        displayEmpty
                        value={selectedVendor}
                        onChange={(e) => {
                            onSelect(e.target.value);
                        }}
                        sx={{
                            bgcolor: "#F5F7FA",
                            "& fieldset": {
                                borderColor: "#E0E4EA",
                            },
                        }}
                    >
                        <MenuItem value="" disabled>
                            Select Parent Vendor
                        </MenuItem>

                        {relatedVends.map((vendor) => (
                            <MenuItem
                                key={vendor.id}
                                value={vendor.id.toString()}
                            >
                                {vendor.business_name}
                            </MenuItem>
                        ))}
                    </Select>

                    {error && (
                        <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 0.5 }}
                        >
                            {error}
                        </Typography>
                    )}
                </FormControl>
            </Box>

            {/* Hierarchy chain */}
            <Box sx={{ border: "1px solid #C8D8F0", borderRadius: 2, bgcolor: "#EEF4FB", p: 2 }}>
                <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em", color: "#0F2D6B", textTransform: "uppercase", mb: 1 }}>
                    Hierarchy Chain
                </Typography>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#1A3A6B" }}>
                    Tenant{" "}
                    <Box component="span" sx={{ color: "#7A9CC8" }}>&gt;</Box>
                    {" "}{chainVendor}{" "}
                    <Box component="span" sx={{ color: "#7A9CC8" }}>&gt;</Box>
                    {" "}New subvendor
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props { open: boolean; onClose: () => void; }

export default function OnboardingSubVendor({ open, onClose }: Props) {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<SubVendorForm>(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [relatedVends, setRelatedVends] = useState<RelatedVendorResponse[]>([]);

    const [parentVendorError, setParentVendorError] = useState("");
    const [basicErrors, setBasicErrors] = useState<Partial<Record<keyof BasicFormData, string>>>({});
    const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
    const [kycErrors, setKycErrors] = useState<Partial<Record<keyof KYCFormData, string>>>({});
    const [controlErrors, setControlErrors] = useState<Partial<Record<keyof ControlsFormData, string>>>({});
    const [agreementErrors, setAgreementErrors] = useState<Partial<Record<keyof AgreementFormData, string>>>({});

    function resetAndClose() { setStep(0); setForm(EMPTY_FORM); onClose(); }

    useEffect(() => {
        const fetchRelatedVendors = async () => {
            try {
                const vendors = await getAllVendors();
                setRelatedVends(
                    vendors.filter(
                        (item) =>
                            item.hierachy === "vendor"
                    )
                );
            } catch (error) {
                console.error("Failed to fetch related vendors", error);
            }
        };

        fetchRelatedVendors();
    }, []);

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

                hierachy: "sub_vendor",

                related_vendor: Number(form.parentVendorId),

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
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    function setSection<K extends keyof Omit<SubVendorForm, "parentVendorId">>(section: K) {
        return (field: keyof SubVendorForm[K], value: string) =>
            setForm((prev) => ({ ...prev, [section]: { ...(prev[section] as object), [field]: value } }));
    }

    function toggleTxType(txType: string) {
        setForm((prev) => ({ ...prev, controls: { ...prev.controls, permittedTxTypes: { ...prev.controls.permittedTxTypes, [txType]: !prev.controls.permittedTxTypes[txType] } } }));
    }

    function toggleAgreed() {
        setForm((prev) => ({ ...prev, agreement: { ...prev.agreement, agreedToTerms: !prev.agreement.agreedToTerms } }));
    }


    const handleNext = () => {
        if (step === 0) {
            if (!form.parentVendorId) {
                setParentVendorError(
                    "Please select a parent vendor before continuing."
                );
                return;
            }

            setParentVendorError("");
        }

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
        const STORAGE_KEY = DRAFT_KEYS.SUBVENDOR;
    
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
                    form: SubVendorForm;
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
            entityLabel="subvendor"
            step={step}
            onNext={handleNext}
            onPrev={() => setStep((s) => Math.max(0, s - 1))}
            canSubmit={form.agreement.agreedToTerms}
            onDiscardDraft={discardDraft}
            onSaveDraft={handleSaveDraft}
        >
            {step === 0 && <StepParentSubVendor selectedVendor={form.parentVendorId} error={parentVendorError} onSelect={(v) => { setParentVendorError(""); setForm((p) => ({ ...p, parentVendorId: v })) }} relatedVends={relatedVends} />}
            {step === 1 && <StepBasic data={form.basic} onChange={setSection("basic")} entityLabel="Subvendor" errors={basicErrors} />}
            {step === 2 && <StepProfile data={form.profile} onChange={setSection("profile")} errors={profileErrors}/>}
            {step === 3 && <StepKYC data={form.kyc} onChange={setSection("kyc")} errors={kycErrors}/>}
            {step === 4 && <StepControls data={form.controls} onChange={setSection("controls")} onToggleTxType={toggleTxType} errors={controlErrors}/>}
            {step === 5 && <StepAgreement data={form.agreement} onChange={setSection("agreement")} onToggleAgreed={toggleAgreed} errors={agreementErrors}/>}
        </WizardShell>
    );
}