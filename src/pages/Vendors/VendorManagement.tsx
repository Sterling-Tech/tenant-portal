import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Button,
  Stack,
  Checkbox,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  FormControl,
  Pagination,
  ListItemIcon,
  Autocomplete, Snackbar, Alert,
  Grid, CircularProgress
} from "@mui/material";
import {
  Search,
  MoreVert,
  Refresh,
  CheckCircle,
  Cancel,
  Visibility,
  Edit,
  Delete,
} from "@mui/icons-material";
import { fetchVendors, createVendor, type VendorForm, Vendor, searchVendors, toggleVendorStatus } from "../../services/vendorService";
import VendorHistoryModal from "../Settings/VendorHistoryModal";

const PAGE_SIZE = 10;

const formatCurrency = (val: any) => {
  const num = Number(val || 0);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(num);
};


export default function VendorHub() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuVendor, setMenuVendor] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);


  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  type AlertType = "success" | "error" | "info" | "warning";

  const [alert, setAlert] = useState<{
    open: boolean;
    type: AlertType;
    message: string;
  }>({
    open: false,
    type: "success",
    message: "",
  });


  const formatDateTime = (date: string) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const clickOutside = (e: any) => {
    if (e.target === e.currentTarget) {
      setOpenModal(false);
    };
  }

  const truncate = (text: string, max = 25) => {
    if (!text) return "-";
    return text.length > max ? text.slice(0, max) + "..." : text;
  };
  // ✅ Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);


  const load = async (pageNumber = 1) => {
    try {
      setLoading(true);

      // SEARCH MODE
      if (debouncedSearch.trim()) {
        const res = await searchVendors(
          debouncedSearch,
          pageNumber
        );

        setVendors(res.results);
        setCount(res.count);
        setNext(res.next);
        setPrevious(res.previous);
        setSelected(res.results.length ? res.results[0] : null);

        return;
      }

      // NORMAL MODE
      const res = await fetchVendors({
        page: pageNumber,
        main_vendor: true,
        account_status:
          statusFilter === "all"
            ? undefined
            : (statusFilter as
              | "active"
              | "inactive"
              | "suspended"),
      });

      setVendors(res.results);
      setCount(res.count);
      setNext(res.next);
      setPrevious(res.previous);
      setSelected(res.results.length ? res.results[0] : null);
    } catch (err) {
      console.error(err);

      setVendors([]);
      setCount(0);
      setNext(null);
      setPrevious(null);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page, debouncedSearch, statusFilter]);


  const handleToggleStatus = async (vendor: Vendor) => {
    try {
      await toggleVendorStatus(vendor.id);

      await load(page); // wait for reload

      setAnchorEl(null);
    } catch (err) {
      console.error("TOGGLE ERROR:", err);
    }
  };



  return (
    <Box
      // p={2}
      bgcolor="#f5f7fb"
      //minHeight="100vh"
      sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
    >
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Box>
          <Typography fontSize={28} fontWeight={700}>
            Vendor Hub
          </Typography>
          <Typography color="text.secondary">
            All vendors, details and all activity
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            onClick={() => {
              setSearch("");
              setDebouncedSearch("");
              setStatusFilter("all");
              setPage(1);
            }}
          >
            Refresh
          </Button>

        </Stack>
      </Stack>


      <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
        {/* TABLE */}
        <Card sx={{ flex: 2, borderRadius: 3, overflowX: "auto" }}>
          {/* SEARCH */}
          <Stack sx={{ p: 2 }} direction="row" spacing={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {/* <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                sx={{
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "#fff",
                  fontSize: 14,
                }}
              >
                <MenuItem value="all">
                  <Typography fontSize={14}>All Status</Typography>
                </MenuItem>

                <MenuItem value="active">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" color="success" label="Active" />
                  </Stack>
                </MenuItem>

                <MenuItem value="suspended">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" label="Inactive" />
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl> */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* TABLE */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Business</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Wallet</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <Box py={3} textAlign="center">
                  <CircularProgress size={24} />
                </Box>
              ) : (
                (vendors || []).map((v) => (
                  <TableRow
                    key={v.id}
                    hover
                    selected={selected?.id === v.id}
                    onClick={() => setSelected(v)}
                    sx={{ cursor: "pointer" }}
                  >

                    <TableCell>
                      <Stack direction="row" spacing={2}>
                        <Avatar>
                          {v.business_name?.charAt(0)}
                        </Avatar>

                        <Typography
                          fontWeight={500}
                          sx={{
                            maxWidth: 150,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {v.business_name}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>{v.email}</TableCell>

                    <TableCell>
                      <Chip
                        label={v.account_status}
                        color={
                          v.account_status === "active"
                            ? "success"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      {formatCurrency(v.wallet?.balance)}
                    </TableCell>

                    <TableCell>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setAnchorEl(e.currentTarget);
                          setMenuVendor(v); // ✅ THIS WAS MISSING
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-gray-500">
              Showing page {page} • {count} total vendors
            </div>

            <div className="flex gap-2">
              <button
                disabled={!previous}
                onClick={() => previous && setPage((p) => p - 1)}
                className={`px-4 py-2 rounded-lg border ${previous
                  ? "bg-white hover:bg-gray-100"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Previous
              </button>

              <button
                disabled={!next}
                onClick={() => next && setPage((p) => p + 1)}
                className={`px-4 py-2 rounded-lg border ${next
                  ? "bg-blue-900 text-white hover:bg-blue-800"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        </Card>

        {/* DETAILS */}
        <Card
          sx={{
            flex: 1,
            borderRadius: 3,
            height: 500,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {!selected ? (
            <Box display="flex" flex={1} alignItems="center" justifyContent="center">
              <Typography color="text.secondary">
                No data selected / clicked
              </Typography>
            </Box>
          ) : (
            <>
              {/* HEADER */}
              <Box bgcolor="#1e3a8a" color="#fff" p={2}>
                <Typography fontWeight={700}>
                  {selected.business_name}
                </Typography>
                <Typography fontSize={12}>{selected.email}</Typography>

                <Stack direction="row" spacing={1} mt={1}>
                  <Chip
                    label={selected.account_status}
                    size="small"
                    color={
                      selected.account_status === "active"
                        ? "success"
                        : "default"
                    }
                  />
                  <Chip label="verified" size="small" />
                </Stack>
              </Box>

              {/* BODY */}
              <Box
                p={2}
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Stack spacing={2}>
                  <Row label="Phone" value={selected.phone_number} />
                  <Row label="Address" value={selected.address} />
                  <Row
                    label="Location"
                    value={`${selected.city || ""}, ${selected.state || ""}, ${selected.country || ""}`}
                  />
                  <Row label="Postal Code" value={selected.postal_code} />
                  {/* <Row label="Address" value={selected.profile?.address} />

                  <Row
                    label="Location"
                    value={`${selected.profile?.city || ""}, ${selected.profile?.state || ""}`}
                  />

                  <Row
                    label="Postal Code"
                    value={selected.profile?.postal_code}
                  /> */}

                  <Row label="Hierarchy" value={selected.hierachy} />

                  <Row
                    label="Wallet Balance"
                    value={formatCurrency(selected.wallet?.balance)}
                  />

                  <Row
                    label="Wallet Type"
                    value={selected.wallet?.wallet_type?.name}
                  />

                  <Row
                    label="Onboarded"
                    value={formatDateTime(selected.created_at)}
                  />

                  {/* TOKEN WITH COPY */}
                  <Box>
                    <Typography color="text.secondary" fontSize={13}>
                      API Token
                    </Typography>

                    <Box
                      mt={0.5}
                      px={1.5}
                      py={1}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        border: "1px solid #eee",
                        borderRadius: 2,
                        bgcolor: "#fafafa",
                      }}
                    >
                      <Typography
                        fontSize={13}
                        sx={{
                          maxWidth: "75%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {truncate(selected.token, 40)}
                      </Typography>

                      <Button
                        size="small"
                        onClick={async () => {
                          if (!selected?.token) return;

                          try {
                            await navigator.clipboard.writeText(selected.token);

                            setAlert({
                              open: true,
                              type: "success",
                              message: "Token copied to clipboard",
                            });
                          } catch (err) {
                            // 🔥 fallback for older browsers / insecure context
                            try {
                              const textArea = document.createElement("textarea");
                              textArea.value = selected.token;
                              document.body.appendChild(textArea);
                              textArea.select();
                              document.execCommand("copy");
                              document.body.removeChild(textArea);

                              setAlert({
                                open: true,
                                type: "success",
                                message: "Token copied (fallback)",
                              });
                            } catch (e) {
                              setAlert({
                                open: true,
                                type: "error",
                                message: "Failed to copy token",
                              });
                            }
                          }
                        }}
                      >
                        Copy
                      </Button>
                    </Box>
                  </Box>
                </Stack>


              </Box>
            </>
          )}
        </Card>
      </Stack>


      {/* MENU */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {menuVendor?.account_status === "active" ? (
          <MenuItem onClick={() => handleToggleStatus(menuVendor)}>
            <ListItemIcon>
              <Cancel fontSize="small" color="warning" />
            </ListItemIcon>
            Deactivate
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleToggleStatus(menuVendor)}>
            <ListItemIcon>
              <CheckCircle fontSize="small" color="success" />
            </ListItemIcon>
            Activate
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setHistoryOpen(true);
            setAnchorEl(null);
            setSelectedUser(menuVendor);
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          History
        </MenuItem>
      </Menu>
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.type}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      <VendorHistoryModal
        open={historyOpen}
        user={selectedUser}
        onClose={() => {
          setHistoryOpen(false);
          setSelectedUser(null);
        }}
      />

    </Box>
  );
}

function Row({ label, value }: any) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        borderBottom: "1px solid #f1f1f1",
        pb: 1,
      }}
    >
      <Typography color="text.secondary" fontSize={15}>
        {label}
      </Typography>

      <Typography fontWeight={600} fontSize={14} textAlign="right">
        {value || "-"}
      </Typography>
    </Box>
  );
}
