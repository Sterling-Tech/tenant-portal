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
} from "@mui/material";
import {
  Refresh,
  Search,
  FileDownload,
  AccountBalanceWallet,
  BarChart,
} from "@mui/icons-material";
import { useTenants } from "../../hooks/useTenants";
import { fetchTransactions, fetchVendors, Ledger, PaginatedLedgerResponse, Vendor } from "../../services/vendorService";
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
  const [summary, setSummary] = useState({
    total_debits: 0,
    total_credits: 0,
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "ledger">("analytics");

  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 14);

  const format = (d: Date) => d.toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(format(past));
  const [endDate, setEndDate] = useState(format(today));
  
  const load = async () => {
     const res = await fetchVendors({is_active: true});
  
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

  const loadTransactions = async (id: string) => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await fetchTransactions({
        vendor_id: id,
        start_date: startDate,
        end_date: endDate,
      });

      setTransactions(res.results || []);
      setSummary(res.summary || { total_debits: 0, total_credits: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedVendorId) setVendorId(selectedVendorId);
  }, [selectedVendorId]);

  useEffect(() => {
    if (vendorsId) loadTransactions(vendorsId);
  }, [vendorsId, startDate, endDate]);

 const totalCredits = summary.total_credits;
 const totalDebits = summary.total_debits;

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
          <Button size="small" sx={{ height: 36, textTransform: "none", borderRadius: 2 }} variant="contained">
            + Fund Wallet
          </Button>
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
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack mt={2} spacing={1}>
                {vendors?.map((v) => (
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
                      bgcolor:
                        vendorsId === v.id ? "#eff6ff" : "transparent",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontSize={14} fontWeight={500}>
                        {v.business_name}
                      </Typography>
                      <Typography fontSize={14} color="#10990b">
                        ₦{Math.floor(Math.random() * 100000)}
                      </Typography>
                    </Stack>
                   <Typography fontWeight={200}>{v.hierachy}</Typography>
                    {/* <Chip
                      label="Active"
                      size="small"
                      sx={{
                        mt: 1,
                        bgcolor: "#dcfce7",
                        color: "#16a34a",
                        fontSize: 11,
                      }}
                    /> */}
                  </Box>
                ))}
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
                  <Button size="small" variant="outlined">
                    View Profile
                  </Button>
                  <Button size="small" variant="contained">
                    + Fund
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

                <Button size="small" variant="outlined" sx={{ mt: 1 }}>
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
                      <ReBarChart data={transactions}>
                        <XAxis dataKey="transaction_ref" hide />
                        <Tooltip />
                        <Bar dataKey="credit_amount" />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                {/* LEDGER */}
                {activeTab === "ledger" && (
                  <Card sx={{ mt: 2, borderRadius: 3 }}>
                    <Box p={2}>
                      <Stack direction="row" spacing={2} mb={2}>
                        <TextField
                          size="small"
                          placeholder="Search ref, description..."
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        />

                        <TextField type="date" size="small" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <TextField type="date" size="small" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                        <Button variant="contained" onClick={() => vendorsId && loadTransactions(vendorsId)}>
                          Filter
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
    </Box>
  );
};

export default VendorTransactions;