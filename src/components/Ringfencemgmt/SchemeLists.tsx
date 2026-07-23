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
    InputAdornment,
    IconButton,
    Avatar,
    Chip,
    Divider,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { retrieveSchemes, retrieveSuppliers, Ringfences, Supplier } from "../../services/ringfenceService";

// const mockSchemes = [
//     {
//         id: 1,
//         name: "Lagos Mainland",
//         supplier: "Conlog",
//         code: "LM001",
//         vendorCount: 25,
//         customerCount: 14020,
//         status: "Active",
//     },
//     {
//         id: 2,
//         name: "Ikeja District",
//         supplier: "Hexing",
//         code: "IK002",
//         vendorCount: 12,
//         customerCount: 8200,
//         status: "Inactive",
//     },
// ];

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

    useEffect(() => {
        loadScheme();
        loadSuppliers();
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

                            <IconButton>
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