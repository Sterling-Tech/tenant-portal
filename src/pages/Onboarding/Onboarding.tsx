
import React, { useState } from "react";
import {
  Box, Typography, Tabs, Tab, Card, CardContent, TextField,
  InputAdornment, Button, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Breadcrumbs,
  Link, Tooltip,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AddIcon from "@mui/icons-material/Add";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import OnboardingVendor from "../../components/OnboardingUser/OnboardingVendor";
import OnboardingSubVendor from "../../components/OnboardingUser/OnboardingSubVendor";
import OnboardingAgent from "../../components/OnboardingUser/OnboardingAgent";
import OnboardingCashier from "../../components/OnboardingUser/OnboardingCashier";
import OnboardingPOS from "../../components/OnboardingUser/OnboardingPOS";

// ─── Theme ──────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#0F2D6B" },
    success: { main: "#1A7F4B" },
    error: { main: "#C0392B" },
    background: { default: "#F5F7FA", paper: "#FFFFFF" },
    text: { primary: "#0D1B2A", secondary: "#6B7A8D" },
  },
  typography: {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    h4: { fontWeight: 700, letterSpacing: "-0.5px" },
    subtitle2: { fontWeight: 600, letterSpacing: "0.06em", fontSize: "0.7rem" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none", fontWeight: 500, fontSize: "0.9rem",
          minWidth: "unset", padding: "10px 4px", marginRight: 28,
          color: "#6B7A8D", "&.Mui-selected": { color: "#0F2D6B", fontWeight: 700 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.08em",
          color: "#9AA4B2", textTransform: "uppercase",
          borderBottom: "1px solid #E8ECF0", paddingTop: 10, paddingBottom: 10,
        },
        body: { borderBottom: "1px solid #F0F2F5", paddingTop: 14, paddingBottom: 14, fontSize: "0.875rem" },
      },
    },
    MuiCard: { styleOverrides: { root: { boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderRadius: 12 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, fontSize: "0.75rem", borderRadius: 20 } } },
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600, borderRadius: 8 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 14 } } },
  },
});

// ─── Types ───────────────────────────────────────────────────────────────────
type TabKey = "vendors" | "subvendors" | "agents" | "cashiers" | "pos";

interface Entity {
  id: string; initials: string; color: string; name: string;
  email: string; breadcrumb: string; status: "active" | "inactive";
  wallet: string; parent: string;
}

const TAB_CONFIG: Record<TabKey, {
  label: string; singular: string; buttonLabel: string; parentLabel: string;
  stats: { total: number; active: number; inactive: number };
}> = {
  vendors:    { label: "Vendors",    singular: "Vendor",    buttonLabel: "Onboard Vendor",    parentLabel: "Tenant",    stats: { total: 32, active: 28, inactive: 4 } },
  subvendors: { label: "Subvendors", singular: "Subvendor", buttonLabel: "Onboard Subvendor", parentLabel: "Vendor",    stats: { total: 14, active: 11, inactive: 3 } },
  agents:     { label: "Agents",     singular: "Agent",     buttonLabel: "Onboard Agent",     parentLabel: "Subvendor", stats: { total: 47, active: 40, inactive: 7 } },
  cashiers:   { label: "Cashiers",   singular: "Cashier",   buttonLabel: "Onboard Cashier",   parentLabel: "Agent",     stats: { total: 89, active: 76, inactive: 13 } },
  pos:        { label: "POS",        singular: "POS",       buttonLabel: "Onboard POS",       parentLabel: "Cashier",   stats: { total: 23, active: 20, inactive: 3 } },
};

const TAB_COUNTS: Record<TabKey, number> = { vendors: 32, subvendors: 14, agents: 47, cashiers: 89, pos: 23 };

