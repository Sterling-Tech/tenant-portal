import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
        Alert,
        Avatar,
        Box,
        Button,
        Card,
        CardContent,
        CardHeader,
        Chip,
        CircularProgress,
        Grid,
        Stack,
        MenuItem,
        TextField,
        Typography,
        ToggleButtonGroup,
        ToggleButton,
        FormControl,
        InputLabel,
        Select,
        Divider,
} from '@mui/material';
import {
        Assessment,
        Refresh,
        Security,
        Analytics,
        FactCheckOutlined,
} from '@mui/icons-material';
import { useTenants } from '../../../hooks/useTenants';

import { LineChart, PieChart } from '@mui/x-charts';
import { fetchVendors, Vendor, AnalyticsBreakdown, AnalyticsCount, fetchanalytics, fetchAnalyticsBreakdown, fetchAnalyticsDashboad, AnalyticsDashboad, DailyCollection, dailyCollection, TotalVendorWallet, totalVendorWallet, CollectionByCategoryResponse, fetchCollectionByCategory, DailyTransactionsResponse, fetchDailyTransactions, CustomerCategory, fetchCustomerCategories } from '../../../services/vendorService';

import { toast } from 'react-toastify';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { usePermission } from '../../../hooks/usePermission';

type CustomerSummary = {
        total_customers?: number | string;
        active_customers?: number | string;
        inactive_customers?: number | string;
};

