import React from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";


export interface OnboardVendorForm {
  email: string;
  password: string;
}

interface OnboardVendorModalProps {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  form: OnboardVendorForm;
  setForm: React.Dispatch<React.SetStateAction<OnboardVendorForm>>;
  onSubmit: () => void;
}

export default function OnboardVendorModal({
  open,
  onClose,
  loading = false,
  form,
  setForm,
  onSubmit,
}: OnboardVendorModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle className="bg-blue-950 text-white">
        <Typography
          variant="h6"
          fontWeight={700}
        >
          Add Vendor
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} mt={1}>
          <TextField
            label="Vendor Email"
            type="email"
            fullWidth
            required
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
          />

          <TextField
            label="Temporary Password"
            type="password"
            fullWidth
            required
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                password: e.target.value,
              }))
            }
          />

          <Alert severity="info">
            The vendor will receive these credentials and complete the remaining
            onboarding process after logging into the Vendor Portal.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
            onClick={onClose}
        >
          Cancel
        </Button>

        <Button
        //   loading={loading}
          variant="contained"
          onClick={onSubmit}
        >
          Create Vendor
        </Button>
      </DialogActions>
    </Dialog>
  );
}