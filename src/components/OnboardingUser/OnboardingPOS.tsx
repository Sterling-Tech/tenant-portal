/**
 * OnboardingPOS
 * Entity: POS   Parent: Agent (user selects)
 * API endpoint: POST /api/pos
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
import { createVendor, getAllVendors, RelatedVendorResponse } from "../../services/onbordingService";
import { validateProfile, validateBasic, validateKYC, validateControls, validateAgreement } from "./validation";

export interface POSForm {
  parentCashierId: string;
  basic: BasicFormData;
  profile: ProfileFormData;
  kyc: KYCFormData;
  controls: ControlsFormData;
  agreement: AgreementFormData;
}

const EMPTY_FORM: POSForm = {
  parentCashierId: "",
  basic: { ...EMPTY_BASIC },
  profile: { ...EMPTY_PROFILE },
  kyc: { ...EMPTY_KYC },
  controls: { ...EMPTY_CONTROLS, permittedTxTypes: { ...DEFAULT_TX_TYPES } },
  agreement: { ...EMPTY_AGREEMENT },
};

// TODO: fetch from GET /api/agents


function StepParentPOS({
  selected,
  onSelect,
  cashiers,
  error,
}: {
  selected: string;
  onSelect: (v: string) => void;
  cashiers: RelatedVendorResponse[];
  error?: string;
}) {
  const chain = selected || "[Agent]";
  return (
    <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, bgcolor: "#FFF7ED", border: "1px solid #F5C98A", borderRadius: 2, px: 2, py: 1.5 }}>
        <ErrorOutlineIcon sx={{ color: "#C0521A", fontSize: 20, mt: "1px", flexShrink: 0 }} />
        <Typography variant="body2" sx={{ color: "#7A3B10", fontWeight: 500, lineHeight: 1.6 }}>
          A POS must be assigned to a parent Cashier before it can be created.
        </Typography>
      </Box>

      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.8 }}>
          Select parent Cashier <span style={{ color: "#C0392B" }}>*</span>
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            displayEmpty value={selected} onChange={(e) => onSelect(e.target.value)}
            renderValue={(val) =>
              val ? <Typography sx={{ fontSize: "0.88rem" }}>{val as string}</Typography>
                : <Typography sx={{ fontSize: "0.88rem", color: "#9AA4B2" }}>— choose a Cashier —</Typography>
            }
            sx={{ bgcolor: "#F5F7FA", "& fieldset": { borderColor: "#E0E4EA" } }}
          >
            <MenuItem value="" disabled>
              <Typography sx={{ color: "#9AA4B2", fontSize: "0.88rem" }}>— choose a Cashier —</Typography>
            </MenuItem>
            {cashiers.map((vendor) => (
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

      <Box sx={{ border: "1px solid #C8D8F0", borderRadius: 2, bgcolor: "#EEF4FB", p: 2 }}>
        <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em", color: "#0F2D6B", textTransform: "uppercase", mb: 1 }}>
          Hierarchy Chain
        </Typography>
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#1A3A6B" }}>
          Tenant <Box component="span" sx={{ color: "#7A9CC8" }}>&gt;</Box> Vendor <Box component="span" sx={{ color: "#7A9CC8" }}>&gt;</Box> Subvendor <Box component="span" sx={{ color: "#7A9CC8" }}>&gt;</Box> {chain} <Box component="span" sx={{ color: "#7A9CC8" }}>&gt;</Box> New POS
        </Typography>
      </Box>
    </Box>
  );
}

interface Props { open: boolean; onClose: () => void; }

export default function OnboardingPOS({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<POSForm>(EMPTY_FORM);
  const [cashiers, setCashiers] = useState<RelatedVendorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [parentCashierError, setParentCashierError] = useState("");

  const [basicErrors, setBasicErrors] = useState<Partial<Record<keyof BasicFormData, string>>>({});
  const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [kycErrors, setKycErrors] = useState<Partial<Record<keyof KYCFormData, string>>>({});
  const [controlErrors, setControlErrors] = useState<Partial<Record<keyof ControlsFormData, string>>>({});
  const [agreementErrors, setAgreementErrors] = useState<Partial<Record<keyof AgreementFormData, string>>>({});
  function resetAndClose() { setStep(0); setForm(EMPTY_FORM); onClose(); }

  useEffect(() => {
    const fetchCashiers = async () => {
      try {
        const vendors = await getAllVendors();

        setCashiers(
          vendors.filter(
            (item) =>
              item.hierachy === "agent"
          )
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchCashiers();
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

        hierachy: "pos",

        related_vendor: Number(form.parentCashierId),

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

      resetAndClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function setSection<K extends keyof Omit<POSForm, "parentAgentId">>(section: K) {
    return (field: keyof POSForm[K], value: string) =>
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
      if (!form.parentCashierId) {
        setParentCashierError(
          "Please select a parent cashier before continuing."
        );
        return;
      }

      setParentCashierError("");
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
  return (
    <WizardShell open={open} onClose={resetAndClose} entityLabel="pos" step={step}
      onNext={handleNext}
      onPrev={() => setStep((s) => Math.max(0, s - 1))}
      canSubmit={form.agreement.agreedToTerms}
    >
      {step === 0 && <StepParentPOS selected={form.parentCashierId} error={parentCashierError} onSelect={(v) => { setParentCashierError(""); setForm((p) => ({ ...p, parentCashierId: v })) }} cashiers={cashiers} />}
      {step === 1 && <StepBasic data={form.basic} onChange={setSection("basic")} entityLabel="POS" errors={basicErrors}/>}
      {step === 2 && <StepProfile data={form.profile} onChange={setSection("profile")} errors={profileErrors}/>}
      {step === 3 && <StepKYC data={form.kyc} onChange={setSection("kyc")} errors={kycErrors}/>}
      {step === 4 && <StepControls data={form.controls} onChange={setSection("controls")} onToggleTxType={toggleTxType} errors={controlErrors}/>}
      {step === 5 && <StepAgreement data={form.agreement} onChange={setSection("agreement")} onToggleAgreed={toggleAgreed} errors={agreementErrors}/>}
    </WizardShell>
  );
}