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
} from "@mui/material";
import { toast } from "react-toastify";

import {
  createSupplier,
  SupplierProp,
} from "../../services/ringfenceService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const initialState: SupplierProp = {
  name: "",
  code: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  is_active: true,
};

export default function CreateSupplierModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const handleChange =
    (field: keyof SupplierProp) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
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
      !form.name ||
      !form.code ||
      !form.contact_name ||
      !form.contact_email ||
      !form.contact_phone
    ) {
      toast.warning("Please complete all required fields.");
      return;
    }

    try {
      setLoading(true);

      await createSupplier(form);

      toast.success("Supplier created successfully.");

      setForm(initialState);

      onSuccess?.();

      onClose();
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.message ||
          error?.detail ||
          "Unable to create supplier."
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
      <DialogTitle
        className="bg-blue-800 text-white"
      >
        Create Supplier
    </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} mt={0.5}>
          <Grid item xs={12}>
            <TextField
              label="Supplier Name"
              fullWidth
              value={form.name}
              onChange={handleChange("name")}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Supplier Code"
              fullWidth
              value={form.code}
              onChange={handleChange("code")}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Contact Name"
              fullWidth
              value={form.contact_name}
              onChange={handleChange("contact_name")}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Contact Email"
              type="email"
              fullWidth
              value={form.contact_email}
              onChange={handleChange("contact_email")}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Contact Phone"
              fullWidth
              value={form.contact_phone}
              onChange={handleChange("contact_phone")}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
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
            "Create Supplier"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}