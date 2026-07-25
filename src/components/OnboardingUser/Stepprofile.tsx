
import React from "react";
import { Box, TextField, Typography, MenuItem, Select, FormControl } from "@mui/material";
import { NATIONALITY_OPTIONS, ProfileFormData } from "./WizardTypes";

interface StepProfileProps {
    data: ProfileFormData;
    onChange: (field: keyof ProfileFormData, value: string) => void;
    errors?: Partial<Record<keyof ProfileFormData, string>>;
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

const BUSINESS_TYPES = [
    "Fintech / Payment company", "Retail / Commerce",
    "Logistics", "Healthcare", "Education", "Other",
];

export default function StepProfile({ data, errors = {}, onChange }: StepProfileProps) {
    return (
        <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
                <Label required>Business / legal name</Label>
                <TextField size="small" fullWidth sx={inputSx}
                    placeholder="Registered company name"
                    value={data.businessName}
                    onChange={(e) => onChange("businessName", e.target.value)}
                    error={!!errors?.businessName}
                    helperText={errors?.businessName}
                />
            </Box>

            <Box>
                <Label>Business type</Label>
                <FormControl size="small" fullWidth error={!!errors?.businessType}>
                    <Select value={data.businessType}
                        onChange={(e) => onChange("businessType", e.target.value)}
                        sx={{ bgcolor: "#F5F7FA", "& fieldset": { borderColor: "#E0E4EA" } }}>
                        {BUSINESS_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                    {errors?.businessType && (
                        <Typography
                            variant="caption"
                            color="error"
                        >
                            {errors.businessType}
                        </Typography>
                    )}
                </FormControl>
            </Box>

            <Box>
                <Label required>Website</Label>
                <TextField size="small" fullWidth sx={inputSx}
                    placeholder="www.tenant.com"
                    value={data.website}
                    onChange={(e) => onChange("website", e.target.value)}
                    error={!!errors?.website}
                    helperText={errors?.website}
                />
            </Box>

            <Box>
                <Label required>Street address</Label>
                <TextField size="small" fullWidth sx={inputSx}
                    placeholder="Street address"
                    value={data.streetAddress}
                    onChange={(e) => onChange("streetAddress", e.target.value)}
                    error={!!errors?.streetAddress}
                    helperText={errors?.streetAddress}
                />
            </Box>

            <Box>
                <Label>Nationality</Label>
                <FormControl size="small" fullWidth error={!!errors?.nationality}>
                    <Select value={data.nationality}
                        onChange={(e) => onChange("nationality", e.target.value)}
                        sx={{ bgcolor: "#F5F7FA", "& fieldset": { borderColor: "#E0E4EA" } }}>
                        {NATIONALITY_OPTIONS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                    {errors?.nationality && (
                        <Typography
                            variant="caption"
                            color="error"
                        >
                            {errors.nationality}
                        </Typography>
                    )}
                </FormControl>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                    <Label required>City</Label>
                    <TextField size="small" fullWidth sx={inputSx}
                        placeholder="e.g. Lagos"
                        value={data.city}
                        onChange={(e) => onChange("city", e.target.value)}
                        error={!!errors?.city}
                        helperText={errors?.city}
                    />
                </Box>
                <Box>
                    <Label required>State</Label>
                    <TextField size="small" fullWidth sx={inputSx}
                        placeholder="e.g. Lagos State"
                        value={data.state}
                        onChange={(e) => onChange("state", e.target.value)}
                        error={!!errors?.state}
                        helperText={errors?.state}
                    />
                </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                    <Label>Postal code</Label>
                    <TextField size="small" fullWidth sx={inputSx}
                        placeholder="100001"
                        value={data.postalCode}
                        onChange={(e) => onChange("postalCode", e.target.value)}
                        error={!!errors?.postalCode}
                        helperText={errors?.postalCode}
                    />
                </Box>
                <Box>
                    <Label required>Phone</Label>
                    <TextField size="small" fullWidth sx={inputSx}
                        placeholder="+234..."
                        value={data.phone}
                        onChange={(e) => onChange("phone", e.target.value)}
                        error={!!errors?.phone}
                        helperText={errors?.phone}
                    />
                </Box>
            </Box>

            <Box>
                <Label required>Contact email</Label>
                <TextField size="small" fullWidth sx={inputSx}
                    placeholder="contact@vendor.com"
                    type="email"
                    value={data.contactEmail}
                    onChange={(e) => onChange("contactEmail", e.target.value)}
                    error={!!errors?.contactEmail}
                    helperText={errors?.contactEmail}
                />
            </Box>

            <Box>
                <Label required>Secondary email</Label>
                <TextField size="small" fullWidth sx={inputSx}
                    placeholder="secondary@vendor.com"
                    type="email"
                    value={data.secondaryEmail}
                    onChange={(e) => onChange("secondaryEmail", e.target.value)}
                    error={!!errors?.secondaryEmail}
                    helperText={errors?.secondaryEmail}
                />
            </Box>

            <Box>
                <Label required>Bank name</Label>
                <TextField size="small" fullWidth sx={inputSx}
                    placeholder="e.g. First Bank Nigeria"
                    value={data.bankName}
                    onChange={(e) => onChange("bankName", e.target.value)}
                    error={!!errors?.bankName}
                    helperText={errors?.bankName}
                />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                    <Label required>Account number</Label>
                    <TextField size="small" fullWidth sx={inputSx}
                        placeholder="10-digit number"
                        value={data.accountNumber}
                        onChange={(e) => onChange("accountNumber", e.target.value)}
                        error={!!errors?.accountNumber}
                        helperText={errors?.accountNumber}
                    />
                </Box>
                <Box>
                    <Label required>Account name</Label>
                    <TextField size="small" fullWidth sx={inputSx}
                        placeholder="As on bank records"
                        value={data.accountName}
                        onChange={(e) => onChange("accountName", e.target.value)}
                        error={!!errors?.accountName}
                        helperText={errors?.accountName}
                    />
                </Box>
            </Box>
        </Box>
    );
}