const TenantAdmin: React.FC = () => {
        const {
                summary,
                loading,
                refreshTenants,
        } = useTenants();

        const [selectedTenant, setVendors] = useState<Vendor[]>([]);
        const [count, setCount] = useState(0);

        const [searchLoading, setSearchLoading] = useState(false);
        const [createSuccess, setCreateSuccess] = useState<string | null>(null);

        const [customerFilter, setCustomerFilter] = useState<'all' | 'active' | 'inactive'>('all');

        const [collectionFilter, setCollectionFilter] = useState<'category' | 'branch' | 'tariff' | 'feeder' | 'transformer'>('category');
        const today = new Date().toISOString().split('T')[0];

        const [startDate, setStartDate] = useState<string>(today);
        const [endDate, setEndDate] = useState<string>(today);

        const [analyticsData, setAnalyticsData] = useState<AnalyticsCount | null>(null);
        const [breakdownData, setBreakdownData] = useState<AnalyticsBreakdown | null>(null);

        const [collectionByCategory, setCollectionByCategory] = useState<CollectionByCategoryResponse | null>(null);

        const [analyticfetchData, setAnalyticfetchData] = useState<AnalyticsDashboad | null>(null);
        const [vendorsLoading, setVendorsLoading] = useState(true);

        const [analyticsLoading, setAnalyticsLoading] = useState(false);
        //daily transaction graph state
        // const [transactionType, setTransactionType] = useState<"collections" | "debts">("collections");
        const [selectedRegion, setSelectedRegion] = useState("");
        const [selectedCategory, setSelectedCategory] = useState("");
        const [collection, setCollection] = useState<DailyCollection | null>(null);
        const [dailyCollectionFilter, setDailyCollectionFilter] = useState<"all" | "energy_payments" | "debt_payments">("all");

        const [internalWalletData, setInternalWalletData] = useState<TotalVendorWallet | null>(null);
        const [externalWalletData, setExternalWalletData] = useState<TotalVendorWallet | null>(null);
        const [vendorWalletLoading, setVendorWalletLoading] = useState(false);

        const [dailyTransactions, setDailyTransactions] = useState<DailyTransactionsResponse | null>(null);
        const [dailyTransactionsLoading, setDailyTransactionsLoading] = useState(false);
        const [transactionType, setTransactionType] = useState<"collections" | "paymentType" | "debts">("collections");
        const [categories, setCategories] = useState<CustomerCategory[]>([]);

        const customerSummary: CustomerSummary =
                analyticfetchData?.customer_summary || {};


        const customerValue =
                customerFilter === 'active'
                        ? customerSummary.active_customers
                        : customerSummary.total_customers;

        const loadDailyTransactions = async (
                start?: string,
                end?: string,
                category?: string
        ) => {
                try {
                        setDailyTransactionsLoading(true);

                        const response = await fetchDailyTransactions({
                                start_date: start,
                                end_date: end,
                                category: category || undefined,
                        });

                        setDailyTransactions(response);
                } catch (error) {
                        console.error("Failed to fetch daily transactions:", error);
                        toast.error(getErrorMessage(error));
                        setDailyTransactions(null);
                } finally {
                        setDailyTransactionsLoading(false);
                }
        };
        useEffect(() => {
                loadDailyTransactions(
                        startDate,
                        endDate,
                        selectedCategory
                );
        }, [startDate, endDate, selectedCategory]);

        const chartData = useMemo(() => {
                const days = dailyTransactions?.days ?? [];

                return {
                        labels: days.map((item) =>
                                new Date(item.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                })
                        ),

                        collections: days.map((item) =>
                                Number(item.total_collection) || 0
                        ),

                        debts: days.map((item) =>
                                Number(item.debt_payment) || 0
                        ),

                        prepaid: days.map((item) =>
                                Number(item.prepaid_collection) || 0
                        ),

                        postpaid: days.map((item) =>
                                Number(item.postpaid_collection) || 0
                        ),

                        unclassified: days.map((item) =>
                                Number(item.unclassified_collection) || 0
                        ),

                        transactionCount: days.map(
                                (item) => item.transaction_count || 0
                        ),
                };
        }, [dailyTransactions]);

        const chartSeries = useMemo(() => {
                if (transactionType === "debts") {
                        return [
                                {
                                        data: chartData.debts,
                                        label: "Debt Payment",
                                        area: true,
                                        showMark: false,
                                        curve: "natural" as const,
                                        color: "#D97706",
                                },
                        ];
                }

                if (transactionType === "paymentType") {
                        return [
                                {
                                        data: chartData.prepaid,
                                        label: "Prepaid",
                                        showMark: false,
                                        curve: "natural" as const,
                                        color: "#14B8A6",
                                },
                                {
                                        data: chartData.postpaid,
                                        label: "Postpaid",
                                        showMark: false,
                                        curve: "natural" as const,
                                        color: "#2563EB",
                                },
                        ];
                }

                return [
                        {
                                data: chartData.collections,
                                label: "Total Collections",
                                area: true,
                                showMark: false,
                                curve: "natural" as const,
                                color: "#14B8A6",
                        },
                ];
        }, [transactionType, chartData]);

        useEffect(() => {
                const loadCategories = async () => {
                        try {
                                const data = await fetchCustomerCategories();
                                setCategories(data);
                        } catch (error) {
                                console.error("Failed to load customer categories:", error);
                                setCategories([]);
                        }
                };

                loadCategories();
        }, []);
        // const loadAnalytics = async (start?: string, end?: string) => {
        //         setAnalyticsLoading(true);
        //         try {
        //                 const [analyticsRes, breakdownRes, analyticfetchRes] = await Promise.all([
        //                         fetchanalytics({
        //                                 start_date: start,
        //                                 end_date: end,
        //                         }),
        //                         fetchAnalyticsBreakdown(),
        //                         fetchAnalyticsDashboad(),
        //                 ]);
        //                 console.log(analyticfetchRes || null, "this th works", breakdownRes || null, "this th works", analyticsRes || null)
        //                 // API returns array → take first item
        //                 setAnalyticsData(analyticsRes || null);
        //                 setBreakdownData(breakdownRes || null);
        //                 setAnalyticfetchData(analyticfetchRes || null);
        //         } catch (err) {
        //                 console.error("Analytics error:", err);
        //                 toast.error(getErrorMessage(err));
        //         } finally {
        //                 setAnalyticsLoading(false);
        //         }
        // };

        const loadAnalytics = async (start?: string, end?: string) => {
                if (!start || !end) return;

                setAnalyticsLoading(true);

                try {
                        const [
                                analyticsRes,
                                breakdownRes,
                                analyticfetchRes,
                                collectionRes,
                        ] = await Promise.all([
                                fetchanalytics({
                                        start_date: start,
                                        end_date: end,
                                }),

                                fetchAnalyticsBreakdown(),

                                fetchAnalyticsDashboad(),

                                fetchCollectionByCategory(start, end),
                        ]);

                        setAnalyticsData(analyticsRes || null);
                        setBreakdownData(breakdownRes || null);
                        setAnalyticfetchData(analyticfetchRes || null);
                        setCollectionByCategory(collectionRes || null);
                } catch (err) {
                        console.error("Analytics error:", err);
                        toast.error(getErrorMessage(err));
                } finally {
                        setAnalyticsLoading(false);
                }
        };
        useEffect(() => {
                loadAnalytics(startDate, endDate);
        }, []);

        // const loadAnalytics = async (start?: string, end?: string) => {
        //         setAnalyticsLoading(true);

        //         try {
        //                 const [analyticsRes, breakdownRes, analyticfetchRes, collectionRes] =
        //                         await Promise.all([
        //                                 fetchanalytics({
        //                                         start_date: start,
        //                                         end_date: end,
        //                                 }),

        //                                 fetchAnalyticsBreakdown(),

        //                                 fetchAnalyticsDashboad(),

        //                                 fetchCollectionByCategory(
        //                                         start!,
        //                                         end!
        //                                 ),
        //                         ]);

        //                 setAnalyticsData(analyticsRes || null);
        //                 setBreakdownData(breakdownRes || null);
        //                 setAnalyticfetchData(analyticfetchRes || null);

        //                 setCollectionByCategory(collectionRes || null);
        //         } catch (err) {
        //                 console.error("Analytics error:", err);
        //                 toast.error(getErrorMessage(err));
        //         } finally {
        //                 setAnalyticsLoading(false);
        //         }
        // };

        const prepaid = breakdownData?.metering_type.find((m) => m.name === "prepaid")?.count || 0;
        const postpaid = breakdownData?.metering_type.find((m) => m.name === "postpaid")?.count || 0;
        // const totalCustomers = prepaid + postpaid;


        const load = async (pageNumber = 1) => {
                try {
                        setVendorsLoading(true);

                        const res = await fetchVendors({
                                page: pageNumber,
                        });

                        setVendors(res?.results || []);
                        setCount(res?.count || 0);
                } catch (err) {
                        console.error(err);
                        getErrorMessage(err);
                        setVendors([]);
                        setCount(0);
                } finally {
                        setVendorsLoading(false);
                }
        };

        useEffect(() => {
                load();
        }, []);

        useEffect(() => {
                const loadCollection = async () => {
                        try {
                                const data = await dailyCollection(today);
                                setCollection(data);
                        } catch (error) {
                                console.error("Failed to fetch daily collection:", error);
                        }
                };

                loadCollection();
        }, []);

        useEffect(() => {
                const fetchVendorWallets = async () => {
                        try {
                                setVendorWalletLoading(true);

                                const [internalData, externalData] = await Promise.all([
                                        totalVendorWallet("internal"),
                                        totalVendorWallet("external"),
                                ]);

                                console.log("Internal wallet:", internalData);
                                console.log("External wallet:", externalData);

                                setInternalWalletData(internalData);
                                setExternalWalletData(externalData);
                        } catch (error) {
                                console.error(
                                        "Failed to fetch vendor wallet totals:",
                                        error
                                );
                        } finally {
                                setVendorWalletLoading(false);
                        }
                };

                fetchVendorWallets();
        }, []);


        const { can } = usePermission();

        return (
                <>
                        {can("view_vendor_analytics") ? (<>
                                {loading ? (
                                        <Box
                                                sx={{
                                                        minHeight: "80vh",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                }}
                                        >
                                                <CircularProgress />
                                        </Box>
                                ) : (
                                        <>
                                                <Box
                                                >
                                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                                                <Typography variant="h4">Tenant Dashboard</Typography>
                                                                <Stack direction="row" spacing={1}>
                                                                        <Button
                                                                                variant="outlined"
                                                                                startIcon={<Refresh />}
                                                                                onClick={() => refreshTenants()}
                                                                                disabled={loading}
                                                                        >
                                                                                Refresh
                                                                        </Button>

                                                                </Stack>
                                                        </Box>


                                                        {createSuccess && (
                                                                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setCreateSuccess(null)}>
                                                                        {createSuccess}
                                                                </Alert>
                                                        )}

                                                        {summary && (
                                                                <Grid container spacing={2} mb={3}>
                                                                        <Grid item xs={12} md={4}>

                                                                                <Card sx={{ height: "100%" }}>
                                                                                        <CardContent
                                                                                                sx={{
                                                                                                        pb: 0,
                                                                                                        "&:last-child": {
                                                                                                                paddingBottom: 0,
                                                                                                        },
                                                                                                }}
                                                                                        >
                                                                                                <Box
                                                                                                        sx={{
                                                                                                                display: "flex",
                                                                                                                justifyContent: "space-between",
                                                                                                                alignItems: "center",
                                                                                                        }}
                                                                                                >
                                                                                                        <Typography variant="subtitle2" color="text.secondary">
                                                                                                                {/* Daily Collection */}
                                                                                                                {/* Collection Breakdown */}
                                                                                                                Today's Collection
                                                                                                        </Typography>
                                                                                                        {/* 
                                                                                                        <TextField
                                                                                                                select
                                                                                                                size="small"
                                                                                                                value={dailyCollectionFilter}
                                                                                                                onChange={(e) =>
                                                                                                                        setDailyCollectionFilter(
                                                                                                                                e.target.value as
                                                                                                                                | "all"
                                                                                                                                | "energy_payments"
                                                                                                                                | "debt_payments"
                                                                                                                        )
                                                                                                                }
                                                                                                                variant="standard"
                                                                                                                InputProps={{
                                                                                                                        disableUnderline: true,
                                                                                                                }}
                                                                                                                sx={{
                                                                                                                        width: 130,

                                                                                                                        "& .MuiInputBase-root": {
                                                                                                                                padding: 0,
                                                                                                                                margin: 0,
                                                                                                                        },

                                                                                                                        "& .MuiSelect-select": {
                                                                                                                                padding: "4px 8px",
                                                                                                                        },
                                                                                                                }}
                                                                                                        >
                                                                                                                <MenuItem value="all">
                                                                                                                        All
                                                                                                                </MenuItem>

                                                                                                                <MenuItem value="energy_payments">
                                                                                                                        Energy Payments
                                                                                                                </MenuItem>

                                                                                                                <MenuItem value="debt_payments">
                                                                                                                        Debt Payments
                                                                                                                </MenuItem>
                                                                                                        </TextField> */}

                                                                                                </Box>

                                                                                                <CardContent sx={{ px: 0 }}>

                                                                                                        <Typography variant="h5">
                                                                                                                ₦
                                                                                                                {Number(
                                                                                                                        collection?.total_collection ?? 0
                                                                                                                ).toLocaleString()}
                                                                                                        </Typography>

                                                                                                        <Typography
                                                                                                                variant="caption"
                                                                                                                color="text.secondary"
                                                                                                        >
                                                                                                                {collection?.date
                                                                                                                        ? `Collection for ${collection.date}`
                                                                                                                        : "Today's collection"}
                                                                                                        </Typography>
                                                                                                </CardContent>
                                                                                        </CardContent>
                                                                                </Card>
                                                                        </Grid>
                                                                        {/* <Grid item xs={12} md={4}>
                                                                                <Card sx={{ height: "100%" }}>
                                                                                        <CardContent

                                                                                        >
                                                                                                <Typography
                                                                                                        color="text.secondary"
                                                                                                        variant="body2"

                                                                                                >
                                                                                                        Avg Daily Revenue
                                                                                                </Typography>
                                                                                                <Typography variant="h5" marginTop={5}>
                                                                                                        ₦{Number(analyticsData?.analytics.average_revenue || 0).toLocaleString()}
                                                                                                        
                                                                                                </Typography>
                                                                                        </CardContent>
                                                                                </Card>
                                                                        </Grid> */}
                                                                        <Grid item xs={12} md={4}>
                                                                                <Card sx={{ height: "100%" }}>
                                                                                        <CardContent

                                                                                        >
                                                                                                <Typography
                                                                                                        color="text.secondary"
                                                                                                        variant="body2"


                                                                                                >
                                                                                                        Energy Payments
                                                                                                </Typography>
                                                                                                <Typography variant="h5" color="#1D4ED8">
                                                                                                        ₦{Number(collection?.energy_payment || 0).toLocaleString()}
                                                                                                </Typography>
                                                                                                <Divider />
                                                                                                <Typography
                                                                                                        color="text.secondary"
                                                                                                        variant="body2"

                                                                                                >
                                                                                                        Debt Payments
                                                                                                </Typography>
                                                                                                <Typography variant="h5" color="#166534">
                                                                                                        ₦{Number(collection?.debt_payment || 0).toLocaleString()}
                                                                                                </Typography>
                                                                                                <Divider />
                                                                                                <Typography
                                                                                                        variant="caption"
                                                                                                        color="text.secondary"
                                                                                                >
                                                                                                        {collection?.date
                                                                                                                ? `Collection for ${collection.date}`
                                                                                                                : "Today's collection"}
                                                                                                </Typography>
                                                                                        </CardContent>
                                                                                </Card>
                                                                        </Grid>


                                                                        <Grid item xs={12} md={4}>
                                                                                <Card sx={{ height: "100%" }}>
                                                                                        <CardContent>
                                                                                                <Typography color="text.secondary" variant="body2">
                                                                                                        Current Debt Balance
                                                                                                </Typography>
                                                                                                <Typography variant="h5" marginTop={5}>
                                                                                                        ₦{Number(analyticsData?.analytics?.total_debt || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                                                                </Typography>
                                                                                        </CardContent>
                                                                                </Card>
                                                                        </Grid>
                                                                        <Grid item xs={12} md={4}>
                                                                                <Card sx={{ height: "95%" }}>
                                                                                        <CardContent sx={{
                                                                                        }}>
                                                                                                <CardHeader
                                                                                                        title={
                                                                                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                                                                        <Typography variant="body2" color="text.secondary">
                                                                                                                                {customerFilter === 'all'
                                                                                                                                        ? 'Total Customers'
                                                                                                                                        : customerFilter === 'active'
                                                                                                                                                ? 'Active Customers'
                                                                                                                                                : 'Inactive Customers'}
                                                                                                                        </Typography>

                                                                                                                        <TextField
                                                                                                                                select
                                                                                                                                size="small"
                                                                                                                                value={customerFilter}
                                                                                                                                onChange={(e) => setCustomerFilter(e.target.value as any)}
                                                                                                                                variant="standard"
                                                                                                                                InputProps={{ disableUnderline: true }}
                                                                                                                                sx={{
                                                                                                                                        width: 90,
                                                                                                                                        '& .MuiInputBase-root': {
                                                                                                                                                padding: 0,
                                                                                                                                                margin: 0,
                                                                                                                                        },
                                                                                                                                        '& .MuiSelect-select': {
                                                                                                                                                padding: '4px 8px',
                                                                                                                                        },
                                                                                                                                }}
                                                                                                                        >
                                                                                                                                <MenuItem value="all">All</MenuItem>
                                                                                                                                <MenuItem value="active">Active</MenuItem>
                                                                                                                        </TextField>
                                                                                                                </Box>
                                                                                                        }
                                                                                                        sx={{
                                                                                                                height: 0,
                                                                                                                paddingBottom: 0,
                                                                                                                '& .MuiInputBase-root': {
                                                                                                                        padding: 0,
                                                                                                                        margin: 0,
                                                                                                                },
                                                                                                                '& .MuiSelect-select': {
                                                                                                                        padding: '0px 0px',
                                                                                                                },
                                                                                                        }}
                                                                                                />
                                                                                                <CardContent>
                                                                                                        <Typography variant="h5" marginTop={5}>
                                                                                                                {Number(customerValue || 0).toLocaleString()}
                                                                                                        </Typography>
                                                                                                </CardContent>
                                                                                        </CardContent>
                                                                                </Card>
                                                                        </Grid>
                                                                        <Grid item xs={12} md={4}>
                                                                                {/* <Card
                                                                                        sx={{
                                                                                                borderRadius: 5,
                                                                                        }}
                                                                                > */}
                                                                                <Card sx={{ height: "95%" }}>
                                                                                        <CardContent>
                                                                                                {vendorWalletLoading ? (
                                                                                                        <Box
                                                                                                                display="flex"
                                                                                                                justifyContent="center"
                                                                                                                alignItems="center"
                                                                                                        //   minHeight={150}
                                                                                                        >
                                                                                                                <CircularProgress size={28} />
                                                                                                        </Box>
                                                                                                ) : (
                                                                                                        <Stack spacing={1}>
                                                                                                                {/* INTERNAL WALLET */}
                                                                                                                <Box
                                                                                                                        sx={{
                                                                                                                                borderRadius: 2,
                                                                                                                                // bgcolor: "#F0FDF4",
                                                                                                                                // border: "1px solid #BBF7D0",
                                                                                                                                px: 1,
                                                                                                                        }}
                                                                                                                >
                                                                                                                        <Typography
                                                                                                                                variant="body2"
                                                                                                                                color="text.secondary"
                                                                                                                                fontWeight={500}
                                                                                                                        >
                                                                                                                                Internal Vendor Wallet
                                                                                                                        </Typography>

                                                                                                                        <Typography
                                                                                                                                variant="h6"
                                                                                                                                fontWeight={500}
                                                                                                                                color="#166534"

                                                                                                                        >
                                                                                                                                ₦
                                                                                                                                {Number(
                                                                                                                                        internalWalletData?.balance ?? 0
                                                                                                                                ).toLocaleString()}
                                                                                                                        </Typography>

                                                                                                                        <Typography
                                                                                                                                variant="caption"
                                                                                                                                color="text.secondary"
                                                                                                                        >
                                                                                                                                {internalWalletData?.vendor_count ?? 0} vendors
                                                                                                                        </Typography>
                                                                                                                </Box>
                                                                                                                <Divider />
                                                                                                                {/* EXTERNAL WALLET */}
                                                                                                                <Box
                                                                                                                        sx={{
                                                                                                                                borderRadius: 2,
                                                                                                                                // bgcolor: "#EFF6FF",
                                                                                                                                // border: "1px solid #BFDBFE",
                                                                                                                                px: 1,
                                                                                                                        }}
                                                                                                                >
                                                                                                                        <Typography
                                                                                                                                variant="body2"
                                                                                                                                color="text.secondary"
                                                                                                                                fontWeight={500}
                                                                                                                        >
                                                                                                                                External Vendor Wallet
                                                                                                                        </Typography>

                                                                                                                        <Typography
                                                                                                                                variant="h6"
                                                                                                                                fontWeight={500}
                                                                                                                                color="#1D4ED8"

                                                                                                                        >
                                                                                                                                ₦
                                                                                                                                {Number(
                                                                                                                                        externalWalletData?.balance ?? 0
                                                                                                                                ).toLocaleString()}
                                                                                                                        </Typography>

                                                                                                                        <Typography
                                                                                                                                variant="caption"
                                                                                                                                color="text.secondary"
                                                                                                                        >
                                                                                                                                {externalWalletData?.vendor_count ?? 0} vendors
                                                                                                                        </Typography>
                                                                                                                </Box>
                                                                                                        </Stack>
                                                                                                )}
                                                                                        </CardContent>
                                                                                </Card>
                                                                        </Grid>
                                                                        <Grid item xs={12} md={4}>
                                                                                <Card sx={{ height: "95%" }}>
                                                                                        <CardContent>
                                                                                                <Typography color="text.secondary" variant="body2">
                                                                                                        Vendors Aggregated Balance
                                                                                                </Typography>
                                                                                                <Typography variant="h5" marginTop={5}>
                                                                                                        ₦{Number(analyticfetchData?.vendor_summary.aggregated_wallet_balance || 0).toLocaleString()}
                                                                                                        {/* ₦{(90000776).toLocaleString(undefined, { maximumFractionDigits: 2 })} */}
                                                                                                </Typography>
                                                                                        </CardContent>
                                                                                </Card>
                                                                        </Grid>
                                                                </Grid>
                                                        )}
                                                        <Grid container spacing={3}>

                                                                {/* <Grid item xs={12} md={4}>
                                                                        <Card>
                                                                                <CardHeader
                                                                                        avatar={<Assessment color="primary" />}
                                                                                        title={
                                                                                                <Box
                                                                                                        display="flex"
                                                                                                        justifyContent="space-between"
                                                                                                        alignItems="center"
                                                                                                >
                                                                                                        <Typography variant="body2" color="text.secondary">
                                                                                                                {current.title}
                                                                                                        </Typography>

                                                                                                        <TextField
                                                                                                                select
                                                                                                                size="small"
                                                                                                                value={collectionFilter}
                                                                                                                onChange={(e) =>
                                                                                                                        setCollectionFilter(
                                                                                                                                e.target.value as
                                                                                                                                | "category"
                                                                                                                                | "branch"
                                                                                                                                | "tariff"
                                                                                                                                | "feeder"
                                                                                                                                | "transformer"
                                                                                                                        )
                                                                                                                }
                                                                                                                variant="standard"
                                                                                                                InputProps={{
                                                                                                                        disableUnderline: true,
                                                                                                                }}
                                                                                                                sx={{
                                                                                                                        width: 150,
                                                                                                                        "& .MuiInputBase-root": {
                                                                                                                                p: 0,
                                                                                                                                m: 0,
                                                                                                                        },
                                                                                                                        "& .MuiSelect-select": {
                                                                                                                                py: 0.5,
                                                                                                                                px: 1,
                                                                                                                        },
                                                                                                                }}
                                                                                                        >
                                                                                                                <MenuItem value="category">Category</MenuItem>
                                                                                                                <MenuItem value="branch">Branch / Region</MenuItem>
                                                                                                                <MenuItem value="tariff">Tariff Class</MenuItem>
                                                                                                                <MenuItem value="feeder">Feeder</MenuItem>
                                                                                                                <MenuItem value="transformer">Transformer</MenuItem>
                                                                                                        </TextField>
                                                                                                </Box>
                                                                                        }
                                                                                        subheader={current.subtitle}
                                                                                        sx={{
                                                                                                "& .MuiCardHeader-content": {
                                                                                                        overflow: "hidden",
                                                                                                },
                                                                                        }}
                                                                                />

                                                                                <CardContent>
                                                                                        <Stack spacing={2}>
                                                                                                {current.data.length === 0 ? (
                                                                                                        <Typography
                                                                                                                variant="body2"
                                                                                                                color="text.secondary"
                                                                                                                textAlign="center"
                                                                                                        >
                                                                                                                No data available
                                                                                                        </Typography>
                                                                                                ) : (
                                                                                                        current.data.map((item, index) => (
                                                                                                                <Box key={index}>
                                                                                                                        <Box
                                                                                                                                display="flex"
                                                                                                                                justifyContent="space-between"
                                                                                                                                mb={0.5}
                                                                                                                        >
                                                                                                                                <Typography variant="body2">
                                                                                                                                        {item.name}
                                                                                                                                </Typography>

                                                                                                                                <Typography
                                                                                                                                        variant="body2"
                                                                                                                                        fontWeight={600}
                                                                                                                                >
                                                                                                                                        {item.count.toLocaleString()}
                                                                                                                                </Typography>
                                                                                                                        </Box>

                                                                                                                        <LinearProgress
                                                                                                                                variant="determinate"
                                                                                                                                value={Math.min(item.count, 100)}
                                                                                                                                sx={{
                                                                                                                                        mt: 0.5,
                                                                                                                                        height: 8,
                                                                                                                                        borderRadius: 10,
                                                                                                                                }}
                                                                                                                        />
                                                                                                                </Box>
                                                                                                        ))
                                                                                                )}
                                                                                        </Stack>
                                                                                </CardContent>
                                                                        </Card>
                                                                </Grid> */}
                                                                <Grid item xs={12} md={5}>
                                                                        <Card>
                                                                                <CardHeader
                                                                                        avatar={<Assessment color="primary" />}
                                                                                        title="Collection by Customer Category"
                                                                                        subheader={
                                                                                                collectionByCategory
                                                                                                        ? `${collectionByCategory.start} → ${collectionByCategory.end}`
                                                                                                        : "Customer collections"
                                                                                        }
                                                                                />

                                                                                <CardContent>
                                                                                        <Stack spacing={1}>
                                                                                                {!collectionByCategory?.categories?.length ? (
                                                                                                        <Typography
                                                                                                                variant="body2"
                                                                                                                color="text.secondary"
                                                                                                                textAlign="center"
                                                                                                                py={4}
                                                                                                        >
                                                                                                                No collection data available.
                                                                                                        </Typography>
                                                                                                ) : (
                                                                                                        collectionByCategory.categories.map((item) => (
                                                                                                                <Box key={item.category_name}>
                                                                                                                        {/* Category name + total */}
                                                                                                                        <Typography
                                                                                                                                variant="body2"
                                                                                                                                fontWeight={600}
                                                                                                                        >
                                                                                                                                {item.category_name}
                                                                                                                        </Typography>
                                                                                                                        <Box
                                                                                                                                display="flex"
                                                                                                                                justifyContent="space-between"
                                                                                                                                alignItems="center"
                                                                                                                        // mb={1}
                                                                                                                        >
                                                                                                                                <Box>
                                                                                                                                        <Typography
                                                                                                                                                variant="caption"
                                                                                                                                                color="text.secondary"
                                                                                                                                        >
                                                                                                                                                {item.transaction_count.toLocaleString()} transactions
                                                                                                                                        </Typography>
                                                                                                                                </Box>

                                                                                                                                <Typography
                                                                                                                                        variant="body2"
                                                                                                                                        fontWeight={700}
                                                                                                                                >
                                                                                                                                        Collection
                                                                                                                                        ₦{Number(item.total_collection).toLocaleString()}
                                                                                                                                </Typography>
                                                                                                                        </Box>

                                                                                                                        {/* Energy + Debt */}
                                                                                                                        <Stack
                                                                                                                                direction="row"
                                                                                                                                spacing={1}
                                                                                                                        >
                                                                                                                                <Box
                                                                                                                                        sx={{
                                                                                                                                                flex: 1,
                                                                                                                                                px: 1,
                                                                                                                                                borderRadius: 1.5,
                                                                                                                                                bgcolor: "primary.50",
                                                                                                                                                border: "1px solid",
                                                                                                                                                borderColor: "primary.100",
                                                                                                                                        }}
                                                                                                                                >
                                                                                                                                        <Typography
                                                                                                                                                variant="caption"
                                                                                                                                                color="text.secondary"
                                                                                                                                        >
                                                                                                                                                Energy payment
                                                                                                                                        </Typography>

                                                                                                                                        <Typography
                                                                                                                                                variant="body2"
                                                                                                                                                fontWeight={600}
                                                                                                                                        >
                                                                                                                                                ₦
                                                                                                                                                {Number(
                                                                                                                                                        item.energy_payment
                                                                                                                                                ).toLocaleString()}
                                                                                                                                        </Typography>
                                                                                                                                </Box>

                                                                                                                                <Box
                                                                                                                                        sx={{
                                                                                                                                                flex: 1,
                                                                                                                                                px: 1,
                                                                                                                                                borderRadius: 1.5,
                                                                                                                                                bgcolor: "warning.50",
                                                                                                                                                border: "1px solid",
                                                                                                                                                borderColor: "warning.100",
                                                                                                                                        }}
                                                                                                                                >
                                                                                                                                        <Typography
                                                                                                                                                variant="caption"
                                                                                                                                                color="text.secondary"
                                                                                                                                        >
                                                                                                                                                Debt payment
                                                                                                                                        </Typography>

                                                                                                                                        <Typography
                                                                                                                                                variant="body2"
                                                                                                                                                fontWeight={600}
                                                                                                                                        >
                                                                                                                                                ₦
                                                                                                                                                {Number(
                                                                                                                                                        item.debt_payment
                                                                                                                                                ).toLocaleString()}
                                                                                                                                        </Typography>
                                                                                                                                </Box>
                                                                                                                        </Stack>
                                                                                                                </Box>
                                                                                                        ))
                                                                                                )}

                                                                                                {/* Total */}
                                                                                                {collectionByCategory?.totals && (
                                                                                                        <>
                                                                                                                <Divider />

                                                                                                                <Box
                                                                                                                        sx={{
                                                                                                                                p: 2,
                                                                                                                                borderRadius: 2,
                                                                                                                                bgcolor: "grey.50",
                                                                                                                        }}
                                                                                                                >
                                                                                                                        <Box
                                                                                                                                display="flex"
                                                                                                                                justifyContent="space-between"
                                                                                                                                alignItems="center"
                                                                                                                                mb={1.5}
                                                                                                                        >
                                                                                                                                <Typography fontWeight={700}>
                                                                                                                                        Total Collection
                                                                                                                                </Typography>

                                                                                                                                <Typography
                                                                                                                                        variant="h6"
                                                                                                                                        fontWeight={800}
                                                                                                                                        color="primary"
                                                                                                                                >
                                                                                                                                        ₦
                                                                                                                                        {Number(
                                                                                                                                                collectionByCategory.totals
                                                                                                                                                        .total_collection
                                                                                                                                        ).toLocaleString()}
                                                                                                                                </Typography>
                                                                                                                        </Box>

                                                                                                                        <Stack
                                                                                                                                direction="row"
                                                                                                                                spacing={1}
                                                                                                                        >
                                                                                                                                <Box flex={1}>
                                                                                                                                        <Typography
                                                                                                                                                variant="caption"
                                                                                                                                                color="text.secondary"
                                                                                                                                        >
                                                                                                                                                Energy Payment
                                                                                                                                        </Typography>

                                                                                                                                        <Typography fontWeight={600}>
                                                                                                                                                ₦
                                                                                                                                                {Number(
                                                                                                                                                        collectionByCategory.totals
                                                                                                                                                                .energy_payment
                                                                                                                                                ).toLocaleString()}
                                                                                                                                        </Typography>
                                                                                                                                </Box>

                                                                                                                                <Box flex={1}>
                                                                                                                                        <Typography
                                                                                                                                                variant="caption"
                                                                                                                                                color="text.secondary"
                                                                                                                                        >
                                                                                                                                                Debt Payment
                                                                                                                                        </Typography>

                                                                                                                                        <Typography fontWeight={600}>
                                                                                                                                                ₦
                                                                                                                                                {Number(
                                                                                                                                                        collectionByCategory.totals
                                                                                                                                                                .debt_payment
                                                                                                                                                ).toLocaleString()}
                                                                                                                                        </Typography>
                                                                                                                                </Box>

                                                                                                                                <Box flex={1}>
                                                                                                                                        <Typography
                                                                                                                                                variant="caption"
                                                                                                                                                color="text.secondary"
                                                                                                                                        >
                                                                                                                                                Transactions
                                                                                                                                        </Typography>

                                                                                                                                        <Typography fontWeight={600}>
                                                                                                                                                {collectionByCategory.totals
                                                                                                                                                        .transaction_count.toLocaleString()}
                                                                                                                                        </Typography>
                                                                                                                                </Box>
                                                                                                                        </Stack>
                                                                                                                </Box>
                                                                                                        </>
                                                                                                )}
                                                                                        </Stack>
                                                                                </CardContent>
                                                                        </Card>
                                                                </Grid>
                                                                <Grid item xs={12} md={7} >

                                                                        <Stack data-tenant-details>

                                                                                <Card sx={{ height: "100%" }}>
                                                                                        <CardHeader avatar={<Security color="primary" />} title="Overview" />
                                                                                        <CardContent>
                                                                                                <Stack direction="column" spacing={2} mb={2} flexWrap="wrap">
                                                                                                        {/* <Chip label={`Inactive Users: ${(analyticfetchData?.user_summary.inactive_users || 0).toLocaleString()}`} size="small" /> */}
                                                                                                        <Chip label={`Total Postpaid Customer: ${(postpaid).toLocaleString()}`} size="small" sx={{ py: 2, fontSize: 20 }} />
                                                                                                        <Chip label={`Total Prepaid Customer: ${(prepaid).toLocaleString()}`} size="small" sx={{ py: 2, fontSize: 20 }} />
                                                                                                        {/* <Chip label={`Total Unmetered Customers: ${(889540).toLocaleString()}`} size="small" /> */}
                                                                                                        <Chip label={`Suspended Customers: ${(analyticsData?.analytics.suspended_custommers || 0).toLocaleString()}`} size="small" sx={{ py: 2, fontSize: 20 }} />
                                                                                                </Stack>
                                                                                        </CardContent>
                                                                                </Card>

                                                                                {/* <Grid container spacing={2} marginTop={2}>
                                                                                        <Grid item xs={12}>
                                                                                                
                                                                                                <Card sx={{ borderRadius: 4 }}>
                                                                                                        <Box
                                                                                                                display="flex"
                                                                                                                justifyContent="space-between"
                                                                                                                alignItems="flex-start"
                                                                                                                p={3}
                                                                                                        >
                                                                                                                <Stack direction="row" spacing={2}>
                                                                                                                        <Avatar
                                                                                                                                sx={{
                                                                                                                                        bgcolor: "#EEF4FF",
                                                                                                                                        color: "#1D4ED8",
                                                                                                                                }}
                                                                                                                        >
                                                                                                                                <Analytics />
                                                                                                                        </Avatar>

                                                                                                                        <Box>
                                                                                                                                <Typography
                                                                                                                                        fontWeight={700}
                                                                                                                                        fontSize={24}
                                                                                                                                >
                                                                                                                                        Daily Transactions
                                                                                                                                </Typography>

                                                                                                                                <Typography color="text.secondary">
                                                                                                                                        LAST 30 DAYS
                                                                                                                                </Typography>
                                                                                                                        </Box>
                                                                                                                </Stack>

                                                                                                                <ToggleButtonGroup
                                                                                                                        exclusive
                                                                                                                        value={transactionType}
                                                                                                                        onChange={(_, value) =>
                                                                                                                                value && setTransactionType(value)
                                                                                                                        }
                                                                                                                        size="small"
                                                                                                                >
                                                                                                                        <ToggleButton value="collections">
                                                                                                                                Collections
                                                                                                                        </ToggleButton>

                                                                                                                        <ToggleButton value="debts">
                                                                                                                                Debts
                                                                                                                        </ToggleButton>
                                                                                                                </ToggleButtonGroup>
                                                                                                        </Box>
                                                                                                        <CardContent>
                                                                                                               
                                                                                                                <Box
                                                                                                                        display="flex"
                                                                                                                        justifyContent="space-between"
                                                                                                                        alignItems="center"
                                                                                                                        px={3}
                                                                                                                        mb={2}
                                                                                                                >
                                                                                                                        <Stack direction="row" spacing={2}>
                                                                                                                                <FormControl size="small" sx={{ minWidth: 180 }}>
                                                                                                                                        <InputLabel>Region</InputLabel>

                                                                                                                                        <Select
                                                                                                                                                value={selectedRegion}
                                                                                                                                                label="Region"
                                                                                                                                                onChange={(e) =>
                                                                                                                                                        setSelectedRegion(e.target.value)
                                                                                                                                                }
                                                                                                                                        >
                                                                                                                                                <MenuItem value="">
                                                                                                                                                        All regions
                                                                                                                                                </MenuItem>

                                                                                                                                                {regions.map(region => (
                                                                                                                                                        <MenuItem
                                                                                                                                                                key={region.id}
                                                                                                                                                                value={region.id}
                                                                                                                                                        >
                                                                                                                                                                {region.name}
                                                                                                                                                        </MenuItem>
                                                                                                                                                ))}
                                                                                                                                        </Select>
                                                                                                                                </FormControl>

                                                                                                                                <FormControl size="small" sx={{ minWidth: 220 }}>
                                                                                                                                        <InputLabel>
                                                                                                                                                Customer Category
                                                                                                                                        </InputLabel>

                                                                                                                                        <Select
                                                                                                                                                value={selectedCategory}
                                                                                                                                                label="Customer Category"
                                                                                                                                                onChange={(e) =>
                                                                                                                                                        setSelectedCategory(e.target.value)
                                                                                                                                                }
                                                                                                                                        >
                                                                                                                                                <MenuItem value="">
                                                                                                                                                        All categories
                                                                                                                                                </MenuItem>

                                                                                                                                                {categories.map(category => (
                                                                                                                                                        <MenuItem
                                                                                                                                                                key={category.id}
                                                                                                                                                                value={category.id}
                                                                                                                                                        >
                                                                                                                                                                {category.name}
                                                                                                                                                        </MenuItem>
                                                                                                                                                ))}
                                                                                                                                        </Select>
                                                                                                                                </FormControl>
                                                                                                                        </Stack>
                                                                                                                </Box>
                                                                                                                <LineChart
                                                                                                                        height={320}
                                                                                                                        xAxis={[
                                                                                                                                {
                                                                                                                                        scaleType: "point",
                                                                                                                                        data: chartData.labels,
                                                                                                                                },
                                                                                                                        ]}
                                                                                                                        series={[
                                                                                                                                {
                                                                                                                                        data:
                                                                                                                                                transactionType === "collections"
                                                                                                                                                        ? filteredChartData.collections
                                                                                                                                                        : filteredChartData.debts,

                                                                                                                                        label:
                                                                                                                                                transactionType === "collections"
                                                                                                                                                        ? "Daily Collections"
                                                                                                                                                        : "Daily Debts",

                                                                                                                                        area: true,
                                                                                                                                        showMark: false,
                                                                                                                                        curve: "natural",
                                                                                                                                        color:
                                                                                                                                                transactionType === "collections"
                                                                                                                                                        ? "#14B8A6"
                                                                                                                                                        : "#D97706",
                                                                                                                                },
                                                                                                                        ]}
                                                                                                                />
                                                                                                        </CardContent>
                                                                                                </Card>
                                                                                        </Grid>


                                                                                </Grid> */}
                                                                                <Grid container spacing={2} marginTop={2}>
                                                                                        <Grid item xs={12}>
                                                                                                <Card sx={{ borderRadius: 4 }}>
                                                                                                        {/* Header */}
                                                                                                        <Box
                                                                                                                display="flex"
                                                                                                                justifyContent="space-between"
                                                                                                                alignItems="flex-start"
                                                                                                                p={3}
                                                                                                        >
                                                                                                                <Stack direction="row" spacing={2}>
                                                                                                                        <Avatar
                                                                                                                                sx={{
                                                                                                                                        bgcolor: "#EEF4FF",
                                                                                                                                        color: "#1D4ED8",
                                                                                                                                }}
                                                                                                                        >
                                                                                                                                <Analytics />
                                                                                                                        </Avatar>

                                                                                                                        <Box>
                                                                                                                                <Typography
                                                                                                                                        fontWeight={700}
                                                                                                                                        fontSize={24}
                                                                                                                                >
                                                                                                                                        Daily Transactions
                                                                                                                                </Typography>

                                                                                                                                <Typography color="text.secondary">
                                                                                                                                        {dailyTransactions?.start &&
                                                                                                                                                dailyTransactions?.end
                                                                                                                                                ? `${new Date(
                                                                                                                                                        dailyTransactions.start
                                                                                                                                                ).toLocaleDateString()} - ${new Date(
                                                                                                                                                        dailyTransactions.end
                                                                                                                                                ).toLocaleDateString()}`
                                                                                                                                                : "LAST 30 DAYS"}
                                                                                                                                </Typography>
                                                                                                                        </Box>
                                                                                                                </Stack>

                                                                                                                <ToggleButtonGroup
                                                                                                                        exclusive
                                                                                                                        value={transactionType}
                                                                                                                        onChange={(_, value) => {
                                                                                                                                if (value) {
                                                                                                                                        setTransactionType(value);
                                                                                                                                }
                                                                                                                        }}
                                                                                                                        size="small"
                                                                                                                >
                                                                                                                        <ToggleButton value="collections">
                                                                                                                                Collections
                                                                                                                        </ToggleButton>

                                                                                                                        <ToggleButton value="paymentType">
                                                                                                                                Prepaid / Postpaid
                                                                                                                        </ToggleButton>

                                                                                                                        <ToggleButton value="debts">
                                                                                                                                Debt
                                                                                                                        </ToggleButton>
                                                                                                                </ToggleButtonGroup>
                                                                                                        </Box>

                                                                                                        <CardContent>
                                                                                                                {/* Filter */}
                                                                                                                <Box
                                                                                                                        display="flex"
                                                                                                                        justifyContent="space-between"
                                                                                                                        alignItems="center"
                                                                                                                        px={3}
                                                                                                                        mb={2}
                                                                                                                >
                                                                                                                        {/* <FormControl
                        size="small"
                        sx={{ minWidth: 240 }}
                    >
                        <InputLabel>
                            Customer Category
                        </InputLabel>

                        <Select
                            value={selectedCategory}
                            label="Customer Category"
                            onChange={(e) =>
                                setSelectedCategory(
                                    e.target.value
                                )
                            }
                        >
                            <MenuItem value="">
                                All categories
                            </MenuItem>

                            {categories.map((category) => (
                                <MenuItem
                                    key={category.id}
                                    value={category.name}
                                >
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl> */}
                                                                                                                        <FormControl size="small" sx={{ minWidth: 220 }}>
                                                                                                                                <InputLabel>Customer Category</InputLabel>

                                                                                                                                <Select
                                                                                                                                        value={selectedCategory}
                                                                                                                                        label="Customer Category"
                                                                                                                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                                                                                                                >
                                                                                                                                        <MenuItem value="">
                                                                                                                                                All categories
                                                                                                                                        </MenuItem>

                                                                                                                                        {categories.map((category) => (
                                                                                                                                                <MenuItem
                                                                                                                                                        key={category.id}
                                                                                                                                                        value={category.name}
                                                                                                                                                >
                                                                                                                                                        {category.name}
                                                                                                                                                </MenuItem>
                                                                                                                                        ))}
                                                                                                                                </Select>
                                                                                                                        </FormControl>

                                                                                                                        {dailyTransactions && (
                                                                                                                                <Typography
                                                                                                                                        variant="body2"
                                                                                                                                        color="text.secondary"
                                                                                                                                >
                                                                                                                                        {dailyTransactions.days.length} days
                                                                                                                                </Typography>
                                                                                                                        )}
                                                                                                                </Box>

                                                                                                                {/* Loading */}
                                                                                                                {dailyTransactionsLoading ? (
                                                                                                                        <Box
                                                                                                                                height={320}
                                                                                                                                display="flex"
                                                                                                                                alignItems="center"
                                                                                                                                justifyContent="center"
                                                                                                                        >
                                                                                                                                <CircularProgress />
                                                                                                                        </Box>
                                                                                                                ) : !dailyTransactions?.days?.length ? (
                                                                                                                        <Box
                                                                                                                                height={320}
                                                                                                                                display="flex"
                                                                                                                                alignItems="center"
                                                                                                                                justifyContent="center"
                                                                                                                        >
                                                                                                                                <Typography color="text.secondary">
                                                                                                                                        No transaction data available
                                                                                                                                </Typography>
                                                                                                                        </Box>
                                                                                                                ) : (
                                                                                                                        <LineChart
                                                                                                                                height={320}
                                                                                                                                xAxis={[
                                                                                                                                        {
                                                                                                                                                scaleType: "point",
                                                                                                                                                data: chartData.labels,
                                                                                                                                        },
                                                                                                                                ]}
                                                                                                                                series={chartSeries}
                                                                                                                        />
                                                                                                                )}
                                                                                                        </CardContent>
                                                                                                </Card>
                                                                                        </Grid>
                                                                                </Grid>

                                                                        </Stack>

                                                                </Grid>
                                                        </Grid>
                                                </Box>

                                        </>
                                )}

                        </>) : (
                                <>
                                        <Card>
                                                <Box
                                                        sx={{
                                                                px: 3,
                                                                py: 2.5,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                                gap: 2,
                                                        }}
                                                >
                                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                                                <Box
                                                                        sx={{
                                                                                width: 42,
                                                                                height: 42,
                                                                                borderRadius: 2,
                                                                                bgcolor: "#FFF7E6",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                        }}
                                                                >
                                                                        <FactCheckOutlined
                                                                                sx={{ color: "#B54708" }}
                                                                        />
                                                                </Box>

                                                                <Box>
                                                                        <Stack
                                                                                direction="row"
                                                                                spacing={1}
                                                                                alignItems="center"
                                                                        >
                                                                                <Typography
                                                                                        variant="h6"
                                                                                        sx={{ fontWeight: 700 }}
                                                                                >
                                                                                        Tenant Admin Dashboard
                                                                                </Typography>

                                                                                <Chip
                                                                                        size="small"
                                                                                        label="Tenant Admin"
                                                                                        sx={{
                                                                                                bgcolor: "#FFF7E6",
                                                                                                color: "#B54708",
                                                                                                fontWeight: 700,
                                                                                        }}
                                                                                />
                                                                        </Stack>

                                                                        <Typography
                                                                                variant="body2"
                                                                                color="text.secondary"
                                                                        >
                                                                                Tenant dashboard analytics
                                                                        </Typography>
                                                                </Box>
                                                        </Stack>

                                                        <Button
                                                                size="small"
                                                                variant="outlined"
                                                                startIcon={
                                                                        loading ? (
                                                                                <CircularProgress size={16} />
                                                                        ) : (
                                                                                <Refresh />
                                                                        )
                                                                }
                                                                onClick={fetchAnalyticsBreakdown}
                                                                disabled={loading}
                                                        >
                                                                Refresh
                                                        </Button>
                                                </Box>

                                                <Divider />
                                                <Box
                                                        sx={{
                                                                py: 6,
                                                                px: 3,
                                                                textAlign: "center",
                                                        }}
                                                >
                                                        <FactCheckOutlined
                                                                sx={{
                                                                        fontSize: 45,
                                                                        color: "#98A2B3",
                                                                        mb: 1,
                                                                }}
                                                        />

                                                        <Typography
                                                                variant="subtitle1"
                                                                fontWeight={700}
                                                        >
                                                                You don't have permission to view dashboard contents.
                                                        </Typography>

                                                        <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{ mt: 0.5 }}
                                                        >
                                                                Ask your tenant admin to assign the permission to you.
                                                        </Typography>
                                                </Box>
                                        </Card>
                                </>
                        )}
                </>

        );
};

export default TenantAdmin;
