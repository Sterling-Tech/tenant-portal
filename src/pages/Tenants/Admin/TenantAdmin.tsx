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
        Switch,
        TextField,
        Tooltip,
        Typography,
        LinearProgress,
        ToggleButtonGroup,
        ToggleButton,
        FormControl,
        InputLabel,
        Select,
} from '@mui/material';
import {
        Add,
        Assessment,
        People,
        Refresh,
        Settings,
        Security,
        Analytics,
        Download,
        Search,
        DateRange,
} from '@mui/icons-material';
import { useTenants } from '../../../hooks/useTenants';
import { useVendorHierarchy } from '../../../contexts/VendorContext';
import { useTenantAdminProfile } from '../../../hooks/useTenantAdminProfile';
import { useApiKeys } from '../../../hooks/useApiKeys';
import { useAppSelector } from '../../../store/hooks';
import TenantDomainModal, { TenantDomainFormValues } from '../../../components/TenantAdmin/TenantDomainModal';
import type { Tenant, TenantConfiguration as TenantConfigurationType, TenantUser, CreateTenantRequest } from '../../../services/tenantService';
import { LineChart, PieChart } from '@mui/x-charts';
import { fetchVendors, createVendor, type VendorForm, Vendor, searchVendors, toggleVendorStatus, AnalyticsBreakdown, AnalyticsCount, fetchanalytics, fetchAnalyticsBreakdown, fetchAnalyticsDashboad, AnalyticsDashboad, DailyCollection, dailyCollection, TotalVendorWallet, totalVendorWallet } from '../../../services/vendorService';
import { RootState } from '../../../store/store';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../../utils/getErrorMessage';
type CustomerSummary = {
        total_customers?: number | string;
        active_customers?: number | string;
        inactive_customers?: number | string;
};

