import { useEffect, useState } from "react";
import {
    Box,
    Card,
    Stack,
    Typography,
    TextField,
    MenuItem,
    FormControl,
    Select,
    Autocomplete,
    InputAdornment,
    IconButton,
    Avatar,
    Chip,
    Divider,
    Menu,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { AssignCustomerPayload, assignCustomers, AssignVendorPayload, assignVendors, retrieveSchemes, retrieveSuppliers, Ringfences, Supplier, updateScheme, UpdateSchemePayload } from "../../services/ringfenceService";
import EditSchemeModal from "./EditSchemeModal";
import { toast } from "react-toastify";
import AssignVendorModal from "./AssignVendorModal";
import AssignCustomerModal from "./AssignCustomerModal";
import { Customer, fetchCustomers, fetchVendors, Vendor } from "../../services/vendorService";
import SchemeVendorList from "./SchemeVendorList";


export default function SchemeLists() {
    const [schemes, setSchemes] = useState<Ringfences[]>([]);
    const [filtered, setFiltered] = useState<Ringfences[]>([]);
    const [selected, setSelected] = useState<Ringfences | null>(null);
    const [search, setSearch] = useState("");
    const [supplier, setSupplier] = useState("all");
    const [status, setStatus] = useState("all");
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [editOpen, setEditOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const [vendorOpen, setVendorOpen] = useState(false);
    const [customerOpen, setCustomerOpen] = useState(false);

    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [vendorPage, setVendorPage] = useState(1);
    const [vendorHasNext, setVendorHasNext] = useState(false);

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerPage, setCustomerPage] = useState(1);
    const [customerHasNext, setCustomerHasNext] = useState(false);

    const [schemeVendorListOpen, setSchemeVendorListOpen] = useState(false)

    const loadScheme = async () => {
        try {
            setLoading(true);

            const res = await retrieveSchemes();

            setSchemes(res.results);
            setFiltered(res.results);

            setCount(res.count);

            if (res.results.length > 0) {
                setSelected(res.results[0]);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadSuppliers = async () => {
        try {
            const res = await retrieveSuppliers();
            setSuppliers(res.results);
        } catch (err) {
            console.error(err);
        }
    };

    const loadVendors = async (page = 1, append = false) => {
        try {
            setLoading(true);

            const res = await fetchVendors({
                page,
                main_vendor: true,
            });

            setVendors((prev) =>
                append ? [...prev, ...res.results] : res.results
            );

            setVendorHasNext(!!res.next);
            setVendorPage(page);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadCustomers = async (page = 1, append = false) => {
        setLoading(true);
        try {
            const res = await fetchCustomers({
                page,
            });

            setCustomers((prev) =>
                append ? [...prev, ...res.results] : res.results
            );

            setCustomerHasNext(!!res.next);
            setCustomerPage(page);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadScheme();
        loadSuppliers();
        loadVendors();
        loadCustomers();
    }, []);

    useEffect(() => {
        let data = [...schemes];

        if (search.trim()) {
            const q = search.toLowerCase();

            data = data.filter(
                s =>
                    s.name.toLowerCase().includes(q) ||
                    s.code.toLowerCase().includes(q)
            );
        }

        if (supplier !== "all") {
            data = data.filter(
                s => s.supplier.id === Number(supplier)
            );
        }

        if (status !== "all") {
            data = data.filter(s =>
                status === "active"
                    ? s.is_active
                    : !s.is_active
            );
        }

        setFiltered(data);
    }, [search, supplier, status, schemes]);

    const handleUpdateScheme = async (
        id: number,
        values: UpdateSchemePayload
    ) => {
        try {
            setLoading(true);

            const updated = await updateScheme(id, values);

            await loadScheme();
            setSelected(updated);

            toast.success("Scheme updated successfully");

            setEditOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignVendors = async (
        values: AssignVendorPayload
    ) => {
        try {
            setLoading(true);

            await assignVendors(values);

            toast.success("Vendors assigned.");

            setVendorOpen(false);

            loadScheme();
        } catch (err) {
            toast.error("Unable to assign vendors");
        } finally {
            setLoading(false);
        }
    };

    const handleAssignCustomers = async (
        values: AssignCustomerPayload
    ) => {
        try {
            setLoading(true);

            await assignCustomers(values);

            toast.success("Customers assigned.");

            setCustomerOpen(false);

            loadScheme();
        } catch (err) {
            toast.error("Unable to assign customers");
        } finally {
            setLoading(false);
        }
    };
    return (
        <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={3}
        >
            {/* LEFT */}

            <Card
                sx={{
                    width: 420,
                    borderRadius: 3,
                }}
            >
                <Stack spacing={2} p={2}>

                    <TextField
                        size="small"
                        placeholder="Search scheme..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Stack direction="row" spacing={2}>

                        <FormControl fullWidth size="small">
                            <Select
                                value={supplier}
                                onChange={(e) =>
                                    setSupplier(e.target.value)
                                }
                            >
                                <MenuItem value="all">
                                    All Suppliers
                                </MenuItem>

                                {suppliers.map((supplier) => (
                                    <MenuItem
                                        key={supplier.id}
                                        value={supplier.id.toString()}
                                    >
                                        {supplier.name}
                                    </MenuItem>
                                ))}

                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <Select
                                value={status}
                                onChange={(e) =>
                                    setStatus(e.target.value)
                                }
                            >
                                <MenuItem value="all">
                                    All Status
                                </MenuItem>

                                <MenuItem value="active">
                                    Active
                                </MenuItem>

                                <MenuItem value="inactive">
                                    Inactive
                                </MenuItem>
                            </Select>
                        </FormControl>

                    </Stack>

                </Stack>

                <Divider />

                {filtered.map((scheme) => (
                    <Box
                        key={scheme.id}
                        onClick={() => setSelected(scheme)}
                        sx={{
                            cursor: "pointer",
                            p: 2,
                            bgcolor:
                                selected?.id === scheme.id
                                    ? "#EEF4FF"
                                    : "#fff",

                            "&:hover": {
                                bgcolor: "#F8FAFC",
                            },
                        }}
                    >
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                        >
                            <Stack
                                direction="row"
                                spacing={2}
                            >
                                <Avatar>
                                    {scheme.name[0]}
                                </Avatar>

                                <Box>

                                    <Typography
                                        fontWeight={700}
                                    >
                                        {scheme.name}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {scheme.code}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                    >
                                        {scheme.supplier.name}
                                    </Typography>

                                </Box>

                            </Stack>

                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelected(scheme);
                                    setAnchorEl(e.currentTarget);
                                }}
                            >
                                <MoreVertIcon />
                            </IconButton>

                        </Stack>

                        <Stack
                            direction="row"
                            spacing={1}
                            mt={2}
                        >
                            <Chip
                                size="small"
                                label={`${scheme.vendor_count} Vendors`}
                            />

                            <Chip
                                size="small"
                                label={`${scheme.customer_count.toLocaleString()} Customers`}
                            />
                        </Stack>

                        <Chip
                            size="small"
                            color={scheme.is_active ? "success" : "default"}
                            label={scheme.is_active ? "Active" : "Inactive"}
                            sx={{ mt: 2 }}
                        />

                    </Box>
                ))}

            </Card>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem
                    onClick={() => {
                        setEditOpen(true);
                        setAnchorEl(null);
                    }}
                >
                    Edit Scheme
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        setVendorOpen(true);
                        setAnchorEl(null);
                    }}
                >
                    Assign Vendors
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        setCustomerOpen(true);
                        setAnchorEl(null);
                    }}
                >
                    Assign Customers
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setSchemeVendorListOpen(true);
                        setAnchorEl(null);
                    }}
                >
                    View Assigned Vendors
                </MenuItem>
            </Menu>
            {/* RIGHT */}

            <Card
                sx={{
                    flex: 1,
                    borderRadius: 3,
                    p: 3,
                }}
            >
                <Typography
                    variant="h5"
                    fontWeight={700}
                    mb={3}
                >
                    {selected?.name ?? "No Scheme Selected"}
                </Typography>

                <Stack spacing={3}>

                    <Detail
                        title="Supplier"
                        value={selected?.supplier.name}
                    />

                    <Detail
                        title="Scheme Code"
                        value={selected?.code}
                    />

                    <Detail
                        title="Status"
                        value={selected?.is_active ? "Active" : "Inactive"}
                    />

                    <Detail
                        title="Assigned Vendors"
                        value={selected?.vendor_count}
                    />

                    <Detail
                        title="Assigned Customers"
                        value={selected?.customer_count.toLocaleString()}
                    />

                </Stack>

            </Card>
            <EditSchemeModal
                open={editOpen}
                scheme={selected}
                loading={loading}
                onClose={() => setEditOpen(false)}
                onSubmit={handleUpdateScheme}
            />
            <AssignVendorModal
                open={vendorOpen}
                schemeId={selected?.id ?? 0}
                vendors={vendors}
                vendorHasNext={vendorHasNext}
                vendorPage={vendorPage}
                loadMore={() =>
                    loadVendors(vendorPage + 1, true)
                }
                loading={loading}
                onClose={() => setVendorOpen(false)}
                onSubmit={handleAssignVendors}
            />

            <AssignCustomerModal
                open={customerOpen}
                schemeId={selected?.id ?? 0}
                customers={customers}
                customerHasNext={customerHasNext}
                customerPage={vendorPage}
                loadMore={() =>
                    loadCustomers(customerPage + 1, true)
                }
                loading={loading}
                onClose={() => setCustomerOpen(false)}
                onSubmit={handleAssignCustomers}
            />
            <SchemeVendorList
                open={schemeVendorListOpen}
                schemeId={selected?.id}
                onClose={() => setSchemeVendorListOpen(false)}
            />
        </Stack>
    );
}

function Detail({
    title,
    value,
}: {
    title: string;
    value: any;
}) {
    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            sx={{
                borderBottom: "1px solid #eee",
                pb: 2,
            }}
        >
            <Typography color="text.secondary">
                {title}
            </Typography>

            <Typography fontWeight={600}>
                {value}
            </Typography>
        </Stack>
    );
}