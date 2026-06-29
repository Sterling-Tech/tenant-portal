import React from "react";
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Select,
  MenuItem,
  Button,
  Checkbox,
  IconButton,
  LinearProgress,
  FormControl,
  Pagination,
  PaginationItem,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// ─── Types ────────────────────────────────────────────────────────────────────
export type RefundStatus = "Approved" | "Pending" | "Rejected";

export interface RefundRequestRow {
  id: string;
  meterNumber: string;
  account: string;
  customer: string;
  amount: string;          // pre-formatted, e.g. "₦734.36"
  status: RefundStatus;
  reference: string;       // e.g. "RFD-2596690152106"
  arrearsCode: string;     // e.g. "MAPREF"
  emailSent: boolean;
  smsSent: boolean;
  createdAt: string;       // pre-formatted, e.g. "Jun 20, 4:54 PM"
}

export interface RefundRequestsTableProps {
  rows: RefundRequestRow[];
  totalRefundedThisPeriod: string;  // "₦3.3M"
  approvedCount: number;
  period: string;                   // "June 2026"
  page: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView?: (row: RefundRequestRow) => void;
  onNotify?: (row: RefundRequestRow) => void;
  onViewAll?: () => void;
  isLive?: boolean;
}

// ─── Status chip ──────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<RefundStatus, { dot: string; text: string }> = {
  Approved: { dot: "#1A9D5C", text: "#1A9D5C" },
  Pending:  { dot: "#D98C0F", text: "#D98C0F" },
  Rejected: { dot: "#D9362F", text: "#D9362F" },
};

function StatusDot({ status }: { status: RefundStatus }) {
  const cfg = STATUS_COLORS[status];
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: cfg.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: cfg.text }}>{status}</Typography>
    </Box>
  );
}

// ─── Arrears code chip ────────────────────────────────────────────────────────
const ARREARS_COLORS: Record<string, { bg: string; text: string }> = {
  MAPREF: { bg: "#E3F0FE", text: "#1864D6" },
  MAPREA: { bg: "#E9E6FB", text: "#5B3FCB" },
  MAPRER: { bg: "#FCEAE9", text: "#D9362F" },
  MAPDEF: { bg: "#FDF2E2", text: "#B7791F" },
};

