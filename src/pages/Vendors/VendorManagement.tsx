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
import { fetchVendors, createVendor, type VendorForm, Vendor} from "../../services/vendorService";
// 		type Vendor,
// 		


const formatCurrency = (val: any) => {
  const num = Number(val || 0);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(num);
};

export default function VendorHub() {
  // const [vendors, setVendors] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
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


 const hierarchyOptions = [
	{ value: "vendor", label: "Vendor" },
	{ value: "sub_vendor", label: "Sub Vendor" },
	{ value: "agent", label: "Agent" },
	{ value: "cashier", label: "Cashier" },
	{ value: "POS", label: "POS" },
];

const load = async (pageNumber = 1) => {
  const res = await fetchVendors({
    page: pageNumber,
    search,
    is_active:
      statusFilter === "all"
        ? undefined
        : statusFilter === "active",
    is_verified:
      verifiedFilter === "all"
        ? undefined
        : verifiedFilter === "verified",
  });

  console.log("VENDORS API RESPONSE:", res);

  setVendors(res.results);
  setCount(res.count);
  setNext(res.next);
  setPrevious(res.previous);

  if (res.results.length) setSelected(res.results[0]);
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
useEffect(() => {
  load(page);
}, [page, search, statusFilter, verifiedFilter]);

  const filtered = (Array.isArray(vendors) ? vendors : [])
    .filter((v) =>
      `${v.business_name} ${v.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter((v) =>
      statusFilter === "all" ? true : v.account_status === statusFilter
    )
    .filter((v) =>
      verifiedFilter === "all"
        ? true
        : verifiedFilter === "verified"
    );


  return (
    <Box
      p={3}
      bgcolor="#f5f7fb"
      minHeight="100vh"
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
    color="success"
    sx={{ height: 36, textTransform: "none", borderRadius: 2 }}
  >
    Export
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

      <Stack direction="row" spacing={3}>
        {/* TABLE */}
        <Card sx={{ flex: 2, p: 2, borderRadius: 3 }}>
          {/* SEARCH + FILTERS */}
          <Stack direction="row" spacing={2} mb={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search vendors by name, email, domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                "& .MuiInputBase-root": {
                  height: 40,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <Select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
              >
                <MenuItem value="all">All Verified</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="unverified">Unverified</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* TABLE */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox />
                </TableCell>
                <TableCell>Business</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Wallet</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>

            <TableBody>
              {vendors.map((v) => (
                <TableRow
                  key={v.id}
                  hover
                  selected={selected?.id === v.id}
                  onClick={() => setSelected(v)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell padding="checkbox">
                    {/* <Checkbox /> */}
                  <Checkbox
                    checked={
                      vendors.length > 0 &&
                      vendors.every((v) => selectedIds.includes(Number(v.id)))
                    }
                    indeterminate={
                      selectedIds.length > 0 &&
                      !vendors.every((v) => selectedIds.includes(Number(v.id)))
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(vendors.map((v) => Number(v.id)));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar>{v.business_name?.charAt(0)}</Avatar>
                      <Typography fontWeight={600}>
                        {v.business_name}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>{v.email}</TableCell>

                  <TableCell>
                    <Chip
                      label={v.account_status}
                      color={
                        v.account_status === "active" ? "success" : "default"
                      }
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
  <Typography fontWeight={600}>
    {formatCurrency(v.wallet?.balance)}
  </Typography>
</TableCell>

                  <TableCell>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setAnchorEl(e.currentTarget);
                        setMenuVendor(v);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* PAGINATION */}
          <Stack alignItems="center" mt={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                variant="outlined"
                sx={{ minWidth: 36, borderRadius: "10px" }}
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ←
              </Button>

              {Array.from({ length: Math.ceil(count / 10) }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  size="small"
                  variant={p === page ? "contained" : "outlined"}
                  onClick={() => setPage(p)}
                  sx={{
                    minWidth: 36,
                    borderRadius: "10px",
                    bgcolor: p === page ? "#1e3a8a" : "transparent",
                    color: p === page ? "#fff" : "inherit",
                    "&:hover": {
                      bgcolor: p === page ? "#1e3a8a" : "#eef3ff",
                    },
                  }}
                >
                  {p}
                </Button>
              ))}

              <Button
                size="small"
                variant="outlined"
                sx={{ minWidth: 36, borderRadius: "10px" }}
                disabled={page === Math.ceil(count / 10)}
                onClick={() =>
                  setPage((p) =>
                    Math.min(Math.ceil(count / 10), p + 1)
                  )
                }
              >
                →
              </Button>
            </Stack>
          </Stack>
        </Card>

        {/* DETAILS */}
        {selected && (
          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              height: 500,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box bgcolor="#1e3a8a" color="#fff" p={2}>
              <Typography fontWeight={700}>
                {selected.business_name}
              </Typography>
              <Typography fontSize={12}>{selected.email}</Typography>

              <Stack direction="row" spacing={1} mt={1}>
                <Chip label="active" size="small" color="success" />
                <Chip label="verified" size="small" />
              </Stack>
            </Box>

            <Box p={2} sx={{ flex: 1, overflow: "hidden" }}>
              <Stack spacing={2}>
                <Row label="Phone" value={selected.phone_number} />
                <Row label="Address" value={selected.address} />
                <Row
                  label="Wallet Balance"
                  value={formatCurrency(selected.wallet?.balance)}
                />
                <Row label="Total Transactions" value={selected.txn_count || 0} />
                <Row label="Onboarded" value={selected.created_at} />
                <Row label="Last Active" value={selected.last_login} />

                <Row label="Api token" value={selected.token} />
              </Stack>

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
          </Card>
        )}
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
        <MenuItem>
          <ListItemIcon>
            <CheckCircle fontSize="small" color="success" />
          </ListItemIcon>
          Activate
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Cancel fontSize="small" color="warning" />
          </ListItemIcon>
          Deactivate
        </MenuItem>
        {/* <MenuItem>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          View
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem> */}
      </Menu>
    </Box>
  );
}

function Row({ label, value }: any) {
  return (
    <Box display="flex" justifyContent="space-between">
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={600}>{value || "-"}</Typography>
    </Box>
  );
}
