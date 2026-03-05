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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemSecondaryAction,
    ListItemText,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Add,
    Assessment,
    CheckCircle,
    ContentCopy,
    Delete,
    Domain,
    Edit,
    HighlightOff,
    Key,
    Loop,
    People,
    Refresh,
    Settings,
    Security,
    Visibility,
    CheckBox,
    CheckBoxOutlineBlank,
    SelectAll,
    BarChart,
    Analytics,
    Download,
    Search,
} from '@mui/icons-material';
import { useTenants } from '../../../hooks/useTenants';
import { useVendorHierarchy } from '../../../contexts/VendorContext';
import { useTenantAdminProfile } from '../../../hooks/useTenantAdminProfile';
import { useApiKeys } from '../../../hooks/useApiKeys';
import { useAppSelector } from '../../../store/hooks';
import TenantFormModal, { TenantFormValues } from '../../../components/TenantAdmin/TenantFormModal';
import TenantDomainModal, { TenantDomainFormValues } from '../../../components/TenantAdmin/TenantDomainModal';
import TenantUserRoleModal, { TenantUserRoleFormValues } from '../../../components/TenantAdmin/TenantUserRoleModal';
import ConfirmDialog from '../../../components/TenantAdmin/ConfirmDialog';
import ApiKeyAuditDialog from '../../../components/TenantAdmin/ApiKeyAuditDialog';
import type { Tenant, TenantConfiguration as TenantConfigurationType, TenantUser, CreateTenantRequest } from '../../../services/tenantService';

