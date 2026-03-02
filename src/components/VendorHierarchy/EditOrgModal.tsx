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
import { VendorOrg, VendorOrgForm, VendorOrgStatus } from '../../types/vendor';
import { updateVendorOrg } from '../../services/vendorHierarchyService';

interface EditOrgModalProps {
    open: boolean;
    onClose: () => void;
    org: VendorOrg | null;
    onSuccess: () => void;
}

const EditOrgModal: React.FC<EditOrgModalProps> = ({ open, onClose, org, onSuccess }) => {
    const [name, setName] = useState('');
    const [status, setStatus] = useState<VendorOrgStatus>('active');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (org) {
            setName(org.name);
            setStatus(org.status);
        }
    }, [org]);

    const handleSubmit = async () => {
        if (!org) return;

        if (!name.trim()) {
            setError('Organization name is required');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const payload: Partial<VendorOrgForm> = {
                name: name.trim(),
                status,
            };
            await updateVendorOrg(org.id, payload);
            onSuccess();
            handleClose();
        } catch (err: any) {
            console.error('Failed to update organization', err);
            setError(err?.message || 'Failed to update organization');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (org) {
            setName(org.name);
            setStatus(org.status);
        }
        setError(null);
        onClose();
    };

    if (!org) return null;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <Alert severity="info">
                        Level: <strong>{org.level}</strong> | Slug: <strong>{org.slug}</strong>
                    </Alert>

                    <TextField
                        label="Organization Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        required
                        autoFocus
                    />

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
                    disabled={!name.trim() || submitting}
                    startIcon={submitting ? <CircularProgress size={20} /> : null}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditOrgModal;

