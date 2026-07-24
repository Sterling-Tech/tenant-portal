import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Chip,
    Typography,
    Stack,
    IconButton,
    Tooltip,
} from "@mui/material";

import {
    AssignedVendor,
    retrieveAssignedVendors,
    unassignVendor,
} from "../../services/ringfenceService";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { toast } from "react-toastify";

interface Props {
    open: boolean;
    schemeId?: number;
    onClose: () => void;
}

export default function SchemeVendorList({
    open,
    schemeId,
    onClose,
}: Props) {
    const [vendors, setVendors] = useState<AssignedVendor[]>([]);
    const [loading, setLoading] = useState(false);
    const [removingId, setRemovingId] = useState<number | null>(null);

    useEffect(() => {
        if (open && schemeId) {
            load();
        }
    }, [open, schemeId]);

    const load = async () => {
        try {
            setLoading(true);

            const res = await retrieveAssignedVendors(schemeId!);

            setVendors(res);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveVendor = async (vendorId: number) => {
        if (!schemeId) return;

        const confirmed = window.confirm(
            "Remove this vendor from the scheme?"
        );

        if (!confirmed) return;

        try {
            setRemovingId(vendorId);

            await unassignVendor(schemeId, vendorId);

            toast.success("Vendor removed successfully.");

            // Remove from UI immediately
            setVendors(prev =>
                prev.filter(v => v.vendor.id !== vendorId)
            );

        } catch (err) {
            console.error(err);
            toast.error("Unable to remove vendor.");
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle className="bg-blue-800 text-white">
                Assigned Vendors
            </DialogTitle>

            <DialogContent dividers>
                {loading ? (
                    <Stack alignItems="center" py={4}>
                        <CircularProgress />
                    </Stack>
                ) : vendors.length === 0 ? (
                    <Typography color="text.secondary">
                        No vendors assigned.
                    </Typography>
                ) : (
                    <List>
                        {vendors.map((item) => (
                            <ListItem
                                key={item.id}
                                divider
                                secondaryAction={
                                    <Tooltip title="Remove Vendor">
                                        <span>
                                            <IconButton
                                                color="error"
                                                disabled={removingId === item.vendor.id}
                                                onClick={() =>
                                                    handleRemoveVendor(item.vendor.id)
                                                }
                                            >
                                                {removingId === item.vendor.id ? (
                                                    <CircularProgress size={18} />
                                                ) : (
                                                    <DeleteOutlineIcon />
                                                )}
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar>
                                        {item.vendor.business_name.charAt(0)}
                                    </Avatar>
                                </ListItemAvatar>

                                <ListItemText
                                    primary={item.vendor.business_name}
                                    secondary={item.vendor.email}
                                />

                                <Chip
                                    className="mr-10"
                                    label={item.vendor.account_status}
                                    color={
                                        item.vendor.account_status === "active"
                                            ? "success"
                                            : "default"
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}