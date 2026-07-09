import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

import {
  VEND_TYPE_OPTIONS,
  VendType,
  EngineeringTokenPayload,
  EngineeringTokenResponse,
  issueEngineeringToken,
} from "./../../services/engineeringtokenservice";

type FieldKey = "units" | "kilowatt" | "to_ti" | "to_sgc" | "to_krn";

interface ResultDialogState {
  open: boolean;
  success: boolean;
  message: string;
  data?: EngineeringTokenResponse;
}

const EMPTY_FIELDS: Record<FieldKey, string> = {
  units: "",
  kilowatt: "",
  to_ti: "",
  to_sgc: "",
  to_krn: "",
};

const FIELD_LABELS: Record<FieldKey, string> = {
  units: "Units (kWh)",
  kilowatt: "Kilowatt (kW)",
  to_ti: "New TI",
  to_sgc: "New SGC",
  to_krn: "New KRN",
};

const BulkAssign: React.FC = () => {
  const [vendType, setVendType] = useState<VendType | "">("");
  const [meterNumber, setMeterNumber] = useState("");
  const [reason, setReason] = useState("");
  const [fields, setFields] = useState<Record<FieldKey, string>>(EMPTY_FIELDS);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultDialogState>({
    open: false,
    success: false,
    message: "",
  });

  const activeOption = useMemo(
    () => VEND_TYPE_OPTIONS.find((opt) => opt.value === vendType),
    [vendType]
  );

  const handleVendTypeChange = (value: VendType) => {
    setVendType(value);
    setFields(EMPTY_FIELDS); // reset conditional fields whenever the type changes
  };

  const handleFieldChange = (key: FieldKey, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = (): boolean => {
    if (!vendType || !meterNumber.trim() || !reason.trim()) return false;
    if (!activeOption) return false;
    return activeOption.fields.every((key) => fields[key].trim() !== "");
  };

  const resetForm = () => {
    setVendType("");
    setMeterNumber("");
    setReason("");
    setFields(EMPTY_FIELDS);
  };

  const buildPayload = (): EngineeringTokenPayload | null => {
    if (!vendType) return null;
    const base = { meter_number: meterNumber.trim(), reason: reason.trim() };

    switch (vendType) {
      case "freeissue":
        return { ...base, vend_type: "freeissue", units: fields.units.trim() };
      case "maxpower":
        return { ...base, vend_type: "maxpower", kilowatt: fields.kilowatt.trim() };
      case "tampertoken":
        return { ...base, vend_type: "tampertoken" };
      case "cleartoken":
        return { ...base, vend_type: "cleartoken" };
      case "keychange":
        return {
          ...base,
          vend_type: "keychange",
          to_ti: fields.to_ti.trim(),
          to_sgc: fields.to_sgc.trim(),
          to_krn: fields.to_krn.trim(),
        };
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!payload || !isFormValid()) return;

    setSubmitting(true);
    try {
      const response = await issueEngineeringToken(payload);
      setResult({
        open: true,
        success: true,
        message: `${response.description} issued successfully.`,
        data: response,
      });
    } catch (err: any) {
      // api.ts's makeApiCall throws the raw errorData object it parsed from
      // the backend response (e.g. `{ detail: "This request is available to
      // only vendors" }`), not an ApiErrors instance. So read the message
      // straight off that object instead of checking `instanceof`.
      const fieldErrors =
        err?.errors && typeof err.errors === "object"
          ? Object.values(err.errors).flat().join(" ")
          : "";

      const message =
        err?.detail ||
        err?.message ||
        err?.error ||
        fieldErrors ||
        "Something went wrong while issuing the token. Please try again.";

      setResult({ open: true, success: false, message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    const wasSuccess = result.success;
    setResult({ open: false, success: false, message: "" });
    if (wasSuccess) resetForm();
  };

  return (
    <Box sx={{ bgcolor: "#F4F5F8", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          height: 250,
          background: "linear-gradient(90deg,#22C1DC,#1E73E8)",
          px: 4,
          pt: 4,
        }}
      >
        <Typography variant="h4" fontWeight={600} color="white">
          Issue Engineering Token
        </Typography>
        <Typography variant="body1" color="rgba(255,255,255,0.85)" sx={{ mt: 1 }}>
          Issue a non-financial STS token directly to a meter.
        </Typography>
      </Box>

      {/* Main Card */}
      <Paper elevation={5} sx={{ width: "80%", mx: "auto", mt: -12, p: 5, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ color: "#4A5B7C" }}>
          Token Details
        </Typography>

        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          {/* Vend Type */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Token Type</InputLabel>
              <Select
                value={vendType}
                label="Token Type"
                onChange={(e) => handleVendTypeChange(e.target.value as VendType)}
              >
                {VEND_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
              {activeOption && (
                <FormHelperText>{activeOption.helperText}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Meter Number */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Meter Number"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
              placeholder="e.g. 04012345678"
            />
          </Grid>

          {/* Conditional fields, driven entirely by the selected vend type */}
          {activeOption?.fields.map((key) => (
            <Grid item xs={12} md={6} key={key}>
              <TextField
                fullWidth
                label={FIELD_LABELS[key]}
                value={fields[key]}
                onChange={(e) => handleFieldChange(key, e.target.value)}
              />
            </Grid>
          ))}

          {/* Reason */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this token being issued?"
            />
          </Grid>
        </Grid>

        {/* Buttons */}
        <Box mt={5} display="flex" gap={3} flexWrap="wrap">
          <Button
            variant="outlined"
            onClick={resetForm}
            disabled={submitting}
            sx={{
              px: 5,
              py: 1.8,
              fontSize: 18,
              textTransform: "none",
              borderRadius: 2,
              borderColor: "#203864",
              color: "#203864",
              fontWeight: 600,
            }}
          >
            Clear
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid() || submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              px: 5,
              py: 1.8,
              fontSize: 18,
              textTransform: "none",
              borderRadius: 2,
              bgcolor: "#17315C",
              fontWeight: 600,
              boxShadow: 3,
              "&:hover": { bgcolor: "#10284B" },
            }}
          >
            {submitting ? "Issuing Token..." : "Issue Token"}
          </Button>
        </Box>
      </Paper>

      {/* Result modal: success or failure, both routed through the same dialog */}
      <Dialog open={result.open} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pt: 3 }}>
          {result.success ? (
            <CheckCircleRoundedIcon sx={{ color: "#2E7D32", fontSize: 30 }} />
          ) : (
            <ErrorRoundedIcon sx={{ color: "#C62828", fontSize: 30 }} />
          )}
          <Typography variant="h6" fontWeight={600}>
            {result.success ? "Token Issued" : "Token Issue Failed"}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: result.data ? 2 : 0 }}>
            {result.message}
          </Typography>

          {result.success && result.data && (
            <Box sx={{ bgcolor: "#F7F9FC", borderRadius: 2, p: 2.5 }}>
              <Grid container spacing={1.5}>
                <Grid item xs={5}>
                  <Typography variant="caption" color="text.secondary">Token</Typography>
                </Grid>
                <Grid item xs={7} sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-all" }}>
                    {result.data.token}
                  </Typography>
                </Grid>

                {result.data.token2 && (
                  <>
                    <Grid item xs={5}>
                      <Typography variant="caption" color="text.secondary">Token 2</Typography>
                    </Grid>
                    <Grid item xs={7} sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-all" }}>
                        {result.data.token2}
                      </Typography>
                    </Grid>
                  </>
                )}

                <Grid item xs={5}>
                  <Typography variant="caption" color="text.secondary">Value</Typography>
                </Grid>
                <Grid item xs={7} sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Typography variant="body2" fontWeight={600}>{result.data.value}</Typography>
                </Grid>

                <Grid item xs={5}>
                  <Typography variant="caption" color="text.secondary">Invoice ID</Typography>
                </Grid>
                <Grid item xs={7} sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Typography variant="body2" fontWeight={600}>{result.data.invoice_id}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">{result.data.description}</Typography>
                  <Chip
                    size="small"
                    label={result.data.token_type}
                    sx={{ bgcolor: "#E3F2FD", color: "#1565C0", fontWeight: 600 }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          {result.success && result.data && (
            <Button
              startIcon={<ContentCopyRoundedIcon />}
              onClick={() => navigator.clipboard.writeText(result.data!.token)}
              sx={{ textTransform: "none", color: "#203864" }}
            >
              Copy Token
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleCloseDialog}
            sx={{
              textTransform: "none",
              bgcolor: "#17315C",
              fontWeight: 600,
              "&:hover": { bgcolor: "#10284B" },
            }}
          >
            {result.success ? "Done" : "Close"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkAssign;