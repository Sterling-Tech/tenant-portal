import React, { useEffect, useState } from "react";
import {
    Alert,
    Autocomplete,
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import {
    AddCircle,
    Delete,
    Edit,
    History,
} from "@mui/icons-material";

import {
    auditService,
    AuditHistory,
    CustomerCategory,
    fetchCustomerCategories,
} from "../../services/AuditService";

const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleString() : "-";

const actionColor = (
    action: string
): "success" | "warning" | "error" | "default" => {
    switch (action) {
        case "CREATE":
            return "success";
        case "UPDATE":
            return "warning";
        case "DELETE":
            return "error";
        default:
            return "default";
    }
};

const actionIcon = (action: string) => {
    switch (action) {
        case "CREATE":
            return <AddCircle fontSize="small" />;
        case "UPDATE":
            return <Edit fontSize="small" />;
        case "DELETE":
            return <Delete fontSize="small" />;
        default:
            return <History fontSize="small" />;
    }
};

const CustomerCategoryHistoryTab = () => {
    const [categories, setCategories] = useState<CustomerCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<CustomerCategory | null>(null);

    const [history, setHistory] = useState<AuditHistory[]>([]);

    const [categoryLoading, setCategoryLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        const loadCategories = async () => {
    try {
        setCategoryLoading(true);

        const categories = await fetchCustomerCategories();

        setCategories(categories);
    } catch (err) {
        console.error(err);
    } finally {
        setCategoryLoading(false);
    }
};

        loadCategories();
    }, []);

    useEffect(() => {
        if (!selectedCategory) return;

        const loadHistory = async () => {
            try {
                setHistoryLoading(true);
                setError("");

                const res =
                    await auditService.getCustomerCategoryHistory(
                        selectedCategory.id
                    );

                setHistory(Array.isArray(res) ? res : []);
            } catch (err) {
                console.error(err);
                setError("Unable to fetch category history.");
                setHistory([]);
            } finally {
                setHistoryLoading(false);
            }
        };

        loadHistory();
    }, [selectedCategory]);

    const changes = (item: AuditHistory) => {
        if (!item.previous) return [];

        const rows: any[] = [];

        Object.keys(item.present || {}).forEach((key) => {
            if (
                JSON.stringify(item.previous[key]) !==
                JSON.stringify(item.present[key])
            ) {
                rows.push({
                    field: key,
                    old: item.previous[key],
                    new: item.present[key],
                });
            }
        });

        return rows;
    };

    return (
        <Box>

            <Card sx={{ mb: 3 }}>
                <CardContent>

                    <Autocomplete
                        loading={categoryLoading}
                        options={categories}
                        value={selectedCategory}
                        onChange={(_, value) =>
                            setSelectedCategory(value)
                        }
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Customer Category"
                            />
                        )}
                    />

                </CardContent>
            </Card>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {historyLoading && (
                <Box py={8} textAlign="center">
                    <CircularProgress />
                </Box>
            )}

            {!historyLoading &&
                selectedCategory &&
                history.length === 0 && (
                    <Box py={8}>
                        <Typography align="center">
                            No history found.
                        </Typography>
                    </Box>
                )}

            <Stack spacing={3}>

                {history.map((item) => (

                    <Card key={item.id}>

                        <CardContent>

                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={2}
                            >

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                >

                                    <Avatar>

                                        {actionIcon(item.action)}

                                    </Avatar>

                                    <Box>

                                        <Typography fontWeight={700}>
                                            {item.action}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {formatDate(item.timestamp)}
                                        </Typography>

                                    </Box>

                                </Stack>

                                <Chip
                                    label={item.action}
                                    color={actionColor(item.action)}
                                />

                            </Stack>

                            {item.action === "CREATE" && (

                                <Box>

                                    <Typography
                                        fontWeight={700}
                                        mb={2}
                                    >
                                        Category Created
                                    </Typography>

                                    <Stack spacing={1}>

                                        <Typography>
                                            <strong>Name:</strong>{" "}
                                            {item.present?.name}
                                        </Typography>

                                        <Typography>
                                            <strong>Description:</strong>{" "}
                                            {item.present?.description}
                                        </Typography>

                                    </Stack>

                                </Box>

                            )}

                            {item.action === "UPDATE" && (

                                <Box>

                                    <Typography
                                        fontWeight={700}
                                        mb={2}
                                    >
                                        Changed Fields
                                    </Typography>

                                    <Stack spacing={2}>

                                        {changes(item).map((change) => (

                                            <Box key={change.field}>

                                                <Typography
                                                    fontWeight={700}
                                                >
                                                    {change.field}
                                                </Typography>

                                                <Stack
                                                    direction="row"
                                                    spacing={3}
                                                >

                                                    <Box flex={1}>

                                                        <Typography
                                                            variant="caption"
                                                            color="error"
                                                        >
                                                            Old
                                                        </Typography>

                                                        <Typography>
                                                            {String(change.old)}
                                                        </Typography>

                                                    </Box>

                                                    <Box flex={1}>

                                                        <Typography
                                                            variant="caption"
                                                            color="success.main"
                                                        >
                                                            New
                                                        </Typography>

                                                        <Typography>
                                                            {String(change.new)}
                                                        </Typography>

                                                    </Box>

                                                </Stack>

                                                <Divider sx={{ mt: 1 }} />

                                            </Box>

                                        ))}

                                    </Stack>

                                </Box>

                            )}

                            {item.action === "DELETE" && (

                                <Box>

                                    <Typography
                                        fontWeight={700}
                                        color="error"
                                    >
                                        Category Deleted
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                    >
                                        This customer category was deleted.
                                    </Typography>

                                </Box>

                            )}

                        </CardContent>

                    </Card>

                ))}

            </Stack>

        </Box>
    );
};

export default CustomerCategoryHistoryTab;