function ArrearsCodeChip({ code }: { code: string }) {
  const cfg = ARREARS_COLORS[code] || { bg: "#EEF0F3", text: "#475569" };
  return (
    <Chip
      label={code}
      size="small"
      sx={{
        bgcolor: cfg.bg,
        color: cfg.text,
        fontWeight: 700,
        fontSize: "0.7rem",
        height: 22,
        borderRadius: 1.5,
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
}

// ─── Notified pill (Sent / No) ────────────────────────────────────────────────
function NotifiedPill({ sent }: { sent: boolean }) {
  return (
    <Typography
      component="span"
      sx={{
        fontSize: "0.78rem",
        fontWeight: 700,
        color: sent ? "#1A9D5C" : "#B0B8C8",
      }}
    >
      {sent ? "Sent" : "No"}
    </Typography>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RefundRequestsTable({
  rows,
  totalRefundedThisPeriod,
  approvedCount,
  period,
  page,
  totalPages,
  totalResults,
  pageSize,
  onPageChange,
  onView,
  onNotify,
  onViewAll,
  isLive = true,
}: RefundRequestsTableProps) {
  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, totalResults);

  return (
    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* ── Total refunded this period card ── */}
      <Card sx={{ borderRadius: 2.5, border: "1px solid #EEF0F3", boxShadow: "none", p: 2.5 }}>
        <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.08em", color: "#9AA4B2", textTransform: "uppercase" }}>
          Total Refunded This Period
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: "2.1rem", color: "#0D1B2A", lineHeight: 1.2, mt: 0.5 }}>
          {totalRefundedThisPeriod}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", mb: 1.5 }}>
          {approvedCount.toLocaleString()} approved requests · {period}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={91.3}
          sx={{
            height: 7,
            borderRadius: 4,
            bgcolor: "#EEF0F3",
            "& .MuiLinearProgress-bar": { bgcolor: "#7C4DD9", borderRadius: 4 },
          }}
        />
      </Card>

      {/* ── Refund requests table card ── */}
      <Card sx={{ borderRadius: 2.5, border: "1px solid #EEF0F3", boxShadow: "none", overflow: "hidden" }}>
        {/* Table header strip */}
        <Box sx={{ px: 2.5, pt: 2.25, pb: 1.5, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#0D1B2A" }}>
              Refund Requests
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", mt: 0.2 }}>
              MapRefundRequest · {period} · Page {page} of {totalPages}
            </Typography>
          </Box>
          {isLive && (
            <Chip
              label="Live"
              size="small"
              sx={{
                bgcolor: "#E5F7ED",
                color: "#1A9D5C",
                fontWeight: 700,
                fontSize: "0.72rem",
                height: 22,
              }}
            />
          )}
        </Box>

        {/* Bulk action row */}
        <Box sx={{ px: 2.5, pb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "0.82rem", color: "#475569" }}>Action:</Typography>
            <FormControl size="small">
              <Select
                defaultValue=""
                displayEmpty
                sx={{
                  minWidth: 130,
                  fontSize: "0.82rem",
                  bgcolor: "#fff",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E0E4EA" },
                }}
              >
                <MenuItem value="">----------</MenuItem>
                <MenuItem value="approve">Approve selected</MenuItem>
                <MenuItem value="reject">Reject selected</MenuItem>
                <MenuItem value="notify">Notify selected</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderColor: "#E0E4EA",
                color: "#0D1B2A",
                fontWeight: 600,
                fontSize: "0.8rem",
                px: 2,
                "&:hover": { borderColor: "#C5CDD8", bgcolor: "#F9FAFB" },
              }}
            >
              Go
            </Button>
          </Box>
          <Typography sx={{ fontSize: "0.8rem", color: "#9AA4B2" }}>
            0 of {rows.length} selected
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 920 }}>
            <TableHead>
              <TableRow sx={{ "& th": { borderBottom: "1px solid #EEF0F3", borderTop: "1px solid #EEF0F3" } }}>
                <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                  <Checkbox size="small" />
                </TableCell>
                {["METER NUMBER", "ACCOUNT", "CUSTOMER", "AMOUNT", "STATUS", "REFERENCE", "ARREARS CODE", "NOTIFIED", "CREATED"].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontSize: "0.66rem",
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      color: "#9AA4B2",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ "& td": { borderBottom: "1px solid #F4F5F7", py: 1.5 } }}
                >
                  <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                    <Checkbox size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.84rem", color: "#0D1B2A" }}>
                      {row.meterNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.82rem", color: "#3B5BDB" }}>{row.account}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.84rem", color: "#0D1B2A" }}>{row.customer}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.84rem", color: "#0D1B2A" }}>
                      {row.amount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusDot status={row.status} />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.78rem", color: "#9AA4B2", fontFamily: "monospace" }}>
                      {row.reference}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <ArrearsCodeChip code={row.arrearsCode} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <NotifiedPill sent={row.emailSent} />
                      <NotifiedPill sent={row.smsSent} />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.78rem", color: "#9AA4B2", whiteSpace: "nowrap" }}>
                      {row.createdAt}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton size="small" onClick={() => onView?.(row)} sx={{ border: "1px solid #E0E4EA", borderRadius: 1.5 }}>
                        <VisibilityOutlinedIcon sx={{ fontSize: 16, color: "#475569" }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => onNotify?.(row)} sx={{ border: "1px solid #E0E4EA", borderRadius: 1.5 }}>
                        <MailOutlineIcon sx={{ fontSize: 16, color: "#475569" }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No refund requests match the current filters.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer — pagination + view all */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
            borderTop: "1px solid #F4F5F7",
          }}
        >
          <Typography sx={{ fontSize: "0.82rem", color: "#475569" }}>
            Showing {startIdx}–{endIdx} of {totalResults.toLocaleString()} results
          </Typography>

          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => onPageChange(p)}
            siblingCount={1}
            boundaryCount={1}
            shape="rounded"
            sx={{
              "& .MuiPaginationItem-root": { fontSize: "0.82rem", fontWeight: 600 },
              "& .Mui-selected": { bgcolor: "#0D1B2A !important", color: "#fff" },
            }}
          />

          <Button
            onClick={onViewAll}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.84rem",
              color: "#0D1B2A",
              border: "1px solid #E0E4EA",
              borderRadius: 2,
              px: 2,
              py: 0.75,
              "&:hover": { bgcolor: "#F9FAFB" },
            }}
          >
            View All Requests
          </Button>
        </Box>
      </Card>
    </Box>
  );
}