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
		Snackbar,
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
		fetchCustomers,
		fetchCustomer,
		fetchVendor,
		createVendor,
		createCustomer,
		updateVendor,
		deleteVendor,
		verifyVendor,
		Customercategory,
		CustomerClass,
		fetchVendorApiKeys,
		createVendorApiKey,
		fetchVendorAdmins,
		createVendorAdmin,
		fetchVendorPermissions,
		updateVendorPermissions,
		type Vendor,
		type Customer,
		type VendorForm,
		type CustomerForm,
		type VendorAdminProfile,
		type VendorPermissions,
		Category,
		Class,
} from '../../services/vendorService';
import { del } from '../../services/api';
import { Tenant } from '../../services/tenantService';

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

const CustomerManagement: React.FC = () => {
		const [tabValue, setTabValue] = useState(0);
		const [customers, setCustomers] = useState<Customer[]>([]);
		const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
		const [loading, setLoading] = useState(false);
		const [error, setError] = useState<string | null>(null);
		const [searchTerm, setSearchTerm] = useState('');
		const [filterActive, setFilterActive] = useState<boolean | null>(null);
		const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
		// Dialog states
		const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
		const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
		const [customerForm, setCustomerForm] = useState<Partial<CustomerForm>>({});
		const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

		// Detail view states
		const [categories, setCategories] = useState<Category[]>([])
		const [classes, setClasses] = useState<Class[]>([])
		const [meterTypes, setMeterTypes] = useState<any[]>([])

		const [vendorAdmins, setVendorAdmins] = useState<VendorAdminProfile[]>([]);
		const [vendorPermissions, setVendorPermissions] = useState<VendorPermissions | null>(null);
		const [detailLoading, setDetailLoading] = useState(false);

		// API Key management
		const [saving, setSaving] = useState(false);

		const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string;} | null>(null);
		// Load customers
		const loadVendors = async () => {
				// if (!selectedTenantId) return;

				setLoading(true);
				setError(null);

				try {

						const data = await fetchCustomers()
						console.error('TenantSwitcher ', data);

						setCustomers(data);
				} catch (err: any) {
						setError(err?.message || "Failed to load customers");
				} finally {
						setLoading(false);
				}
		};
		const loadCustomerMeta = async () => {
			try {
				const [categoryData, classData] = await Promise.all([
					Customercategory(),
					CustomerClass(),
				]);

				setCategories(Array.isArray(categoryData) ? categoryData : []);
				setClasses(Array.isArray(classData) ? classData : []);

			} catch (err: any) {
				setError(err?.message || "Failed to load customer metadata");
			}
		};
		useEffect(() => {
				// if (!selectedTenantId) return;
				loadVendors();
				loadCustomerMeta();
		}, []);

		// Load vendor details
		
		const loadVendorDetails = async (customerId: string) => {
				setDetailLoading(true);
				try {
						const customer = await fetchCustomer(customerId);
						setSelectedCustomer(customer);
					//	setVendorApiKeys(apiKeys);
						//setVendorAdmins(admins);
						//setVendorPermissions(permissions);
				} catch (err: any) {
						setError(err?.message || 'Failed to load vendor details');
				} finally {
						setDetailLoading(false);
				}
		};

		const handleCreateClick = () => {
				setFormMode('create');
				setCustomerForm({
								name: '',
								phone_number: '',
								customer_category: undefined,
								customer_class: undefined,
								metering_type: undefined,
							});
				setVendorDialogOpen(true);
		};

		const handleEditClick = (customer: Customer) => {
				setFormMode('edit');
				setCustomerForm({
					name: customer.name,
					phone_number: customer.phone_number || '',
					customer_category: customer.customer_category?.id,
					customer_class: customer.customer_class?.id,
					metering_type: customer.metering_type?.id,
				});
				setSelectedCustomer(customer);
				setVendorDialogOpen(true);
		};

		const handleSaveVendor = async () => {
				if (
							!customerForm.name ||
							!customerForm.email ||
							!customerForm.phone_number ||
							!customerForm.customer_category ||
							!customerForm.customer_class ||
							!customerForm.metering_type
						) {
						setNotification({
								type: "error",
								message: "Business name, email and hierarchy are required",
						});
						return;
				}

				setSaving(true);

				try {
						if (formMode === "create") {
								await createCustomer(customerForm as CustomerForm);

								setNotification({
										type: "success",
										message: "Vendor created successfully",
								});

						} else if (selectedCustomer) {
								await updateVendor(String(selectedCustomer.id), customerForm);

								setNotification({
										type: "success",
										message: "Vendor updated successfully",
								});
						}

						setVendorDialogOpen(false);
						loadVendors();

						if (selectedCustomer) {
								loadVendorDetails(String(selectedCustomer.id));
						}

				} catch (err: any) {
						setNotification({
								type: "error",
								message: err?.message || "Failed to save vendor",
						});
				} finally {
						setSaving(false);
				}
		};

		const handleDeleteVendor = async () => {
				if (!selectedCustomer) return;

				try {
						await deleteVendor(String(selectedCustomer.id));
						setDeleteDialogOpen(false);
						setSelectedCustomer(null);
						loadVendors();
				} catch (err: any) {
						setError(err?.message || 'Failed to delete customer');
				}
		};

		const handleVerifyVendor = async (customer: Customer) => {
				try {
						await verifyVendor(customer.id);
						loadVendors();
						if (selectedCustomer?.id === customer.id) {
								loadVendorDetails(customer.id);
						}
				} catch (err: any) {
						setError(err?.message || 'Failed to verify customer');
				}
		};

		const filteredcustomers = useMemo(() => {
				if (!customers || !Array.isArray(customers)) return [];

				return customers.filter((v) => {
						const term = searchTerm.toLowerCase();

						return (
							v.name?.toLowerCase().includes(term) ||
							v.phone_number?.includes(term) ||
							v.account_number?.includes(term) ||
							v.meter_number?.includes(term)
						);
				});
		}, [customers, searchTerm]);


		return (
				<Box p={3}>
						<Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
								<Typography variant="h4">Customer Management</Typography>
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
												title={'Create new customer'}
										>
												Create customer
										</Button>
								</Stack>
						</Stack>

						{error && (
								<Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
										{error}
								</Alert>
						)}


						<Grid container spacing={3}>
								{/* Customer List */}
								<Grid item xs={12} md={selectedCustomer ? 5 : 12}>
										<Card>
												<CardContent>
														<Stack spacing={2}>
																<TextField
																		fullWidth
																		placeholder="Search customers..."
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

																{!filteredcustomers ? (
																		<Alert severity="info" sx={{ mt: 2 }}>
																				Please select a tenant above to view customers
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
																										<TableCell>Account Number</TableCell>
																										<TableCell>Meter Number</TableCell>
																										<TableCell>Wallet Balance</TableCell>
																								</TableRow>
																						</TableHead>
																					 <TableBody>
																						{filteredcustomers.map((customer) => (
																								<TableRow
																								key={customer.id}
																								hover
																								selected={selectedCustomer?.id === customer.id}
																								onClick={() => setSelectedCustomer(customer)}
																								sx={{ cursor: "pointer" }}
																								>
																								<TableCell>
																										<Stack direction="row" spacing={1} alignItems="center">
																										<Typography variant="body2">
																												{customer.name}
																										</Typography>
																										</Stack>
																								</TableCell>

																								<TableCell>{customer.account_number}</TableCell>
																								<TableCell>{customer.meter_number}</TableCell>

																								<TableCell>
																										<Typography variant="caption">
																										₦{customer.wallet?.balance || "0.00"}
																										</Typography>
																								</TableCell>
																								</TableRow>
																						))}
																						</TableBody>
																				</Table>
																		</TableContainer>
																)}
																{!loading && !filteredcustomers?.length && (
																		<Typography color="text.secondary" align="center" p={2}>
																				No customers found
																		</Typography>
																)}
														</Stack>
												</CardContent>
										</Card>
								</Grid>

								{/* Vendor Details */}
								{selectedCustomer && (
										<Grid item xs={12} md={7}>
												<Card>
														<CardContent>
																<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
																		<Typography variant="h6">{selectedCustomer?.name}</Typography>
																		<Stack direction="row" spacing={1}>
																				<IconButton size="small" onClick={() => handleEditClick(selectedCustomer)}>
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
																								{/* <Grid item xs={12} sm={6}>
																										<Typography variant="caption" color="text.secondary">Email</Typography>
																										<Typography>{selectedCustomer.email}</Typography>
																								</Grid> */}
																								<Grid item xs={12} sm={6}>
																										<Typography variant="caption" color="text.secondary">Phone</Typography>
																										<Typography>{selectedCustomer?.phone_number || 'N/A'}</Typography>
																								</Grid>
																								<Grid item xs={12} sm={6}>
																									<Typography variant="caption">Meter Number</Typography>
																									<Typography>{selectedCustomer?.meter_number}</Typography>
																								</Grid>

																								<Grid item xs={12} sm={6}>
																									<Typography variant="caption">Customer Category</Typography>
																									<Typography>{selectedCustomer?.customer_category?.name}</Typography>
																								</Grid>

																								<Grid item xs={12} sm={6}>
																									<Typography variant="caption">Customer Class</Typography>
																									<Typography>{selectedCustomer?.customer_class?.name}</Typography>
																								</Grid>

																								<Grid item xs={12} sm={6}>
																									<Typography variant="caption">Metering Type</Typography>
																									<Typography>{selectedCustomer?.metering_type?.name}</Typography>
																								</Grid>

																								<Grid item xs={12} sm={6}>
																									<Typography variant="caption">Wallet Balance</Typography>
																									<Typography>₦{selectedCustomer?.wallet?.balance}</Typography>
																								</Grid>
																								{/* {selectedCustomer.address && (
																										<Grid item xs={12}>
																												<Typography variant="caption" color="text.secondary">Address</Typography>
																												<Typography>
																														{[
																																selectedCustomer.address,
																																selectedCustomer.city,
																																selectedCustomer.state,
																																selectedCustomer.country,
																																selectedCustomer.postal_code,
																														].filter(Boolean).join(', ')}
																												</Typography>
																										</Grid>
																								)} */}
																								<Grid item xs={12} sm={6}>
																										<Typography variant="caption" color="text.secondary">Organisations</Typography>
																										<Typography>{0}</Typography>
																								</Grid>
																								<Grid item xs={12} sm={6}>
																										<Typography variant="caption" color="text.secondary">Admins</Typography>
																										<Typography>{0}</Typography>
																								</Grid>
																						</Grid>
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
																																										loadVendorDetails(selectedCustomer.id);
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
																																				await updateVendorPermissions(selectedCustomer.id, updated);
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
																																				await updateVendorPermissions(selectedCustomer.id, updated);
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
																																		await updateVendorPermissions(selectedCustomer.id, updated);
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
																														updateVendorPermissions(selectedCustomer.id, updated).then(() => {
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
								<DialogTitle>
									{formMode === "create" ? "Create Customer" : "Edit Customer"}
								</DialogTitle>

								<DialogContent>
									<Stack spacing={2} sx={{ mt: 1 }}>

										<TextField
											label="Customer Name"
											value={customerForm.name || ""}
											onChange={(e) =>
												setCustomerForm({ ...customerForm, name: e.target.value })
											}
											fullWidth
											required
										/>

										<TextField
											label="Email"
											type="email"
											value={customerForm.email || ""}
											onChange={(e) =>
												setCustomerForm({ ...customerForm, email: e.target.value })
											}
											fullWidth
											required
										/>

										<TextField
											label="Phone Number"
											value={customerForm.phone_number || ""}
											onChange={(e) =>
												setCustomerForm({ ...customerForm, phone_number: e.target.value })
											}
											fullWidth
											required
										/>

										<TextField
											label="Address"
											value={customerForm.address || ""}
											onChange={(e) =>
												setCustomerForm({ ...customerForm, address: e.target.value })
											}
											fullWidth
											multiline
											rows={2}
										/>

										{/* CUSTOMER CATEGORY */}

										<FormControl fullWidth>
											<InputLabel>Customer Category</InputLabel>
											<Select
												value={customerForm.customer_category || ""}
												label="Customer Category"
												onChange={(e) =>
													setCustomerForm({
														...customerForm,
														customer_category: Number(e.target.value),
													})
												}
											>
												{(categories || []).map((cat) => (
													<MenuItem key={cat.id} value={cat.id}>
														{cat.name}
													</MenuItem>
												))}
											</Select>
										</FormControl>

										{/* CUSTOMER CLASS */}

										<FormControl fullWidth>
											<InputLabel>Customer Class</InputLabel>
											<Select
												value={customerForm.customer_class || ""}
												label="Customer Class"
												onChange={(e) =>
													setCustomerForm({
														...customerForm,
														customer_class: Number(e.target.value),
													})
												}
											>
												{(classes || []).map((cls) => (
													<MenuItem key={cls.id} value={cls.id}>
														{cls.name}
													</MenuItem>
												))}
											</Select>
										</FormControl>

										{/* METERING TYPE */}

										<FormControl fullWidth>
											<InputLabel>Metering Type</InputLabel>
											<Select
												value={customerForm.metering_type || ""}
												label="Metering Type"
												onChange={(e) =>
													setCustomerForm({
														...customerForm,
														metering_type: Number(e.target.value),
													})
												}
											>
												{(meterTypes || []).map((meter) => (
													<MenuItem key={meter.id} value={meter.id}>
														{meter.name}
													</MenuItem>
												))}
											</Select>
										</FormControl>

									</Stack>
								</DialogContent>
								<DialogActions>
										<Button onClick={() => setVendorDialogOpen(false)}>Cancel</Button>
										<Button
												variant="contained"
												onClick={handleSaveVendor}
												disabled={saving}
												startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}>
												{saving
														? formMode === "create"
																? "Creating..."
																: "Saving..."
														: formMode === "create"
														? "Create"
														: "Save"}
										</Button>
								</DialogActions>
						</Dialog>

				
						{/* Delete Confirmation Dialog */}
						<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
								<DialogTitle>Delete Vendor</DialogTitle>
								<DialogContent>
										<Typography>
												Are you sure you want to delete {selectedCustomer?.name}? This action cannot be undone.
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
				
						{notification && (
						<Snackbar
								open
								autoHideDuration={4000}
								onClose={() => setNotification(null)}
								anchorOrigin={{ vertical: "top", horizontal: "right" }}
						>
								<Alert
								severity={notification.type}
								onClose={() => setNotification(null)}
								sx={{ width: "100%" }}
								>
								{notification.message}
								</Alert>
						</Snackbar>
						)}
				</Box>
		);
};

export default CustomerManagement;

