import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Alert,
    Switch,
    FormControlLabel,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Tooltip,
    Autocomplete,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Search,
    Refresh,
    CheckCircle,
    Cancel,
    Key,
    People,
    Settings,
    Visibility,
    VisibilityOff,
    ContentCopy,
    VerifiedUser,
    Domain,
} from '@mui/icons-material';
import {
    fetchVendors,
    fetchVendor,
    createVendor,
    updateVendor,
    deleteVendor,
    verifyVendor,
    fetchVendorApiKeys,
    createVendorApiKey,
    fetchVendorAdmins,
    createVendorAdmin,
    fetchVendorPermissions,
    updateVendorPermissions,
    type Vendor,
    type VendorForm,
    type VendorAdminProfile,
    type VendorPermissions,
} from '../../services/vendorService';
import { useTenants } from '../../hooks/useTenants';
import { del } from '../../services/api';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const VendorManagement: React.FC = () => {
    const { tenants, selectedTenantId, selectedTenant, selectTenant } = useTenants();
    const [tabValue, setTabValue] = useState(0);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState<boolean | null>(null);
    const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
    const [tenantSearchTerm, setTenantSearchTerm] = useState('');

    // Dialog states
    const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [vendorForm, setVendorForm] = useState<Partial<VendorForm>>({});
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    // Detail view states
    const [vendorApiKeys, setVendorApiKeys] = useState<any[]>([]);
    const [vendorAdmins, setVendorAdmins] = useState<VendorAdminProfile[]>([]);
    const [vendorPermissions, setVendorPermissions] = useState<VendorPermissions | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // API Key management
    const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
    const [newApiKey, setNewApiKey] = useState<any>(null);
    const [showApiKeySecret, setShowApiKeySecret] = useState(false);

    // Load vendors
    const loadVendors = async () => {
        if (!selectedTenantId) return;

        setLoading(true);
        setError(null);
        try {
            const params: any = { tenant: selectedTenantId };
            if (filterActive !== null) params.is_active = filterActive;
            if (filterVerified !== null) params.is_verified = filterVerified;
            if (searchTerm) params.search = searchTerm;

            const data = await fetchVendors(params);
            setVendors(data);
        } catch (err: any) {
            setError(err?.message || 'Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVendors();
    }, [selectedTenantId, filterActive, filterVerified, searchTerm]);

    // Load vendor details
    const loadVendorDetails = async (vendorId: string) => {
        setDetailLoading(true);
        try {
            const [vendor, apiKeys, admins, permissions] = await Promise.all([
                fetchVendor(vendorId),
                fetchVendorApiKeys(vendorId),
                fetchVendorAdmins(vendorId),
                fetchVendorPermissions(vendorId),
            ]);
            setSelectedVendor(vendor);
            setVendorApiKeys(apiKeys);
            setVendorAdmins(admins);
            setVendorPermissions(permissions);
        } catch (err: any) {
            setError(err?.message || 'Failed to load vendor details');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCreateClick = () => {
        setFormMode('create');
        setVendorForm({
            tenant: selectedTenantId || undefined,
            name: '',
            email: '',
            is_active: true,
        });
        setVendorDialogOpen(true);
    };

    const handleEditClick = (vendor: Vendor) => {
        setFormMode('edit');
        setVendorForm({
            name: vendor.name,
            email: vendor.email,
            phone: vendor.phone || '',
            address: vendor.address || '',
            city: vendor.city || '',
            state: vendor.state || '',
            country: vendor.country || '',
            postal_code: vendor.postal_code || '',
            is_active: vendor.is_active,
            is_verified: vendor.is_verified,
            metadata: vendor.metadata,
        });
        setSelectedVendor(vendor);
        setVendorDialogOpen(true);
    };

    const handleSaveVendor = async () => {
        if (!vendorForm.name || !vendorForm.email) {
            setError('Name and email are required');
            return;
        }

        try {
            if (formMode === 'create') {
                await createVendor(vendorForm as VendorForm);
            } else if (selectedVendor) {
                await updateVendor(selectedVendor.id, vendorForm);
            }
            setVendorDialogOpen(false);
            loadVendors();
            if (selectedVendor) {
                loadVendorDetails(selectedVendor.id);
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to save vendor');
        }
    };

    const handleDeleteVendor = async () => {
        if (!selectedVendor) return;

        try {
            await deleteVendor(selectedVendor.id);
            setDeleteDialogOpen(false);
            setSelectedVendor(null);
            loadVendors();
        } catch (err: any) {
            setError(err?.message || 'Failed to delete vendor');
        }
    };

    const handleVerifyVendor = async (vendor: Vendor) => {
        try {
            await verifyVendor(vendor.id);
            loadVendors();
            if (selectedVendor?.id === vendor.id) {
                loadVendorDetails(vendor.id);
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to verify vendor');
        }
    };

    const handleCreateApiKey = async () => {
        if (!selectedVendor) return;

        try {
            const key = await createVendorApiKey(selectedVendor.id, {});
            setNewApiKey(key);
            setApiKeyDialogOpen(true);
            loadVendorDetails(selectedVendor.id);
        } catch (err: any) {
            setError(err?.message || 'Failed to create API key');
        }
    };

    const handleCopyApiKey = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const filteredVendors = useMemo(() => {
        if (!vendors || !Array.isArray(vendors)) return [];
        return vendors.filter(v => {
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                return (
                    v.name.toLowerCase().includes(search) ||
                    v.email.toLowerCase().includes(search) ||
                    v.slug.toLowerCase().includes(search) ||
                    (v.phone && v.phone.includes(search))
                );
            }
            return true;
        });
    }, [vendors, searchTerm]);

    // Filtered tenants for search
    const filteredTenants = useMemo(() => {
        if (!tenants || !Array.isArray(tenants)) return [];
        if (!tenantSearchTerm.trim()) return tenants;
        const term = tenantSearchTerm.toLowerCase();
        return tenants.filter(
            (t) =>
                t.name.toLowerCase().includes(term) ||
                t.domain.toLowerCase().includes(term) ||
                t.slug.toLowerCase().includes(term)
        );
    }, [tenants, tenantSearchTerm]);

    return (
        <Box p={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Vendor Management</Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={loadVendors}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleCreateClick}
                        disabled={!selectedTenantId}
                        title={!selectedTenantId ? 'Please select a tenant first' : 'Create new vendor'}
                    >
                        Create Vendor
                    </Button>
                </Stack>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Tenant Selection */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack spacing={2}>
                        <Typography variant="h6">Select Tenant</Typography>
                        <Autocomplete
                            options={filteredTenants}
                            getOptionLabel={(option) => `${option.name} (${option.domain})`}
                            value={selectedTenant || null}
                            onChange={(_, newValue) => {
                                if (newValue) {
                                    selectTenant(newValue.id);
                                }
                            }}
                            onInputChange={(_, newValue) => {
                                setTenantSearchTerm(newValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Search tenants..."
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <>
                                                <InputAdornment position="start">
                                                    <Domain />
                                                </InputAdornment>
                                                {params.InputProps.startAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            loading={loading}
                            noOptionsText={
                                tenantSearchTerm.length > 0
                                    ? 'No tenants found'
                                    : 'No tenants available'
                            }
                        />
                        {selectedTenant && (
                            <Alert severity="success" sx={{ mt: 1 }}>
                                Managing vendors for: <strong>{selectedTenant.name}</strong>
                            </Alert>
                        )}
                        {!selectedTenantId && (
                            <Alert severity="info" sx={{ mt: 1 }}>
                                Please select a tenant to view and manage vendors
                            </Alert>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {!selectedTenantId && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    No tenant selected. Please select a tenant above to manage vendors.
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Vendor List */}
                <Grid item xs={12} md={selectedVendor ? 5 : 12}>
                    <Card>
                        <CardContent>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    placeholder="Search vendors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Stack direction="row" spacing={2}>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={filterActive === null ? 'all' : filterActive ? 'active' : 'inactive'}
                                            label="Status"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFilterActive(val === 'all' ? null : val === 'active');
                                            }}
                                        >
                                            <MenuItem value="all">All</MenuItem>
                                            <MenuItem value="active">Active</MenuItem>
                                            <MenuItem value="inactive">Inactive</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Verified</InputLabel>
                                        <Select
                                            value={filterVerified === null ? 'all' : filterVerified ? 'yes' : 'no'}
                                            label="Verified"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFilterVerified(val === 'all' ? null : val === 'yes');
                                            }}
                                        >
                                            <MenuItem value="all">All</MenuItem>
                                            <MenuItem value="yes">Verified</MenuItem>
                                            <MenuItem value="no">Not Verified</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Stack>

                                {!selectedTenantId ? (
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                        Please select a tenant above to view vendors
                                    </Alert>
                                ) : loading ? (
                                    <Box display="flex" justifyContent="center" p={4}>
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Email</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredVendors.map((vendor) => (
                                                    <TableRow
                                                        key={vendor.id}
                                                        hover
                                                        selected={selectedVendor?.id === vendor.id}
                                                        onClick={() => {
                                                            setSelectedVendor(vendor);
                                                            loadVendorDetails(vendor.id);
                                                            setTabValue(0);
                                                        }}
                                                        sx={{ cursor: 'pointer' }}
                                                    >
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Typography variant="body2">{vendor.name}</Typography>
                                                                {vendor.is_verified && (
                                                                    <Tooltip title="Verified">
                                                                        <VerifiedUser fontSize="small" color="primary" />
                                                                    </Tooltip>
                                                                )}
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>{vendor.email}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={vendor.is_active ? 'Active' : 'Inactive'}
                                                                color={vendor.is_active ? 'success' : 'default'}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditClick(vendor);
                                                                    }}
                                                                >
                                                                    <Edit fontSize="small" />
                                                                </IconButton>
                                                                {!vendor.is_verified && (
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleVerifyVendor(vendor);
                                                                        }}
                                                                    >
                                                                        <CheckCircle fontSize="small" />
                                                                    </IconButton>
                                                                )}
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}

                                {!loading && !filteredVendors?.length && (
                                    <Typography color="text.secondary" align="center" p={2}>
                                        No vendors found
                                    </Typography>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Vendor Details */}
                {selectedVendor && (
                    <Grid item xs={12} md={7}>
                        <Card>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6">{selectedVendor.name}</Typography>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton size="small" onClick={() => handleEditClick(selectedVendor)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => setDeleteDialogOpen(true)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Stack>
                                </Stack>

                                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                                    <Tab label="Details" />
                                    <Tab label="API Keys" />
                                    <Tab label="Admins" />
                                    <Tab label="Permissions" />
                                </Tabs>

                                {detailLoading ? (
                                    <Box display="flex" justifyContent="center" p={4}>
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <>
                                        <TabPanel value={tabValue} index={0}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="caption" color="text.secondary">Email</Typography>
                                                    <Typography>{selectedVendor.email}</Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                                                    <Typography>{selectedVendor.phone || 'N/A'}</Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="caption" color="text.secondary">Status</Typography>
                                                    <Chip
                                                        label={selectedVendor.is_active ? 'Active' : 'Inactive'}
                                                        color={selectedVendor.is_active ? 'success' : 'default'}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="caption" color="text.secondary">Verified</Typography>
                                                    <Chip
                                                        label={selectedVendor.is_verified ? 'Verified' : 'Not Verified'}
                                                        color={selectedVendor.is_verified ? 'success' : 'default'}
                                                        size="small"
                                                    />
                                                </Grid>
                                                {selectedVendor.address && (
                                                    <Grid item xs={12}>
                                                        <Typography variant="caption" color="text.secondary">Address</Typography>
                                                        <Typography>
                                                            {[
                                                                selectedVendor.address,
                                                                selectedVendor.city,
                                                                selectedVendor.state,
                                                                selectedVendor.country,
                                                                selectedVendor.postal_code,
                                                            ].filter(Boolean).join(', ')}
                                                        </Typography>
                                                    </Grid>
                                                )}
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="caption" color="text.secondary">Organisations</Typography>
                                                    <Typography>{selectedVendor.organisation_count || 0}</Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="caption" color="text.secondary">Admins</Typography>
                                                    <Typography>{selectedVendor.admin_count || 0}</Typography>
                                                </Grid>
                                            </Grid>
                                        </TabPanel>

                                        <TabPanel value={tabValue} index={1}>
                                            <Stack spacing={2}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="subtitle1">API Keys</Typography>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<Add />}
                                                        onClick={handleCreateApiKey}
                                                    >
                                                        Create Key
                                                    </Button>
                                                </Stack>

                                                {!vendorApiKeys?.length ? (
                                                    <Typography color="text.secondary">No API keys</Typography>
                                                ) : (
                                                    <List>
                                                        {(vendorApiKeys || []).map((key) => (
                                                            <ListItem key={key.id}>
                                                                <ListItemText
                                                                    primary={key.key_id}
                                                                    secondary={
                                                                        <Stack spacing={0.5}>
                                                                            <Typography variant="caption">
                                                                                Scopes: {key.scopes?.join(', ') || 'All'}
                                                                            </Typography>
                                                                            {key.expires_at && (
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Expires: {new Date(key.expires_at).toLocaleDateString()}
                                                                                </Typography>
                                                                            )}
                                                                            {key.last_used_at && (
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Last used: {new Date(key.last_used_at).toLocaleString()}
                                                                                </Typography>
                                                                            )}
                                                                        </Stack>
                                                                    }
                                                                />
                                                                <ListItemSecondaryAction>
                                                                    <Stack direction="row" spacing={1}>
                                                                        <Chip
                                                                            label={key.is_active ? 'Active' : 'Inactive'}
                                                                            color={key.is_active ? 'success' : 'default'}
                                                                            size="small"
                                                                        />
                                                                        <IconButton
                                                                            size="small"
                                                                            color="error"
                                                                            onClick={async () => {
                                                                                if (window.confirm('Are you sure you want to revoke this API key?')) {
                                                                                    try {
                                                                                        await del(`/core/api-keys/${key.id}/`);
                                                                                        loadVendorDetails(selectedVendor.id);
                                                                                    } catch (err: any) {
                                                                                        setError(err?.message || 'Failed to revoke API key');
                                                                                    }
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Delete />
                                                                        </IconButton>
                                                                    </Stack>
                                                                </ListItemSecondaryAction>
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                )}
                                            </Stack>
                                        </TabPanel>

                                        <TabPanel value={tabValue} index={2}>
                                            <Stack spacing={2}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="subtitle1">Vendor Admins</Typography>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<Add />}
                                                        onClick={() => {
                                                            // TODO: Implement add admin dialog
                                                            setError('Add admin functionality coming soon');
                                                        }}
                                                    >
                                                        Add Admin
                                                    </Button>
                                                </Stack>
                                                {!vendorAdmins?.length ? (
                                                    <Typography color="text.secondary">No admins assigned</Typography>
                                                ) : (
                                                    <List>
                                                        {(vendorAdmins || []).map((admin) => (
                                                            <ListItem key={admin.id}>
                                                                <ListItemText
                                                                    primary={admin.user_email || admin.user_name}
                                                                    secondary={
                                                                        <Stack spacing={0.5}>
                                                                            <Typography variant="caption">
                                                                                {admin.title || 'Admin'}
                                                                            </Typography>
                                                                            {admin.department && (
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    {admin.department}
                                                                                </Typography>
                                                                            )}
                                                                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                                                                {admin.can_manage_users && (
                                                                                    <Chip label="Manage Users" size="small" variant="outlined" />
                                                                                )}
                                                                                {admin.can_manage_organisations && (
                                                                                    <Chip label="Manage Orgs" size="small" variant="outlined" />
                                                                                )}
                                                                                {admin.can_view_analytics && (
                                                                                    <Chip label="Analytics" size="small" variant="outlined" />
                                                                                )}
                                                                            </Stack>
                                                                        </Stack>
                                                                    }
                                                                />
                                                                <ListItemSecondaryAction>
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={async () => {
                                                                            if (window.confirm('Are you sure you want to remove this admin?')) {
                                                                                try {
                                                                                    await del(`/vendors/vendor-admins/${admin.id}/`);
                                                                                    loadVendorDetails(selectedVendor.id);
                                                                                } catch (err: any) {
                                                                                    setError(err?.message || 'Failed to remove admin');
                                                                                }
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Delete />
                                                                    </IconButton>
                                                                </ListItemSecondaryAction>
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                )}
                                            </Stack>
                                        </TabPanel>

                                        <TabPanel value={tabValue} index={3}>
                                            {vendorPermissions && (
                                                <Stack spacing={2}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={vendorPermissions.is_active}
                                                                onChange={async (e) => {
                                                                    const updated = {
                                                                        ...vendorPermissions,
                                                                        is_active: e.target.checked,
                                                                    };
                                                                    try {
                                                                        await updateVendorPermissions(selectedVendor.id, updated);
                                                                        setVendorPermissions(updated);
                                                                    } catch (err: any) {
                                                                        setError(err?.message || 'Failed to update permissions');
                                                                    }
                                                                }}
                                                            />
                                                        }
                                                        label="Active"
                                                    />
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={vendorPermissions.is_verified}
                                                                onChange={async (e) => {
                                                                    const updated = {
                                                                        ...vendorPermissions,
                                                                        is_verified: e.target.checked,
                                                                    };
                                                                    try {
                                                                        await updateVendorPermissions(selectedVendor.id, updated);
                                                                        setVendorPermissions(updated);
                                                                    } catch (err: any) {
                                                                        setError(err?.message || 'Failed to update permissions');
                                                                    }
                                                                }}
                                                            />
                                                        }
                                                        label="Verified"
                                                    />
                                                    <Divider />
                                                    <Typography variant="subtitle2">Metadata</Typography>
                                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                                        <TextField
                                                            fullWidth
                                                            multiline
                                                            rows={8}
                                                            value={JSON.stringify(vendorPermissions.metadata, null, 2)}
                                                            onChange={async (e) => {
                                                                try {
                                                                    const parsed = JSON.parse(e.target.value);
                                                                    const updated = {
                                                                        ...vendorPermissions,
                                                                        metadata: parsed,
                                                                    };
                                                                    await updateVendorPermissions(selectedVendor.id, updated);
                                                                    setVendorPermissions(updated);
                                                                } catch (err) {
                                                                    // Invalid JSON, don't update
                                                                }
                                                            }}
                                                            helperText="Edit JSON metadata (must be valid JSON)"
                                                            sx={{ fontFamily: 'monospace' }}
                                                        />
                                                    </Paper>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => {
                                                            const newMetadata = { ...vendorPermissions.metadata, updated_at: new Date().toISOString() };
                                                            const updated = { ...vendorPermissions, metadata: newMetadata };
                                                            updateVendorPermissions(selectedVendor.id, updated).then(() => {
                                                                setVendorPermissions(updated);
                                                            }).catch((err: any) => {
                                                                setError(err?.message || 'Failed to update metadata');
                                                            });
                                                        }}
                                                    >
                                                        Save Metadata
                                                    </Button>
                                                </Stack>
                                            )}
                                        </TabPanel>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

            {/* Create/Edit Vendor Dialog */}
            <Dialog open={vendorDialogOpen} onClose={() => setVendorDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{formMode === 'create' ? 'Create Vendor' : 'Edit Vendor'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Name"
                            value={vendorForm.name || ''}
                            onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={vendorForm.email || ''}
                            onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Phone"
                            value={vendorForm.phone || ''}
                            onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Address"
                            value={vendorForm.address || ''}
                            onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    label="City"
                                    value={vendorForm.city || ''}
                                    onChange={(e) => setVendorForm({ ...vendorForm, city: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="State"
                                    value={vendorForm.state || ''}
                                    onChange={(e) => setVendorForm({ ...vendorForm, state: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Country"
                                    value={vendorForm.country || ''}
                                    onChange={(e) => setVendorForm({ ...vendorForm, country: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Postal Code"
                                    value={vendorForm.postal_code || ''}
                                    onChange={(e) => setVendorForm({ ...vendorForm, postal_code: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={vendorForm.is_active ?? true}
                                    onChange={(e) => setVendorForm({ ...vendorForm, is_active: e.target.checked })}
                                />
                            }
                            label="Active"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setVendorDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveVendor}>
                        {formMode === 'create' ? 'Create' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Vendor</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete {selectedVendor?.name}? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteVendor}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* API Key Secret Dialog */}
            <Dialog open={apiKeyDialogOpen} onClose={() => setApiKeyDialogOpen(false)}>
                <DialogTitle>API Key Created</DialogTitle>
                <DialogContent>
                    {newApiKey && (
                        <Stack spacing={2}>
                            <Alert severity="warning">
                                Save this secret now. You won't be able to see it again!
                            </Alert>
                            <TextField
                                label="Key ID"
                                value={newApiKey.key_id || ''}
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <IconButton onClick={() => handleCopyApiKey(newApiKey.key_id)}>
                                            <ContentCopy />
                                        </IconButton>
                                    ),
                                }}
                            />
                            {newApiKey.secret && (
                                <TextField
                                    label="Secret"
                                    type={showApiKeySecret ? 'text' : 'password'}
                                    value={newApiKey.secret}
                                    fullWidth
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowApiKeySecret(!showApiKeySecret)}>
                                                    {showApiKeySecret ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                                <IconButton onClick={() => handleCopyApiKey(newApiKey.secret)}>
                                                    <ContentCopy />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setApiKeyDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default VendorManagement;

