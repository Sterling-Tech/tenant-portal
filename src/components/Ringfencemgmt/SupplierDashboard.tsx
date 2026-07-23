import {
    Box,
    Card,
    Stack,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    CircularProgress,
} from "@mui/material";

import {
    Search,
    Refresh,
    Add,
    MoreVert,
    Edit,
    CheckCircle,
    Cancel,
} from "@mui/icons-material";

import { useEffect, useState } from "react";
import { retrieveSuppliers, Supplier } from "../../services/ringfenceService";
import CreateSupplierModal from "./CreateSupplierModal";

// import CreateSupplierModal from "./CreateSupplierModal";

export default function SupplierDashboard() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [filtered, setFiltered] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [search, setSearch] = useState("");

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selected, setSelected] = useState<Supplier | null>(null);

    const [openCreate, setOpenCreate] = useState(false);

    const loadSuppliers = async () => {
        try {
            setLoading(true);

            const res = await retrieveSuppliers();

            setSuppliers(res.results);
            setFiltered(res.results);
            setCount(res.count);
        } catch (err) {
            console.error(err);

            setSuppliers([]);
            setFiltered([]);
            setCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSuppliers();
    }, []);

    useEffect(() => {
        if (!search.trim()) {
            setFiltered(suppliers);
            return;
        }

        const value = search.toLowerCase();

        setFiltered(
            suppliers.filter(
                (x) =>
                    x.name.toLowerCase().includes(value) ||
                    x.code.toLowerCase().includes(value)
            )
        );
    }, [search, suppliers]);

    const activeCount = suppliers.filter((x) => x.is_active).length;

    return (
        <Stack spacing={3}>
            {/* Summary */}

            <Stack direction="row" spacing={2}>
                <SummaryCard title="Total Suppliers" value={count} />

                <SummaryCard title="Active Suppliers" value={activeCount} />
            </Stack>

            {/* Toolbar */}

            <Card sx={{ p: 2 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    spacing={2}
                >
                    <TextField
                        placeholder="Search supplier..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ width: 350 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Stack direction="row" spacing={2}>
                        <Button
                            startIcon={<Refresh />}
                            onClick={loadSuppliers}
                        >
                            Refresh
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setOpenCreate(true)}
                        >
                            Create Supplier
                        </Button>
                    </Stack>
                </Stack>
            </Card>

            {/* Table */}

            <Card>
                {loading ? (
                    <Box py={8} textAlign="center">
                        <CircularProgress />
                    </Box>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Code</TableCell>
                                <TableCell>Contact</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filtered.map((supplier) => (
                                <TableRow key={supplier.id} hover>
                                    <TableCell>{supplier.name}</TableCell>

                                    <TableCell>{supplier.code}</TableCell>

                                    <TableCell>{supplier.contact_name}</TableCell>

                                    <TableCell>{supplier.contact_email}</TableCell>

                                    <TableCell>{supplier.contact_phone}</TableCell>

                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={
                                                supplier.is_active
                                                    ? "Active"
                                                    : "Inactive"
                                            }
                                            color={
                                                supplier.is_active
                                                    ? "success"
                                                    : "default"
                                            }
                                        />
                                    </TableCell>

                                    <TableCell align="right">
                                        <IconButton
                                            onClick={(e) => {
                                                setAnchorEl(e.currentTarget);
                                                setSelected(supplier);
                                            }}
                                        >
                                            <MoreVert />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>

            <Menu
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem>
                    <Edit fontSize="small" sx={{ mr: 1 }} />
                    Edit
                </MenuItem>

                {selected?.is_active ? (
                    <MenuItem>
                        <Cancel
                            color="warning"
                            fontSize="small"
                            sx={{ mr: 1 }}
                        />
                        Deactivate
                    </MenuItem>
                ) : (
                    <MenuItem>
                        <CheckCircle
                            color="success"
                            fontSize="small"
                            sx={{ mr: 1 }}
                        />
                        Activate
                    </MenuItem>
                )}
            </Menu>

            <CreateSupplierModal
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onSuccess={loadSuppliers}
            />
        </Stack>
    );
}

function SummaryCard({
    title,
    value,
}: {
    title: string;
    value: number;
}) {
    return (
        <Card sx={{ flex: 1, p: 3 }}>
            <Typography color="text.secondary">{title}</Typography>

            <Typography
                variant="h4"
                fontWeight={700}
                mt={1}
            >
                {value.toLocaleString()}
            </Typography>
        </Card>
    );
}
