import React, { useRef, useState } from "react";
import {
  Box, Grid, Card, Typography, TextField, Button,
  InputAdornment, Paper, Stack, Chip, Divider,
  LinearProgress, Avatar,   MenuItem,
  FormControl,
  Select,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from "@mui/material";
import { CalendarToday, Search } from "@mui/icons-material";

const fmt = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });

/* ---------------- MOCK DATA ---------------- */

const customers = [
  {
    id: "1",
    name: "Chidi Nwosu",
    account_number: "04201234567",
    meter_number: "5416234590",
    phone: "+2347031234567",
    city: "Port Harcourt",
    email: "chidi.nwosu@gmail.com",
    category: "Standard",
    debts: [
  {
    id: "d1",
    title: "MD Industrial Arrears",
    amount: 50500,
    original: 59500,
    recovered: 9000,
    progress: 15,
    status: "active",
    plan: "Bi-Monthly Instalment",
    code: "BMI-IND",
    effective: "2025-09-01",
    rate: "2.5% per cycle",
    lastDeduction: "Mar 1, 2026",
    description: "Manufacturing plant MD arrears",
		recent: [
    {
      title: "Bi-monthly deduction",
      code: "DBT-20260301-005",
      amount: -3000,
      date: "Mar 1, 2026"
    },
    {
      title: "Bi-monthly deduction",
      code: "DBT-20260101-005",
      amount: -3000,
      date: "Jan 1, 2026"
    },
    {
      title: "First deduction — plan activation",
      code: "DBT-20251101-005",
      amount: -3000,
      date: "Nov 1, 2025"
    }
  ]
  },
  {
    id: "d2",
    title: "Meter Tamper Fine",
    amount: 25000,
    status: "suspended",
    plan: "Monthly Instalment",
    code: "MI-STD",
    effective: "2026-03-01"
  }
]
  }
];

/* ---------------- COMPONENT ---------------- */

