import React, { useEffect, useState } from 'react'
import { fundingOperation, getFundingRequests } from '../../services/vendorService';
import type { FundingRequest, FundingRequestStatus } from '../../services/vendorService';
import { Tabs, Tab, IconButton, TableContainer, Chip, TableHead, Paper, Table, TableBody, Menu, MenuItem, TableCell, TableRow, Box, CircularProgress, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ApproveFundingDialog from './ApproveFundingDialog';
import { usePermission } from '../../hooks/usePermission';


export default function FundingRequest() {
    const [requests, setRequests] = useState<FundingRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<FundingRequest | null>(null);
    const [openApprove, setOpenApprove] = useState(false);
    const [openReject, setOpenReject] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const [activeTab, setActiveTab] =
        useState<FundingRequestStatus>("pending_review");
    const [openReview, setOpenReview] = useState(false)

    const loadFundingRequests = async () => {
        try {

            setLoading(true);

            const response =
                await getFundingRequests({
                    page,
                    ordering: "-request_time",
                    request_status: activeTab,
                });
            setRequests(response.results);

            setTotalCount(response.count);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {
        loadFundingRequests();
    }, [page, activeTab]);

    const handleReview = async () => {
        if (!selectedRequest) return;

        try {
            setProcessing(true);

            await fundingOperation({
                funding_request: selectedRequest.id,
                action: "review",
            });

            toast.success(
                "Funding request reviewed."
            );

            setOpenReview(false);

            await loadFundingRequests();

        } catch (err: any) {

            toast.error(
                err.message ??
                "Unable to review request"
            );

        } finally {
            setProcessing(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        try {
            setProcessing(true);

            await fundingOperation({
                funding_request: selectedRequest.id,
                action: "approve",
            });

            toast.success("Funding request approved.");

            setOpenApprove(false);
            setSelectedRequest(null);

            await loadFundingRequests();
        } catch (err: any) {
            toast.error(
                err.message || "Unable to approve request"
            );
        } finally {
            setProcessing(false);
        }
    };
    const handleReject = async () => {
        if (!selectedRequest) return;

        try {
            setProcessing(true);

            await fundingOperation({
                funding_request: selectedRequest.id,
                action: "reject",
            });

            toast.success("Funding request rejected.");

            setOpenReject(false);
            setSelectedRequest(null);

            await loadFundingRequests();
        } catch (err: any) {
            toast.error(
                err.message || "Unable to reject request"
            );
        } finally {
            setProcessing(false);
        }
    };
    const handleMenuClick = (
        event: React.MouseEvent<HTMLElement>,
        request: FundingRequest
    ) => {
        setAnchorEl(event.currentTarget);
        setSelectedRequest(request);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const status = selectedRequest?.status;

    const emptyMessage = {
        pending_review:
            "No requests awaiting review.",

        pending_approval:
            "No requests awaiting approval.",

        approved:
            "No approved funding requests.",

        rejected:
            "No rejected funding requests.",
    }[activeTab];

    const { can } = usePermission();

    return (
        <div>
            <Tabs
                value={activeTab}
                onChange={(_, value) => {
                    setPage(1);
                    setActiveTab(value);
                }}
                sx={{ mb: 3 }}
            >

                <Tab
                    value="pending_review"
                    label={`Pending Review ${activeTab === "pending_review"
                        ? `(${totalCount})`
                        : ""
                        }`}
                />
                <Tab
                    label={`Pending Approval ${activeTab === "pending_approval"
                        ? `(${totalCount})`
                        : ""
                        }`}
                    value="pending_approval"
                />

                <Tab
                    label={`Approved ${activeTab === "approved"
                        ? `(${totalCount})`
                        : ""
                        }`}
                    value="approved"
                />

                <Tab
                    label={`Rejected ${activeTab === "rejected"
                        ? `(${totalCount})`
                        : ""
                        }`}
                    value="rejected"
                />
            </Tabs>

            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                }}
            >
                <Table>

                    {/* Header */}

                    <TableHead
                        sx={{
                            bgcolor: "#0F2D6B",
                        }}
                    >
                        <TableRow>
                            <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                                Vendor
                            </TableCell>

                            <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                                Email
                            </TableCell>

                            <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                                Amount
                            </TableCell>

                            <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                                Status
                            </TableCell>

                            <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                                Transaction Ref
                            </TableCell>

                            <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                                Request Time
                            </TableCell>

                            <TableCell
                                align="center"
                                sx={{ color: "#fff", fontWeight: 700 }}
                            >
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    {/* Body */}

                    <TableBody>

                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : requests.length == 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        justifyContent="center"
                                        alignItems="center"
                                        gap={2}
                                    >
                                        <Typography color="text.secondary">
                                            {emptyMessage}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((request) => (

                                <TableRow
                                    key={request.id}
                                    hover
                                >
                                    <TableCell>
                                        {request.vendor.business_name}
                                    </TableCell>

                                    <TableCell>
                                        {request.vendor.email}
                                    </TableCell>

                                    <TableCell>
                                        ₦{Number(request.amount).toLocaleString()}
                                    </TableCell>

                                    <TableCell>

                                        <Chip
                                            label={request.status.replace("_", " ").toUpperCase()}
                                            color={
                                                request.status === "approved"
                                                    ? "success"
                                                    : request.status === "rejected"
                                                        ? "error"
                                                        : "warning"
                                            }
                                            size="small"
                                        />

                                    </TableCell>

                                    <TableCell>
                                        {request.transaction_ref}
                                    </TableCell>

                                    <TableCell>
                                        {new Date(
                                            request.request_time
                                        ).toLocaleString()}
                                    </TableCell>

                                    <TableCell align="center">
                                        {(request.status === "pending_review" ||
                                            request.status === "pending_approval") && (
                                                <IconButton
                                                    onClick={(e) =>
                                                        handleMenuClick(e, request)
                                                    }
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            )}
                                    </TableCell>
                                </TableRow>

                            )
                            ))}

                    </TableBody>

                </Table>

            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
            >
                {/* {status === "pending_review" && can("review_funding_requests") && ( */}
                {status === "pending_review" && (
                    <>
                        <MenuItem
                            onClick={() => {
                                handleMenuClose();
                                setOpenReview(true);
                            }}
                        >
                            Review
                        </MenuItem>

                        <MenuItem
                            sx={{ color: "error.main" }}
                            onClick={() => {
                                handleMenuClose();
                                setOpenReject(true);
                            }}
                        >
                            Reject
                        </MenuItem>
                    </>
                )}

                {/* {status === "pending_approval" && can("approve_funding_requests")&& ( */}
                {status === "pending_approval" && (
                    <>
                        <MenuItem
                            onClick={() => {
                                handleMenuClose();
                                setOpenApprove(true);
                            }}
                        >
                            Approve
                        </MenuItem>

                        <MenuItem
                            sx={{ color: "error.main" }}
                            onClick={() => {
                                handleMenuClose();
                                setOpenReject(true);
                            }}
                        >
                            Reject
                        </MenuItem>
                    </>
                )}

                {(status === "approved" ||
                    status === "rejected") && (
                        <MenuItem disabled>
                            No actions available
                        </MenuItem>
                    )}
            </Menu>
            <ApproveFundingDialog
                open={openReview}
                loading={processing}
                request={selectedRequest}
                action="review"
                onClose={() => setOpenReview(false)}
                onConfirm={handleReview}
            />

            <ApproveFundingDialog
                open={openApprove}
                loading={processing}
                request={selectedRequest}
                action="approve"
                onClose={() => setOpenApprove(false)}
                onConfirm={handleApprove}
            />

            <ApproveFundingDialog
                open={openReject}
                loading={processing}
                request={selectedRequest}
                action="reject"
                onClose={() => setOpenReject(false)}
                onConfirm={handleReject}
            />
        </div >
    )
}
