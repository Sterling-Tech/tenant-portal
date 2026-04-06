import React, { useRef, useState } from "react";
import {
  Box, Grid, Card, Typography, TextField, Button,
  InputAdornment, Paper, Stack, Chip, Divider,
  LinearProgress, Avatar
} from "@mui/material";
import { Search } from "@mui/icons-material";

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
        type: "Commercial Arrears",
        amount: 42000,
        progress: 6,
        status: "active"
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
    <Box sx={{ p: 3, background: "#f4f6fb", minHeight: "100vh" }}>

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

        <Button variant="outlined" sx={{ borderRadius: 3 }}>
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

        <Typography fontWeight={700} mb={2}>
          Search by Meter Number or Account Number
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
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
              sx={{ background: "#f8f9fc", borderRadius: 3 }}
            />
          </Grid>

          <Grid item xs={12} md={5}>
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
              sx={{ background: "#f8f9fc", borderRadius: 3 }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              onClick={handleSearch}
              sx={{
                height: "100%",
                borderRadius: 3,
                background: "linear-gradient(135deg,#0a1628,#1e4fd8)",
                color: "#fff"
              }}
            >
              Find Customer
            </Button>
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
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 4 }}>
          <Typography fontSize={18} fontWeight={600}>
            Search for a customer to begin
          </Typography>
          <Typography fontSize={13} color="#6b7a99">
            Enter a meter number or account number above
          </Typography>
        </Paper>
      )}

      {/* RESULT */}
      {customer && (
        <Grid container spacing={3} ref={detailsRef}>

          {/* LEFT */}
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 4 }}>

              {/* HEADER */}
              <Box sx={{
                p: 3,
                color: "#fff",
                background: "linear-gradient(135deg,#0a1628,#1e4fd8)"
              }}>
                <Stack direction="row" spacing={2}>
                  <Avatar sx={{ bgcolor: "#1e4fd8" }}>CN</Avatar>

                  <Box>
                    <Typography fontWeight={800}>
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
                  <Chip label="active" color="success" size="small" />
                  <Chip label="postpaid" size="small" />
                  <Chip label="commercial" size="small" />
                </Stack>
              </Box>

              {/* DETAILS */}
              <Box p={3}>
                <Typography fontSize={13}>Phone: {customer.phone}</Typography>
                <Typography fontSize={13}>City: {customer.city}</Typography>
                <Typography fontSize={13}>Email: {customer.email}</Typography>

                <Divider sx={{ my: 2 }} />

                {/* ACTIVE DEBT */}
                {customer.debts.map((d: any) => (
                  <Card
                    key={d.id}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: "1px solid #fee2e2",
                      background: "#fff5f5"
                    }}
                  >
                    <Stack spacing={1}>
                      <Typography fontSize={24} fontWeight={800} color="#dc2626">
                        {fmt(d.amount)}
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={d.progress}
                      />

                      <Typography fontSize={12}>
                        {d.progress}% repaid
                      </Typography>
                    </Stack>
                  </Card>
                ))}
              </Box>
            </Card>
          </Grid>

          {/* RIGHT */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3, borderRadius: 4 }}>
              <Typography fontWeight={700}>
                Create New Debt Record
              </Typography>

              <TextField
                fullWidth
                label="Debt Amount"
                sx={{ mt: 2 }}
              />

              <TextField
                fullWidth
                label="Deduction Rate (%)"
                sx={{ mt: 2 }}
              />

              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                sx={{ mt: 2 }}
              />

              <Button
                fullWidth
                sx={{
                  mt: 3,
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: 3
                }}
              >
                Create Debt Record
              </Button>
            </Card>
          </Grid>

        </Grid>
      )}
    </Box>
  );
}