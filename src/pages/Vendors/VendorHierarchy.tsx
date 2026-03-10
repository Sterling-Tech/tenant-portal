import React, { useState, useMemo, useCallback } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Stack,
    Alert,
    CircularProgress,
    IconButton,
    Menu,
    MenuItem,
    Chip,
    Paper,
    Divider,
    FormControl,
    InputLabel,
    Select,
    TextField,
    InputAdornment,
    Autocomplete,
    Grid,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    MoreVert,
    AccountTree,
    PersonAdd,
    Refresh,
    Search,
    Business,
    Domain,
    ExpandLess,
    ExpandMore,
} from '@mui/icons-material';
import { useVendorHierarchy } from '../../contexts/VendorContext';
import { useTenants } from '../../hooks/useTenants';
import { useOrgBindings } from '../../hooks/useOrgBindings';
import { useOrgWallets } from '../../hooks/useOrgWallets';
import { VendorOrg, VendorOrgLevel, VendorOrgStatus, VendorRoleBinding, BindingForm } from '../../types/vendor';
import { tenantService } from '../../services/tenantService';
import type { Tenant } from '../../services/tenantService';
import AddVendorAdminModal from '../../components/VendorHierarchy/AddVendorAdminModal';
import AddChildOrgModal from '../../components/VendorHierarchy/AddChildOrgModal';
import EditOrgModal from '../../components/VendorHierarchy/EditOrgModal';
import DeleteOrgModal from '../../components/VendorHierarchy/DeleteOrgModal';
import AssignUserModal from '../../components/VendorHierarchy/AssignUserModal';

