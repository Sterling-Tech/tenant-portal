import React, { useEffect, useRef, useState } from "react";
import {
	Box, Grid, Card, Typography, TextField, Button,
	InputAdornment, Paper, Stack, Chip, Divider,
	LinearProgress, Avatar,   MenuItem,
	FormControl,
	Select,
	InputLabel,
	RadioGroup,
	FormControlLabel,
	Snackbar,
	Alert,
	Radio
} from "@mui/material";
import { CalendarToday, Search } from "@mui/icons-material";
import { createDebt, fetchCustomerDebtAnalytic, fetchDebt, fetchDebtAnalytics, fetchDebtHistory, fetchPaymentPlans, searchCustomers } from "../../services/vendorService";

const fmt = (n: number) =>
	"₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });

/* ---------------- COMPONENT ---------------- */
const DEBT_TYPES = [
	{ label: "Arrears", value: "ARREAR" },
	{ label: "Main Arrears", value: "MANARR" },
	{ label: "Arrears Merged", value: "ARRMER" },
	{ label: "Debt Migration", value: "DEBMIG" },
	{ label: "Debt Migration Percentage", value: "DEBPCT" },
	{ label: "Risk Debt Migration", value: "RISKDM" },
	{ label: "Reconnection Charge Initial Payment", value: "RECCIP" },
	{ label: "Penalty Monthly Instalment", value: "PENAMI" },
	{ label: "Penalty Initial Payment", value: "PENAIP" },
	{ label: "Accumulated FC Migration", value: "AFCMIG" },
	{ label: "Meter Fees", value: "METFEE" },
	{ label: "Accumulated Fixed Charge", value: "ACCUFC" },
	{ label: "Loss of Revenue Monthly Instalment", value: "LOSSRM" },
	{ label: "Loss of Revenue Initial Payment", value: "LOSSRI" },
	{ label: "Fixed Charge", value: "FIXEDC" },
	{ label: "Tariff Difference", value: "TARDIF" },
	{ label: "Administrative Charges", value: "ADMCHA" },
	{ label: "Reversal Debt", value: "REVDBT" },

	// reversals
	{ label: "Debt Refund", value: "DEBREF" },
	{ label: "Meter Cost Refund", value: "MECREF" },
	{ label: "MAP Refund", value: "MAPREF" }
];
export default function CustomerTrans() {
	const [meter, setMeter] = useState("");
	const [account, setAccount] = useState("");
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
	/* ---------------- SEARCH ---------------- */
	const [debtType, setDebtType] = useState("");
	const [paymentPlan, setPaymentPlan] = useState("");
	const [expandedDebt, setExpandedDebt] = useState<string | null>("d1");
	const [amount, setAmount] = useState("");
	const [rate, setRate] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState("");


const loadAnalytics = async () => {
	try {
		const res = await fetchDebtAnalytics();
		setAnalytics(res?.debt_summary);
	} catch (err) {
		console.error(err);
	}
};
const loadPaymentPlans = async () => {
	try {
		const res = await fetchPaymentPlans();
		setPaymentPlans(res || []);
	} catch (err) {
		console.error(err);
	}
};

useEffect(() => {
	loadAnalytics();
	loadPaymentPlans();
}, []);

const infoBox = {
  fontSize: 12,
  color: "#374151",
  background: "#f1f5f9",
  padding: "10px 12px",
  borderRadius: 8,
  textAlign: "left"
};

const loadHistory = async (debtId: string) => {
	if (historyMap[debtId]) return;

	const res = await fetchDebtHistory(debtId);

	setHistoryMap((prev: any) => ({
		...prev,
		[debtId]: res?.results || []
	}));
};

useEffect(() => {
	loadAnalytics();
}, []);



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
			setLoading(true);

			const keyword = meter || account;

			if (!keyword) return;

			// 🔹 search customer
			const res = await searchCustomers(keyword);
			const found = res?.results?.[0];

			if (!found) {
				setCustomer(null);
				return;
			}

			setCustomer(found);

			// 🔹 fetch debts
			const debtRes = await fetchDebt(found.id);
			setDebts(debtRes || []);

			// 🔹 fetch analytic
			const analyticRes = await fetchCustomerDebtAnalytic(found.id);
			setCustomerAnalytic(analyticRes);

			setTimeout(() => {
				detailsRef.current?.scrollIntoView({ behavior: "smooth" });
			}, 200);

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
		<Box sx={{background: "#f4f6fb", minHeight: "100vh" }}>

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

				<Button variant="outlined"  sx={{ height: 36, textTransform: "none", borderRadius: 2 }}>
					Refresh
				</Button>
			</Stack>

			{/* KPI */}
			<Grid container spacing={2} mb={3}>
				{[
	{
		label: "Total Customers",
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
    p: 4,
    borderRadius: 4,
    mb: 3,
    background: "#f8fafc",
    border: "1px solid #e5e9f2"
  }}
>
  {/* TITLE */}
  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
    <Search sx={{ fontSize: 18, color: "#2563eb" }} />
    <Typography fontWeight={700} fontSize={16}>
      Find a Customer
    </Typography>
  </Stack>

  {/* DESCRIPTION */}
  <Typography fontSize={12.5} color="#6b7280" mb={3}>
    Enter either the customer's meter number (KCT1 or KCT2) or their account number
    to retrieve their full financial record. Searching both fields simultaneously
    is not supported — use one at a time.
  </Typography>

  {/* INPUTS */}
  <Grid container spacing={2} alignItems="center">
    {/* METER */}
    <Grid item xs={12} md={5}>
      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
        <Typography fontSize={11} color="#6b7280" fontWeight={600}>
          METER NUMBER
        </Typography>
        <Chip
          label="KCT1 OR KCT2"
          size="small"
          sx={{
            height: 18,
            fontSize: 9,
            bgcolor: "#e0e7ff",
            color: "#3730a3"
          }}
        />
      </Stack>

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
              <Search sx={{ fontSize: 18, color: "#9ca3af" }} />
            </InputAdornment>
          )
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            fontSize: 13,
            height: 48,
            bgcolor: "#fff"
          }
        }}
      />
    </Grid>

    {/* OR */}
    <Grid item xs={12} md={1}>
      <Typography
        textAlign="center"
        fontSize={12}
        color="#9ca3af"
        fontWeight={600}
      >
        OR
      </Typography>
    </Grid>

    {/* ACCOUNT */}
    <Grid item xs={12} md={4}>
      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
        <Typography fontSize={11} color="#6b7280" fontWeight={600}>
          ACCOUNT NUMBER
        </Typography>
        <Chip
          label="ACCOUNT NO"
          size="small"
          sx={{
            height: 18,
            fontSize: 9,
            bgcolor: "#e0e7ff",
            color: "#3730a3"
          }}
        />
      </Stack>

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
              <Search sx={{ fontSize: 18, color: "#9ca3af" }} />
            </InputAdornment>
          )
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            fontSize: 13,
            height: 48,
            bgcolor: "#fff"
          }
        }}
      />
    </Grid>

    {/* BUTTONS */}
    <Grid item xs={12} md={2}>
      <Stack direction="row" spacing={1}>
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
            "&:hover": {
              background: "#1e40af"
            }
          }}
        >
          Search
        </Button>

        <Button
          onClick={() => {
            setMeter("");
            setAccount("");
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
    </Grid>
  </Grid>

  {/* FOOTNOTE */}
  <Stack direction="row" spacing={2} mt={2}>
    <Typography fontSize={11} color="#9ca3af">
      Press <kbd style={{ background: "#eee", padding: "2px 6px", borderRadius: 4 }}>Enter</kbd> to search
    </Typography>
    <Typography fontSize={11} color="#9ca3af">• One field at a time</Typography>
    <Typography fontSize={11} color="#9ca3af">• Exact match required</Typography>
  </Stack>
</Card>

			{/* EMPTY STATE */}
			{/* EMPTY STATE */}
{!customer && (
  <Paper
    sx={{
      p: 8,
      textAlign: "center",
      borderRadius: 4,
      background: "#f8fafc",
      border: "1px solid #e5e9f2"
    }}
  >
    <Stack alignItems="center" spacing={2}>
      {/* ICON BOX */}
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: 3,
          background: "#e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Search sx={{ fontSize: 28, color: "#6b7280" }} />
      </Box>

      {/* TITLE */}
      <Typography fontSize={18} fontWeight={700}>
        Search
      </Typography>

      {/* DESCRIPTION */}
      {/* <Typography fontSize={13} color="#6b7280" maxWidth={420}>
        Enter a meter number or account number above to pull up a customer's
        complete financial record from the 1.7 million registered accounts.
      </Typography> */}

      {/* INFO CARDS */}
      {/* <Stack spacing={1.5} mt={2} width="100%" maxWidth={420}>
        <Box sx={infoBox}>
          Use the <b>meter number (KCT1 or KCT2)</b> — fastest and most direct lookup
        </Box>

        <Box sx={infoBox}>
          Use the <b>account number</b> if the customer has misplaced their meter card
        </Box>

        <Box sx={infoBox}>
          The ledger shows the full payment story — every vend, debt deduction and refund by date and time
        </Box>
      </Stack> */}
    </Stack>
  </Paper>
)}

			{/* RESULT 
			// 🔥 PIXEL-PERFECT UPGRADE (MATCHES YOUR DESIGN)
// Replace ONLY your RESULT section with this*/}
{customer && (
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
                Acct: {customer.account_number} • KCT1: {customer.meter_number} • KCT2: {customer.meter_number}
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
          >
            ✕ New Search
          </Button>

        </Stack>
      </Box>

      {/* ===== SUMMARY STRIP ===== */}
      <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #eee", background: "#fafafa" }}>
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
      </Box>

      {/* ===== KPI ROW ===== */}
      <Grid container>

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

      </Grid>

      {/* ===== TABS ===== */}
      <Box sx={{ px: 3, pt: 2 }}>
        <Stack direction="row" spacing={3}>
          <Typography fontWeight={700} sx={{ borderBottom: "2px solid #2563eb", pb: 1 }}>Transaction History</Typography>
          <Typography fontWeight={600} color="#6b7280">Debt Account</Typography>
        </Stack>
      </Box>

      {/* ===== FILTER BAR ===== */}
      <Box sx={{ px: 3, py: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">

          <TextField
            size="small"
            placeholder="Search ref, description..."
            sx={{ width: 260 }}
          />

          <TextField select size="small" sx={{ width: 160 }}>
            <MenuItem>Filter by Type</MenuItem>
          </TextField>

          <TextField type="date" size="small" />
          <TextField type="date" size="small" />

          <Box flex={1} />

          <Button size="small" variant="outlined">⬇ Export CSV</Button>

        </Stack>
      </Box>

      {/* ===== TOTAL FILTERED ===== */}
      <Box textAlign="center" py={1}>
        <Typography fontSize={10} color="#6b7280">TOTAL AMOUNT PAID (FILTERED VIEW)</Typography>
        <Typography color="#dc2626" fontWeight={800}>{fmt(customerAnalytic?.recovered_debt || 0)}</Typography>
      </Box>

      {/* ===== TABLE ===== */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Stack spacing={1}>

          {historyMap[debts[0]?.id]?.map((r: any, i: number) => (
            <Box key={i} sx={{ p: 2, borderBottom: "1px solid #f1f5f9" }}>

              <Grid container alignItems="center">

                <Grid item xs={2}>
                  <Typography fontSize={12} color="#6b7280">{r.transaction_ref}</Typography>
                </Grid>

                <Grid item xs={5}>
                  <Typography fontSize={13} fontWeight={600}>Transaction</Typography>
                  <Typography fontSize={11} color="#6b7280">{new Date(r.timestamp).toLocaleString()}</Typography>
                </Grid>

                <Grid item xs={2}>
                  <Chip label="Postpaid Bill" size="small" />
                </Grid>

                <Grid item xs={2}>
                  <Typography color="#dc2626" fontWeight={700}>{fmt(Number(r.amount_paid))}</Typography>
                </Grid>

                <Grid item xs={1}>
                  <Chip label="success" size="small" sx={{ bgcolor: "#dcfce7", color: "#166534" }} />
                </Grid>

              </Grid>

            </Box>
          ))}

        </Stack>
      </Box>

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
	);
}