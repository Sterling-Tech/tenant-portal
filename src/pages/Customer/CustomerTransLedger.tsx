import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Pagination,
    Paper,
    Select,
    SelectChangeEvent,
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
    AccountBalance,
    Download,
    ElectricMeter,
    Person,
    Refresh,
    Search,
} from "@mui/icons-material";

import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { exportCustomerStatement, fetchCustomerStatement, PostpaidStatementRow, PrepaidStatementRow } from "../../services/vendorService";
import dayjs from "dayjs";

import type { CustomerStatement as CustomerStatementType } from "../../services/vendorService";
interface Props {
    customerId: number;
}

// type StatementType = "" | "prepaid" | "postpaid";

const ROWS_PER_PAGE = 10;

export default function CustomerStatement({
    customerId,
}: Props) {
    // const [statement, setStatement] = useState<CustomerStatement | null>(null);
    const [statement, setStatement] = useState<CustomerStatementType | null>(null);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");

    // const [statementType, setStatementType] = useState<StatementType>("");
    const [statementType, setStatementType] = useState<"prepaid" | "postpaid">("prepaid");

    const [startDate, setStartDate] = useState("");

    const [endDate, setEndDate] = useState("");

    const [page, setPage] = useState(1);

    /**
     * Load statement
     */
    const loadStatement = useCallback(async () => {
        try {
            setLoading(true);

            const response = await fetchCustomerStatement(
                customerId,
                {
                    start: startDate || undefined,
                    end: endDate || undefined,
                    type:
                        statementType || undefined,
                }
            );

            console.log(
                "Customer statement:",
                response
            );

            setStatement(response);
            setPage(1);
        } catch (error) {
            console.error(
                "Failed to fetch customer statement:",
                error
            );

            setStatement(null);

            toast.error(
                getErrorMessage(error)
            );
        } finally {
            setLoading(false);
        }
    }, [
        customerId,
        startDate,
        endDate,
        statementType,
    ]);

    useEffect(() => {
        loadStatement();
    }, [loadStatement]);

    const handleExport = async (
        format: "csv" | "xlsx" | "pdf"
    ) => {
        try {
            const response =
                await exportCustomerStatement(
                    customerId,
                    format,
                    {
                        start: startDate || undefined,
                        end: endDate || undefined,
                        type:
                            statementType || undefined,
                    }
                );

            const blob = new Blob([
                response || [],
            ]);

            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `customer-statement.${format}`;

            link.click();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error(
                getErrorMessage(error)
            );
        }
    };

    

    /**
     * Search
     */
  
    const filteredRows = useMemo(() => {
  if (!statement) {
    return [];
  }

  const value = search.trim().toLowerCase();

  if (!value) {
    return statement.rows;
  }

  if (statement.type === "prepaid") {
    return statement.rows.filter((row:any) =>
      [
        row.reference,
        row.token,
        row.vendor,
        row.tariff,
        row.meter_number,
        row.token_type,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field).toLowerCase().includes(value)
        )
    );
  }

  return statement.rows.filter((row:any) =>
    [
      row.reference,
      row.particulars,
      row.period,
      row.type,
      row.tariff,
      row.remark,
    ]
      .filter(Boolean)
      .some((field) =>
        String(field).toLowerCase().includes(value)
      )
  );
}, [statement, search]);
    /**
     * Pagination
     */
    const totalPages = Math.ceil(
        filteredRows.length /
        ROWS_PER_PAGE
    );

    const paginatedRows =
        useMemo(() => {
            const start =
                (page - 1) *
                ROWS_PER_PAGE;

            return filteredRows.slice(
                start,
                start + ROWS_PER_PAGE
            );
        }, [
            filteredRows,
            page,
        ]);

    /**
     * Currency
     */

    const formatNumber = (
        value: number | string | null | undefined
    ) => {
        return Number(value ?? 0).toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    };

    const formatCurrency = (
        value: number | string | null | undefined
    ) => {
        return `₦${Number(value ?? 0).toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;
    };
    /**
     * Date
     */
    const formatDate = (
        date?: string
    ) => {
        if (!date) return "-";

        const parsed =
            new Date(date);

        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {
            return date;
        }

        return parsed.toLocaleDateString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    /**
     * Reset
     */
    const handleReset = () => {
        setSearch("");
        setStatementType("prepaid");
        setStartDate("");
        setEndDate("");
        setPage(1);
    };

    /**
     * Type change
     */
  
    const handleTypeChange = (
        event: SelectChangeEvent<"prepaid" | "postpaid">
    ) => {
        const type = event.target.value as "prepaid" | "postpaid";
        setStatementType(type);
        setPage(1);
    };



    const header =
        statement?.header;

    return (
        <Stack spacing={3}>

            {/* =====================================================
          CUSTOMER HEADER
      ====================================================== */}
            <Card
                sx={{
                    borderRadius: 3,
                    border:
                        "1px solid #E5E7EB",
                }}
            >
                <CardContent>

                    <Stack
                        direction={{
                            xs: "column",
                            md: "row",
                        }}
                        justifyContent="space-between"
                        spacing={2}
                    >

                        <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                        >
                            <Box
                                sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 2,
                                    bgcolor:
                                        "#EEF4FF",
                                    color:
                                        "#1D4ED8",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                }}
                            >
                                <Person />
                            </Box>

                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    {header?.Name ||
                                        "Customer Statement"}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Account Number:{" "}
                                    {header?.[
                                        "Account Number"
                                    ] || "-"}
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <Chip
                                label={
                                    header?.[
                                    "Account Status"
                                    ] || "Unknown"
                                }
                                color={
                                    header?.[
                                        "Account Status"
                                    ] === "active"
                                        ? "success"
                                        : "default"
                                }
                            />

                            <Chip
                                label={
                                    header?.[
                                    "Metering Type"
                                    ] || statement?.type
                                }
                                color="primary"
                            />
                        </Stack>

                    </Stack>

                    <Divider
                        sx={{ my: 3 }}
                    />

                    {/* Customer information */}
                    <Grid container spacing={2}>

                        <Info
                            label="Meter Number"
                            value={
                                header?.[
                                "Meter Number"
                                ]
                            }
                        />

                        <Info
                            label="Phone Number"
                            value={
                                header?.[
                                "Phone Number"
                                ]
                            }
                        />

                        <Info
                            label="Category"
                            value={
                                header?.Category
                            }
                        />

                        <Info
                            label="Tariff"
                            value={
                                header?.Tariff
                            }
                        />

                        <Info
                            label="Tariff Rate"
                            value={
                                header?.[
                                    "Tariff Rate"
                                ]
                                    ? formatCurrency(
                                        header[
                                        "Tariff Rate"
                                        ]
                                    )
                                    : "-"
                            }
                        />

                        <Info
                            label="Band"
                            value={
                                header?.Band
                            }
                        />

                        <Info
                            label="Class"
                            value={
                                header?.Class
                            }
                        />

                        <Info
                            label="District"
                            value={
                                header?.District
                            }
                        />

                        <Info
                            label="Service Center"
                            value={
                                header?.[
                                "Service Center"
                                ] || "-"
                            }
                        />

                        <Info
                            label="Feeder 11KV"
                            value={
                                header?.[
                                "Feeder 11KV"
                                ] || "-"
                            }
                        />

                        <Info
                            label="Feeder 33KV"
                            value={
                                header?.[
                                "Feeder 33KV"
                                ] || "-"
                            }
                        />

                        <Info
                            label="Transformer"
                            value={
                                header?.Transformer
                            }
                        />

                    </Grid>

                    <Box mt={2}>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Service Address
                        </Typography>

                        <Typography
                            fontWeight={600}
                        >
                            {header?.[
                                "Service Address"
                            ] || "-"}
                        </Typography>
                    </Box>

                </CardContent>
            </Card>

            {/* =====================================================
          FILTER
      ====================================================== */}
            <Card
                sx={{
                    borderRadius: 3,
                    border:
                        "1px solid #E5E7EB",
                }}
            >
                <CardContent>

                    <Stack
                        direction={{
                            xs: "column",
                            md: "row",
                        }}
                        spacing={2}
                        alignItems={{
                            xs: "stretch",
                            md: "center",
                        }}
                    >

                        {/* Search */}
                        <TextField
                            size="small"
                            placeholder="Search ref, token..."
                            value={search}
                            onChange={(e) => {
                                setSearch(
                                    e.target.value
                                );
                                setPage(1);
                            }}
                            sx={{
                                minWidth: {
                                    xs: "100%",
                                    md: 240,
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search
                                            fontSize="small"
                                        />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Type */}
                        <FormControl
                            size="small"
                            sx={{ minWidth: 150 }}
                        >
                            <InputLabel>Type</InputLabel>

                            <Select
                                value={statementType}
                                label="Type"
                                onChange={handleTypeChange}
                            >
                                <MenuItem value="prepaid">Prepaid</MenuItem>
                                <MenuItem value="postpaid">Postpaid</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Start */}
                        <TextField
                            size="small"
                            type="date"
                            label="Start Date"
                            value={startDate}
                            onChange={(e) =>
                                setStartDate(
                                    e.target.value
                                )
                            }
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        {/* End */}
                        <TextField
                            size="small"
                            type="date"
                            label="End Date"
                            value={endDate}
                            onChange={(e) =>
                                setEndDate(
                                    e.target.value
                                )
                            }
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <Button
                            variant="outlined"
                            startIcon={
                                <Refresh />
                            }
                            onClick={
                                loadStatement
                            }
                            disabled={loading}
                        >
                            Refresh
                        </Button>

                    </Stack>

                    {/* Export */}
                    <Stack
                        direction="row"
                        justifyContent="flex-end"
                        spacing={1}
                        mt={2}
                    >
                        <Button
                            size="small"
                            startIcon={
                                <Download />
                            }
                            variant="outlined"
                            onClick={() =>
                                handleExport(
                                    "csv"
                                )
                            }
                        >
                            CSV
                        </Button>

                        <Button
                            size="small"
                            startIcon={
                                <Download />
                            }
                            variant="outlined"
                            onClick={() =>
                                handleExport(
                                    "xlsx"
                                )
                            }
                        >
                            Excel
                        </Button>

                        <Button
                            size="small"
                            startIcon={
                                <Download />
                            }
                            variant="outlined"
                            onClick={() =>
                                handleExport(
                                    "pdf"
                                )
                            }
                        >
                            PDF
                        </Button>

                        <Button
                            size="small"
                            onClick={
                                handleReset
                            }
                        >
                            Clear
                        </Button>
                    </Stack>

                </CardContent>
            </Card>

            {/* =====================================================
          STATEMENT TABLE
      ====================================================== */}
            <Card
                sx={{
                    borderRadius: 3,
                    border:
                        "1px solid #E5E7EB",
                    overflow: "hidden",
                }}
            >

                <Box
                    px={3}
                    py={2}
                    borderBottom="1px solid #E5E7EB"
                >
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Box>
                            <Typography
                                fontWeight={700}
                                fontSize={18}
                            >
                                Statement Transactions
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {statement?.start ||
                                    "-"}{" "}
                                →{" "}
                                {statement?.end ||
                                    "-"}
                            </Typography>
                        </Box>

                        <Chip
                            label={`${filteredRows.length} records`}
                            size="small"
                        />
                    </Stack>
                </Box>

                {loading ? (
                    <Box
                        py={10}
                        textAlign="center"
                    >
                        <CircularProgress />
                    </Box>
                ) : !statement ? (
                    <Box p={4}>
                        <Alert severity="info">
                            No statement data available.
                        </Alert>
                    </Box>
                ) : statement.rows.length ===
                    0 ? (
                    <Box p={6}>
                        <Typography
                            textAlign="center"
                            color="text.secondary"
                        >
                            No transactions found
                            for this period.
                        </Typography>
                    </Box>
                ) : (
                    // <>
                    //     <TableContainer
                    //         sx={{
                    //             overflowX:
                    //                 "auto",
                    //         }}
                    //     >
                    //         <Table
                    //             size="small"
                    //             sx={{
                    //                 minWidth: 1200,
                    //             }}
                    //         >

                    //             <TableHead>
                    //                 <TableRow
                    //                     sx={{
                    //                         bgcolor:
                    //                             "#F8FAFC",
                    //                     }}
                    //                 >
                    //                     <TableCell>
                    //                         <strong>
                    //                             DATE
                    //                         </strong>
                    //                     </TableCell>

                    //                     <TableCell>
                    //                         <strong>
                    //                             REFERENCE
                    //                         </strong>
                    //                     </TableCell>

                    //                     <TableCell align="right">
                    //                         <strong>
                    //                             AMOUNT
                    //                         </strong>
                    //                     </TableCell>

                    //                     <TableCell align="right">
                    //                         <strong>
                    //                             PAID ARREARS
                    //                         </strong>
                    //                     </TableCell>

                    //                     <TableCell align="right">
                    //                         <strong>
                    //                             ENERGY VALUE
                    //                         </strong>
                    //                     </TableCell>

                    //                     <TableCell align="right">
                    //                         <strong>
                    //                             VAT
                    //                         </strong>
                    //                     </TableCell>

                    //                     <TableCell>
                    //                         <strong>
                    //                             TOKEN
                    //                         </strong>
                    //                     </TableCell>

                    //                     <TableCell>
                    //                         <strong>
                    //                             TARIFF
                    //                         </strong>
                    //                     </TableCell>

                    //                     <TableCell align="right">
                    //                         <strong>
                    //                             RATE
                    //                         </strong>
                    //                     </TableCell>

                    //                     <TableCell>
                    //                         <strong>
                    //                             METER
                    //                         </strong>
                    //                     </TableCell>

                    //                 </TableRow>
                    //             </TableHead>

                    //             <TableBody>
                    //                 {paginatedRows.map(
                    //                     (
                    //                         row,
                    //                         index
                    //                     ) => (
                    //                         <PrepaidRow
                    //                             key={
                    //                                 row.reference ||
                    //                                 index
                    //                             }
                    //                             row={row}
                    //                             formatCurrency={
                    //                                 formatCurrency
                    //                             }
                    //                             formatDate={
                    //                                 formatDate
                    //                             }
                    //                         />
                    //                     )
                    //                 )}
                    //             </TableBody>

                    //         </Table>
                    //     </TableContainer>

                    //     {/* Pagination */}
                    //     {totalPages > 1 && (
                    //         <Stack
                    //             alignItems="center"
                    //             py={2}
                    //         >
                    //             <Pagination
                    //                 count={
                    //                     totalPages
                    //                 }
                    //                 page={page}
                    //                 onChange={(
                    //                     _,
                    //                     value
                    //                 ) =>
                    //                     setPage(value)
                    //                 }
                    //                 color="primary"
                    //             />
                    //         </Stack>
                    //     )}
                    // </>
                    <Card
                        sx={{
                            borderRadius: 3,
                            border: "1px solid #E5E7EB",
                        }}
                    >
                        <CardContent>

                            <Typography
                                variant="h6"
                                fontWeight={700}
                                mb={2}
                            >
                                {statementType === "prepaid"
                                    ? "Prepaid Transactions"
                                    : "Postpaid Transactions"}
                            </Typography>

                            {statementType === "prepaid" ? (
                                <PrepaidTransactionTable
                                    rows={
                                        statement.rows as PrepaidStatementRow[]
                                    }
                                    formatCurrency={formatCurrency}
                                />
                            ) : (
                                <PostpaidTransactionTable
                                    rows={
                                        statement.rows as PostpaidStatementRow[]
                                    }
                                    formatCurrency={formatCurrency}
                                />
                            )}

                        </CardContent>
                    </Card>
                )}
            </Card>

            {/* =====================================================
          TOTALS
      ====================================================== */}

            {statement &&
                <Card
                    sx={{
                        borderRadius: 3,
                        mb: 3,
                        border: "1px solid #E5E7EB",
                    }}
                >
                    <CardContent>

                        <Typography
                            variant="h6"
                            fontWeight={700}
                            mb={2}
                        >
                            {statement.type === "prepaid"
                                ? "Prepaid Summary"
                                : "Postpaid Account Summary"}
                        </Typography>

                        <Grid container spacing={2}>

                            {statement.type === "prepaid" ? (
                                <Grid sx={{mt:5}}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <SummaryCard
                                            title="Total Amount"
                                            value={formatCurrency(
                                                statement.total_amount
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <SummaryCard
                                            title="Paid Arrears"
                                            value={formatCurrency(
                                                statement.total_paid_arrears
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <SummaryCard
                                            title="Total Units"
                                            value={formatNumber(
                                                statement.total_units
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <SummaryCard
                                            title="Transactions"
                                            value={formatNumber(
                                                statement.rows?.length
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            ) : (
                                <Grid sx={{mt:5}}>
                                    <Grid item xs={12} sm={6} md={3} >
                                        <SummaryCard
                                            title="Opening Balance"
                                            value={formatCurrency(
                                                statement.opening_balance
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <SummaryCard
                                            title="Total Debit"
                                            value={formatCurrency(
                                                statement.total_debit
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <SummaryCard
                                            title="Total Credit"
                                            value={formatCurrency(
                                                statement.total_credit
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <SummaryCard
                                            title="Closing Balance"
                                            value={formatCurrency(
                                                statement.closing_balance
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            )}

                        </Grid>
                    </CardContent>
                </Card>
            }
            {/* =====================================================
          SUB ACCOUNTS
      ====================================================== */}
            {statement?.sub_accounts &&
                statement.sub_accounts.length >
                0 && (
                    <SubAccounts
                        accounts={
                            statement.sub_accounts
                        }
                        formatCurrency={
                            formatCurrency
                        }
                        formatDate={
                            formatDate
                        }
                    />
                )}

            {/* =====================================================
          DATA STATUS
      ====================================================== */}
            {statement?.data_as_of && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    textAlign="right"
                >
                    Data as of{" "}
                    {formatDate(
                        statement.data_as_of
                            .as_of
                    )}{" "}
                    ·{" "}
                    {statement.data_as_of.age}

                    {statement.data_as_of
                        .is_stale && (
                            <Chip
                                size="small"
                                color="warning"
                                label="Stale"
                                sx={{
                                    ml: 1,
                                }}
                            />
                        )}
                </Typography>
            )}

        </Stack>
    );
}

function Info({
    label,
    value,
}: {
    label: string;
    value?: string | number;
}) {
    return (
        <Grid item xs={12} sm={6} md={3}>
            <Box>
                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                    {label}
                </Typography>

                <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                        wordBreak:
                            "break-word",
                    }}
                >
                    {value || "-"}
                </Typography>
            </Box>
        </Grid>
    );
}


function SummaryCard({
    title,
    value,
}: {
    title: string;
    value: string;
}) {
    return (
        <Card
            sx={{
                borderRadius: 3,
                border:
                    "1px solid #E5E7EB",
            }}
        >
            <CardContent>
                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    {title}
                </Typography>

                <Typography
                    variant="h5"
                    fontWeight={700}
                    mt={1}
                >
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}
function SubAccounts({
    accounts,
    formatCurrency,
    formatDate,
}: {
    accounts: CustomerStatementType["sub_accounts"];
    formatCurrency: (
        value: number | string
    ) => string;
    formatDate: (
        value?: string
    ) => string;
}) {
    return (
        <Card
            sx={{
                borderRadius: 3,
                border:
                    "1px solid #E5E7EB",
                overflow: "hidden",
            }}
        >
            <Box
                px={3}
                py={2}
                borderBottom="1px solid #E5E7EB"
            >
                <Typography
                    fontWeight={700}
                    fontSize={18}
                >
                    Sub-Accounts
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Arrears, refunds and other
                    account adjustments
                </Typography>
            </Box>

            <TableContainer
                sx={{
                    overflowX: "auto",
                }}
            >
                <Table
                    size="small"
                    sx={{
                        minWidth: 900,
                    }}
                >
                    <TableHead>
                        <TableRow
                            sx={{
                                bgcolor:
                                    "#F8FAFC",
                            }}
                        >
                            <TableCell>
                                <strong>
                                    BUCKET
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    PLAN
                                </strong>
                            </TableCell>

                            <TableCell align="right">
                                <strong>
                                    RATE
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    EFFECTIVE DATE
                                </strong>
                            </TableCell>

                            <TableCell align="right">
                                <strong>
                                    AMOUNT BOOKED
                                </strong>
                            </TableCell>

                            <TableCell align="right">
                                <strong>
                                    BALANCE
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    STATUS
                                </strong>
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {accounts.map(
                            (account, index) => (
                                <TableRow
                                    key={`${account.bucket}-${index}`}
                                    hover
                                >
                                    <TableCell>
                                        <Typography
                                            fontWeight={600}
                                        >
                                            {account.bucket}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        {account.plan}
                                    </TableCell>

                                    <TableCell align="right">
                                        {formatCurrency(
                                            account.rate
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {account.effective_date
                                            ? formatDate(
                                                account.effective_date
                                            )
                                            : "-"}
                                    </TableCell>

                                    <TableCell align="right">
                                        {formatCurrency(
                                            account.amount_booked
                                        )}
                                    </TableCell>

                                    <TableCell align="right">
                                        <Typography
                                            fontWeight={600}
                                            color={
                                                account.balance >
                                                    0
                                                    ? "warning.main"
                                                    : account.balance <
                                                        0
                                                        ? "error.main"
                                                        : "text.primary"
                                            }
                                        >
                                            {formatCurrency(
                                                account.balance
                                            )}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={
                                                account.status
                                            }
                                            color={
                                                account.status ===
                                                    "active"
                                                    ? "success"
                                                    : "default"
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
}


export const PrepaidTransactionTable = ({
    rows,
    formatCurrency,
}: {
    rows: PrepaidStatementRow[];
    formatCurrency: (
        value: number | string
    ) => string;
}) => {
    return (
        <TableContainer
            component={Paper}
            sx={{ maxHeight: 500 }}
        >
            <Table stickyHeader>

                <TableHead>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Vendor</TableCell>
                        <TableCell>Reference</TableCell>
                        <TableCell>Token</TableCell>
                        <TableCell align="right">
                            Amount
                        </TableCell>
                        <TableCell align="right">
                            Paid Arrears
                        </TableCell>
                        <TableCell align="right">
                            Energy
                        </TableCell>
                        <TableCell align="right">
                            VAT
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>

                    {rows.map((row, index) => (
                        <TableRow
                            hover
                            key={`${row.reference}-${index}`}
                        >
                            <TableCell>
                                {dayjs(row.date).format(
                                    "DD MMM YYYY"
                                )}
                            </TableCell>

                            <TableCell>
                                {row.vendor || "N/A"}
                            </TableCell>

                            <TableCell>
                                {row.reference || "N/A"}
                            </TableCell>

                            <TableCell>
                                <Tooltip title={row.token || ""}>
                                    <Typography
                                        fontFamily="monospace"
                                    >
                                        {row.token
                                            ? `${row.token.slice(0, 10)}...`
                                            : "N/A"}
                                    </Typography>
                                </Tooltip>
                            </TableCell>

                            <TableCell align="right">
                                {formatCurrency(row.amount)}
                            </TableCell>

                            <TableCell align="right">
                                {formatCurrency(
                                    row.paid_arrears
                                )}
                            </TableCell>

                            <TableCell align="right">
                                {formatCurrency(
                                    row.energy_value
                                )}
                            </TableCell>

                            <TableCell align="right">
                                {formatCurrency(row.vat)}
                            </TableCell>
                        </TableRow>
                    ))}

                </TableBody>

            </Table>
        </TableContainer>
    );
};


export const PostpaidTransactionTable = ({
    rows,
    formatCurrency,
}: {
    rows: PostpaidStatementRow[];
    formatCurrency: (
        value: number | string
    ) => string;
}) => {
    return (
        <TableContainer
            component={Paper}
            sx={{ maxHeight: 500 }}
        >
            <Table stickyHeader>

                <TableHead>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Particulars</TableCell>
                        <TableCell>Reference</TableCell>
                        <TableCell>Period</TableCell>
                        <TableCell>Energy (kWh)</TableCell>
                        <TableCell align="right">
                            Debit
                        </TableCell>
                        <TableCell align="right">
                            Credit
                        </TableCell>
                        <TableCell align="right">
                            Balance
                        </TableCell>
                        <TableCell>Remark</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>

                    {rows.map((row, index) => (
                        <TableRow
                            hover
                            key={`${row.reference}-${index}`}
                        >
                            <TableCell>
                                {dayjs(row.date).format(
                                    "DD MMM YYYY"
                                )}
                            </TableCell>

                            <TableCell>
                                <Typography fontWeight={600}>
                                    {row.particulars || "N/A"}
                                </Typography>
                            </TableCell>

                            <TableCell>
                                {row.reference || "N/A"}
                            </TableCell>

                            <TableCell>
                                {row.period || "N/A"}
                            </TableCell>

                            <TableCell>
                                {row.energy_kwh || "N/A"}
                            </TableCell>

                            <TableCell align="right">
                                <Typography
                                    color="error.main"
                                    fontWeight={600}
                                >
                                    {formatCurrency(row.debit)}
                                </Typography>
                            </TableCell>

                            <TableCell align="right">
                                <Typography
                                    color="success.main"
                                    fontWeight={600}
                                >
                                    {formatCurrency(row.credit)}
                                </Typography>
                            </TableCell>

                            <TableCell align="right">
                                <Typography fontWeight={700}>
                                    {formatCurrency(row.balance)}
                                </Typography>
                            </TableCell>

                            <TableCell>
                                {row.remark || "N/A"}
                            </TableCell>

                        </TableRow>
                    ))}

                </TableBody>

            </Table>
        </TableContainer>
    );
};