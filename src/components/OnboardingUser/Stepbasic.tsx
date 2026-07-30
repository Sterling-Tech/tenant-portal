
import React from "react";
import { Box, TextField, Typography } from "@mui/material";
import { BasicFormData } from "./WizardTypes";


interface StepBasicProps {
    data: BasicFormData;
    onChange: (field: keyof BasicFormData, value: string) => void;
    entityLabel?: string; // "Vendor", "Subvendor", etc.
    errors?: Partial<Record<keyof BasicFormData, string>>;
}

const inputSx = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "#F5F7FA",
        "& fieldset": { borderColor: "#E0E4EA" },
        "&:hover fieldset": { borderColor: "#B0BFD8" },
        "&.Mui-focused fieldset": { borderColor: "#0F2D6B" },
    },
};

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.8 }}>
            {children}{required && <span style={{ color: "#C0392B" }}> *</span>}
        </Typography>
    );
}

export default function StepBasic({ data, errors = {}, onChange, entityLabel = "Entity", }: StepBasicProps) {
    return (
        <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
                <Label required>{entityLabel} name</Label>
                <TextField size="small" fullWidth sx={inputSx}
                    placeholder={`e.g. BAXI Lagos North`}
                    value={data.entityName}
                    onChange={(e) => onChange("entityName", e.target.value)}
                    error={!!errors.entityName}
                    helperText={errors.entityName}
                />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                    <Label required>License / domain</Label>
                    <TextField size="small" fullWidth sx={inputSx}
                        placeholder="Unique identifier"
                        value={data.license}
                        onChange={(e) => onChange("license", e.target.value)}
                        error={!!errors.license}
                        helperText={errors.license}
                    />
                </Box>
                <Box>
                    <Label>Subdomain</Label>
                    <TextField size="small" fullWidth sx={inputSx}
                        placeholder="Optional"
                        value={data.subdomain}
                        onChange={(e) => onChange("subdomain", e.target.value)}
                        error={!!errors.subdomain}
                        helperText={errors.subdomain}
                    />
                </Box>
            </Box>

            <Box>
                <Label>Admin email</Label>
                <TextField size="small" fullWidth sx={inputSx}
                    placeholder="admin@domain.com"
                    type="email"
                    value={data.adminEmail}
                    onChange={(e) => onChange("adminEmail", e.target.value)}
                    error={!!errors.adminEmail}
                    helperText={errors.adminEmail}
                />
            </Box>

            <Box>
                <Label>Trial Ends</Label>
                <TextField size="small" fullWidth sx={inputSx}
                    placeholder="trial ends"
                    type="date"
                    value={data.trialEnds}
                    onChange={(e) => onChange("trialEnds", e.target.value)}
                    error={!!errors.trialEnds}
                    helperText={errors.trialEnds}
                />
            </Box>

        </Box>
    );
}