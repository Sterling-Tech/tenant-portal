import React from "react";
import { Box, TextField, Typography, FormControl, Select, MenuItem } from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { KYCFormData } from "./WizardTypes";

interface StepKYCProps {
  data: KYCFormData;
  onChange: (field: keyof KYCFormData, value: string) => void;
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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.1em", color: "#9AA4B2", textTransform: "uppercase", mb: 1 }}>
      {children}
    </Typography>
  );
}

function UploadBox({ label, subtitle, required }: { label: string; subtitle: string; required?: boolean }) {
  return (
    <Box sx={{
      border: "1.5px dashed #C5CDD8", borderRadius: 2, bgcolor: "#F5F7FA",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", py: 3, gap: 0.75, cursor: "pointer",
      transition: "border-color 0.2s, background-color 0.2s",
      "&:hover": { borderColor: "#0F2D6B", bgcolor: "#EEF2FB" },
    }}>
      <FileUploadOutlinedIcon sx={{ color: "#9AA4B2", fontSize: 26 }} />
      <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "#0D1B2A" }}>
        {label}{required && <span style={{ color: "#C0392B" }}> *</span>}
      </Typography>
      <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
    </Box>
  );
}

const ID_TYPES = ["National ID (NIN)", "International Passport", "Driver's Licence", "Voter's Card"];

export default function StepKYC({ data, onChange }: StepKYCProps) {
  return (
    <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
      <SectionHeading>Identity Documents</SectionHeading>

      <Box>
        <Label required>CAC registration number</Label>
        <TextField size="small" fullWidth sx={inputSx}
          placeholder="e.g. RC-1234567"
          value={data.cacNumber}
          onChange={(e) => onChange("cacNumber", e.target.value)}
        />
      </Box>

      <Box>
        <Label>Tax Identification Number (TIN)</Label>
        <TextField size="small" fullWidth sx={inputSx}
          placeholder="e.g. 12345678-0001"
          value={data.taxId}
          onChange={(e) => onChange("taxId", e.target.value)}
        />
      </Box>

      <Box>
        <Label required>Director / Owner full name</Label>
        <TextField size="small" fullWidth sx={inputSx}
          placeholder="As on government ID"
          value={data.directorName}
          onChange={(e) => onChange("directorName", e.target.value)}
        />
      </Box>

      <Box>
        <Label required>Date of birth</Label>
        <TextField size="small" fullWidth sx={inputSx}
          placeholder="Dob"
          type="date"
          value={data.dateOfBirth}
          onChange={(e) => onChange("dateOfBirth", e.target.value)}
        />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <Box>
          <Label required>ID type</Label>
          <FormControl size="small" fullWidth>
            <Select value={data.idType}
              onChange={(e) => onChange("idType", e.target.value)}
              sx={{ bgcolor: "#F5F7FA", "& fieldset": { borderColor: "#E0E4EA" } }}>
              {ID_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <Box>
          <Label required>ID number</Label>
          <TextField size="small" fullWidth sx={inputSx}
            placeholder="Enter ID number"
            value={data.idNumber}
            onChange={(e) => onChange("idNumber", e.target.value)}
          />
        </Box>
      </Box>

      {/* <Box sx={{ mt: 1 }}>
        <SectionHeading>Document Uploads</SectionHeading>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <UploadBox label="CAC certificate" subtitle="PDF or image, max 5MB" required />
          <UploadBox label="Utility bill / proof of address" subtitle="Not older than 3 months" />
          <UploadBox label="Director / Owner ID" subtitle="Clear photo or scan" required />
        </Box>
      </Box> */}
    </Box>
  );
}