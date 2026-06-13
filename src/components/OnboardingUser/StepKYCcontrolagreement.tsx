// import React from "react";
// import {
//   Box, TextField, Typography, FormControl, InputLabel,
//   Select, MenuItem, Checkbox, FormControlLabel, Switch, Divider,
// } from "@mui/material";
// import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
// import { VendorFormData } from "./WizardTypes";

// // ─── Shared helpers ───────────────────────────────────────────────────────────
// const inputSx = {
//   "& .MuiOutlinedInput-root": {
//     bgcolor: "#F5F7FA",
//     "& fieldset": { borderColor: "#E0E4EA" },
//     "&:hover fieldset": { borderColor: "#B0BFD8" },
//     "&.Mui-focused fieldset": { borderColor: "#0F2D6B" },
//   },
// };

// function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
//   return (
//     <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.8, color: "#0D1B2A" }}>
//       {children}{required && <span style={{ color: "#C0392B" }}> *</span>}
//     </Typography>
//   );
// }

// function SectionHeading({ children }: { children: React.ReactNode }) {
//   return (
//     <Typography
//       sx={{
//         fontSize: "0.68rem",
//         fontWeight: 800,
//         letterSpacing: "0.1em",
//         color: "#9AA4B2",
//         textTransform: "uppercase",
//         mb: 2,
//       }}
//     >
//       {children}
//     </Typography>
//   );
// }

// function UploadBox({ label, subtitle, required }: { label: string; subtitle: string; required?: boolean }) {
//   return (
//     <Box
//       sx={{
//         border: "1.5px dashed #C5CDD8",
//         borderRadius: 2,
//         bgcolor: "#F5F7FA",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         py: 3,
//         gap: 0.75,
//         cursor: "pointer",
//         transition: "border-color 0.2s, background-color 0.2s",
//         "&:hover": { borderColor: "#0F2D6B", bgcolor: "#EEF2FB" },
//       }}
//     >
//       <FileUploadOutlinedIcon sx={{ color: "#9AA4B2", fontSize: 26 }} />
//       <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "#0D1B2A" }}>
//         {label}{required && <span style={{ color: "#C0392B" }}> *</span>}
//       </Typography>
//       <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
//     </Box>
//   );
// }

// // ─── Step 4: KYC ─────────────────────────────────────────────────────────────
// interface StepKYCProps {
//   data: VendorFormData;
//   onChange: (field: keyof VendorFormData, value: string) => void;
// }

// const ID_TYPES = [
//   "National ID (NIN)",
//   "International Passport",
//   "Driver's Licence",
//   "Voter's Card",
// ];

// export function StepKYC({ data, onChange }: StepKYCProps) {
//   return (
//     <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
//       <SectionHeading>Identity Documents</SectionHeading>

//       {/* CAC registration number */}
//       <Box>
//         <Label required>CAC registration number</Label>
//         <TextField
//           size="small" fullWidth sx={inputSx}
//           placeholder="e.g. RC-1234567"
//           value={data.cacNumber}
//           onChange={(e) => onChange("cacNumber", e.target.value)}
//         />
//       </Box>

//       {/* Tax Identification Number */}
//       <Box>
//         <Label>Tax Identification Number (TIN)</Label>
//         <TextField
//           size="small" fullWidth sx={inputSx}
//           placeholder="e.g. 12345678-0001"
//           value={data.taxId}
//           onChange={(e) => onChange("taxId", e.target.value)}
//         />
//       </Box>

//       {/* Director / Owner full name */}
//       <Box>
//         <Label required>Director / Owner full name</Label>
//         <TextField
//           size="small" fullWidth sx={inputSx}
//           placeholder="As on government ID"
//           value={data.directorName}
//           onChange={(e) => onChange("directorName", e.target.value)}
//         />
//       </Box>

//       {/* ID type + ID number */}
//       <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
//         <Box>
//           <Label required>ID type</Label>
//           <FormControl size="small" fullWidth>
//             <Select
//               value={data.idType}
//               onChange={(e) => onChange("idType", e.target.value)}
//               sx={{ bgcolor: "#F5F7FA", "& fieldset": { borderColor: "#E0E4EA" } }}
//             >
//               {ID_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
//             </Select>
//           </FormControl>
//         </Box>
//         <Box>
//           <Label required>ID number</Label>
//           <TextField
//             size="small" fullWidth sx={inputSx}
//             placeholder="Enter ID number"
//             value={data.idNumber}
//             onChange={(e) => onChange("idNumber", e.target.value)}
//           />
//         </Box>
//       </Box>

//       {/* Document uploads section */}
//       <Box sx={{ mt: 1 }}>
//         <SectionHeading>Document Uploads</SectionHeading>
//         <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//           <UploadBox label="CAC certificate" subtitle="PDF or image, max 5MB" required />
//           <UploadBox label="Utility bill / proof of address" subtitle="Not older than 3 months" />
//           <UploadBox label="Director / Owner ID" subtitle="Clear photo or scan" required />
//         </Box>
//       </Box>
//     </Box>
//   );
// }

// // ─── Step 5: Controls ─────────────────────────────────────────────────────────
// interface StepControlsProps {
//   data: VendorFormData;
//   onChange: (field: keyof VendorFormData, value: string) => void;
//   onToggleTxType: (txType: string) => void;
// }

// export function StepControls({ data, onChange, onToggleTxType }: StepControlsProps) {
//   return (
//     <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
//       {/* Daily funding cap */}
//       <Box>
//         <Label>Daily funding cap (₦)</Label>
//         <TextField
//           size="small" fullWidth sx={inputSx}
//           placeholder="e.g. 500,000"
//           value={data.dailyFundingCap}
//           onChange={(e) => onChange("dailyFundingCap", e.target.value)}
//         />
//       </Box>

