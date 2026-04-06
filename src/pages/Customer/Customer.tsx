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
    Grid
} from "@mui/material";
import { Search, MoreVert, Refresh } from "@mui/icons-material";
import { fetchCustomers, fetchCustomer, createCustomer, type Customer, MeteringTypeS, CustomerClass, Customercategory, searchCustomers,	type CustomerForm } from "../../services/vendorService";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
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
const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string;} | null>(null);
const [saving, setSaving] = useState(false);
const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

const [filters, setFilters] = useState({
  account_status: "",
  metering_type_id: "",
  class_id: "",
  category_id: "",
});

const [page, setPage] = useState(1);
const [count, setCount] = useState(0);
const [loading, setLoading] = useState(false);
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
    const res = await searchCustomers(search);
    setCustomers(res.results);
    setCount(res.count);
  }, 600); // waits 600ms after typing stops
}, [search]);

useEffect(() => {
  const loadFilters = async () => {
    const [m, c, cat] = await Promise.all([
      MeteringTypeS(),
      CustomerClass(),
      Customercategory(),
    ]);

    setMeteringTypes(m);
    setClasses(c);
    setCategories(cat);
  };

  loadFilters();
}, []);
  const getStatus = (c: Customer) =>
    Number(c.wallet?.balance) > 0 ? "inactive" : "active";


  const handleRowClick = async (c: Customer) => {
    const full = await fetchCustomer({customer_id: c.id});
    setSelected(full);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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
      name: customerForm.name!,
      email: customerForm.email!,
      phone_number: customerForm.phone_number!,
      address: customerForm.address || "",
      customer_category: Number(customerForm.customer_category),
      customer_class: Number(customerForm.customer_class),
      metering_type: Number(customerForm.metering_type),
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

    setNotification({
      type: "error",
      message: err?.response?.data?.message || "Failed to create customer",
    });
  } finally {
    setSaving(false);
  }
};
const handleFilterChange = (key: string, value: string) => {
  setFilters((prev) => ({
    ...prev,
    [key]: value === "all" ? "" : value,
  }));
  setPage(1);
};
  return (
    <Box sx={{ background: "#F8FAFC", minHeight: "100vh" }}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Box>
          <Typography fontSize={28} fontWeight={700}>
            Customer Registry
          </Typography>
          <Typography color="#64748B">
            Register and manage all customers — search by meter number or account number
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Refresh />}sx={{ height: 36, textTransform: "none", borderRadius: 2 }}>
            Refresh
          </Button>
          <Button onClick={handleCreateClick} variant="contained" sx={{ height: 36, textTransform: "none", borderRadius: 2 }}>
            + Register Customer
          </Button>
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
    
    {/* METER SEARCH */}
    <Box sx={{ flex: 1, position: "relative" }}>
      <TextField
        fullWidth
        placeholder="Search by meter number..."
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

      {/* RIGHT TAG */}
      <Chip
        label="Meter No"
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

    {/* ACCOUNT SEARCH */}
    <Box sx={{ flex: 1, position: "relative" }}>
      <TextField
        fullWidth
        placeholder="Search by account number..."
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

      <Chip
        label="Account No"
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

    {/* CLEAR BUTTON */}
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

  {/* METERING */}
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
                  "",
                ].map((h) => (
                  <TableCell key={h} sx={{ color: "#94A3B8", fontWeight: 600, fontSize: 12 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {customers.map((c) => (
                <TableRow
                  key={c.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleRowClick(c)}
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

                  <TableCell>{c.account_number}</TableCell>
                  <TableCell>{c.meter_number}</TableCell>

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
                    <Chip
                      label={`₦${c.wallet?.balance || "0.00"}`}
                      size="small"
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
                    />
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
              ))}
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
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem>View</MenuItem>
        <MenuItem>Edit</MenuItem>
        <MenuItem sx={{ color: "red" }}>Delete</MenuItem>
      </Menu>

      {/* DETAIL PANEL */}
      {selected && (
        <Card ref={detailRef} sx={{ mt: 4, borderRadius: 4, overflow: "hidden" }}>
          <Box sx={{ bgcolor: "#1E3A8A", color: "white", p: 3 }}>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography fontWeight={700} fontSize={20}>
                  {selected.name}
                </Typography>
                <Typography fontSize={14}>{selected.phone_number}</Typography>

                <Stack direction="row" spacing={1} mt={1}>
                  <Chip label={getStatus(selected)} size="small" sx={{ bgcolor: "#FEE2E2", color: "#991B1B" }} />
                  <Chip label={selected.metering_type?.name} size="small" />
                  <Chip label={`Debt: ₦${selected.wallet?.balance}`} size="small" />
                </Stack>
              </Box>

              <Button variant="outlined" sx={{ color: "white", borderColor: "white" }}>
                Close
              </Button>
            </Stack>
          </Box>

          <Box p={3}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={6}>
                <Box>
                  <Typography fontSize={12} color="#94A3B8">ACCOUNT NO</Typography>
                  <Typography fontWeight={600}>{selected.account_number}</Typography>
                </Box>
                <Box>
                  <Typography fontSize={12} color="#94A3B8">METER NO</Typography>
                  <Typography fontWeight={600}>{selected.meter_number}</Typography>
                </Box>
                <Box>
                  <Typography fontSize={12} color="#94A3B8">CLASS</Typography>
                  <Typography fontWeight={600}>{selected.customer_class?.name}</Typography>
                </Box>
                <Box>
                  <Typography fontSize={12} color="#94A3B8">CATEGORY</Typography>
                  <Typography fontWeight={600}>{selected.customer_category?.name}</Typography>
                </Box>
              </Stack>

              <Divider />

              <Box>
                <Typography fontSize={12} color="#94A3B8">ADDRESS</Typography>
                <Typography fontWeight={600}>{(selected as any).address || "N/A"}</Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button variant="contained">Edit</Button>
                <Button variant="outlined" color="error">Delete</Button>
              </Stack>
            </Stack>
          </Box>
        </Card>
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
                  {formMode === "create" ? "Onboard New Customer" : "Edit Customer"}
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
      label="Customer Name"
      size="small"
      value={customerForm.name || ""}
      onChange={(e) =>
        setCustomerForm({ ...customerForm, name: e.target.value })
      }
    />
  </Grid>

  <Grid item xs={6}>
    <TextField
      fullWidth
      label="Email"
      size="small"
      value={customerForm.email || ""}
      onChange={(e) =>
        setCustomerForm({ ...customerForm, email: e.target.value })
      }
    />
  </Grid>

  <Grid item xs={6}>
    <TextField
      fullWidth
      label="Phone"
      size="small"
      value={customerForm.phone_number || ""}
      onChange={(e) =>
        setCustomerForm({ ...customerForm, phone_number: e.target.value })
      }
    />
  </Grid>

  {/* CATEGORY */}
  <Grid item xs={6}>
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
        <MenuItem value="">Select Category</MenuItem>
        {categories.map((cat) => (
          <MenuItem key={cat.id} value={cat.id}>
            {cat.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>

  {/* CLASS */}
  <Grid item xs={6}>
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
        <MenuItem value="">Select Class</MenuItem>
        {classes.map((cls) => (
          <MenuItem key={cls.id} value={cls.id}>
            {cls.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>

  {/* METERING */}
  <Grid item xs={6}>
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
        <MenuItem value="">Select Metering Type</MenuItem>
        {meteringTypes.map((m) => (
          <MenuItem key={m.id} value={m.id}>
            {m.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
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
        setCustomerForm({ ...customerForm, address: e.target.value })
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
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Cancel
              </Button>
      
              <Button
                variant="contained"
                onClick={handleSaveVendor}
                sx={{
                  bgcolor: "#1e3a8a",
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                }}
              >
                {saving ? "Creating..." : "Create Customer"}
              </Button>
            </Box>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default CustomerManagement;
