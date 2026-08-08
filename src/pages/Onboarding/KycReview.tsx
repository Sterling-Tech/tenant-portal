import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import {
  getPendingKycVendors,
  Vendor,
} from "../../services/onbordingService";

import VendorKycReview from "../../pages/Onboarding/VendorKycReview";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { toast } from "react-toastify";

interface KycReviewProps {
  onReviewComplete?: () => void;
}

const KycReview: React.FC<KycReviewProps> = ({
  onReviewComplete,
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedVendor, setSelectedVendor] =
    useState<Vendor | null>(null);

  const [reviewOpen, setReviewOpen] = useState(false);

  const fetchPendingKyc = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPendingKycVendors();

      console.log("Pending KYC vendors:", response);

      setVendors(response);
    } catch (error) {
      console.error("Failed to load pending KYC vendors:", error);

      const message = getErrorMessage(error);

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingKyc();
  }, [fetchPendingKyc]);

  const handleReview = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setReviewOpen(true);
  };

  const handleCloseReview = () => {
    setReviewOpen(false);
    setSelectedVendor(null);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.trim()
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "VE"
    );
  };

  return (
    <>
      <Card
        sx={{
          mb: 3,
          border: "1px solid #E4E7EC",
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.08)",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* Header */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  bgcolor: "#FFF7E6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FactCheckOutlinedIcon
                  sx={{ color: "#B54708" }}
                />
              </Box>

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700 }}
                  >
                    KYC Review
                  </Typography>

                  <Chip
                    size="small"
                    label={vendors.length}
                    sx={{
                      bgcolor: "#FFF7E6",
                      color: "#B54708",
                      fontWeight: 700,
                    }}
                  />
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Vendors awaiting KYC verification and approval
                </Typography>
              </Box>
            </Stack>

            <Button
              size="small"
              variant="outlined"
              startIcon={
                loading ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshIcon />
                )
              }
              onClick={fetchPendingKyc}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>

          <Divider />

          {/* Error */}
          {error && (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          {/* Loading */}
          {loading && vendors.length === 0 ? (
            <Box
              sx={{
                minHeight: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : vendors.length === 0 ? (
            /* Empty state */
            <Box
              sx={{
                py: 6,
                px: 3,
                textAlign: "center",
              }}
            >
              <FactCheckOutlinedIcon
                sx={{
                  fontSize: 45,
                  color: "#98A2B3",
                  mb: 1,
                }}
              />

              <Typography
                variant="subtitle1"
                fontWeight={700}
              >
                No pending KYC reviews
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                All vendor KYC submissions have been reviewed.
              </Typography>
            </Box>
          ) : (
            /* Table */
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Hierarchy</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow
                      key={vendor.id}
                      hover
                    >
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 38,
                              height: 38,
                              bgcolor: "#0F2D6B",
                              fontSize: 14,
                              fontWeight: 700,
                            }}
                          >
                            {getInitials(
                              vendor.business_name
                            )}
                          </Avatar>

                          <Box>
                            <Typography
                              fontWeight={600}
                            >
                              {vendor.business_name}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {vendor.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ textTransform: "capitalize" }}
                        >
                          {vendor.hierachy.replace(
                            "_",
                            " "
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(
                            vendor.kyc_submitted_at
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label="Pending Review"
                          sx={{
                            bgcolor: "#FEF3C7",
                            color: "#92400E",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          endIcon={<ArrowForwardIcon />}
                          onClick={() =>
                            handleReview(vendor)
                          }
                          sx={{
                            bgcolor: "#0F2D6B",
                            textTransform: "none",
                          }}
                        >
                          Review KYC
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* KYC Review Dialog */}
      <VendorKycReview
        open={reviewOpen}
        vendor={selectedVendor}
        onClose={handleCloseReview}
        onReviewComplete={fetchPendingKyc}
      />
    </>
  );
};

export default KycReview;