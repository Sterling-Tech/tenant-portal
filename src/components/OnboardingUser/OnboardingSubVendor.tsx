
/**
 * OnboardingSubVendor
 * Entity: Subvendor   Parent: Vendor (user selects)
 * API endpoint: POST /api/subvendors
 */
import React, { useState } from "react";
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
  basic:     { ...EMPTY_BASIC },
  profile:   { ...EMPTY_PROFILE },
  kyc:       { ...EMPTY_KYC },
  controls:  { ...EMPTY_CONTROLS, permittedTxTypes: { ...DEFAULT_TX_TYPES } },
  agreement: { ...EMPTY_AGREEMENT },
};

// ─── Step 1 — select parent Vendor ───────────────────────────────────────────
// TODO: replace VENDOR_OPTIONS with data fetched from GET /api/vendors
const VENDOR_OPTIONS = ["BAXI", "PayServ", "Flutterwave", "Moniepoint"];

function StepParentSubVendor({
  selectedVendor,
  onSelect,
}: {
  selectedVendor: string;
  onSelect: (v: string) => void;
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
        <FormControl fullWidth size="small">
          <Select
            displayEmpty
            value={selectedVendor}
            onChange={(e) => onSelect(e.target.value)}
            renderValue={(val) =>
              val ? <Typography sx={{ fontSize: "0.88rem" }}>{val as string}</Typography>
                  : <Typography sx={{ fontSize: "0.88rem", color: "#9AA4B2" }}>— choose a Vendor —</Typography>
            }
            sx={{ bgcolor: "#F5F7FA", "& fieldset": { borderColor: "#E0E4EA" } }}
          >
            <MenuItem value="" disabled>
              <Typography sx={{ color: "#9AA4B2", fontSize: "0.88rem" }}>— choose a Vendor —</Typography>
            </MenuItem>
            {VENDOR_OPTIONS.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
          </Select>
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

  function resetAndClose() { setStep(0); setForm(EMPTY_FORM); onClose(); }

  async function handleSubmit() {
    // TODO: await api.post("/api/subvendors", form);
    console.log("POST /api/subvendors", form);
    resetAndClose();
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

  return (
    <WizardShell
      open={open}
      onClose={resetAndClose}
      entityLabel="subvendor"
      step={step}
      onNext={() => step === 5 ? handleSubmit() : setStep((s) => s + 1)}
      onPrev={() => setStep((s) => Math.max(0, s - 1))}
      canSubmit={form.agreement.agreedToTerms}
    >
      {step === 0 && <StepParentSubVendor selectedVendor={form.parentVendorId} onSelect={(v) => setForm((p) => ({ ...p, parentVendorId: v }))} />}
      {/* {step === 1 && <StepBasic data={form.basic} onChange={setSection("basic")} entityLabel="Subvendor" relatedVendors={relatedVends}/>} */}
      {step === 2 && <StepProfile data={form.profile} onChange={setSection("profile")} />}
      {step === 3 && <StepKYC data={form.kyc} onChange={setSection("kyc")} />}
      {step === 4 && <StepControls data={form.controls} onChange={setSection("controls")} onToggleTxType={toggleTxType} />}
      {step === 5 && <StepAgreement data={form.agreement} onChange={setSection("agreement")} onToggleAgreed={toggleAgreed} />}
    </WizardShell>
  );
}