const TAB_DATA: Record<TabKey, Entity[]> = {
  vendors: [
    { id: "v1", initials: "BX", color: "#0F2D6B", name: "BAXI",        email: "baxi@fintech.ng",       breadcrumb: "Tenant › BAXI",        status: "active",   wallet: "₦1,204,500", parent: "Tenant" },
    { id: "v2", initials: "PY", color: "#1A7F4B", name: "PayServ",     email: "payserv@fintech.ng",    breadcrumb: "Tenant › PayServ",     status: "active",   wallet: "₦892,000",   parent: "Tenant" },
    { id: "v3", initials: "FL", color: "#7B4FBF", name: "Flutterwave", email: "flutter@fintech.ng",    breadcrumb: "Tenant › Flutterwave", status: "active",   wallet: "₦3,540,200", parent: "Tenant" },
    { id: "v4", initials: "MN", color: "#C0392B", name: "Moniepoint",  email: "moniepoint@fintech.ng", breadcrumb: "Tenant › Moniepoint",  status: "inactive", wallet: "₦0",         parent: "Tenant" },
  ],
  subvendors: [
    { id: "s1", initials: "SA", color: "#1565C0", name: "SubV Alpha", email: "alpha@fintech.ng", breadcrumb: "Tenant › BAXI › SubV Alpha",          status: "active",   wallet: "₦420,000", parent: "BAXI" },
    { id: "s2", initials: "SB", color: "#2E7D32", name: "SubV Beta",  email: "beta@fintech.ng",  breadcrumb: "Tenant › PayServ › SubV Beta",         status: "active",   wallet: "₦310,000", parent: "PayServ" },
    { id: "s3", initials: "SG", color: "#6A1B9A", name: "SubV Gamma", email: "gamma@fintech.ng", breadcrumb: "Tenant › Flutterwave › SubV Gamma",    status: "inactive", wallet: "₦0",       parent: "Flutterwave" },
  ],
  agents: [
    { id: "a1", initials: "AL", color: "#0277BD", name: "Agent Lagos", email: "lagos@agents.ng", breadcrumb: "Tenant › BAXI › SubV Alpha › Agent Lagos",  status: "active",   wallet: "₦85,000", parent: "SubV Alpha" },
    { id: "a2", initials: "AB", color: "#00695C", name: "Agent Abuja", email: "abuja@agents.ng", breadcrumb: "Tenant › PayServ › SubV Beta › Agent Abuja", status: "active",   wallet: "₦62,500", parent: "SubV Beta" },
    { id: "a3", initials: "AP", color: "#4527A0", name: "Agent PH",    email: "ph@agents.ng",    breadcrumb: "Tenant › Flutterwave › SubV Gamma › Agent PH",status: "inactive", wallet: "₦0",      parent: "SubV Gamma" },
  ],
  cashiers: [
    { id: "c1", initials: "CA", color: "#283593", name: "Cashier A", email: "cashiera@pos.ng", breadcrumb: "... › Agent Lagos › Cashier A", status: "active",   wallet: "₦12,400", parent: "Agent Lagos" },
    { id: "c2", initials: "CB", color: "#1B5E20", name: "Cashier B", email: "cashierb@pos.ng", breadcrumb: "... › Agent Abuja › Cashier B", status: "active",   wallet: "₦9,800",  parent: "Agent Abuja" },
    { id: "c3", initials: "CC", color: "#B71C1C", name: "Cashier C", email: "cashierc@pos.ng", breadcrumb: "... › Agent PH › Cashier C",    status: "inactive", wallet: "₦0",      parent: "Agent PH" },
  ],
  pos: [
    { id: "p1", initials: "P1", color: "#37474F", name: "POS Terminal 001", email: "pos001@devices.ng", breadcrumb: "... › Cashier A › POS 001", status: "active",   wallet: "₦4,200", parent: "Cashier A" },
    { id: "p2", initials: "P2", color: "#4E342E", name: "POS Terminal 002", email: "pos002@devices.ng", breadcrumb: "... › Cashier B › POS 002", status: "active",   wallet: "₦3,100", parent: "Cashier B" },
    { id: "p3", initials: "P3", color: "#880E4F", name: "POS Terminal 003", email: "pos003@devices.ng", breadcrumb: "... › Cashier C › POS 003", status: "inactive", wallet: "₦0",     parent: "Cashier C" },
  ],
};

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <Card sx={{ flex: 1, position: "relative", overflow: "hidden", minWidth: 140 }}>
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, bgcolor: accent, borderRadius: "12px 12px 0 0" }} />
      <CardContent sx={{ pt: 3, pb: "20px !important" }}>
        <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
        <Typography sx={{ fontSize: "2.4rem", fontWeight: 800, mt: 0.5, lineHeight: 1 }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

function StatusChip({ status }: { status: "active" | "inactive" }) {
  return (
    <Chip label={status} size="small" sx={{
      bgcolor: status === "active" ? "#E8F5EE" : "#FDF0EF",
      color: status === "active" ? "#1A7F4B" : "#C0392B",
      border: `1px solid ${status === "active" ? "#AEDCC4" : "#F5B9B3"}`,
    }} />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("vendors");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const config = TAB_CONFIG[activeTab];
  const rows = TAB_DATA[activeTab];
  const filtered = rows.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 2, md: 4 } }}>

        {/* Breadcrumb */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: "#9AA4B2" }} />} sx={{ mb: 1.5 }}>
          <Link underline="hover" href="#" color="primary" sx={{ fontSize: "0.82rem", fontWeight: 500 }}>Tenant Admin</Link>
          <Typography color="text.primary" sx={{ fontSize: "0.82rem", fontWeight: 500 }}>Onboarding</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Typography variant="h4" sx={{ mb: 0.5 }}>Onboarding</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create and manage the full{" "}
          {["Tenant", "Vendor", "Subvendor", "Agent", "Cashier / POS"].map((step, i, arr) => (
            <React.Fragment key={step}>
              <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>{step}</Box>
              {i < arr.length - 1 && <Box component="span" sx={{ mx: 0.5, color: "#9AA4B2" }}>→</Box>}
            </React.Fragment>
          ))}{" "}hierarchy
        </Typography>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, v: TabKey) => { setActiveTab(v); setSearch(""); }}
          sx={{ mb: 3, borderBottom: "1px solid #E8ECF0" }}
          TabIndicatorProps={{ style: { height: 2.5, borderRadius: 2 } }}
        >
          {(Object.keys(TAB_CONFIG) as TabKey[]).map((key) => (
            <Tab
              key={key}
              value={key}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  {TAB_CONFIG[key].label}
                  <Box sx={{
                    bgcolor: activeTab === key ? "#0F2D6B" : "#E8ECF0",
                    color: activeTab === key ? "#fff" : "#6B7A8D",
                    borderRadius: 10, px: 0.85, py: 0.1,
                    fontSize: "0.68rem", fontWeight: 700, lineHeight: "18px",
                    minWidth: 22, textAlign: "center", transition: "all 0.2s",
                  }}>
                    {TAB_COUNTS[key]}
                  </Box>
                </Box>
              }
            />
          ))}
        </Tabs>

        {/* Stat cards */}
        <Box sx={{ display: "flex", gap: 2.5, mb: 3, flexWrap: "wrap" }}>
          <StatCard label="TOTAL"    value={config.stats.total}    accent="#0F2D6B" />
          <StatCard label="ACTIVE"   value={config.stats.active}   accent="#1A7F4B" />
          <StatCard label="INACTIVE" value={config.stats.inactive} accent="#C0392B" />
        </Box>

        {/* Search + actions */}
        <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, alignItems: "center" }}>
          <TextField
            placeholder={`Search ${config.label.toLowerCase()} by name or email…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small" fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#9AA4B2", fontSize: 20 }} /></InputAdornment> }}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff", "& fieldset": { borderColor: "#E0E4EA" }, "&:hover fieldset": { borderColor: "#B0BFD8" } } }}
          />
          <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />}
            sx={{ whiteSpace: "nowrap", borderColor: "#D0D5DD", color: "text.primary", bgcolor: "#fff", "&:hover": { borderColor: "#B0B8C8", bgcolor: "#F9FAFB" }, px: 2 }}>
            Export
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}
            sx={{ whiteSpace: "nowrap", px: 2.5, bgcolor: "#0F2D6B" }}>
            {config.buttonLabel}
          </Button>
        </Box>

        {/* Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Entity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Wallet</TableCell>
                  <TableCell>{config.parentLabel}</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((entity) => (
                  <TableRow key={entity.id} hover sx={{ "&:last-child td": { border: 0 }, cursor: "pointer" }}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: entity.color, width: 38, height: 38, fontSize: "0.8rem", fontWeight: 700 }}>
                          {entity.initials}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{entity.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{entity.email}</Typography>
                          <br />
                          <Link href="#" underline="hover" color="primary" sx={{ fontSize: "0.75rem", fontWeight: 500 }}>
                            {entity.breadcrumb}
                          </Link>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><StatusChip status={entity.status} /></TableCell>
                    <TableCell><Typography sx={{ fontWeight: 600 }}>{entity.wallet}</Typography></TableCell>
                    <TableCell><Typography color="text.secondary">{entity.parent}</Typography></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Configure">
                        <Button variant="outlined" size="small"
                          startIcon={<SettingsOutlinedIcon sx={{ fontSize: "16px !important" }} />}
                          sx={{ borderColor: "#D0D5DD", color: "text.primary", fontSize: "0.78rem", py: 0.5, "&:hover": { borderColor: "#B0B8C8", bgcolor: "#F9FAFB" } }}>
                          Configure
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No {config.label.toLowerCase()} match your search.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      {/* ── Per-entity wizard modals ── */}
      <OnboardingVendor    open={modalOpen && activeTab === "vendors"}    onClose={() => setModalOpen(false)} />
      <OnboardingSubVendor open={modalOpen && activeTab === "subvendors"} onClose={() => setModalOpen(false)} />
      <OnboardingAgent     open={modalOpen && activeTab === "agents"}     onClose={() => setModalOpen(false)} />
      <OnboardingCashier   open={modalOpen && activeTab === "cashiers"}   onClose={() => setModalOpen(false)} />
      <OnboardingPOS       open={modalOpen && activeTab === "pos"}        onClose={() => setModalOpen(false)} />
    </ThemeProvider>
  );
}