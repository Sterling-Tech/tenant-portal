import React, { useEffect, useRef, useState } from "react";
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
  Checkbox,
  CircularProgress
} from "@mui/material";
import { CalendarToday, Search } from "@mui/icons-material";
import { createDebt, fetchCustomerDebtAnalytic, fetchDebt, fetchDebtAnalytics, type VendorForm, fetchDebtHistory, fetchPaymentPlans, searchCustomers } from "../../services/vendorService";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const fmt = (n: Number) =>
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });

/* ---------------- COMPONENT ---------------- */
const DEBT_TYPES = [

  { label: "Payment", value: "payment" },
  // reversals
  { label: "Rreversal", value: "reversal" },
];

export default function DebtManager() {
  const [meter, setMeter] = useState("");
  const [account, setAccount] = useState("");
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [debts, setDebts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [customerAnalytic, setCustomerAnalytic] = useState<any>(null);
  const detailsRef = useRef<any>(null);
  const [historyMap, setHistoryMap] = useState<any>({});
  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [vendorForm, setVendorForm] = useState<Partial<VendorForm>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  /* ---------------- SEARCH ---------------- */
  const [debtType, setDebtType] = useState("");
  const [paymentPlan, setPaymentPlan] = useState<number[]>([]);
  const [expandedDebt, setExpandedDebt] = useState<string | null>("d1");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const infoBox = {
    fontSize: 12,
    color: "#374151",
    background: "#f1f5f9",
    padding: "10px 12px",
    borderRadius: 8,
    textAlign: "left"
  };
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetchDebtAnalytics();
      setAnalytics(res?.debt_summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const loadHistory = async (debtId: string) => {
    if (historyMap[debtId]) return;
    try {
      setLoading(true);
      const res = await fetchDebtHistory(debtId);

      setHistoryMap((prev: any) => ({
        ...prev,
        [debtId]: res?.results || []
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const validateDebtForm = () => {
    const newErrors: Record<string, string> = {};

    if (!debtType) {
      newErrors.debtType = "Debt type is required";
    }

    if (!amount) {
      newErrors.amount = "Amount is required";
    } else if (Number(amount) <= 0) {
      newErrors.amount = "Amount must be greater than zero";
    }

    if (!rate) {
      newErrors.rate = "Deduction rate is required";
    } else if (Number(rate) <= 0) {
      newErrors.rate = "Rate must be greater than zero";
    }

    if (!date) {
      newErrors.date = "Effective date is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (paymentPlan.length === 0) {
      newErrors.paymentPlan = "Select at least one payment plan";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // const handleCreateDebt = async () => {
  //   try {
  //     if (!customer) return;

  //     setCreating(true);

  //     await createDebt({
  //       customer: customer.id,
  //       description,
  //       payment_plan: Number(paymentPlan), // now using code
  //       effective_date: date,
  //       rate: Number(rate),
  //       debt_type: debtType,
  //       amount: Number(amount),
  //     });

  //     setSuccessMsg("Debt created successfully");

  //     const debtRes = await fetchDebt(customer.id);
  //     setDebts(debtRes || []);

  //     setVendorForm({
  //       business_name: "",
  //       email: "",
  //       phone_number: "",
  //       address: "",
  //       city: "",
  //       state: "",
  //       country: "",
  //       postal_code: "",
  //       hierachy: "",
  //       related_vendor: undefined,
  //     });

  //     setErrors({});

  //   } catch (err) {
  //     console.error(err);
  //     setErrorMsg("Failed to create debt");
  //   } finally {
  //     setCreating(false);
  //   }
  // };

  const handleCreateDebt = async () => {
    const isValid = validateDebtForm();

    if (!isValid) return;

    try {
      setCreating(true);

      await createDebt({
        customer: customer.id,
        description,
        payment_plan: paymentPlan[0], // or whatever API expects
        effective_date: date,
        rate: Number(rate),
        debt_type: debtType,
        amount: Number(amount),
      });

      setSuccessMsg("Debt created successfully");

      // Clear form
      setDebtType("");
      setAmount("");
      setRate("");
      setDate("");
      setDescription("");
      setPaymentPlan([]);
      setErrors({});

    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
        "Failed to create debt"
      );
    } finally {
      setCreating(false);
    }
  };
  const handleSearch = async () => {
    try {
      setLoading(true);

      if (!search.trim()) return;

      const res = await searchCustomers(search);
      const found = res?.results?.[0];

      if (!found) {
        setCustomer(null);
        setDebts([]);
        return;
      }

      setCustomer(found);

      const debtRes = await fetchDebt(found.id);
      setDebts(debtRes || []);

      const analyticRes = await fetchCustomerDebtAnalytic(found.id);
      setCustomerAnalytic(analyticRes);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (val: string, type: "meter" | "account") => {
    if (type === "meter") {
      setMeter(val);
      setAccount("");
    } else {
      setAccount(val);
      setMeter("");
    }
    setTimeout(handleSearch, 200);
  };


  /* ---------------- UI ---------------- */

  return (
    <Box sx={{ background: "#f4f6fb", minHeight: "100vh" }}>

      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 800 }}>
            Customer Debt Manager
          </Typography>
          <Typography fontSize={13} color="#6b7a99">
            Search for a customer by meter number or account number
          </Typography>
        </Box>

        <Button variant="outlined" sx={{ height: 36, textTransform: "none", borderRadius: 2 }}
          // onClick={() => {
          //   loadAnalytics();
          //   setSearch("");
          // }}
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
            label: "TOTAL OUTSTANDING DEBT",
            value: fmt(analytics?.total_outstanding_debts || 0),
            color: "#f59e0b"
          },
          {
            label: "RECOVERED THIS MONTH",
            value: fmt(analytics?.recovered_this_month || 0),
            color: "#10b981"
          },
          {
            label: "DEBTS CREATED",
            value: analytics?.total_debts || 0,
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
      <Card sx={{ p: 3, borderRadius: 4, mb: 3 }}>
        <Typography fontSize={12} color="#6b7a99">
          STEP 1 — FIND CUSTOMER
        </Typography>

        <Typography fontWeight={700} mb={1}>
          Search by Meter Number or Account Number
        </Typography>

        <Typography fontWeight={100} mb={2} >
          Enter a meter number or account number to load the customer. You can then view their existing debt or create a new one.
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Enter meter number or account number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                  height: 45,
                  bgcolor: "#f9fafb",
                },
              }}
            />
          </Grid>

          <Grid item direction={'column'} xs={12} md={2}>
            <Button
              fullWidth
              onClick={handleSearch}
              sx={{
                top: 13,
                height: 45,
                borderRadius: 2,
                background: "linear-gradient(135deg,#0a1628,#1e4fd8)",
                color: "#fff"
              }}
            >
              Find Customer
            </Button>
            <div style={{ marginTop: 15, fontSize: "10.5px", color: "var(--text-light)" }}> Press <kbd>Enter</kbd> to search</div>
          </Grid>


        </Grid>
      </Card>

      {/* RESULT */}

      {loading ? (
        <Box py={3} textAlign="center">
          <CircularProgress size={35} />
        </Box>
      ) : customer ? (

        <Grid container spacing={3} ref={detailsRef}>

          {/* LEFT */}
          <Grid item xs={12} md={12}>
            <Card sx={{ borderRadius: 4, overflow: "hidden" }}>

              {/* HEADER */}
              <Box sx={{
                p: 3,
                color: "#fff",
                background: "linear-gradient(135deg,#0a1628,#1e4fd8)"
              }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "#ffffff22", fontWeight: 700 }}>
                    {customer.name?.[0]}
                  </Avatar>

                  <Box>
                    <Typography fontWeight={800} fontSize={18}>
                      {customer.name}
                    </Typography>
                    <Typography fontSize={12}>
                      Acct: {customer.account_number}
                    </Typography>
                    <Typography fontSize={12}>
                      Meter: {customer.meter_number}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} mt={2}>
                  <Chip label="active" size="small" sx={{ bgcolor: "#10b981", color: "#fff" }} />
                  <Chip label="postpaid" size="small" sx={{ bgcolor: "#f59e0b", color: "#fff" }} />
                  <Chip label="industrial" size="small" sx={{ bgcolor: "#64748b", color: "#fff" }} />
                </Stack>
              </Box>

              {/* DETAILS */}
              <Box p={3}>
                <Stack spacing={1.5}>
                  {[
                    // ["Phone", customer.phone],
                    // ["City", customer.city],
                    ["Category", customer.category],
                    ["Token", customer.token],
                  ].map(([label, value]) => (
                    <Stack direction="row" justifyContent="space-between" key={label}>
                      <Typography fontSize={13} color="#6b7a99">{label}</Typography>
                      <Typography fontSize={13} fontWeight={500}>{value}</Typography>
                    </Stack>
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* ACTIVE DEBT */}
                {debts.map((d: any) => (
                  <Card
                    key={d.id}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: "1px solid #fecaca",
                      background: "#fff1f2"
                    }}
                  >
                    <Stack spacing={1}>
                      <Typography fontSize={11} color="#b91c1c">
                        ACTIVE DEBT
                      </Typography>

                      <Typography fontSize={30} fontWeight={900} color="#dc2626">
                        {fmt(Number(d.balance))}
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={
                          customerAnalytic
                            ? (customerAnalytic.recovered_debt /
                              (customerAnalytic.recovered_debt +
                                customerAnalytic.remaining_debt)) *
                            100
                            : 0
                        }
                        sx={{
                          height: 6,
                          borderRadius: 10,
                          background: "#fee2e2",
                          "& .MuiLinearProgress-bar": {
                            background: "#10b981"
                          }
                        }}
                      />

                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontSize={12} color="#10b981">
                          {
                            customerAnalytic
                              ? (customerAnalytic.recovered_debt /
                                (customerAnalytic.recovered_debt +
                                  customerAnalytic.remaining_debt)) *
                              100
                              : 0
                          }% repaid
                        </Typography>
                        <Typography fontSize={12} color="#10b981">
                          {customerAnalytic?.recovered_debt || 0} recovered
                        </Typography>

                        <Typography fontSize={12} color="#94a3b8">
                          {fmt(customerAnalytic?.remaining_debt || 0)} remaining
                        </Typography>
                      </Stack>

                      <Divider />

                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontSize={12}>Plan</Typography>
                        <Typography fontSize={12} fontWeight={600}>
                          {d.payment_plan?.name}
                        </Typography>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontSize={12}>Rate</Typography>
                        <Typography fontSize={12} fontWeight={600}>
                          {d.rate}% per cycle
                        </Typography>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontSize={12}>Last Deduction</Typography>
                        <Typography fontSize={12} color="#dc2626" fontWeight={600}>
                          {d.last_debit
                            ? new Date(d.last_debit).toLocaleDateString()
                            : "—"}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                ))}

                <Box mt={4}>

                  {/* HEADER */}
                  <Stack direction="row" justifyContent="space-between" mb={2}>
                    <Typography fontWeight={700}>All Debt Records</Typography>
                    <Typography fontSize={12} color="#6b7a99">
                      {debts.length} records
                    </Typography>
                  </Stack>

                  {/* LIST */}
                  <Stack spacing={2}>
                    {debts.map((d: any) => {
                      const isOpen = expandedDebt === d.id;

                      return (
                        <Card
                          key={d.id}
                          sx={{
                            borderRadius: 3,
                            border: "1px solid #e5e7eb",
                            overflow: "hidden"
                          }}
                        >
                          {/* TOP ROW */}
                          <Box
                            onClick={() => {
                              setExpandedDebt(isOpen ? null : d.id);
                              if (!isOpen) loadHistory(d.id);
                            }}
                            sx={{
                              p: 2,
                              cursor: "pointer"
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between">
                              <Box>
                                <Typography fontWeight={600}>
                                  {d.description}
                                </Typography>
                                <Typography fontSize={12} color="#6b7a99">
                                  {d.payment_plan?.name} • {d.payment_plan?.code} • Effective: {d.effective_date}
                                </Typography>
                              </Box>

                              <Box textAlign="right">
                                <Typography
                                  fontWeight={800}
                                  color="#dc2626"
                                >
                                  {fmt(Number(d.balance))}
                                </Typography>

                                <Chip
                                  label={d.status}
                                  size="small"
                                  sx={{
                                    mt: 0.5,
                                    bgcolor:
                                      d.status === "active"
                                        ? "#fee2e2"
                                        : "#fef3c7",
                                    color:
                                      d.status === "active"
                                        ? "#dc2626"
                                        : "#b45309"
                                  }}
                                />
                              </Box>
                            </Stack>
                          </Box>

                          {/* EXPANDED */}
                          {isOpen && (
                            <Box sx={{ p: 2, pt: 0 }}>
                              <Grid container spacing={2} mt={1}>

                                {
                                  [
                                    ["BALANCE", fmt(Number(d.balance))],
                                    ["RATE", `${d.rate}%`],
                                    ["PAYMENT PLAN", d.payment_plan?.name],
                                    ["CODE", d.payment_plan?.code],
                                    ["RECOVERED", fmt(customerAnalytic?.recovered_debt || 0)],
                                    ["REMAINING", fmt(customerAnalytic?.remaining_debt || 0)],
                                    ["LAST DEDUCTION", customerAnalytic?.last_deduction
                                      ? new Date(customerAnalytic.last_deduction).toLocaleDateString()
                                      : "—"],
                                  ].map(([label, val, color], i) => (
                                    <Grid item xs={12} md={4} key={i}>
                                      <Box
                                        sx={{
                                          p: 2,
                                          borderRadius: 2,
                                          border: "1px solid #e5e7eb",
                                          bgcolor: "#f9fafb"
                                        }}
                                      >
                                        <Typography fontSize={10} color="#6b7a99">
                                          {label}
                                        </Typography>
                                        <Typography
                                          fontWeight={700}
                                          color={color || "#111827"}
                                        >
                                          {val}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  ))}
                              </Grid>
                              {/* RECENT DEDUCTIONS */}
                              <Box mt={3}>
                                <Typography fontSize={11} fontWeight={600} color="#6b7a99" mb={1}>
                                  RECENT DEDUCTIONS
                                </Typography>

                                <Stack spacing={0}>

                                  {(historyMap[d.id] || []).map((r: any, i: number) => (
                                    <Stack
                                      key={i}
                                      direction="row"
                                      justifyContent="space-between"
                                      sx={{
                                        py: 1,
                                        borderBottom:
                                          i !== (historyMap[d.id]?.length || 0) - 1 ? "1px solid #f1f5f9" : "none"
                                      }}
                                    >
                                      <Box>
                                        <Typography fontSize={12} fontWeight={500}>
                                          {r.transaction_ref}
                                        </Typography>
                                        <Typography fontSize={10} color="#6b7a99">
                                          {new Date(r.timestamp).toLocaleString()}
                                        </Typography>
                                      </Box>

                                      <Typography fontWeight={700} color="#dc2626">
                                        {fmt(Number(r.amount_paid))}
                                      </Typography>
                                    </Stack>
                                  ))}
                                </Stack>
                              </Box>

                              {/* ACTION BUTTONS */}
                              <Stack direction="row" spacing={1} mt={2}>
                                <Button
                                  size="small"
                                  sx={{
                                    border: "1px solid #e5e7eb",
                                    color: "#111827",
                                    borderRadius: 2,
                                    textTransform: "none"
                                  }}
                                >
                                  ✏ Edit
                                </Button>

                                <Button
                                  size="small"
                                  sx={{
                                    bgcolor: "#fef3c7",
                                    color: "#92400e",
                                    borderRadius: 2,
                                    textTransform: "none"
                                  }}
                                >
                                  ⏸ Suspend
                                </Button>
                              </Stack>


                            </Box>
                          )}
                        </Card>
                      );
                    })}
                  </Stack>
                </Box>


              </Box>
            </Card>
          </Grid>

          {/* RIGHT */}
          {/* <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, borderRadius: 4 }}>
              <Typography fontWeight={800} mb={1}>
                Create New Debt Record
              </Typography>
              <Typography fontSize={12} color="#6b7a99" mb={2}>
                Fill in all fields — this debt will be automatically activated
              </Typography>

              <FormControl
                fullWidth
                error={!!errors.debtType}
                sx={{
                  mt: 2,
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontSize: 13,
                    height: 50,
                    bgcolor: "#f9fafb",
                  },
                }}>
                <InputLabel>Select debt type</InputLabel>
                <Select
                  value={debtType}
                  label="Debt Type"
                  onChange={(e) => setDebtType(e.target.value)}
                >
                  {DEBT_TYPES.map((d) => (
                    <MenuItem key={d.value} value={d.value}>
                      {d.label} ({d.value})
                    </MenuItem>
                  ))}
                </Select>
                {errors.debtType && (
                  <Typography
                    color="error"
                    fontSize={12}
                    mt={0.5}
                  >
                    {errors.debtType}
                  </Typography>
                )}
              </FormControl>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);

                    setErrors(prev => ({
                      ...prev,
                      amount: ""
                    }));
                  }}
                  error={!!errors.amount}
                  helperText={errors.amount}
                  label="Debt Amount (₦)"
                  placeholder="e.g. 15000"
                  sx={{

                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      fontSize: 13,
                      height: 50,
                      bgcolor: "#f9fafb",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Deduction Rate (%)"
                  value={rate}
                  onChange={(e) => {
                    setRate(e.target.value);
                    setErrors(pre => ({
                      ...pre,
                      rate: ""
                    }))
                  }}
                  error={!!errors.rate}
                  helperText={errors.rate}
                  placeholder="e.g. 5"
                  sx={{

                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      fontSize: 13,
                      height: 50,
                      bgcolor: "#f9fafb",
                    },
                  }}
                />
              </Stack>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Effective Date"
                  value={date ? dayjs(date) : null}
                  onChange={(newValue) => {
                    setDate(newValue ? newValue.format("YYYY-MM-DD") : "");
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date,
                      helperText: errors.date,
                      sx: {
                        mt: 2,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          height: 50,
                          fontSize: 13,
                          bgcolor: "#f9fafb",
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>

              <TextField
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  setErrors(prev => ({
                    ...prev,
                    description: ""
                  }))
                }}
                error={!!errors.description}
                helperText={errors.description}
                label="Description / Notes"
                InputLabelProps={{ shrink: true }}
                sx={{
                  mt: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontSize: 13,
                    bgcolor: "#f9fafb",
                    alignItems: "center", 
                    paddingTop: "8px",
                    paddingBottom: "8px",
                  },
                  "& textarea": {
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              />


              <FormControl sx={{

                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                  mt: 3,
                  mb: 3,
                  width: "100%",
                  bgcolor: "#f9fafb",
                },
              }}>
                <Typography fontSize={13} fontWeight={700} mt={1.5} mb={1.5}>
                  Payment Plan
                </Typography>

                {paymentPlans.map((p) => {
                  const selected = paymentPlan.includes(p.id);

                  const togglePlan = () => {
                    setPaymentPlan((prev) =>
                      prev.includes(p.id)
                        ? prev.filter((id) => id !== p.id)
                        : [...prev, p.id]
                    );
                  };

                  return (
                    <Box
                      key={p.id}
                      onClick={togglePlan}
                      sx={{
                        border: selected
                          ? "2px solid #2563eb"
                          : "1px solid #e5e7eb",
                        borderRadius: 3,
                        px: 1.5,
                        py: 1.2,
                        mb: 1,
                        cursor: "pointer",
                        bgcolor: selected ? "#f0f7ff" : "#fff",
                        transition: "all 0.2s",
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <Checkbox
                          checked={selected}
                          onChange={(e) => {
                            e.stopPropagation(); 
                            togglePlan();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            mt: "-2px",
                            p: 0.5,
                            color: "#94a3b8",
                            "&.Mui-checked": {
                              color: "#2563eb",
                            },
                          }}
                        />

                        {errors.paymentPlan && (
                          <Typography
                            color="error"
                            fontSize={12}
                            mt={1}
                          >
                            {errors.paymentPlan}
                          </Typography>
                        )}
                        <Box>
                          <Typography fontSize={13} fontWeight={600}>
                            {p.name}
                          </Typography>

                          <Stack direction="row" spacing={0.5} mt={0.5}>
                            <Chip
                              label={p.code}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: 9,
                                bgcolor: "#e6f0ff",
                                color: "#2563eb",
                              }}
                            />
                            <Typography fontSize={10} color="#6b7a99">
                              Per Transaction
                            </Typography>
                          </Stack>

                          <Typography fontSize={11} color="#6b7a99" mt={0.3}>
                            {p.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  );
                })}
              </FormControl>


              <Button
                fullWidth
                onClick={handleCreateDebt}
                disabled={creating}
                sx={{
                  mt: 3,
                  background: "#dc2626",
                  color: "#fff",
                  borderRadius: 3,
                  fontWeight: 700,
                  py: 1.2,
                  "&:hover": {
                    background: "#b91c1c"
                  }
                }}
              >
                {creating ? <LinearProgress /> : "+ Create Debt Record"}
              </Button>
            </Card>
          </Grid> */}

        </Grid>
      ) : (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 4,
            background: "#f8fafc",
            border: "1px solid #e5e9f2"
          }}
        >
          <Search sx={{ fontSize: 28, color: "#6b7280" }} />
          The ledger shows the full payment story — every vend, debt deduction and refund by date and time
        </Paper>
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
  );
}