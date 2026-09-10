import React, { useEffect, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Region, RegionPayload } from "../../../services/crmdService";


interface RegionFormModalProps {
  open: boolean;
  onClose: () => void;

  region?: Region | null;

  loading?: boolean;

  onSubmit: (
    payload: RegionPayload
  ) => void;
}

const EMPTY_FORM: RegionPayload = {
  name: "",
  code: "",
  nerc_address: "",
  nerc_phone: "",
  remittance_account: "",
  is_active: true,
};

export default function RegionFormModal({
  open,
  onClose,
  region,
  loading = false,
  onSubmit,
}: RegionFormModalProps) {
  const [form, setForm] =
    useState<RegionPayload>(EMPTY_FORM);

  useEffect(() => {
    if (region) {
      setForm({
        name: region.name || "",
        code: region.code || "",
        nerc_address:
          region.nerc_address || "",
        nerc_phone:
          region.nerc_phone || "",
        remittance_account:
          region.remittance_account || "",
        is_active: region.is_active,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [region, open]);

  const handleChange = (
    field: keyof RegionPayload,
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      return;
    }

    if (!form.code.trim()) {
      return;
    }

    onSubmit(form);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Typography
          variant="h6"
          fontWeight={700}
        >
          {region
            ? "Edit Region"
            : "Create Region"}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} mt={1}>

          <TextField
            label="Region Name"
            required
            fullWidth
            value={form.name}
            onChange={(e) =>
              handleChange(
                "name",
                e.target.value
              )
            }
          />

          <TextField
            label="Region Code"
            required
            fullWidth
            placeholder="e.g. LAG"
            value={form.code}
            onChange={(e) =>
              handleChange(
                "code",
                e.target.value.toUpperCase()
              )
            }
          />

          <TextField
            label="NERC Address"
            multiline
            rows={3}
            fullWidth
            value={form.nerc_address}
            onChange={(e) =>
              handleChange(
                "nerc_address",
                e.target.value
              )
            }
          />

          <TextField
            label="NERC Phone"
            fullWidth
            value={form.nerc_phone}
            onChange={(e) =>
              handleChange(
                "nerc_phone",
                e.target.value
              )
            }
          />

          <TextField
            label="Remittance Account"
            fullWidth
            value={form.remittance_account}
            onChange={(e) =>
              handleChange(
                "remittance_account",
                e.target.value
              )
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={form.is_active}
                onChange={(e) =>
                  handleChange(
                    "is_active",
                    e.target.checked
                  )
                }
              />
            }
            label={
              form.is_active
                ? "Active"
                : "Inactive"
            }
          />

        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : region
            ? "Update Region"
            : "Create Region"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}