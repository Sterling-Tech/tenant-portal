import React, { useState, useEffect } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
    Chip,
    Stack,
    Collapse,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Domain,
    People,
    Settings,
    Notifications,
    Logout,
    Palette,
    Store,
    AccountTree,
    ExpandLess,
    ExpandMore,
    AccountBalanceWallet,
    History,
    PersonAdd,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import TenantSwitcher from '../TenantSwitcher/TenantSwitcher';
import { useVendorHierarchy } from '../../contexts/VendorContext';
import { useEnsureUserApiKey } from '../../hooks/useEnsureUserApiKey';
import Onboarding from '../../pages/Onboarding/Onboarding';
import { usePermission } from '../../hooks/usePermission';
import { RootState } from '../../store/store';

const drawerWidth = 240;

interface Tenant {
    id: string;
    business_name: string;
    // slug: string;
    // domain: string;
    // subdomain?: string;
    // is_active: boolean;
    // is_trial?: boolean;
    // trial_ends_at?: string;
    created_at?: string;
}

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state: RootState) => state.auth);
    const { tenantId, setTenantId } = useVendorHierarchy();
    useEnsureUserApiKey(user?.id ?? null);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
    const [vendorMenuOpen, setVendorMenuOpen] = useState(true);
    const [customerMenuOpen, setCustomerMenuOpen] = useState(false); // 👈 ADD THIS // For collapsible vendor section
    const [reengineerMenuOpen, setReengineerMenuOpen] = useState(false); // 👈 ADD THIS // For collapsible vendor section
    const [debtMgtOpen, setDebtMgtOpen] = useState(false); // 👈 ADD THIS // For collapsible vendor section

    // Load tenant from localStorage on mount only
    useEffect(() => {
        const savedTenant = localStorage.getItem('currentTenant');
        const savedTenantId = localStorage.getItem('currentTenantId');

        if (savedTenant) {
            try {
                const tenant = JSON.parse(savedTenant) as Tenant;
                setCurrentTenant(tenant);
                setTenantId(tenant.id);
            } catch (error) {
                console.error('Layout - Failed to parse saved tenant:', error);
                localStorage.removeItem('currentTenant');
                // Try to load by ID if available
                if (savedTenantId) {
                    import('../../services/tenantService').then(({ tenantService }) => {
                        tenantService.getTenantById(savedTenantId).then((tenant) => {
                            setCurrentTenant(tenant);
                            setTenantId(tenant.id);
                            localStorage.setItem('currentTenant', JSON.stringify(tenant));
                        }).catch(() => {
                            localStorage.removeItem('currentTenantId');
                        });
                    });
                }
            }
        } else if (savedTenantId) {
            // Load tenant by ID if we have it but not the full object
            import('../../services/tenantService').then(({ tenantService }) => {
                tenantService.getTenantById(savedTenantId).then((tenant) => {
                    setCurrentTenant(tenant);
                    setTenantId(tenant.id);
                    localStorage.setItem('currentTenant', JSON.stringify(tenant));
                }).catch(() => {
                    localStorage.removeItem('currentTenantId');
                });
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only on mount

    const handleTenantChange = (tenant: Tenant) => {
        console.log('Layout - Tenant changed to:', tenant);
        setCurrentTenant(tenant);
        localStorage.setItem('currentTenantId', tenant.id);
        localStorage.setItem('currentTenant', JSON.stringify(tenant));
        setTenantId(tenant.id);
    };


    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
        handleMenuClose();
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };
    const { can } = usePermission();
    // Check if we're in vendor section
    const isVendorSection = location.pathname.startsWith('/vendors');

    const drawer = (
        <Box>
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        QC
                    </Avatar>
                    <Typography variant="h6" noWrap component="div">
                        QuickCash
                    </Typography>
                </Box>
            </Toolbar>
            <Divider />
            <List>
                {/* Tenant Admin */}
                <ListItem disablePadding>
                    <ListItemButton
                        selected={location.pathname === '/tenants/admin'}
                        onClick={() => handleNavigation('/tenants/admin')}
                        sx={{
                            '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                },
                                '& .MuiListItemIcon-root': {
                                    color: 'white',
                                },
                            },
                        }}
                    >
                        <ListItemIcon>
                            <Domain />
                        </ListItemIcon>
                        <ListItemText primary="Tenant Admin" />
                    </ListItemButton>
                </ListItem>

                {/* Vendor Management Section - Collapsible */}
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => setVendorMenuOpen(!vendorMenuOpen)}
                        sx={{
                            bgcolor: isVendorSection ? 'action.selected' : 'inherit',
                        }}
                    >
                        <ListItemIcon>
                            <Store />
                        </ListItemIcon>
                        <ListItemText
                            primary="Vendor Mgmt"
                            primaryTypographyProps={{ fontWeight: isVendorSection ? 600 : 400 }}
                        />
                        {vendorMenuOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                </ListItem>
                <Collapse in={vendorMenuOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {/* Vendors */}
                        {/* {can("view_vendors") && ( */}
                            <ListItemButton
                                selected={location.pathname === '/vendors'}
                                onClick={() => handleNavigation('/vendors')}
                                sx={{
                                    pl: 4,
                                    '&.Mui-selected': {
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: 'white',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <Store fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Vendors" />
                            </ListItemButton>
                        {/* )} */}
                        {/* Onboarding */}
                        <ListItem disablePadding>
                            <ListItemButton
                                selected={location.pathname === '/onboarding'}
                                onClick={() => handleNavigation('/onboarding')}
                                sx={{
                                    pl: 4,
                                    '&.Mui-selected': {
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: 'white',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <PersonAdd />
                                </ListItemIcon>
                                <ListItemText primary="Onboarding" />
                            </ListItemButton>
                        </ListItem>

                        {/* Vendor Hierarchy */}
                        <ListItemButton
                            selected={location.pathname === '/vendors/hierarchy'}
                            onClick={() => handleNavigation('/vendors/hierarchy')}
                            sx={{
                                pl: 4,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon>
                                <AccountTree fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Vendor Hierarchy" />
                        </ListItemButton>

                        {/* Transactions */}


                        <ListItemButton
                            selected={location.pathname === '/vendors/transactions'}
                            onClick={() => handleNavigation('/vendors/transactions')}
                            sx={{
                                pl: 4,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon>
                                <History fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Wallet" />
                        </ListItemButton>
                        <ListItemButton
                            selected={location.pathname === '/vendors/funding'}
                            onClick={() => handleNavigation('/vendors/funding')}
                            sx={{
                                pl: 4,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon>
                                <History fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Funding Request" />
                        </ListItemButton>

                    </List>
                </Collapse>
                {/* Customer Management Section - Collapsible */}
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => setCustomerMenuOpen(!customerMenuOpen)}
                        sx={{
                            bgcolor: isVendorSection ? 'action.selected' : 'inherit',
                        }}
                    >
                        <ListItemIcon>
                            <Store />
                        </ListItemIcon>
                        <ListItemText
                            primary="Customer Mgmt"
                            primaryTypographyProps={{ fontWeight: isVendorSection ? 600 : 400 }}
                        />
                        {vendorMenuOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                </ListItem>
                <Collapse in={customerMenuOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>

                        {/* Customer */}
                        {/* {can("view_customer") && ( */}
                            <ListItemButton
                                selected={location.pathname === '/customer'}
                                onClick={() => handleNavigation('/customer')}
                                sx={{
                                    pl: 4,
                                    '&.Mui-selected': {
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: 'white',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <People fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Customer" />
                            </ListItemButton>
                        {/* )} */}
                        {/* maprefund */}
                        <ListItemButton
                            selected={location.pathname === '/customer/maprefund'}
                            onClick={() => handleNavigation('/customer/maprefund')}
                            sx={{
                                pl: 4,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon>
                                <People fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Map Refund" />
                        </ListItemButton>
                        {/* /customer transaction */}
                        <ListItemButton
                            selected={location.pathname === '/customer/transaction'}
                            onClick={() => handleNavigation('/customer/transaction')}
                            sx={{
                                pl: 4,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon>
                                <History fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Transactions" />
                        </ListItemButton>
                    </List>
                </Collapse>
                {/* Re-engineering */}
                {/* {can("issue_engineering_tokens") && ( */}
                    <>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => setReengineerMenuOpen(!reengineerMenuOpen)}
                                sx={{
                                    bgcolor: reengineerMenuOpen ? 'action.selected' : 'inherit',
                                }}
                            >
                                <ListItemIcon>
                                    <Store />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Prepaid Mgmt"
                                    primaryTypographyProps={{ fontWeight: isVendorSection ? 600 : 400 }}
                                />
                                {reengineerMenuOpen ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                        </ListItem>
                        <Collapse in={reengineerMenuOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>

                                <ListItemButton
                                    selected={location.pathname === '/re-engineer'}
                                    onClick={() => handleNavigation('/re-engineer')}
                                    sx={{
                                        pl: 4,
                                        '&.Mui-selected': {
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'primary.dark',
                                            },
                                            '& .MuiListItemIcon-root': {
                                                color: 'white',
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon>
                                        <People fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Engineering" />
                                </ListItemButton>

                                <ListItemButton
                                    selected={location.pathname === '/re-engineer/bulk'}
                                    onClick={() => handleNavigation('/re-engineer/bulk')}
                                    sx={{
                                        pl: 4,
                                        '&.Mui-selected': {
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'primary.dark',
                                            },
                                            '& .MuiListItemIcon-root': {
                                                color: 'white',
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon>
                                        <History fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Bulk Engineering" />
                                </ListItemButton>
                            </List>
                        </Collapse>
                    </>
                {/* )} */}
                {/* Sub account*/}
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => setDebtMgtOpen(!debtMgtOpen)}
                        sx={{
                            bgcolor: debtMgtOpen ? 'action.selected' : 'inherit',
                        }}
                    >
                        <ListItemIcon>
                            <Store />
                        </ListItemIcon>
                        <ListItemText
                            primary="Debt Mgmt"
                            primaryTypographyProps={{ fontWeight: isVendorSection ? 600 : 400 }}
                        />
                        {debtMgtOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                </ListItem>
                <Collapse in={debtMgtOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>

                        <ListItem disablePadding>
                            <ListItemButton
                                selected={location.pathname === '/customer/subaccount'}
                                onClick={() => handleNavigation('/customer/subaccount')}
                                sx={{
                                    pl: 4,
                                    '&.Mui-selected': {
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: 'white',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <People />
                                </ListItemIcon>
                                <ListItemText primary="Sub account" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Collapse>

                {/* ring fencing */}
                {/* {can("manage_schemes") && ( */}
                    <ListItem disablePadding>
                        <ListItemButton
                            selected={location.pathname === '/ringfence'}
                            onClick={() => handleNavigation('/ringfence')}
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon>
                                <Settings />
                            </ListItemIcon>
                            {/* <ListItemText primary="Settings" /> */}
                            <ListItemText primary="Ringfence Mgmt" />
                        </ListItemButton>
                    </ListItem>
                {/* )} */}
                {/* Settings */}
                <ListItem disablePadding>
                    <ListItemButton
                        selected={location.pathname === '/settings'}
                        onClick={() => handleNavigation('/settings')}
                        sx={{
                            '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                },
                                '& .MuiListItemIcon-root': {
                                    color: 'white',
                                },
                            },
                        }}
                    >
                        <ListItemIcon>
                            <Settings />
                        </ListItemIcon>
                        {/* <ListItemText primary="Settings" /> */}
                        <ListItemText primary="Admin Mgmt" />
                    </ListItemButton>
                </ListItem>

            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" noWrap component="div">
                            Tenant Portal
                        </Typography>
                        <Chip
                            icon={<Palette fontSize="small" />}
                            label="Admin Mode"
                            size="small"
                            color="secondary"
                            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                        />
                        {currentTenant && (
                            <Typography variant="caption" sx={{ ml: 2, opacity: 0.7 }}>
                                ({currentTenant.business_name})
                            </Typography>
                        )}
                    </Stack>
                    <TenantSwitcher
                        onTenantChange={handleTenantChange}
                        currentTenantId={currentTenant?.id}
                    />
                    <IconButton color="inherit" sx={{ mr: 1 }}>
                        <Notifications />
                    </IconButton>
                    <IconButton onClick={handleMenuOpen}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                            {user?.firstName?.charAt(0) || 'U'}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleMenuClose}>
                            <ListItemIcon>
                                <Settings />
                            </ListItemIcon>
                            <ListItemText>Settings</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <Logout />
                            </ListItemIcon>
                            <ListItemText>Logout</ListItemText>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default Layout;

