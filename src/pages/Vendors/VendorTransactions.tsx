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
  MenuItem,
} from "@mui/material";
import {
  Refresh,
  Search,
  FileDownload,
  AccountBalanceWallet,
  BarChart,
} from "@mui/icons-material";
import { useTenants } from "../../hooks/useTenants";
import { fetchTransactions, fetchVendors, fundVendorWallet, Ledger, PaginatedLedgerResponse, Vendor } from "../../services/vendorService";
import { useOrgWallets } from "../../hooks/useOrgWallets";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const VendorTransactions: React.FC = () => {
  const [selectedVendorId, selectVendor] = useState<string | null>(null);
  const [vendorsId, setVendorId] = useState<string | null>(null);
  const { totalBalance } = useOrgWallets(vendorsId);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [transactions, setTransactions] = useState<Ledger[]>([]);
  const [openFund, setOpenFund] = useState(false);
  const [amount, setAmount] = useState("");
  const [funding, setFunding] = useState(false);
  const [summary, setSummary] = useState({
    total_debits: 0,
    total_credits: 0,
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "ledger">("analytics");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 14);

  const format = (d: Date) => d.toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(format(past));
  const [endDate, setEndDate] = useState(format(today));
  
  const load = async () => {
     const res = await fetchVendors();
  
     console.log(res, "yhhh");
  
     setVendors(res.results); // ✅ now works
  };

  useEffect(() => {
    load();
  }, []);

  const selectedVendor = useMemo(
    () => vendors?.find((t) => t.id === vendorsId),
    [vendorsId, vendors]
  );

  const handleExport = () => {
  if (!transactions.length) {
    alert("No data to export");
    return;
  }

  if (startDate > endDate) {
    alert("Invalid date range");
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

  const loadTransactions = async (id: string) => {
  if (!id) return;

  // ✅ prevent bad date range
  if (startDate > endDate) {
    alert("Start date cannot be after end date");
    return;
  }

  setLoading(true);

  try {
    const res = await fetchTransactions({
      vendor_id: id,
      start_date: startDate,
      end_date: endDate,
    });

    setTransactions(res?.results || []);
    setSummary(res?.summary || { total_debits: 0, total_credits: 0 });

  } catch (err: any) {
    console.error("Transaction error:", err);

    alert(
      err?.response?.data?.message ||
      err?.message ||
      "Failed to load transactions"
    );

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

const filteredVendors = useMemo(() => {
  return vendors.filter((v) => {
    const nameMatch = v.business_name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const isActive = v?.account_status === "active";

    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "active" && isActive) ||
      (statusFilter === "inactive" && !isActive);

    return nameMatch && statusMatch;
  });
}, [vendors, search, statusFilter]);

const handleFundWallet = async () => {
  if (!vendorsId || !amount) return;

  setFunding(true);

  try {
    await fundVendorWallet({
      vendor: vendorsId,
      amount: Number(amount),
    });

    alert("✅ Wallet funded successfully");

    setOpenFund(false);
    setAmount("");
    loadTransactions(vendorsId); // refresh

  } catch (err: any) {
    alert(
  err?.response?.data?.message ||
  err?.message ||
  "❌ Funding failed"
);
  } finally {
    setFunding(false);
  }
};

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
              sx={{ height: 36, textTransform: "none", borderRadius: 2 }}
            >
              Refresh
            </Button>
          <Button size="small" variant="outlined" sx={{ height: 36, textTransform: "none", borderRadius: 2 }} startIcon={<FileDownload />}>
            Export CSV
          </Button>
          {/* <Button size="small" onClick={() => setOpenFund(true)} sx={{ height: 36, textTransform: "none", borderRadius: 2 }} variant="contained">
            + Fund Wallet
          </Button> */}
        </Stack>
      </Stack>
      {/* SUMMARY */}
          <Grid pb={2} container spacing={2}>
              {[
                { title: "Total Wallet Balance", value:  selectedVendor?.wallet?.balance, color: "#2563eb" },
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
      <Grid container spacing={3}>
        {/* SIDEBAR */}
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <Box p={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={600}>Select Vendor</Typography>
                <Typography fontSize={12} color="gray">
                  {vendors?.length || 0} total
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

  {filteredVendors?.map((v) => {
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
                width: 36,
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
  })}
</Stack>
            </Box>
          </Card>
        </Grid>

        {/* MAIN */}
        <Grid item xs={12} md={9}>
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
                  ₦{Number(totalBalance || 0).toLocaleString()}
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

                    {/* <ResponsiveContainer width="100%" height={220}>
                      <ReBarChart data={transactions}>
                        <XAxis dataKey="transaction_ref" hide />
                        <Tooltip />
                        <Bar dataKey="credit_amount" />
                      </ReBarChart>
                    </ResponsiveContainer> */}

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
    SelectProps={{ native: true }}
    sx={{
      width: 120,
      "& .MuiOutlinedInput-root": {
        height: 34,
        fontSize: 12,
        bgcolor: "#f9fafb",
      },
    }}
  >
    <option>All Types</option>
  </TextField>

 <TextField
  size="small"
  type="date"
  value={startDate}
  onChange={(e) => {
    if (e.target.value <= endDate) {
      setStartDate(e.target.value);
    } else {
      alert("Start date cannot be after end date");
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
      alert("End date cannot be before start date");
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
  {transactions.map((tx) => (
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
    </Box>
  );
};

export default VendorTransactions;