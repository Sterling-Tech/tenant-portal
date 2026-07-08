import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { RefundRequestRow } from "./RefundRequestsTable";

interface Props {
  open: boolean;
  refund: RefundRequestRow | null;
  onClose: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  success: "#1A9D5C",
  pending: "#D98C0F",
  failed: "#D9362F",
};

export default function RefundDetailsDialog({
  open,
  refund,
  onClose,
}: Props) {
  if (!refund) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle
        sx={{
          bgcolor: "#12295A",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Refund Details

        <IconButton
          onClick={onClose}
          sx={{ color: "#fff" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Label title="Customer" value={refund.customer} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Label title="Account Number" value={refund.account} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Label title="Meter Number" value={refund.meterNumber} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Label title="Refund Amount" value={refund.amount} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Label title="Reference" value={refund.reference} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Label title="Arrears Code" value={refund.arrearsCode} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              fontWeight={700}
              mb={1}
            >
              Status
            </Typography>

            <Chip
              label={refund.status}
              sx={{
                bgcolor: `${STATUS_COLOR[
                  refund.status.toLowerCase()
                ]}20`,
                color:
                  STATUS_COLOR[
                    refund.status.toLowerCase()
                  ],
                fontWeight: 700,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Label
              title="Created"
              value={refund.createdAt}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <Label
              title="Email Delivered"
              value={refund.emailSent ? "Yes" : "No"}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Label
              title="SMS Sent"
              value={refund.smsSent ? "Yes" : "No"}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="contained"
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Label({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <Box>
      <Typography
        color="text.secondary"
        fontSize={13}
      >
        {title}
      </Typography>

      <Typography
        fontWeight={600}
        mt={0.5}
      >
        {value}
      </Typography>
    </Box>
  );
}
