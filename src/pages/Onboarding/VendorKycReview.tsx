import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Card,
  TextField,
  Alert,
  CircularProgress,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

import { reviewVendorKyc } from "../../services/onbordingService";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";

interface VendorKycReviewProps {
  open: boolean;
  onClose: () => void;
  vendor: any;
  onReviewComplete?: () => void;
}

type ConfirmationAction = "approve" | "reject" | null;

export default function VendorKycReview({
  open,
  onClose,
  vendor,
  onReviewComplete,
}: VendorKycReviewProps) {
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Confirmation dialog state
  const [confirmationAction, setConfirmationAction] =
    useState<ConfirmationAction>(null);

  if (!vendor) return null;

  const handleClose = () => {
    if (submitting) return;

    setRejectMode(false);
    setReason("");
    setConfirmationAction(null);

    onClose();
  };

  /**
   * Open approval confirmation dialog
   */
  const handleApproveClick = () => {
    setConfirmationAction("approve");
  };

  /**
   * Open rejection confirmation dialog
   */
  const handleRejectClick = () => {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      toast.error("Please provide a reason for rejecting the KYC.");
      return;
    }

    setConfirmationAction("reject");
  };

  /**
   * Actually approve the vendor
   */
  const confirmApproval = async () => {
    try {
      setSubmitting(true);

      await reviewVendorKyc({
        vendor: vendor.id,
        action: "approve",
        reason: "",
      });

      toast.success("Vendor KYC approved successfully.");

      setConfirmationAction(null);
      setRejectMode(false);
      setReason("");

      onClose();

      onReviewComplete?.();
    } catch (error) {
      console.error("Failed to approve vendor KYC:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Actually reject the vendor
   */
  const confirmRejection = async () => {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    try {
      setSubmitting(true);

      await reviewVendorKyc({
        vendor: vendor.id,
        action: "reject",
        reason: trimmedReason,
      });

      toast.success("Vendor KYC rejected.");

      setConfirmationAction(null);
      setRejectMode(false);
      setReason("");

      onClose();

      onReviewComplete?.();
    } catch (error) {
      console.error("Failed to reject vendor KYC:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const closeConfirmation = () => {
    if (submitting) return;
    setConfirmationAction(null);
  };

  return (
    <>
      {/* =========================================================
          MAIN KYC REVIEW DIALOG
      ========================================================== */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700}>
              Vendor KYC Review
            </Typography>

            <Chip
              label={vendor.onboarding_status}
              color="warning"
              size="small"
            />
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>

            {/* Business Information */}
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography fontWeight={700} mb={2}>
                Business Information
              </Typography>

              <Stack spacing={1}>
                <Typography>
                  <strong>Business Name:</strong>{" "}
                  {vendor.business_name || "-"}
                </Typography>

                <Typography>
                  <strong>Email:</strong>{" "}
                  {vendor.email || "-"}
                </Typography>

                <Typography>
                  <strong>Phone:</strong>{" "}
                  {vendor.phone_number || "-"}
                </Typography>

                <Typography>
                  <strong>Vendor Type:</strong>{" "}
                  {vendor.vendor_type || "-"}
                </Typography>

                <Typography>
                  <strong>Account Status:</strong>{" "}
                  {vendor.account_status || "-"}
                </Typography>
              </Stack>
            </Card>

            {/* Business Profile */}
            {vendor.profile && (
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight={700} mb={2}>
                  Business Profile
                </Typography>

                <Stack spacing={1}>
                  <Typography>
                    <strong>Industry:</strong>{" "}
                    {vendor.profile.industry || "-"}
                  </Typography>

                  <Typography>
                    <strong>Category:</strong>{" "}
                    {vendor.profile.category || "-"}
                  </Typography>

                  <Typography>
                    <strong>Registration Number:</strong>{" "}
                    {vendor.profile.registration_number || "-"}
                  </Typography>

                  <Typography>
                    <strong>CAC Registration Number:</strong>{" "}
                    {vendor.profile.cac_registration_number || "-"}
                  </Typography>

                  <Typography>
                    <strong>Address:</strong>{" "}
                    {vendor.profile.address || "-"}
                  </Typography>

                  <Typography>
                    <strong>City:</strong>{" "}
                    {vendor.profile.city || "-"}
                  </Typography>

                  <Typography>
                    <strong>State:</strong>{" "}
                    {vendor.profile.state || "-"}
                  </Typography>

                  <Typography>
                    <strong>Country:</strong>{" "}
                    {vendor.profile.country || "-"}
                  </Typography>

                  {vendor.profile.website && (
                    <Typography>
                      <strong>Website:</strong>{" "}
                      {vendor.profile.website}
                    </Typography>
                  )}
                </Stack>
              </Card>
            )}

            {/* Bank Accounts */}
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography fontWeight={700} mb={2}>
                Bank Accounts
              </Typography>

              {vendor.bank_accounts?.length ? (
                <Stack spacing={2}>
                  {vendor.bank_accounts.map((account: any) => (
                    <Box key={account.id}>
                      <Typography>
                        <strong>Bank:</strong>{" "}
                        {account.bank_name}
                      </Typography>

                      <Typography>
                        <strong>Account Name:</strong>{" "}
                        {account.account_name}
                      </Typography>

                      <Typography>
                        <strong>Account Number:</strong>{" "}
                        {account.account_number}
                      </Typography>

                      <Typography>
                        <strong>Verification:</strong>{" "}
                        {account.verification_status}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  No bank account information available.
                </Typography>
              )}
            </Card>

            {/* Owners */}
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography fontWeight={700} mb={2}>
                Business Owners
              </Typography>

              {vendor.owners?.length ? (
                <Stack spacing={2}>
                  {vendor.owners.map((owner: any) => (
                    <Box key={owner.id}>
                      <Typography>
                        <strong>Name:</strong>{" "}
                        {owner.name}
                      </Typography>

                      <Typography>
                        <strong>Date of Birth:</strong>{" "}
                        {owner.dob}
                      </Typography>

                      <Typography>
                        <strong>Nationality:</strong>{" "}
                        {owner.nationality}
                      </Typography>

                      <Typography>
                        <strong>ID Type:</strong>{" "}
                        {owner.id_type}
                      </Typography>

                      <Typography>
                        <strong>ID Number:</strong>{" "}
                        {owner.id_number}
                      </Typography>

                      <Typography>
                        <strong>Verification:</strong>{" "}
                        {owner.verification_status}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  No owner information available.
                </Typography>
              )}
            </Card>

            {/* Agreement */}
            {vendor.agreement && (
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight={700} mb={2}>
                  Agreement
                </Typography>

                <Stack spacing={1}>
                  <Typography>
                    <strong>Entity Name:</strong>{" "}
                    {vendor.agreement.entity_name || "-"}
                  </Typography>

                  <Typography>
                    <strong>Signatory:</strong>{" "}
                    {vendor.agreement.signatory_name || "-"}
                  </Typography>

                  <Typography>
                    <strong>Email:</strong>{" "}
                    {vendor.agreement.signatory_email || "-"}
                  </Typography>

                  <Typography>
                    <strong>Phone:</strong>{" "}
                    {vendor.agreement.signatory_phone_number || "-"}
                  </Typography>

                  <Typography>
                    <strong>Status:</strong>{" "}
                    {vendor.agreement.status || "-"}
                  </Typography>
                </Stack>
              </Card>
            )}

            {/* Rejection reason */}
            {rejectMode && (
              <Alert severity="warning">
                <Typography fontWeight={600} mb={1}>
                  Rejection Reason
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  placeholder="Explain why this vendor's KYC is being rejected..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={submitting}
                  sx={{ mt: 1 }}
                />
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          {!rejectMode ? (
            <>
              <Button
                color="error"
                variant="outlined"
                startIcon={<CancelOutlinedIcon />}
                onClick={() => setRejectMode(true)}
                disabled={submitting}
              >
                Reject
              </Button>

              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlineIcon />}
                onClick={handleApproveClick}
                disabled={submitting}
              >
                Approve
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={() => {
                  setRejectMode(false);
                  setReason("");
                }}
                disabled={submitting}
              >
                Back
              </Button>

              <Button
                variant="contained"
                color="error"
                startIcon={<CancelOutlinedIcon />}
                onClick={handleRejectClick}
                disabled={submitting || !reason.trim()}
              >
                Reject KYC
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* =========================================================
          APPROVAL CONFIRMATION DIALOG
      ========================================================== */}
      <Dialog
        open={confirmationAction === "approve"}
        onClose={closeConfirmation}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <CheckCircleOutlineIcon color="success" />

            <Typography fontWeight={700}>
              Approve Vendor KYC?
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Typography>
              Are you sure you want to approve the KYC
              for <strong>{vendor.business_name}</strong>?
            </Typography>

            <Alert severity="success">
              Approving this vendor confirms that the submitted
              onboarding information has been reviewed and accepted.
            </Alert>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              This action will mark the vendor's onboarding as
              approved. Make sure all submitted information has
              been properly verified before continuing.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeConfirmation}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={confirmApproval}
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <CheckCircleOutlineIcon />
              )
            }
          >
            {submitting ? "Approving..." : "Yes, Approve"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =========================================================
          REJECTION CONFIRMATION DIALOG
      ========================================================== */}
      <Dialog
        open={confirmationAction === "reject"}
        onClose={closeConfirmation}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <WarningAmberOutlinedIcon color="error" />

            <Typography fontWeight={700}>
              Reject Vendor KYC?
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Typography>
              Are you sure you want to reject the KYC for{" "}
              <strong>{vendor.business_name}</strong>?
            </Typography>

            <Alert severity="error">
              The vendor will need to fix the identified issues
              and resubmit their KYC.
            </Alert>

            <Divider />

            <Typography fontWeight={600}>
              Rejection reason
            </Typography>

            <Box
              sx={{
                bgcolor: "#F8F9FA",
                border: "1px solid #E0E0E0",
                borderRadius: 1,
                p: 2,
              }}
            >
              <Typography variant="body2">
                {reason}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeConfirmation}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={confirmRejection}
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <CancelOutlinedIcon />
              )
            }
          >
            {submitting ? "Rejecting..." : "Yes, Reject KYC"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}