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
  Autocomplete,
  Grid,
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
import { fetchVendors, createVendor, type VendorForm, Vendor, searchVendors, toggleVendorStatus} from "../../services/vendorService";
	
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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [vendorForm, setVendorForm] = useState<Partial<VendorForm>>({});

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [selected, setSelected] = useState<Vendor | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [verifiedFilter, setVerifiedFilter] = useState("all");


  const totalPages = Math.ceil(count / PAGE_SIZE);

const formatDateTime = (date: string) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const truncate = (text: string, max = 25) => {
  if (!text) return "-";
  return text.length > max ? text.slice(0, max) + "..." : text;
};
  // ✅ Debounce search
// Debounced search: wait until user stops typing for 500ms
useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearch(search); // update debounced value
    setPage(1); // reset to first page
  }, 500); // 500ms delay

  // cleanup: cancel previous timeout if user types again
  return () => clearTimeout(handler);
}, [search]);

// Debounced search: wait until user stops typing for 500ms
const load = async (pageNumber = 1) => {
  try {
    // 🔍 SEARCH MODE: only if user has typed something
    if (debouncedSearch.trim()) {
      const res = await searchVendors(debouncedSearch);

      let data: Vendor[] = [];
      if (Array.isArray(res)) data = res;
      else if (res && "results" in res) data = res.results;

      setVendors(data);
      setCount(data.length);

      if (data.length) {
        setSelected(data[0]);
      } else {
        setSelected(null);
      }
      return; // exit early
    }

    // 📦 NORMAL MODE (no search)
    const res = await fetchVendors({
      page: pageNumber,
      account_status: statusFilter === "all" ? undefined : statusFilter,
      is_verified: verifiedFilter === "all" ? undefined : verifiedFilter === "verified",
    });

    setVendors(res?.results || []);
    setCount(res?.count || 0);

    if (res?.results?.length) {
      setSelected(res.results[0]);
    } else {
      setSelected(null); // 🔥 THIS FIXES YOUR ISSUE
    }
  } catch (err) {
    console.error("LOAD ERROR:", err);
    setVendors([]);
    setCount(0);
  }
};

  useEffect(() => {
    load(page);
  }, [page, debouncedSearch, statusFilter, verifiedFilter]);

  // ✅ HEADER CHECKBOX
  const allSelected =
    vendors.length > 0 &&
    vendors.every((v) => selectedIds.includes(Number(v.id)));

  const isIndeterminate =
    selectedIds.length > 0 && !allSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(vendors.map((v) => Number(v.id)));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };



 const hierarchyOptions = [
	{ value: "vendor", label: "Vendor" },
	{ value: "sub_vendor", label: "Sub Vendor" },
	{ value: "agent", label: "Agent" },
	{ value: "cashier", label: "Cashier" },
	{ value: "POS", label: "POS" },
];

// const load = async (pageNumber = 1) => {
//   const res = await fetchVendors({
//     page: pageNumber,
//     search,
//     is_active:
//       statusFilter === "all"
//         ? undefined
//         : statusFilter === "active",
//     is_verified:
//       verifiedFilter === "all"
//         ? undefined
//         : verifiedFilter === "verified",
//   });

//   console.log("VENDORS API RESPONSE:", res);

//   setVendors(res.results);
//   setCount(res.count);
//   setNext(res.next);
//   setPrevious(res.previous);

//   if (res.results.length) setSelected(res.results[0]);
// };
  
  const handleToggleStatus = async (vendor: Vendor) => {
  try {
    await toggleVendorStatus(vendor.id);

    await load(page); // wait for reload

    setAnchorEl(null);
  } catch (err) {
    console.error("TOGGLE ERROR:", err);
  }
};

  const handleCreateVendor = async () => {
  if (!vendorForm.business_name || !vendorForm.email || !vendorForm.hierachy) {
    alert("Business name, email and hierarchy are required");
    return;
  }

  try {
    await createVendor(vendorForm as VendorForm);

    setOpenModal(false);

    setVendorForm({
      business_name: "",
      email: "",
      phone_number: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
      hierachy: "",
      related_vendor: undefined,
    });

    load();
  } catch (err) {
    console.error(err);
  }
};

// const handleDeleteVendor = async (vendorId: number) => {
//   try {
//     await deleteVendor(String(vendorId));
//     setAnchorEl(null);
//     load();
//   } catch (err) {
//     console.error(err);
//   }
// };



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
            Onboard vendors, manage their details and monitor all activity
          </Typography>
        </Box>

       <Stack direction="row" spacing={2}>
  <Button
    size="small"
    variant="outlined"
    startIcon={<Refresh />}
    onClick={() => load(page)}
    sx={{ height: 36, textTransform: "none", borderRadius: 2 }}
  >
    Refresh
  </Button>
  <Button
    size="small"
    variant="contained"
    sx={{
      height: 36,
      textTransform: "none",
      borderRadius: 2,
      bgcolor: "#1e3a8a",
      "&:hover": { bgcolor: "#1e40af" },
    }}
    onClick={() => setOpenModal(true)}
  >
    + Onboard Vendor
  </Button>
