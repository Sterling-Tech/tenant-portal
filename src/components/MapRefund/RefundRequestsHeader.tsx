import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RefundRequestsHeaderProps {
  period: string;                       // e.g. "June 2026"
  availablePeriods?: string[];           // dropdown options
  onPeriodChange?: (period: string) => void;
  onTriggerPipeline?: () => void;
  onSendNotifications?: () => void;
  onUploadCsv?: () => void;
  onAddRefundRequest?: () => void;
}

const DEFAULT_PERIODS = ["June 2026", "May 2026", "April 2026", "March 2026"];

// ─── Component ────────────────────────────────────────────────────────────────
export default function RefundRequestsHeader({
  period,
  availablePeriods = DEFAULT_PERIODS,
  onPeriodChange,
  onTriggerPipeline,
  onSendNotifications,
  onUploadCsv,
  onAddRefundRequest,
}: RefundRequestsHeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const periodMenuOpen = Boolean(anchorEl);

  const handlePeriodClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handlePeriodClose = () => setAnchorEl(null);
  const handlePeriodSelect = (p: string) => {
    onPeriodChange?.(p);
    handlePeriodClose();
  };
  const inputRef = useRef<HTMLInputElement>(null);

  const outlinedBtnSx = {
    borderColor: "#E0E4EA",
    color: "#0D1B2A",
    bgcolor: "#fff",
    fontWeight: 600,
    fontSize: "0.84rem",
    px: 1.75,
    py: 0.85,
    whiteSpace: "nowrap",
    "&:hover": { borderColor: "#C5CDD8", bgcolor: "#F9FAFB" },
  };
const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    try {
        // await uploadRefundCsv(formData);

        toast.success("CSV uploaded");
    } catch (err) {
        toast.error("Upload failed");
    }
};

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        mb: 3,
      }}
    >
      {/* Title + description */}
      <Box sx={{ maxWidth: 640 }}>
        <Typography sx={{ fontWeight: 800, fontSize: "1.7rem", letterSpacing: "-0.5px", color: "#0D1B2A" }}>
          MAP Refund Requests
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
          Manage MAP arrears refund requests, run the refund pipeline, and track approval and
          notification status across all customers. Updated in real time.
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
        {/* Period selector */}
        <Button
          variant="outlined"
          onClick={handlePeriodClick}
          startIcon={<CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />}
          endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
          sx={outlinedBtnSx}
        >
          {period}
        </Button>
        <Menu anchorEl={anchorEl} open={periodMenuOpen} onClose={handlePeriodClose}>
          {availablePeriods.map((p) => (
            <MenuItem key={p} selected={p === period} onClick={() => handlePeriodSelect(p)}>
              {p}
            </MenuItem>
          ))}
        </Menu>

        {/* Trigger pipeline */}
        <Button
          variant="outlined"
          onClick={onTriggerPipeline}
          startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
          sx={outlinedBtnSx}
        >
          Trigger Pipeline
        </Button>

        {/* Send notifications */}
        <Button
          variant="outlined"
          onClick={onSendNotifications}
          startIcon={<MailOutlineIcon sx={{ fontSize: 16 }} />}
          sx={outlinedBtnSx}
        >
          Send Notifications
        </Button>

        {/* Upload CSV */}
        <Button
          variant="outlined"
          onClick={() =>
            inputRef.current?.click()
          }
          startIcon={<FileUploadOutlinedIcon sx={{ fontSize: 16 }} />}
          sx={outlinedBtnSx}
        >
          Upload CSV
        </Button>
        <input
          hidden
          type="file"
          accept=".csv"
          ref={inputRef}
          onChange={handleFileChange}
        />
        {/* Add refund request — primary */}
        <Button
          variant="contained"
          onClick={onAddRefundRequest}
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          sx={{
            bgcolor: "#0D1B2A",
            fontWeight: 700,
            fontSize: "0.84rem",
            px: 2,
            py: 0.9,
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: "#1A2B40" },
          }}
        >
          Add Refund Request
        </Button>
      </Box>
    </Box>
  );
}