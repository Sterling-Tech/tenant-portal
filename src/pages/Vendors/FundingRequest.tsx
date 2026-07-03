import React, { useEffect, useState } from 'react'
import { fundingOperation, getFundingRequests } from '../../services/vendorService';
import type { FundingRequest } from '../../services/vendorService';
import { IconButton, TableContainer, Chip, TableHead, Paper, Table, TableBody, Menu, MenuItem, TableCell, TableRow } from '@mui/material';
import { toast } from 'react-toastify';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ApproveFundingDialog from './ApproveFundingDialog';


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

    const loadFundingRequests = async () => {
        try {

            setLoading(true);

            const response =
                await getFundingRequests({
                    page,
                    ordering: "-request_time",
                });

            setRequests(response.results);

            setTotalCount(response.count);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadFundingRequests();

    }, [page]);

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
    return (
        <div>
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

                        {requests.map((request) => (

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
                                        label={request.status}
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
                                    <IconButton
                                        onClick={(e) =>
                                            handleMenuClick(e, request)
                                        }
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>

                        ))}

                    </TableBody>

                </Table>

            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
            >
                {/* {selectedRequest?.status === "pending" && (
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
                )} */}
                <MenuItem
                    disabled={selectedRequest?.status !== "pending"}
                    onClick={() => {
                        handleMenuClose();
                        setOpenApprove(true);
                    }}
                >
                    Approve
                </MenuItem>
                <MenuItem
                    disabled={selectedRequest?.status !== "pending"}
                    sx={{
                        color:
                            selectedRequest?.status === "pending"
                                ? "error.main"
                                : "text.disabled",
                    }}
                    onClick={() => {
                        handleMenuClose();
                        setOpenReject(true);
                    }}
                >
                    Reject
                </MenuItem>
            </Menu>

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
        </div>
    )
}
