import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  Collapse,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

// ─── Types ────────────────────────────────────────────────────────────────────
export type StatusFilter = "All" | "Pending" | "Approved" | "Rejected";

export interface RefundFiltersState {
  search: string;
  status: StatusFilter;
  month: string;   // "All" | "March" | "April" | "May" | "June"
  year: string;     // "All" | "2026" | "2025"
  arrearsCode: string;
  emailDelivered: string;
  smsSent: string;
}

export interface RefundFiltersProps {
  filters: RefundFiltersState;
  onChange: (filters: RefundFiltersState) => void;
  onApply: () => void;
  onReset: () => void;
  activeCount: number;
}

const MONTHS = ["All", "March", "April", "May", "June"];
const YEARS = ["All", "2026", "2025"];
const STATUSES: StatusFilter[] = ["All", "Pending", "Approved", "Rejected"];

// ─── Collapsible filter group ─────────────────────────────────────────────────
function FilterGroup({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Box sx={{ borderBottom: "1px solid #EEF0F3", py: 1.5 }}>
      <Box
        onClick={() => setOpen((o) => !o)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#0D1B2A" }}>
          {title}
        </Typography>
        {open ? (
          <KeyboardArrowDownIcon sx={{ fontSize: 18, color: "#9AA4B2" }} />
        ) : (
          <KeyboardArrowRightIcon sx={{ fontSize: 18, color: "#9AA4B2" }} />
        )}
      </Box>
      <Collapse in={open}>
        <Box sx={{ mt: 1.25 }}>{children}</Box>
      </Collapse>
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RefundFilters({
  filters,
  onChange,
  onApply,
  onReset,
  activeCount,
}: RefundFiltersProps) {
  function update<K extends keyof RefundFiltersState>(key: K, value: RefundFiltersState[K]) {
    onChange({ ...filters, [key]: value });
  }

  const radioSx = {
    color: "#D0D5DD",
    "&.Mui-checked": { color: "#3B5BDB" },
    p: 0.6,
  };

  const labelSx = { fontSize: "0.86rem", color: "#3B5BDB" };
  const labelSxInactive = { fontSize: "0.86rem", color: "#475569" };

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: "1px solid #EEF0F3",
        borderRadius: 2.5,
        p: 2.5,
        width: { xs: "100%", md: 280 },
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.25 }}>
        <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#0D1B2A" }}>
          Filters
        </Typography>
        <Button
          size="small"
          onClick={onReset}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.78rem",
            color: "#475569",
            border: "1px solid #E0E4EA",
            borderRadius: 5,
            px: 1.5,
            py: 0.2,
            minWidth: 0,
            "&:hover": { bgcolor: "#F9FAFB" },
          }}
        >
          Reset
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.78rem", mb: 2 }}>
        {activeCount} active
      </Typography>

      {/* Search */}
      <TextField
        placeholder="Search by meter, account, name…"
        size="small"
        fullWidth
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#9AA4B2", fontSize: 19 }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 1,
          "& .MuiOutlinedInput-root": {
            bgcolor: "#F5F7FA",
            "& fieldset": { borderColor: "#E0E4EA" },
          },
        }}
      />

      {/* By status */}
      <FilterGroup title="By status" defaultOpen>
        <RadioGroup value={filters.status} onChange={(e) => update("status", e.target.value as StatusFilter)}>
          {STATUSES.map((s) => (
            <FormControlLabel
              key={s}
              value={s}
              control={<Radio size="small" sx={radioSx} />}
              label={s}
              sx={{ "& .MuiFormControlLabel-label": filters.status === s ? labelSx : labelSxInactive, mb: -0.5 }}
            />
          ))}
        </RadioGroup>
      </FilterGroup>

      {/* By month */}
      <FilterGroup title="By month" defaultOpen>
        <RadioGroup value={filters.month} onChange={(e) => update("month", e.target.value)}>
          {MONTHS.map((m) => (
            <FormControlLabel
              key={m}
              value={m}
              control={<Radio size="small" sx={radioSx} />}
              label={m}
              sx={{ "& .MuiFormControlLabel-label": filters.month === m ? labelSx : labelSxInactive, mb: -0.5 }}
            />
          ))}
        </RadioGroup>
      </FilterGroup>

      {/* By year */}
      <FilterGroup title="By year">
        <RadioGroup value={filters.year} onChange={(e) => update("year", e.target.value)}>
          {YEARS.map((y) => (
            <FormControlLabel
              key={y}
              value={y}
              control={<Radio size="small" sx={radioSx} />}
              label={y}
              sx={{ "& .MuiFormControlLabel-label": filters.year === y ? labelSx : labelSxInactive, mb: -0.5 }}
            />
          ))}
        </RadioGroup>
      </FilterGroup>

      {/* By arrears code */}
      <FilterGroup title="By arrears code" />

      {/* By email delivered */}
      <FilterGroup title="By email delivered" />

      {/* By sms sent */}
      <Box sx={{ py: 1.5 }}>
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#0D1B2A" }}>
            By sms sent
          </Typography>
          <KeyboardArrowRightIcon sx={{ fontSize: 18, color: "#9AA4B2" }} />
        </Box>
      </Box>

      {/* Apply button */}
      <Button
        fullWidth
        variant="contained"
        onClick={onApply}
        sx={{
          mt: 1,
          bgcolor: "#0D1B2A",
          fontWeight: 700,
          py: 1.1,
          borderRadius: 2,
          textTransform: "none",
          fontSize: "0.9rem",
          "&:hover": { bgcolor: "#1A2B40" },
        }}
      >
        Apply Filters
      </Button>
    </Box>
  );
}