
import React, { useMemo, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    InputAdornment,
    MenuItem,
    Pagination,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import {
    FileDownload,
    Search,
} from "@mui/icons-material";

import {
    VendorLedgerRow,
    VendorLedgerSummary,
} from "../../services/vendorService";

import dayjs from "dayjs";

interface VendorLedgerProps {
    vendorName?: string;

    txTransactions: VendorLedgerRow[];
    txSummary: VendorLedgerSummary | null;

    loading: boolean;
    transactionCount: number;
    page: number;

    startDate: string;
    endDate: string;

    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;

    onPageChange: (page: number) => void;
    onRefresh: () => void;
    onExport: () => void;
}

const ROWS_PER_PAGE = 20;

const VendorLedger: React.FC<VendorLedgerProps> = ({
    vendorName,
    txTransactions,
    txSummary,
    loading,
    transactionCount,
    page,

    startDate,
    endDate,

    onStartDateChange,
    onEndDateChange,

    onPageChange,
    onRefresh,
    onExport,
}) => {
    const [search, setSearch] = useState("");

    const [typeFilter, setTypeFilter] = useState<
        "all" | "credit" | "debit"
    >("all");

    const totalPages = Math.ceil(
        transactionCount / ROWS_PER_PAGE
    );

    const filteredTransactions = useMemo(() => {
        const value = search.trim().toLowerCase();

        return txTransactions.filter((tx) => {
            // Type filter
            if (
                typeFilter === "credit" &&
                tx.credit <= 0
            ) {
                return false;
            }

            if (
                typeFilter === "debit" &&
                tx.debit <= 0
            ) {
                return false;
            }

            // Search
            if (!value) {
                return true;
            }

            return [
                tx.reference,
                tx.category,
                tx.account_role,
                tx.date,
            ]
                .filter(Boolean)
                .some((field) =>
                    String(field)
                        .toLowerCase()
                        .includes(value)
                );
        });
    }, [
        txTransactions,
        search,
        typeFilter,
    ]);

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

    const categoryLabel = (
        category: string
    ) => {
        if (!category) {
            return "N/A";
        }

        return category
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );
    };

    return (
        <Box>

            {/* Summary */}
            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                spacing={2}
                mb={3}
                sx={{mt:2}}
            >
                <SummaryCard
                    title="Opening Balance"
                    value={formatCurrency(
                        txSummary?.opening_balance
                    )}
                />

                <SummaryCard
                    title="Total Debit"
                    value={formatCurrency(
                        txSummary?.total_debit
                    )}
                />

                <SummaryCard
                    title="Total Credit"
                    value={formatCurrency(
                        txSummary?.total_credit
                    )}
                />

                <SummaryCard
                    title="Closing Balance"
                    value={formatCurrency(
                        txSummary?.closing_balance
                    )}
                />
            </Stack>

            {/* Filters */}
            <Stack
                direction={{
                    xs: "column",
                    md: "row",
                }}
                spacing={1.5}
                mb={3}
                justifyContent="space-between"
            >
                <TextField
                    size="small"
                    placeholder="Search reference, category..."
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
                    select
                    size="small"
                    label="Transaction type"
                    value={typeFilter}
                    onChange={(e) =>
                        setTypeFilter(
                            e.target.value as
                                | "all"
                                | "credit"
                                | "debit"
                        )
                    }
                    sx={{
                        minWidth: 170,
                    }}
                >
                    <MenuItem value="all">
                        All transactions
                    </MenuItem>

                    <MenuItem value="credit">
                        Credit
                    </MenuItem>

                    <MenuItem value="debit">
                        Debit
                    </MenuItem>
                </TextField>

                <TextField
                    size="small"
                    type="date"
                    label="Start"
                    value={startDate}
                    onChange={(e) =>
                        onStartDateChange(
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
                    value={endDate}
                    onChange={(e) =>
                        onEndDateChange(
                            e.target.value
                        )
                    }
                    InputLabelProps={{
                        shrink: true,
                    }}
                />

                <Button
                    variant="outlined"
                    onClick={onRefresh}
                    disabled={loading}
                >
                    Refresh
                </Button>

                <Button
                    variant="outlined"
                    startIcon={<FileDownload />}
                    onClick={onExport}
                    disabled={
                        loading ||
                        !txTransactions.length
                    }
                >
                    Export
                </Button>
            </Stack>

            {/* Table */}
            {loading ? (
                <Box
                    py={8}
                    textAlign="center"
                >
                    <CircularProgress size={28} />

                    <Typography
                        mt={2}
                        color="text.secondary"
                    >
                        Loading vendor ledger...
                    </Typography>
                </Box>
            ) : filteredTransactions.length === 0 ? (
                <Box
                    py={8}
                    textAlign="center"
                >
                    <Typography
                        variant="h6"
                        fontWeight={600}
                    >
                        No ledger transactions found
                    </Typography>

                    <Typography
                        color="text.secondary"
                        mt={1}
                    >
                        Try changing your search or filters.
                    </Typography>
                </Box>
            ) : (
                <TableContainer
                    sx={{
                        border: "1px solid #E5E7EB",
                        borderRadius: 2,
                    }}
                >
                    <Table size="small">
                        <TableHead>
                            <TableRow
                                sx={{
                                    bgcolor: "#F8FAFC",
                                }}
                            >
                                <TableCell>
                                    DATE
                                </TableCell>

                                <TableCell>
                                    REFERENCE
                                </TableCell>

                                <TableCell>
                                    CATEGORY
                                </TableCell>

                                <TableCell>
                                    ACCOUNT ROLE
                                </TableCell>

                                <TableCell align="right">
                                    DEBIT
                                </TableCell>

                                <TableCell align="right">
                                    CREDIT
                                </TableCell>

                                <TableCell align="right">
                                    BALANCE
                                </TableCell>

                                <TableCell>
                                    STATUS
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredTransactions.map(
                                (tx) => (
                                    <TableRow
                                        key={`${tx.reference}-${tx.date}`}
                                        hover
                                    >
                                        <TableCell>
                                            <Stack>
                                                <Typography
                                                    fontSize={13}
                                                    fontWeight={500}
                                                >
                                                    {dayjs(
                                                        tx.date
                                                    ).format(
                                                        "DD MMM YYYY"
                                                    )}
                                                </Typography>

                                                <Typography
                                                    fontSize={11}
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
                                                fontFamily="monospace"
                                                fontSize={12}
                                            >
                                                {tx.reference}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={categoryLabel(
                                                    tx.category
                                                )}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>

                                        <TableCell>
                                            {tx.account_role ||
                                                "N/A"}
                                        </TableCell>

                                        <TableCell align="right">
                                            {tx.debit > 0 ? (
                                                <Typography
                                                    fontWeight={600}
                                                    color="error.main"
                                                >
                                                    -
                                                    {formatCurrency(
                                                        tx.debit
                                                    )}
                                                </Typography>
                                            ) : (
                                                "—"
                                            )}
                                        </TableCell>

                                        <TableCell align="right">
                                            {tx.credit > 0 ? (
                                                <Typography
                                                    fontWeight={600}
                                                    color="success.main"
                                                >
                                                    +
                                                    {formatCurrency(
                                                        tx.credit
                                                    )}
                                                </Typography>
                                            ) : (
                                                "—"
                                            )}
                                        </TableCell>

                                        <TableCell align="right">
                                            {tx.balance !==
                                            null ? (
                                                formatCurrency(
                                                    tx.balance
                                                )
                                            ) : (
                                                "N/A"
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={
                                                    tx.migrated
                                                        ? "Migrated"
                                                        : "Current"
                                                }
                                                size="small"
                                                color={
                                                    tx.migrated
                                                        ? "warning"
                                                        : "success"
                                                }
                                                variant="outlined"
                                            />
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Pagination */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mt={3}
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
                    />
                )}
            </Stack>
        </Box>
    );
};

export default VendorLedger;

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
            border: "1px solid #E5E7EB",
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