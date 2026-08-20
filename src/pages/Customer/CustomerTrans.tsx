import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Grid, Card, Typography, TextField, Button,
  InputAdornment, Paper, Stack, Chip, Divider,
  LinearProgress, Avatar, MenuItem,
  FormControl,
  Select,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Snackbar,
  Alert,
  Radio,
  CircularProgress,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Tooltip,
  TablePagination,
  Tabs,
  Tab
} from "@mui/material";
import { CalendarToday, Download, ReceiptLong, Search } from "@mui/icons-material";
import { createDebt, fetchCustomerDebtAnalytic, fetchCustomerTransactions, fetchDebt, fetchDebtAnalytics, fetchDebtHistory, fetchPaymentPlans, searchCustomers } from "../../services/vendorService";
import { DatePicker } from "@mui/x-date-pickers/DatePicker/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import CustomerSummary from "./CustomerSummary";
import dayjs from "dayjs";
import CustomerStatement from "./CustomerTransLedger";

const fmt = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });

/* ---------------- COMPONENT ---------------- */

export default function CustomerTrans() {
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [debts, setDebts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [customerAnalytic, setCustomerAnalytic] = useState<any>(null);
  const detailsRef = useRef<any>(null);

  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  /* ---------------- SEARCH ---------------- */
  const [debtType, setDebtType] = useState("");
  const [paymentPlan, setPaymentPlan] = useState("");
 
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [transHistory, setTransHistory] = useState<any>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });
  const [activeTab, setActiveTab] = useState("ledger");

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const res = await fetchDebtAnalytics();
      setAnalytics(res?.debt_summary);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };
  const loadPaymentPlans = async () => {
    try {
      setLoading(true);
      const res = await fetchPaymentPlans();
      setPaymentPlans(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    loadPaymentPlans();
  }, []);



  const loadtransactionHistory = async (
    customerId: string,
    page: number
  ) => {
    try {
      setTransactionLoading(true);

      const res = await fetchCustomerTransactions(customerId, page);

      setTransHistory(
        res || {
          count: 0,
          next: null,
          previous: null,
          results: [],
        }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setTransactionLoading(false);
    }
  };

  useEffect(() => {
    if (!customer) return;

    loadtransactionHistory(customer.id, page);
  }, [customer, page]);



  const handleCreateDebt = async () => {
    try {
      if (!customer) return;

      setCreating(true);

      await createDebt({
        customer: customer.id,
        description,
        payment_plan: Number(paymentPlan), // now using code
        effective_date: date,
        rate: Number(rate),
        debt_type: debtType,
        amount: Number(amount),
      });

      setSuccessMsg("Debt created successfully");

      const debtRes = await fetchDebt(customer.id);
      setDebts(debtRes || []);

    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to create debt");
    } finally {
      setCreating(false);
    }
  };

  const handleSearch = async () => {
    try {
      if (!search.trim()) return;

      setSearchLoading(true);

      const res = await searchCustomers(search);
      const found = res?.results?.[0];

      if (!found) {
        setCustomer(null);
        return;
      }

      setCustomer(found);

      const debtRes = await fetchDebt(found.id);
      setDebts(debtRes || []);

      const analyticRes = await fetchCustomerDebtAnalytic(found.id);
      setCustomerAnalytic(analyticRes);

      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);

    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const totalAmount = useMemo(() => {
    return (transHistory.results || []).reduce(
      (sum: number, item: any) => sum + Number(item.amount || 0),
      0
    );
  }, [transHistory.results]);
  /* ---------------- UI ---------------- */
  const exportCSV = () => {
    const rows = transHistory.results || [];

    const csv = [
      [
        "Date",
        "Vendor",
        "Vendor Email",
        "Reference",
        "Token",
        "Amount",
      ],
      ...rows.map((r: any) => [
        dayjs(r.timestamp).format("DD/MM/YYYY HH:mm"),
        r.vendor?.business_name,
        r.vendor?.email,
        r.transaction_ref,
        r.token,
        r.amount,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "transactions.csv";

    link.click();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ background: "#f4f6fb", minHeight: "100vh" }}>

        {/* HEADER */}
        <Stack direction="row" justifyContent="space-between" mb={3}>
          <Box>
            <Typography sx={{ fontSize: 28, fontWeight: 800 }}>
              Customer Transaction Ledger
            </Typography>
            <Typography fontSize={13} color="#6b7a99">
              Search any of the 1.7 million registered customers by meter number or account number to view their complete payment history — every vend, debt deduction and refund.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            sx={{ height: 36, textTransform: "none", borderRadius: 2 }}
            onClick={() => {
              setSearch("");
              setCustomer(null);
              setDebts([]);
            }}
          >
            Refresh
          </Button>
        </Stack>

        {/* KPI */}
        <Grid container spacing={2} mb={3}>
          {[
            {
              label: "TOTAL CUSTOMERS WITH DEBT",
              value: analytics?.customers_with_debt || 0,
              color: "#ef4444"
            },
            {
              label: "Active Accounts",
              value: fmt(analytics?.total_outstanding_debts || 0),
              color: "#f59e0b"
            },
            {
              label: "Vended This Month",
              value: fmt(analytics?.recovered_this_month || 0),
              color: "#10b981"
            },
            {
              label: "Debt Recovered (Month)",
              value: fmt(analytics?.total_outstanding_debts || 0),
              color: "#8b5cf6"
            }
          ].map((k, i) => (
            <Grid item xs={12} md={3} key={i}>
              <Card sx={{ borderRadius: 4, border: "1px solid #e5e9f2" }}>
                <Box sx={{ height: 5, background: k.color }} />
                <Box p={2}>
                  <Typography fontSize={10} color="#6b7a99">
                    {k.label}
                  </Typography>
                  <Typography fontSize={22} fontWeight={800}>
                    {k.value}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* SEARCH */}
        {/* SEARCH */}
        <Card
          sx={{
            p: 3,
            borderRadius: 4,
            mb: 3,
            background: "#f8fafc",
            border: "1px solid #e5e9f2"
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <Search sx={{ fontSize: 18, color: "#2563eb" }} />
            <Typography fontWeight={700} fontSize={16}>
              Find a Customer
            </Typography>
          </Stack>

          <Typography fontSize={12.5} color="#6b7280" mb={2}>
            Search using <b>meter number</b> or <b>account number</b>
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">

            {/* SINGLE SEARCH INPUT */}
            <TextField
              fullWidth
              placeholder="Enter meter number or account number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  height: 48,
                  fontSize: 13,
                  bgcolor: "#fff"
                }
              }}
            />

            {/* SEARCH BUTTON */}
            <Button
              onClick={handleSearch}
              sx={{
                height: 44,
                px: 3,
                borderRadius: 2,
                background: "#1d4ed8",
                color: "#fff",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { background: "#1e40af" }
              }}
            >
              Search
            </Button>

            {/* CLEAR BUTTON */}
            <Button
              onClick={() => {
                setSearch("");
                setCustomer(null);
                setDebts([]);
              }}
              sx={{
                height: 44,
                px: 2,
                borderRadius: 2,
                background: "#f3f4f6",
                color: "#374151",
                textTransform: "none"
              }}
            >
              Clear
            </Button>

          </Stack>
        </Card>


        {/* RESULT 
			// 🔥 PIXEL-PERFECT UPGRADE (MATCHES YOUR DESIGN)*/}

        {searchLoading ? (
          <Box py={3} textAlign="center">
            <CircularProgress size={35} />
          </Box>
        ) : !customer ? (
          <Paper
            sx={{
              p: 8,
              textAlign: "center",
              borderRadius: 4,
              background: "#f8fafc",
              border: "1px solid #e5e9f2"
            }}
          >
            Customer not found. Please search using a valid meter number or account number.
          </Paper>

        ) : (
          <Grid container spacing={2} ref={detailsRef}>

            {/* FULL WIDTH */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4, overflow: "hidden" }}>

                {/* ===== TOP HEADER (BLUE GRADIENT) ===== */}
                <Box sx={{
                  px: 3,
                  py: 2.5,
                  color: "#fff",
                  background: "linear-gradient(135deg,#142a5c,#2d5bff)",
                }}>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">

                    {/* LEFT INFO */}
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: "#ffffff22", fontWeight: 800 }}>
                        {customer.name?.[0]}
                      </Avatar>

                      <Box>
                        <Typography fontWeight={800} fontSize={20}>
                          {customer.name}
                        </Typography>

                        <Typography fontSize={12} sx={{ opacity: 0.9 }}>
                          {customer.phone} • {customer.email}
                        </Typography>

                        <Typography fontSize={12} sx={{ opacity: 0.9 }}>
                          Acct: {customer.account_number} • KCT1: {customer.kct1 || "N/A"} • KCT2: {customer.kct2 || "N/A"} • Meter: {customer.meter_number}
                        </Typography>

                        <Stack direction="row" spacing={1} mt={1}>
                          <Chip label="active" size="small" sx={{ bgcolor: "#10b981", color: "#fff", fontSize: 10 }} />
                          <Chip label="postpaid" size="small" sx={{ bgcolor: "#f59e0b", color: "#fff", fontSize: 10 }} />
                          <Chip label="Industrial - Maximum Demand" size="small" sx={{ bgcolor: "#475569", color: "#fff", fontSize: 10 }} />
                          <Chip label={`⚠ Debt: ${fmt(customerAnalytic?.remaining_debt || 0)}`} size="small" sx={{ bgcolor: "#7f1d1d", color: "#fff", fontSize: 10 }} />
                        </Stack>
                      </Box>
                    </Stack>

                    {/* BUTTON */}
                    <Button
                      size="small"
                      sx={{
                        borderRadius: 2,
                        background: "#ffffff22",
                        color: "#fff",
                        textTransform: "none",
                        fontSize: 12
                      }}
                      onClick={handleSearch}
                      disabled={searchLoading}
                      startIcon={
                        searchLoading ? (
                          <CircularProgress
                            size={18}
                            color="inherit"
                          />
                        ) : (
                          <Search />
                        )
                      }
                    >
                      {searchLoading ? "Searching..." : "Search"}
                    </Button>
                  </Stack>
                </Box>

                {/* ===== SUMMARY STRIP ===== */}
                {/* <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #eee", background: "#fafafa" }}>
                  <Grid container spacing={2}>

                    <Grid item xs={12} md={3}>
                      <Typography fontSize={10} color="#6b7280">BALANCE DUE</Typography>
                      <Typography fontWeight={800} color="#dc2626">{fmt(customerAnalytic?.remaining_debt || 0)}</Typography>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Typography fontSize={10} color="#6b7280">DEBT TYPE</Typography>
                      <Typography fontWeight={600}>Maximum Demand Arrears</Typography>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Typography fontSize={10} color="#6b7280">EFFECTIVE FROM</Typography>
                      <Typography fontWeight={600}>Sep 1, 2025</Typography>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Typography fontSize={10} color="#6b7280">LAST DEDUCTION</Typography>
                      <Typography fontWeight={600} color="#dc2626">Mar 1, 2026</Typography>
                    </Grid>

                  </Grid>
                </Box> */}

                {/* ===== KPI ROW ===== */}
                {/* <Grid container>

                  <Grid item xs={12} md={6} sx={{ p: 3, borderRight: "1px solid #eee" }}>
                    <Typography fontSize={10} color="#6b7280">TOTAL AMOUNT PAID (ALL TIME)</Typography>
                    <Typography fontSize={28} fontWeight={900} color="#1d4ed8">{fmt(customerAnalytic?.recovered_debt || 0)}</Typography>
                    <Typography fontSize={11} color="#9ca3af">3 payments</Typography>
                  </Grid>

                  <Grid item xs={12} md={6} sx={{ p: 3 }}>
                    <Typography fontSize={10} color="#6b7280">OUTSTANDING DEBT</Typography>
                    <Typography fontSize={28} fontWeight={900} color="#dc2626">{fmt(customerAnalytic?.remaining_debt || 0)}</Typography>
                    <Typography fontSize={11} color="#9ca3af">Maximum Demand Arrears</Typography>
                  </Grid>

                </Grid> */}
                <CustomerSummary
                  unitsVended={customerAnalytic?.total_units_vended ?? 0}
                  totalVends={customerAnalytic?.total_transactions ?? 0}
                  totalPaid={customerAnalytic?.recovered_debt ?? 0}
                  paymentCount={customerAnalytic?.total_transactions ?? 0}
                  outstandingDebt={customerAnalytic?.remaining_debt ?? 0}
                  debtName={customerAnalytic?.debt_type ?? "No Active Debt"}
                  deductionRate={`${customerAnalytic?.rate ?? 0}% per vend`}
                  lastActivityDate={
                    customerAnalytic?.last_activity
                      ? dayjs(customerAnalytic.last_activity).format("MMM D, YYYY")
                      : "-"
                  }
                  lastActivityText={
                    customerAnalytic?.last_activity_description ?? "No activity"
                  }
                />
              </Card>

              <Card
                sx={{
                  borderRadius: 5,
                  overflow: "hidden",
                  boxShadow: "0 10px 40px rgba(15,23,42,0.06)",
                  marginTop: 5,
                }}
              >
                {/* =========================
      TAB NAVIGATION
  ========================== */}
                <Box
                  sx={{
                    borderBottom: "1px solid #E2E8F0",
                    px: 2,
                    bgcolor: "#fff",
                  }}
                >
                  <Tabs
                    value={activeTab}
                    onChange={(_, value) => setActiveTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      "& .MuiTab-root": {
                        minWidth: 160,
                        fontWeight: 600,
                      },
                    }}
                  >
                    <Tab
                      value="ledger"
                      label="Transaction Ledger"
                    />
                    <Tab
                      value="transaction"
                      label="Transactions"
                    />


                  </Tabs>
                </Box>
                {/* =========================
      LEDGER TAB
  ========================== */}

                {activeTab === "ledger" && (
                  <Box sx={{ p: 2 }}>
                    <CustomerStatement
                      customerId={customer?.id ?? ""}
                    />
                  </Box>
                )}
                {/* =========================
      TAB CONTENT
  ========================== */}

                {activeTab === "transaction" && (
                  <>
                    <Card
                      elevation={0}
                      sx={{
                        mt: 2,
                        borderRadius: 0,
                      }}
                    >
                      {/* Header */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mt={3}
                        mb={3}
                        px={3}
                      >
                        <Typography variant="h5" fontWeight={700}>
                          Transaction History
                        </Typography>

                        <Button
                          variant="outlined"
                          startIcon={<Download />}
                          onClick={exportCSV}
                        >
                          Export CSV
                        </Button>
                      </Stack>

                      {/* Summary */}
                      <Stack
                        direction="row"
                        spacing={5}
                        mb={2}
                        px={3}
                      >
                        <Typography>
                          <strong>Total Transactions:</strong>{" "}
                          {transHistory.count}
                        </Typography>

                        <Typography>
                          <strong>Total Amount:</strong>{" "}
                          ₦{totalAmount.toLocaleString()}
                        </Typography>
                      </Stack>

                      {/* Loading */}
                      {transactionLoading ? (
                        <Box py={8} textAlign="center">
                          <CircularProgress />

                          <Typography mt={2}>
                            Loading transactions...
                          </Typography>
                        </Box>

                      ) : transHistory.results.length === 0 ? (

                        /* Empty state */
                        <Box py={10} textAlign="center">
                          <ReceiptLong
                            sx={{
                              fontSize: 60,
                              color: "grey.400",
                            }}
                          />

                          <Typography variant="h6" mt={2}>
                            No Transactions Found
                          </Typography>

                          <Typography color="text.secondary">
                            This customer has not made any transactions yet.
                          </Typography>
                        </Box>

                      ) : (

                        /* Table */
                        <TableContainer
                          component={Paper}
                          sx={{
                            maxHeight: 500,
                            borderRadius: 2,
                          }}
                        >
                          <Table stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Vendor</TableCell>
                                <TableCell>Vendor Email</TableCell>
                                <TableCell>Reference</TableCell>
                                <TableCell>Token</TableCell>
                                <TableCell align="right">
                                  Amount
                                </TableCell>
                                <TableCell>Status</TableCell>
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {transHistory.results.map((tx: any) => (
                                <TableRow
                                  hover
                                  key={tx.id}
                                >
                                  <TableCell>
                                    {dayjs(tx.timestamp).format(
                                      "DD MMM YYYY HH:mm"
                                    )}
                                  </TableCell>

                                  <TableCell>
                                    <Stack>
                                      <Typography fontWeight={600}>
                                        {tx.vendor?.business_name || "N/A"}
                                      </Typography>

                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {tx.vendor?.hierachy || "N/A"}
                                      </Typography>
                                    </Stack>
                                  </TableCell>

                                  <TableCell>
                                    {tx.vendor?.email || "N/A"}
                                  </TableCell>

                                  <TableCell>
                                    {tx.transaction_ref || "N/A"}
                                  </TableCell>

                                  <TableCell>
                                    <Tooltip title={tx.token || ""}>
                                      <Typography
                                        sx={{
                                          fontFamily: "monospace",
                                        }}
                                      >
                                        {tx.token
                                          ? `${tx.token.substring(0, 8)}...`
                                          : "N/A"}
                                      </Typography>
                                    </Tooltip>
                                  </TableCell>

                                  <TableCell align="right">
                                    <Typography
                                      fontWeight={700}
                                      color="success.main"
                                    >
                                      ₦{Number(tx.amount).toLocaleString()}
                                    </Typography>
                                  </TableCell>

                                  <TableCell>
                                    <Chip
                                      label="Completed"
                                      color="success"
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </Card>
                    <TablePagination
                      component="div"
                      count={transHistory.count}
                      page={page - 1}
                      rowsPerPage={10}
                      rowsPerPageOptions={[10]}
                      onPageChange={(_, newPage) => {
                        setPage(newPage + 1);
                      }}
                      sx={{ px: 3 }}
                    />
                  </>
                )}


              </Card>
            </Grid>



          </Grid>
        )}

        <Snackbar
          open={!!successMsg}
          autoHideDuration={3000}
          onClose={() => setSuccessMsg("")}
        >
          <Alert severity="success">{successMsg}</Alert>
        </Snackbar>

        <Snackbar
          open={!!errorMsg}
          autoHideDuration={3000}
          onClose={() => setErrorMsg("")}
        >
          <Alert severity="error">{errorMsg}</Alert>
        </Snackbar>
      </Box>

    </LocalizationProvider>
  );
}