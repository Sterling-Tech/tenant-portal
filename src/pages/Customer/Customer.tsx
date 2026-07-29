// PIXEL-PERFECT VERSION (matches your screenshot closely)
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Divider,
  Select,
  FormControl,
  MenuItem as SelectItem,
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";

import { useNavigate } from "react-router-dom";
import { Search, MoreVert, Refresh } from "@mui/icons-material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { fetchCustomers, fetchCustomer, fetchCustomerTransactions, createCustomer, type Customer, MeteringTypeS, CustomerClass, Customercategory, searchCustomers, type CustomerForm } from "../../services/vendorService";
import {
  issueEngineeringToken,
  type EngineeringTokenPayload,
  type EngineeringTokenResponse,
} from "../../services/engineeringtokenservice";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { meterActions } from "./MeterActions";
import MeterActionModal from "./MeterActionModal";
import CustomerHistoryModal from "../Settings/CustomerHistoryModal";
import { borderBottom } from "@mui/system";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";


const CustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = useState<Customer | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const [meteringTypes, setMeteringTypes] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [customerForm, setCustomerForm] = useState<Partial<CustomerForm>>({});
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [openModal, setOpenModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string; } | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [viewTab, setViewTab] = useState("overview");
  const [filters, setFilters] = useState({
    account_status: "",
    metering_type_id: "",
    class_id: "",
    category_id: "",
  });
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(0);
  const [transactionPage, setTransactionPage] = useState(1);

  const [transactionPageSize, setTransactionPageSize] = useState(5);

  const [anchorE2, setAnchorE2] = useState<null | HTMLElement>(null);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  // The customer the meter action is being performed on — captured the moment
  // an action is picked from the menu, so it can't go stale mid-flow.
  const [actionCustomer, setActionCustomer] = useState<Customer | null>(null);
  const [meterActionSubmitting, setMeterActionSubmitting] = useState(false);
  const [meterActionResult, setMeterActionResult] = useState<{
    open: boolean;
    success: boolean;
    message: string;
    data?: EngineeringTokenResponse;
  } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [formValues, setFormValues] = useState<
    Record<string, string>
  >({});

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorE2(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorE2(null);
  };

  // Only these five meter actions map onto the real engineering-token
  // endpoint (the same one BulkAssign already uses). Everything else in
  // meterActions (change_sgc, change_tariff, remove_meter, vend) has no
  // backend endpoint yet, so those keep the old placeholder behavior.
  const SUPPORTED_METER_ACTIONS = ["free_issue", "max_power", "tamper", "clear_credit", "key_change"];

  const isMeterActionFormValid = () => {
    if (!selectedAction) return false;
    return (selectedAction.fields || []).every(
      (f: any) => (formValues[f.name] || "").trim() !== ""
    );
  };

  const handleMeterActionSubmit = async () => {
    if (!selectedAction) return;

    if (!SUPPORTED_METER_ACTIONS.includes(selectedAction.id)) {
      // No engineering-token endpoint for this one yet — keep the original
      // placeholder behavior so nothing here regresses.
      console.log(selectedAction.id, formValues);
      setModalOpen(false);
      setFormValues({});
      return;
    }

    const meterNumber = actionCustomer?.meter_number;
    if (!meterNumber) {
      setMeterActionResult({
        open: true,
        success: false,
        message: "This customer has no meter number on file, so a token cannot be issued.",
      });
      return;
    }

    let payload: EngineeringTokenPayload;
    switch (selectedAction.id) {
      case "free_issue":
        payload = {
          vend_type: "freeissue",
          meter_number: meterNumber,
          units: (formValues.units || "").trim(),
          reason: (formValues.reason || "").trim(),
        };
        break;
      case "max_power":
        payload = {
          vend_type: "maxpower",
          meter_number: meterNumber,
          kilowatt: (formValues.max_power || "").trim(),
          reason: (formValues.reason || "").trim(),
        };
        break;
      case "tamper":
        payload = {
          vend_type: "tampertoken",
          meter_number: meterNumber,
          reason: (formValues.reason || "").trim(),
        };
        break;
      case "clear_credit":
        payload = {
          vend_type: "cleartoken",
          meter_number: meterNumber,
          reason: (formValues.reason || "").trim(),
        };
        break;
      case "key_change":
        payload = {
          vend_type: "keychange",
          meter_number: meterNumber,
          to_ti: (formValues.to_ststi || "").trim(),
          to_sgc: (formValues.to_sgc || "").trim(),
          to_krn: (formValues.to_krn || "").trim(),
          reason: (formValues.reason || "").trim(),
        };
        break;
      default:
        return;
    }

    setMeterActionSubmitting(true);
    try {
      const response = await issueEngineeringToken(payload);
      setMeterActionResult({
        open: true,
        success: true,
        message: `${response.description} issued successfully.`,
        data: response,
      });
      setModalOpen(false);
      setFormValues({});
    } catch (err: any) {
      // Same shape api.ts's makeApiCall throws elsewhere in this app: the
      // raw parsed error body, not an ApiErrors instance.
      const fieldErrors =
        err?.errors && typeof err.errors === "object"
          ? Object.values(err.errors).flat().join(" ")
          : "";

      const message =
        err?.detail ||
        err?.message ||
        err?.error ||
        fieldErrors ||
        "Something went wrong while performing this action. Please try again.";

      setMeterActionResult({ open: true, success: false, message });
    } finally {
      setMeterActionSubmitting(false);
    }
  };

  const closeMeterActionResult = () => setMeterActionResult(null);

  const safeValue = (value: any, fallback = "N/A") => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "null"
    ) {
      return fallback;
    }

    return value;
  };
  const formatDate = (date: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  const load = async (params?: any) => {
    setLoading(true);

    try {
      const res = await fetchCustomers({
        ...filters,
        page,
        ...params,
      });

      setCustomers(res.results);
      setCount(res.count);
    } catch (err) {
      console.error(err);

      toast.error(getErrorMessage(err));

      setCustomers([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filters, page]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!search) {
      load();
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true); // ✅ spinner trigger

      // try {
      //   const res = await searchCustomers(search);
      //   setCustomers(res.results);
      //   setCount(res.count);
      // } finally {
      //   setLoading(false);
      // }
      try {
        const res = await searchCustomers(search);

        setCustomers(res.results);
        setCount(res.count);
      } catch (err) {
        console.error(err);

        toast.error(getErrorMessage(err));

        setCustomers([]);
        setCount(0);
      } finally {
        setLoading(false);
      }
    }, 600);
  }, [search]);


  const loadCustomerTransactions = async (
    customerId: string | number,
    page = 1
  ) => {
    try {
      setTransactionLoading(true);

      const res = await fetchCustomerTransactions(
        customerId,
        page
      );

      setTransactions(res.results || []);
      setTransactionCount(res.count || 0);
      setTransactionPage(page);
      setTransactionPageSize(res.results.length);

    } catch (err) {
      console.error(err);

      setTransactions([]);
    } finally {
      setTransactionLoading(false);
    }
  };

  useEffect(() => {
    // const loadFilters = async () => {
    //   const [m, c, cat] = await Promise.all([
    //     MeteringTypeS(),
    //     CustomerClass(),
    //     Customercategory(),
    //   ]);

    //   setMeteringTypes(m);
    //   setClasses(c);
    //   setCategories(cat);
    // };

    const loadFilters = async () => {
      try {

        const [m, c, cat] = await Promise.all([
          MeteringTypeS(),
          CustomerClass(),
          Customercategory(),
        ]);

        setMeteringTypes(m);
        setClasses(c);
        setCategories(cat);

      } catch (err) {
        console.error(err);

        toast.error(getErrorMessage(err));
      }
    };
    loadFilters();
  }, []);

  const getStatus = (c: Customer) =>
    Number(c.wallet?.balance) > 0 ? "inactive" : "active";


  const handleRowClick = async (c: Customer) => {
    try {

      const full = await fetchCustomer({
        customer_id: c.id,
      });

      setSelected(full);
      setOpenViewModal(true);

    } catch (err) {
      console.error(err);

      toast.error(getErrorMessage(err));
    }
  };

  const handleCreateClick = () => {
    setFormMode('create');
    setCustomerForm({
      name: '',
      phone_number: '',
      customer_category: undefined,
      customer_class: undefined,
      metering_type: undefined,
    });
    setOpenModal(true);
  };

  const handleSaveVendor = async () => {
    if (
      !customerForm.name ||
      !customerForm.email ||
      !customerForm.phone_number ||
      !customerForm.customer_category ||
      !customerForm.customer_class ||
      !customerForm.metering_type
    ) {
      setNotification({
        type: "error",
        message: "All fields are required",
      });
      return;
    }

    setSaving(true);
    try {
      const payload: CustomerForm = {
        name: customerForm.name || "",
        email: customerForm.email || "",
        phone_number: customerForm.phone_number || "",
        address: customerForm.address || "",

        customer_category: Number(customerForm.customer_category),
        customer_class: Number(customerForm.customer_class),
        metering_type: Number(customerForm.metering_type),

        district: customerForm.district || "",
        feeder: customerForm.feeder || "",
        transformer: customerForm.transformer || "",
        service_center: customerForm.service_center || "",

        band: customerForm.band || "",
        tariff: customerForm.tariff || "",

        krn: customerForm.krn || "",
        ti: customerForm.ti || "",
        sgc: customerForm.sgc || "",
        kct1: customerForm.kct1 || "",
        kct2: customerForm.kct2 || "",
      };

      await createCustomer(payload);

      // ✅ SUCCESS FLOW
      setNotification({
        type: "success",
        message: "Customer created successfully",
      });

      setOpenModal(false);       // 🔥 CLOSE MODAL
      setCustomerForm({});       // 🔥 RESET FORM
      load();                    // 🔥 REFRESH TABLE

    } catch (err: any) {
      console.error(err); // 🔥 SEE REAL ERROR
      getErrorMessage(err)
      setNotification({
        type: "error",
        message: err?.response?.data?.message || "Failed to create customer",
      });
    } finally {
      setSaving(false);
    }
  };
  const handleFilterChange = (key: string, value: string) => {
    setLoading(true); // ✅ START SPINNER

    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? "" : value,
    }));

    setPage(1);
  };

  useEffect(() => {
    if (
      (viewTab === "transactions" || viewTab === "charts") &&
      selected?.id &&
      transactions.length === 0
    ) {
      loadCustomerTransactions(selected.id);
    }
  }, [viewTab, selected]);

  const chartData = useMemo(() => {
    return transactions
      .slice()
      .reverse()
      .map((tx) => ({
        amount: Number(tx.amount || 0),
        date: new Date(tx.timestamp).toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
        }),
      }));
  }, [transactions]);

  const PAGE_SIZE = 5;

