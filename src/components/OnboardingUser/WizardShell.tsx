import React from "react";
import {
  Dialog, Box, Typography, IconButton, Divider, Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckIcon from "@mui/icons-material/Check";
import WizardStepper from "./WizardStepper";
import { WIZARD_STEPS } from "./WizardTypes";

interface WizardShellProps {
  open: boolean;
  onClose: () => void;
  entityLabel: string;        // e.g. "vendor", "subvendor"
  step: number;               // 0-indexed current step
  onNext: () => void;
  onPrev: () => void;
  canSubmit: boolean;         // enables final button
  onSaveDraft: () => void;
  onDiscardDraft: () => void;
  children: React.ReactNode;  // step content
}

export default function WizardShell({
  open, onClose, entityLabel, step, onNext, onPrev, canSubmit, onDiscardDraft, onSaveDraft, children,
}: WizardShellProps) {
  const totalSteps = WIZARD_STEPS.length;
  const isLast = step === totalSteps - 1;

  return (
    <Dialog
      open={open}
      // onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 1.5,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
        },
      }}
    >
      {/* ── Navy header ── */}
      <Box
        sx={{
          bgcolor: "#0F2D6B",
          px: 3, pt: 2.5, pb: 2,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#fff" }}>
            Onboard new {entityLabel}
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.72)", mt: 0.3 }}>
            Step {step + 1} of {totalSteps} – {WIZARD_STEPS[step].description}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 1.5,
            p: 0.5,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ── Stepper ── */}
      <WizardStepper currentStep={step} />

      {/* ── Scrollable body ── */}
      <Box sx={{ overflowY: "auto", flex: 1 }}>
        {children}
      </Box>

      {/* ── Footer ── */}
      <Divider />
      <Box
        sx={{
          px: 3, py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Step {step + 1} of {totalSteps}
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              color="error"
              variant="outlined"
              onClick={onDiscardDraft}
            >
              Discard
            </Button>

            <Button
              variant="outlined"
              onClick={onSaveDraft}
            >
              Save & Continue Later
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            {step > 0 && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={onPrev}
                sx={{
                  borderColor: "#D0D5DD",
                  color: "text.primary",
                  fontWeight: 600,
                  "&:hover": { borderColor: "#B0B8C8", bgcolor: "#F9FAFB" },
                }}
              >
                Previous
              </Button>
            )}
            <Button
              variant="contained"
              endIcon={isLast ? <CheckIcon /> : <ArrowForwardIcon />}
              onClick={onNext}
              disabled={isLast && !canSubmit}
              sx={{
                bgcolor: "#0F2D6B",
                px: 3,
                fontWeight: 600,
                "&:hover": { bgcolor: "#0A1F4D" },
                "&.Mui-disabled": { bgcolor: "#B0BFD8", color: "#fff" },
              }}
            >
              {isLast ? `Create ${entityLabel}` : "Next"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}