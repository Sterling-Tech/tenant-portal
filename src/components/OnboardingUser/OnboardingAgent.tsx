
/**
 * OnboardingAgent
 * Entity: Agent   Parent: Subvendor (user selects)
 * API endpoint: POST /api/agents
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

export interface AgentForm {
  parentSubvendorId: string;
  basic: BasicFormData;
  profile: ProfileFormData;
  kyc: KYCFormData;
  controls: ControlsFormData;
  agreement: AgreementFormData;
}

const EMPTY_FORM: AgentForm = {
  parentSubvendorId: "",
  basic:     { ...EMPTY_BASIC },
  profile:   { ...EMPTY_PROFILE },
  kyc:       { ...EMPTY_KYC },
  controls:  { ...EMPTY_CONTROLS, permittedTxTypes: { ...DEFAULT_TX_TYPES } },
  agreement: { ...EMPTY_AGREEMENT },
};

// TODO: fetch from GET /api/subvendors
const SUBVENDOR_OPTIONS = ["SubV Alpha", "SubV Beta", "SubV Gamma"];

function StepParentAgent({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  const chain = selected || "[Subvendor]";
  return (
    <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, bgcolor: "#FFF7ED", border: "1px solid #F5C98A", borderRadius: 2, px: 2, py: 1.5 }}>
        <ErrorOutlineIcon sx={{ color: "#C0521A", fontSize: 20, mt: "1px", flexShrink: 0 }} />
        <Typography variant="body2" sx={{ color: "#7A3B10", fontWeight: 500, lineHeight: 1.6 }}>
          A Agent must be assigned to a parent Subvendor before it can be created.
        </Typography>
      </Box>

      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.8 }}>
          Select parent Subvendor <span style={{ color: "#C0392B" }}>*</span>
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            displayEmpty value={selected} onChange={(e) => onSelect(e.target.value)}
            renderValue={(val) =>
              val ? <Typography sx={{ fontSize: "0.88rem" }}>{val as string}</Typography>
                  : <Typography sx={{ fontSize: "0.88rem", color: "#9AA4B2" }}>— choose a Subvendor —</Typography>
            }
            sx={{ bgcolor: "#F5F7FA", "& fieldset": { borderColor: "#E0E4EA" } }}
          >
            <MenuItem value="" disabled>
              <Typography sx={{ color: "#9AA4B2", fontSize: "0.88rem" }}>— choose a Subvendor —</Typography>
            </MenuItem>
            {SUBVENDOR_OPTIONS.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ border: "1px solid #C8D8F0", borderRadius: 2, bgcolor: "#EEF4FB", p: 2 }}>
        <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em", color: "#0F2D6B", textTransform: "uppercase", mb: 1 }}>
          Hierarchy Chain
        </Typography>
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#1A3A6B" }}>
          Tenant <Box component="span" sx={{ color: "#7A9CC8" }}>&gt;</Box> Vendor <Box component="span" sx={{ color: "#7A9CC8" }}>&gt;</Box> {chain} <Box component="span" sx={{ color: "#7A9CC8" }}>&gt;</Box> New agent
        </Typography>
      </Box>
    </Box>
  );
}

interface Props { open: boolean; onClose: () => void; }

export default function OnboardingAgent({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AgentForm>(EMPTY_FORM);

  function resetAndClose() { setStep(0); setForm(EMPTY_FORM); onClose(); }

  async function handleSubmit() {
    // TODO: await api.post("/api/agents", form);
    console.log("POST /api/agents", form);
    resetAndClose();
  }

  function setSection<K extends keyof Omit<AgentForm, "parentSubvendorId">>(section: K) {
    return (field: keyof AgentForm[K], value: string) =>
      setForm((prev) => ({ ...prev, [section]: { ...(prev[section] as object), [field]: value } }));
  }

  function toggleTxType(txType: string) {
    setForm((prev) => ({ ...prev, controls: { ...prev.controls, permittedTxTypes: { ...prev.controls.permittedTxTypes, [txType]: !prev.controls.permittedTxTypes[txType] } } }));
  }

  function toggleAgreed() {
    setForm((prev) => ({ ...prev, agreement: { ...prev.agreement, agreedToTerms: !prev.agreement.agreedToTerms } }));
  }

  return (
    <WizardShell open={open} onClose={resetAndClose} entityLabel="agent" step={step}
      onNext={() => step === 5 ? handleSubmit() : setStep((s) => s + 1)}
      onPrev={() => setStep((s) => Math.max(0, s - 1))}
      canSubmit={form.agreement.agreedToTerms}
    >
      {step === 0 && <StepParentAgent selected={form.parentSubvendorId} onSelect={(v) => setForm((p) => ({ ...p, parentSubvendorId: v }))} />}
      {/* {step === 1 && <StepBasic data={form.basic} onChange={setSection("basic")} entityLabel="Agent" />} */}
      {step === 2 && <StepProfile data={form.profile} onChange={setSection("profile")} />}
      {step === 3 && <StepKYC data={form.kyc} onChange={setSection("kyc")} />}
      {step === 4 && <StepControls data={form.controls} onChange={setSection("controls")} onToggleTxType={toggleTxType} />}
      {step === 5 && <StepAgreement data={form.agreement} onChange={setSection("agreement")} onToggleAgreed={toggleAgreed} />}
    </WizardShell>
  );
}