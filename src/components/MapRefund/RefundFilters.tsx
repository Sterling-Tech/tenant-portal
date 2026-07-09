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

export interface RefundFiltersState {
  search: string;
  status: StatusFilter;
  month: MonthFilter;
  year: YearFilter;
  arrears_code: ArrearsFilter;
  email_delivered: BooleanFilter;
  sms_sent: BooleanFilter;
}

export interface RefundFiltersProps {
  filters: RefundFiltersState;
  onChange: (filters: RefundFiltersState) => void;
  onApply: () => void;
  onReset: () => void;
  activeCount: number;
}

interface FilterRadioGroupProps<T extends string> {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}

function FilterRadioGroup<T extends string>({
  value,
  options,
  onChange,
}: FilterRadioGroupProps<T>) {
  return (
    <RadioGroup
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {options.map((option) => (
        <FormControlLabel
          key={option}
          value={option}
          control={<Radio size="small" sx={radioSx} />}
          label={option}
        />
      ))}
    </RadioGroup>
  );
}

const MONTHS = ["All", "3", "4", "5", "6", "7",] as const;
const STATUSES = ["All", "success", "pending", "failed",] as const;
const YEARS = ["All", "2026", "2025", "2024", "2023"] as const;
const ARREARS_CODES = ["DEBMIG", "DEBPCT", "MAPDEF", "MAPREA", "MAPREF", "MAPRER", "RECCIP",] as const;
const BOOLEAN_OPTIONS = ["All", "true", "false",] as const;

export type StatusFilter = typeof STATUSES[number];
export type MonthFilter = typeof MONTHS[number];
export type YearFilter = typeof YEARS[number];
export type ArrearsFilter = typeof ARREARS_CODES[number];
export type BooleanFilter = typeof BOOLEAN_OPTIONS[number];

const radioSx = {
  color: "#D0D5DD",
  "&.Mui-checked": { color: "#3B5BDB" },
  p: 0.6,
};

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

      <FilterGroup title="By Status" defaultOpen>
        <FilterRadioGroup
          value={filters.status}
          options={STATUSES}
          onChange={(value) => update("status", value)}
        />
      </FilterGroup>

      <FilterGroup title="By Month" defaultOpen>
        <FilterRadioGroup
          value={filters.month}
          options={MONTHS}
          onChange={(value) => update("month", value)}
        />
      </FilterGroup>

      <FilterGroup title="By Year">
        <FilterRadioGroup
          value={filters.year}
          options={YEARS}
          onChange={(value) => update("year", value)}
        />
      </FilterGroup>

      <FilterGroup title="By Arrears Code">
        <FilterRadioGroup
          value={filters.arrears_code}
          options={ARREARS_CODES}
          onChange={(value) => update("arrears_code", value)}
        />
      </FilterGroup>

      <FilterGroup title="By Email Delivered">
        <FilterRadioGroup
          value={filters.email_delivered}
          options={BOOLEAN_OPTIONS}
          onChange={(value) => update("email_delivered", value)}
        />
      </FilterGroup>

      <FilterGroup title="By SMS Sent">
        <FilterRadioGroup
          value={filters.sms_sent}
          options={BOOLEAN_OPTIONS}
          onChange={(value) => update("sms_sent", value)}
        />
      </FilterGroup>
    </Box>
  );
}