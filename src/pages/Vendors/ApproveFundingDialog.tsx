import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
    Divider,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

import { FundingRequest } from "../../services/vendorService";

interface Props {
    open: boolean;
    loading?: boolean;
    request: FundingRequest | null;
    action:
    | "review"
    | "approve"
    | "reject";
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export default function ApproveFundingDialog({
    open,
    loading = false,
    request,
    action,
    onClose,
    onConfirm,
}: Props) {
    if (!request) return null;

    const approving = action === "approve";
    const reviewing = action === "review";
    const rejecting = action === "reject";

    const chipColor =
        request.status === "approved"
            ? "success.main"
            : request.status === "rejected"
                ? "error.main"
                : "warning.main";

    const dialogTitle = reviewing
        ? "Review Funding Request"
        : approving
            ? "Approve Funding Request"
            : "Reject Funding Request";

    const actionLabel = reviewing
        ? "Review"
        : approving
            ? "Approve"
            : "Reject";
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: "0 6px 18px rgba(15,45,107,.18)",
                },
            }}
        >
            {/* Header */}

            <DialogTitle
                sx={{
                    bgcolor: "#0F2D6B",
                    color: "#fff",
                    py: 2,
                    px: 3,
                }}
            >
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box display="flex" alignItems="center" gap={1.5}>
                        {
                            (approving || reviewing) ? (
                                <CheckCircleOutlineIcon
                                    sx={{
                                        color: "#4ADE80",
                                        fontSize: 28,
                                    }}
                                />
                            ) : (
                                <CancelOutlinedIcon
                                    sx={{
                                        color: "#F87171",
                                        fontSize: 28,
                                    }}
                                />
                            )
                        }

                        <Box>
                            <Typography
                                fontWeight={700}
                                fontSize={20}
                            >
                                {
                                    dialogTitle
                                }
                            </Typography>

                            <Typography
                                fontSize={13}
                                sx={{ opacity: .8 }}
                            >
                                Confirm your action
                            </Typography>
                        </Box>
                    </Box>

                    <IconButton
                        sx={{ color: "#fff" }}
                        disabled={loading}
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            {/* Body */}

            <DialogContent sx={{ p: 3, mt: 1 }}>

                <Typography
                    sx={{
                        fontSize: 16,
                        mb: 3,
                    }}
                >
                    Are you sure you want to{" "}
                    <Box
                        component="span"
                        sx={{
                            fontWeight: 700,
                            color: reviewing
                                ? "warning.main"
                                : approving
                                    ? "success.main"
                                    : "error.main",
                        }}
                    >
                        {
                            actionLabel.toUpperCase()
                        }
                    </Box>{" "}
                    this funding request?
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Box
                    sx={{
                        display: "grid",
                        rowGap: 2,
                    }}
                >
                    <Box
                        display="flex"
                        justifyContent="space-between"
                    >
                        <Typography color="text.secondary">
                            Vendor
                        </Typography>

                        <Typography fontWeight={600}>
                            {request.vendor.business_name}
                        </Typography>
                    </Box>

                    <Box
                        display="flex"
                        justifyContent="space-between"
                    >
                        <Typography color="text.secondary">
                            Email
                        </Typography>

                        <Typography fontWeight={600}>
                            {request.vendor.email}
                        </Typography>
                    </Box>

                    <Box
                        display="flex"
                        justifyContent="space-between"
                    >
                        <Typography color="text.secondary">
                            Amount
                        </Typography>

                        <Typography
                            fontWeight={700}
                            color="primary"
                        >
                            ₦
                            {Number(
                                request.amount
                            ).toLocaleString()}
                        </Typography>
                    </Box>

                    <Box
                        display="flex"
                        justifyContent="space-between"
                    >
                        <Typography color="text.secondary">
                            Status
                        </Typography>

                        <Typography
                            fontWeight={700}
                            color={
                                chipColor
                            }
                        >
                            {request.status
                                .replace("_", " ")
                                .toUpperCase()}
                        </Typography>
                    </Box>

                    <Box
                        display="flex"
                        justifyContent="space-between"
                    >
                        <Typography color="text.secondary">
                            Reference
                        </Typography>

                        <Typography
                            fontWeight={600}
                            sx={{
                                maxWidth: 220,
                                wordBreak: "break-word",
                                textAlign: "right",
                            }}
                        >
                            {request.transaction_ref}
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>

            {/* Footer */}

            <DialogActions
                sx={{
                    px: 3,
                    py: 2,
                    borderTop: "1px solid #E5E7EB",
                }}
            >
                <Button
                    variant="outlined"
                    onClick={onClose}
                    disabled={loading}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    color={
                        reviewing
                            ? "warning"
                            : approving
                                ? "success"
                                : "error"
                    }
                    disabled={loading}
                    onClick={onConfirm}
                >
                    {
                        loading
                            ? reviewing
                                ? "Reviewing..."
                                : approving
                                    ? "Approving..."
                                    : "Rejecting..."
                            : reviewing
                                ? "Review"
                                : approving
                                    ? "Approve"
                                    : "Reject"
                    }
                </Button>
            </DialogActions>
        </Dialog>
    );
}