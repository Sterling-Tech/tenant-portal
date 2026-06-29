import React from "react";
import { Box, Typography, Avatar } from "@mui/material";

// ─── Types ────────────────────────────────────────────────────────────────────
export type PipelineStatus = "idle" | "running" | "failed" | "completed";

export interface PipelineStatusBarProps {
  pipelineName: string;     // "MAP Refund Pipeline"
  arrearsCode: string;      // "MAPREF"
  region: string;           // "South-West Nigeria"
  lastRunDate: string;      // "Jun 20"
  lastRunTime: string;      // "11:42 PM"
  successRate: number;      // 91.3
  status: PipelineStatus;
}

const STATUS_CONFIG: Record<PipelineStatus, { label: string; color: string; bg: string }> = {
  idle:      { label: "Idle",      color: "#fff", bg: "rgba(255,255,255,0.16)" },
  running:   { label: "Running",   color: "#fff", bg: "rgba(56,189,248,0.35)" },
  failed:    { label: "Failed",    color: "#fff", bg: "rgba(239,68,68,0.4)" },
  completed: { label: "Completed", color: "#fff", bg: "rgba(34,197,94,0.35)" },
};

// ─── Stat block (Last run / Run time / Success rate) ─────────────────────────
function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <Box sx={{ textAlign: "right" }}>
      <Typography sx={{ fontWeight: 800, fontSize: "1.4rem", color: "#fff", lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.65)", mt: 0.3 }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PipelineStatusBar({
  pipelineName,
  arrearsCode,
  region,
  lastRunDate,
  lastRunTime,
  successRate,
  status,
}: PipelineStatusBarProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <Box
      sx={{
        background: "linear-gradient(90deg, #16245C 0%, #1E2F73 100%)",
        borderRadius: 3,
        px: 3,
        py: 2.25,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        mb: 3,
      }}
    >
      {/* Left — icon + pipeline info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: "rgba(255,255,255,0.12)",
            width: 44,
            height: 44,
            borderRadius: 2,
            fontSize: "1.3rem",
          }}
        >
          🔁
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#fff" }}>
            {pipelineName}
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.65)", mt: 0.2 }}>
            Arrears Code: {arrearsCode} · Region: {region} · Status: {cfg.label}
          </Typography>
        </Box>
      </Box>

      {/* Right — stats + status pill */}
      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2.5, sm: 4 } }}>
        <StatBlock value={lastRunDate} label="LAST RUN" />
        <StatBlock value={lastRunTime} label="RUN TIME" />
        <StatBlock value={`${successRate}%`} label="SUCCESS RATE" />

        <Box
          sx={{
            bgcolor: cfg.bg,
            color: cfg.color,
            borderRadius: 2.5,
            px: 2.25,
            py: 1,
            textAlign: "center",
            minWidth: 72,
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.1 }}>
            {cfg.label}
          </Typography>
          <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", opacity: 0.8, mt: 0.2 }}>
            PIPELINE STATUS
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}