const VendorHierarchy: React.FC = () => {
    const { tenants, selectedTenantId, selectTenant } = useTenants();
    const {
        tenantId,
        setTenantId,
        tree,
        loading,
        error,
        selectedOrgId,
        selectedOrg,
        refresh,
        selectOrg,
        createOrg,
        updateOrg,
        removeOrg,
    } = useVendorHierarchy();
    const { bindings, loading: bindingsLoading, refresh: refreshBindings } = useOrgBindings(selectedOrgId);
    const { wallets, loading: walletsLoading, totalBalance } = useOrgWallets(selectedOrgId);

    // Modal states
    const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);
    const [addChildModalOpen, setAddChildModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [assignUserModalOpen, setAssignUserModalOpen] = useState(false);

    // Context menu state
    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
        org: VendorOrg | null;
    } | null>(null);

    // Search state
    const [tenantSearchTerm, setTenantSearchTerm] = useState('');
    const [orgSearchTerm, setOrgSearchTerm] = useState('');

    // Sync tenant selection - only when selectedTenantId changes
    React.useEffect(() => {
        if (selectedTenantId && selectedTenantId !== tenantId) {
            console.log('[VendorHierarchy] Syncing tenant selection:', selectedTenantId);
            setTenantId(selectedTenantId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTenantId]);

    // Auto-Select Vendor if available but not set - run once on mount
    React.useEffect(() => {
        if (!tenantId && !selectedTenantId && tenants?.length > 0) {
            console.log('[VendorHierarchy] Auto-selecting first tenant:', tenants[0].id);
            selectTenant(tenants[0].id);
            setTenantId(tenants[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenants?.length]);

    // Filtered tenants for search
    const filteredTenants = useMemo(() => {
        if (!tenants || !Array.isArray(tenants)) return [];
        if (!tenantSearchTerm.trim()) return tenants;
        const term = tenantSearchTerm.toLowerCase();
        return tenants.filter(
            (t) =>
                t.business_name.toLowerCase().includes(term)
            //  ||
            //     t.domain.toLowerCase().includes(term) ||
            //     t.slug.toLowerCase().includes(term)
        );
    }, [tenants, tenantSearchTerm]);

    // Filtered tree for search
    const filteredTree = useMemo(() => {
        if (!tree || !Array.isArray(tree)) return [];
        if (!orgSearchTerm.trim()) return tree;
        const term = orgSearchTerm.toLowerCase();
        const filterOrg = (org: VendorOrg): VendorOrg | null => {
            const matches = org.name.toLowerCase().includes(term) || org.slug.toLowerCase().includes(term);
            const filteredChildren = org.children?.map(filterOrg).filter((c): c is VendorOrg => c !== null) || [];
            if (matches || filteredChildren.length > 0) {
                return { ...org, children: filteredChildren };
            }
            return null;
        };
        return tree.map(filterOrg).filter((o): o is VendorOrg => o !== null);
    }, [tree, orgSearchTerm]);

    const handleContextMenu = (event: React.MouseEvent, org: VendorOrg) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX - 2,
                    mouseY: event.clientY - 4,
                    org,
                }
                : null
        );
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleAddChild = (org: VendorOrg | null) => {
        setContextMenu(null);
        if (org) {
            selectOrg(org.id);
        }
        setAddChildModalOpen(true);
    };

    const handleEdit = (org: VendorOrg) => {
        setContextMenu(null);
        selectOrg(org.id);
        setEditModalOpen(true);
    };

    const handleDelete = (org: VendorOrg) => {
        setContextMenu(null);
        selectOrg(org.id);
        setDeleteModalOpen(true);
    };

    const handleAddAdmin = (org: VendorOrg | null) => {
        setContextMenu(null);
        if (org) {
            selectOrg(org.id);
        }
        setAddAdminModalOpen(true);
    };

    const handleAssignUser = (org: VendorOrg | null) => {
        setContextMenu(null);
        if (org) {
            selectOrg(org.id);
        }
        setAssignUserModalOpen(true);
    };

    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const toggleExpand = (orgId: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(orgId)) {
                next.delete(orgId);
            } else {
                next.add(orgId);
            }
            return next;
        });
    };

    const renderTreeItem = (org: VendorOrg, level: number = 0): React.ReactNode => {
        const isSelected = selectedOrgId === org.id;
        const isExpanded = expanded.has(org.id);
        const hasChildren = org.children && org.children.length > 0;

        return (
            <React.Fragment key={org.id}>
                <ListItem
                    disablePadding
                    sx={{
                        pl: level * 2,
                        bgcolor: isSelected ? 'action.selected' : 'transparent',
                        '&:hover': {
                            bgcolor: 'action.hover',
                        },
                    }}
                    onContextMenu={(e) => handleContextMenu(e, org)}
                >
                    <ListItemButton
                        onClick={() => selectOrg(org.id)}
                        sx={{ py: 0.5 }}
                    >
                        {hasChildren && (
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(org.id);
                                }}
                                sx={{ mr: 0.5 }}
                            >
                                {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                            </IconButton>
                        )}
                        {!hasChildren && <Box sx={{ width: 24 }} />}
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <AccountTree fontSize="small" color={isSelected ? 'primary' : 'action'} />
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2" fontWeight={isSelected ? 600 : 400}>
                                        {org.name}
                                    </Typography>
                                    <Chip
                                        label={org.level}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                    />
                                    <Chip
                                        label={org.status}
                                        size="small"
                                        color={org.status === 'active' ? 'success' : 'default'}
                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                    />
                                </Stack>
                            }
                        />
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleContextMenu(e, org);
                            }}
                        >
                            <MoreVert fontSize="small" />
                        </IconButton>
                    </ListItemButton>
                </ListItem>
                {hasChildren && (
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {org.children?.map((child) => renderTreeItem(child, level + 1))}
                        </List>
                    </Collapse>
                )}
            </React.Fragment>
        );
    };

    if (!tenantId) {
        return (
            <Box p={3}>
                <Alert severity="info">Please select a tenant to view vendor hierarchy</Alert>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Vendor Hierarchy</Typography>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" startIcon={<Refresh />} onClick={refresh} disabled={loading}>
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PersonAdd />}
                        onClick={() => {
                            if (!tenantId) {
                                alert('Please select a tenant first');
                                return;
                            }
                            handleAddAdmin(null);
                        }}
                        disabled={!tenantId || loading}
                        title={!tenantId ? 'Please select a tenant first' : 'Add Vendor Admin'}
                    >
                        Add Vendor Admin
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => {
                            if (!tenantId) {
                                alert('Please select a tenant first');
                                return;
                            }
                            handleAddChild(null);
                        }}
                        disabled={!tenantId || loading}
                        title={!tenantId ? 'Please select a tenant first' : 'Add Root Organization'}
                    >
                        Add Root Organization
                    </Button>
                </Stack>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => { }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Left Panel: Tenant & Organization Selection */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={2}>
                        {/* Tenant Selection */}
                        <Card>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Typography variant="h6">Select Vendor</Typography>
                                    <Autocomplete
                                        options={filteredTenants}
                                        getOptionLabel={(option) => `${option.business_name}`}
                                        value={tenants.find((t) => t.id === tenantId) || null}
                                        onChange={(_, newValue) => {
                                            if (newValue) {
                                                selectTenant(newValue.id);
                                                setTenantId(newValue.id);
                                            }
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
                                    />
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Organization Tree */}
                        <Card>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="h6">
                                            Organizations ({filteredTree.length})
                                        </Typography>
                                        <TextField
                                            size="small"
                                            placeholder="Search..."
                                            value={orgSearchTerm}
                                            onChange={(e) => setOrgSearchTerm(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Search fontSize="small" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{ width: 200 }}
                                        />
                                    </Stack>
                                    {!tenantId ? (
                                        <Alert severity="info">
                                            Select a tenant from the header to load its vendor hierarchy.
                                        </Alert>
                                    ) : loading ? (
                                        <Box display="flex" justifyContent="center" p={4}>
                                            <CircularProgress />
                                        </Box>
                                    ) : filteredTree.length === 0 ? (
                                        <Alert severity="info">
                                            <Typography variant="body2" gutterBottom>
                                                No organizations found for this tenant.
                                            </Typography>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<Add />}
                                                onClick={() => handleAddChild(null)}
                                                sx={{ mt: 1 }}
                                            >
                                                Create First Organization
                                            </Button>
                                        </Alert>
                                    ) : (
                                        <List sx={{ maxHeight: 600, overflowY: 'auto' }}>
                                            {filteredTree.map((org) => renderTreeItem(org))}
                                        </List>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>

                {/* Right Panel: Organization Details */}
                <Grid item xs={12} md={8}>
                    {selectedOrg ? (
                        <Card>
                            <CardContent>
                                <Stack spacing={3}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="h5">{selectedOrg.name}</Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<PersonAdd />}
                                                onClick={() => selectedOrg && handleAddAdmin(selectedOrg)}
                                                disabled={!selectedOrg || loading}
                                                title={!selectedOrg ? 'Select an organization first' : 'Add Vendor Admin'}
                                            >
                                                Add Admin
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<Add />}
                                                onClick={() => selectedOrg && handleAddChild(selectedOrg)}
                                                disabled={!selectedOrg || loading}
                                                title={!selectedOrg ? 'Select an organization first' : 'Add Child Organization'}
                                            >
                                                Add Child
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<Edit />}
                                                onClick={() => selectedOrg && handleEdit(selectedOrg)}
                                                disabled={!selectedOrg || loading}
                                                title={!selectedOrg ? 'Select an organization first' : 'Edit Organization'}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                startIcon={<Delete />}
                                                onClick={() => selectedOrg && handleDelete(selectedOrg)}
                                                disabled={!selectedOrg || loading}
                                                title={!selectedOrg ? 'Select an organization first' : 'Delete Organization'}
                                            >
                                                Delete
                                            </Button>
                                        </Stack>
                                    </Stack>

                                    <Divider />

                                    {/* Organization Details */}
                                    <Stack spacing={2}>
                                        <Typography variant="subtitle1">Details</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Level
                                                </Typography>
                                                <Typography>{selectedOrg.level}</Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Status
                                                </Typography>
                                                <Chip
                                                    label={selectedOrg.status}
                                                    color={selectedOrg.status === 'active' ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Slug
                                                </Typography>
                                                <Typography>{selectedOrg.slug}</Typography>
                                            </Grid>
                                            {selectedOrg.parent_name && (
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Parent
                                                    </Typography>
                                                    <Typography>{selectedOrg.parent_name}</Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Stack>

                                    <Divider />

                                    {/* User Bindings */}
                                    <Stack spacing={2}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="subtitle1">
                                                Assigned Users {bindings?.length > 0 && `(${bindings.length})`}
                                            </Typography>
                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<PersonAdd />}
                                                    onClick={() => handleAddAdmin(selectedOrg)}
                                                    disabled={!selectedOrg || loading}
                                                    title={!selectedOrg ? 'Select an organization first' : 'Add Vendor Admin'}
                                                >
                                                    Add Admin
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<PersonAdd />}
                                                    onClick={() => handleAssignUser(selectedOrg)}
                                                    disabled={!selectedOrg || loading}
                                                    title={!selectedOrg ? 'Select an organization first' : 'Assign User to Organization'}
                                                >
                                                    Assign User
                                                </Button>
                                            </Stack>
                                        </Stack>
                                        {bindingsLoading ? (
                                            <Box display="flex" justifyContent="center" p={2}>
                                                <CircularProgress size={24} />
                                            </Box>
                                        ) : !bindings?.length ? (
                                            <Alert severity="info">
                                                No users assigned to this organization. Click "Add Admin" or "Assign User" to add users.
                                            </Alert>
                                        ) : (
                                            <Stack spacing={1}>
                                                {(bindings || []).map((binding) => (
                                                    <Paper key={binding.id} variant="outlined" sx={{ p: 2 }}>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                            <Stack spacing={0.5}>
                                                                <Typography variant="body2" fontWeight={500}>
                                                                    {binding.user_email}
                                                                </Typography>
                                                                <Stack direction="row" spacing={1}>
                                                                    <Chip
                                                                        label={binding.role}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        color="primary"
                                                                    />
                                                                    <Chip
                                                                        label={binding.status}
                                                                        size="small"
                                                                        color={
                                                                            binding.status === 'active'
                                                                                ? 'success'
                                                                                : binding.status === 'suspended'
                                                                                    ? 'error'
                                                                                    : 'default'
                                                                        }
                                                                    />
                                                                </Stack>
                                                                {binding.assigned_at && (
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Assigned: {new Date(binding.assigned_at).toLocaleDateString()}
                                                                    </Typography>
                                                                )}
                                                            </Stack>
                                                        </Stack>
                                                    </Paper>
                                                ))}
                                            </Stack>
                                        )}
                                    </Stack>

                                    <Divider />

                                    {/* Wallet Summary */}
                                    <Stack spacing={2}>
                                        <Typography variant="subtitle1">Wallet Summary</Typography>
                                        {walletsLoading ? (
                                            <Box display="flex" justifyContent="center" p={2}>
                                                <CircularProgress size={24} />
                                            </Box>
                                        ) : wallets.length === 0 ? (
                                            <Alert severity="info">
                                                No wallets found for this organisation. Wallets are created automatically when needed.
                                            </Alert>
                                        ) : (
                                            <Stack spacing={2}>
                                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                                                    <Typography variant="caption" display="block" sx={{ opacity: 0.9 }}>
                                                        Total Balance
                                                    </Typography>
                                                    <Typography variant="h5" fontWeight={600}>
                                                        ₦{Number(totalBalance).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </Typography>
                                                </Paper>
                                                <Stack spacing={1}>
                                                    {wallets.map((wallet) => (
                                                        <Paper key={wallet.id} variant="outlined" sx={{ p: 2 }}>
                                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                                <Stack spacing={0.5}>
                                                                    <Typography variant="body2" fontWeight={500}>
                                                                        {wallet.key} ({wallet.type})
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {wallet.role || 'No role'}
                                                                    </Typography>
                                                                </Stack>
                                                                <Typography variant="h6" fontWeight={600}>
                                                                    ₦{Number(wallet.balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </Typography>
                                                            </Stack>
                                                            {wallet.daily_limit && (
                                                                <Stack direction="row" spacing={2} mt={1}>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Daily Limit: ₦{Number(wallet.daily_limit).toLocaleString('en-NG')}
                                                                    </Typography>
                                                                    {wallet.daily_spent && (
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            Spent: ₦{Number(wallet.daily_spent).toLocaleString('en-NG')}
                                                                        </Typography>
                                                                    )}
                                                                </Stack>
                                                            )}
                                                        </Paper>
                                                    ))}
                                                </Stack>
                                            </Stack>
                                        )}
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    ) : (
                        <Stack spacing={2}>
                            <Card>
                                <CardContent>
                                    <Typography color="text.secondary" align="center" p={4}>
                                        Select an organization from the tree to view details
                                    </Typography>
                                </CardContent>
                            </Card>
                            {tree.length === 0 && tenantId && (
                                <Card>
                                    <CardContent>
                                        <Alert severity="info">
                                            <Typography variant="body2" gutterBottom>
                                                No organizations found for this tenant.
                                            </Typography>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                startIcon={<Add />}
                                                onClick={() => handleAddChild(null)}
                                                sx={{ mt: 1 }}
                                            >
                                                Create First Organization
                                            </Button>
                                        </Alert>
                                    </CardContent>
                                </Card>
                            )}
                        </Stack>
                    )}
                </Grid>
            </Grid>

            {/* Context Menu */}
            <Menu
                open={contextMenu !== null}
                onClose={handleCloseContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
                }
            >
                <MenuItem onClick={() => contextMenu?.org && handleAddChild(contextMenu.org)}>
                    <Add sx={{ mr: 1 }} fontSize="small" /> Add Child
                </MenuItem>
                <MenuItem onClick={() => contextMenu?.org && handleEdit(contextMenu.org)}>
                    <Edit sx={{ mr: 1 }} fontSize="small" /> Edit
                </MenuItem>
                <MenuItem onClick={() => contextMenu?.org && handleAddAdmin(contextMenu.org)}>
                    <PersonAdd sx={{ mr: 1 }} fontSize="small" /> Add Admin
                </MenuItem>
                <MenuItem onClick={() => contextMenu?.org && handleAssignUser(contextMenu.org)}>
                    <PersonAdd sx={{ mr: 1 }} fontSize="small" /> Assign User
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => contextMenu?.org && handleDelete(contextMenu.org)}>
                    <Delete sx={{ mr: 1 }} fontSize="small" color="error" /> Delete
                </MenuItem>
            </Menu>

            {/* Modals */}
            <AddVendorAdminModal
                open={addAdminModalOpen}
                onClose={() => {
                    setAddAdminModalOpen(false);
                }}
                orgId={selectedOrgId}
                onSuccess={async () => {
                    // Refresh bindings list to show newly added admin
                    console.log('[VendorHierarchy] Refreshing bindings after adding admin');
                    await refreshBindings();
                }}
            />

            <AddChildOrgModal
                open={addChildModalOpen}
                onClose={() => setAddChildModalOpen(false)}
                parentOrg={selectedOrg || null}
                tenantId={tenantId}
                onSuccess={() => {
                    refresh();
                    setAddChildModalOpen(false);
                }}
            />

            <EditOrgModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                org={selectedOrg || null}
                onSuccess={() => {
                    refresh();
                    setEditModalOpen(false);
                }}
            />

            <DeleteOrgModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                org={selectedOrg}
                onSuccess={() => {
                    refresh();
                    selectOrg(null);
                    setDeleteModalOpen(false);
                }}
            />

            <AssignUserModal
                open={assignUserModalOpen}
                onClose={() => setAssignUserModalOpen(false)}
                orgId={selectedOrgId}
                onSuccess={() => {
                    refreshBindings();
                    setAssignUserModalOpen(false);
                }}
            />
        </Box>
    );
};

export default VendorHierarchy;