//       {/* Max per transaction + Commission rate */}
//       <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
//         <Box>
//           <Label>Max per transaction (₦)</Label>
//           <TextField
//             size="small" fullWidth sx={inputSx}
//             placeholder="100,000"
//             value={data.maxPerTransaction}
//             onChange={(e) => onChange("maxPerTransaction", e.target.value)}
//           />
//         </Box>
//         <Box>
//           <Label>Commission rate (%)</Label>
//           <TextField
//             size="small" fullWidth sx={inputSx}
//             placeholder="2.5"
//             value={data.commissionRate}
//             onChange={(e) => onChange("commissionRate", e.target.value)}
//           />
//         </Box>
//       </Box>

//       {/* Monthly volume target */}
//       <Box>
//         <Label>Monthly volume target (₦)</Label>
//         <TextField
//           size="small" fullWidth sx={inputSx}
//           placeholder="e.g. 2,000,000"
//           value={data.monthlyVolumeTarget}
//           onChange={(e) => onChange("monthlyVolumeTarget", e.target.value)}
//         />
//       </Box>

//       {/* Permitted transaction types */}
//       <Box>
//         <Typography
//           sx={{
//             fontSize: "0.68rem",
//             fontWeight: 800,
//             letterSpacing: "0.1em",
//             color: "#9AA4B2",
//             textTransform: "uppercase",
//             mb: 0.5,
//           }}
//         >
//           Permitted Transaction Types
//         </Typography>

//         <Box sx={{ border: "1px solid #E8ECF0", borderRadius: 2, overflow: "hidden" }}>
//           {Object.entries(data.permittedTxTypes).map(([txType, enabled], index, arr) => (
//             <React.Fragment key={txType}>
//               <Box
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   px: 2,
//                   py: 1.5,
//                   bgcolor: "#fff",
//                   "&:hover": { bgcolor: "#F9FAFB" },
//                   transition: "background-color 0.15s",
//                 }}
//               >
//                 <Typography sx={{ fontSize: "0.88rem", fontWeight: 500, color: "#0D1B2A" }}>
//                   {txType}
//                 </Typography>
//                 <Switch
//                   checked={enabled}
//                   onChange={() => onToggleTxType(txType)}
//                   size="small"
//                   sx={{
//                     "& .MuiSwitch-switchBase.Mui-checked": { color: "#fff" },
//                     "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#0F2D6B" },
//                   }}
//                 />
//               </Box>
//               {index < arr.length - 1 && <Divider sx={{ borderColor: "#F0F2F5" }} />}
//             </React.Fragment>
//           ))}
//         </Box>
//       </Box>
//     </Box>
//   );
// }

// // ─── Step 6: Agreement ────────────────────────────────────────────────────────
// const AGREEMENT_TYPES = [
//   "Standard Disco vendor agreement",
//   "Custom vendor agreement",
//   "Reseller agreement",
//   "Agent agreement",
// ];

// interface StepAgreementProps {
//   data: VendorFormData;
//   onChange: (field: keyof VendorFormData, value: string) => void;
//   onToggleAgreed: () => void;
//   entityLabel?: string;
// }

// export function StepAgreement({ data, onChange, onToggleAgreed, entityLabel = "vendor" }: StepAgreementProps) {
//   return (
//     <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
//       {/* Agreement type */}
//       <Box>
//         <Label>Agreement type</Label>
//         <FormControl size="small" fullWidth>
//           <Select
//             value={data.agreementType}
//             onChange={(e) => onChange("agreementType", e.target.value)}
//             sx={{ bgcolor: "#F5F7FA", "& fieldset": { borderColor: "#E0E4EA" } }}
//           >
//             {AGREEMENT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
//           </Select>
//         </FormControl>
//       </Box>

//       {/* Effective date */}
//       <Box>
//         <Label>Effective date</Label>
//         <TextField
//           size="small" fullWidth sx={inputSx}
//           type="date"
//           value={data.effectiveDate}
//           onChange={(e) => onChange("effectiveDate", e.target.value)}
//           InputProps={{
//             sx: { color: data.effectiveDate ? "#0D1B2A" : "#9AA4B2" },
//           }}
//         />
//       </Box>

//       {/* Legal notice box */}
//       <Box
//         sx={{
//           border: "1px solid #E0E4EA",
//           borderRadius: 2,
//           bgcolor: "#F5F7FA",
//           p: 2,
//         }}
//       >
//         <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
//           By completing this onboarding you confirm that the entity has agreed to the
//           QuickCash platform terms of service and all operating conditions set by this Disco
//           tenant. This record will be timestamped, stored, and is auditable.
//         </Typography>
//       </Box>

//       {/* Confirmation checkbox */}
//       <FormControlLabel
//         control={
//           <Checkbox
//             checked={data.agreedToTerms}
//             onChange={onToggleAgreed}
//             sx={{
//               color: "#D0D5DD",
//               "&.Mui-checked": { color: "#0F2D6B" },
//               alignSelf: "flex-start",
//               mt: "-2px",
//             }}
//           />
//         }
//         label={
//           <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
//             I confirm the entity has accepted the agreement and KYC documents are
//             authentic and verified.
//           </Typography>
//         }
//         sx={{ alignItems: "flex-start", mr: 0 }}
//       />
//     </Box>
//   );
// }
import React from 'react'

export default function StepKYCcontrolagreement() {
  return (
    <div>StepKYCcontrolagreement</div>
  )
}
