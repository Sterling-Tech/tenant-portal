import React, { useState, useMemo } from "react";
import { Box } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import RefundRequestsHeader from "./RefundRequestsHeader";
import PipelineStatusBar from "./PipelineStatusBar";
import RefundStatsCards, { RefundStats } from "./RefundStatsCards";
import RefundFilters, { RefundFiltersState } from "./RefundFilters";
import RefundRequestsTable, { RefundRequestRow } from "./RefundRequestsTable";

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#0D1B2A" },
    background: { default: "#F5F7FA", paper: "#FFFFFF" },
    text: { primary: "#0D1B2A", secondary: "#6B7A8D" },
  },
  typography: {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 8 } } },
  },
});

// ─── Mock data — replace with API data ────────────────────────────────────────
const MOCK_STATS: RefundStats = {
  totalRequests: 2148,
  approved: 1962,
  pending: 36,
  rejected: 150,
  totalRefunded: "₦3.3M",
  emailNotified: 1840,
  smsNotified: 1605,
};

const MOCK_ROWS: RefundRequestRow[] = [
  { id: "1", meterNumber: "0159006332445", account: "5846649755", customer: "Customer A", amount: "₦1,288.53", status: "Approved", reference: "RFD-2596690152106", arrearsCode: "MAPREF", emailSent: true,  smsSent: true,  createdAt: "Jun 20, 4:54 PM" },
  { id: "2", meterNumber: "0163211033259", account: "5269057153", customer: "Customer B", amount: "₦734.36",   status: "Approved", reference: "RFD-1070798934847", arrearsCode: "MAPREF", emailSent: true,  smsSent: false, createdAt: "Jun 20, 4:54 PM" },
  { id: "3", meterNumber: "0101220007518", account: "7223589898", customer: "Customer C", amount: "₦734.36",   status: "Pending",  reference: "RFD-3873820180182", arrearsCode: "MAPREA", emailSent: false, smsSent: false, createdAt: "Jun 20, 4:54 PM" },
  { id: "4", meterNumber: "0163211036567", account: "1811616238", customer: "Customer D", amount: "₦734.36",   status: "Approved", reference: "RFD-3223990467259", arrearsCode: "MAPREF", emailSent: true,  smsSent: true,  createdAt: "Jun 20, 4:54 PM" },
  { id: "5", meterNumber: "0163211115452", account: "7826499053", customer: "Customer E", amount: "₦734.36",   status: "Rejected", reference: "RFD-0436436835123", arrearsCode: "MAPRER", emailSent: true,  smsSent: false, createdAt: "Jun 20, 4:54 PM" },
  { id: "6", meterNumber: "0101220035121", account: "7856929952", customer: "Customer F", amount: "₦734.36",   status: "Approved", reference: "RFD-1927429546582", arrearsCode: "MAPREF", emailSent: true,  smsSent: true,  createdAt: "Jun 20, 4:54 PM" },
  { id: "7", meterNumber: "0101220009720", account: "1102754456", customer: "Customer G", amount: "₦734.36",   status: "Approved", reference: "RFD-5278531039237", arrearsCode: "MAPDEF", emailSent: true,  smsSent: true,  createdAt: "Jun 20, 4:54 PM" },
  { id: "8", meterNumber: "0163211116211", account: "2629610934", customer: "Customer H", amount: "₦734.36",   status: "Pending",  reference: "RFD-5191014434871", arrearsCode: "MAPREF", emailSent: false, smsSent: false, createdAt: "Jun 20, 4:54 PM" },
];

const PAGE_SIZE = 10;
const TOTAL_RESULTS = 2148;
const TOTAL_PAGES = Math.ceil(TOTAL_RESULTS / PAGE_SIZE);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MapRefundRequestsPage() {
  const [period, setPeriod] = useState("June 2026");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RefundFiltersState>({
    search: "",
    status: "All",
    month: "All",
    year: "All",
    arrearsCode: "",
    emailDelivered: "",
    smsSent: "",
  });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== "All") count++;
    if (filters.month !== "All") count++;
    if (filters.year !== "All") count++;
    if (filters.arrearsCode) count++;
    return count || 4; // matches screenshot default of "4 active"
  }, [filters]);

  function handleApplyFilters() {
    // TODO: trigger API refetch with current `filters`
    setPage(1);
  }

  function handleResetFilters() {
    setFilters({
      search: "", status: "All", month: "All", year: "All",
      arrearsCode: "", emailDelivered: "", smsSent: "",
    });
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 2, md: 4 } }}>

        {/* 1 — Header */}
        <RefundRequestsHeader
          period={period}
          onPeriodChange={setPeriod}
          onTriggerPipeline={() => console.log("Trigger pipeline")}
          onSendNotifications={() => console.log("Send notifications")}
          onUploadCsv={() => console.log("Upload CSV")}
          onAddRefundRequest={() => console.log("Add refund request")}
        />

        {/* 2 — Pipeline status bar */}
        <PipelineStatusBar
          pipelineName="MAP Refund Pipeline"
          arrearsCode="MAPREF"
          region="South-West Nigeria"
          lastRunDate="Jun 20"
          lastRunTime="11:42 PM"
          successRate={91.3}
          status="idle"
        />

        {/* 3 — Stats cards */}
        <RefundStatsCards stats={MOCK_STATS} period={period} />

        {/* 4 — Filters + Table */}
        <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start", flexDirection: { xs: "column", md: "row" } }}>
          <RefundFilters
            filters={filters}
            onChange={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            activeCount={activeFilterCount}
          />
          <RefundRequestsTable
            rows={MOCK_ROWS}
            totalRefundedThisPeriod={MOCK_STATS.totalRefunded}
            approvedCount={MOCK_STATS.approved}
            period={period}
            page={page}
            totalPages={TOTAL_PAGES}
            totalResults={TOTAL_RESULTS}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onView={(row) => console.log("View", row)}
            onNotify={(row) => console.log("Notify", row)}
            onViewAll={() => console.log("View all requests")}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}