import React, { useState, useMemo, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import RefundRequestsHeader from "./RefundRequestsHeader";
import PipelineStatusBar from "./PipelineStatusBar";
import RefundStatsCards, { RefundStats } from "./RefundStatsCards";
import RefundFilters, { MonthFilter, RefundFiltersState, YearFilter } from "./RefundFilters";
import RefundRequestsTable, { RefundRequestRow, RefundStatus } from "./RefundRequestsTable";
import { getRefundRequests, RefundRequest, triggerNotifications } from "../../services/mapRefundService";
import { toast } from "react-toastify";
import RefundDetailsDialog from "./RefundDetailsDialog";
import AddRefundRequestDialog from "./AddRefundRequestDialog";
import { repullMetersFromCsv } from "../../services/mapRefundService";

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
export interface CreateRefundRequest {
  meter_number: string;
  account_number: string;
  customer_name: string;
  amount: number;
  arrears_code: string;
  month: number;
  year: number;
}
interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateRefundRequest
  ) => void | Promise<void>;
}
export default function MapRefundRequestsPage() {
  // const [period, setPeriod] = useState("June 2026");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RefundFiltersState>({
    search: "",
    status: "All",
    month: "All",
    year: "All",
    arrears_code: "MAPREA",
    email_delivered: "All",
    sms_sent: "All",
  });

  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequestRow | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
  const getMonthYear = (period: string) => {
    const [monthName, year] = period.split(" ");

    const month = MONTH_NAMES.indexOf(monthName) + 1;

    return {
      month: Number(month),
      year: Number(year),
    };
  };

  const period = useMemo(() => {
    const month =
      filters.month === "All"
        ? new Date().getMonth() + 1
        : Number(filters.month);

    const year =
      filters.year === "All"
        ? new Date().getFullYear()
        : Number(filters.year);

    return `${MONTH_NAMES[month]} ${year}`;
  }, [filters.month, filters.year]);

  const handleSendNotifications = async () => {
    try {
      const { month, year } = getMonthYear(period);

      const response = await triggerNotifications({
        month,
        year,
      });
      toast.success(
        `Notifications queued successfully.
         Task ID: ${response.task_id}`
      );
    } catch (err: any) {
      toast.error(
        err.message || "Failed to trigger notifications"
      );
    }
  };

  const handleUploadCsv = async (file: File) => {
    try {
      const formData = new FormData();

      // Backend expects csv_file
      formData.append("csv_file", file);

      const response = await repullMetersFromCsv(formData);

      toast.success(
        `Processed ${response.updated} of ${response.total_input} meter(s)`
      );

      if (response.missing > 0) {
        toast.info(
          `${response.missing} meter(s) were not found`
        );
      }

      await loadRefundRequests();
    } catch (err: any) {
      toast.error(
        err.message ?? "CSV upload failed"
      );
    }
  };
  const PAGE_SIZE = 10;

  const totalPages = Math.ceil(
    totalCount / PAGE_SIZE
  );
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== "All") count++;
    if (filters.month !== "All") count++;
    if (filters.year !== "All") count++;
    if (filters.arrears_code) count++;
    return count || 4; // matches screenshot default of "4 active"
  }, [filters]);

  function handleApplyFilters() {
    // TODO: trigger API refetch with current `filters`
    setPage(1);
  }

  function handleResetFilters() {
    setFilters({
      search: "", status: "All", month: "All", year: "All",
      arrears_code: "MAPREA", email_delivered: "All", sms_sent: "All",
    });
  }

  const requestFilters = useMemo(() => ({
    status:
      filters.status === "All"
        ? undefined
        : filters.status.toLowerCase(),

    month:
      filters.month === "All"
        ? undefined
        : Number(filters.month),

    year:
      filters.year === "All"
        ? undefined
        : Number(filters.year),

    arrears_code:
      filters.arrears_code || undefined,

    email_delivered:
      filters.email_delivered === "All"
        ? undefined
        : filters.email_delivered === "true",

    sms_sent:
      filters.sms_sent === "All"
        ? undefined
        : filters.sms_sent === "true",
  }), [filters]);

  const loadRefundRequests = async () => {
    console.log("Loading refund requests...");
    try {
      setLoading(true);

      const response = await getRefundRequests({
        page,
        search: filters.search || undefined,
        ordering: "-created_at",
        ...requestFilters,
      });
      setRefundRequests(response.results);
      setTotalCount(response.count);
    } catch (err: any) {
      toast.error(
        err.message ||
        "Failed to load refund requests"
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log("useEffect fired");
    loadRefundRequests();
  }, [page, filters]);

  const stats = useMemo(() => {
    const success = refundRequests.filter(
      r => r.status === "success"
    ).length;

    const pending = refundRequests.filter(
      r => r.status === "pending"
    ).length;

    const failed = refundRequests.filter(
      r => r.status === "failed"
    ).length;

    const refunded = refundRequests
      .filter(r => r.status === "success")
      .reduce(
        (sum, r) => sum + Number(r.amount),
        0
      );

    const email = refundRequests.filter(
      r => r.email_delivered
    ).length;

    const sms = refundRequests.filter(
      r => r.sms_sent
    ).length;

    return {
      totalRequests: totalCount,
      success,
      pending,
      failed,
      totalRefunded: `₦${refunded.toLocaleString()}`,
      email_delivered: email,
      sms_sent: sms,
    };
  }, [refundRequests, totalCount]);

  const createRefund = async (data: any) => {
    console.log(data);

    try {
      // await createRefundRequest(data);

      toast.success("Refund request created");

      setAddOpen(false);

      loadRefundRequests();
    } catch (err: any) {
      toast.error(err.message ?? "Unable to create refund request");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh",}}>

        {/* 1 — Header */}
        <RefundRequestsHeader
          period={period}
          // onPeriodChange={setPeriod}
          onPeriodChange={(newPeriod) => {
            const [monthName, year] = newPeriod.split(" ");

            const month =
              MONTH_NAMES.findIndex(
                m => m === monthName
              );

            setFilters(prev => ({
              ...prev,
              month: String(month) as MonthFilter,
              year: year as YearFilter,
            }));
          }}
          onTriggerPipeline={() => console.log("Trigger pipeline")}
          onSendNotifications={handleSendNotifications}
          onUploadCsv={handleUploadCsv}
          onAddRefundRequest={() => setAddOpen(true)}
        />

        {/* 2 — Pipeline status bar */}
        {/* <PipelineStatusBar
          pipelineName="MAP Refund Pipeline"
          arrearsCode="MAPREF"
          region="South-West Nigeria"
          lastRunDate="Jun 20"
          lastRunTime="11:42 PM"
          successRate={91.3}
          status="idle"
        /> */}

        {/* 3 — Stats cards */}
        <RefundStatsCards
          stats={stats}
        // period={period}
        />

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
            // rows={MOCK_ROWS}
            rows={refundRequests.map((item) => {
              const statusStr = item.status
                ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                : "Pending";
              return {
                id: item.id.toString(),
                meterNumber: item.meter_number,
                account: item.account_number,
                customer: item.customer_name,
                amount: `₦${Number(item.amount).toLocaleString()}`,
                status: statusStr as RefundStatus,
                reference: item.token,
                arrearsCode: item.arrears_code,
                emailSent: item.email_delivered,
                smsSent: item.sms_sent,
                createdAt: new Date(item.created_at).toLocaleString(),
              } as RefundRequestRow;
            })}
            totalRefundedThisPeriod={stats.totalRefunded}
            approvedCount={stats.success}
            period={period}
            page={page}
            totalPages={totalPages}
            totalResults={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onView={(row) => {
              setSelectedRefund(row);
              setDetailsOpen(true);
            }}
            onNotify={(row) => console.log("Notify", row)}
            onViewAll={() => console.log("View all requests")}
            filters={requestFilters}
          />

          <RefundDetailsDialog
            open={detailsOpen}
            refund={selectedRefund}
            onClose={() => {
              setDetailsOpen(false);
              setSelectedRefund(null);
            }}
          />
          <AddRefundRequestDialog
            open={addOpen}
            onClose={() => setAddOpen(false)}
            onSubmit={createRefund}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}