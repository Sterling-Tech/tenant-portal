
import React from "react";
import { Box, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { WIZARD_STEPS } from "./WizardTypes";

interface WizardStepperProps {
  currentStep: number; // 0-indexed
}

export default function WizardStepper({ currentStep }: WizardStepperProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: 3,
        py: 2,
        overflowX: "auto",
        borderBottom: "1px solid #E8ECF0",
        gap: 0,
      }}
    >
      {WIZARD_STEPS.map((step, index) => {
        const completed = index < currentStep;
        const active = index === currentStep;

        return (
          <React.Fragment key={step.label}>
            {/* Step bubble + label */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  flexShrink: 0,
                  transition: "all 0.2s",
                  ...(completed && {
                    bgcolor: "#1A7F4B",
                    color: "#fff",
                    border: "none",
                  }),
                  ...(active && {
                    bgcolor: "#0F2D6B",
                    color: "#fff",
                    border: "none",
                  }),
                  ...(!completed && !active && {
                    bgcolor: "transparent",
                    color: "#9AA4B2",
                    border: "2px solid #D0D5DD",
                  }),
                }}
              >
                {completed ? <CheckIcon sx={{ fontSize: 14 }} /> : index + 1}
              </Box>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: active ? 700 : 400,
                  color: active ? "#0F2D6B" : completed ? "#1A7F4B" : "#9AA4B2",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {step.label}
              </Typography>
            </Box>

            {/* Connector line */}
            {index < WIZARD_STEPS.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  height: "1.5px",
                  mx: 1,
                  minWidth: 12,
                  bgcolor: completed ? "#1A7F4B" : "#D0D5DD",
                  transition: "background-color 0.3s",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
}