import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Grid,
  Button,
  TextField,
  CircularProgress,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  InputAdornment,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  MenuItem, Snackbar, Alert,
  Tab, TableContainer,
  TablePagination, Tabs,
  IconButton,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Refresh,
  Search,
  FileDownload,
  AccountBalanceWallet,
  BarChart,
} from "@mui/icons-material";
import {
  Assessment, Close, Download, Receipt,
  Refresh as RefreshIcon, Search as SearchIcon, TrendingDown, TrendingUp,
} from '@mui/icons-material';
import { useTenants } from "../../hooks/useTenants";
import { fetchTransactions, fetchVendors, fundVendorWallet, Ledger, PaginatedLedgerResponse, PaginatedVendorResponse, searchVendors, Vendor } from "../../services/vendorService";
import { useOrgWallets } from "../../hooks/useOrgWallets";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from 'xlsx';
import { useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store/store';

// ─── Types ─────────────────────────────────────────────────────────────────────
type TransactionStatus = 'success' | 'pending' | 'failed';
type TransactionDirection = 'credit' | 'debit';
type ChipColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';

type Transaction = {
  id: string;
  reference: string;
  status: TransactionStatus;
  org_name: string;      // vendor name
  wallet_key: string;
  category: string;
  channel: string;
  direction: TransactionDirection;
  value: number;
  created_at: string;
  account_number?: string;  // captured from API if present
  closing_balance?: number; // captured from API if present
  reversal?: string;        // captured from API if present
};
// ─── Helpers ────────────────────────────────────────────────────────────────────
const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(Number(value || 0));
const formatDateTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
};
const statusColor = (s: string): ChipColor => s === 'success' ? 'success' : s === 'pending' ? 'warning' : s === 'failed' ? 'error' : 'default';
const directionColor = (d: string): ChipColor => d === 'credit' ? 'success' : d === 'debit' ? 'error' : 'default';
const escapeCsv = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const API_BASE_URL = 'http://188.166.161.13:8061/vendor';
const buildHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('accessToken')
    : null;
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};
// ─── Purpose options ────────────────────────────────────────────────────────────
const PURPOSE_OPTIONS = [
  { label: 'All Purposes', value: 'all' },
  { label: 'Payment', value: 'payment' },
  { label: 'Commission', value: 'commission' },
  { label: 'Commission Report', value: 'commission_report' },
  { label: 'Payment Reversal', value: 'payment_reversal' },
  { label: 'Settlement', value: 'settlement' },
  { label: 'Refund', value: 'refund' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'Withdrawal', value: 'withdrawal' },
];
const VendorTransactions: React.FC = () => {
  const [selectedVendorId, selectVendor] = useState<string | null>(null);
  const [vendorsId, setVendorId] = useState<string | null>(null);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [transactions, setTransactions] = useState<Ledger[]>([]);
  const [openFund, setOpenFund] = useState(false);
  const [amount, setAmount] = useState("");
  const [funding, setFunding] = useState(false);
  const [summary, setSummary] = useState({
    total_debits: 0,
    total_credits: 0,
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [vendorCount, setVendorCount] = useState(0);
  const [success, setSuccess] = useState<string | null>(null);

  const [transactionCount, setTransactionCount] = useState(0);
  const [txPage, setTxPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "ledger">("analytics");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "credit" | "debit">("all");
  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 14);
  const user = useAppSelector((state: RootState) => state.auth.user);
  //new
  const oneYearAgo = new Date(); oneYearAgo.setFullYear(today.getFullYear() - 1);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const format = (d: Date) => d.toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(format(past));
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  // ── Generate Report dialog ───────────────────────────────────────────────────
  const [reportOpen, setReportOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportForm, setReportForm] = useState({
    start_date: fmt(oneYearAgo),
    end_date: fmt(tomorrow),
    purpose: 'all',
    status: 'all',
    direction: 'all',
    // ── CHANGED: was "transaction_ref", now "vendor" search ──────────────────
    vendor: '',
  });
  type AlertType = "success" | "error" | "info" | "warning";

  const [alert, setAlert] = useState<{
    open: boolean;
    type: AlertType;
    message: string;
  }>({
    open: false,
    type: "success",
    message: "",
  });
  const [endDate, setEndDate] = useState(format(tomorrow));

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);


  const load = async (pageNumber = 1) => {
    try {
      setLoading(true);

      let res: PaginatedVendorResponse;

      if (debouncedSearch.trim()) {
        res = await searchVendors(
          debouncedSearch,
          pageNumber
        );
      } else {
        res = await fetchVendors({
          page: pageNumber,
          account_status:
            statusFilter === "all"
              ? undefined
              : statusFilter,
        });
      }

      setVendors(res.results || []);
      setVendorCount(res.count || 0);

    } catch (error) {
      console.error("Vendor load error:", error);
      setVendors([]);
      setVendorCount(0);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load(page);
  }, [page, debouncedSearch, statusFilter]);

  const selectedVendor = useMemo(
    () => vendors?.find((t) => t.id === vendorsId),
    [vendorsId, vendors]
  );

  const handleExport = () => {
    if (!transactions.length) {
      setAlert({
        open: true,
        type: "warning",
        message: "No data to export",
      });
      return;
    }

    if (startDate > endDate) {
      setAlert({
        open: true,
        type: "error",
        message: "Invalid date range",
      });
      return;
    }

    const headers = ["Reference", "Credit", "Debit", "Date"];

    const rows = transactions.map((tx) => [
      tx.transaction_ref,
      tx.credit_amount || "0",
      tx.debit_amount || "0",
      new Date(tx.timestamp).toLocaleString(),
    ]);

    const csvContent =
      [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_${startDate}_${endDate}.csv`;
    link.click();
  };

  const loadTransactions = async (id: string, page: number = 1) => {
    if (!id) return;

    // ✅ prevent bad date range
    if (startDate > endDate) {
      setAlert({
        open: true,
        type: "error",
        message: "Start date cannot be after end date",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetchTransactions({
        vendor_id: id,
        start_date: startDate,
        end_date: endDate,
        page,
      });

      setTransactions(res?.results || []);
      setSummary(res?.summary || { total_debits: 0, total_credits: 0 });
      setTransactionCount(res?.count || 0);

    } catch (err: any) {
      console.error("Transaction error:", err);

      setAlert({
        open: true,
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load transactions",
      });

      setTransactions([]); // prevent crash

    } finally {
      setLoading(false);
    }
  };
  const chartData = useMemo(() => {
    return transactions.map((tx) => ({
      date: new Date(tx.timestamp).toLocaleDateString(),
      amount: Number(tx.credit_amount || tx.debit_amount || 0),
    }));
  }, [transactions]);

  useEffect(() => {
    if (selectedVendorId) setVendorId(selectedVendorId);
  }, [selectedVendorId]);

  useEffect(() => {
    if (vendorsId) loadTransactions(vendorsId);
  }, [vendorsId, startDate, endDate]);

  // const totalPages = Math.ceil(vendorCount / pageSize);
  const totalPages = Math.max(
    1,
    Math.ceil(vendorCount / pageSize)
  );
  //transaction pagination
  const totalTxPages = Math.max(
    1,
    Math.ceil(transactionCount / pageSize)
  );
  useEffect(() => {
    if (!vendors.length) {
      setVendorId(null);
      return;
    }

    if (!vendors.some(v => v.id === vendorsId)) {
      setVendorId(vendors[0].id);
      selectVendor(vendors[0].id);
    }
  }, [vendors]);

  const handleFundWallet = async () => {
    if (!vendorsId || !amount) return;

    setFunding(true);

    try {
      const amt = Number(amount);

      await fundVendorWallet({
        vendor: vendorsId,
        amount: amt,
      });

      // ✅ 1. Optimistically update UI instantly
      setVendors((prev) =>
        prev.map((v) =>
          v.id === vendorsId
            ? {
              ...v,
              wallet: {
                ...v.wallet,
                balance: String(
                  Number(v.wallet?.balance || 0) + amt
                ),
              },
            }
            : v
        )
      );

      // ✅ 2. Refresh transactions (real data)
      loadTransactions(vendorsId);

      // ✅ 3. Optional: refresh vendors from backend
      // load();
      // ✅ optional: sync after 3s
      setTimeout(() => load(), 3000);

      setAlert({
        open: true,
        type: "success",
        message: "Wallet funded successfully",
      });

      setOpenFund(false);
      setAmount("");

    } catch (err: any) {
      setAlert({
        open: true,
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Funding failed",
      });
    } finally {
      setFunding(false);
    }
  };
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter === "credit") return tx.credit_amount;
      if (typeFilter === "debit") return tx.debit_amount;
      return true;
    });
  }, [transactions, typeFilter]);

  //const displayBalance = Number(selectedVendor?.wallet?.balance || 0);
  const displayBalance =
    Number(summary?.total_credits || 0) -
    Number(summary?.total_debits || 0);

  const totalCredits = summary.total_credits;
  const totalDebits = summary.total_debits;
  const getColor = (name: string = "") => {
    const colors = [
      "#2563eb", "#16a34a", "#dc2626",
      "#7c3aed", "#ea580c", "#0891b2"
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // ── Fetch ALL pages for the report (loops through pagination) ────────────────
  const fetchAllForReport = async (params: typeof reportForm): Promise<Transaction[]> => {
    const allResults: Transaction[] = [];
    let page = 1; let hasNext = true;
    while (hasNext) {
      const url = `${API_BASE_URL}/transactions/?start_date=${params.start_date}&end_date=${params.end_date}&vendor_id=${user?.id}&page=${page}&page_size=200`;
      const res = await fetch(url, { method: 'GET', headers: buildHeaders() });
      if (!res.ok) throw new Error(`Transaction API failed (page ${page})`);
      const data = await res.json();
      const mapped: Transaction[] = (data.results ?? []).map((item: any) => ({
        id: item.transaction_ref, reference: item.transaction_ref,
        status: item.status || 'success',
        org_name: item.vendor_name || item.org_name || item.vendor?.business_name || 'Vendor',
        wallet_key: item.wallet_key || '-',
        category: item.category || 'Transaction',
        channel: item.channel || '-',
        direction: Number(item.amount) >= 0 ? 'credit' : 'debit',
        value: Math.abs(Number(item.amount || 0)),
        created_at: item.timestamp,
        account_number: item.account_number || item.account || '',
        closing_balance: item.closing_balance || item.balance_after || 0,
        reversal: item.reversal || item.is_reversal ? 'Yes' : 'No',
      }));
      allResults.push(...mapped);
      hasNext = Boolean(data.next);
      page++;
      if (page > 50) break; // safety limit
    }
    return allResults;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // GENERATE REPORT — Excel template with required headers
  // Headers: Date | Vendor | Reference | account_number | Status | Reversal | Credit | Date | closing_balance
  // ─────────────────────────────────────────────────────────────────────────────
  const handleGenerateReport = async () => {
    setGenerating(true); setReportError(null);
    try {
      // 1. Fetch all pages
      let allTx = await fetchAllForReport(reportForm);

      // 2. Client-side filters
      if (reportForm.vendor.trim()) {
        const v = reportForm.vendor.trim().toLowerCase();
        allTx = allTx.filter(tx => tx.org_name.toLowerCase().includes(v));
      }
      if (reportForm.status !== 'all') {
        allTx = allTx.filter(tx => tx.status === reportForm.status);
      }
      if (reportForm.direction !== 'all') {
        allTx = allTx.filter(tx => tx.direction === reportForm.direction);
      }
      if (reportForm.purpose !== 'all') {
        allTx = allTx.filter(tx => tx.category.toLowerCase().includes(reportForm.purpose.replace('_', ' ')));
      }

      if (allTx.length === 0) {
        setReportError('No transactions match the selected filters. Try adjusting your criteria.');
        return;
      }

      // 3. Build the Excel sheet with the required column layout
      //    Required columns: Date | Vendor | Reference | account_number | Status | Reversal | Credit | Date | closing_balance

      // ── Meta info rows ──
      const meta = [
        ['TRANSACTION REPORT'],
        [],
        ['Period', `${reportForm.start_date}  →  ${reportForm.end_date}`],
        ['Generated', new Date().toLocaleString()],
        ['Vendor Filter', reportForm.vendor.trim() || 'All Vendors'],
        ['Purpose', PURPOSE_OPTIONS.find(p => p.value === reportForm.purpose)?.label || 'All'],
        ['Status', reportForm.status === 'all' ? 'All' : reportForm.status],
        ['Type', reportForm.direction === 'all' ? 'Credit & Debit' : reportForm.direction],
        ['Total Records', allTx.length],
        [],
      ];

      // ── Column header row (exact header names as requested) ──
      const colHeaders = [
        'Date',
        'Vendor',
        'Reference',
        'account_number',
        'Status',
        'Reversal',
        'Credit',
        'Date',           // second Date column — closing date / settlement date
        'closing_balance',
      ];

      // ── Data rows ──
      const dataRows = allTx.map((tx) => [
        formatDateTime(tx.created_at),                            // Date
        tx.org_name || '',                                         // Vendor
        tx.reference || '',                                        // Reference
        tx.account_number || '',                                   // account_number
        tx.status?.toUpperCase() || '',                            // Status
        tx.reversal || 'No',                                       // Reversal
        tx.direction === 'credit'
          ? tx.value                                             // Credit (amount if credit)
          : '',                                                   // blank if debit
        formatDateTime(tx.created_at),                            // Date (closing/settlement)
        tx.closing_balance !== undefined ? tx.closing_balance : '', // closing_balance
      ]);

      // ── Summary rows ──
      const totalCredit = allTx.filter(t => t.direction === 'credit').reduce((s, t) => s + t.value, 0);
      const summary = [
        [],
        ['', '', '', '', '', '', '', '', ''],
        ['SUMMARY', '', '', '', '', '', '', '', ''],
        ['Total Transactions', allTx.length, '', '', '', '', '', '', ''],
        ['Total Credit Amount', '', '', '', '', '', totalCredit, '', ''],
        ['Successful', allTx.filter(t => t.status === 'success').length, '', '', '', '', '', '', ''],
        ['Pending', allTx.filter(t => t.status === 'pending').length, '', '', '', '', '', '', ''],
        ['Failed', allTx.filter(t => t.status === 'failed').length, '', '', '', '', '', '', ''],
      ];

      // 4. Assemble worksheet
      const wsData = [...meta, colHeaders, ...dataRows, ...summary];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Column widths
      ws['!cols'] = [
        { wch: 22 }, // Date
        { wch: 28 }, // Vendor
        { wch: 40 }, // Reference
        { wch: 18 }, // account_number
        { wch: 12 }, // Status
        { wch: 10 }, // Reversal
        { wch: 18 }, // Credit
        { wch: 22 }, // Date (closing)
        { wch: 20 }, // closing_balance
      ];

      // Merge title cell across all 9 columns
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
      ];

      // 5. Second sheet: clean Summary
      const summarySheetData = [
        ['TRANSACTION REPORT — SUMMARY'],
        [],
        ['Date Range', `${reportForm.start_date} to ${reportForm.end_date}`],
        ['Vendor Filter', reportForm.vendor.trim() || 'All Vendors'],
        ['Purpose', PURPOSE_OPTIONS.find(p => p.value === reportForm.purpose)?.label || 'All'],
        ['Status Filter', reportForm.status === 'all' ? 'All' : reportForm.status],
        ['Generated At', new Date().toLocaleString()],
        [],
        ['Metric', 'Value'],
        ['Total Records', allTx.length],
        ['Total Credit', totalCredit],
        ['Successful', allTx.filter(t => t.status === 'success').length],
        ['Pending', allTx.filter(t => t.status === 'pending').length],
        ['Failed', allTx.filter(t => t.status === 'failed').length],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);
      wsSummary['!cols'] = [{ wch: 26 }, { wch: 36 }];
      wsSummary['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

      // 6. Build workbook & download
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      const fileName = `transaction-report-${reportForm.start_date}-to-${reportForm.end_date}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setSuccess(`✓ Report generated — ${allTx.length} transactions exported`);
      setReportOpen(false);
    } catch (err: any) {
      setReportError(err?.message || 'Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const resetReportForm = () => {
    setReportForm({ start_date: fmt(oneYearAgo), end_date: fmt(tomorrow), purpose: 'all', status: 'all', direction: 'all', vendor: '' });
    setReportError(null);
  };



  return (
    <Box
      // /p={2}
      bgcolor="#f9fafb">
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Box>
          <Typography fontSize={24} fontWeight={700}>
            Vendor Transactions
          </Typography>
          <Typography fontSize={13} color="#6b7280">
            Full ledger of all credits, debits, reversals and transfers per vendor
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              setSearch("");
              setDebouncedSearch("");
              setPage(1);
              load(1)
            }}
            sx={{ height: 36, textTransform: "none", borderRadius: 2 }}
          >
            Refresh
          </Button>
          {/* <Button size="small" variant="outlined" sx={{ height: 36, textTransform: "none", borderRadius: 2 }} startIcon={<FileDownload />}>
            Export CSV
          </Button> */}
          {/* <Button size="small" onClick={() => setOpenFund(true)} sx={{ height: 36, textTransform: "none", borderRadius: 2 }} variant="contained">
            + Generate Report
          </Button> */}
          {/* <Button variant="outlined" startIcon={<Download />} onClick={exportRows}>Export</Button> */}
          
          {/* <Button
            variant="contained"
            startIcon={<Assessment />}
            onClick={() => { setReportOpen(true); setReportError(null); }}
            sx={{ bgcolor: '#1e3a8a', '&:hover': { bgcolor: '#1e40af' }, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Generate Report
          </Button> */}
        </Stack>
      </Stack>
      {/* SUMMARY */}
      <Grid pb={2} container spacing={2}>
        {[
          // { title: "Total Wallet Balance", value: selectedVendor?.wallet?.balance, color: "#2563eb" },
          { title: "Total Wallet Balance", value: displayBalance, color: "#2563eb" },
          { title: "Total Credits", value: totalCredits, color: "#16a34a" },
          { title: "Total Debits", value: totalDebits, color: "#dc2626" },
        ].map((item, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card sx={{ p: 2, borderBottom: `3px solid ${item.color}`, borderRadius: 3 }}>
              <Typography fontSize={13} color="#6b7280">
                {item.title}
              </Typography>
              <Typography fontSize={22} fontWeight={700}>
                ₦{Number(item.value || 0).toLocaleString()}
              </Typography>
              <Typography fontSize={12} color="#16a34a">
                ↑ 9.2% this month
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3} >
        {/* SIDEBAR */}
        <Grid item xs={12} md={4} >
          <Card sx={{ borderRadius: 3 }}>
            <Box p={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={600}>Select Vendor</Typography>
                <Typography fontSize={12} color="gray">
                  {vendorCount} total
                </Typography>
              </Stack>

              <TextField
                fullWidth
                size="small"
                placeholder="Search by name or domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  mt: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontSize: 13,
                    height: 36,
                    bgcolor: "#f9fafb",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 16, color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" spacing={1} mt={2}>
                {["all", "active", "inactive"].map((tab) => (
                  <Box
                    key={tab}
                    onClick={() => setStatusFilter(tab as any)}
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 20,
                      fontSize: 12,
                      cursor: "pointer",
                      bgcolor: statusFilter === tab ? "#eff6ff" : "#f3f4f6",
                      color: statusFilter === tab ? "#2563eb" : "#6b7280",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {tab}
                  </Box>
                ))}
              </Stack>
              <Stack mt={2} spacing={1.2}>

                {loading ? (
                  <Box py={3} textAlign="center">
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  vendors?.map((v) => {
                    const isActive = v?.account_status === "active";

                    return (
                      <Box
                        key={v.id}
                        onClick={() => {
                          setVendorId(v.id);
                          selectVendor(v.id);
                        }}
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          cursor: "pointer",
                          transition: "0.2s",
                          border: vendorsId === v.id ? "1px solid #dbeafe" : "1px solid transparent",
                          bgcolor: vendorsId === v.id ? "#eff6ff" : "#fff",
                          "&:hover": { bgcolor: "#f9fafb" },
                        }}
                      >

                        <Stack direction="row" justifyContent="space-between" alignItems="center">

                          {/* LEFT */}
                          <Stack direction="row" spacing={1.2} alignItems="center">
                            <Box
                              sx={{
                                width: 46,
                                height: 36,
                                borderRadius: 2,
                                bgcolor: getColor(v.business_name),
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13,
                                fontWeight: 600,
                              }}
                            >
                              {v.business_name?.slice(0, 2)}
                            </Box>

                            <Box>
                              <Typography
                                fontSize={13}
                                fontWeight={600}
                                sx={{
                                  maxWidth: 120,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {v.business_name}
                              </Typography>

                              <Typography fontSize={11} color="#6b7280">
                                Vendor
                              </Typography>
                            </Box>
                          </Stack>

                          {/* RIGHT */}
                          <Box textAlign="right">
                            <Typography fontSize={13} fontWeight={600} color="#111827">
                              ₦{Number(v.wallet?.balance || 0).toLocaleString()}
                            </Typography>

                            <Chip
                              label={isActive ? "Active" : "Inactive"}
                              size="small"
                              sx={{
                                mt: 0.5,
                                height: 18,
                                fontSize: 10,
                                bgcolor: isActive ? "#dcfce7" : "#e5e7eb",
                                color: isActive ? "#16a34a" : "#6b7280",
                              }}
                            />
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })
                )}

              </Stack>
              {/* Pagination */}
              <Stack
                direction="row"
                justifyContent="center"
                mt={2}
              >

                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => {
                    setPage(value);
                    load(value);
                  }}
                  color="primary"
                  size="small"
                  shape="rounded"
                />
              </Stack>

            </Box>
          </Card>

        </Grid>

        {/* MAIN */}
        <Grid item xs={12} md={8} >
          <Stack spacing={3}>


            {/* HEADER */}
            <Card sx={{ p: 2, borderRadius: 3 }}>
              <Stack direction="row" justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      bgcolor: "#2563eb",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    {selectedVendor?.business_name?.slice(0, 2)}
                  </Box>

                  <Box>
                    <Typography fontWeight={700}>
                      {selectedVendor?.business_name}
                    </Typography>
                    <Typography fontSize={12} color="#6b7280">
                      ID: VND-{vendorsId}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1}>
                  {/* <Button size="small" variant="outlined">
                    View Profile
                  </Button> */}
                  <Button size="small" onClick={() => setOpenFund(true)} variant="contained">
                    + Fund Wallet
                  </Button>
                </Stack>
              </Stack>
              {/* WALLET */}
              <Card sx={{ p: 2, borderRadius: 3, width: 260 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccountBalanceWallet fontSize="small" />
                  <Typography fontSize={12}>VENDING WALLET</Typography>
                </Stack>

                <Typography fontSize={22} fontWeight={700} color="#16a34a">
                  ₦{displayBalance.toLocaleString()}
                </Typography>

                <Typography fontSize={12} color="#6b7280">
                  Available balance
                </Typography>

                <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => setOpenFund(true)}>
                  Fund
                </Button>

              </Card>
            </Card>

            {/* WALLET + TABS ROW */}
            <Stack direction="row" spacing={3}>
              {/* TABS + CONTENT */}
              <Box flex={1}>
                <Stack direction="row" spacing={3} borderBottom="1px solid #e5e7eb">
                  {["ledger", "analytics"].map((tab) => (
                    <Box
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      sx={{
                        pb: 1,
                        cursor: "pointer",
                        borderBottom:
                          activeTab === tab
                            ? "2px solid #2563eb"
                            : "2px solid transparent",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      {tab === "ledger" ? "Transaction Ledger" : "Analytics"}
                    </Box>
                  ))}
                </Stack>

                {/* ANALYTICS */}
                {activeTab === "analytics" && (
                  <Card sx={{ mt: 2, p: 2, borderRadius: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                      <BarChart fontSize="small" />
                      <Typography fontWeight={600}>
                        Transaction Volume — Last 14 Days
                      </Typography>
                    </Stack>

                    <ResponsiveContainer width="100%" height={220}>
                      <ReBarChart data={chartData}>
                        <XAxis dataKey="date" />
                        <Tooltip />
                        <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                {/* LEDGER */}
                {activeTab === "ledger" && (
                  <Card sx={{ mt: 2, borderRadius: 3 }}>
                    <Box p={2}>
                      <Stack direction="row" spacing={1.5} mb={2} alignItems="center">

                        <TextField
                          size="small"
                          placeholder="Search ref, description..."
                          sx={{
                            width: 260,
                            "& .MuiOutlinedInput-root": {
                              height: 34,
                              fontSize: 12,
                              bgcolor: "#f9fafb",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search sx={{ fontSize: 14 }} />
                              </InputAdornment>
                            ),
                          }}
                        />

                        <TextField
                          size="small"
                          select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value as any)}
                          sx={{
                            width: 120,
                            "& .MuiOutlinedInput-root": {
                              height: 34,
                              fontSize: 12,
                              bgcolor: "#f9fafb",
                            },
                          }}
                        >
                          <MenuItem value="all">All Types</MenuItem>
                          <MenuItem value="credit">Credit</MenuItem>
                          <MenuItem value="debit">Debit</MenuItem>
                        </TextField>

                        <TextField
                          size="small"
                          type="date"
                          value={startDate}
                          onChange={(e) => {
                            if (e.target.value <= endDate) {
                              setStartDate(e.target.value);
                            } else {
                              setAlert({
                                open: true,
                                type: "error",
                                message: "Start date cannot be after end date",
                              });
                            }
                          }}
                        />

                        <TextField
                          size="small"
                          type="date"
                          value={endDate}
                          onChange={(e) => {
                            if (e.target.value >= startDate) {
                              setEndDate(e.target.value);
                            } else {
                              setAlert({
                                open: true,
                                type: "error",
                                message: "End date cannot be before start date",
                              });
                            }
                          }}
                        />

                        <Button
                          startIcon={<FileDownload />}
                          variant="outlined"
                          size="small"
                          onClick={handleExport}
                        >
                          Export
                        </Button>
                      </Stack>

                      {loading ? (
                        <CircularProgress />
                      ) : (
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: "#f9fafb" }}>
                              <TableCell>REFERENCE</TableCell>
                              <TableCell>DESCRIPTION</TableCell>
                              <TableCell>CREDIT</TableCell>
                              <TableCell>DEBIT</TableCell>
                              {/* <TableCell>BALANCE AFTER</TableCell> */}
                              <TableCell>STATUS</TableCell>
                              <TableCell>DATE & TIME</TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {filteredTransactions.map((tx) => (
                              <TableRow key={tx.transaction_ref} hover>
                                <TableCell>{tx.transaction_ref}</TableCell>

                                <TableCell>
                                  <Typography fontWeight={500}>
                                    Wallet Funding
                                  </Typography>
                                  <Typography fontSize={12} color="#6b7280">
                                    Bank Transfer via NIBSS
                                  </Typography>
                                </TableCell>

                                <TableCell sx={{ color: "#16a34a", fontWeight: 600 }}>
                                  {tx.credit_amount
                                    ? `+₦${Number(tx.credit_amount).toLocaleString()}`
                                    : "—"}
                                </TableCell>

                                <TableCell sx={{ color: "#dc2626", fontWeight: 600 }}>
                                  {tx.debit_amount
                                    ? `-₦${Number(tx.debit_amount).toLocaleString()}`
                                    : "—"}
                                </TableCell>
                                {/* <TableCell sx={{ fontWeight: 600 }}>
  ₦{Number(tx.balance_after || 0).toLocaleString()}
</TableCell> */}
                                <TableCell>
                                  <Chip
                                    label="Success"
                                    size="small"
                                    sx={{
                                      bgcolor: "#dcfce7",
                                      color: "#16a34a",
                                      fontWeight: 600,
                                      fontSize: 11,
                                    }}
                                  />
                                </TableCell>

                                <TableCell>
                                  {new Date(tx.timestamp).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                      <Stack
                        direction="row"
                        justifyContent="center"
                        mt={2}
                      >

                        <Pagination
                          count={totalTxPages}
                          page={txPage}
                          onChange={(_, value) => {
                            setTxPage(value);
                            if (vendorsId)
                              loadTransactions(vendorsId, value);
                          }}
                          color="primary"
                          size="small"
                          shape="rounded"
                        />
                      </Stack>
                    </Box>

                  </Card>
                )}
              </Box>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      <Dialog
        open={openFund}
        onClose={() => setOpenFund(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            animation: "fadeIn 0.3s ease",
          },
        }}
      >
        <DialogTitle>
          Fund Vendor Wallet
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>

            <TextField
              label="Vendor"
              value={selectedVendor?.business_name}
              fullWidth
              size="small"
              disabled
            />

            <TextField select label="Wallet Type" fullWidth size="small">
              <MenuItem value="vending">⚡ Vending Wallet</MenuItem>
            </TextField>

            <TextField
              label="Amount (₦)"
              fullWidth
              size="small"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <TextField
              label="Funding Source"
              fullWidth
              size="small"
              value="Tenant Wallet"
              disabled
            />
            {/* <TextField select label="Funding Source" fullWidth size="small">
        <MenuItem>Bank Transfer (NIBSS)</MenuItem>
      </TextField> */}

            <TextField
              label="Transaction Note"
              fullWidth
              size="small"
              placeholder="e.g. Monthly float top-up"
            />

            <Box
              sx={{
                bgcolor: "#eff6ff",
                p: 1.5,
                borderRadius: 2,
                fontSize: 12,
                color: "#2563eb",
              }}
            >
              This action will be logged and attributed to your admin account.
              Funds are credited instantly.
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenFund(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleFundWallet}
            disabled={funding}
          >
            {funding ? <CircularProgress size={18} /> : "Confirm Funding"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={alert.type}
          variant="filled"
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{
            borderRadius: 2,
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      {/* ══════════════════════════════════════════════════════════════════════
                GENERATE REPORT DIALOG
            ══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={reportOpen} onClose={() => { if (!generating) setReportOpen(false); }} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>


        <Box sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', px: 3, py: 2.5, color: '#fff' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Assessment sx={{ fontSize: 26 }} />
              <Box>
                <Typography variant="h6" fontWeight={700} color="#fff">Generate Report</Typography>

              </Box>
            </Stack>
            <IconButton onClick={() => { if (!generating) setReportOpen(false); }} size="small" sx={{ color: '#93c5fd', '&:hover': { color: '#fff' } }}>
              <Close fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <DialogContent sx={{ pt: 3, pb: 1 }}>
          {reportError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setReportError(null)}>
              {reportError}
            </Alert>
          )}

          <Grid container spacing={2.5}>

            <Grid item xs={12} md={6}>
              <TextField fullWidth type="date" label="Start Date" value={reportForm.start_date}
                onChange={e => setReportForm(p => ({ ...p, start_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8faff' } }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="date" label="End Date" value={reportForm.end_date}
                onChange={e => setReportForm(p => ({ ...p, end_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8faff' } }} />
            </Grid>


            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vendor"
                placeholder="Filter by vendor name…"
                value={reportForm.vendor}
                onChange={e => setReportForm(p => ({ ...p, vendor: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                  ),
                }}
                helperText="Leave empty to include all vendors"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8faff' } }}
              />
            </Grid>


            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8faff' } }}>
                <InputLabel>Purpose</InputLabel>
                <Select value={reportForm.purpose} label="Purpose" onChange={e => setReportForm(p => ({ ...p, purpose: e.target.value }))}>
                  {PURPOSE_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>


            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8faff' } }}>
                <InputLabel>Status</InputLabel>
                <Select value={reportForm.status} label="Status" onChange={e => setReportForm(p => ({ ...p, status: e.target.value }))}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="success">✓ Success</MenuItem>
                  <MenuItem value="pending">⏳ Pending</MenuItem>
                  <MenuItem value="failed">✕ Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>


            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8faff' } }}>
                <InputLabel>Type</InputLabel>
                <Select value={reportForm.direction} label="Type" onChange={e => setReportForm(p => ({ ...p, direction: e.target.value }))}>
                  <MenuItem value="all">Credit &amp; Debit</MenuItem>
                  <MenuItem value="credit">Credit Only</MenuItem>
                  <MenuItem value="debit">Debit Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: '#f0f7ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
                <Typography variant="body2" color="primary.main" fontWeight={700} mb={1}>
                  Columns that will be exported in the report:
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                  {['Date', 'Vendor', 'Reference', 'account_number', 'Status', 'Reversal', 'Credit', 'Date', 'closing_balance'].map((col, i) => (
                    <Chip key={`${col}-${i}`} label={col} size="small" variant="outlined"
                      sx={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, borderColor: '#93c5fd', color: '#1e3a8a' }} />
                  ))}
                </Stack>

              </Box>
            </Grid>
          </Grid>
        </DialogContent>


        <Box sx={{ px: 3, py: 2.5, bgcolor: '#f8faff', borderTop: '1px solid #e8edf5' }}>
          <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center">
            <Button variant="text" onClick={resetReportForm} disabled={generating}
              sx={{ textTransform: 'none', color: '#64748b', borderRadius: 2 }}>
              Reset Filters
            </Button>
            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" onClick={() => setReportOpen(false)} disabled={generating}
                sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#cbd5e1', color: '#475569' }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleGenerateReport}
                disabled={generating || !reportForm.start_date || !reportForm.end_date}
                sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#1e3a8a', '&:hover': { bgcolor: '#1e40af' }, fontWeight: 700, minWidth: 170 }}
              >
                {generating ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={16} color="inherit" />
                    <span>Generating…</span>
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Assessment fontSize="small" />
                    <span>Generate Report</span>
                  </Stack>
                )}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
};

export default VendorTransactions;