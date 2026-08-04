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
import { fetchVendors, createVendor, type VendorForm, Vendor, searchVendors, toggleVendorStatus, AnalyticsBreakdown, AnalyticsCount, fetchanalytics, fetchAnalyticsBreakdown, fetchAnalyticsDashboad, AnalyticsDashboad } from '../../../services/vendorService';
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
        const [vendorFilter, setVendorFilter] = useState<'all' | 'active' | 'inactive'>('all');

        const today = new Date().toISOString().split('T')[0];

        const [startDate, setStartDate] = useState<string>(today);
        const [endDate, setEndDate] = useState<string>(today);

        const [analyticsData, setAnalyticsData] = useState<AnalyticsCount | null>(null);
        const [breakdownData, setBreakdownData] = useState<AnalyticsBreakdown | null>(null);
        const [analyticfetchData, setAnalyticfetchData] = useState<AnalyticsDashboad | null>(null);
        const [vendorsLoading, setVendorsLoading] = useState(true);

        const [analyticsLoading, setAnalyticsLoading] = useState(false);

        const [configDraft, setConfigDraft] = useState({
                max_users: '',
                api_rate_limit: '',
                billing_cycle: '',
                max_storage_mb: '',
        });

        const dailyTransactionsMock = useMemo(() => {
                const transactions = breakdownData?.daily_transaction || [];

                if (!transactions.length) {
                        return { labels: [], data: [] };
                }

                // Sort by date ASC (important for chart)
                const sorted = [...transactions].sort(
                        (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
                );

                const labels = sorted.map((item) =>
                        new Date(item.day).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                        })
                );

                const data = sorted.map((item) => Number(item.total || 0));

                return { labels, data };
        }, [breakdownData]);

        const customerSummary: CustomerSummary =
                analyticfetchData?.customer_summary || {};

        const vendorSummary: VendorSummary =
                analyticfetchData?.vendor_summary || {};

        const customerValue =
                customerFilter === 'active'
                        ? customerSummary.active_customers
                        : customerSummary.total_customers;

        const vendorValue =
                vendorFilter === 'active'
                        ? vendorSummary.active
                        : vendorFilter === 'inactive'
                                ? vendorSummary.inactive
                                        : vendorSummary.all;

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


        // const last7Days = useMemo(() => {
        //         if (!breakdownData?.daily_transaction) return [];

        //         return [...breakdownData.daily_transaction]
        //                 .sort((a, b) => new Date(b.day).getTime() - new Date(a.day).getTime())
        //                 .slice(0, 7)
        //                 .map((item, index, arr) => {
        //                         const prev = arr[index + 1];

        //                         const change = prev
        //                                 ? ((item.total - prev.total) / prev.total) * 100
        //                                 : 0;

        //                         return {
        //                                 date: new Date(item.day).toLocaleDateString('en-GB', {
        //                                         day: '2-digit',
        //                                         month: 'short',
        //                                 }).toUpperCase(),

        //                                 amount: `₦${item.total.toLocaleString()}`,
        //                                 change: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
        //                                 up: change >= 0,
        //                         };
        //                 });
        // }, [breakdownData]);


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
                                                                        <Card>
                                                                                <CardContent>
                                                                                        {/* <CardHeader
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
                                                                                        /> */}
                                                                                        <Typography color="text.secondary" variant="body2">
                                                                                                Total Transactions Today
                                                                                        </Typography>
                                                                                        <Typography variant="h5">{analyticfetchData?.transactions_today}</Typography>
                                                                                </CardContent>
                                                                        </Card>
                                                                </Grid>
                                                                <Grid item xs={12} md={4}>
                                                                        <Card>
                                                                                <CardContent>
                                                                                        <Typography color="text.secondary" variant="body2">
                                                                                                Avg Daily Revenue
                                                                                        </Typography>
                                                                                        <Typography variant="h5">
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
                                                                        <Card>
                                                                                <CardContent>
                                                                                        <Typography color="text.secondary" variant="body2">
                                                                                                Current Debt Balance
                                                                                        </Typography>
                                                                                        <Typography variant="h5">
                                                                                                ₦{Number(analyticsData?.analytics?.total_debt || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                                                        </Typography>
                                                                                </CardContent>
                                                                        </Card>
                                                                </Grid>
                                                                <Grid item xs={12} md={4}>
                                                                        <Card>
                                                                                <CardContent sx={{
                                                                                        height: 91,
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
                                                                                                <Typography variant="h5">
                                                                                                        {Number(customerValue || 0).toLocaleString()}
                                                                                                </Typography>
                                                                                        </CardContent>
                                                                                </CardContent>
                                                                        </Card>
                                                                </Grid>
                                                                <Grid item xs={12} md={4}>
                                                                        <Card>
                                                                                <CardContent sx={{ height: 91 }}>

                                                                                        <CardHeader
                                                                                                title={
                                                                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                                                                <Typography variant="body2" color="text.secondary">
                                                                                                                        {vendorFilter === 'all'
                                                                                                                                ? 'Total Vendors'
                                                                                                                                : vendorFilter === 'active'
                                                                                                                                        ? 'Active Vendors'
                                                                                                                                        : 'Inactive Vendors'}
                                                                                                                </Typography>

                                                                                                                <TextField
                                                                                                                        select
                                                                                                                        size="small"
                                                                                                                        value={vendorFilter}
                                                                                                                        onChange={(e) => setVendorFilter(e.target.value as any)}
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
                                                                                                                        <MenuItem value="inactive">Inactive</MenuItem>
                                                                                                                        
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
                                                                                                <Typography variant="h5">
                                                                                                        {Number(vendorValue || 0).toLocaleString()}
                                                                                                </Typography>
                                                                                        </CardContent>
                                                                                </CardContent>
                                                                        </Card>
                                                                </Grid>
                                                                <Grid item xs={12} md={4}>
                                                                        <Card>
                                                                                <CardContent>
                                                                                        <Typography color="text.secondary" variant="body2">
                                                                                                Vendors Aggregated Balance
                                                                                        </Typography>
                                                                                        <Typography variant="h5">
                                                                                                ₦{Number(analyticfetchData?.vendor_summary.aggregated_wallet_balance || 0).toLocaleString()}
                                                                                                {/* ₦{(90000776).toLocaleString(undefined, { maximumFractionDigits: 2 })} */}
                                                                                        </Typography>
                                                                                </CardContent>
                                                                        </Card>
                                                                </Grid>
                                                        </Grid>
                                                )}
                                                <Grid container spacing={3}>
                                                        <Grid item xs={12} md={4}>
                                                                <Card>
                                                                        <CardHeader
                                                                                avatar={<Assessment color="primary" />}
                                                                                // title="Debt Exposure"
                                                                                title="Collection Breakdown"
                                                                                subheader="BY CATEGORY"
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
                                                        </Grid>

                                                        <Grid item xs={12} md={8}>

                                                                <Stack spacing={3} data-tenant-details>

                                                                        <Card>
                                                                                <CardHeader avatar={<Security color="primary" />} title="Overview" />
                                                                                <CardContent>
                                                                                        <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
                                                                                                <Chip label={`Inactive Users: ${(analyticfetchData?.user_summary.inactive_users || 0).toLocaleString()}`} size="small" />
                                                                                                <Chip label={`Total Postpaid Customer: ${(postpaid).toLocaleString()}`} size="small" />
                                                                                                <Chip label={`Total Prepaid Customer: ${(prepaid).toLocaleString()}`} size="small" />
                                                                                                {/* <Chip label={`Total Unmetered Customers: ${(889540).toLocaleString()}`} size="small" /> */}
                                                                                                <Chip label={`Suspended Customers: ${(analyticsData?.analytics.suspended_custommers || 0).toLocaleString()}`} size="small" />
                                                                                        </Stack>
                                                                                </CardContent>
                                                                        </Card>

                                                                        <Grid container spacing={2}>
                                                                                <Grid item xs={12}>
                                                                                        <Card>
                                                                                                <CardHeader
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
                                                                                                                        {/* <Button
                                                                                                                size="small"
                                                                                                                variant={analyticsView === 'detailed' ? 'contained' : 'outlined'}
                                                                                                                onClick={() => setAnalyticsView('detailed')}
                                                                                                        >
                                                                                                                Table View
                                                                                                        </Button> */}

                                                                                                                </Stack>
                                                                                                        }
                                                                                                />
                                                                                                <CardContent>
                                                                                                        {/* {analyticsView === 'summary' ? ( */}
                                                                                                        <LineChart
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
