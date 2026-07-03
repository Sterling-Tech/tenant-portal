import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const MONTHS = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
];

const YEARS = [2026, 2025, 2024];

const CODES = [
  "MAPREF",
  "MAPREA",
  "MAPDEF",
  "MAPRER",
  "DEBMIG",
  "DEBPCT",
];

export default function AddRefundRequestDialog({
  open,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState({
    meter_number: "",
    account_number: "",
    customer_name: "",
    amount: "",
    arrears_code: "MAPREF",
    month: 6,
    year: 2026,
  });

  const update = (
    key: keyof typeof form,
    value: any
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          bgcolor: "#12295A",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        Add Refund Request

        <IconButton
          sx={{ color: "#fff" }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Meter Number"
              value={form.meter_number}
              onChange={(e) =>
                update(
                  "meter_number",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Account Number"
              value={form.account_number}
              onChange={(e) =>
                update(
                  "account_number",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Customer Name"
              value={form.customer_name}
              onChange={(e) =>
                update(
                  "customer_name",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Refund Amount"
              value={form.amount}
              onChange={(e) =>
                update("amount", e.target.value)
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label="Arrears Code"
              value={form.arrears_code}
              onChange={(e) =>
                update(
                  "arrears_code",
                  e.target.value
                )
              }
            >
              {CODES.map((code) => (
                <MenuItem
                  key={code}
                  value={code}
                >
                  {code}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label="Month"
              value={form.month}
              onChange={(e) =>
                update(
                  "month",
                  Number(e.target.value)
                )
              }
            >
              {MONTHS.map((m) => (
                <MenuItem
                  key={m.value}
                  value={m.value}
                >
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label="Year"
              value={form.year}
              onChange={(e) =>
                update(
                  "year",
                  Number(e.target.value)
                )
              }
            >
              {YEARS.map((year) => (
                <MenuItem
                  key={year}
                  value={year}
                >
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={() => onSubmit(form)}
        >
          Save Refund Request
        </Button>
      </DialogActions>
    </Dialog>
  );
}