const showing = Math.min(
    ((transactionPage - 1) * PAGE_SIZE) + transactions.length,
    transactionCount
);

  return (
    <Box sx={{ background: "#F8FAFC", minHeight: "100vh" }}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Box>
          <Typography fontSize={28} fontWeight={700}>
            Customer Hub
          </Typography>
          <Typography color="#64748B">
            Register and manage all customers — search by meter number or account number
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button onClick={() => load()} variant="outlined" startIcon={<Refresh />} sx={{ height: 36, textTransform: "none", borderRadius: 2 }}>
            Refresh
          </Button>
          {/* <Button onClick={handleCreateClick} variant="contained" sx={{ height: 36, textTransform: "none", borderRadius: 2 }}>
            + Register Customer
          </Button> */}
        </Stack>
      </Stack>

      {/* SEARCH BAR */}
      <Card
        sx={{
          p: 2,
          borderRadius: 4,
          mb: 3,
          bgcolor: "#F1F5F9",
        }}
      >
        <Typography
          fontSize={13}
          fontWeight={700}
          color="#64748B"
          mb={1}
          sx={{ letterSpacing: 1 }}
        >
          QUICK SEARCH
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">

          {/* ✅ SINGLE SEARCH */}
          <Box sx={{ flex: 1, position: "relative" }}>
            <TextField
              fullWidth
              placeholder="Search by account number or meter number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                bgcolor: "#E5E7EB",
                borderRadius: 3,
                "& fieldset": { border: "none" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#94A3B8" }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* 🔥 SMART TAG */}
            <Chip
              label="Account / Meter"
              size="small"
              sx={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "#E0E7FF",
                color: "#1D4ED8",
                fontWeight: 600,
              }}
            />
          </Box>

          {/* CLEAR */}
          <Button
            variant="contained"
            sx={{
              bgcolor: "#E5E7EB",
              color: "#334155",
              boxShadow: "none",
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              "&:hover": { bgcolor: "#CBD5F5" },
            }}
            onClick={() => {
              setSearch("");
              load();
            }}
          >
            Clear
          </Button>
        </Stack>
      </Card>

      {/* TABLE */}

      <Card sx={{ borderRadius: 4 }}>
        <TableContainer>

          <Box px={3} py={2}>

            <Stack direction="row" justifyContent="space-between" alignItems="center">

              {/* LEFT TEXT */}
              <Box>
                <Typography fontWeight={700}>All Customers</Typography>
                <Typography fontSize={13} color="#64748B">
                  Showing all customers
                </Typography>
              </Box>

              {/* FILTERS */}
              <Stack direction="row" spacing={2}>
                {loading && <CircularProgress size={18} />}
                {/* STATUS */}
                <FormControl size="small">
                  <Select
                    value={filters.account_status || "all"}
                    sx={{ bgcolor: "#F8FAFC", borderRadius: 2, fontSize: 13, height: 36, "& fieldset": { borderColor: "#E2E8F0", }, }}
                    onChange={(e) => handleFilterChange("account_status", e.target.value)}
                  >
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </Select>
                </FormControl>

                {/* METERING /// */}
                <FormControl size="small">
                  <Select
                    value={filters.metering_type_id || "all"}
                    sx={{ bgcolor: "#F8FAFC", borderRadius: 2, fontSize: 13, height: 36, "& fieldset": { borderColor: "#E2E8F0", }, }}
                    onChange={(e) => handleFilterChange("metering_type_id", e.target.value)}
                  >
                    <SelectItem value="all">All Metering</SelectItem>
                    {meteringTypes.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </Select>
                </FormControl>

                {/* CLASS */}
                <FormControl size="small">
                  <Select
                    value={filters.class_id || "all"}
                    sx={{ bgcolor: "#F8FAFC", borderRadius: 2, fontSize: 13, height: 36, "& fieldset": { borderColor: "#E2E8F0", }, }}
                    onChange={(e) => handleFilterChange("class_id", e.target.value)}
                  >
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </Select>
                </FormControl>

                {/* CATEGORY */}
                <FormControl size="small">
                  <Select
                    value={filters.category_id || "all"}
                    sx={{ bgcolor: "#F8FAFC", borderRadius: 2, fontSize: 13, height: 36, "& fieldset": { borderColor: "#E2E8F0", }, }}
                    onChange={(e) => handleFilterChange("category_id", e.target.value)}
                  >
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </Select>
                </FormControl>

              </Stack>

            </Stack>
          </Box>

          <Table>
            <TableHead>
              <TableRow sx={{ "& td": { py: 2 } }}>
                {[
                  "Customer",
                  "Account No",
                  "Meter No",
                  "Class",
                  "Category",
                  "Metering",
                  "Status",
                  "Debt Balance",
                  "Actions",
                ].map((h) => (
                  <TableCell key={h} sx={{ color: "#94A3B8", fontWeight: 600, fontSize: 12 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box
                      height={200}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box
                      height={200}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography color="#94A3B8">No customers found</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow
                    key={c.id}
                    hover
                    sx={{ cursor: "pointer" }}
                  // onClick={() => handleRowClick(c)}
                  >

                    <TableCell sx={{ color: "#94A3B8", fontWeight: 600, fontSize: 12 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "#E2E8F0", color: "#1E293B" }}>
                          {c.name?.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={500}>{c.name}</Typography>
                          <Typography fontSize={12} color="#94A3B8">
                            {c.phone_number}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell
                      onClick={() => handleRowClick(c)}
                      sx={{
                        cursor: "pointer",
                        borderBottom: "2px solid transparent",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderBottom: "2px solid #1976d2", // MUI primary blue
                          color: "#1976d2",
                        },
                      }}
                    >
                      {c.account_number}
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(c)}>{c.meter_number}</TableCell>

                    <TableCell>
                      <Chip
                        label={c.customer_class?.name}
                        size="small"
                        sx={{ bgcolor: "#E2FBE8", color: "#166534" }}
                      />
                    </TableCell>

                    <TableCell>{c.customer_category?.name}</TableCell>

                    <TableCell>
                      <Chip
                        label={c.metering_type?.name}
                        size="small"
                        sx={{ bgcolor: "#EEF2FF", color: "#3730A3" }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getStatus(c)}
                        size="small"
                        sx={{
                          bgcolor:
                            getStatus(c) === "active" ? "#DCFCE7" : "#FEE2E2",
                          color:
                            getStatus(c) === "active" ? "#166534" : "#991B1B",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Button
                        sx={{
                          bgcolor:
                            Number(c.wallet?.balance) > 0
                              ? "#FEE2E2"
                              : "#DCFCE7",
                          color:
                            Number(c.wallet?.balance) > 0
                              ? "#991B1B"
                              : "#166534",
                        }}
                        size="small"

                        onClick={(e) => {
                          e.stopPropagation();

                          navigate(
                            `customer/subaccount/${c.account_number}`,
                            {
                              state: {
                                customer: c,
                                account_number: c.account_number,
                              },
                            }
                          );
                        }}
                      >
                        ₦{c.wallet?.balance}
                      </Button>

                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setMenuRow(c);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )))}
            </TableBody>
          </Table>
          <Stack direction="row" justifyContent="space-between" p={2}>
            <Typography fontSize={13}>
              Showing {customers.length} of {count}
            </Typography>

            <Stack direction="row" spacing={1}>
              <Button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </Button>

              <Button
                disabled={customers.length === 0}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </Stack>
          </Stack>
        </TableContainer>
      </Card>

      {/* MENU */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={async () => {
            const full = await fetchCustomer({ customer_id: menuRow!.id });
            setSelected(full);
            setOpenViewModal(true);
            setAnchorEl(null);
          }}
        >
          View
        </MenuItem>

        <MenuItem
          onClick={async () => {
            const full = await fetchCustomer({ customer_id: menuRow!.id });

            setFormMode("edit");
            setCustomerForm({
              name: full.name,
              // email: full.email,
              phone_number: full.phone_number,
              address: (full as any).address,
              customer_category: full.customer_category?.id,
              customer_class: full.customer_class?.id,
              metering_type: full.metering_type?.id,
            });

            setOpenModal(true);
            setAnchorEl(null);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={async () => {
            const full = await fetchCustomer({
              customer_id: menuRow!.id,
            });

            setSelected(full);

            setOpenViewModal(true);

            setViewTab("transactions");

            await loadCustomerTransactions(full.id);

            setAnchorEl(null);
          }}
        >
          Transactions
        </MenuItem>
        {/* <Divider />
        <MenuItem
          onClick={() => {
            setSelected(menuRow);
            setHistoryOpen(true);
            setAnchorEl(null);
          }}
        >
          History
        </MenuItem> */}
        <Divider />
        <Button
          // variant="outlined"
          endIcon={<MoreHorizIcon />}
          onClick={handleMenuOpen}
          style={{ marginLeft: "20px" }}
        >
          More
        </Button>
        <Menu
          anchorEl={anchorE2}
          open={Boolean(anchorE2)}
          onClose={handleMenuClose}
        >
          {meterActions.map((action) => (
            <MenuItem
              key={action.id}
              onClick={() => {
                setSelectedAction(action);
                setActionCustomer(menuRow);
                setModalOpen(true);
                handleMenuClose();
              }}
            >
              {action.label}
            </MenuItem>
          ))}
        </Menu>
      </Menu>

      {/* DETAIL PANEL */}
      {openViewModal && selected && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1400,
            animation: "fadeIn 0.3s ease",
          }}
        >
          <Card
            sx={{
              width: 800,
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            {/* HEADER */}
            <Box sx={{ bgcolor: "#1E3A8A", color: "#fff", p: 3 }}>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography fontSize={20} fontWeight={700}>
                    {selected.name}
                  </Typography>
                  <Typography fontSize={13}>
                    {selected.phone_number}
                  </Typography>
                </Box>

                <Button
                  onClick={() => setOpenViewModal(false)}
                  sx={{ color: "#fff" }}
                >
                  Close
                </Button>
              </Stack>
            </Box>

            {/* BODY */}
            <Box p={0}>

              {/* TABS */}
              <Tabs
                value={viewTab}
                onChange={(e, v) => setViewTab(v)}
                sx={{
                  px: 3,
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                <Tab label="Overview" value="overview" />
                <Tab label="CIS Information" value="cis" />
                <Tab label="Transactions" value="transactions" />
                <Tab label="Charts" value="charts" />
              </Tabs>

              {/* OVERVIEW */}
              {viewTab === "overview" && (
                <Box p={3}>
                  <Grid container spacing={3}>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        Customer Name
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.name)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        Phone Number
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.phone_number)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        Account Number
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.account_number)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        Meter Number
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.meter_number)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        Wallet Balance
                      </Typography>

                      <Typography fontWeight={700}>
                        ₦{safeValue(selected?.wallet?.balance, "0.00")}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        Wallet Type
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.wallet?.wallet_type?.name)}
                      </Typography>
                    </Grid>

                  </Grid>
                </Box>
              )}

              {/* CIS INFORMATION */}
              {viewTab === "cis" && (
                <Box p={3}>

                  <Grid container spacing={3}>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        District / Branch
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.extra_info?.district)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        Customer Category
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.customer_category?.name)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        Feeder
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.extra_info?.feeder)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        Feeder 33
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.extra_info?.feeder_33)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        Transformer
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.extra_info?.transformer)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        Service Center
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.extra_info?.service_center)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        Service Unit
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.extra_info?.service_unit)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        Band
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.extra_info?.band)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        Tariff
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.extra_info?.tariff)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        Postpaid Arrears
                      </Typography>

                      <Typography fontWeight={700}>
                        ₦{safeValue(selected?.extra_info?.postpaid_arrears, "0.00")}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography fontSize={12} color="#94A3B8">
                        Address
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.extra_info?.address)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography fontSize={13} fontWeight={700} color="#0F172A" mt={1}>
                        Meter Configuration
                      </Typography>
                    </Grid>

                    <Grid item xs={6} md={4}>
                      <Typography fontSize={12} color="#94A3B8">
                        KRN
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.extra_info?.krn)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} md={4}>
                      <Typography fontSize={12} color="#94A3B8">
                        TI
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.extra_info?.ti)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} md={4}>
                      <Typography fontSize={12} color="#94A3B8">
                        SGC
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.extra_info?.sgc)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        KCT1
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.extra_info?.kct1)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography fontSize={12} color="#94A3B8">
                        KCT2
                      </Typography>

                      <Typography fontWeight={700}>
                        {safeValue(selected?.extra_info?.kct2)}
                      </Typography>
                    </Grid>

                  </Grid>

                </Box>
              )}

              {/* TRANSACTIONS */}
              {viewTab === "transactions" && (
                <Box p={3}>

                  {transactionLoading ? (
                    <Box
                      height={250}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      <Table>
                        <TableHead>
                          <TableRow>

                            <TableCell>ID</TableCell>

                            <TableCell>
                              Vendor
                            </TableCell>

                            <TableCell>
                              Token
                            </TableCell>

                            <TableCell>
                              Reference
                            </TableCell>

                            <TableCell>
                              Amount
                            </TableCell>

                            <TableCell>
                              Date
                            </TableCell>

                          </TableRow>
                        </TableHead>

                        <TableBody>

                          {transactions.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <Box
                                  py={6}
                                  textAlign="center"
                                >
                                  <Typography color="#94A3B8">
                                    No transactions found
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ) : (
                            transactions.map((tx) => (
                              <TableRow key={tx.id} hover>

                                <TableCell>
                                  {safeValue(tx.id)}
                                </TableCell>

                                <TableCell>
                                  <Stack spacing={0.5}>
                                    <Typography
                                      fontWeight={600}
                                      fontSize={13}
                                    >
                                      {safeValue(
                                        tx.vendor?.business_name
                                      )}
                                    </Typography>

                                    <Typography
                                      fontSize={11}
                                      color="#94A3B8"
                                    >
                                      {safeValue(
                                        tx.vendor?.email
                                      )}
                                    </Typography>
                                  </Stack>
                                </TableCell>

                                <TableCell>
                                  <Typography
                                    fontSize={12}
                                    sx={{
                                      maxWidth: 180,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {safeValue(tx.token)}
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  {safeValue(
                                    tx.transaction_ref
                                  )}
                                </TableCell>

                                <TableCell>
                                  <Chip
                                    label={`₦${safeValue(
                                      tx.amount,
                                      "0.00"
                                    )}`}
                                    sx={{
                                      bgcolor: "#DCFCE7",
                                      color: "#166534",
                                      fontWeight: 700,
                                    }}
                                  />
                                </TableCell>

                                <TableCell>
                                  {formatDate(tx.timestamp)}
                                </TableCell>

                              </TableRow>
                            ))
                          )}

                        </TableBody>
                      </Table>

                      {/* PAGINATION */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mt={2}
                      >
                        {/* <Typography fontSize={13}>
                          Showing {transactions.length} of{" "}
                          {transactionCount}
                        </Typography> */}

                        <Typography fontSize={13}>
                          Showing {showing} of {transactionCount}
                        </Typography>

                        <Stack direction="row" spacing={1}>
                          <Button
                            disabled={transactionPage === 1}
                            onClick={() =>
                              loadCustomerTransactions(
                                selected!.id,
                                transactionPage - 1
                              )
                            }
                          >
                            Prev
                          </Button>

                          <Button
                            disabled={
                              transactions.length === 0
                            }
                            onClick={() =>
                              loadCustomerTransactions(
                                selected!.id,
                                transactionPage + 1
                              )
                            }
                          >
                            Next
                          </Button>
                        </Stack>
                      </Stack>
                    </>
                  )}

                </Box>
              )}

              {/* CHARTS */}
              {/* CHARTS */}
              {viewTab === "charts" && (
                <Box p={3}>
                  <Card
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      bgcolor: "#F8FAFC",
                    }}
                  >
                    <Typography fontWeight={700} mb={1}>
                      Transaction Analytics
                    </Typography>

                    <Typography color="#64748B" mb={4}>
                      Customer payment trend
                    </Typography>

                    {chartData.length === 0 ? (
                      <Box py={8} textAlign="center">
                        <Typography color="#94A3B8">
                          No chart data available
                        </Typography>
                      </Box>
                    ) : (
                      <Box height={350}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient
                                id="colorAmount"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#2563EB"
                                  stopOpacity={0.4}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#2563EB"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="date" />

                            <YAxis />

                            <Tooltip />

                            <Area
                              type="monotone"
                              dataKey="amount"
                              stroke="#2563EB"
                              fillOpacity={1}
                              fill="url(#colorAmount)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </Card>
                </Box>
              )}

            </Box>
          </Card>
        </Box>
      )}
      {openModal && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backdropFilter: "blur(10px)",
            bgcolor: "rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
            overflow: "auto",
            py: 4,
          }}
        >
          <Card
            sx={{
              width: 900,
              maxWidth: "95vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            {/* HEADER */}
            <Box
              sx={{
                bgcolor: "#1e3a8a",
                color: "#fff",
                px: 3,
                py: 2.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                {/* <Typography fontSize={13} opacity={0.8}>
            Complete customer information and CIS setup
          </Typography> */}
                <Typography fontWeight={700} fontSize={20}>
                  {formMode === "create"
                    ? "Onboard New Customer"
                    : "Edit Customer"}
                </Typography>
              </Box>

              <IconButton
                onClick={() => setOpenModal(false)}
                sx={{ color: "#fff" }}
              >
                ✕
              </IconButton>
            </Box>

            {/* FORM */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                px: 3,
                py: 3,
              }}
            >

              {/* CUSTOMER INFORMATION */}
              <Typography
                fontWeight={700}
                mb={2}
                fontSize={16}
                color="#0F172A"
              >
                Customer Information
              </Typography>

              <Grid container spacing={2} mb={3}>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    size="small"
                    value={customerForm.name || ""}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        name: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    size="small"
                    value={customerForm.email || ""}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        email: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    size="small"
                    value={customerForm.phone_number || ""}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        phone_number: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Band"
                    size="small"
                    placeholder="Band A"
                    value={customerForm.band || ""}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        band: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={2}
                    size="small"
                    value={customerForm.address || ""}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        address: e.target.value,
                      })
                    }
                  />
                </Grid>
              </Grid>

              {/* CUSTOMER CLASSIFICATION */}
              <Typography
                fontWeight={700}
                mb={2}
                fontSize={16}
                color="#0F172A"
              >
                Customer Classification
              </Typography>

              <Grid container spacing={2} mb={3}>

                {/* CATEGORY */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={customerForm.customer_category || ""}
                      displayEmpty
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          customer_category: Number(e.target.value),
                        })
                      }
                    >
                      <MenuItem value="">
                        Select Category
                      </MenuItem>

                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* CLASS */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={customerForm.customer_class || ""}
                      displayEmpty
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          customer_class: Number(e.target.value),
                        })
                      }
                    >
                      <MenuItem value="">
                        Select Class
                      </MenuItem>

                      {classes.map((cls) => (
                        <MenuItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* METERING */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={customerForm.metering_type || ""}
                      displayEmpty
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          metering_type: Number(e.target.value),
                        })
                      }
                    >
                      <MenuItem value="">
                        Select Metering Type
                      </MenuItem>

                      {meteringTypes.map((m) => (
                        <MenuItem key={m.id} value={m.id}>
                          {m.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

              </Grid>

              {/* CIS INFORMATION */}
              <Typography
                fontWeight={700}
                mb={2}
                fontSize={16}
                color="#0F172A"
              >
                CIS Information
              </Typography>

              <Grid container spacing={2} mb={3}>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="District"
                    size="small"
                    value={customerForm.district || ""}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        district: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Feeder"
                    size="small"
                    value={customerForm.feeder || ""}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        feeder: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Transformer"
                    size="small"
                    value={customerForm.transformer || ""}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        transformer: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Service Center"
                    size="small"
                    value={customerForm.service_center || ""}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        service_center: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tariff"
                    size="small"
                    value={customerForm.tariff || ""}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        tariff: e.target.value,
                      })
                    }
                  />
                </Grid>

              </Grid>

              {/* METER TOKENS */}
              <Typography
                fontWeight={700}
                mb={2}
                fontSize={16}
                color="#0F172A"
              >
                Meter Configuration
              </Typography>

              <Grid container spacing={2}>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="KRN"
                    size="small"
                    value={customerForm.krn || ""}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        krn: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="TI"
                    size="small"
                    value={customerForm.ti || ""}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        ti: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="SGC"
                    size="small"
                    value={customerForm.sgc || ""}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        sgc: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="KCT1"
                    size="small"
                    value={customerForm.kct1 || ""}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        kct1: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="KCT2"
                    size="small"
                    value={customerForm.kct2 || ""}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        kct2: e.target.value,
                      })
                    }
                  />
                </Grid>

              </Grid>
            </Box>

            {/* FOOTER */}
            <Box
              px={3}
              py={2}
              display="flex"
              justifyContent="flex-end"
              gap={2}
              borderTop="1px solid #eee"
            >
              <Button
                variant="outlined"
                onClick={() => setOpenModal(false)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                onClick={handleSaveVendor}
                disabled={saving}
                sx={{
                  bgcolor: "#1e3a8a",
                  textTransform: "none",
                  borderRadius: 2,
                  px: 4,
                }}
              >
                {saving
                  ? "Creating..."
                  : "Create Customer"}
              </Button>
            </Box>
          </Card>


        </Box>
      )}
      <MeterActionModal
        open={modalOpen}
        title={selectedAction?.title || ""}
        fields={selectedAction?.fields || []}
        values={formValues}
        onChange={(name, value) =>
          setFormValues((prev) => ({
            ...prev,
            [name]: value,
          }))
        }
        onClose={() => {
          setModalOpen(false);
          setFormValues({});
          setSelectedAction(null);
          setActionCustomer(null);
        }}
        onSubmit={handleMeterActionSubmit}
        loading={meterActionSubmitting}
        submitDisabled={!isMeterActionFormValid()}
      />

      {/* ══════════════════════════════════════════════════════════════════
          METER ACTION RESULT — success or failure, same pattern as the
          Bulk/Single Engineering Token pages (nice pop-up, backend error
          surfaced verbatim on failure)
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={Boolean(meterActionResult?.open)} onClose={closeMeterActionResult} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pt: 3 }}>
          {meterActionResult?.success ? (
            <CheckCircleRoundedIcon sx={{ color: "#2E7D32", fontSize: 30 }} />
          ) : (
            <ErrorRoundedIcon sx={{ color: "#C62828", fontSize: 30 }} />
          )}
          <Typography variant="h6" fontWeight={600}>
            {meterActionResult?.success ? "Action Successful" : "Action Failed"}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: meterActionResult?.data ? 2 : 0 }}>
            {meterActionResult?.message}
          </Typography>

          {meterActionResult?.success && meterActionResult?.data && (
            <Box sx={{ bgcolor: "#F7F9FC", borderRadius: 2, p: 2.5 }}>
              <Grid container spacing={1.5}>
                <Grid item xs={5}>
                  <Typography variant="caption" color="text.secondary">Token</Typography>
                </Grid>
                <Grid item xs={7} sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-all" }}>
                    {meterActionResult.data.token}
                  </Typography>
                </Grid>

                {meterActionResult.data.token2 && (
                  <>
                    <Grid item xs={5}>
                      <Typography variant="caption" color="text.secondary">Token 2</Typography>
                    </Grid>
                    <Grid item xs={7} sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-all" }}>
                        {meterActionResult.data.token2}
                      </Typography>
                    </Grid>
                  </>
                )}

                <Grid item xs={5}>
                  <Typography variant="caption" color="text.secondary">Value</Typography>
                </Grid>
                <Grid item xs={7} sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Typography variant="body2" fontWeight={600}>{meterActionResult.data.value}</Typography>
                </Grid>

                <Grid item xs={5}>
                  <Typography variant="caption" color="text.secondary">Invoice ID</Typography>
                </Grid>
                <Grid item xs={7} sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Typography variant="body2" fontWeight={600}>{meterActionResult.data.invoice_id}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">{meterActionResult.data.description}</Typography>
                  <Chip
                    size="small"
                    label={meterActionResult.data.token_type}
                    sx={{ bgcolor: "#E3F2FD", color: "#1565C0", fontWeight: 600 }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          {meterActionResult?.success && meterActionResult?.data && (
            <Button
              startIcon={<ContentCopyRoundedIcon />}
              onClick={() => navigator.clipboard.writeText(meterActionResult.data!.token)}
              sx={{ textTransform: "none", color: "#203864" }}
            >
              Copy Token
            </Button>
          )}
          <Button
            variant="contained"
            onClick={closeMeterActionResult}
            sx={{
              textTransform: "none",
              bgcolor: "#17315C",
              fontWeight: 600,
              "&:hover": { bgcolor: "#10284B" },
            }}
          >
            {meterActionResult?.success ? "Done" : "Close"}
          </Button>
        </DialogActions>
      </Dialog>
      <CustomerHistoryModal
        open={historyOpen}
        user={selected}
        onClose={() => {
          setHistoryOpen(false);
          setSelected(null);
        }}
      />
    </Box>
  );
};

export default CustomerManagement;