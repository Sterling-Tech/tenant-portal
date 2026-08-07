import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Typography,
    Card,
} from "@mui/material";

interface Props {
    open: boolean;
    onClose: () => void;
    vendor: any;
    onApprove: () => void;
    onReject: () => void;
}

export default function VendorKycReview({
    open,
    onClose,
    vendor,
    onApprove,
    onReject,
}: Props) {
    if (!vendor) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle className="bg-blue-900 text-white">
                Vendor KYC Review
            </DialogTitle>

            <DialogContent>

                <Stack spacing={3} mt={1}>

                    <Card sx={{ p:2 }}>
                        <Typography fontWeight={700}>
                            Business Information
                        </Typography>

                        <Typography>
                            <strong>Name:</strong>{" "}
                            {vendor.business_name}
                        </Typography>

                        <Typography>
                            <strong>Email:</strong>{" "}
                            {vendor.email}
                        </Typography>

                        <Typography>
                            <strong>TIN:</strong>{" "}
                            {vendor.tin}
                        </Typography>

                        <Typography>
                            <strong>CAC Number:</strong>{" "}
                            {vendor.cac_number}
                        </Typography>
                    </Card>

                    <Stack spacing={2}>

                        <Button
                            variant="outlined"
                            href={vendor.cac_document}
                            target="_blank"
                        >
                            View CAC Certificate
                        </Button>

                        <Button
                            variant="outlined"
                            href={vendor.id_document}
                            target="_blank"
                        >
                            View Government ID
                        </Button>

                        <Button
                            variant="outlined"
                            href={vendor.tin_document}
                            target="_blank"
                        >
                            View TIN Document
                        </Button>

                    </Stack>

                </Stack>

            </DialogContent>

            <DialogActions>

                <Button
                    color="error"
                    variant="outlined"
                    onClick={onReject}
                >
                    Reject
                </Button>

                <Button
                    variant="contained"
                    color="success"
                    onClick={onApprove}
                >
                    Approve
                </Button>

            </DialogActions>
        </Dialog>
    );
}