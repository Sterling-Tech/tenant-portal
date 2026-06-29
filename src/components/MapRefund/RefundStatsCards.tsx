import React from "react";
import { Box, Card, Typography } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CloseIcon from "@mui/icons-material/Close";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RefundStats {
  totalRequests: number;
  approved: number;
  pending: number;
  rejected: number;
  totalRefunded: string;     // pre-formatted, e.g. "₦3.3M"
  emailNotified: number;
  smsNotified: number;
}

export interface RefundStatsCardsProps {
  stats: RefundStats;
  period: string; // e.g. "June 2026" -> used for "This period" sublabel context if needed
}

// ─── Single card ──────────────────────────────────────────────────────────────
interface StatCardConfig {
  key: string;
  label: string;
  value: string;
  sublabel: string;
  accent: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

function StatCard({ cfg }: { cfg: StatCardConfig }) {
  return (
    <Card
      sx={{
        flex: "1 1 0",
        minWidth: 168,
        position: "relative",
        overflow: "hidden",
        borderRadius: 2.5,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        border: "1px solid #EEF0F3",
      }}
    >
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, bgcolor: cfg.accent }} />
      <Box sx={{ p: 2.25 }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 1.5,
            bgcolor: cfg.iconBg,
            color: cfg.iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1.25,
          }}
        >
          {cfg.icon}
        </Box>
        <Typography
          sx={{
            fontSize: "0.62rem",
            fontWeight: 800,
            letterSpacing: "0.07em",
            color: "#9AA4B2",
            textTransform: "uppercase",
            mb: 0.4,
          }}
        >
          {cfg.label}
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: "1.65rem", color: "#0D1B2A", lineHeight: 1.15 }}>
          {cfg.value}
        </Typography>
        <Box
          sx={{
            display: "inline-block",
            mt: 0.75,
            px: 0.9,
            py: 0.2,
            borderRadius: 10,
            bgcolor: cfg.iconBg,
            color: cfg.accent,
            fontSize: "0.68rem",
            fontWeight: 700,
          }}
        >
          {cfg.sublabel}
        </Box>
      </Box>
    </Card>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RefundStatsCards({ stats }: RefundStatsCardsProps) {
  const approvedPct = stats.totalRequests > 0 ? ((stats.approved / stats.totalRequests) * 100).toFixed(1) : "0.0";
  const pendingPct = stats.totalRequests > 0 ? ((stats.pending / stats.totalRequests) * 100).toFixed(1) : "0.0";
  const rejectedPct = stats.totalRequests > 0 ? ((stats.rejected / stats.totalRequests) * 100).toFixed(1) : "0.0";
  const emailPct = stats.totalRequests > 0 ? ((stats.emailNotified / stats.totalRequests) * 100).toFixed(1) : "0.0";
  const smsPct = stats.totalRequests > 0 ? ((stats.smsNotified / stats.totalRequests) * 100).toFixed(1) : "0.0";

  const cards: StatCardConfig[] = [
    {
      key: "total",
      label: "Total Requests",
      value: stats.totalRequests.toLocaleString(),
      sublabel: "This period",
      accent: "#3B5BDB",
      iconBg: "#EAEEFD",
      iconColor: "#3B5BDB",
      icon: <DescriptionOutlinedIcon sx={{ fontSize: 17 }} />,
    },
    {
      key: "approved",
      label: "Approved",
      value: stats.approved.toLocaleString(),
      sublabel: `${approvedPct}%`,
      accent: "#1A9D5C",
      iconBg: "#E5F7ED",
      iconColor: "#1A9D5C",
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 17 }} />,
    },
    {
      key: "pending",
      label: "Pending",
      value: stats.pending.toLocaleString(),
      sublabel: `${pendingPct}%`,
      accent: "#D98C0F",
      iconBg: "#FDF2E2",
      iconColor: "#D98C0F",
      icon: <HourglassEmptyIcon sx={{ fontSize: 17 }} />,
    },
    {
      key: "rejected",
      label: "Rejected",
      value: stats.rejected.toLocaleString(),
      sublabel: `${rejectedPct}%`,
      accent: "#D9362F",
      iconBg: "#FCEAE9",
      iconColor: "#D9362F",
      icon: <CloseIcon sx={{ fontSize: 17 }} />,
    },
    {
      key: "refunded",
      label: "Total Refunded",
      value: stats.totalRefunded,
      sublabel: "Approved value",
      accent: "#7C4DD9",
      iconBg: "#F1EAFB",
      iconColor: "#7C4DD9",
      icon: <PaidOutlinedIcon sx={{ fontSize: 17 }} />,
    },
    {
      key: "email",
      label: "Email Notified",
      value: stats.emailNotified.toLocaleString(),
      sublabel: `${emailPct}%`,
      accent: "#0F8B8D",
      iconBg: "#E3F4F4",
      iconColor: "#0F8B8D",
      icon: <MailOutlineIcon sx={{ fontSize: 17 }} />,
    },
    {
      key: "sms",
      label: "SMS Notified",
      value: stats.smsNotified.toLocaleString(),
      sublabel: `${smsPct}%`,
      accent: "#13A89E",
      iconBg: "#E1F6F4",
      iconColor: "#13A89E",
      icon: <SmsOutlinedIcon sx={{ fontSize: 17 }} />,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        mb: 3,
        overflowX: "auto",
        pb: 0.5,
      }}
    >
      {cards.map((cfg) => (
        <StatCard key={cfg.key} cfg={cfg} />
      ))}
    </Box>
  );
}