const TenantAdmin: React.FC = () => {
    const {
        tenants,
        summary,
        selectedTenant,
        selectedTenantId,
        stats,
        users,
        domains,
        configuration,
        loading,
        detailLoading,
        mutationLoading,
        error,
        setError,
        refreshTenants,
        selectTenant,
        createTenant,
        updateTenant,
        deleteTenant,
        setTenantActive,
        addDomain,
        updateDomain,
        removeDomain,
        updateConfiguration,
        toggleTenantUserAdmin,
        setTenantUserRole,
        updateTenantUser,
        removeTenantUser,
    } = useTenants();

    const { tree, selectedOrg, selectedOrgId, selectOrg } = useVendorHierarchy();
    const { profile, loading: profileLoading, error: profileError } = useTenantAdminProfile(selectedTenantId);
    const {
        keys,
        loading: keysLoading,
        createKey,
        rotateKey,
        revokeKey,
        removeKey,
        lastIssuedSecret,
        setLastIssuedSecret,
        auditEntries,
        loadAudit,
    } = useApiKeys('vendor_org', selectedOrgId ?? null);
    
    const user = useAppSelector((state) => state.auth.user);
    const canCreateTenant = useMemo(() => {
        // Debug: Log user object to help diagnose permission issues
        if (process.env.NODE_ENV === 'development') {
            console.log('[TenantAdmin] Permission check - User object:', user);
            console.log('[TenantAdmin] Permission check - User role:', user?.role);
            console.log('[TenantAdmin] Permission check - is_superuser:', (user as any)?.is_superuser);
            console.log('[TenantAdmin] Permission check - is_staff:', (user as any)?.is_staff);
        }

        if (!user) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[TenantAdmin] No user object found');
            }
            return false;
        }

        // Check if user has superuser status (from backend) - this is the primary check
        if ((user as any)?.is_superuser === true || (user as any)?.isSuperuser === true) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[TenantAdmin] Permission granted: is_superuser = true');
            }
            return true;
        }

        // Check if user is staff (staff members can also create tenants)
        // Also check if email contains 'admin' as a fallback for tenant admins
        const isStaff = (user as any)?.is_staff === true || (user as any)?.isStaff === true;
        const isAdminEmail = user?.email?.toLowerCase().includes('admin');

        if (isStaff || isAdminEmail) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[TenantAdmin] Permission granted:', { isStaff, isAdminEmail });
            }
            return true;
        }

        // Check role-based permissions
        const role = user?.role;
        if (!role) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[TenantAdmin] Permission denied: No role found for user');
            }
            return false;
        }

        // Normalize role to lowercase for comparison
        const roleLower = typeof role === 'string' ? role.toLowerCase().trim() : String(role).toLowerCase().trim();

        // Allow admin, platform_admin, platform, super_admin, and owner roles
        const allowedRoles = ['admin', 'platform_admin', 'platform', 'super_admin', 'owner'];
        const hasPermission = allowedRoles.includes(roleLower);

        if (process.env.NODE_ENV === 'development') {
            console.log('[TenantAdmin] Role-based permission check:', {
                originalRole: role,
                roleType: typeof role,
                normalizedRole: roleLower,
                allowedRoles,
                hasPermission,
                roleInList: allowedRoles.includes(roleLower),
                exactMatch: roleLower === 'admin'
            });
            console.log('[TenantAdmin] Final canCreateTenant result:', hasPermission);
        }

        return hasPermission;
    }, [user]);
    const tenantCreateDisabledMessage = canCreateTenant
        ? undefined
        : 'Only platform administrators can create new tenants.';

    const [searchTerm, setSearchTerm] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const searchInitializedRef = useRef(false);
    const [tenantModalState, setTenantModalState] = useState<{ open: boolean; mode: 'create' | 'edit'; tenant?: Tenant | null }>({
        open: false,
        mode: 'create',
    });
    const [createSuccess, setCreateSuccess] = useState<string | null>(null);
    const [domainModalOpen, setDomainModalOpen] = useState(false);
    const [userRoleModalState, setUserRoleModalState] = useState<{ open: boolean; user?: TenantUser | null }>({
        open: false,
    });
    const [deleteTenantOpen, setDeleteTenantOpen] = useState(false);
    const [auditModalState, setAuditModalState] = useState<{ open: boolean; keyId?: string | null; keyLabel?: string }>({
        open: false,
    });
    const [configDraft, setConfigDraft] = useState({
        max_users: '',
        api_rate_limit: '',
        billing_cycle: '',
        max_storage_mb: '',
    });

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
            } finally {
                setSearchLoading(false);
            }
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm, refreshTenants]);

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
    const filteredTenants = useMemo(() => {
        // If we have a search term and results, use them directly (backend search)
        // Otherwise, if search term exists but no results yet, show empty
        // If no search term, show all tenants
        if (!searchTerm.trim()) {
            return tenants;
        }

        // Backend search is handled by refreshTenants with search parameter
        // The tenants array already contains filtered results from backend
        // Apply additional client-side filtering only if needed for immediate feedback
        if (!tenants || !Array.isArray(tenants)) return [];
        const term = searchTerm.toLowerCase();
        return tenants.filter(
            (tenant) =>
                tenant.business_name.toLowerCase().includes(term) 
                //||
                // tenant.slug.toLowerCase().includes(term) ||
                // tenant.domain.toLowerCase().includes(term) ||
                // (tenant.subdomain && tenant.subdomain.toLowerCase().includes(term))
        );
    }, [tenants, searchTerm]);

    const vendorSummary = useMemo(() => {
        const totals = { total: 0, vendors: 0, subVendors: 0, agents: 0, cashiers: 0 };
        const traverse = (nodes: typeof tree) => {
            if (!nodes || !Array.isArray(nodes)) return;
            nodes.forEach((node) => {
                totals.total += 1;
                switch (node.level) {
                    case 'vendor':
                        totals.vendors += 1;
                        break;
                    case 'sub_vendor':
                        totals.subVendors += 1;
                        break;
                    case 'agent':
                        totals.agents += 1;
                        break;
                    case 'cashier':
                        totals.cashiers += 1;
                        break;
                    default:
                        break;
                }
                if (node.children?.length) traverse(node.children);
            });
        };
        traverse(tree);
        return totals;
    }, [tree]);

    const openCreateTenantModal = () => {
        console.log('[TenantAdmin] openCreateTenantModal called');
        console.log('[TenantAdmin] canCreateTenant:', canCreateTenant);
        console.log('[TenantAdmin] user:', user);

        if (!canCreateTenant) {
            const errorMsg = 'You do not have permission to create tenants. Please contact a platform administrator.';
            console.warn('[TenantAdmin] Permission denied:', errorMsg);
            setError(errorMsg);
            return;
        }

        console.log('[TenantAdmin] Opening create tenant modal');
        setError(null);
        setCreateSuccess(null);
        setSearchTerm(''); // Clear search when creating new tenant
        setTenantModalState({ open: true, mode: 'create' });
    };

    const openEditTenantModal = () => {
        if (!selectedTenant) return;
        setTenantModalState({ open: true, mode: 'edit', tenant: selectedTenant });
    };

    const closeTenantModal = () => {
        setTenantModalState({ open: false, mode: 'create' });
        setError(null);
        setCreateSuccess(null);
    };

    const handleTenantModalSubmit = async (values: TenantFormValues) => {
        const sanitizedName = values.name.trim();

        // Build payload matching backend TenantCreateSerializer expectations
        const payload: CreateTenantRequest = {
            name: sanitizedName,
            slug: (values.slug && values.slug.trim()) || sanitizedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            domain: values.domain.trim().toLowerCase(),
            subdomain: values.subdomain?.trim() || undefined,
            is_trial: values.isTrial,
            trial_ends_at: values.trialEndsAt ? new Date(values.trialEndsAt).toISOString() : undefined,
            is_active: values.isActive,
        };

        if (tenantModalState.mode === 'create') {
            if (!canCreateTenant) {
                setError('You do not have permission to create tenants. Please contact a platform administrator.');
                throw new Error('User lacks permission to create tenants.');
            }

            // Add admin credentials if provided (matching backend TenantCreateSerializer)
            const createPayload: CreateTenantRequest = {
                ...payload,
                admin_email: values.adminEmail?.trim() || undefined,
                admin_password: values.adminPassword || undefined,
            };

            try {
                console.log('[TenantAdmin] Creating tenant with payload:', createPayload);
                const newTenant = await createTenant(createPayload);
                console.log('[TenantAdmin] Tenant created successfully:', newTenant);

                setCreateSuccess(`Tenant "${newTenant.business_name}" created successfully!`);
                setTimeout(() => setCreateSuccess(null), 5000);
                // Clear search to show the new tenant
                setSearchTerm('');
                // Auto-select the newly created tenant
                if (newTenant.id) {
                    selectTenant(newTenant.id);
                }
                // Close modal on success
                closeTenantModal();
            } catch (err: any) {
                console.error('[TenantAdmin] Tenant creation failed:', err);
                // Extract error message from various possible formats
                let errorMessage = 'Failed to create tenant. Please try again.';

                if (typeof err === 'string') {
                    errorMessage = err;
                } else if (err?.message) {
                    errorMessage = err.message;
                } else if (err?.detail) {
                    errorMessage = err.detail;
                } else if (err?.response?.data) {
                    const data = err.response.data;
                    if (typeof data === 'string') {
                        errorMessage = data;
                    } else if (data.detail) {
                        errorMessage = data.detail;
                    } else if (data.message) {
                        errorMessage = data.message;
                    } else if (data.non_field_errors) {
                        errorMessage = Array.isArray(data.non_field_errors)
                            ? data.non_field_errors[0]
                            : data.non_field_errors;
                    } else {
                        // Extract first field error
                        const firstError = Object.values(data)[0];
                        if (Array.isArray(firstError)) {
                            errorMessage = firstError[0];
                        } else if (typeof firstError === 'string') {
                            errorMessage = firstError;
                        }
                    }
                }

                console.error('[TenantAdmin] Tenant creation error details:', {
                    error: err,
                    status: err?.status,
                    message: err?.message,
                    detail: err?.detail,
                    response: err?.response,
                });

                setError(errorMessage);
                // Don't close modal on error - let user see the error and try again
                // Re-throw so modal can also handle it and display the error
                throw new Error(errorMessage);
            }
        } else if (tenantModalState.mode === 'edit' && tenantModalState.tenant) {
            try {
                await updateTenant(tenantModalState.tenant.id, payload);
                setCreateSuccess(`Tenant "${sanitizedName}" updated successfully!`);
                setTimeout(() => setCreateSuccess(null), 5000);
            } catch (err: any) {
                const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to update tenant';
                setError(errorMessage);
                throw err;
            }
        }
    };

    const openDomainModal = () => setDomainModalOpen(true);
    const closeDomainModal = () => setDomainModalOpen(false);

    const handleDomainModalSubmit = async (values: TenantDomainFormValues) => {
        if (!selectedTenant) {
            throw new Error('No tenant selected');
        }
        await addDomain(selectedTenant.id, values.domain.trim(), {
            is_primary: values.isPrimary,
            is_active: values.isActive,
        });
    };

    const openUserRoleModal = (user: TenantUser) => setUserRoleModalState({ open: true, user });
    const closeUserRoleModal = () => setUserRoleModalState({ open: false });

    const handleUserRoleSubmit = async (values: TenantUserRoleFormValues) => {
        if (!userRoleModalState.user) {
            throw new Error('No tenant user selected');
        }
        const { id, is_tenant_admin, is_active, role } = userRoleModalState.user;
        const tasks: Promise<unknown>[] = [];
        if (values.role && values.role !== role) {
            tasks.push(setTenantUserRole(id, values.role));
        }
        if (values.isTenantAdmin !== is_tenant_admin) {
            tasks.push(toggleTenantUserAdmin(id));
        }
        if (values.isActive !== is_active) {
            tasks.push(updateTenantUser(id, { is_active: values.isActive }));
        }
        if (tasks.length) {
            await Promise.all(tasks);
        }
    };

    const openDeleteTenantModal = () => setDeleteTenantOpen(true);
    const closeDeleteTenantModal = () => setDeleteTenantOpen(false);

    const handleDeleteTenant = async () => {
        if (!selectedTenant) {
            return;
        }
        await deleteTenant(selectedTenant.id);
    };

    // const handleToggleActive = () => {
    //     if (!selectedTenant) return;
    //     setTenantActive(selectedTenant.id, !selectedTenant.is_active);
    // };

    // const handleToggleTrial = async () => {
    //     if (!selectedTenant) return;
    //     await updateTenant(selectedTenant.id, { is_trial: !selectedTenant.is_trial });
    // };

    const openAuditDialog = async (keyId: string, keyLabel: string) => {
        await loadAudit(keyId);
        setAuditModalState({ open: true, keyId, keyLabel });
    };

    const closeAuditDialog = () => setAuditModalState({ open: false });

    const handleSaveConfiguration = async () => {
        if (!configuration) return;
        const payload: Partial<TenantConfigurationType> = {};
        if (configDraft.max_users) payload.max_users = Number(configDraft.max_users);
        if (configDraft.api_rate_limit) payload.api_rate_limit = Number(configDraft.api_rate_limit);
        if (configDraft.billing_cycle) payload.billing_cycle = configDraft.billing_cycle;
        try {
            await updateConfiguration(payload);
        } catch {
            // handled in hook
        }
    };

    const handleCreateKey = async (scopes: string[], expires?: string) => {
        try {
            await createKey(scopes, expires || undefined);
        } catch (err) {
            setError(typeof err === 'string' ? err : (err as any)?.message || 'Failed to issue API key');
        }
    };

    const [scopesInput, setScopesInput] = useState('wallet:read,wallet:write');
    const [expiresInput, setExpiresInput] = useState('');

    // Bulk operations state
    const [selectedTenants, setSelectedTenants] = useState<Set<string>>(new Set());
    const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
    const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'delete' | null>(null);

    // Analytics state
    const [analyticsView, setAnalyticsView] = useState<'summary' | 'detailed'>('summary');

    // Bulk operation handlers
    const handleBulkAction = async () => {
        if (!bulkAction || selectedTenants.size === 0) return;

        const tenantIds = Array.from(selectedTenants);
        const promises: Promise<unknown>[] = [];

        try {
            if (bulkAction === 'activate') {
                for (const id of tenantIds) {
                    promises.push(setTenantActive(id, true));
                }
            } else if (bulkAction === 'deactivate') {
                for (const id of tenantIds) {
                    promises.push(setTenantActive(id, false));
                }
            } else if (bulkAction === 'delete' && canCreateTenant) {
                for (const id of tenantIds) {
                    promises.push(deleteTenant(id));
                }
            }

            await Promise.all(promises);
            setSelectedTenants(new Set());
            setBulkActionDialogOpen(false);
            setBulkAction(null);
            await refreshTenants();
        } catch (err) {
            setError(typeof err === 'string' ? err : (err as any)?.message || 'Failed to perform bulk action');
        }
    };

    const closeBulkActionDialog = () => {
        setBulkActionDialogOpen(false);
        setBulkAction(null);
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Tenant Administration</Typography>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => refreshTenants()}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={openCreateTenantModal}
                        disabled={!canCreateTenant}
                        title={canCreateTenant ? 'Create a new tenant' : tenantCreateDisabledMessage}
                        sx={{
                            opacity: canCreateTenant ? 1 : 0.6,
                        }}
                    >
                        Add Tenant
                    </Button>
                    {process.env.NODE_ENV === 'development' && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            (canCreate: {String(canCreateTenant)})
                        </Typography>
                    )}
                </Stack>
            </Box>

            {!canCreateTenant && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    {tenantCreateDisabledMessage}
                </Alert>
            )}

            {(error || profileError) && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error || profileError}
                </Alert>
            )}

            {createSuccess && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setCreateSuccess(null)}>
                    {createSuccess}
                </Alert>
            )}

            {summary && (
                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" variant="body2">
                                    Total Vendor
                                </Typography>
                                <Typography variant="h5">{tenants?.length || 0}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" variant="body2">
                                    Active Vendor
                                </Typography>
                                <Typography variant="h5">{tenants?.length || 0}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" variant="body2">
                                    Total Customer
                                </Typography>
                                <Typography variant="h5">{summary.trial_tenants}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" variant="body2">
                                    Active Users
                                </Typography>
                                <Typography variant="h5">{summary.total_users}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" variant="body2">
                                    API Calls Today
                                </Typography>
                                <Typography variant="h5">{(summary.today_api_calls ?? 0).toLocaleString()}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" variant="body2">
                                    Transactions Today
                                </Typography>
                                <Typography variant="h5">{(summary.today_transactions ?? 0).toLocaleString()}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" variant="body2">
                                  Vendor Wallet Ballance                            
                                </Typography>
                                <Typography variant="h5">
                                    {(selectedTenant?.wallet?.balance ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardHeader
                            title="Tenants"
                            subheader={
                                searchTerm
                                    ? `${filteredTenants?.length || 0} of ${tenants?.length || 0} tenant${(tenants?.length || 0) !== 1 ? 's' : ''}`
                                    : `${tenants?.length || 0} total tenant ${(tenants?.length || 0) !== 1 ? 's' : ''}`
                            }
                        />
                        <CardContent>
                            <Stack spacing={2}>
                                <TextField
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Search tenants by name, domain, slug, or subdomain..."
                                    fullWidth
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                {searchLoading ? <CircularProgress size={16} /> : <Search />}
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchTerm && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSearchTerm('');
                                                        refreshTenants();
                                                    }}
                                                >
                                                    <HighlightOff fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    helperText={
                                        searchLoading
                                            ? 'Searching...'
                                            : searchTerm
                                                ? `${filteredTenants?.length || 0} result${(filteredTenants?.length || 0) !== 1 ? 's' : ''} found`
                                                : 'Type to search tenants by name, domain, slug, or subdomain'
                                    }
                                />
                                {searchTerm && (
                                    <Chip
                                        label={`${filteredTenants?.length || 0} tenant${(filteredTenants?.length || 0) !== 1 ? 's' : ''} found`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        onDelete={() => {
                                            setSearchTerm('');
                                            refreshTenants();
                                        }}
                                    />
                                )}
                            </Stack>
                            {/* Bulk Actions Toolbar */}
                            {selectedTenants.size > 0 && (
                                <Box sx={{ mb: 2, p: 1, bgcolor: 'action.selected', borderRadius: 1 }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="body2">
                                            {selectedTenants.size} tenant{selectedTenants.size !== 1 ? 's' : ''} selected
                                        </Typography>
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                setBulkAction('activate');
                                                setBulkActionDialogOpen(true);
                                            }}
                                        >
                                            Activate
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                setBulkAction('deactivate');
                                                setBulkActionDialogOpen(true);
                                            }}
                                        >
                                            Deactivate
                                        </Button>
                                        {canCreateTenant && (
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    setBulkAction('delete');
                                                    setBulkActionDialogOpen(true);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                        <Button size="small" onClick={() => setSelectedTenants(new Set())}>
                                            Clear
                                        </Button>
                                    </Stack>
                                </Box>
                            )}

                            <List dense sx={{ maxHeight: 480, overflowY: 'auto', mt: 2 }}>
                                {loading && !(tenants?.length) ? (
                                    <ListItem>
                                        <ListItemText primary="Loading tenants..." />
                                    </ListItem>
                                ) : (filteredTenants?.length) ? (
                                    <>
                                        {canCreateTenant && (
                                            <ListItem>
                                                <ListItemButton
                                                    onClick={() => {
                                                        if (selectedTenants.size === (filteredTenants?.length || 0)) {
                                                            setSelectedTenants(new Set());
                                                        } else {
                                                            setSelectedTenants(new Set((filteredTenants || []).map(t => t.id)));
                                                        }
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                {selectedTenants.size === (filteredTenants?.length || 0) ? (
                                                                    <CheckBox color="primary" />
                                                                ) : (
                                                                    <CheckBoxOutlineBlank />
                                                                )}
                                                                <Typography variant="body2" fontWeight={600}>
                                                                    Select All
                                                                </Typography>
                                                            </Stack>
                                                        }
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        )}
                                        {filteredTenants.map((tenant) => (
                                            <ListItem key={tenant.id} disablePadding>
                                                <ListItemButton
                                                    selected={tenant.id === selectedTenantId}
                                                    onClick={() => {
                                                        selectTenant(tenant.id);
                                                        // Scroll to top of details panel if on mobile
                                                        if (window.innerWidth < 960) {
                                                            setTimeout(() => {
                                                                const detailsCard = document.querySelector('[data-tenant-details]');
                                                                if (detailsCard) {
                                                                    detailsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                                }
                                                            }, 100);
                                                        }
                                                    }}
                                                    sx={{
                                                        '&.Mui-selected': {
                                                            bgcolor: 'primary.light',
                                                            '&:hover': {
                                                                bgcolor: 'primary.light',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {canCreateTenant && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newSelected = new Set(selectedTenants);
                                                                if (newSelected.has(tenant.id)) {
                                                                    newSelected.delete(tenant.id);
                                                                } else {
                                                                    newSelected.add(tenant.id);
                                                                }
                                                                setSelectedTenants(newSelected);
                                                            }}
                                                        >
                                                            {selectedTenants.has(tenant.id) ? (
                                                                <CheckBox color="primary" />
                                                            ) : (
                                                                <CheckBoxOutlineBlank />
                                                            )}
                                                        </IconButton>
                                                    )}
                                                    <ListItemText
                                                        primary={
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Typography variant="body2" fontWeight={600}>
                                                                    {tenant.business_name}
                                                                </Typography>
                                                                {/* <Chip
                                                                    label={tenant.is_active ? 'Active' : 'Inactive'}
                                                                    size="small"
                                                                    color={tenant.is_active ? 'success' : 'default'}
                                                                /> */}
                                                            </Stack>
                                                        }
                                                        // secondary={`${tenant.domain}${tenant.subdomain ? ` • ${tenant.subdomain}` : ''}`}
                                                    />
                                                    {/* <ListItemSecondaryAction>
                                                        {tenant.is_trial && <Chip label="Trial" size="small" color="warning" />}
                                                    </ListItemSecondaryAction> */}
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </>
                                ) : searchTerm ? (
                                    <ListItem>
                                        <ListItemText
                                            primary="No tenants found"
                                            secondary={`No tenants match "${searchTerm}". Try a different search term.`}
                                        />
                                    </ListItem>
                                ) : (
                                    <ListItem>
                                        <ListItemText
                                            primary="No tenants available"
                                            secondary={canCreateTenant ? "Click 'Add Tenant' to create your first tenant." : "No tenants have been created yet."}
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    {selectedTenant ? (
                        <Stack spacing={3} data-tenant-details>
                            <Card>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Stack spacing={0.5}>
                                            <Typography variant="h5">{selectedTenant.business_name}</Typography>
                                            {/* <Typography color="text.secondary">{selectedTenant.domain}</Typography>
                                            {selectedTenant.subdomain && (
                                                <Typography color="text.secondary">Subdomain: {selectedTenant.subdomain}</Typography>
                                            )} */}
                                        </Stack>
                                        <Stack direction="row" spacing={1}>
                                            {/* <Button
                                                variant={selectedTenant.is_active ? 'outlined' : 'contained'}
                                                color={selectedTenant.is_active ? 'secondary' : 'success'}
                                                startIcon={selectedTenant.is_active ? <HighlightOff /> : <CheckCircle />}
                                                onClick={handleToggleActive}
                                                disabled={mutationLoading}
                                            >
                                                {selectedTenant.is_active ? 'Deactivate' : 'Activate'}
                                            </Button> */}
                                            <Button
                                                variant="outlined"
                                                startIcon={<Edit />}
                                                onClick={openEditTenantModal}
                                                disabled={mutationLoading}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                startIcon={<Delete />}
                                                onClick={openDeleteTenantModal}
                                                disabled={mutationLoading}
                                            >
                                                Delete
                                            </Button>
                                        </Stack>
                                    </Box>

                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                                        {/* <Chip
                                            label={selectedTenant.is_trial ? 'Trial Tenant' : 'Standard Tenant'}
                                            color={selectedTenant.is_trial ? 'warning' : 'default'}
                                            variant={selectedTenant.is_trial ? 'filled' : 'outlined'}
                                        /> */}
                                        <Typography variant="body2">
                                            Trial Ends:{' '}
                                            {/* {selectedTenant.trial_ends_at
                                                ? new Date(selectedTenant.trial_ends_at).toLocaleString()
                                                : 'Not set'} */}
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            {/* <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={handleToggleTrial}
                                                disabled={mutationLoading}
                                            >
                                                {selectedTenant.is_trial ? 'Mark as Paid' : 'Mark as Trial'}
                                            </Button> */}
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={openEditTenantModal}
                                                disabled={mutationLoading}
                                            >
                                                Adjust Details
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Card>
                                        <CardHeader
                                            avatar={<Analytics color="primary" />}
                                            title="Tenant Analytics Dashboard"
                                            action={
                                                <Stack direction="row" spacing={1}>
                                                    <Button
                                                        size="small"
                                                        variant={analyticsView === 'summary' ? 'contained' : 'outlined'}
                                                        onClick={() => setAnalyticsView('summary')}
                                                    >
                                                        Summary
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant={analyticsView === 'detailed' ? 'contained' : 'outlined'}
                                                        onClick={() => setAnalyticsView('detailed')}
                                                    >
                                                        Detailed
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<Download />}
                                                        onClick={() => {
                                                            if (stats) {
                                                                const data = JSON.stringify(stats, null, 2);
                                                                const blob = new Blob([data], { type: 'application/json' });
                                                                const url = URL.createObjectURL(blob);
                                                                const a = document.createElement('a');
                                                                a.href = url;
                                                                a.download = `${selectedTenant.business_name}-analytics-${new Date().toISOString().split('T')[0]}.json`;
                                                                a.click();
                                                                URL.revokeObjectURL(url);
                                                            }
                                                        }}
                                                    >
                                                        Export
                                                    </Button>
                                                </Stack>
                                            }
                                        />
                                        <CardContent>
                                            {detailLoading && !stats ? (
                                                <Box display="flex" justifyContent="center" py={4}>
                                                    <CircularProgress size={24} />
                                                </Box>
                                            ) : stats ? (
                                                analyticsView === 'summary' ? (
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} sm={6} md={3}>
                                                            <Card variant="outlined">
                                                                <CardContent>
                                                                    <Typography color="text.secondary" variant="body2">
                                                                        Total Users
                                                                    </Typography>
                                                                    <Typography variant="h4">{stats.total_users}</Typography>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6} md={3}>
                                                            <Card variant="outlined">
                                                                <CardContent>
                                                                    <Typography color="text.secondary" variant="body2">
                                                                        Transactions Today
                                                                    </Typography>
                                                                    <Typography variant="h4">{stats.total_transactions.toLocaleString()}</Typography>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6} md={3}>
                                                            <Card variant="outlined">
                                                                <CardContent>
                                                                    <Typography color="text.secondary" variant="body2">
                                                                        API Calls Today
                                                                    </Typography>
                                                                    <Typography variant="h4">{stats.api_calls_today.toLocaleString()}</Typography>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6} md={3}>
                                                            <Card variant="outlined">
                                                                <CardContent>
                                                                    <Typography color="text.secondary" variant="body2">
                                                                        Vendor Wallet Ballance
                                                                    </Typography>
                                                                    <Typography variant="h4">
                                                                        {selectedTenant?.wallet?.balance}
                                                                    </Typography>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    </Grid>
                                                ) : (
                                                    <Stack spacing={2}>
                                                        <Divider />
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} md={6}>
                                                                <Typography variant="subtitle2" gutterBottom>User Statistics</Typography>
                                                                <Typography variant="body2">Total Users: <strong>{stats.total_users}</strong></Typography>
                                                            </Grid>
                                                            <Grid item xs={12} md={6}>
                                                                <Typography variant="subtitle2" gutterBottom>Transaction Statistics</Typography>
                                                                <Typography variant="body2">
                                                                    Transactions Today: <strong>{stats.total_transactions.toLocaleString()}</strong>
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={12} md={6}>
                                                                <Typography variant="subtitle2" gutterBottom>API Usage</Typography>
                                                                <Typography variant="body2">
                                                                    API Calls Today: <strong>{stats.api_calls_today.toLocaleString()}</strong>
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={12} md={6}>
                                                                <Typography variant="subtitle2" gutterBottom>Storage</Typography>
                                                                <Typography variant="body2">
                                                                    Storage Used: <strong>{stats.total_storage_used_mb.toFixed(2)} MB</strong>
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <Typography variant="subtitle2" gutterBottom>Last Activity</Typography>
                                                                <Typography variant="body2">
                                                                    {stats.last_activity ? new Date(stats.last_activity).toLocaleString() : 'No activity recorded'}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </Stack>
                                                )
                                            ) : (
                                                <Typography color="text.secondary">No statistical data available.</Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card>
                                        <CardHeader
                                            avatar={<Assessment color="primary" />}
                                            title="Quick Stats"
                                            subheader={stats ? `Last activity: ${stats.last_activity ? new Date(stats.last_activity).toLocaleString() : 'N/A'}` : 'No data'}
                                        />
                                        <CardContent>
                                            {detailLoading && !selectedTenant ? (
                                                <Box display="flex" justifyContent="center" py={4}>
                                                    <CircularProgress size={24} />
                                                </Box>
                                            ) : selectedTenant ? (
                                                <Stack spacing={1}>
                                                    <Typography variant="body2">Total Users: </Typography>
                                                    <Typography variant="body2">
                                                        Transactions Today: 
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        API Calls Today: 
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Wallet Ballance: {selectedTenant?.wallet?.balance}
                                                    </Typography>
                                                </Stack>
                                            ) : (
                                                <Typography color="text.secondary">No statistical data available.</Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card>
                                        <CardHeader avatar={<People color="primary" />} title="Tenant Admin Profile" />
                                        <CardContent>
                                            {profileLoading ? (
                                                <Box display="flex" justifyContent="center" py={4}>
                                                    <CircularProgress size={24} />
                                                </Box>
                                            ) : selectedTenant ? (
                                                <Stack spacing={1}>
                                                    <Typography variant="body2">
                                                        Admin Email: <strong>{selectedTenant.email}</strong>
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Admin Phone: <strong>{selectedTenant.phone_number}</strong>
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Admin address: <strong>{selectedTenant.address}</strong>
                                                    </Typography>
                                                    
                                                    
                                                    {/* <Typography variant="body2">
                                                        Default Limits: {JSON.stringify(tenants)}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Onboarding Config: {JSON.stringify(selectedTenant)}
                                                    </Typography> */}
                                                </Stack>
                                            ) : (
                                                <Typography color="text.secondary">No admin profile assigned.</Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            <Card>
                                <CardHeader
                                    avatar={<Settings color="primary" />}
                                    title="Tenant Configuration & Settings"
                                    action={
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={handleSaveConfiguration}
                                            disabled={mutationLoading || !configuration}
                                        >
                                            Save Changes
                                        </Button>
                                    }
                                />
                                <CardContent>
                                    {configuration ? (
                                        <Stack spacing={3}>
                                            <Divider />
                                            <Typography variant="subtitle1" fontWeight={600}>Resource Limits</Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={4}>
                                                    <TextField
                                                        label="Max Users"
                                                        value={configDraft.max_users}
                                                        onChange={(event) =>
                                                            setConfigDraft((prev) => ({ ...prev, max_users: event.target.value }))
                                                        }
                                                        type="number"
                                                        fullWidth
                                                        size="small"
                                                        helperText="Maximum number of users allowed"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <TextField
                                                        label="API Rate Limit"
                                                        value={configDraft.api_rate_limit}
                                                        onChange={(event) =>
                                                            setConfigDraft((prev) => ({ ...prev, api_rate_limit: event.target.value }))
                                                        }
                                                        type="number"
                                                        fullWidth
                                                        size="small"
                                                        helperText="API calls per minute"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <TextField
                                                        label="Max Storage (MB)"
                                                        value={configDraft.max_storage_mb || ''}
                                                        onChange={(event) =>
                                                            setConfigDraft((prev) => ({ ...prev, max_storage_mb: event.target.value }))
                                                        }
                                                        type="number"
                                                        fullWidth
                                                        size="small"
                                                        helperText="Maximum storage in megabytes"
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Divider />
                                            <Typography variant="subtitle1" fontWeight={600}>Billing & Subscription</Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Billing Cycle"
                                                        value={configDraft.billing_cycle}
                                                        onChange={(event) =>
                                                            setConfigDraft((prev) => ({ ...prev, billing_cycle: event.target.value }))
                                                        }
                                                        fullWidth
                                                        size="small"
                                                        select
                                                        SelectProps={{ native: true }}
                                                        helperText="Billing frequency"
                                                    >
                                                        <option value="">Select cycle</option>
                                                        <option value="monthly">Monthly</option>
                                                        <option value="quarterly">Quarterly</option>
                                                        <option value="annually">Annually</option>
                                                    </TextField>
                                                </Grid>
                                            </Grid>
                                            <Divider />
                                            <Typography variant="subtitle1" fontWeight={600}>Feature Flags</Typography>
                                            <Stack spacing={1}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={configuration.enable_advanced_analytics ?? false}
                                                            onChange={(e) => {
                                                                if (configuration) {
                                                                    updateConfiguration({ enable_advanced_analytics: e.target.checked });
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    label="Advanced Analytics"
                                                />
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={configuration.enable_api_access ?? false}
                                                            onChange={(e) => {
                                                                if (configuration) {
                                                                    updateConfiguration({ enable_api_access: e.target.checked });
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    label="API Access"
                                                />
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={configuration.enable_webhooks ?? false}
                                                            onChange={(e) => {
                                                                if (configuration) {
                                                                    updateConfiguration({ enable_webhooks: e.target.checked });
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    label="Webhooks"
                                                />
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={configuration.enable_audit_logs ?? false}
                                                            onChange={(e) => {
                                                                if (configuration) {
                                                                    updateConfiguration({ enable_audit_logs: e.target.checked });
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    label="Audit Logs"
                                                />
                                            </Stack>
                                        </Stack>
                                    ) : (
                                        <Typography color="text.secondary">No configuration found for this tenant.</Typography>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader
                                    avatar={<Domain color="primary" />}
                                    title="Tenant Domains"
                                    action={
                                        <Button
                                            size="small"
                                            startIcon={<Add />}
                                            onClick={openDomainModal}
                                            disabled={!selectedTenant || mutationLoading}
                                        >
                                            Add Domain
                                        </Button>
                                    }
                                />
                                <CardContent>
                                    {domains?.length ? (
                                        <List dense>
                                            {domains.map((domain) => (
                                                <ListItem key={domain.id}>
                                                    <ListItemAvatar>
                                                        <Avatar>{domain.domain[0]?.toUpperCase()}</Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={domain.domain}
                                                        secondary={
                                                            <Stack direction="row" spacing={1}>
                                                                <Chip
                                                                    label={domain.is_primary ? 'Primary' : 'Secondary'}
                                                                    color={domain.is_primary ? 'success' : 'default'}
                                                                    size="small"
                                                                />
                                                                <Chip
                                                                    label={domain.is_active ? 'Active' : 'Inactive'}
                                                                    color={domain.is_active ? 'success' : 'default'}
                                                                    size="small"
                                                                />
                                                            </Stack>
                                                        }
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <Stack direction="row" spacing={1}>
                                                            {!domain.is_primary && (
                                                                <Button
                                                                    size="small"
                                                                    onClick={() => updateDomain(domain.id, { is_primary: true })}
                                                                    disabled={mutationLoading}
                                                                >
                                                                    Make Primary
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="small"
                                                                onClick={() =>
                                                                    updateDomain(domain.id, { is_active: !domain.is_active })
                                                                }
                                                                disabled={mutationLoading}
                                                            >
                                                                {domain.is_active ? 'Deactivate' : 'Activate'}
                                                            </Button>
                                                            <IconButton
                                                                edge="end"
                                                                color="error"
                                                                onClick={() => removeDomain(domain.id)}
                                                                disabled={mutationLoading}
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                        </Stack>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography color="text.secondary">No domains configured.</Typography>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader
                                    avatar={<People color="primary" />}
                                    title="Tenant Users Management"
                                    action={
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<Add />}
                                            onClick={() => {
                                                // TODO: Implement add tenant user modal
                                                setError('Add tenant user functionality coming soon');
                                            }}
                                        >
                                            Add User
                                        </Button>
                                    }
                                />
                                <CardContent>
                                    {users?.length ? (
                                        <List dense>
                                            {users.map((user) => (
                                                <ListItem key={user.id} alignItems="flex-start">
                                                    <ListItemAvatar>
                                                        <Avatar>{user.user_email?.[0]?.toUpperCase() ?? '?'}</Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={user.user_email}
                                                        secondary={
                                                            <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
                                                                <Chip label={user.role || 'member'} size="small" />
                                                                <Chip
                                                                    label={user.is_tenant_admin ? 'Admin' : 'User'}
                                                                    size="small"
                                                                    color={user.is_tenant_admin ? 'success' : 'default'}
                                                                />
                                                                <Chip
                                                                    label={user.is_active ? 'Active' : 'Inactive'}
                                                                    size="small"
                                                                    color={user.is_active ? 'success' : 'default'}
                                                                />
                                                            </Stack>
                                                        }
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <Stack direction="row" spacing={1}>
                                                            <Button
                                                                size="small"
                                                                onClick={() => openUserRoleModal(user)}
                                                            >
                                                                Edit Role
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                onClick={() => toggleTenantUserAdmin(user.id)}
                                                                disabled={mutationLoading}
                                                            >
                                                                {user.is_tenant_admin ? 'Revoke Admin' : 'Make Admin'}
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                onClick={() =>
                                                                    updateTenantUser(user.id, { is_active: !user.is_active })
                                                                }
                                                                disabled={mutationLoading}
                                                            >
                                                                {user.is_active ? 'Suspend' : 'Activate'}
                                                            </Button>
                                                            <IconButton
                                                                edge="end"
                                                                color="error"
                                                                onClick={() => removeTenantUser(user.id)}
                                                                disabled={mutationLoading}
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                        </Stack>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography color="text.secondary">No tenant users found.</Typography>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader avatar={<Security color="primary" />} title="Vendor Hierarchy Overview" />
                                <CardContent>
                                    <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                                        <Chip label={`Total Orgs: ${vendorSummary.total}`} size="small" />
                                        <Chip label={`Vendors: ${vendorSummary.vendors}`} size="small" />
                                        <Chip label={`Sub-vendors: ${vendorSummary.subVendors}`} size="small" />
                                        <Chip label={`Agents: ${vendorSummary.agents}`} size="small" />
                                        <Chip label={`Cashiers: ${vendorSummary.cashiers}`} size="small" />
                                    </Stack>
                                    {tree && tree.length > 0 ? (
                                        <List dense>
                                            {tree.map((org) => (
                                                <ListItemButton
                                                    key={org.id}
                                                    selected={org.id === selectedOrgId}
                                                    onClick={() => selectOrg(org.id)}
                                                >
                                                    <ListItemText
                                                        primary={org.name}
                                                        secondary={
                                                            <Stack direction="row" spacing={1}>
                                                                <Chip label={org.level} size="small" />
                                                                <Chip label={org.status} size="small" />
                                                            </Stack>
                                                        }
                                                    />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography color="text.secondary">
                                            No vendor organisations have been created for this tenant.
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader
                                    avatar={<Key color="primary" />}
                                    title="Vendor API Keys"
                                    subheader={selectedOrg ? selectedOrg.name : 'Select an organisation to manage keys'}
                                />
                                <CardContent>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center" mb={2}>
                                        <TextField
                                            label="Scopes"
                                            value={scopesInput}
                                            onChange={(event) => setScopesInput(event.target.value)}
                                            size="small"
                                            helperText="Comma-separated scopes"
                                            fullWidth
                                            disabled={!selectedOrgId}
                                        />
                                        <TextField
                                            label="Expires At"
                                            value={expiresInput}
                                            onChange={(event) => setExpiresInput(event.target.value)}
                                            size="small"
                                            helperText="Optional ISO timestamp"
                                            fullWidth
                                            disabled={!selectedOrgId}
                                        />
                                        <Button
                                            variant="contained"
                                            startIcon={<Add />}
                                            onClick={() =>
                                                handleCreateKey(
                                                    scopesInput
                                                        .split(',')
                                                        .map((scope) => scope.trim())
                                                        .filter(Boolean),
                                                    expiresInput || undefined
                                                )
                                            }
                                            disabled={!selectedOrgId || keysLoading}
                                        >
                                            Issue Key
                                        </Button>
                                    </Stack>
                                    {!selectedOrgId ? (
                                        <Typography color="text.secondary">
                                            Select an organisation in the vendor tree to manage API keys.
                                        </Typography>
                                    ) : keysLoading && !keys?.length ? (
                                        <Box display="flex" justifyContent="center" py={4}>
                                            <CircularProgress size={24} />
                                        </Box>
                                    ) : keys?.length ? (
                                        <List dense>
                                            {keys.map((key) => (
                                                <React.Fragment key={key.id}>
                                                    <ListItem
                                                        secondaryAction={
                                                            <Stack direction="row" spacing={1}>
                                                                <Tooltip title="Rotate Key">
                                                                    <IconButton onClick={() => rotateKey(key.id)}>
                                                                        <Loop />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Revoke Key">
                                                                    <IconButton onClick={() => revokeKey(key.id)}>
                                                                        <Key />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="View Audit">
                                                                    <IconButton onClick={() => openAuditDialog(key.id, key.key_id)}>
                                                                        <Visibility />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Delete">
                                                                    <IconButton color="error" onClick={() => removeKey(key.id)}>
                                                                        <Delete />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        }
                                                    >
                                                        <ListItemText
                                                            primary={key.key_id}
                                                            secondary={
                                                                <Stack direction="row" spacing={1}>
                                                                    <Chip
                                                                        label={key.is_active ? 'Active' : 'Inactive'}
                                                                        color={key.is_active ? 'success' : 'default'}
                                                                        size="small"
                                                                    />
                                                                    {key.expires_at && (
                                                                        <Chip
                                                                            label={`Expires: ${new Date(key.expires_at).toLocaleString()}`}
                                                                            size="small"
                                                                        />
                                                                    )}
                                                                </Stack>
                                                            }
                                                        />
                                                    </ListItem>
                                                    <Divider component="li" />
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography color="text.secondary">No API keys issued.</Typography>
                                    )}
                                    {lastIssuedSecret && (
                                        <Alert
                                            severity="success"
                                            sx={{ mt: 2 }}
                                            action={
                                                <Tooltip title="Copy secret">
                                                    <IconButton
                                                        color="inherit"
                                                        onClick={() =>
                                                            navigator.clipboard.writeText(
                                                                `${lastIssuedSecret.key_id}.${lastIssuedSecret.secret}`
                                                            )
                                                        }
                                                    >
                                                        <ContentCopy />
                                                    </IconButton>
                                                </Tooltip>
                                            }
                                            onClose={() => setLastIssuedSecret(null)}
                                        >
                                            <Typography variant="subtitle2">API key issued</Typography>
                                            <Typography variant="body2">
                                                Secret: {lastIssuedSecret.key_id}.{lastIssuedSecret.secret}
                                            </Typography>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </Stack>
                    ) : loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary">
                                    Select a tenant from the list to view details and manage settings.
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
            </Grid>

            <TenantFormModal
                open={tenantModalState.open}
                mode={tenantModalState.mode}
                loading={mutationLoading}
                initialValues={
                    tenantModalState.mode === 'edit' && tenantModalState.tenant
                        ? {
                            name: tenantModalState.tenant.business_name,
                            // slug: tenantModalState.tenant.slug,
                            // domain: tenantModalState.tenant.domain,
                            // subdomain: tenantModalState.tenant.subdomain ?? '',
                            // isTrial: tenantModalState.tenant.is_trial,
                            // trialEndsAt: tenantModalState.tenant.trial_ends_at ?? '',
                            // isActive: tenantModalState.tenant.is_active,
                        }
                        : undefined
                }
                submitDisabled={!canCreateTenant && tenantModalState.mode === 'create'}
                submitDisabledMessage={
                    tenantModalState.mode === 'create' && !canCreateTenant ? tenantCreateDisabledMessage : undefined
                }
                onClose={closeTenantModal}
                onSubmit={handleTenantModalSubmit}
            />

            <TenantDomainModal
                open={domainModalOpen}
                loading={mutationLoading}
                onClose={closeDomainModal}
                onSubmit={handleDomainModalSubmit}
            />

            <TenantUserRoleModal
                open={userRoleModalState.open}
                loading={mutationLoading}
                initialValues={
                    userRoleModalState.user
                        ? {
                            role: userRoleModalState.user.role || 'member',
                            isTenantAdmin: userRoleModalState.user.is_tenant_admin,
                            isActive: userRoleModalState.user.is_active,
                        }
                        : undefined
                }
                onClose={closeUserRoleModal}
                onSubmit={handleUserRoleSubmit}
            />

            <ConfirmDialog
                open={deleteTenantOpen}
                title="Delete Tenant"
                description="Are you sure you want to delete this tenant? This action cannot be undone."
                confirmLabel="Delete"
                loading={mutationLoading}
                onClose={closeDeleteTenantModal}
                onConfirm={async () => {
                    try {
                        await handleDeleteTenant();
                        closeDeleteTenantModal();
                    } catch (error) {
                        console.error('Failed to delete tenant', error);
                    }
                }}
            />

            {/* Bulk Action Confirmation Dialog */}
            <Dialog open={bulkActionDialogOpen} onClose={closeBulkActionDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Confirm Bulk Action: {bulkAction === 'activate' ? 'Activate' : bulkAction === 'deactivate' ? 'Deactivate' : 'Delete'} Tenants
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        You are about to {bulkAction === 'activate' ? 'activate' : bulkAction === 'deactivate' ? 'deactivate' : 'delete'}{' '}
                        <strong>{selectedTenants.size}</strong> tenant{selectedTenants.size !== 1 ? 's' : ''}.
                    </Typography>
                    {bulkAction === 'delete' && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            This action cannot be undone. All tenant data will be permanently deleted.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeBulkActionDialog}>Cancel</Button>
                    <Button
                        onClick={handleBulkAction}
                        variant="contained"
                        color={bulkAction === 'delete' ? 'error' : 'primary'}
                        disabled={mutationLoading}
                    >
                        Confirm {bulkAction === 'activate' ? 'Activation' : bulkAction === 'deactivate' ? 'Deactivation' : 'Deletion'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ApiKeyAuditDialog
                open={auditModalState.open}
                keyLabel={auditModalState.keyLabel}
                entries={auditEntries}
                loading={keysLoading}
                onClose={closeAuditDialog}
                onRefresh={async () => {
                    if (auditModalState.keyId) {
                        await loadAudit(auditModalState.keyId);
                    }
                }}
            />
        </Box>
    );
};

export default TenantAdmin;
