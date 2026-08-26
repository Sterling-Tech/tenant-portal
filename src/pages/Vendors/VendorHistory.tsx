import React, { useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Collapse,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Pagination,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import {
    AccountBalanceWallet,
    ContentCopy,
    Download,
    ExpandLess,
    ExpandMore,
    Search,
    Refresh,
} from "@mui/icons-material";

import dayjs from "dayjs";

import {
    VendorHistoryRow,
    VendorHistorySummary,
} from "../../services/vendorService";

interface VendorHistoryProps {
    vendorId: string | number;
    vendorName?: string;

    transactions: VendorHistoryRow[];
    summary: VendorHistorySummary | null;

    loading: boolean;

    transactionCount: number;
    page: number;

    startDate: string;
    endDate: string;

    direction: "all" | "debit" | "credit";

    dataAsOf?: {
        as_of: string;
        age: string;
        status: string;
        is_stale: boolean;
    } | null;

    onPageChange: (page: number) => void;

    onFilterChange: (
        startDate: string,
        endDate: string,
        direction: "all" | "debit" | "credit"
    ) => void;

    onRefresh: () => void;

    onExport?: (
        format: "csv" | "xlsx" | "pdf"
    ) => void;
}

const ROWS_PER_PAGE = 20;

const VendorHistory: React.FC<VendorHistoryProps> = ({
    vendorId,
    vendorName,

    transactions,
    summary,

    loading,

    transactionCount,
    page,

    startDate,
    endDate,

    direction,

    dataAsOf,

    onPageChange,
    onFilterChange,
    onRefresh,
    onExport,
}) => {
    const [search, setSearch] = useState("");

    const [localStartDate, setLocalStartDate] =
        useState(startDate);

    const [localEndDate, setLocalEndDate] =
        useState(endDate);

    const [localDirection, setLocalDirection] =
        useState<"all" | "debit" | "credit">(
            direction
        );

    const [expandedRow, setExpandedRow] =
        useState<string | null>(null);

    const [copiedToken, setCopiedToken] =
        useState<string | null>(null);

    const totalPages = Math.ceil(
        transactionCount / ROWS_PER_PAGE
    );

    // ---------------------------------------------
    // Search
    // ---------------------------------------------

    const filteredTransactions = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return transactions;
        }

        return transactions.filter((tx) => {
            return [
                tx.reference,
                tx.customer_name,
                tx.account_no,
                tx.meter_number,
                tx.transaction_type,
                tx.bill_type,
                tx.status,
            ]
                .filter(Boolean)
                .some((field) =>
                    String(field)
                        .toLowerCase()
                        .includes(value)
                );
        });
    }, [transactions, search]);

    // ---------------------------------------------
    // Currency
    // ---------------------------------------------

    const formatCurrency = (
        value: number | null | undefined
    ) => {
        return `₦${Number(
            value ?? 0
        ).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    // ---------------------------------------------
    // Copy
    // ---------------------------------------------

    const copyToken = async (
        token: string
    ) => {
        try {
            await navigator.clipboard.writeText(token);

            setCopiedToken(token);

            setTimeout(() => {
                setCopiedToken(null);
            }, 1500);
        } catch (error) {
            console.error(
                "Failed to copy token:",
                error
            );
        }
    };

    // ---------------------------------------------
    // Apply filters
    // ---------------------------------------------

    const handleApplyFilters = () => {
        if (
            localStartDate &&
            localEndDate &&
            localStartDate > localEndDate
        ) {
            return;
        }

        onFilterChange(
            localStartDate,
            localEndDate,
            localDirection
        );
    };

    // ---------------------------------------------
    // Direction
    // ---------------------------------------------

    const directionLabel = (
        value: string
    ) => {
        if (value === "debit") {
            return "Debit";
        }

        if (value === "credit") {
            return "Credit";
        }

        return "N/A";
    };

    // ---------------------------------------------
    // Status
    // ---------------------------------------------

    const getStatusColor = (
        status: string
    ):
        | "success"
        | "error"
        | "warning"
        | "default" => {
        switch (
        status?.toLowerCase()
        ) {
            case "successful":
            case "success":
                return "success";

            case "failed":
            case "failure":
                return "error";

            case "pending":
                return "warning";

            default:
                return "default";
        }
    };

    // ---------------------------------------------
    // Export
    // ---------------------------------------------

    const handleExport = (
        format: "csv" | "xlsx" | "pdf"
    ) => {
        if (onExport) {
            onExport(format);
        }
    };

    const horizontalScrollSx = {
        width: "100%",
        overflowX: "auto",
        overflowY: "hidden",

        "&::-webkit-scrollbar": {
            height: 6,
        },

        "&::-webkit-scrollbar-track": {
            backgroundColor: "#F1F5F9",
        },

        "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#CBD5E1",
            borderRadius: 10,
        },

        "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#94A3B8",
        },
    };

    return (
        <Box>
            {/* ----------------------------------------- */}
            {/* SUMMARY */}
            {/* ----------------------------------------- */}
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "100%",
                    overflowX: "auto",
                    overflowY: "hidden",
                    pb: 1,
                    mt: 2,
                    mb: 3,

                    "&::-webkit-scrollbar": {
                        height: 8,
                    },

                    "&::-webkit-scrollbar-track": {
                        backgroundColor: "#F1F5F9",
                        borderRadius: 10,
                    },

                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#CBD5E1",
                        borderRadius: 10,
                    },

                    "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#94A3B8",
                    },

                    // Firefox
                    scrollbarWidth: "thin",
                    scrollbarColor: "#CBD5E1 #F1F5F9",
                }}
            >
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        width: "max-content",
                        minWidth: "100%",
                        ml: 2,
                    }}
                >
                    <Box sx={{ minWidth: 250 }}>
                        <SummaryCard
                            title="Transactions"
                            value={transactionCount.toLocaleString()}
                        />
                    </Box>

                    <Box sx={{ minWidth: 250 }}>
                        <SummaryCard
                            title="Total Debit"
                            value={formatCurrency(
                                transactions.reduce(
                                    (sum, tx) =>
                                        sum + Number(tx.debit || 0),
                                    0
                                )
                            )}
                        />
                    </Box>

                    <Box sx={{ minWidth: 250 }}>
                        <SummaryCard
                            title="Total Credit"
                            value={formatCurrency(
                                transactions.reduce(
                                    (sum, tx) =>
                                        sum + Number(tx.credit || 0),
                                    0
                                )
                            )}
                        />
                    </Box>

                    <Box sx={{ minWidth: 250 }}>
                        <SummaryCard
                            title="Period"
                            value={
                                summary
                                    ? `${dayjs(summary.start).format(
                                        "DD MMM"
                                    )} - ${dayjs(summary.end).format(
                                        "DD MMM YYYY"
                                    )}`
                                    : "N/A"
                            }
                        />
                    </Box>
                </Stack>
            </Box>

            {/* ----------------------------------------- */}
            {/* DATA STATUS */}
            {/* ----------------------------------------- */}

            {dataAsOf && (
                <Alert
                    severity={
                        dataAsOf.is_stale
                            ? "warning"
                            : "success"
                    }
                    sx={{ mb: 2 }}
                >
                    Data as of{" "}
                    {dayjs(
                        dataAsOf.as_of
                    ).format(
                        "DD MMM YYYY, HH:mm:ss"
                    )}
                    {" • "}
                    {dataAsOf.age}
                </Alert>
            )}

            {/* ----------------------------------------- */}
            {/* FILTERS */}
            {/* ----------------------------------------- */}

            <Card
                sx={{
                    borderRadius: 3,
                    mb: 2,
                    boxShadow: "none",
                    border:
                        "1px solid #E5E7EB",
                    justifyContent:"space-between",
                }}
            >
                <CardContent>
                    <Stack
                        direction={{
                            xs: "column",
                            md: "row",
                        }}
                        spacing={1.5}
                        alignItems={{
                            xs: "stretch",
                            md: "center",
                        }}
                    >
                        <TextField
                            size="small"

                            placeholder="Search reference, customer, meter..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            size="small"
                            type="date"
                            label="Start"
                            value={localStartDate}
                            onChange={(e) =>
                                setLocalStartDate(
                                    e.target.value
                                )
                            }
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <TextField
                            size="small"
                            type="date"
                            label="End"
                            value={localEndDate}
                            onChange={(e) =>
                                setLocalEndDate(
                                    e.target.value
                                )
                            }
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <FormControl
                            size="small"
                            sx={{
                                minWidth: 150,
                            }}
                        >
                            <InputLabel>
                                Direction
                            </InputLabel>

                            <Select
                                value={localDirection}
                                label="Direction"
                                onChange={(e) =>
                                    setLocalDirection(
                                        e.target.value as
                                        | "all"
                                        | "debit"
                                        | "credit"
                                    )
                                }
                            >
                                <MenuItem value="all">
                                    All
                                </MenuItem>

                                <MenuItem value="debit">
                                    Debit
                                </MenuItem>

                                <MenuItem value="credit">
                                    Credit
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            startIcon={
                                <Search />
                            }
                            onClick={
                                handleApplyFilters
                            }
                        >
                            Apply
                        </Button>

                        <Tooltip title="Refresh">
                            <IconButton
                                onClick={onRefresh}
                            >
                                <Refresh />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </CardContent>
            </Card>

            {/* ----------------------------------------- */}
            {/* EXPORT */}
            {/* ----------------------------------------- */}

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                sx={{ mr: 30 }}
            >
                <Box>
                    <Typography
                        fontWeight={700}
                    >
                        Vendor History
                    </Typography>

                    <Typography
                        fontSize={12}
                        color="text.secondary"
                    >
                        {vendorName ||
                            `Vendor ${vendorId}`}
                    </Typography>
                </Box>

                <Stack
                    direction="row"
                    spacing={1}
                >
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={
                            <Download />
                        }
                        onClick={() =>
                            handleExport("csv")
                        }
                    >
                        CSV
                    </Button>

                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                            handleExport("xlsx")
                        }
                    >
                        XLSX
                    </Button>

                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                            handleExport("pdf")
                        }
                    >
                        PDF
                    </Button>
                </Stack>
            </Stack>

            {/* ----------------------------------------- */}
            {/* TABLE */}
            {/* ----------------------------------------- */}

            {loading ? (
                <Box
                    py={8}
                    textAlign="center"
                >
                    <CircularProgress
                        size={28}
                    />

                    <Typography
                        mt={2}
                        color="text.secondary"
                    >
                        Loading vendor history...
                    </Typography>
                </Box>
            ) : filteredTransactions.length ===
                0 ? (
                <Box
                    py={8}
                    textAlign="center"
                >
                    <Typography
                        variant="h6"
                        fontWeight={600}
                    >
                        No vendor history found
                    </Typography>

                    <Typography
                        color="text.secondary"
                        mt={1}
                    >
                        Try changing your search,
                        date or direction filters.
                    </Typography>
                </Box>
            ) : (
                // <Box
                //     sx={{
                //         width: "100%",
                //         maxWidth: "100%",
                //         overflowX: "auto",
                //         border: "1px solid #E5E7EB",
                //         borderRadius: 2,
                //     }}
                // >
                <Box
    sx={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "auto",
        overflowY: "hidden",
        pb: 1,
        mt: 2,
        mb: 3,

        "&::-webkit-scrollbar": {
            height: 8,
        },

        "&::-webkit-scrollbar-track": {
            backgroundColor: "#F1F5F9",
            borderRadius: 10,
        },

        "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#CBD5E1",
            borderRadius: 10,
        },

        "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#94A3B8",
        },

        // Firefox
        scrollbarWidth: "thin",
        scrollbarColor: "#CBD5E1 #F1F5F9",
    }}
>
                    <Table
                        size="small"
                        // sx={{
                        //     minWidth: 1250,
                        //     width: "max-content",
                        // }}
                        // direction="row"
        // spacing={2}
        sx={{
            width: "max-content",
            minWidth: "100%",
            mr: 2,
        }}
                    >
                        <TableHead>
                            <TableRow
                                sx={{
                                    bgcolor: "#F8FAFC",
                                }}
                            >
                                {/* <TableCell /> */}
                                <TableCell>
                                    MORE
                                </TableCell>
                                <TableCell>
                                    DATE
                                </TableCell>

                                <TableCell>
                                    CUSTOMER
                                </TableCell>

                                <TableCell>
                                    REFERENCE
                                </TableCell>

                                <TableCell>
                                    TYPE
                                </TableCell>

                                <TableCell>
                                    BILL TYPE
                                </TableCell>

                                <TableCell
                                    align="right"
                                >
                                    AMOUNT
                                </TableCell>

                                <TableCell>
                                    DIRECTION
                                </TableCell>

                                <TableCell>
                                    STATUS
                                </TableCell>

                                <TableCell>
                                    METER
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredTransactions.map(
                                (tx) => {
                                    const rowId = `${tx.reference}-${tx.date}`;

                                    const expanded =
                                        expandedRow ===
                                        rowId;

                                    return (
                                        <React.Fragment
                                            key={rowId}
                                        >
                                            <TableRow
                                                hover
                                            >
                                                <TableCell
                                                    padding="checkbox"
                                                >
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            setExpandedRow(
                                                                expanded
                                                                    ? null
                                                                    : rowId
                                                            )
                                                        }
                                                    >
                                                        {expanded ? (
                                                            <ExpandLess />
                                                        ) : (
                                                            <ExpandMore />
                                                        )}
                                                    </IconButton>
                                                </TableCell>

                                                <TableCell>
                                                    <Stack>
                                                        <Typography
                                                            fontSize={
                                                                13
                                                            }
                                                            fontWeight={
                                                                500
                                                            }
                                                        >
                                                            {dayjs(
                                                                tx.date
                                                            ).format(
                                                                "DD MMM YYYY"
                                                            )}
                                                        </Typography>

                                                        <Typography
                                                            fontSize={
                                                                11
                                                            }
                                                            color="text.secondary"
                                                        >
                                                            {dayjs(
                                                                tx.date
                                                            ).format(
                                                                "HH:mm:ss"
                                                            )}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography
                                                        fontSize={
                                                            13
                                                        }
                                                        fontWeight={
                                                            600
                                                        }
                                                    >
                                                        {tx.customer_name ||
                                                            "N/A"}
                                                    </Typography>

                                                    <Typography
                                                        fontSize={
                                                            11
                                                        }
                                                        color="text.secondary"
                                                    >
                                                        {tx.account_no ||
                                                            "No account"}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography
                                                        fontFamily="monospace"
                                                        fontSize={
                                                            11
                                                        }
                                                    >
                                                        {tx.reference}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        label={
                                                            tx.transaction_type ||
                                                            "N/A"
                                                        }
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        label={
                                                            tx.bill_type ||
                                                            "N/A"
                                                        }
                                                        size="small"
                                                        sx={{
                                                            textTransform:
                                                                "capitalize",
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell
                                                    align="right"
                                                >
                                                    <Typography
                                                        fontWeight={
                                                            700
                                                        }
                                                        color={
                                                            tx.direction ===
                                                                "credit"
                                                                ? "success.main"
                                                                : "error.main"
                                                        }
                                                    >
                                                        {tx.direction ===
                                                            "credit"
                                                            ? "+"
                                                            : "-"}
                                                        {formatCurrency(
                                                            tx.amount
                                                        )}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        label={directionLabel(
                                                            tx.direction
                                                        )}
                                                        size="small"
                                                        color={
                                                            tx.direction ===
                                                                "credit"
                                                                ? "success"
                                                                : "error"
                                                        }
                                                        variant="outlined"
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        label={
                                                            tx.status ||
                                                            "N/A"
                                                        }
                                                        size="small"
                                                        color={getStatusColor(
                                                            tx.status
                                                        )}
                                                        variant="outlined"
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Typography
                                                        fontFamily="monospace"
                                                        fontSize={
                                                            12
                                                        }
                                                    >
                                                        {tx.meter_number ||
                                                            "N/A"}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>

                                            {/* -------------------------------- */}
                                            {/* EXPANDED DETAILS */}
                                            {/* -------------------------------- */}

                                            <TableRow>
                                                <TableCell
                                                    colSpan={10}
                                                    sx={{
                                                        p: 0,
                                                        border: 0,
                                                    }}
                                                >
                                                    <Collapse
                                                        in={expanded}
                                                        timeout="auto"
                                                        unmountOnExit
                                                    >
                                                        <Box
                                                            sx={{
                                                                p: 2,
                                                                bgcolor:
                                                                    "#F8FAFC",
                                                            }}
                                                        >
                                                            <Stack
                                                                direction={{
                                                                    xs: "column",
                                                                    md: "row",
                                                                }}
                                                                spacing={3}
                                                            >
                                                                <HistoryDetail
                                                                    label="Value"
                                                                    value={formatCurrency(
                                                                        tx.value
                                                                    )}
                                                                />

                                                                <HistoryDetail
                                                                    label="VAT"
                                                                    value={formatCurrency(
                                                                        tx.vat
                                                                    )}
                                                                />

                                                                <HistoryDetail
                                                                    label="Fee"
                                                                    value={formatCurrency(
                                                                        tx.fee
                                                                    )}
                                                                />

                                                                <HistoryDetail
                                                                    label="Debt"
                                                                    value={formatCurrency(
                                                                        tx.debt
                                                                    )}
                                                                />

                                                                <HistoryDetail
                                                                    label="Refund"
                                                                    value={formatCurrency(
                                                                        tx.refund
                                                                    )}
                                                                />

                                                                <HistoryDetail
                                                                    label="Units"
                                                                    value={
                                                                        tx.units ??
                                                                        "N/A"
                                                                    }
                                                                />

                                                                <HistoryDetail
                                                                    label="Balance"
                                                                    value={
                                                                        tx.balance !==
                                                                            null
                                                                            ? formatCurrency(
                                                                                tx.balance
                                                                            )
                                                                            : "N/A"
                                                                    }
                                                                />
                                                            </Stack>

                                                            <Divider
                                                                sx={{
                                                                    my: 2,
                                                                }}
                                                            />

                                                            <Stack
                                                                direction={{
                                                                    xs: "column",
                                                                    md: "row",
                                                                }}
                                                                spacing={3}
                                                            >
                                                                <HistoryDetail
                                                                    label="Account Number"
                                                                    value={
                                                                        tx.account_no ||
                                                                        "N/A"
                                                                    }
                                                                />

                                                                <HistoryDetail
                                                                    label="Meter Number"
                                                                    value={
                                                                        tx.meter_number ||
                                                                        "N/A"
                                                                    }
                                                                />

                                                                <HistoryDetail
                                                                    label="Posted At"
                                                                    value={
                                                                        tx.posted_at
                                                                            ? dayjs(
                                                                                tx.posted_at
                                                                            ).format(
                                                                                "DD MMM YYYY, HH:mm:ss"
                                                                            )
                                                                            : "N/A"
                                                                    }
                                                                />

                                                                <HistoryDetail
                                                                    label="Reversed"
                                                                    value={
                                                                        tx.reversed
                                                                            ? "Yes"
                                                                            : "No"
                                                                    }
                                                                />
                                                            </Stack>

                                                            {tx.token && (
                                                                <>
                                                                    <Divider
                                                                        sx={{
                                                                            my: 2,
                                                                        }}
                                                                    />

                                                                    <Stack
                                                                        direction="row"
                                                                        alignItems="center"
                                                                        spacing={1}
                                                                    >
                                                                        <Typography
                                                                            fontSize={
                                                                                12
                                                                            }
                                                                            fontWeight={
                                                                                600
                                                                            }
                                                                        >
                                                                            Token:
                                                                        </Typography>

                                                                        <Typography
                                                                            fontFamily="monospace"
                                                                            fontSize={
                                                                                12
                                                                            }
                                                                        >
                                                                            {tx.token}
                                                                        </Typography>

                                                                        <Tooltip
                                                                            title={
                                                                                copiedToken ===
                                                                                    tx.token
                                                                                    ? "Copied"
                                                                                    : "Copy token"
                                                                            }
                                                                        >
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() =>
                                                                                    copyToken(
                                                                                        tx.token!
                                                                                    )
                                                                                }
                                                                            >
                                                                                <ContentCopy
                                                                                    fontSize="small"
                                                                                />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Stack>
                                                                </>
                                                            )}
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    );
                                }
                            )}
                        </TableBody>
                    </Table>
                </Box>
            )}

            {/* ----------------------------------------- */}
            {/* PAGINATION */}
            {/* ----------------------------------------- */}

            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: "flex-start",
                    sm: "center",
                }}
                spacing={2}
                mt={3}
                ml={3}
                mr={20}
            >
                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    {transactionCount.toLocaleString()}{" "}
                    transactions
                </Typography>

                {totalPages > 1 && (
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(
                            _,
                            value
                        ) =>
                            onPageChange(value)
                        }
                        color="primary"
                        size="small"
                        shape="rounded"
                        sx={{ mr: 20 }}
                    />
                )}
            </Stack>
        </Box>
    );
};

export default VendorHistory;

// =====================================================
// SUMMARY CARD
// =====================================================

const SummaryCard = ({
    title,
    value,
}: {
    title: string;
    value: string;
}) => (
    <Card
        sx={{
            flex: 1,
            borderRadius: 3,
            border:
                "1px solid #E5E7EB",
            boxShadow: "none",
        }}
    >
        <CardContent>
            <Typography
                variant="body2"
                color="text.secondary"
                mb={1}
            >
                {title}
            </Typography>

            <Typography
                variant="h6"
                fontWeight={700}
            >
                {value}
            </Typography>
        </CardContent>
    </Card>
);

// =====================================================
// DETAIL
// =====================================================

const HistoryDetail = ({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) => (
    <Box>
        <Typography
            fontSize={11}
            color="text.secondary"
            mb={0.3}
        >
            {label}
        </Typography>

        <Typography
            fontSize={13}
            fontWeight={600}
        >
            {value}
        </Typography>
    </Box>
);