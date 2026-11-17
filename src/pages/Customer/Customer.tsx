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
  Paper,
  Tab,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  InputLabel,
} from "@mui/material";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

import { useNavigate } from "react-router-dom";
import { Search, MoreVert, Refresh } from "@mui/icons-material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { fetchCustomers, fetchCustomer, fetchCustomerTransactions, fetchCustomerBills, createCustomer, type Customer, MeteringTypeS, CustomerClass, Customercategory, searchCustomers, type CustomerForm, EditCustomer, fetchDebt, fetchCustomerDebtAnalytic, Class, MeteringType, Category } from "../../services/vendorService";
import {
  issueEngineeringToken,
  getSavedEngineeringTokens,
  type EngineeringTokenPayload,
  type EngineeringTokenResponse,
  type SavedEngineeringToken,
} from "../../services/engineeringtokenservice";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { meterActions } from "./MeterActions";
import MeterActionModal from "./MeterActionModal";
import CustomerHistoryModal from "../Settings/CustomerHistoryModal";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import DebtBalanceModal from "./DebtBalanceModal";


const initialCustomerForm: CustomerForm = {
  name: "",
  email: "",
  phone_number: "",
  address: "",

  customer_category: 0,
  customer_class: 0,
  metering_type: 0,
  service_unit: "",
  postpaid_arrears: "0.00",
  feeder_33: "",
  district: "",
  feeder: "",
  transformer: "",
  service_center: "",

  band: "",
  tariff: "",

  krn: "",
  ti: "",
  sgc: "",
  kct1: "",
  kct2: "",
};

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = useState<Customer | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);


  const [categories, setCategories] = useState<Category[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [meteringTypes, setMeteringTypes] = useState<MeteringType[]>([]);


  // const [meteringTypes, setMeteringTypes] = useState<any[]>([]);
  // const [classes, setClasses] = useState<Class[]>([]);
  // const [categories, setCategories] = useState<any[]>([]);


  const [customerForm, setCustomerForm] =
    useState<Partial<CustomerForm>>(initialCustomerForm);
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
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(0);
  const [transactionPage, setTransactionPage] = useState(1);

  const [transactionPageSize, setTransactionPageSize] = useState(5);

  const [engineeringTokens, setEngineeringTokens] = useState<SavedEngineeringToken[]>([]);
  const [engineeringTokensLoading, setEngineeringTokensLoading] = useState(false);

  const [tokenCopied, setTokenCopied] = useState(false);

  const [anchorE2, setAnchorE2] = useState<null | HTMLElement>(null);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [actionCustomer, setActionCustomer] = useState<Customer | null>(null);
  const [meterActionSubmitting, setMeterActionSubmitting] = useState(false);
  const [meterActionResult, setMeterActionResult] = useState<{
    open: boolean;
    success: boolean;
    message: string;
    data?: EngineeringTokenResponse;
  } | null>(null);

  // Bills state
  const [bills, setBills] = useState<any[]>([]);
  const [billsLoading, setBillsLoading] = useState(false);
  const [billsCount, setBillsCount] = useState(0);
  const [billsPage, setBillsPage] = useState(1);
  const [billYear, setBillYear] = useState<string>('');
  const [billMonth, setBillMonth] = useState<string>('');
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [billDetailOpen, setBillDetailOpen] = useState(false);

  // debtBalance
  const [debtBalanceOpen, setDebtBalanceOpen] = useState(false);
  const [debts, setDebts] = useState<any[]>([]);
  const [customerAnalytic, setCustomerAnalytic] = useState<any>(null);

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    phone_number: false,
    address: false,
    customer_category: false,
    customer_class: false,
    metering_type: false,
    krn: false,
    ti: false,
    sgc: false,
    kct1: false,
    kct2: false,
  });

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
      const fieldErrors =
        err?.errors && typeof err.errors === "object"
          ? Object.values(err.errors).flat().join(" ")
          : "";

      const message =
        err ||
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

  const closeMeterActionResult = () => {
    setMeterActionResult(null);
    setTokenCopied(false);
  };

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

  const formatCurrency = (value: string | number) => {
    const n = Number(value);
    if (isNaN(n)) return "₦0.00";
    return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // const load = async (params?: any) => {
  //   setLoading(true);
  //   try {
  //     const res = await fetchCustomers({
  //       ...filters,
  //       page,
  //       ...params,
  //     });
  //     setCustomers(res.results);
  //     setCount(res.count);
  //     setNext(res.next);
  //     setPrevious(res.previous);
  //   } catch (err) {
  //     console.error(err);
  //     setCustomers([]);
  //     setCount(0);
  //     setNext(null);
  //     setPrevious(null);
  //     toast.error(getErrorMessage(err));
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const load = async (params?: any) => {
    setLoading(true);

    try {
      const res = await fetchCustomers({
        ...filters,
        page,
        ...params,
      });

      console.log("CUSTOMERS API RESPONSE:", res);

      setCustomers(Array.isArray(res?.results) ? res.results : []);
      setCount(res?.count ?? 0);
      setNext(res?.next ?? null);
      setPrevious(res?.previous ?? null);
    } catch (err) {
      console.error("FETCH CUSTOMERS ERROR:", err);

      setCustomers([]);
      setCount(0);
      setNext(null);
      setPrevious(null);

      toast.error(getErrorMessage(err));
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
      setLoading(true);
      try {
        const res = await searchCustomers(search);
        setCustomers(res.results);
        setCount(res.count);
      } catch (err) {
        console.error(err);
        setCustomers([]);
        setCount(0);
      } finally {
        setLoading(false);
      }
    }, 600);
  }, [search]);

  const loadEngineeringTokens = async (customerId: string | number) => {
    setEngineeringTokensLoading(true);
    try {
      const data = await getSavedEngineeringTokens(customerId);
      setEngineeringTokens(data);
    } catch (err) {
      console.error(err);
      setEngineeringTokens([]);
      toast.error(getErrorMessage(err));
    } finally {
      setEngineeringTokensLoading(false);
    }
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.error("Clipboard API failed, falling back", err);
    }
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      return successful;
    } catch (err) {
      console.error("Fallback clipboard copy failed", err);
      return false;
    }
  };

  const handleCopyToken = async () => {
    const token = meterActionResult?.data?.token;
    if (!token) return;
    const ok = await copyToClipboard(token);
    if (ok) {
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } else {
      toast.error("Couldn't copy the token. Please copy it manually.");
    }
  };

  const loadCustomerTransactions = async (
    customerId: string | number,
    page = 1
  ) => {
    try {
      setTransactionLoading(true);
      const res = await fetchCustomerTransactions(customerId, page);
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

  const loadCustomerBills = async (
    customerId: string | number,
    page = 1
  ) => {
    setBillsLoading(true);
    try {
      const res = await fetchCustomerBills(customerId, {
        year: billYear || undefined,
        month: billMonth || undefined,
        page,
      });
      const results = Array.isArray(res) ? res : (res.results || []);
      const count = res.count ?? results.length;
      setBills(results);
      setBillsCount(count);
      setBillsPage(page);
    } catch (err) {
      console.error(err);
      setBills([]);
      setBillsCount(0);
      toast.error(getErrorMessage(err));
    } finally {
      setBillsLoading(false);
    }
  };

  useEffect(() => {
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
      }
    };
    loadFilters();
  }, []);

  const getStatus = (c: Customer) =>
    Number(c.wallet?.balance) > 0 ? "inactive" : "active";

  const handleRowClick = async (c: Customer) => {
    try {
      const full = await fetchCustomer({ customer_id: c.id });
      setSelected(full);
      setOpenViewModal(true);
    } catch (err) {
      console.error(err);
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

  const handleOpenCreateModal = () => {
    setFormMode("create");

    setCustomerForm({
      name: "",
      email: "",
      phone_number: "",
      address: "",
      district: "",
      feeder: "",
      feeder_33: "",
      transformer: "",
      service_center: "",
      service_unit: "",
      band: "",
      tariff: "",
      postpaid_arrears: "0.00",
      customer_category: 0,
      customer_class: 0,
      metering_type: 0,
      krn: "",
      ti: "",
      sgc: "",
      kct1: "",
      kct2: "",
    });

    // setErrors({});
    setOpenModal(true);
  };

  const buildCustomerPayload = (): CustomerForm => ({
    name: customerForm.name || "",
    email: customerForm.email || "",
    phone_number: customerForm.phone_number || "",
    address: customerForm.address || "",

    customer_category: Number(customerForm.customer_category),
    customer_class: customerForm.customer_class
      ? Number(customerForm.customer_class)
      : null,
    metering_type: Number(customerForm.metering_type),
    feeder_33: customerForm.feeder_33 || "",
    postpaid_arrears: customerForm.postpaid_arrears || "0.00",
    district: customerForm.district || "",
    feeder: customerForm.feeder || "",
    transformer: customerForm.transformer || "",
    service_center: customerForm.service_center || "",
    service_unit: customerForm.service_unit || "",
    band: customerForm.band || "",
    tariff: customerForm.tariff || "",

    krn: customerForm.krn || "",
    ti: customerForm.ti || "",
    sgc: customerForm.sgc || "",
    kct1: customerForm.kct1 || "",
    kct2: customerForm.kct2 || "",
  });

  const validateCustomer = () => {
    const newErrors = {
      name: !customerForm.name,
      email: !customerForm.email,
      phone_number: !customerForm.phone_number,
      address: !customerForm.address,
      customer_category: !customerForm.customer_category,
      customer_class: formMode === "edit" && !customerForm.customer_class,
      metering_type: !customerForm.metering_type,
      krn: !customerForm.krn,
      ti: !customerForm.ti,
      sgc: !customerForm.sgc,
      kct1: !customerForm.kct1,
      kct2: !customerForm.kct2,
    };
    setErrors(newErrors);
    const valid = !Object.values(newErrors).some(Boolean);
    if (!valid) {
      toast.error("Please fill all required fields.");
    }
    return valid;
  };

  const populateCustomerForm = (customer: Customer): CustomerForm => ({
    name: customer.name || "",
    email: customer.email || "",
    phone_number: customer.phone_number || "",
    address: customer.extra_info?.address || "",

    customer_category: customer.customer_category?.id || 0,
    customer_class: customer.customer_class?.id || 0,
    metering_type: customer.metering_type?.id || 0,
    feeder_33: customer.extra_info?.feeder_33 || "",
    postpaid_arrears: customer.extra_info?.postpaid_arrears || "0.00",
    district: customer.extra_info?.district || "",
    feeder: customer.extra_info?.feeder || "",
    transformer: customer.extra_info?.transformer || "",
    service_center: customer.extra_info?.service_center || "",
    service_unit: customer.extra_info?.service_unit || "",
    band: customer.extra_info?.band || "",
    tariff: customer.extra_info?.tariff || "",

    krn: customer.extra_info?.krn || "",
    ti: customer.extra_info?.ti || "",
    sgc: customer.extra_info?.sgc || "",
    kct1: customer.extra_info?.kct1 || "",
    kct2: customer.extra_info?.kct2 || "",
  });

  const handleEditCustomer = async (customerId: string) => {
    try {
      setSaving(true);
      const customer = await fetchCustomer({ customer_id: customerId });
      setSelectedCustomer(customer);
      setCustomerForm(populateCustomerForm(customer));
      setFormMode("edit");
      setOpenModal(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCustomer = async () => {
    if (!validateCustomer()) return;
    setSaving(true);
    try {
      const payload = buildCustomerPayload();
      if (formMode === "edit" && selectedCustomer) {
        await EditCustomer(selectedCustomer.id, payload);
        toast.success("Customer updated successfully");
      } else {
        await createCustomer(payload);
        toast.success("Customer created successfully");
      }
      setCustomerForm(initialCustomerForm);
      setSelectedCustomer(null);
      setFormMode("create");
      setOpenModal(false);
      load();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleNewCustomer = () => {
    setSelectedCustomer(null);
    setCustomerForm(initialCustomerForm);
    setFormMode("create");
    setOpenModal(true);
  };

  const handleFilterChange = (key: string, value: string) => {
    setLoading(true);
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? "" : value,
    }));
    setPage(1);
  };

  useEffect(() => {
    if (!selected?.id) return;

    if (viewTab === "transactions" || viewTab === "charts") {
      loadCustomerTransactions(selected.id);
    }
    if (viewTab === "engineering" && selected?.id) {
      loadEngineeringTokens(selected.id);
    }
    if (viewTab === "bills") {
      loadCustomerBills(selected.id);
    }
  }, [viewTab, selected?.id]);
  // ── Clear customer-specific state when selected customer changes ────────────
  useEffect(() => {
    setTransactions([]);
    setTransactionCount(0);
    setTransactionPage(1);
    setBills([]);
    setBillsCount(0);
    setBillsPage(1);
    setEngineeringTokens([]);
  }, [selected?.id]);
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

  const handleDebtBalance = async (customer: Customer) => {
    try {
      const debtRes = await fetchDebt(customer.id);
      setDebts(debtRes || []);
      const analyticRes = await fetchCustomerDebtAnalytic(customer.id);
      setCustomerAnalytic(analyticRes);
      setDebtBalanceOpen(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const fmt = (n: Number) =>
    "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });

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
          <Button
            onClick={handleOpenCreateModal}
            variant="outlined"
            startIcon={<Refresh />}
            sx={{
              height: 36,
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Create Customer
          </Button>
          <Button onClick={() => load()} variant="outlined" startIcon={<Refresh />} sx={{ height: 36, textTransform: "none", borderRadius: 2 }}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* SEARCH BAR */}
      <Card sx={{ p: 2, borderRadius: 4, mb: 3, bgcolor: "#F1F5F9" }}>
        <Typography fontSize={13} fontWeight={700} color="#64748B" mb={1} sx={{ letterSpacing: 1 }}>
          QUICK SEARCH
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ flex: 1, position: "relative" }}>
            <TextField
              fullWidth
              placeholder="Search by account number or meter number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ bgcolor: "#E5E7EB", borderRadius: 3, "& fieldset": { border: "none" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#94A3B8" }} />
                  </InputAdornment>
                ),
              }}
            />
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
              <Box>
                <Typography fontWeight={700}>All Customers</Typography>
                <Typography fontSize={13} color="#64748B">
                  Showing all customers
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <FormControl size="small">
                  <Select
                    value={filters.account_status || "all"}
                    sx={{ bgcolor: "#F8FAFC", borderRadius: 2, fontSize: 13, height: 36, "& fieldset": { borderColor: "#E2E8F0" } }}
                    onChange={(e) => handleFilterChange("account_status", e.target.value)}
                  >
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <Select
                    value={filters.metering_type_id || "all"}
                    sx={{ bgcolor: "#F8FAFC", borderRadius: 2, fontSize: 13, height: 36, "& fieldset": { borderColor: "#E2E8F0" } }}
                    onChange={(e) => handleFilterChange("metering_type_id", e.target.value)}
                  >
                    <SelectItem value="all">All Metering</SelectItem>
                    {(meteringTypes ?? []).map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <Select
                    value={filters.class_id || "all"}
                    sx={{ bgcolor: "#F8FAFC", borderRadius: 2, fontSize: 13, height: 36, "& fieldset": { borderColor: "#E2E8F0" } }}
                    onChange={(e) => handleFilterChange("class_id", e.target.value)}
                  >
                    <SelectItem value="all">All Classes</SelectItem>
                    {(classes ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <Select
                    value={filters.category_id || "all"}
                    sx={{ bgcolor: "#F8FAFC", borderRadius: 2, fontSize: 13, height: 36, "& fieldset": { borderColor: "#E2E8F0" } }}
                    onChange={(e) => handleFilterChange("category_id", e.target.value)}
                  >
                    <SelectItem value="all">All Categories</SelectItem>
                    {(categories ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </Box>

          <Table>
            <TableHead>
              <TableRow sx={{ "& td": { py: 2 } }}>
                {["Customer", "Account No", "Meter No", "Class", "Category", "Metering", "Status", "Debt Balance", "Actions"].map((h) => (
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
                    <Box height={200} display="flex" alignItems="center" justifyContent="center">
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box height={200} display="flex" alignItems="center" justifyContent="center">
                      <Typography color="#94A3B8">No customers found</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                (customers ?? []).map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ color: "#94A3B8", fontWeight: 600, fontSize: 12 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "#E2E8F0", color: "#1E293B" }}>
                          {c.name?.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={500}>{c.name}</Typography>
                          <Typography fontSize={12} color="#94A3B8">{c.phone_number}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell
                      onClick={() => handleRowClick(c)}
                      sx={{
                        cursor: "pointer",
                        borderBottom: "2px solid transparent",
                        transition: "all 0.2s ease",
                        "&:hover": { borderBottom: "2px solid #1976d2", color: "#1976d2" },
                      }}
                    >
                      {c.account_number}
                    </TableCell>
                    <TableCell>{c.meter_number}</TableCell>
                    <TableCell>
                      <Chip label={c.customer_class?.name} size="small" sx={{ bgcolor: "#E2FBE8", color: "#166534" }} />
                    </TableCell>
                    <TableCell>{c.customer_category?.name}</TableCell>
                    <TableCell>
                      <Chip label={c.metering_type?.name} size="small" sx={{ bgcolor: "#EEF2FF", color: "#3730A3" }} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatus(c)}
                        size="small"
                        sx={{
                          bgcolor: getStatus(c) === "active" ? "#DCFCE7" : "#FEE2E2",
                          color: getStatus(c) === "active" ? "#166534" : "#991B1B",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        sx={{
                          bgcolor: Number(c.wallet?.balance) > 0 ? "#FEE2E2" : "#DCFCE7",
                          color: Number(c.wallet?.balance) > 0 ? "#991B1B" : "#166534",
                          cursor: "pointer",
                          borderBottom: "2px solid transparent",
                          transition: "all 0.2s ease",
                          "&:hover": { borderBottom: "2px solid #1976d2", color: "#1976d2" },
                        }}
                        size="small"
                        onClick={() => handleDebtBalance(c)}
                      >
                        ₦{c.wallet?.balance}
                      </Button>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        onClick={(e) => { setAnchorEl(e.currentTarget); setMenuRow(c); }}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )))}
            </TableBody>
          </Table>

          <Stack direction="row" justifyContent="space-between" p={2}>
            <Typography fontSize={13}>Page {page} of {count}</Typography>
            <Stack direction="row" spacing={1}>
              <Button disabled={!previous} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <Button disabled={!next} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </Stack>
          </Stack>
        </TableContainer>
      </Card>

      {/* MENU */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={async () => {
          const full = await fetchCustomer({ customer_id: menuRow!.id });
          setSelected(full);
          setOpenViewModal(true);
          setAnchorEl(null);
        }}>View</MenuItem>
        <MenuItem onClick={async () => {
          handleEditCustomer(menuRow!.id);
          setOpenModal(true);
          setAnchorEl(null);
        }}>Edit</MenuItem>
        <MenuItem onClick={async () => {
          const full = await fetchCustomer({ customer_id: menuRow!.id });
          setSelected(full);
          setOpenViewModal(true);
          setViewTab("transactions");
          await loadCustomerTransactions(full.id);
          setAnchorEl(null);
        }}>Transactions</MenuItem>
        <MenuItem onClick={async () => {
          const full = await fetchCustomer({ customer_id: menuRow!.id });
          setSelected(full);
          setOpenViewModal(true);
          setViewTab("bills");
          await loadCustomerBills(full.id);
          setAnchorEl(null);
        }}>Bills</MenuItem>
        <Divider />
        <Button endIcon={<MoreHorizIcon />} onClick={handleMenuOpen} style={{ marginLeft: "20px" }}>More</Button>
        <Menu anchorEl={anchorE2} open={Boolean(anchorE2)} onClose={handleMenuClose}>
          {(meterActions ?? []).map((action) => (
            <MenuItem key={action.id} onClick={() => {
              setSelectedAction(action);
              setActionCustomer(menuRow);
              setModalOpen(true);
              handleMenuClose();
            }}>{action.label}</MenuItem>
          ))}
        </Menu>
      </Menu>

      {/* VIEW DIALOG */}
      {openViewModal && selected && (
        <Dialog
          open={openViewModal}
          onClose={() => setOpenViewModal(false)}
          fullWidth
          maxWidth="lg"
          PaperProps={{
            sx: { height: "90vh", maxHeight: "90vh", borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column" },
          }}
        >
          <Box sx={{ bgcolor: "#1E3A8A", color: "#fff", p: 3, flexShrink: 0 }}>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography fontSize={20} fontWeight={700}>{selected.name}</Typography>
                <Typography fontSize={13}>{selected.phone_number}</Typography>
              </Box>
              <Button onClick={() => setOpenViewModal(false)} sx={{ color: "#fff" }}>Close</Button>
            </Stack>
          </Box>

          <Box sx={{ flexShrink: 0, borderBottom: "1px solid #E2E8F0", overflowX: "auto" }}>
            <Tabs value={viewTab} onChange={(e, v) => setViewTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile sx={{ minHeight: 48, "& .MuiTab-root": { minWidth: "auto", px: 2, whiteSpace: "nowrap" } }}>
              <Tab label="Overview" value="overview" />
              <Tab label="CIS Information" value="cis" />
              <Tab label="Transactions" value="transactions" />
              <Tab label="Charts" value="charts" />
              <Tab label="Bills" value="bills" />
              <Tab label="Engineering Tokens" value="engineering" />
            </Tabs>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
            {/* OVERVIEW */}
            {viewTab === "overview" && (
              <Box p={3}>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">Customer Name</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.name)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">Phone Number</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.phone_number)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">Account Number</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.account_number)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">Meter Number</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.meter_number)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">Wallet Balance</Typography>
                    <Typography fontWeight={700}>₦{safeValue(selected?.wallet?.balance, "0.00")}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">Wallet Type</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.wallet?.wallet_type?.name)}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* CIS INFORMATION */}
            {viewTab === "cis" && (
              <Box p={3}>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">District / Branch</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.extra_info?.district)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">Customer Category</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.customer_category?.name)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">Feeder</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.extra_info?.feeder)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">Feeder 33</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.extra_info?.feeder_33)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">Transformer</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.extra_info?.transformer)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">Service Center</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.extra_info?.service_center)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">Service Unit</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.extra_info?.service_unit)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">Band</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.extra_info?.band)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">Tariff</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.extra_info?.tariff)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">Postpaid Arrears</Typography>
                    <Typography fontWeight={700}>₦{safeValue(selected?.extra_info?.postpaid_arrears, "0.00")}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography fontSize={12} color="#94A3B8">Address</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.extra_info?.address)}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography fontSize={13} fontWeight={700} color="#0F172A" mt={1}>Meter Configuration</Typography>
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <Typography fontSize={12} color="#94A3B8">KRN</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.extra_info?.krn)}</Typography>
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <Typography fontSize={12} color="#94A3B8">TI</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.extra_info?.ti)}</Typography>
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <Typography fontSize={12} color="#94A3B8">SGC</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.extra_info?.sgc)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">KCT1</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.extra_info?.kct1)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={12} color="#94A3B8">KCT2</Typography>
                    <Typography fontWeight={700}>{safeValue(selected?.extra_info?.kct2)}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* TRANSACTIONS */}
            {viewTab === "transactions" && (
              <Box p={3}>
                {transactionLoading ? (
                  <Box height={250} display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Vendor</TableCell>
                          <TableCell>Token</TableCell>
                          <TableCell>Reference</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6}>
                              <Box py={6} textAlign="center">
                                <Typography color="#94A3B8">No transactions found</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ) : (
                          (transactions ?? []).map((tx) => (
                            <TableRow key={tx.id} hover>
                              <TableCell>{safeValue(tx.id)}</TableCell>
                              <TableCell>
                                <Stack spacing={0.5}>
                                  <Typography fontWeight={600} fontSize={13}>{safeValue(tx.vendor?.business_name)}</Typography>
                                  <Typography fontSize={11} color="#94A3B8">{safeValue(tx.vendor?.email)}</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Typography fontSize={12} sx={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {safeValue(tx.token)}
                                </Typography>
                              </TableCell>
                              <TableCell>{safeValue(tx.transaction_ref)}</TableCell>
                              <TableCell>
                                <Chip label={`₦${safeValue(tx.amount, "0.00")}`} sx={{ bgcolor: "#DCFCE7", color: "#166534", fontWeight: 700 }} />
                              </TableCell>
                              <TableCell>{formatDate(tx.timestamp)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                      <Typography fontSize={13}>Showing {transactions.length} of {transactionCount}</Typography>
                      <Stack direction="row" spacing={1}>
                        <Button disabled={transactionPage === 1} onClick={() => loadCustomerTransactions(selected!.id, transactionPage - 1)}>Prev</Button>
                        <Button disabled={transactions.length === 0} onClick={() => loadCustomerTransactions(selected!.id, transactionPage + 1)}>Next</Button>
                      </Stack>
                    </Stack>
                  </>
                )}
              </Box>
            )}

            {/* CHARTS — BAR CHART */}
            {viewTab === "charts" && (
              <Box p={3}>
                <Card sx={{ p: 4, borderRadius: 4, bgcolor: "#F8FAFC" }}>
                  <Typography fontWeight={700} mb={1}>Transaction Analytics</Typography>
                  <Typography color="#64748B" mb={4}>Customer payment trend</Typography>
                  {chartData.length === 0 ? (
                    <Box py={8} textAlign="center">
                      <Typography color="#94A3B8">No chart data available</Typography>
                    </Box>
                  ) : (
                    <Box height={350}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value: any) => `₦${Number(value).toLocaleString()}`} />
                          <Bar dataKey="amount" fill="#2563EB" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </Card>
              </Box>
            )}

            {/* BILLS */}
            {viewTab === "bills" && (
              <Box p={3}>
                {/* Filters */}
                <Card sx={{ p: 2, borderRadius: 3, mb: 3, bgcolor: "#F8FAFC" }}>
                  <Typography fontSize={13} fontWeight={700} color="#64748B" mb={1.5} sx={{ letterSpacing: 0.5 }}>
                    BILL FILTERS
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                    <TextField
                      type="number"
                      label="Year"
                      size="small"
                      value={billYear}
                      onChange={(e) => setBillYear(e.target.value)}
                      placeholder="e.g. 2026"
                      sx={{ minWidth: 140, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff" } }}
                    />
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>Month</InputLabel>
                      <Select
                        value={billMonth}
                        label="Month"
                        onChange={(e) => setBillMonth(e.target.value)}
                        sx={{ borderRadius: 2, bgcolor: "#fff" }}
                      >
                        <MenuItem value="">All Months</MenuItem>
                        {Array.from({ length: 12 }, (_, i) => (
                          <MenuItem key={i + 1} value={String(i + 1)}>
                            {new Date(2000, i).toLocaleString("default", { month: "long" })}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      onClick={() => loadCustomerBills(selected!.id, 1)}
                      sx={{ bgcolor: "#1E3A8A", textTransform: "none", borderRadius: 2, px: 3 }}
                    >
                      Filter Bills
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => { setBillYear(""); setBillMonth(""); loadCustomerBills(selected!.id, 1); }}
                      sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                      Reset
                    </Button>
                  </Stack>
                </Card>

                {billsLoading ? (
                  <Box height={250} display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#F1F5F9" }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Period</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Tariff</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Band</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Consumed (kWh)</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Total Due</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Bill Type</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align="right">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {bills.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8}>
                                <Box py={6} textAlign="center">
                                  <ReceiptLongIcon sx={{ fontSize: 40, color: "#CBD5E1", mb: 1 }} />
                                  <Typography color="#94A3B8">No bills found for this customer</Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ) : (
                            (bills ?? []).map((bill) => (
                              <TableRow
                                key={bill.id}
                                hover
                                sx={{ cursor: "pointer" }}
                                onClick={() => { setSelectedBill(bill); setBillDetailOpen(true); }}
                              >
                                <TableCell>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <CalendarMonthIcon sx={{ fontSize: 16, color: "#64748B" }} />
                                    <Typography fontWeight={600} fontSize={13}>
                                      {bill.month_name} {bill.year}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={bill.status || "N/A"}
                                    size="small"
                                    sx={{
                                      bgcolor: bill.status?.toLowerCase() === "paid" ? "#DCFCE7" : "#FEF3C7",
                                      color: bill.status?.toLowerCase() === "paid" ? "#166534" : "#92400E",
                                      fontWeight: 700,
                                      textTransform: "capitalize",
                                    }}
                                  />
                                </TableCell>
                                <TableCell>{safeValue(bill.tariff_name)}</TableCell>
                                <TableCell>{safeValue(bill.band)}</TableCell>
                                <TableCell>{safeValue(bill.consumed_kwh)}</TableCell>
                                <TableCell>
                                  <Typography fontWeight={700} color="#1E3A8A">
                                    {formatCurrency(bill.charge?.total_due)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={safeValue(bill.bill_type)} size="small" variant="outlined" sx={{ textTransform: "capitalize" }} />
                                </TableCell>
                                <TableCell align="right">
                                  <Button size="small" variant="outlined" sx={{ borderRadius: 2, textTransform: "none" }}>
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                      <Typography fontSize={13} color="#64748B">
                        Showing {bills.length} of {billsCount} bills
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button disabled={billsPage === 1} onClick={() => loadCustomerBills(selected!.id, billsPage - 1)}>Prev</Button>
                        <Button disabled={bills.length === 0} onClick={() => loadCustomerBills(selected!.id, billsPage + 1)}>Next</Button>
                      </Stack>
                    </Stack>
                  </>
                )}
              </Box>
            )}

            {/* ENGINEERING TOKENS */}
            {viewTab === "engineering" && (
              <Box p={3}>
                {engineeringTokensLoading ? (
                  <Box height={250} display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ overflowX: "auto" }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Vend Type</TableCell>
                          <TableCell>Meter Number</TableCell>
                          <TableCell>Token</TableCell>
                          <TableCell>Token 2</TableCell>
                          <TableCell>Units / Amount</TableCell>
                          <TableCell>Reason</TableCell>
                          <TableCell>Invoice ID</TableCell>
                          <TableCell>KRN / TI / SGC</TableCell>
                          <TableCell>Issued By</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {engineeringTokens.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10}>
                              <Box py={6} textAlign="center">
                                <Typography color="#94A3B8">No engineering tokens found for this customer</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ) : (
                          (engineeringTokens ?? []).map((t) => (
                            <TableRow key={t.id} hover>
                              <TableCell>
                                <Chip label={t.vend_type} size="small" sx={{ bgcolor: "#EEF2FF", color: "#3730A3", textTransform: "capitalize" }} />
                              </TableCell>
                              <TableCell>{safeValue(t.meter_number)}</TableCell>
                              <TableCell>
                                <Typography fontSize={12} sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {safeValue(t.token)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography fontSize={12} sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {safeValue(t.token2)}
                                </Typography>
                              </TableCell>
                              <TableCell>{safeValue(t.units || t.amount)}</TableCell>
                              <TableCell>
                                <Typography fontSize={12} sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {safeValue(t.reason)}
                                </Typography>
                              </TableCell>
                              <TableCell>{safeValue(t.invoice_id)}</TableCell>
                              <TableCell>{[t.krn, t.ti, t.sgc].filter(Boolean).join(" / ") || "N/A"}</TableCell>
                              <TableCell>{safeValue(t.issued_by)}</TableCell>
                              <TableCell>{formatDate(t.timestamp)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Dialog>
      )}

      {openModal && (
        <Box sx={{ position: "fixed", inset: 0, backdropFilter: "blur(10px)", bgcolor: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300, overflow: "auto", py: 4 }}>
          <Card sx={{ width: 900, maxWidth: "95vw", maxHeight: "90vh", display: "flex", flexDirection: "column", borderRadius: 4, overflow: "hidden" }}>
            <Box sx={{ bgcolor: "#1e3a8a", color: "#fff", px: 3, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography fontWeight={700} fontSize={20}>
                  {formMode === "create" ? "Onboard New Customer" : "Edit Customer"}
                </Typography>
              </Box>
              <IconButton onClick={() => setOpenModal(false)} sx={{ color: "#fff" }}>✕</IconButton>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3 }}>
              <Typography fontWeight={700} mb={2} fontSize={16} color="#0F172A">Customer Information</Typography>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Customer Name" size="small" value={customerForm.name || ""} error={errors.name} helperText={errors.name ? "Customer name is required" : ""}
                    onChange={(e) => { setCustomerForm({ ...customerForm, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: false }); }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Email Address" size="small" value={customerForm.email || ""} error={errors.email} helperText={errors.email ? "Email is required" : ""}
                    onChange={(e) => { setCustomerForm({ ...customerForm, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: false }); }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Phone Number" size="small" value={customerForm.phone_number || ""} error={errors.phone_number} helperText={errors.phone_number ? "Phone number is required" : ""}
                    onChange={(e) => { setCustomerForm({ ...customerForm, phone_number: e.target.value }); if (errors.phone_number) setErrors({ ...errors, phone_number: false }); }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Band" size="small" placeholder="Band A" value={customerForm?.band || ""}
                    onChange={(e) => setCustomerForm({ ...customerForm, band: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Address" multiline rows={2} size="small" value={customerForm.address || ""} error={errors.address} helperText={errors.address ? "Address is required" : ""}
                    onChange={(e) => { setCustomerForm({ ...customerForm, address: e.target.value }); if (errors.address) setErrors({ ...errors, address: false }); }} />
                </Grid>
              </Grid>

              <Typography fontWeight={700} mb={2} fontSize={16} color="#0F172A">Customer Classification</Typography>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small" error={errors.customer_category}>
                    <Select value={customerForm.customer_category || ""} displayEmpty
                      onChange={(e) => { setCustomerForm({ ...customerForm, customer_category: Number(e.target.value) }); if (errors.customer_category) setErrors({ ...errors, customer_category: false }); }}>
                      <MenuItem value=""><em>Select Category</em></MenuItem>
                      {(categories ?? []).map((cat) => (<MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>))}
                    </Select>
                    {errors.customer_category && <FormHelperText>Customer category is required</FormHelperText>}
                  </FormControl>
                </Grid>
                {/* <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small" error={errors.customer_class}>
                    <Select value={customerForm.customer_class || ""} displayEmpty
                      onChange={(e) => { setCustomerForm({ ...customerForm, customer_class: Number(e.target.value) }); if (errors.customer_class) setErrors({ ...errors, customer_class: false }); }}>
                      <MenuItem value="">Select Class (Optional)</MenuItem>
                      {(classes ?? []).map((cls) => (<MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>))}
                    </Select>
                     {errors.customer_class && <FormHelperText>Customer class is required</FormHelperText>}
                  </FormControl>
                </Grid> */}
                <Grid item xs={12} md={4}>
  <FormControl fullWidth size="small" error={errors.customer_class}>
    <Select
      value={customerForm.customer_class || ""}
      displayEmpty
      onChange={(e) => {
        setCustomerForm({
          ...customerForm,
          customer_class: Number(e.target.value),
        });

        if (errors.customer_class) {
          setErrors({
            ...errors,
            customer_class: false,
          });
        }
      }}
    >
      <MenuItem value="">
        Select Customer Class 
      </MenuItem>

      {(classes ?? []).map((cls) => (
        <MenuItem key={cls.id} value={cls.id}>
          {cls.name}
        </MenuItem>
      ))}
    </Select>

    {errors.customer_class && (
      <FormHelperText>
        Customer class is required
      </FormHelperText>
    )}
  </FormControl>
</Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small" error={errors.metering_type}>
                    <Select value={customerForm.metering_type || ""} displayEmpty
                      onChange={(e) => { setCustomerForm({ ...customerForm, metering_type: Number(e.target.value) }); if (errors.metering_type) setErrors({ ...errors, metering_type: false }); }}>
                      <MenuItem value="">Select Metering Type</MenuItem>
                      {(meteringTypes ?? []).map((m) => (<MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>))}
                    </Select>
                    {errors.metering_type && <FormHelperText>Metering type is required</FormHelperText>}
                  </FormControl>
                </Grid>
              </Grid>

              <Typography fontWeight={700} mb={2} fontSize={16} color="#0F172A">CIS Information</Typography>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="District" size="small" value={customerForm.district || ""}
                    onChange={(e) => setCustomerForm({ ...customerForm, district: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Feeder" size="small" value={customerForm.feeder || ""}
                    onChange={(e) => setCustomerForm({ ...customerForm, feeder: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Feeder 33" size="small" value={customerForm.feeder_33 || ""}
                    onChange={(e) => setCustomerForm({ ...customerForm, feeder_33: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Service Unit" size="small" value={customerForm.service_unit || ""}
                    onChange={(e) => setCustomerForm({ ...customerForm, service_unit: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Transformer" size="small" value={customerForm.transformer || ""}
                    onChange={(e) => setCustomerForm({ ...customerForm, transformer: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Service Center" size="small" value={customerForm.service_center || ""}
                    onChange={(e) => setCustomerForm({ ...customerForm, service_center: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Tariff" size="small" value={customerForm.tariff || ""}
                    onChange={(e) => setCustomerForm({ ...customerForm, tariff: e.target.value })} />
                </Grid>
              </Grid>

              <Typography fontWeight={700} mb={2} fontSize={16} color="#0F172A">Meter Configuration</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="KRN" size="small" value={customerForm.krn || ""} error={errors.krn} helperText={errors.krn ? "KRN is required" : ""}
                    onChange={(e) => { setCustomerForm({ ...customerForm, krn: e.target.value }); if (errors.krn) setErrors({ ...errors, krn: false }); }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="TI" size="small" value={customerForm.ti || ""} error={errors.ti} helperText={errors.ti ? "TI is required" : ""}
                    onChange={(e) => { setCustomerForm({ ...customerForm, ti: e.target.value }); if (errors.ti) setErrors({ ...errors, ti: false }); }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="SGC" size="small" value={customerForm.sgc || ""} error={errors.sgc} helperText={errors.sgc ? "SGC is required" : ""}
                    onChange={(e) => { setCustomerForm({ ...customerForm, sgc: e.target.value }); if (errors.sgc) setErrors({ ...errors, sgc: false }); }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="KCT1" size="small" value={customerForm.kct1 || ""} error={errors.kct1} helperText={errors.kct1 ? "KCT1 is required" : ""}
                    onChange={(e) => { setCustomerForm({ ...customerForm, kct1: e.target.value }); if (errors.kct1) setErrors({ ...errors, kct1: false }); }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="KCT2" size="small" value={customerForm.kct2 || ""} error={errors.kct2} helperText={errors.kct2 ? "KCT2 is required" : ""}
                    onChange={(e) => { setCustomerForm({ ...customerForm, kct2: e.target.value }); if (errors.kct2) setErrors({ ...errors, kct2: false }); }} />
                </Grid>
              </Grid>
            </Box>

            <Box px={3} py={2} display="flex" justifyContent="flex-end" gap={2} borderTop="1px solid #eee">
              <Button variant="outlined" onClick={() => setOpenModal(false)} sx={{ textTransform: "none", borderRadius: 2 }}>Cancel</Button>
              <Button variant="contained" onClick={handleSaveCustomer} disabled={saving}
                sx={{ bgcolor: "#1e3a8a", textTransform: "none", borderRadius: 2, px: 4 }}>
                {saving ? (formMode === "edit" ? "Updating..." : "Creating...") : (formMode === "edit" ? "Update Customer" : "Create Customer")}
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
        onChange={(name, value) => setFormValues((prev) => ({ ...prev, [name]: value }))}
        onClose={() => { setModalOpen(false); setFormValues({}); setSelectedAction(null); setActionCustomer(null); }}
        onSubmit={handleMeterActionSubmit}
        loading={meterActionSubmitting}
        submitDisabled={!isMeterActionFormValid()}
      />

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
                <Grid item xs={5}><Typography variant="caption" color="text.secondary">Token</Typography></Grid>
                <Grid item xs={7} sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-all" }}>{meterActionResult.data.token}</Typography>
                </Grid>
                {meterActionResult.data.token2 && (
                  <>
                    <Grid item xs={5}><Typography variant="caption" color="text.secondary">Token 2</Typography></Grid>
                    <Grid item xs={7} sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-all" }}>{meterActionResult.data.token2}</Typography>
                    </Grid>
                  </>
                )}
                <Grid item xs={5}><Typography variant="caption" color="text.secondary">Value</Typography></Grid>
                <Grid item xs={7} sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Typography variant="body2" fontWeight={600}>{meterActionResult.data.value}</Typography>
                </Grid>
                <Grid item xs={5}><Typography variant="caption" color="text.secondary">Invoice ID</Typography></Grid>
                <Grid item xs={7} sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Typography variant="body2" fontWeight={600}>{meterActionResult.data.invoice_id}</Typography>
                </Grid>
                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">{meterActionResult.data.description}</Typography>
                  <Chip size="small" label={meterActionResult.data.token_type} sx={{ bgcolor: "#E3F2FD", color: "#1565C0", fontWeight: 600 }} />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {meterActionResult?.success && meterActionResult?.data && (
            <Button startIcon={tokenCopied ? <CheckCircleRoundedIcon sx={{ fontSize: 18 }} /> : <ContentCopyRoundedIcon />}
              onClick={handleCopyToken} sx={{ textTransform: "none", color: tokenCopied ? "#2E7D32" : "#203864" }}>
              {tokenCopied ? "Copied!" : "Copy Token"}
            </Button>
          )}
          <Button variant="contained" onClick={closeMeterActionResult}
            sx={{ textTransform: "none", bgcolor: "#17315C", fontWeight: 600, "&:hover": { bgcolor: "#10284B" } }}>
            {meterActionResult?.success ? "Done" : "Close"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════
          BILL DETAIL DIALOG — shows full breakdown of a selected bill
      ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={billDetailOpen} onClose={() => setBillDetailOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}>
        {selectedBill && (
          <>
            <Box sx={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)", px: 3, pt: 3, pb: 2.5, color: "#fff", position: "relative" }}>
              <IconButton onClick={() => setBillDetailOpen(false)} size="small"
                sx={{ position: "absolute", top: 12, right: 12, color: "#93c5fd", "&:hover": { color: "#fff" } }}>
                ✕
              </IconButton>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
                <ReceiptLongIcon sx={{ fontSize: 24 }} />
                <Typography variant="h6" fontWeight={800}>Bill Details</Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: "#93c5fd" }}>
                {selectedBill.month_name} {selectedBill.year} · {safeValue(selectedBill.account_number)}
              </Typography>
            </Box>

            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Status & Meta */}
                <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                  <Chip
                    label={selectedBill.status || "N/A"}
                    sx={{
                      bgcolor: selectedBill.status?.toLowerCase() === "paid" ? "#DCFCE7" : "#FEF3C7",
                      color: selectedBill.status?.toLowerCase() === "paid" ? "#166534" : "#92400E",
                      fontWeight: 800,
                      textTransform: "capitalize",
                    }}
                  />
                  <Chip label={safeValue(selectedBill.bill_type)} variant="outlined" sx={{ textTransform: "capitalize" }} />
                  <Typography variant="caption" color="text.secondary">
                    Issued {formatDate(selectedBill.created_at)}
                  </Typography>
                </Stack>

                <Grid container spacing={3}>
                  {/* Meter Readings */}
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#f8faff", height: "100%" }}>
                      <Typography variant="subtitle2" fontWeight={800} color="primary" gutterBottom>
                        Meter Readings
                      </Typography>
                      <Stack spacing={1.2}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Previous Read</Typography>
                          <Typography variant="body2" fontWeight={700}>{safeValue(selectedBill.previous_read)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Current Read</Typography>
                          <Typography variant="body2" fontWeight={700}>{safeValue(selectedBill.current_read)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Read Value</Typography>
                          <Typography variant="body2" fontWeight={700}>{safeValue(selectedBill.read_value)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Rollover Value</Typography>
                          <Typography variant="body2" fontWeight={700}>{safeValue(selectedBill.rollover_value)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Stored Value</Typography>
                          <Typography variant="body2" fontWeight={700}>{safeValue(selectedBill.stored_value)}</Typography>
                        </Stack>
                        <Divider sx={{ my: 0.5 }} />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Consumed kWh</Typography>
                          <Typography variant="body2" fontWeight={800} color="primary">{safeValue(selectedBill.consumed_kwh)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Read Mode</Typography>
                          <Typography variant="body2" fontWeight={600}>{safeValue(selectedBill.read_mode)}</Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Customer Info */}
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#f8faff", height: "100%" }}>
                      <Typography variant="subtitle2" fontWeight={800} color="success.main" gutterBottom>
                        Customer & Tariff Info
                      </Typography>
                      <Stack spacing={1.2}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Account Number</Typography>
                          <Typography variant="body2" fontWeight={700}>{safeValue(selectedBill.account_number)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Customer Class</Typography>
                          <Typography variant="body2" fontWeight={700}>{safeValue(selectedBill.customer_class)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Tariff Name</Typography>
                          <Typography variant="body2" fontWeight={700}>{safeValue(selectedBill.tariff_name)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Tariff Rate</Typography>
                          <Typography variant="body2" fontWeight={700}>{safeValue(selectedBill.tariff_rate)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Band</Typography>
                          <Typography variant="body2" fontWeight={700}>{safeValue(selectedBill.band)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Feeder</Typography>
                          <Typography variant="body2" fontWeight={700}>{safeValue(selectedBill.feeder)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Average</Typography>
                          <Typography variant="body2" fontWeight={700}>{safeValue(selectedBill.average)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Estimated</Typography>
                          <Typography variant="body2" fontWeight={700}>{safeValue(selectedBill.estimated)}</Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Charges */}
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#f8faff" }}>
                      <Typography variant="subtitle2" fontWeight={800} color="warning.main" gutterBottom>
                        Charge Breakdown
                      </Typography>
                      <Grid container spacing={0}>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between" sx={{ py: 0.6, borderBottom: "1px dashed #e2e8f0" }}>
                              <Typography variant="body2" color="text.secondary">Month Due</Typography>
                              <Typography variant="body2" fontWeight={700}>{formatCurrency(selectedBill.charge?.month_due)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" sx={{ py: 0.6, borderBottom: "1px dashed #e2e8f0" }}>
                              <Typography variant="body2" color="text.secondary">Billed Amount</Typography>
                              <Typography variant="body2" fontWeight={700}>{formatCurrency(selectedBill.charge?.billed_amount)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" sx={{ py: 0.6, borderBottom: "1px dashed #e2e8f0" }}>
                              <Typography variant="body2" color="text.secondary">VAT</Typography>
                              <Typography variant="body2" fontWeight={700}>{formatCurrency(selectedBill.charge?.vat)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" sx={{ py: 0.6, borderBottom: "1px dashed #e2e8f0" }}>
                              <Typography variant="body2" color="text.secondary">Net Arrears</Typography>
                              <Typography variant="body2" fontWeight={700}>{formatCurrency(selectedBill.charge?.net_arrears)}</Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between" sx={{ py: 0.6, borderBottom: "1px dashed #e2e8f0" }}>
                              <Typography variant="body2" color="text.secondary">Previous Balance</Typography>
                              <Typography variant="body2" fontWeight={700}>{formatCurrency(selectedBill.charge?.previous_balance)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" sx={{ py: 0.6, borderBottom: "1px dashed #e2e8f0" }}>
                              <Typography variant="body2" color="text.secondary">Last Payment</Typography>
                              <Typography variant="body2" fontWeight={700}>{formatCurrency(selectedBill.charge?.last_payment)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" sx={{ py: 0.6, borderBottom: "1px dashed #e2e8f0" }}>
                              <Typography variant="body2" color="text.secondary">Total Paid</Typography>
                              <Typography variant="body2" fontWeight={700}>{formatCurrency(selectedBill.charge?.total_paid)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" sx={{ py: 0.6, bgcolor: "#fff7ed", px: 1, borderRadius: 1 }}>
                              <Typography variant="body2" fontWeight={800} color="warning.dark">TOTAL DUE</Typography>
                              <Typography variant="body2" fontWeight={800} color="warning.dark">{formatCurrency(selectedBill.charge?.total_due)}</Typography>
                            </Stack>
                            {/* <Stack direction="row" justifyContent="space-between" sx={{ py: 0.6, bgcolor: "#f0fdf4", px: 1, borderRadius: 1 }}>
                              <Typography variant="body2" fontWeight={800} color="success.dark">TOTAL BILL</Typography>
                              <Typography variant="body2" fontWeight={800} color="success.dark">{formatCurrency(selectedBill.charge?.total_bill)}</Typography>
                            </Stack> */}
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
              <Button fullWidth variant="outlined" onClick={() => setBillDetailOpen(false)} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <CustomerHistoryModal
        open={historyOpen}
        user={selected}
        onClose={() => { setHistoryOpen(false); setSelected(null); }}
      />
      <DebtBalanceModal
        open={debtBalanceOpen}
        onClose={() => setDebtBalanceOpen(false)}
        debts={debts}
        customerAnalytic={customerAnalytic}
        fmt={fmt}
      />
    </Box>
  );
};

export default CustomerManagement;