import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Stack,
} from '@mui/material';
import { VendorOrg } from '../../types/vendor';
import { deleteVendorOrg } from '../../services/vendorHierarchyService';

interface DeleteOrgModalProps {
    open: boolean;
    onClose: () => void;
    org: VendorOrg | null;
    onSuccess: () => void;
}

const DeleteOrgModal: React.FC<DeleteOrgModalProps> = ({ open, onClose, org, onSuccess }) => {
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleDelete = async () => {
        if (!org) return;

        setSubmitting(true);
        setError(null);

        try {
            await deleteVendorOrg(org.id);
            onSuccess();
            handleClose();
        } catch (err: any) {
            console.error('Failed to delete organization', err);
            setError(err?.message || 'Failed to delete organization');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setError(null);
        onClose();
    };

    if (!org) return null;

    const hasChildren = org.children && org.children.length > 0;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {hasChildren && (
                        <Alert severity="warning">
                            This organization has {org.children?.length} child organization(s). Deleting it may affect
                            the hierarchy structure.
                        </Alert>
                    )}

                    <Typography>
                        Are you sure you want to delete <strong>{org.name}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        This action cannot be undone. All associated data, bindings, and child organizations may be
                        affected.
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleDelete}
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} /> : null}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteOrgModal;