export default function DebtManager() {
  const [meter, setMeter] = useState("");
  const [account, setAccount] = useState("");
  const [customer, setCustomer] = useState<any>(null);

  const detailsRef = useRef<any>(null);

  /* ---------------- SEARCH ---------------- */
const [debtType, setDebtType] = useState("");
const [paymentPlan, setPaymentPlan] = useState("monthly");
const [expandedDebt, setExpandedDebt] = useState<string | null>("d1");

  const handleSearch = () => {
    const found = customers.find(
      (c) =>
        (meter && c.meter_number.includes(meter)) ||
        (account && c.account_number.includes(account))
    );

    setCustomer(found || null);

    if (found) {
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
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
    <Box sx={{background: "#f4f6fb", minHeight: "100vh" }}>

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

        <Button variant="outlined"  sx={{ height: 36, textTransform: "none", borderRadius: 2 }}>
          Refresh
        </Button>
      </Stack>

      {/* KPI */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: "TOTAL CUSTOMERS WITH DEBT", value: "312,450", color: "#ef4444" },
          { label: "TOTAL OUTSTANDING DEBT", value: "₦4.8B", color: "#f59e0b" },
          { label: "RECOVERED THIS MONTH", value: "₦88.4M", color: "#10b981" },
          { label: "DEBTS CREATED", value: "1,247", color: "#8b5cf6" }
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
          <Grid item xs={12} md={5}>
						<Typography fontWeight={100}>
          Meter Number
        </Typography>
            <TextField
              fullWidth
              placeholder="e.g. 54160893710"
              value={meter}
              onChange={(e) => {
                setMeter(e.target.value);
                setAccount("");
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
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

          <Grid item xs={12} md={5}>
						<Typography fontWeight={100}>
          Account Number
        </Typography>
            <TextField
              fullWidth
              placeholder="e.g. 04290193847"
              value={account}
              onChange={(e) => {
                setAccount(e.target.value);
                setMeter("");
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
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
              onClick={handleSearch}
              sx={{
								top:36,
                height: 36,
                borderRadius: 2,
                background: "linear-gradient(135deg,#0a1628,#1e4fd8)",
                color: "#fff"
              }}
            >
              Find Customer
            </Button>
						<div style={{marginTop:36,fontSize: "10.5px", color: "var(--text-light)"}}> Press <kbd>Enter</kbd> to search</div>
          </Grid>
        </Grid>

        {/* QUICK */}
        <Stack direction="row" spacing={1} mt={2}>
          {["54160893710", "04201234567"].map((v) => (
            <Chip
              key={v}
              label={v}
              onClick={() => quickFill(v, v.length > 10 ? "meter" : "account")}
            />
          ))}
        </Stack>
      </Card>

      {/* EMPTY STATE */}
      {!customer && (
        <Paper sx={{ p: 6, py:20, alignSelf:"center", textAlign: "center", borderRadius: 4 }}>
          <Stack maxWidth={400} alignItems={'center'}><Typography fontSize={18} fontWeight={600}>
            Search for a customer to begin
          </Typography>
          <Typography fontSize={13} color="#6b7a99">
            Enter a meter number or account number above. Once a customer is found, you can view, create or manage their debt records.
          </Typography></Stack>
        </Paper>
      )}

      {/* RESULT */}
      {customer && (
  <Grid container spacing={3} ref={detailsRef}>

    {/* LEFT */}
    <Grid item xs={12} md={8}>
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
              ["Phone", customer.phone],
              ["City", customer.city],
              ["Category", customer.category],
              ["Email", customer.email],
            ].map(([label, value]) => (
              <Stack direction="row" justifyContent="space-between" key={label}>
                <Typography fontSize={13} color="#6b7a99">{label}</Typography>
                <Typography fontSize={13} fontWeight={500}>{value}</Typography>
              </Stack>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* ACTIVE DEBT */}
          {customer.debts.map((d: any) => (
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
                  {fmt(d.amount)}
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={d.progress}
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
                    {d.progress}% repaid
                  </Typography>
                  <Typography fontSize={12} color="#94a3b8">
                    {fmt((d.progress / 100) * d.amount)} recovered
                  </Typography>
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between">
                  <Typography fontSize={12}>Plan</Typography>
                  <Typography fontSize={12} fontWeight={600}>
                    Bi-Monthly Instalment
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography fontSize={12}>Rate</Typography>
                  <Typography fontSize={12} fontWeight={600}>
                    2.5% per cycle
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography fontSize={12}>Last Deduction</Typography>
                  <Typography fontSize={12} color="#dc2626" fontWeight={600}>
                    Mar 1, 2026
                  </Typography>
                </Stack>
              </Stack>
            </Card>
          ))}

					<Button
          fullWidth
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
          + Create New Debt Record
        </Button>

        <Box mt={4}>

  {/* HEADER */}
  <Stack direction="row" justifyContent="space-between" mb={2}>
    <Typography fontWeight={700}>All Debt Records</Typography>
    <Typography fontSize={12} color="#6b7a99">
      {customer.debts.length} records
    </Typography>
  </Stack>

  {/* LIST */}
  <Stack spacing={2}>
    {customer.debts.map((d: any) => {
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
            onClick={() =>
              setExpandedDebt(isOpen ? null : d.id)
            }
            sx={{
              p: 2,
              cursor: "pointer"
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography fontWeight={600}>
                  {d.title}
                </Typography>
                <Typography fontSize={12} color="#6b7a99">
                  {d.plan} • {d.code} • Effective: {d.effective}
                </Typography>
              </Box>

              <Box textAlign="right">
                <Typography
                  fontWeight={800}
                  color="#dc2626"
                >
                  {fmt(d.amount)}
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
          {isOpen && d.original && (
            <Box sx={{ p: 2, pt: 0 }}>
              <Grid container spacing={2} mt={1}>

                {[
                  ["ORIGINAL BALANCE", fmt(d.original)],
                  ["RECOVERED", `${fmt(d.recovered)} (${d.progress}%)`, "#10b981"],
                  ["REMAINING", fmt(d.amount), "#dc2626"],
                  ["DEDUCTION RATE", d.rate],
                  ["LAST DEDUCTION", d.lastDeduction, "#dc2626"],
                  ["DESCRIPTION", d.description]
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
    {d.recent?.map((r: any, i: number) => (
      <Stack
        key={i}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          py: 1,
          borderBottom:
            i !== d.recent.length - 1 ? "1px solid #f1f5f9" : "none"
        }}
      >
        <Box>
          <Typography fontSize={13} fontWeight={500}>
            {r.title}
          </Typography>
          <Typography fontSize={11} color="#6b7a99">
            {r.code}
          </Typography>
        </Box>

        <Box textAlign="right">
          <Typography
            fontSize={13}
            fontWeight={700}
            color="#dc2626"
          >
            {fmt(r.amount)}
          </Typography>
          <Typography fontSize={11} color="#94a3b8">
            {r.date} billing cycle
          </Typography>
        </Box>
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

  <Button
    size="small"
    sx={{
      bgcolor: "#fee2e2",
      color: "#dc2626",
      borderRadius: 2,
      textTransform: "none"
    }}
  >
    ✓ Mark Settled
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
    <Grid item xs={12} md={4}>
      <Card sx={{ p: 3, borderRadius: 4 }}>
        <Typography fontWeight={800} mb={1}>
          Create New Debt Record
        </Typography>
        <Typography fontSize={12} color="#6b7a99" mb={2}>
          Fill in all fields — this debt will be automatically activated
        </Typography>

        {/* DEBT TYPE */}
        <FormControl fullWidth sx={{
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
            <MenuItem value="arrears">Industrial Arrears</MenuItem>
            <MenuItem value="meter">Meter Debt</MenuItem>
          </Select>
        </FormControl>

        {/* AMOUNT + RATE */}
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
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

        {/* DATE */}
        <TextField
          fullWidth
          type="date"
          label="Effective Date"
          InputLabelProps={{ shrink: true }}
           sx={{
    mt: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      fontSize: 13,
      height: 50,
      bgcolor: "#f9fafb",
    },
  }}
          // InputProps={{
          //   endAdornment: <CalendarToday fontSize="small" />
          // }}
        />

        {/* DESCRIPTION */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description / Notes"
          sx={{
    mt: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      fontSize: 13,
      height: 50,
      bgcolor: "#f9fafb",
    },
  }}
        />

        {/* PAYMENT PLAN (SINGLE SELECT) */}
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

  <RadioGroup
    value={paymentPlan}
    onChange={(e) => setPaymentPlan(e.target.value)}
  >
    {[
      {
        id: "mintrx",
        title: "Minimum Payment per Transaction",
        tag: "MINTRX",
        type: "Fixed",
        desc: "The minimum amount that will be charged on a transaction."
      },
      {
        id: "pctpay",
        title: "Percentage Payment on Transaction",
        tag: "PCTPAY",
        type: "Percentage",
        desc: "A percentage of the vending amount is taken at each transaction."
      },
      {
        id: "minmth",
        title: "Minimum Monthly Refund",
        tag: "MINRFD",
        type: "Fixed",
        desc: "Minimum amount to refund monthly."
      },
      {
        id: "mintrxrefund",
        title: "Minimum Refund per Transaction",
        tag: "RFDTX",
        type: "Fixed",
        desc: "Minimum refund applied per transaction."
      },
      {
        id: "oneoff",
        title: "Once-Off Full Refund",
        tag: "TOTRFD",
        type: "Fixed",
        desc: "Once-off full refund applied on the first transaction."
      },
      {
        id: "debtpct",
        title: "Debt Amount Percentage Payment",
        tag: "DAPPMT",
        type: "New Credit Policy",
        desc: "Step payments on amount range in percentage."
      }
    ].map((p) => {
      const selected = paymentPlan === p.id;

      return (
        <Box
          key={p.id}
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
            transition: "all 0.2s"
          }}
          onClick={() => setPaymentPlan(p.id)}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            
            <Radio
              value={p.id}
              checked={selected}
              sx={{
                mt: "-2px",
                p: 0.5,
                color: "#94a3b8",
                "&.Mui-checked": {
                  color: "#2563eb"
                }
              }}
            />

            <Box>
              <Typography fontSize={13} fontWeight={600}>
                {p.title}
              </Typography>

              <Stack direction="row" spacing={0.5} mt={0.5} alignItems="center">
                <Chip
                  label={p.tag}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 9,
                    bgcolor: "#e6f0ff",
                    color: "#2563eb"
                  }}
                />
                <Chip
                  label={p.type}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 9,
                    bgcolor: "#fef3c7",
                    color: "#92400e"
                  }}
                />
                <Typography fontSize={10} color="#6b7a99">
                  Per Transaction
                </Typography>
              </Stack>

              <Typography fontSize={11} color="#6b7a99" mt={0.3}>
                {p.desc}
              </Typography>
            </Box>
          </Stack>
        </Box>
      );
    })}
  </RadioGroup>
</FormControl>

        {/* BUTTON */}
        <Button
          fullWidth
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
          + Create Debt Record
        </Button>
      </Card>
    </Grid>

  </Grid>
)}
    </Box>
  );
}