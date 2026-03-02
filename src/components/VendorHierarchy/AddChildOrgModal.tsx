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
} from '@mui/material';
import { VendorOrg, VendorOrgForm, VendorOrgLevel, VendorOrgStatus } from '../../types/vendor';
import { createVendorOrg } from '../../services/vendorHierarchyService';

interface AddChildOrgModalProps {
    open: boolean;
    onClose: () => void;
    parentOrg: VendorOrg | null;
    tenantId: string | null;
    onSuccess: () => void;
}

const AddChildOrgModal: React.FC<AddChildOrgModalProps> = ({
    open,
    onClose,
    parentOrg,
    tenantId,
    onSuccess,
}) => {
    const [name, setName] = useState('');
    const [level, setLevel] = useState<VendorOrgLevel>('sub_vendor');
    const [status, setStatus] = useState<VendorOrgStatus>('active');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Determine available levels based on parent
    const getAvailableLevels = (): VendorOrgLevel[] => {
        if (!parentOrg) {
            return ['vendor']; // Root level can only be vendor
        }
        switch (parentOrg.level) {
            case 'vendor':
                return ['sub_vendor', 'agent'];
            case 'sub_vendor':
                return ['agent', 'cashier'];
            case 'agent':
                return ['cashier'];
            case 'cashier':
                return []; // Cashier cannot have children
            default:
                return [];
        }
    };

    const availableLevels = getAvailableLevels();

    useEffect(() => {
        if (open && availableLevels.length > 0) {
            setLevel(availableLevels[0]);
        }
    }, [open, availableLevels]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Organization name is required');
            return;
        }

        if (!tenantId) {
            setError('Tenant ID is required');
            return;
        }

        if (availableLevels.length === 0) {
            setError('Cannot add child to this organization level');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const payload: VendorOrgForm & { tenant: string } = {
                name: name.trim(),
                level,
                status,
                parent: parentOrg?.id || null,
                tenant: tenantId,
            };
            await createVendorOrg(payload);
            onSuccess();
            handleClose();
        } catch (err: any) {
            console.error('Failed to create organization', err);
            setError(err?.message || 'Failed to create organization');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setName('');
        setLevel(availableLevels[0] || 'sub_vendor');
        setStatus('active');
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {parentOrg ? `Add Child to ${parentOrg.name}` : 'Add Root Organization'}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {parentOrg && (
                        <Alert severity="info">
                            Parent: <strong>{parentOrg.name}</strong> ({parentOrg.level})
                        </Alert>
                    )}

                    <TextField
                        label="Organization Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        required
                        autoFocus
                    />

                    <FormControl fullWidth required>
                        <InputLabel>Level</InputLabel>
                        <Select value={level} onChange={(e) => setLevel(e.target.value as VendorOrgLevel)} label="Level">
                            {availableLevels.map((lvl) => (
                                <MenuItem key={lvl} value={lvl}>
                                    {lvl.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                </MenuItem>
                            ))}
                        </Select>
                        {availableLevels.length === 0 && (
                            <Alert severity="warning" sx={{ mt: 1 }}>
                                Cannot add children to this organization level
                            </Alert>
                        )}
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as VendorOrgStatus)}
                            label="Status"
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="suspended">Suspended</MenuItem>
                            <MenuItem value="invited">Invited</MenuItem>
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
                    disabled={!name.trim() || availableLevels.length === 0 || submitting}
                    startIcon={submitting ? <CircularProgress size={20} /> : null}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddChildOrgModal;

