
import React from "react";
import { Box, FormControl, MenuItem, Select, TextField, Typography } from "@mui/material";
import { BasicFormData, RELATEDVENDORS } from "./WizardTypes";
// import { RelatedVendorResponse } from "../../services/onbordingService";

interface StepBasicProps {
    data: BasicFormData;
    onChange: (field: keyof BasicFormData, value: string) => void;
    entityLabel?: string; // "Vendor", "Subvendor", etc.
    //relatedVendors: RelatedVendorResponse[];
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

export default function StepBasic({ data, onChange, entityLabel = "Entity", }: StepBasicProps) {
    return (
        <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
                <Label required>{entityLabel} name</Label>
                <TextField size="small" fullWidth sx={inputSx}
                    placeholder={`e.g. BAXI Lagos North`}
                    value={data.entityName}
                    onChange={(e) => onChange("entityName", e.target.value)}
                />
            </Box>

            {/* <Box>
                <Label>Related Vendor</Label>
                <FormControl size="small" fullWidth>
                    <Select value={data.relatedVendor}
                        onChange={(e) => onChange("relatedVendor", e.target.value)}
                        sx={{ bgcolor: "#F5F7FA", "& fieldset": { borderColor: "#E0E4EA" } }}>
                        {RELATEDVENDORS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        
                    </Select>
                </FormControl>
            </Box> */}

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                    <Label required>License / domain</Label>
                    <TextField size="small" fullWidth sx={inputSx}
                        placeholder="Unique identifier"
                        value={data.license}
                        onChange={(e) => onChange("license", e.target.value)}
                    />
                </Box>
                <Box>
                    <Label>Subdomain</Label>
                    <TextField size="small" fullWidth sx={inputSx}
                        placeholder="Optional"
                        value={data.subdomain}
                        onChange={(e) => onChange("subdomain", e.target.value)}
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
                />
            </Box>

            <Box>
                <Label>Admin password</Label>
                <TextField size="small" fullWidth sx={inputSx}
                    placeholder="Min 8 characters"
                    type="password"
                    value={data.adminPassword}
                    onChange={(e) => onChange("adminPassword", e.target.value)}
                />
            </Box>

            <Box>
                <Label>Trial Ends</Label>
                <TextField size="small" fullWidth sx={inputSx}
                    placeholder="trial ends"
                    type="date"
                    value={data.trialEnds}
                    onChange={(e) => onChange("trialEnds", e.target.value)}
                />
            </Box>

        </Box>
    );
}