</Stack>
      </Stack>

      
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
        {/* TABLE */}
        <Card sx={{ flex: 2,  borderRadius: 3, overflowX: "auto" }}>
          {/* SEARCH */}
          <Stack sx={{p:2}} direction="row" spacing={2}>
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

            <FormControl size="small" sx={{ minWidth: 160 }}>
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

    <MenuItem value="inactive">
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip size="small" label="Inactive" />
      </Stack>
    </MenuItem>
  </Select>
</FormControl>
          </Stack>

          {/* TABLE */}
          <Table>
            <TableHead>
              <TableRow>
                {/* <TableCell padding="checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) =>
                      handleSelectAll(e.target.checked)
                    }
                  />
                </TableCell> */}
                <TableCell>Business</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Wallet</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>

            <TableBody>
              {(vendors || []).map((v) => (
                <TableRow
                  key={v.id}
                  hover
                  selected={selected?.id === v.id}
                  onClick={() => setSelected(v)}
                  sx={{ cursor: "pointer" }}
                >
                  {/* <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(Number(v.id))}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleRow(Number(v.id))}
                    />
                  </TableCell> */}

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
              ))}
            </TableBody>
          </Table>

          {/* PAGINATION (ONLY ARROWS) */}
          <Stack
  direction="row"
  justifyContent="space-between"
  alignItems="center"
  px={2}
  py={2}
>
  {/* LEFT SIDE */}
  <Typography fontSize={13} color="text.secondary">
    Page {page} of {totalPages || 1} • {count} total
  </Typography>

  {/* RIGHT SIDE */}
  <Stack direction="row" spacing={1}>
    <Button
      //variant="outlined"
      size="small"
      disabled={page === 1}
      onClick={() => setPage((p) => p - 1)}
    >
      Prev
    </Button>

    <Button
      //variant="outlined"
      size="small"
      disabled={page === totalPages}
      onClick={() => setPage((p) => p + 1)}
    >
      Next
    </Button>
  </Stack>
</Stack>
         
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
                onClick={() => {
                  navigator.clipboard.writeText(selected.token);
                }}
              >
                Copy
              </Button>
            </Box>
          </Box>
        </Stack>

        {/* ACTIONS */}
        <Stack direction="row" spacing={1} mt={3}>
          <Button fullWidth variant="outlined">
            Full Profile
          </Button>
          <Button fullWidth color="warning" variant="contained">
            Edit
          </Button>
          <Button fullWidth color="error" variant="contained">
            Delete
          </Button>
        </Stack>
      </Box>
    </>
  )}
</Card>
      </Stack>

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
    }}
  >
    <Card
      sx={{
        width: 650,
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
          <Typography fontWeight={700} fontSize={18}>
            Onboard New Vendor
          </Typography>
          {/* <Typography fontSize={13} opacity={0.8}>
            Fill in the vendor's details to get them started
          </Typography> */}
        </Box>

        <IconButton
          onClick={() => setOpenModal(false)}
          sx={{ color: "#fff" }}
        >
          ✕
        </IconButton>
      </Box>

      {/* FORM */}
      <Box px={3} py={3}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Business Name"
              placeholder="e.g. Acme Nigeria Ltd"
              size="small"
              value={vendorForm.business_name || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, business_name: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Email Address"
              placeholder="admin@business.com"
              size="small"
              value={vendorForm.email || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, email: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Phone Number"
              placeholder="+234 800 000 0000"
              size="small"
              value={vendorForm.phone_number || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, phone_number: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <Select
                displayEmpty
                value={vendorForm.hierachy || ""}
                onChange={(e) =>
                  setVendorForm({
                    ...vendorForm,
                    hierachy: e.target.value,
                  })
                }
              >
                <MenuItem value="">Select Hierarchy</MenuItem>
                {hierarchyOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Business Address"
              placeholder="Street, City, State"
              size="small"
              value={vendorForm.address || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, address: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="City"
              size="small"
              value={vendorForm.city || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, city: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="State"
              size="small"
              value={vendorForm.state || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, state: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Country"
              size="small"
              value={vendorForm.country || ""}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, country: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Postal Code"
              size="small"
              value={vendorForm.postal_code || ""}
              onChange={(e) =>
                setVendorForm({
                  ...vendorForm,
                  postal_code: e.target.value,
                })
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              options={vendors || []}
              getOptionLabel={(o) => o.business_name}
              value={
                vendors.find((v) => v.id === vendorForm.related_vendor) || null
              }
              onChange={(_, value) =>
                setVendorForm({
                  ...vendorForm,
                  related_vendor: value?.id,
                })
              }
              renderInput={(params) => (
                <TextField {...params} label="Related Vendor (Optional)" />
              )}
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
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleCreateVendor}
          sx={{
            bgcolor: "#1e3a8a",
            textTransform: "none",
            borderRadius: 2,
            px: 3,
          }}
        >
          Onboard Vendor
        </Button>
      </Box>
    </Card>
  </Box>
)}
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
</Menu>
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
      <Typography color="text.secondary" fontSize={13}>
        {label}
      </Typography>

      <Typography fontWeight={600} fontSize={14} textAlign="right">
        {value || "-"}
      </Typography>
    </Box>
  );
}
