
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Tabs, Tab, Card, CardContent, TextField,
  InputAdornment, Button, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Breadcrumbs,
  Link, Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  DialogActions,
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
import { TAB_CONFIG, TAB_DATA, theme } from "../../components/OnboardingUser/constants";
import { getAllVendors, RelatedVendorResponse } from "../../services/onbordingService";
import ConfigureVendor from "../../components/OnboardingUser/ConfigureVendor";
import { usePermission } from "../../hooks/usePermission";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { Stack } from "@mui/system";
import VendorKycReview from "./VendorKycReview";
import OnboardVendorModal, { OnboardVendorForm } from "./OnboardVendorModal";

// ─── Theme ──────────────────────────────────────────────────────────────────


// ─── Types ───────────────────────────────────────────────────────────────────
type TabKey = "vendors" | "subvendors" | "agents" | "cashiers" | "pos";

interface Entity {
  id: string; initials: string; color: string; name: string;
  email: string; breadcrumb: string; status: "active" | "inactive";
  wallet: string; parent: string;
}


// const TAB_COUNTS: Record<TabKey, number> = { vendors: 32, subvendors: 14, agents: 47, cashiers: 89, pos: 23 };



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

  const [entities, setEntities] = useState<RelatedVendorResponse[]>([]);

  const [loading, setLoading] = useState(false);

  const [configOpen, setConfigOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  const [vendorModalOpen, setVendorModalOpen] = useState(false);

  const [creatingVendor, setCreatingVendor] = useState(false);

  const [vendorForm, setVendorForm] = useState<OnboardVendorForm>({
    email: "",
    password: "",
  });

  const [kycOpen, setKycOpen] = useState(false);

  const config = TAB_CONFIG[activeTab];
  //const rows = TAB_DATA[activeTab];

  const TAB_COUNTS = {
    vendors: entities.filter(
      (x) => x.hierachy === "vendor"
    ).length,

    subvendors: entities.filter(
      (x) => x.hierachy === "sub_vendor"
    ).length,

    agents: entities.filter(
      (x) => x.hierachy === "agent"
    ).length,

    cashiers: entities.filter(
      (x) => x.hierachy === "cashier"
    ).length,

    pos: entities.filter(
      (x) => x.hierachy === "pos"
    ).length,
  };

  const hierarchyMap: Record<TabKey, string> = {
    vendors: "vendor",
    subvendors: "sub_vendor",
    agents: "agent",
    cashiers: "cashier",
    pos: "pos",
  };
  const filteredEntities = entities.filter(
    (entity) =>
      entity.hierachy === hierarchyMap[activeTab]
  );
  const filtered = filteredEntities.filter(
    (entity) =>
      entity.business_name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      entity.email
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        setLoading(true);

        const data = await getAllVendors();

        setEntities(data);
      } catch (error) {
        console.error(error);
        toast.error(getErrorMessage(error))
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, []);

  const filteredByTab = entities.filter((vendor) => {
    switch (activeTab) {
      case "vendors":
        return vendor.hierachy === "vendor";

      case "subvendors":
        return vendor.hierachy === "sub_vendor";

      case "agents":
        return vendor.hierachy === "agent";

      case "cashiers":
        return vendor.hierachy === "cashier";

      case "pos":
        return vendor.hierachy === "pos";

      default:
        return false;
    }
  });
  const stats = {
    total: filteredByTab.length,

    active: filteredByTab.filter(
      (item) => item.account_status === "active"
    ).length,

    inactive: filteredByTab.filter(
      (item) => item.account_status === "inactive"
    ).length,
    suspended: filteredByTab.filter(
      (item) => item.account_status === "suspended"
    ).length,
  };

  const handleCreateVendor = async () => {
    if (!vendorForm.email || !vendorForm.password) {
      toast.error("Email and password are required.");
      return;
    }

    try {
      setCreatingVendor(true);

      // await createVendor({
      //   email: vendorForm.email,
      //   password: vendorForm.password,
      // });

      toast.success("Vendor created successfully.");

      setVendorModalOpen(false);

      setVendorForm({
        email: "",
        password: "",
      });

      // reload vendors
      const data = await getAllVendors();
      setEntities(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCreatingVendor(false);
    }
  };

  const handleApproveVendor = async () => {
    // await approveVendor(selectedVendor.id);

    toast.success("Vendor approved");

    setKycOpen(false);

    // reloadVendors();
  };

  const handleRejectVendor = async () => {
    // await rejectVendor(selectedVendor.id);

    toast.success("Vendor rejected");

    setKycOpen(false);

    // reloadVendors();
  };

interface KycChipProps {
    status?: string | null;
}

  // const KycChip = ({
  //   status,
  // }: {
  //   status: "pending" | "approved" | "rejected";
  // }) => {
  //   const map = {
  //     pending: {
  //       bg: "#FEF3C7",
  //       color: "#92400E",
  //       text: "Pending",
  //     },
  //     approved: {
  //       bg: "#DCFCE7",
  //       color: "#166534",
  //       text: "Approved",
  //     },
  //     rejected: {
  //       bg: "#FEE2E2",
  //       color: "#991B1B",
  //       text: "Rejected",
  //     },
  //   };

  //   return (
  //     <Chip
  //       size="small"
  //       label={map[status].text}
  //       sx={{
  //         bgcolor: map[status].bg,
  //         color: map[status].color,
  //         fontWeight: 600,
  //       }}
  //     />
  //   );
  // };

  const KycChip = ({ status }: KycChipProps) => {
    const map = {
        pending: {
            bg: "#FEF3C7",
            color: "#92400E",
            text: "Pending",
        },
        approved: {
            bg: "#DCFCE7",
            color: "#166534",
            text: "Approved",
        },
        rejected: {
            bg: "#FEE2E2",
            color: "#991B1B",
            text: "Rejected",
        },
    };

    const config =
        map[status?.toLowerCase() as keyof typeof map] ??
        map.pending;

    return (
        <Chip
            size="small"
            label={config.text}
            sx={{
                bgcolor: config.bg,
                color: config.color,
                fontWeight: 600,
            }}
        />
    );
};

  const { can } = usePermission();
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh" }}>

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
          <StatCard label="TOTAL" value={stats.total} accent="#0F2D6B" />
          <StatCard label="ACTIVE" value={stats.active} accent="#1A7F4B" />
          <StatCard label="INACTIVE" value={stats.inactive} accent="#C0392B" />
          <StatCard label="SUSPENDED" value={stats.suspended} accent="#C0392B" />
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
          {/* <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />}
            sx={{ whiteSpace: "nowrap", borderColor: "#D0D5DD", color: "text.primary", bgcolor: "#fff", "&:hover": { borderColor: "#B0B8C8", bgcolor: "#F9FAFB" }, px: 5 }}>
            Export
          </Button> */}
          {/* <Tooltip
            title={
              can("create_vendors")
                ? ""
                : "You don't have permission to perform this action."
            }
          >
            <span>
              <Button disabled={!can("create_vendors")} variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}
                sx={{ whiteSpace: "nowrap", px: 5, bgcolor: "#0F2D6B" }}>
                {config.buttonLabel}
              </Button>
            </span>
          </Tooltip> */}
          <Tooltip
            title={
              can("create_vendors")
                ? ""
                : "You don't have permission to perform this action."
            }
          >
            <span>
              <Button
                disabled={!can("create_vendors")}
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setVendorModalOpen(true)}
                sx={{
                  whiteSpace: "nowrap",
                  px: 5,
                  bgcolor: "#0F2D6B",
                }}
              >
                {config.buttonLabel}
              </Button>
            </span>
          </Tooltip>
        </Box>

        {/* Table */}
        <Card>
          <TableContainer>
            <Table>
              {/* <TableHead>
                <TableRow>
                  <TableCell>Entity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>{config.parentLabel}</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead> */}
              <TableHead>
                <TableRow>
                  <TableCell>Entity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>KYC</TableCell>
                  <TableCell>{config.parentLabel}</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>

                {filtered.map((entity) => (
                  <TableRow key={entity.id}>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <Avatar>
                          {entity.business_name
                            ?.substring(0, 2)
                            .toUpperCase()}
                        </Avatar>

                        <Box>
                          <Typography fontWeight={600}>
                            {entity.business_name}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {entity.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <StatusChip
                        status={
                          entity.account_status ===
                            "active"
                            ? "active"
                            : "inactive"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <KycChip status={entity.kyc_status} />
                    </TableCell>

                    {/* <TableCell>-</TableCell> */}

                    <TableCell>
                      {entity.hierachy}
                    </TableCell>

                    {/* <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"

                        onClick={() => {
                          setSelectedVendorId(
                            entity.id.toString()
                          );
                          setConfigOpen(true);
                        }}
                      >
                        Configure
                      </Button>

                    </TableCell> */}
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedVendor(entity);
                            setKycOpen(true);
                          }}
                        >
                          Review KYC
                        </Button>

                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            setSelectedVendorId(entity.id.toString());
                            setConfigOpen(true);
                          }}
                        >
                          Configure
                        </Button>
                      </Stack>
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


        <ConfigureVendor
          open={configOpen}
          onClose={() => setConfigOpen(false)}
          vendorId={selectedVendorId}
        />
        <VendorKycReview
          open={kycOpen}
          vendor={selectedVendor}
          onClose={() => setKycOpen(false)}
          onApprove={handleApproveVendor}
          onReject={handleRejectVendor}
        />
        <OnboardVendorModal
          open={vendorModalOpen}
          onClose={() => setVendorModalOpen(false)}
          loading={creatingVendor}
          form={vendorForm}
          setForm={setVendorForm}
          onSubmit={handleCreateVendor}
        />
      </Box>

      {/* ── Per-entity wizard modals ── */}
      <OnboardingVendor open={modalOpen && activeTab === "vendors"} onClose={() => setModalOpen(false)} />
      <OnboardingSubVendor open={modalOpen && activeTab === "subvendors"} onClose={() => setModalOpen(false)} />
      <OnboardingAgent open={modalOpen && activeTab === "agents"} onClose={() => setModalOpen(false)} />
      <OnboardingCashier open={modalOpen && activeTab === "cashiers"} onClose={() => setModalOpen(false)} />
      <OnboardingPOS open={modalOpen && activeTab === "pos"} onClose={() => setModalOpen(false)} />
    </ThemeProvider>
  );
}