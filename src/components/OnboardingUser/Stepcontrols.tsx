import React from "react";
import { Box, TextField, Typography, Switch, Divider } from "@mui/material";
import { ControlsFormData } from "./WizardTypes";

interface StepControlsProps {
  data: ControlsFormData;
  onChange: (field: keyof ControlsFormData, value: string) => void;
  onToggleTxType: (txType: string) => void;
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

export default function StepControls({ data, onChange, onToggleTxType }: StepControlsProps) {
  return (
    <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box>
        <Label>Daily funding cap (₦)</Label>
        <TextField size="small" fullWidth sx={inputSx}
          placeholder="e.g. 500,000"
          value={data.dailyFundingCap}
          onChange={(e) => onChange("dailyFundingCap", e.target.value)}
        />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <Box>
          <Label>Max per transaction (₦)</Label>
          <TextField size="small" fullWidth sx={inputSx}
            placeholder="100,000"
            value={data.maxPerTransaction}
            onChange={(e) => onChange("maxPerTransaction", e.target.value)}
          />
        </Box>
        <Box>
          <Label>Commission rate (%)</Label>
          <TextField size="small" fullWidth sx={inputSx}
            placeholder="2.5"
            value={data.commissionRate}
            onChange={(e) => onChange("commissionRate", e.target.value)}
          />
        </Box>
      </Box>

      <Box>
        <Label>Monthly volume target (₦)</Label>
        <TextField size="small" fullWidth sx={inputSx}
          placeholder="e.g. 2,000,000"
          value={data.monthlyVolumeTarget}
          onChange={(e) => onChange("monthlyVolumeTarget", e.target.value)}
        />
      </Box>

      <Box>
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.1em", color: "#9AA4B2", textTransform: "uppercase", mb: 0.5 }}>
          Permitted Transaction Types
        </Typography>
        <Box sx={{ border: "1px solid #E8ECF0", borderRadius: 2, overflow: "hidden" }}>
          {Object.entries(data.permittedTxTypes).map(([txType, enabled], index, arr) => (
            <React.Fragment key={txType}>
              <Box sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                px: 2, py: 1.5, bgcolor: "#fff",
                "&:hover": { bgcolor: "#F9FAFB" }, transition: "background-color 0.15s",
              }}>
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 500, color: "#0D1B2A" }}>
                  {txType}
                </Typography>
                <Switch
                  checked={enabled}
                  onChange={() => onToggleTxType(txType)}
                  size="small"
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#fff" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#0F2D6B" },
                  }}
                />
              </Box>
              {index < arr.length - 1 && <Divider sx={{ borderColor: "#F0F2F5" }} />}
            </React.Fragment>
          ))}
        </Box>
      </Box>
    </Box>
  );
}