type VendorSummary = {
        all?: number | string;
        active?: number | string;
        inactive?: number | string;

};
const TenantAdmin: React.FC = () => {
        const {
                summary,
                configuration,
                loading,
                refreshTenants,
        } = useTenants();


        const user = useAppSelector((state: RootState) => state.auth.user);


        const [selectedTenant, setVendors] = useState<Vendor[]>([]);
        const [count, setCount] = useState(0);

        const [searchTerm, setSearchTerm] = useState('');
        const [searchLoading, setSearchLoading] = useState(false);
        const searchInitializedRef = useRef(false);
        const [tenantModalState, setTenantModalState] = useState<{ open: boolean; mode: 'create' | 'edit'; tenant?: Tenant | null }>({
                open: false,
                mode: 'create',
        });
        const [createSuccess, setCreateSuccess] = useState<string | null>(null);
        const [domainModalOpen, setDomainModalOpen] = useState(false);
        const [customerFilter, setCustomerFilter] = useState<'all' | 'active' | 'inactive'>('all');
        // const [vendorFilter, setVendorFilter] = useState<'all' | 'active' | 'inactive'>('all');

        const [collectionFilter, setCollectionFilter] = useState<'category' | 'branch' | 'tariff' | 'feeder' | 'transformer'>('category');
        const today = new Date().toISOString().split('T')[0];

        const [startDate, setStartDate] = useState<string>(today);
        const [endDate, setEndDate] = useState<string>(today);

        const [analyticsData, setAnalyticsData] = useState<AnalyticsCount | null>(null);
        const [breakdownData, setBreakdownData] = useState<AnalyticsBreakdown | null>(null);
        const [analyticfetchData, setAnalyticfetchData] = useState<AnalyticsDashboad | null>(null);
        const [vendorsLoading, setVendorsLoading] = useState(true);

        const [analyticsLoading, setAnalyticsLoading] = useState(false);
        //daily transaction graph state
        const [transactionType, setTransactionType] = useState<"collections" | "debts">("collections");
        const [selectedRegion, setSelectedRegion] = useState("");
        const [selectedCategory, setSelectedCategory] = useState("");
        const [collection, setCollection] = useState<DailyCollection | null>(null);
        const [dailyCollectionFilter, setDailyCollectionFilter] = useState<"all" | "energy_payments" | "debt_payments">("all");

        const [vendorDebtFilter, setVendorDebtFilter] = useState<"all" | "external_wallet_amount" | "internal_wallet_amount">("all");
        const [vendorWalletData, setVendorWalletData] = useState<TotalVendorWallet | null>(null);
        const [vendorWalletLoading, setVendorWalletLoading] = useState(false);

        const [configDraft, setConfigDraft] = useState({
                max_users: '',
                api_rate_limit: '',
                billing_cycle: '',
                max_storage_mb: '',
        });

        const regions = [
                { id: 1, name: "North" },
                { id: 2, name: "South" },
                { id: 3, name: "East" },
                { id: 4, name: "West" },
        ];

        const categories = [
                { id: 1, name: "Residential" },
                { id: 2, name: "Commercial" },
                { id: 3, name: "Industrial" },
                { id: 4, name: "Government" },
        ];

        // const chartData = useMemo(() => {
        //         const transactions = breakdownData?.daily_transaction ?? [];

        //         const sorted = [...transactions].sort(
        //                 (a, b) =>
        //                         new Date(a.day).getTime() -
        //                         new Date(b.day).getTime()
        //         );

        //         return {
        //                 labels: sorted.map(item =>
        //                         new Date(item.day).toLocaleDateString("en-GB", {
        //                                 day: "numeric",
        //                                 month: "short",
        //                         })
        //                 ),

        //                 collections:
        //                         transactionType === "collections"
        //                                 ? sorted.map(i => Number(i.total || 0))
        //                                 : [],

        //                 debts:
        //                         transactionType === "debts"
        //                                 ? sorted.map(i => Number(i.total || 0))
        //                                 : [],
        //         };
        // }, [breakdownData, transactionType]);
        const chartData = useMemo(() => {
                const labels = Array.from({ length: 30 }, (_, i) => `D${i + 1}`);

                return {
                        labels,

                        // Collections (green graph)
                        collections: [
                                68, 62, 50, 38, 27,
                                20, 19, 22, 25, 24,
                                20, 20, 20, 20, 20,
                                22, 25, 24, 20, 20,
                                20, 20, 20, 20, 23,
                                25, 24, 20, 20, 20,
                        ],

                        // Debts (orange graph)
                        debts: [
                                52, 45, 38, 42, 47,
                                50, 61, 62, 55, 50,
                                40, 40, 41, 43, 55,
                                61, 60, 60, 52, 40,
                                37, 35, 45, 54, 58,
                                64, 61, 50, 45, 40,
                        ],
                };
        }, []);
        const filteredChartData = useMemo(() => {
                let collections = [...chartData.collections];
                let debts = [...chartData.debts];

                if (selectedRegion === "2") {
                        collections = collections.map(v => Math.round(v * 0.85));
                        debts = debts.map(v => Math.round(v * 1.1));
                }

                if (selectedCategory === "3") {
                        collections = collections.map(v => Math.round(v * 1.2));
                        debts = debts.map(v => Math.round(v * 0.8));
                }

                return {
                        labels: chartData.labels,
                        collections,
                        debts,
                };
        }, [chartData, selectedRegion, selectedCategory]);

        const customerSummary: CustomerSummary =
                analyticfetchData?.customer_summary || {};

        const vendorSummary: VendorSummary =
                analyticfetchData?.vendor_summary || {};

        const customerValue =
                customerFilter === 'active'
                        ? customerSummary.active_customers
                        : customerSummary.total_customers;

        const breakdownConfig = {
                category: {
                        title: "Collection Breakdown",
                        subtitle: "BY CATEGORY",
                        data:
                                breakdownData?.customer_category?.map(item => ({
                                        name: item.category_name,
                                        count: item.count,
                                })) ?? [],
                },

                branch: {
                        title: "Branch Breakdown",
                        subtitle: "BY BRANCH",
                        data:
                                breakdownData?.branch_breakdown?.map(item => ({
                                        name: item.branch_name,
                                        count: item.count,
                                })) ?? [],
                },

                tariff: {
                        title: "Tariff Breakdown",
                        subtitle: "BY TARIFF",
                        data:
                                breakdownData?.tariff_breakdown?.map(item => ({
                                        name: item.tariff_name,
                                        count: item.count,
                                })) ?? [],
                },

                feeder: {
                        title: "Feeder Breakdown",
                        subtitle: "BY FEEDER",
                        data:
                                breakdownData?.feeder_breakdown?.map(item => ({
                                        name: item.feeder_name,
                                        count: item.count,
                                })) ?? [],
                },

                transformer: {
                        title: "Transformer Breakdown",
                        subtitle: "BY TRANSFORMER",
                        data:
                                breakdownData?.transformer_breakdown?.map(item => ({
                                        name: item.transformer_name,
                                        count: item.count,
                                })) ?? [],
                },
        };

        const current = breakdownConfig[collectionFilter];

        const loadAnalytics = async (start?: string, end?: string) => {
                setAnalyticsLoading(true);
                try {
                        const [analyticsRes, breakdownRes, analyticfetchRes] = await Promise.all([
                                fetchanalytics({
                                        start_date: start,
                                        end_date: end,
                                }),
                                fetchAnalyticsBreakdown(),
                                fetchAnalyticsDashboad(),
                        ]);
                        console.log(analyticfetchRes || null, "this th works", breakdownRes || null, "this th works", analyticsRes || null)
                        // API returns array → take first item
                        setAnalyticsData(analyticsRes || null);
                        setBreakdownData(breakdownRes || null);
                        setAnalyticfetchData(analyticfetchRes || null);
                } catch (err) {
                        console.error("Analytics error:", err);
                        toast.error(getErrorMessage(err));
                } finally {
                        setAnalyticsLoading(false);
                }
        };

        const prepaid = breakdownData?.metering_type.find((m) => m.name === "prepaid")?.count || 0;
        const postpaid = breakdownData?.metering_type.find((m) => m.name === "postpaid")?.count || 0;
        const totalCustomers = prepaid + postpaid;
        const prepaidPercent = totalCustomers > 0 ? (prepaid / totalCustomers) * 100 : 0;
        const postpaidPercent = totalCustomers > 0 ? (postpaid / totalCustomers) * 100 : 0;


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
                loadAnalytics(startDate, endDate);
        }, []);
        useEffect(() => {
                if (!searchInitializedRef.current) {
                        searchInitializedRef.current = true;
                        return;
                }
                const handler = setTimeout(async () => {
                        const trimmed = searchTerm.trim();
                        setSearchLoading(true);
                        try {
                                if (trimmed) {
                                        await refreshTenants({ search: trimmed });
                                } else {
                                        await refreshTenants();
                                }
                        } catch (err) {
                                console.error('Search failed:', err);
                                getErrorMessage(err);
                        } finally {
                                setSearchLoading(false);
                        }
                }, 400);
                return () => clearTimeout(handler);
        }, [searchTerm, refreshTenants]);


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
                const fetchVendorWallet = async () => {
                        try {
                                setVendorWalletLoading(true);

                                const vendorType =
                                        vendorDebtFilter === "external_wallet_amount"
                                                ? "external"
                                                : vendorDebtFilter === "internal_wallet_amount"
                                                        ? "internal"
                                                        : undefined;

                                const data = await totalVendorWallet(vendorType);

                                console.log("Vendor wallet total:", data);

                                setVendorWalletData(data);
                        } catch (error) {
                                console.error(
                                        "Failed to fetch vendor wallet total:",
                                        error
                                );
                        } finally {
                                setVendorWalletLoading(false);
                        }
                };

                fetchVendorWallet();
        }, [vendorDebtFilter]);

        useEffect(() => {
                if (configuration) {
                        setConfigDraft({
                                max_users: String(configuration.max_users ?? ''),
                                api_rate_limit: String(configuration.api_rate_limit ?? ''),
                                billing_cycle: configuration.billing_cycle ?? '',
                                max_storage_mb: String(configuration.limits?.max_storage_mb ?? ''),
                        });
                } else {
                        setConfigDraft({
                                max_users: '',
                                api_rate_limit: '',
                                billing_cycle: '',
                                max_storage_mb: '',
                        });
                }
        }, [configuration]);

        // Use backend search results directly when search is active
        // Only use local filtering as fallback if backend search hasn't completed

        const closeDomainModal = () => setDomainModalOpen(false);



        // Bulk operations state
        const [selectedTenants, setSelectedTenants] = useState<Set<string>>(new Set());
        const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
        const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'delete' | null>(null);

        // Analytics state
        const [analyticsView, setAnalyticsView] = useState<'summary' | 'detailed'>('summary');

        // Bulk operation handlers
        const closeBulkActionDialog = () => {
                setBulkActionDialogOpen(false);
                setBulkAction(null);
        };
        const pageLoading =
                loading ||
                analyticsLoading ||
                vendorsLoading ||
                searchLoading;


        return (
                <>
                        {pageLoading ? (
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
                                                                                                        Daily Collection
                                                                                                </Typography>

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
                                                                                                </TextField>
                                                                                        </Box>

                                                                                        <CardContent sx={{ px: 0 }}>
                                                                                                <Typography variant="h5">
                                                                                                        ₦
                                                                                                        {Number(
                                                                                                                dailyCollectionFilter === "energy_payments"
                                                                                                                        ? collection?.energy_payment ?? 0
                                                                                                                        : dailyCollectionFilter === "debt_payments"
                                                                                                                                ? collection?.debt_payment ?? 0
                                                                                                                                : collection?.total_collection ?? 0
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
                                                                <Grid item xs={12} md={4}>
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
                                                                                                {/* ₦{(400776).toLocaleString(undefined, { maximumFractionDigits: 2 })} */}
                                                                                        </Typography>
                                                                                </CardContent>
                                                                        </Card>
                                                                </Grid>
                                                                {/* <Grid item xs={12} md={3}>
                                                                        <Card>
                                                                                <CardContent>
                                                                                        <Typography color="text.secondary" variant="body2">
                                                                                                Collection Efficiency
                                                                                        </Typography>
                                                                                        <Typography variant="h5">{analyticsData?.analytics.collection_efficiency || 0}%</Typography>
                                                                                </CardContent>
                                                                        </Card>
                                                                </Grid> */}
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
                                                                        <Card sx={{ height: "80%" }}>
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
                                                                        <Card sx={{ height: "80%" }}>
                                                                                <CardContent>

                                                                                        <CardHeader
                                                                                                title={
                                                                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                                                                <Typography variant="body2" color="text.secondary">
                                                                                                                        {vendorDebtFilter === 'all'
                                                                                                                                ? 'Total Vendor Wallet Amount'
                                                                                                                                : vendorDebtFilter === 'external_wallet_amount'
                                                                                                                                        ? 'External Vendor Wallet Amount'
                                                                                                                                        : 'Internal Vendor Wallet Amount'}
                                                                                                                </Typography>

                                                                                                                <TextField
                                                                                                                        select
                                                                                                                        size="small"
                                                                                                                        value={vendorDebtFilter}
                                                                                                                        onChange={(e) => setVendorDebtFilter(e.target.value as any)}
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
                                                                                                                        <MenuItem value="external_wallet_amount">External Vendor Wallet Amount</MenuItem>
                                                                                                                        <MenuItem value="internal_wallet_amount">Internal Vendor Wallet Amount</MenuItem>

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

                                                                                        <CardContent >
                                                                                                <Typography variant="h5" marginTop={5}>
                                                                                                        ₦
                                                                                                        {Number(
                                                                                                                vendorWalletData?.balance ?? 0
                                                                                                        ).toLocaleString()}
                                                                                                </Typography>

                                                                                                <Typography
                                                                                                        variant="caption"
                                                                                                        color="text.secondary"
                                                                                                >
                                                                                                        {vendorWalletData?.vendor_count ?? 0} vendors
                                                                                                </Typography>
                                                                                        </CardContent>
                                                                                </CardContent>
                                                                        </Card>
                                                                </Grid>
                                                                <Grid item xs={12} md={4}>
                                                                        <Card sx={{ height: "80%" }}>
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
                                                                                title={
                                                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                                                <Typography variant="body2" color="text.secondary">
                                                                                                        {collectionFilter === 'category'
                                                                                                                ? 'Collection Breakdown'
                                                                                                                : collectionFilter === 'branch'
                                                                                                                        ? 'Branch/Region Breakdown'
                                                                                                                        : collectionFilter === 'tariff'
                                                                                                                                ? 'Tariff Breakdown'
                                                                                                                                : collectionFilter === 'feeder'
                                                                                                                                        ? 'Feeder Breakdown'
                                                                                                                                        : collectionFilter === 'transformer'
                                                                                                                                                ? 'Transformer Breakdown'
                                                                                                                                                : 'Collection Breakdown'}

                                                                                        </Typography>

                                                                                        <TextField
                                                                                                        select
                                                                                                        size="small"
                                                                                                        value={collectionFilter}
                                                                                                        onChange={(e) =>
                                                                                                                setCollectionFilter(
                                                                                                                        e.target.value as
                                                                                                                        | 'category'
                                                                                                                        | 'branch'
                                                                                                                        | 'tariff'
                                                                                                                        | 'feeder'
                                                                                                                        | 'transformer'
                                                                                                                )
                                                                                                        }
                                                                                                        variant="standard"
                                                                                                        InputProps={{ disableUnderline: true }}
                                                                                                        sx={{
                                                                                                                width: 150,
                                                                                                                '& .MuiInputBase-root': {
                                                                                                                        padding: 0,
                                                                                                                        margin: 0,
                                                                                                                },
                                                                                                                '& .MuiSelect-select': {
                                                                                                                        padding: '4px 8px',
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

                                                                                avatar={<Assessment color="primary" />}

                                                                                subheader="BY CATEGORY"

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
                                                                                <Stack spacing={2}>

                                                                                        {(breakdownData?.debt_exposure || []).map((item, i) => {
                                                                                                const value = Number(item.total_collections || 0);
                                                                                                return (
                                                                                                        <Box key={i}>
                                                                                                                <Box display="flex" justifyContent="space-between">
                                                                                                                        <Typography variant="body2">{item.category_name}</Typography>
                                                                                                                        <Typography fontWeight={500}>₦{value.toLocaleString()}</Typography>
                                                                                                                </Box>
                                                                                                                <Box
                                                                                                                        sx={{
                                                                                                                                height: 6,
                                                                                                                                bgcolor: '#eee',
                                                                                                                                borderRadius: 5,
                                                                                                                                mt: 0.5,
                                                                                                                        }}
                                                                                                                >
                                                                                                                        <Box
                                                                                                                                sx={{
                                                                                                                                        width: `${value > 0 ? Math.min(value / 1000, 100) : 0}%`,
                                                                                                                                        height: '100%',
                                                                                                                                        bgcolor: 'primary.main',
                                                                                                                                        borderRadius: 5,
                                                                                                                                }}
                                                                                                                        />
                                                                                                                </Box>
                                                                                                        </Box>
                                                                                                );
                                                                                        })}


                                                                                </Stack>
                                                                        </CardContent>
                                                                </Card>
                                                        </Grid> */}
                                                        <Grid item xs={12} md={4}>
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
                                                        </Grid>

                                                        <Grid item xs={12} md={8}>

                                                                <Stack spacing={3} data-tenant-details>

                                                                        <Card>
                                                                                <CardHeader avatar={<Security color="primary" />} title="Overview" />
                                                                                <CardContent>
                                                                                        <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
                                                                                                {/* <Chip label={`Inactive Users: ${(analyticfetchData?.user_summary.inactive_users || 0).toLocaleString()}`} size="small" /> */}
                                                                                                <Chip label={`Total Postpaid Customer: ${(postpaid).toLocaleString()}`} size="small" />
                                                                                                <Chip label={`Total Prepaid Customer: ${(prepaid).toLocaleString()}`} size="small" />
                                                                                                {/* <Chip label={`Total Unmetered Customers: ${(889540).toLocaleString()}`} size="small" /> */}
                                                                                                <Chip label={`Suspended Customers: ${(analyticsData?.analytics.suspended_custommers || 0).toLocaleString()}`} size="small" />
                                                                                        </Stack>
                                                                                </CardContent>
                                                                        </Card>

                                                                        <Grid container spacing={2}>
                                                                                <Grid item xs={12}>
                                                                                        {/* <Card> */}
                                                                                        {/* <CardHeader
                                                                                                        avatar={<Analytics color="primary" />}
                                                                                                        title="Daily Transactions"
                                                                                                        subheader="Last 30 Days"
                                                                                                        action={
                                                                                                                <Stack direction="row" spacing={1}>
                                                                                                                        <Button
                                                                                                                                size="small"
                                                                                                                                variant={analyticsView === 'summary' ? 'contained' : 'outlined'}
                                                                                                                                onClick={() => setAnalyticsView('summary')}
                                                                                                                        >
                                                                                                                                Chart	View
                                                                                                                        </Button>
                                                                                                                        <Button
                                                                                                                size="small"
                                                                                                                variant={analyticsView === 'detailed' ? 'contained' : 'outlined'}
                                                                                                                onClick={() => setAnalyticsView('detailed')}
                                                                                                        >
                                                                                                                Table View
                                                                                                        </Button>

                                                                                                                </Stack>
                                                                                                        }
                                                                                                /> */}
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
                                                                                                        {/* <LineChart
                                                                                                                xAxis={[
                                                                                                                        {
                                                                                                                                scaleType: 'point',
                                                                                                                                data: dailyTransactionsMock.labels,
                                                                                                                        },
                                                                                                                ]}
                                                                                                                series={[
                                                                                                                        {
                                                                                                                                data: dailyTransactionsMock.data,
                                                                                                                                label: 'Daily Transactions',
                                                                                                                        },
                                                                                                                ]}
                                                                                                                height={260}
                                                                                                                margin={{ top: 20, bottom: 30 }}
                                                                                                        /> */}
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

                                                                                                                <Button
                                                                                                                        variant="contained"
                                                                                                                        onClick={() =>
                                                                                                                                setAnalyticsView("summary")
                                                                                                                        }
                                                                                                                >
                                                                                                                        Chart View
                                                                                                                </Button>
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
                                                                                                                                        // transactionType === "collections"
                                                                                                                                        //         ? chartData.collections
                                                                                                                                        //         : chartData.debts,
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


                                                                        </Grid>

                                                                </Stack>

                                                        </Grid>
                                                </Grid>
                                        </Box>

                                </>
                        )}
                </>

        );
};

export default TenantAdmin;
