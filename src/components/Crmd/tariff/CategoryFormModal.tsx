import { useEffect, useState } from "react";

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
} from "@mui/material";

import {
  TariffCategory,
  TariffCategoryPayload,
} from "../../../services/crmdService";

interface Props {
  open: boolean;
  onClose: () => void;
  category: TariffCategory | null;
  loading: boolean;

  onSubmit: (
    payload: TariffCategoryPayload
  ) => void;
}

const initialForm: TariffCategoryPayload = {
  name: "",
  legacy_name: "",
  is_active: true,
};

export default function CategoryFormModal({
  open,
  onClose,
  category,
  loading,
  onSubmit,
}: Props) {
  const [form, setForm] =
    useState<TariffCategoryPayload>(
      initialForm
    );

  // =========================
  // POPULATE FORM
  // =========================

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || "",
        legacy_name:
          category.legacy_name || "",
        is_active: category.is_active,
      });
    } else {
      setForm(initialForm);
    }
  }, [category, open]);

  // =========================
  // CHANGE HANDLER
  // =========================

  const handleChange = (
    field: keyof TariffCategoryPayload,
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("Category name is required");
      return;
    }

    if (!form.legacy_name.trim()) {
      alert("Legacy name is required");
      return;
    }

    onSubmit({
      ...form,
      name: form.name.trim(),
      legacy_name:
        form.legacy_name.trim(),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={
        loading
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {category
          ? "Edit Tariff Category"
          : "Add Tariff Category"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          {/* CATEGORY NAME */}

          <TextField
            fullWidth
            required
            label="Category Name"
            placeholder="e.g. Residential"
            value={form.name}
            onChange={(e) =>
              handleChange(
                "name",
                e.target.value
              )
            }
          />

          {/* LEGACY NAME */}

          <TextField
            fullWidth
            required
            label="Legacy Name"
            placeholder="Enter legacy category name"
            value={form.legacy_name}
            onChange={(e) =>
              handleChange(
                "legacy_name",
                e.target.value
              )
            }
          />

          {/* ACTIVE */}

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
            label="Active"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          disabled={loading}
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading
            ? "Saving..."
            : category
              ? "Update Category"
              : "Create Category"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}