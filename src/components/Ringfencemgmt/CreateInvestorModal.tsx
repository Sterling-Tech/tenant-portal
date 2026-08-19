import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { toast } from "react-toastify";

import {
  createInvestor,
  InvestorProp,
} from "../../services/ringfenceService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const initialState: InvestorProp = {
  name: "",
  code: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  is_active: true,
};

export default function CreateInvestorModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<InvestorProp>(initialState);
  const [loading, setLoading] = useState(false);

  const handleChange =
    (field: keyof InvestorProp) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev:any) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleClose = () => {
    if (loading) return;

    setForm(initialState);
    onClose();
  };

  const handleSubmit = async () => {
    if (
      !form.name.trim() ||
      !form.code.trim() ||
      !form.contact_name.trim() ||
      !form.contact_email.trim() ||
      !form.contact_phone.trim()
    ) {
      toast.warning("Please complete all required fields.");
      return;
    }

    try {
      setLoading(true);

      await createInvestor(form);

      toast.success("Investor created successfully.");

      setForm(initialState);

      onSuccess?.();

      onClose();
    } catch (error: any) {
      console.error("Failed to create investor:", error);

      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          "Unable to create investor."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle className="bg-blue-800 text-white">
        Create Investor
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} mt={0.5}>

          {/* Investor Name */}
          <Grid item xs={12}>
            <TextField
              label="Investor Name"
              placeholder="Enter investor name"
              fullWidth
              required
              value={form.name}
              onChange={handleChange("name")}
              disabled={loading}
            />
          </Grid>

          {/* Investor Code */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Investor Code"
              placeholder="e.g. INV001"
              fullWidth
              required
              value={form.code}
              onChange={handleChange("code")}
              disabled={loading}
            />
          </Grid>

          {/* Contact Name */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Contact Name"
              placeholder="Contact person's name"
              fullWidth
              required
              value={form.contact_name}
              onChange={handleChange("contact_name")}
              disabled={loading}
            />
          </Grid>

          {/* Contact Email */}
          <Grid item xs={12}>
            <TextField
              label="Contact Email"
              type="email"
              placeholder="investor@example.com"
              fullWidth
              required
              value={form.contact_email}
              onChange={handleChange("contact_email")}
              disabled={loading}
            />
          </Grid>

          {/* Contact Phone */}
          <Grid item xs={12}>
            <TextField
              label="Contact Phone"
              placeholder="080XXXXXXXX"
              fullWidth
              required
              value={form.contact_phone}
              onChange={handleChange("contact_phone")}
              disabled={loading}
            />
          </Grid>

          {/* Active Status */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(event) =>
                    setForm((prev:any) => ({
                      ...prev,
                      is_active: event.target.checked,
                    }))
                  }
                  disabled={loading}
                />
              }
              label="Active Investor"
            />
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress
              size={20}
              color="inherit"
            />
          ) : (
            "Create Investor"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}