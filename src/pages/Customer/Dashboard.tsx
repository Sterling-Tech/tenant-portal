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
		// BarChart,
		Analytics,
		Download,
		Search,
} from '@mui/icons-material';
import { useTenants } from '../../hooks/useTenants';
import { useVendorHierarchy } from '../../contexts/VendorContext';
import { useTenantAdminProfile } from '../../hooks/useTenantAdminProfile';
import { useApiKeys } from '../../hooks/useApiKeys';
import { useAppSelector } from '../../store/hooks';
import TenantFormModal, { TenantFormValues } from '../../components/TenantAdmin/TenantFormModal';
import TenantDomainModal, { TenantDomainFormValues } from '../../components/TenantAdmin/TenantDomainModal';
import TenantUserRoleModal, { TenantUserRoleFormValues } from '../../components/TenantAdmin/TenantUserRoleModal';
import ConfirmDialog from '../../components/TenantAdmin/ConfirmDialog';
import ApiKeyAuditDialog from '../../components/TenantAdmin/ApiKeyAuditDialog';
import type { Tenant, TenantConfiguration as TenantConfigurationType, TenantUser, CreateTenantRequest } from '../../services/tenantService';
import { BarChart, PieChart } from '@mui/x-charts';

const CustomerAdmin: React.FC = () => {
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

		const openDeleteTenantModal = () => setDeleteTenantOpen(true);
		const closeDeleteTenantModal = () => setDeleteTenantOpen(false);

		const handleDeleteTenant = async () => {
				if (!selectedTenant) {
						return;
				}
				await deleteTenant(selectedTenant.id);
		};


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
								<Typography variant="h4">Customer Administration</Typography>
								<Stack direction="row" spacing={1}>
										<Button
												variant="outlined"
												startIcon={<Refresh />}
												onClick={() => refreshTenants()}
												disabled={loading}
										>
												Refresh
										</Button>
										{/* <Button
												variant="contained"
												startIcon={<Add />}
												disabled={!canCreateTenant}
												title={canCreateTenant ? 'Create a new tenant' : tenantCreateDisabledMessage}
												sx={{
														opacity: canCreateTenant ? 1 : 0.6,
												}}
										>
												Add Tenant
										</Button> */}
									
								</Stack>
						</Box>

						{/* {!canCreateTenant && (
								<Alert severity="info" sx={{ mb: 2 }}>
										{tenantCreateDisabledMessage}
								</Alert>
						)} */}

						{/* {(error || profileError) && (
								<Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
										{error || profileError}
								</Alert>
						)} */}

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
																		Total Arrears Summary
																</Typography>
																<Typography variant="h5">{(7889540).toLocaleString()}</Typography>
														</CardContent>
												</Card>
										</Grid>
										<Grid item xs={12} md={3}>
												<Card>
														<CardContent>
																<Typography color="text.secondary" variant="body2">
																		Avg Daily Revenue
																</Typography>
																<Typography variant="h5">₦{(400776).toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
														</CardContent>
												</Card>
										</Grid>
										<Grid item xs={12} md={3}>
												<Card>
														<CardContent>
																<Typography color="text.secondary" variant="body2">
																		Collection Efficiency
																</Typography>
																<Typography variant="h5">78.4%</Typography>
														</CardContent>
												</Card>
										</Grid>
										<Grid item xs={12} md={3}>
												<Card>
														<CardContent>
																<Typography color="text.secondary" variant="body2">
																		Outstanding Debt
																</Typography>
																<Typography variant="h5">₦{(800776).toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
														</CardContent>
												</Card>
										</Grid>
										<Grid item xs={12} md={4}>
												<Card>
														<CardContent>
																<Typography color="text.secondary" variant="body2">
																		Total Prepaid Customer
																</Typography>
																<Typography variant="h5">{(7889540).toLocaleString()}</Typography>
														</CardContent>
												</Card>
										</Grid>
										<Grid item xs={12} md={4}>
												<Card>
														<CardContent>
																<Typography color="text.secondary" variant="body2">
																		Total Postpaid Customer
																</Typography>
																<Typography variant="h5">{(889540).toLocaleString()}</Typography>
														</CardContent>
												</Card>
										</Grid>
										<Grid item xs={12} md={4}>
												<Card>
														<CardContent>
																<Typography color="text.secondary" variant="body2">
																	Total Revenue                         
																</Typography>
																<Typography variant="h5">
																		₦{(90000776).toLocaleString(undefined, { maximumFractionDigits: 2 })}
																</Typography>
														</CardContent>
												</Card>
										</Grid>
								</Grid>
						)}

						<Grid container spacing={3}>
								<Grid item xs={12} md={4}>
										<Card sx={{ height: '80%' }}>
												{/* <CardHeader
														title="Revenue Log"
														subheader="LAST 7 TRADING DAYS"
												/> */}
											<CardContent>
											<Typography variant="h6" fontWeight={600} fontSize={16}>
												Revenue Log
											</Typography>
											<Typography variant="caption" color="text.secondary" letterSpacing={2}>
												LAST 7 TRADING DAYS
											</Typography>

											<Stack mt={2} spacing={2}>
												{[
													{ date: '18 MAR', amount: '₦13.1M', change: '+5.4%', up: true },
													{ date: '17 MAR', amount: '₦12.4M', change: '+1.8%', up: true },
													{ date: '16 MAR', amount: '₦12.2M', change: '-2.1%', up: false },
													{ date: '15 MAR', amount: '₦12.5M', change: '+3.2%', up: true },
													{ date: '14 MAR', amount: '₦12.1M', change: '+0.7%', up: true },
													{ date: '13 MAR', amount: '₦12.0M', change: '-1.4%', up: false },
													{ date: '12 MAR', amount: '₦11.8M', change: '+4.0%', up: true },
												].map((item, i) => (
													<Box key={i} display="flex" justifyContent="space-between">
														<Typography color="text.secondary">{item.date}</Typography>

														<Typography fontWeight={500}>{item.amount}</Typography>

														<Typography
															color={item.up ? 'success.main' : 'error.main'}
															fontWeight={500}
														>
															{item.up ? '▲' : '▼'} {item.change}
														</Typography>
													</Box>
												))}
											</Stack>
										</CardContent>

										<CardContent>
                    <Stack spacing={4} mt={2}>

  {/* ================= PREPAID vs POSTPAID ================= */}
										<Box>
											<Typography fontWeight={600} fontSize={16}>
												Prepaid vs Postpaid
											</Typography>

											<Typography
												fontSize={11}
												letterSpacing={2}
												color="text.secondary"
												mt={0.5}
											>
												METERING TYPE
											</Typography>

											<Stack direction="row" alignItems="center" mt={2}>
												
												{/* DONUT */}
												<Box position="relative">
													<PieChart
														series={[
															{
																innerRadius: 55,
																outerRadius: 80,
																paddingAngle: 0,
																cornerRadius: 4,
																data: [
																	{ id: 0, value: 63, color: '#c9a646' }, // gold
																	{ id: 1, value: 37, color: '#5b84c9' }, // blue
																],
															},
														]}
														width={180}
														height={180}
													/>

													{/* CENTER TEXT */}
													<Box
														position="absolute"
														top="50%"
														left="30%"
														sx={{ transform: 'translate(-50%, -50%)' }}
														textAlign="center"
													>
														<Typography fontWeight={700} fontSize={24}>
															94K
														</Typography>
														<Typography fontSize={10} color="text.secondary" letterSpacing={2}>
															TOTAL
														</Typography>
													</Box>
												</Box>

												{/* LEGEND */}
												<Stack spacing={2}>
													<Stack direction="row" alignItems="center" spacing={1}>
														<Box width={8} height={8} borderRadius="50%" bgcolor="#c9a646" />
														<Typography fontSize={13} letterSpacing={1}>
															PREPAID
														</Typography>
														<Typography ml={4} fontWeight={600}>
															63%
														</Typography>
													</Stack>

													<Stack direction="row" alignItems="center" spacing={1}>
														<Box width={8} height={8} borderRadius="50%" bgcolor="#5b84c9" />
														<Typography fontSize={13} letterSpacing={1}>
															POSTPAID
														</Typography>
														<Typography ml={3.5} fontWeight={600}>
															37%
														</Typography>
													</Stack>
												</Stack>
											</Stack>
										</Box>

  {/* ================= MD vs NON-MD ================= */}
  <Box>
    <Typography fontWeight={600} fontSize={16}>
      MD vs Non-MD
    </Typography>

    <Typography
      fontSize={11}
      letterSpacing={2}
      color="text.secondary"
      mt={0.5}
    >
      MAXIMUM DEMAND
    </Typography>

    <Stack direction="row" alignItems="center" spacing={3} mt={2}>
      
      {/* DONUT */}
      <Box position="relative">
        <PieChart
          series={[
            {
              innerRadius: 55,
              outerRadius: 80,
              paddingAngle: 0,
              cornerRadius: 4,
              data: [
                { id: 0, value: 12, color: '#4aa785' }, // green
                { id: 1, value: 88, color: '#cfcac4' }, // grey
              ],
            },
          ]}
          width={180}
          height={180}
        />

        {/* CENTER TEXT */}
        <Box
          position="absolute"
          top="50%"
          left="30%"
          sx={{ transform: 'translate(-50%, -50%)' }}
          textAlign="center"
        >
          <Typography fontWeight={700} fontSize={24}>
            12%
          </Typography>
          <Typography fontSize={10} color="text.secondary" letterSpacing={2}>
            MD
          </Typography>
        </Box>
      </Box>

      {/* LEGEND */}
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box width={8} height={8} borderRadius="50%" bgcolor="#4aa785" />
          <Typography fontSize={13} letterSpacing={1}>
            MD
          </Typography>
          <Typography ml={6} fontWeight={600}>
            11,306
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Box width={8} height={8} borderRadius="50%" bgcolor="#4b5563" />
          <Typography fontSize={13} letterSpacing={1}>
            NON-MD
          </Typography>
          <Typography ml={3} fontWeight={600}>
            82,912
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  </Box>

                    </Stack>
										
										</CardContent>
										</Card>
								</Grid>

								<Grid item xs={12} md={8}>
										{selectedTenant ? (
												<Stack spacing={3} data-tenant-details>

													<Card>
																<CardHeader avatar={<Security color="primary" />} title="Customer Overview" />
																<CardContent>
																		<Stack direction="row" spacing={2} mb={2}  flexWrap="wrap">
																				<Chip label={`Total Customer: ${(889540).toLocaleString()}`} size="small" />
																				<Chip label={`Postpaid daily collection: ₦${(889540).toLocaleString()}`} size="small" />
																				<Chip label={`Prepaid daily collection: ₦${(889540).toLocaleString()}`} size="small" />
																				<Chip label={`Total Unmetered Customers: ${(889540).toLocaleString()}`} size="small" />
																				<Chip label={`Suspended Customers: ${(889540).toLocaleString()}`} size="small" />
																		</Stack>
																				{/* <Typography color="text.secondary">
																						No vendor organisations have been created for this tenant.
																				</Typography> */}
																</CardContent>
														</Card>

														<Grid container spacing={2}>
																<Grid item xs={12}>
																		<Card>
																				<CardHeader
																						avatar={<Analytics color="primary" />}
																						title="Tariff by Feeder"
																						subheader="BY Feeder"
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
                                          {analyticsView === 'summary' ? (
																						<BarChart
																							xAxis={[{ scaleType: 'band', data: ['Ikeja-A', 'Alausa', 'Ojota', 'Oregun'] }]}
																							series={[
																								{ data: [38, 32, 24, 21] },
																							]}
																							height={220}
																							margin={{ top: 10, bottom: 20 }}
																						/>
																					) : (
																						<Stack spacing={2}>
																							{[
																								{ name: 'Ikeja-A', class: 'RESIDENTIAL', rate: 225, customers: 14200, revenue: '₦38.4M' },
																								{ name: 'Alausa', class: 'COMMERCIAL', rate: 310, customers: 8800, revenue: '₦32.1M' },
																								{ name: 'Ojota', class: 'RESIDENTIAL', rate: 68, customers: 11500, revenue: '₦24.3M' },
																								{ name: 'Oregun', class: 'COMMERCIAL', rate: 295, customers: 6700, revenue: '₦21.8M' },
																							].map((row, i) => (
																								<Box
																									key={i}
																									display="flex"
																									justifyContent="space-between"
																									alignItems="center"
																									//py={8}
																									borderBottom="1px solid #eee"
																								>
																									<Typography>{row.name}</Typography>

																									<Chip label={row.class} size="small" />

																									<Typography fontWeight={600}>₦{row.rate}</Typography>

																									<Typography color="text.secondary">
																										{row.customers.toLocaleString()}
																									</Typography>

																									<Typography fontWeight={600}>{row.revenue}</Typography>
																								</Box>
																							))}
																						</Stack>
																					)}
																				</CardContent>
																		</Card>
																</Grid>
																<Grid item xs={12} md={6}>
																		<Card>
																				<CardHeader
																						avatar={<Assessment color="primary" />}
																						title="Debt Exposure"
																						subheader="BY CATEGORY"
																				/>
																				<CardContent>
                                           <Stack spacing={2}>

																						{[
																							{ label: 'RESIDENTIAL', value: 31.4 },
																							{ label: 'COMMERCIAL', value: 18.2 },
																							{ label: 'INDUSTRIAL', value: 8.7 },
																							{ label: 'SPECIAL', value: 4.0 },
																						].map((item, i) => (
																							<Box key={i}>
																								<Box display="flex" justifyContent="space-between">
																									<Typography variant="body2">{item.label}</Typography>
																									<Typography fontWeight={500}>₦{item.value}M</Typography>
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
																											width: `${item.value * 2}%`,
																											height: '100%',
																											bgcolor: 'primary.main',
																											borderRadius: 5,
																										}}
																									/>
																								</Box>
																							</Box>
																						))}

																						<Typography mt={2} textAlign="center">Payment Plan Uptake</Typography>

																						<PieChart
																							series={[
																								{
																									data: [
																										{ id: 0, value: 35, label: 'Active' },
																										{ id: 1, value: 45, label: 'No Plan' },
																										{ id: 2, value: 20, label: 'Defaulted' },
																									],
																								},
																							]}
																							height={200}
																						/>
																					</Stack>
																				</CardContent>
																		</Card>
																</Grid>
																<Grid item xs={12} md={6}>
																		<Card>
																				<CardHeader avatar={<People color="primary" />} title="Admin Profile" />
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

			
						<TenantDomainModal
								open={domainModalOpen}
								loading={mutationLoading}
								onClose={closeDomainModal}
								onSubmit={handleDomainModalSubmit}
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

						
				</Box>
		);
};

export default CustomerAdmin;
