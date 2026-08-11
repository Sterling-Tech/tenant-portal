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
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Refresh,
  Search,
  FileDownload,
  AccountBalanceWallet,
  BarChart,
  RestartAlt,
  CheckCircle,
  RadioButtonUnchecked,
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
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from 'xlsx';
import { useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store/store';
import { getErrorMessage } from "../../utils/getErrorMessage";
import { toast } from "react-toastify";

// ─── Types ─────────────────────────────────────────────────────────────────────
type TransactionStatus = 'success' | 'pending' | 'failed';
type TransactionDirection = 'credit' | 'debit';
type ChipColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';

type Transaction = {
  id: string;
  reference: string;
  status: TransactionStatus;
  account_no: string;
  direction: TransactionDirection;
  value: number;
  created_at: string;
};

type LedgerEntry = {
  id: string;
  transaction_ref: string;
  category: string;
  debit_amount: number;
  credit_amount: number;
  closing_balance: number;
  created_at: string;
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
const categoryLabel = (c: string) => (c || '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || '—';
const escapeCsv = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const API_BASE_URL = process.env.REACT_APP_API_URL;

const buildHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('accessToken')
    : null;
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

// ─── Category options (used for ledger filter + report filter) ────────────────
const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: 'all' },
  { label: 'Vending', value: 'vending' },
  { label: 'Wallet Funding', value: 'wallet_funding' },
  { label: 'Wallet Debit', value: 'wallet_debit' },
  { label: 'Wallet Credit', value: 'wallet_credit' },
  { label: 'Payment Reversal', value: 'payment_reversal' },
  { label: 'Commission', value: 'commission' },
];

// ─── Report export column definitions ──────────────────────────────────────────
type ReportColumnKey = 'date' | 'reference' | 'category' | 'account_number' | 'debit' | 'credit' | 'closing_balance';
const REPORT_COLUMNS: { key: ReportColumnKey; label: string; header: string }[] = [
  { key: 'date', label: 'Date', header: 'Date' },
  { key: 'reference', label: 'Reference', header: 'Reference' },
  { key: 'category', label: 'Category', header: 'Category' },
  { key: 'account_number', label: 'Account No.', header: 'account_number' },
  { key: 'debit', label: 'Debit', header: 'Debit' },
  { key: 'credit', label: 'Credit', header: 'Credit' },
  { key: 'closing_balance', label: 'Closing Balance', header: 'closing_balance' },
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

  const [transactionPage, setTransactionPage] = useState(0);
  const [ledgerPage, setLedgerPage] = useState(0);

  const [transactionCount, setTransactionCount] = useState(0);
  const [txPage, setTxPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "ledger">("analytics");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [selected, setSelected] = useState<Vendor | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "suspended">("all");
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
    category: 'all',
    // search filters against transaction_ref / account number
    search: '',
  });
  // Which export columns are included — defaults to all ON, user can toggle off/on
  const [reportColumns, setReportColumns] = useState<Record<ReportColumnKey, boolean>>({
    date: true, reference: true, category: true, account_number: true,
    debit: true, credit: true, closing_balance: true,
  });
  const toggleReportColumn = (key: ReportColumnKey) => setReportColumns(p => ({ ...p, [key]: !p[key] }));
  const resetReportColumns = () => setReportColumns({ date: true, reference: true, category: true, account_number: true, debit: true, credit: true, closing_balance: true });

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


  const load = async (pageNumber = 1) => {
    try {
      setLoading(true);

      const keyword = search.trim();

      if (keyword.length >= 3) {
        const res = await searchVendors(keyword, pageNumber);

        setVendors(res.results);
        setCount(res.count);
        setNext(res.next);
        setPrevious(res.previous);
        setSelected(res.results[0] ?? null);

        return;
      }

      const res = await fetchVendors({
        page: pageNumber,
        main_vendor: true,
        account_status:
          statusFilter === "all"
            ? undefined
            : statusFilter as "active" | "inactive" | "suspended",
        // vendor_type:
        //   vendorTypeFilter === "all"
        //     ? undefined
        //     : vendorTypeFilter as "internal" | "external",
      });

      setVendors(res.results);
      setCount(res.count);
      setNext(res.next);
      setPrevious(res.previous);
      setSelected(res.results[0] ?? null);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page, statusFilter]);

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

    const vendorName = selectedVendor?.business_name || "N/A";
    const headers = ["Reference", "Credit", "Debit", "Balance", "Category", "Date"];

    const rows = transactions.map((tx) => [
      tx.transaction_ref,
      tx.credit_amount || "0",
      tx.debit_amount || "0",
      tx.closing_balance || "0",
      tx.category || "",
      new Date(tx.timestamp).toLocaleString(),
    ]);

    // Vendor information at the top of the CSV
    const csvContent = [
      ["Vendor Name", vendorName], ["Date From", startDate], ["Date To", endDate],
      [],
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_${vendorName}_${startDate}_${endDate}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
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

  // const chartData = useMemo(() => {
  //   return transactions.map((tx) => ({
  //     date: new Date(tx.timestamp).toLocaleDateString(),
  //     amount: Number(tx.credit_amount || tx.debit_amount || 0),
  //     type: tx.debit_amount ? "debit" : "credit",
  //     category: tx.category || "N/A",
  //     balance: Number(tx.closing_balance || 0),
  //   }));
  // }, [transactions]);
  const chartData = useMemo(() => {
    const grouped: Record<
      string,
      {
        date: string;
        credit: number;
        debit: number;
      }
    > = {};

    transactions.forEach((tx) => {
      const date = new Date(tx.timestamp).toLocaleDateString();

      if (!grouped[date]) {
        grouped[date] = {
          date,
          credit: 0,
          debit: 0,
        };
      }

      grouped[date].credit += Number(tx.credit_amount || 0);
      grouped[date].debit += Number(tx.debit_amount || 0);
    });

    return Object.values(grouped);
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

  const totalCredits = Number(summary.total_credits || 0);
  const totalDebits = Number(summary.total_debits || 0);
  const netSum = totalCredits - totalDebits;
  const getColor = (name: string = "") => {
    const colors = [
      "#2563eb", "#16a34a", "#dc2626",
      "#7c3aed", "#ea580c", "#0891b2"
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // ── Fetch ALL ledger pages for the report (loops through pagination) ────────────────

  const fetchAllLedgerForReport = async (params: typeof reportForm): Promise<LedgerEntry[]> => {
    if (!vendorsId) {
      throw new Error('No vendor selected. Please select a vendor before generating a report.');
    }
    const allResults: LedgerEntry[] = [];
    let page = 1; let hasNext = true;
    while (hasNext) {
      const url = `${API_BASE_URL}/vendor/ledger/?start_date=${params.start_date}&end_date=${params.end_date}&vendor_id=${vendorsId}&page=${page}&page_size=200`;
      const res = await fetch(url, { method: 'GET', headers: buildHeaders() });
      if (!res.ok) throw new Error(`Ledger API failed (page ${page})`);
      const data = await res.json();
      const mapped: LedgerEntry[] = (data.results ?? []).map((item: any, index: number) => ({
        id: item.transaction_ref || `ledger-${page}-${index}`,
        transaction_ref: item.transaction_ref,
        category: item.category || '',
        debit_amount: Number(item.debit_amount || 0),
        credit_amount: Number(item.credit_amount || 0),
        closing_balance: Number(item.closing_balance || 0),
        created_at: item.timestamp,
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
      let allEntries = await fetchAllLedgerForReport(reportForm);
      console.log('Raw entries:', allEntries.length);

      if (reportForm.category !== 'all') {
        allEntries = allEntries.filter(e => e.category === reportForm.category);
        console.log('After category filter:', allEntries.length);
      }
      if (reportForm.search.trim()) {
        const term = reportForm.search.trim().toLowerCase();
        allEntries = allEntries.filter(e => e.transaction_ref.toLowerCase().includes(term));
        console.log('After search filter:', allEntries.length);
      }
      if (allEntries.length === 0) {
        // Don't block — generate an empty report with a clear "no data" note instead
        const activeColumns = REPORT_COLUMNS.filter(c => reportColumns[c.key]);
        if (activeColumns.length === 0) {
          setReportError('Select at least one column to include in the report.');
          return;
        }

        const meta = [
          ['TRANSACTION LEDGER REPORT'],
          ['Vendor Name', vendors.find(v => v.id === vendorsId)?.business_name || 'Unknown'],
          [],
          ['Period', `${reportForm.start_date}  →  ${reportForm.end_date}`],
          ['Generated', new Date().toLocaleString()],
          ['Category', CATEGORY_OPTIONS.find(c => c.value === reportForm.category)?.label || 'All'],
          ['Search Filter', reportForm.search.trim() || 'None'],
          ['Total Records', 0],
          [],
          ['No ledger entries found for the selected vendor and criteria.'],
        ];

        const colHeaders = activeColumns.map(c => c.header);
        const wsData = [...meta, colHeaders];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = activeColumns.map(c => ({ wch: 20 }));
        ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(activeColumns.length - 1, 0) } }];

        const wsSummary = XLSX.utils.aoa_to_sheet([
          ['TRANSACTION LEDGER REPORT — SUMMARY'],
          ['Vendor Name', vendors.find(v => v.id === vendorsId)?.business_name || 'Unknown'],
          [],
          ['Date Range', `${reportForm.start_date} to ${reportForm.end_date}`],
          ['Category', CATEGORY_OPTIONS.find(c => c.value === reportForm.category)?.label || 'All'],
          ['Generated At', new Date().toLocaleString()],
          [],
          ['Metric', 'Value'],
          ['Total Records', 0],
          ['Total Credit', 0],
          ['Total Debit', 0],
          ['Net', 0],
        ]);
        wsSummary['!cols'] = [{ wch: 26 }, { wch: 36 }];
        wsSummary['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
        XLSX.writeFile(wb, `ledger-report-${reportForm.start_date}-to-${reportForm.end_date}.xlsx`);

        setSuccess('✓ Report generated — no transactions found for this vendor in the selected period');
        setReportOpen(false);
        return;
      }

      // 4. Build columns dynamically based on what's toggled on
      const activeColumns = REPORT_COLUMNS.filter(c => reportColumns[c.key]);
      if (activeColumns.length === 0) {
        setReportError('Select at least one column to include in the report.');
        return;
      }

      const buildRow = (e: LedgerEntry) => activeColumns.map(col => {
        switch (col.key) {
          case 'date': return formatDateTime(e.created_at);
          case 'reference': return e.transaction_ref;
          case 'category': return categoryLabel(e.category);
          // case 'account_number': return accountMap[e.transaction_ref] || '';
          case 'debit': return e.debit_amount || '';
          case 'credit': return e.credit_amount || '';
          case 'closing_balance': return e.closing_balance;
          default: return '';
        }
      });

      // ── Meta info rows ──
      const meta = [
        ['TRANSACTION LEDGER REPORT'],
        ['Vendor Name', vendors.find(v => v.id === vendorsId)?.business_name || 'Unknown'],
        [],
        ['Period', `${reportForm.start_date}  →  ${reportForm.end_date}`],
        ['Generated', new Date().toLocaleString()],
        ['Category', CATEGORY_OPTIONS.find(c => c.value === reportForm.category)?.label || 'All'],
        ['Search Filter', reportForm.search.trim() || 'None'],
        ['Total Records', allEntries.length],
        [],
      ];

      const colHeaders = activeColumns.map(c => c.header);
      const dataRows = allEntries.map(buildRow);

      const totalCredit = allEntries.reduce((s, e) => s + e.credit_amount, 0);
      const totalDebit = allEntries.reduce((s, e) => s + e.debit_amount, 0);
      const pad = (arr: any[]) => [...arr, ...Array(Math.max(0, activeColumns.length - arr.length)).fill('')];
      const summaryRows = [
        [],
        pad(['SUMMARY']),
        pad(['Total Records', allEntries.length]),
        pad(['Total Credit', totalCredit]),
        pad(['Total Debit', totalDebit]),
        pad(['Net', totalCredit - totalDebit]),
      ];

      // 5. Assemble worksheet
      const wsData = [...meta, colHeaders, ...dataRows, ...summaryRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = activeColumns.map(c => ({ wch: c.key === 'reference' ? 40 : c.key === 'closing_balance' ? 20 : 20 }));
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(activeColumns.length - 1, 0) } }];

      // 6. Second sheet: clean Summary
      const summarySheetData = [
        ['TRANSACTION LEDGER REPORT — SUMMARY'],
        ['Vendor Name', vendors.find(v => v.id === vendorsId)?.business_name || 'Unknown'],
        [],
        ['Date Range', `${reportForm.start_date} to ${reportForm.end_date}`],
        ['Category', CATEGORY_OPTIONS.find(c => c.value === reportForm.category)?.label || 'All'],
        ['Generated At', new Date().toLocaleString()],
        [],
        ['Metric', 'Value'],
        ['Total Records', allEntries.length],
        ['Total Credit', totalCredit],
        ['Total Debit', totalDebit],
        ['Net', totalCredit - totalDebit],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);
      wsSummary['!cols'] = [{ wch: 26 }, { wch: 36 }];
      wsSummary['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

      // 7. Build workbook & download
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      const fileName = `ledger-report-${reportForm.start_date}-to-${reportForm.end_date}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setSuccess(`✓ Report generated — ${allEntries.length} entries exported`);
      setReportOpen(false);
    } catch (err: any) {
      setReportError(getErrorMessage(err?.message || 'Failed to generate report. Please try again.'));
    } finally {
      setGenerating(false);
    }
  };

  const resetReportForm = () => {
    setReportForm({ start_date: fmt(oneYearAgo), end_date: fmt(tomorrow), category: 'all', search: '' });
    resetReportColumns();
    setReportError(null);
  };

  const handleFilterChange = (action: () => void) => { action(); setTransactionPage(0); setLedgerPage(0); };
  const getStatus = (vendor: Vendor) => {
    switch (vendor.account_status?.toLowerCase()) {
      case "active":
        return "active";

      case "suspended":
        return "suspended";

      case "inactive":
      default:
        return "inactive";
    }
  };
  const statusConfig = {
    active: {
      label: "Active",
      bg: "#DCFCE7",
      color: "#15803D",
    },
    inactive: {
      label: "Inactive",
      bg: "#F3F4F6",
      color: "#6B7280",
    },
    suspended: {
      label: "Suspended",
      bg: "#FEF3C7",
      color: "#B45309",
    },
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
          <Button size="small" onClick={() => { setReportOpen(true); setReportError(null); }} sx={{ height: 36, textTransform: "none", borderRadius: 2 }} variant="contained">
            + Generate Report
          </Button>
          


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
              {/* <Typography fontSize={12} color="#16a34a">
                ↑ 9.2% this month
              </Typography> */}
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3} >
        {/* SIDEBAR */}
        <Grid item xs={12} md={4.5} >
          <Card sx={{ borderRadius: 3 }}>
            <Box p={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={600}>Select Vendor</Typography>
                <Typography fontSize={12} color="gray">
                  {vendorCount} total
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search vendors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setPage(1);
                      load(1);
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={() => {
                    setPage(1);
                    load(1);
                  }}
                  sx={{
                    minWidth: 60,
                    whiteSpace: "nowrap",
                    px: 3,
                  }}
                >
                  Search
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} mt={2}>
                {["all", "active", "inactive", "suspended"].map((tab) => (
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
                    // const isActive = v?.account_status === "active";
                    const status = getStatus(v);
                    const chip = statusConfig[status];
                    const selected = vendorsId === v.id;
                    return (
                      <Box
                        key={v.id}
                        onClick={() => {
                          setVendorId(v.id);
                          selectVendor(v.id);
                        }}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          cursor: "pointer",
                          transition: "all .25s",

                          bgcolor: selected ? "#DBEAFE" : "#fff",

                          border: selected
                            ? "2px solid #2563EB"
                            : "1px solid #E5E7EB",

                          boxShadow: selected
                            ? "0 4px 14px rgba(37,99,235,.18)"
                            : "0 1px 2px rgba(0,0,0,.05)",

                          "&:hover": {
                            bgcolor: selected ? "#DBEAFE" : "#F9FAFB",
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 10px rgba(0,0,0,.08)",
                          },
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
                                {v.vendor_type} {v.hierachy}
                              </Typography>

                            </Box>
                          </Stack>

                          {/* RIGHT */}
                          <Box textAlign="right">
                            <Typography fontSize={13} fontWeight={600} color="#111827">
                              ₦{Number(v.wallet?.balance || 0).toLocaleString()}
                            </Typography>

                            <Chip
                              label={chip.label}
                              size="small"
                              sx={{
                                mt: 0.5,
                                height: 20,
                                fontSize: 10,
                                fontWeight: 600,
                                bgcolor: chip.bg,
                                color: chip.color,
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
        <Grid item xs={12} md={7.5} >
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

                {/* <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined">
                    View Profile
                  </Button>
                  <Button size="small" onClick={() => setOpenFund(true)} variant="contained">
                    + Fund Wallet
                  </Button>
                </Stack> */}

              </Stack>
              <Divider sx={{ my: 2 }} />
              {/* WALLET */}
              <Stack sx={{ p: 2, marginTop: 1, }}>
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

              </Stack>
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

                        <RechartsTooltip />

                        <Bar
                          dataKey="credit"
                          name="Credit"
                          fill="#16A34A"
                          radius={[6, 6, 0, 0]}
                        />

                        <Bar
                          dataKey="debit"
                          name="Debit"
                          fill="#DC2626"
                          radius={[6, 6, 0, 0]}
                        />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                {/* LEDGER */}
                {activeTab === "ledger" && (
                  <Card sx={{ mt: 2, borderRadius: 3 }}>
                    <Box p={2}>
                      <Stack direction="row" spacing={1} mb={2} alignItems="center">

                        <TextField
                          size="small"
                          placeholder="Search ref, description..."
                          fullWidth
                          sx={{
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
                          fullWidth
                          select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value as any)}
                          sx={{
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
                          fullWidth
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
                          fullWidth
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
                          sx={{
                            px: 5
                          }}
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
                              {/* <TableCell>DESCRIPTION</TableCell> */}
                              <TableCell>CREDIT</TableCell>
                              <TableCell>DEBIT</TableCell>
                              <TableCell>BALANCE</TableCell>
                              <TableCell>CATEGORY</TableCell>
                              <TableCell>DATE & TIME</TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {filteredTransactions.map((tx) => (
                              <TableRow key={tx.transaction_ref} hover>
                                <TableCell>{tx.transaction_ref}</TableCell>

                                {/* <TableCell>
                                  <Typography fontWeight={500}>
                                    Wallet Funding
                                  </Typography>
                                  <Typography fontSize={12} color="#6b7280">
                                    Bank Transfer via NIBSS
                                  </Typography>
                                </TableCell> */}

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
                                <TableCell sx={{ fontWeight: 600 }}>
                                  ₦{Number(tx.closing_balance || 0).toLocaleString()}
                                </TableCell>
                                {/* <TableCell>
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
                                </TableCell> */}
                                <TableCell>
                                  {categoryLabel(tx.category)}
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

        {/* Header */}
        <Box sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', px: 3, py: 2.5, color: '#fff' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Assessment sx={{ fontSize: 26 }} />
              <Box>
                <Typography variant="h6" fontWeight={700} color="#fff">Generate Report</Typography>
                <Typography variant="caption" sx={{ color: '#93c5fd' }}>
                  Sourced from the transaction ledger
                </Typography>
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
            {/* Date range */}
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

            {/* Category (was Purpose) */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8faff' } }}>
                <InputLabel>Category</InputLabel>
                <Select value={reportForm.category} label="Category" onChange={e => setReportForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORY_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            {/* Search by reference / account */}
            {/* <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Reference"
                placeholder="Filter by transaction ref…"
                value={reportForm.search}
                onChange={e => setReportForm(p => ({ ...p, search: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8faff' } }}
              />
            </Grid> */}

            {/* ── Toggleable report columns ── */}
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: '#f0f7ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="primary.main" fontWeight={700}>
                    Report columns — tap to include or remove
                  </Typography>
                  <Tooltip title="Reset to all columns" arrow>
                    <IconButton size="small" onClick={resetReportColumns}>
                      <RestartAlt fontSize="small" sx={{ color: '#1e3a8a' }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {REPORT_COLUMNS.map(col => {
                    const active = reportColumns[col.key];
                    return (
                      <Chip
                        key={col.key}
                        label={col.label}
                        onClick={() => toggleReportColumn(col.key)}
                        icon={active ? <CheckCircle sx={{ fontSize: 16 }} /> : <RadioButtonUnchecked sx={{ fontSize: 16 }} />}
                        sx={{
                          cursor: 'pointer', fontWeight: 600,
                          bgcolor: active ? '#1e3a8a' : '#fff',
                          color: active ? '#fff' : '#64748b',
                          border: '1px solid', borderColor: active ? '#1e3a8a' : '#cbd5e1',
                          '& .MuiChip-icon': { color: active ? '#fff' : '#94a3b8' },
                          '&:hover': { bgcolor: active ? '#1e40af' : '#f1f5f9' },
                          transition: 'all 0.15s ease',
                        }}
                      />
                    );
                  })}
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" mt={1.5}>
                  Unchecked columns are left out of the exported file entirely — click a column to add it back.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        {/* Footer */}
        <Box sx={{ px: 3, py: 2.5, bgcolor: '#f8faff', borderTop: '1px solid #e8edf5' }}>
          <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center">
            <Button variant="text" onClick={resetReportForm} disabled={generating}
              sx={{ textTransform: 'none', color: '#64748b', borderRadius: 2 }}>
              Reset All
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