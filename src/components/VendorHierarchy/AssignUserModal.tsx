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

interface AssignUserModalProps {
    open: boolean;
    onClose: () => void;
    orgId: string | null;
    onSuccess: () => void;
}

const AssignUserModal: React.FC<AssignUserModalProps> = ({
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

    useEffect(() => {
        if (open && searchTerm.length >= 2) {
            const timeoutId = setTimeout(() => {
                searchUsers(searchTerm);
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [searchTerm, open]);

    const searchUsers = async (query: string) => {
        if (!query || query.length < 2) return;
        setLoading(true);
        setError(null);
        try {
            const data = await get<User[]>(`/users/?search=${encodeURIComponent(query)}`);
            setUsers(data);
        } catch (err: any) {
            console.error('Failed to search users', err);
            setError(err?.message || 'Failed to search users');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!orgId || !user) {
            setError('Please select a user');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const payload: BindingForm = {
                user: user.id,
                role,
                status: 'active',
            };
            await addOrgBinding(orgId, payload);
            onSuccess();
        } catch (err: any) {
            console.error('Failed to assign user', err);
            setError(err?.message || 'Failed to assign user');
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
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Assign User to Organization</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
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
                        onChange={(_, newValue) => setUser(newValue)}
                        onInputChange={(_, newValue) => setSearchTerm(newValue)}
                        loading={loading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search User"
                                placeholder="Type to search users by email or name..."
                                required
                            />
                        )}
                        noOptionsText={searchTerm.length < 2 ? 'Type at least 2 characters to search' : 'No users found'}
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
                    Assign User
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssignUserModal;

