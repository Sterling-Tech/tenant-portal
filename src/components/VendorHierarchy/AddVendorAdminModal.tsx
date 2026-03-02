import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
} from '@mui/material';
import { get } from '../../services/api';
import { BindingForm, VendorOrgLevel } from '../../types/vendor';
import { addOrgBinding } from '../../services/vendorHierarchyService';

interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
}

interface AddVendorAdminModalProps {
    open: boolean;
    onClose: () => void;
    orgId: string | null;
    onSuccess: () => void;
}

const AddVendorAdminModal: React.FC<AddVendorAdminModalProps> = ({
    open,
    onClose,
    orgId,
    onSuccess,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<VendorOrgLevel>('vendor');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (open && searchTerm.length >= 2) {
            const timeoutId = setTimeout(() => {
                searchUsers(searchTerm);
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [searchTerm, open]);

    const searchUsers = async (query: string) => {
        if (!query || query.length < 2) {
            setUsers([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log('[AddVendorAdminModal] Searching users:', query);
            const data = await get<User[]>(`/users/?search=${encodeURIComponent(query)}`);
            console.log('[AddVendorAdminModal] Found users:', data.length);
            setUsers(data || []);
        } catch (err: any) {
            console.error('[AddVendorAdminModal] Failed to search users:', err);
            // Don't set error for search failures - just log and show empty results
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!orgId) {
            setError('Organization ID is required');
            return;
        }

        if (!user) {
            setError('Please select a user');
            return;
        }

        if (!role) {
            setError('Please select a role');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            console.log('[AddVendorAdminModal] Submitting binding:', {
                orgId,
                userId: user.id,
                userEmail: user.email,
                role,
            });

            const payload: BindingForm = {
                user: user.id,
                role,
                status: 'active', // Backend will convert to VendorRoleStatus.ACTIVE
            };

            const result = await addOrgBinding(orgId, payload);
            console.log('[AddVendorAdminModal] Binding created successfully:', result);

            // Show success message
            setSuccess(true);

            // Wait a moment to show success, then close and refresh
            setTimeout(() => {
                handleClose();
                onSuccess(); // Refresh bindings list
            }, 1000);
        } catch (err: any) {
            console.error('[AddVendorAdminModal] Failed to add vendor admin:', err);

            // Extract detailed error message
            let errorMessage = 'Failed to add vendor admin. Please try again.';

            if (err?.message) {
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
                } else if (data.user) {
                    errorMessage = Array.isArray(data.user) ? data.user[0] : data.user;
                } else if (data.role) {
                    errorMessage = Array.isArray(data.role) ? data.role[0] : data.role;
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

            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setUser(null);
        setRole('vendor');
        setSearchTerm('');
        setUsers([]);
        setError(null);
        setSuccess(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Vendor Admin</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    {success && (
                        <Alert severity="success">
                            Vendor admin added successfully! Refreshing...
                        </Alert>
                    )}
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <Autocomplete
                        options={users}
                        getOptionLabel={(option) =>
                            `${option.email}${option.first_name || option.last_name ? ` (${[option.first_name, option.last_name].filter(Boolean).join(' ')})` : ''}`
                        }
                        value={user}
                        onChange={(_, newValue) => {
                            setUser(newValue);
                            setError(null); // Clear error when user selects
                        }}
                        onInputChange={(_, newValue) => {
                            setSearchTerm(newValue);
                            if (newValue.length < 2) {
                                setUsers([]);
                            }
                        }}
                        loading={loading}
                        filterOptions={(x) => x} // Disable client-side filtering, use server-side search
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search User"
                                placeholder="Type to search users by email or name..."
                                required
                                helperText={
                                    searchTerm.length > 0 && searchTerm.length < 2
                                        ? 'Type at least 2 characters to search'
                                        : loading
                                            ? 'Searching...'
                                            : searchTerm.length >= 2 && users.length === 0
                                                ? 'No users found'
                                                : searchTerm.length >= 2
                                                    ? `${users.length} user${users.length !== 1 ? 's' : ''} found`
                                                    : ''
                                }
                            />
                        )}
                        noOptionsText={
                            searchTerm.length < 2
                                ? 'Type at least 2 characters to search'
                                : loading
                                    ? 'Searching...'
                                    : 'No users found'
                        }
                    />

                    <FormControl fullWidth required>
                        <InputLabel>Role</InputLabel>
                        <Select value={role} onChange={(e) => setRole(e.target.value as VendorOrgLevel)} label="Role">
                            <MenuItem value="vendor">Vendor</MenuItem>
                            <MenuItem value="sub_vendor">Sub Vendor</MenuItem>
                            <MenuItem value="agent">Agent</MenuItem>
                            <MenuItem value="cashier">Cashier</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!user || !role || submitting}
                    startIcon={submitting ? <CircularProgress size={20} /> : null}
                >
                    Add Admin
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddVendorAdminModal;

