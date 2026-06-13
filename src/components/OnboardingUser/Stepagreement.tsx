import React from "react";
import { Box, TextField, Typography, FormControl, Select, MenuItem, FormControlLabel, Checkbox } from "@mui/material";
import { AgreementFormData } from "./WizardTypes";

interface StepAgreementProps {
    data: AgreementFormData;
    onChange: (field: keyof AgreementFormData, value: string) => void;
    onToggleAgreed: () => void;
}

const inputSx = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "#F5F7FA",
        "& fieldset": { borderColor: "#E0E4EA" },
        "&:hover fieldset": { borderColor: "#B0BFD8" },
        "&.Mui-focused fieldset": { borderColor: "#0F2D6B" },
    },
};

function Label({ children }: { children: React.ReactNode }) {
    return <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.8 }}>{children}</Typography>;
}

const AGREEMENT_TYPES = [
    "Standard Disco vendor agreement",
    "Custom vendor agreement",
    "Reseller agreement",
    "Agent agreement",
];

export default function StepAgreement({ data, onChange, onToggleAgreed }: StepAgreementProps) {
    return (
        <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
                <Label>Agreement type</Label>
                <FormControl size="small" fullWidth>
                    <Select value={data.agreementType}
                        onChange={(e) => onChange("agreementType", e.target.value)}
                        sx={{ bgcolor: "#F5F7FA", "& fieldset": { borderColor: "#E0E4EA" } }}>
                        {AGREEMENT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>

            <Box>
                <Label>Company website</Label>
                <TextField size="small" fullWidth sx={inputSx}
                    placeholder="company@gmail.com"
                    value={data.companyWebsite}
                    onChange={(e) => onChange("companyWebsite", e.target.value)}
                />
            </Box>

            <Box>
                <Label>Effective date</Label>
                <TextField size="small" fullWidth sx={inputSx}
                    type="date"
                    value={data.effectiveDate}
                    onChange={(e) => onChange("effectiveDate", e.target.value)}
                    InputProps={{ sx: { color: data.effectiveDate ? "#0D1B2A" : "#9AA4B2" } }}
                />
            </Box>

            <Box sx={{ border: "1px solid #E0E4EA", borderRadius: 2, bgcolor: "#F5F7FA", p: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    By completing this onboarding you confirm that the entity has agreed to the
                    QuickCash platform terms of service and all operating conditions set by this Disco
                    tenant. This record will be timestamped, stored, and is auditable.
                </Typography>
            </Box>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={data.agreedToTerms}
                        onChange={onToggleAgreed}
                        sx={{ color: "#D0D5DD", "&.Mui-checked": { color: "#0F2D6B" }, alignSelf: "flex-start", mt: "-2px" }}
                    />
                }
                label={
                    <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                        I confirm the entity has accepted the agreement and KYC documents are
                        authentic and verified.
                    </Typography>
                }
                sx={{ alignItems: "flex-start", mr: 0 }}
            />
        </Box>
    );
}