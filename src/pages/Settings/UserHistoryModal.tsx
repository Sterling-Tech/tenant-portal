import React, { useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import {
    AuditHistory,
    auditService,
} from "../../services/AuditService";

interface Props {
    open: boolean;
    user: any;
    onClose: () => void;
}

const formatDate = (v?: string) =>
    v ? new Date(v).toLocaleString() : "-";

const actionColor = (action: string) => {
    switch (action) {
        case "CREATE":
            return "success";
        case "UPDATE":
            return "warning";
        case "DELETE":
            return "error";
        default:
            return "default";
    }
};


export default function UserHistoryModal({
    open,
    user,
    onClose,
}: Props) {

    const [loading, setLoading] = useState(false);

    const [history, setHistory] = useState<AuditHistory[]>([]);

    useEffect(() => {

        if (!open || !user) return;

        const load = async () => {

            try {

                setLoading(true);

                const res = await auditService.getUserHistory(user.id);

                setHistory(Array.isArray(res) ? res : []);

            } finally {

                setLoading(false);

            }

        };

        load();

    }, [open, user]);

    const columns = React.useMemo(() => {
        if (!history.length) return [];

        return Object.keys(
            history[0].present || history[0].previous || {}
        );
    }, [history]);

    return (

        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            
        >

            <DialogTitle
            className="bg-blue-800 text-white"
            >

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >

                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                    >

                        <Avatar>

                            {user?.name?.charAt(0)}

                        </Avatar>

                        <Box>

                            <Typography
                                fontWeight={700}
                            >
                                {user?.name}
                            </Typography>

                            <Typography
                                variant="body2"
                                // color="text.secondary"
                            >
                                {user?.email}
                            </Typography>

                        </Box>

                    </Stack>

                    <IconButton onClick={onClose}>

                        <CloseIcon />

                    </IconButton>

                </Stack>

            </DialogTitle>

            <Divider />

            <DialogContent>

                {loading ? (

                    <Box
                        py={8}
                        textAlign="center"
                    >

                        <CircularProgress />

                    </Box>

                ) : history.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={9}>
                            <Box
                                height={200}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Typography color="#94A3B8">No user history found</Typography>
                            </Box>
                        </TableCell>
                    </TableRow>
                ) : (

                    <TableContainer
                        component={Paper}
                        sx={{ mb: 2 }}
                    >
                        <Table stickyHeader size="small">

                            <TableHead>
                                <TableRow>
                                    <TableCell width={170}>Time</TableCell>
                                    <TableCell width={90}>Action</TableCell>
                                    <TableCell width={80}>State</TableCell>

                                    {columns.map(col => (
                                        <TableCell key={col}>
                                            {col.replace(/_/g, " ")}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>

                                {history.map((log) => (

                                    <React.Fragment key={log.id}>

                                        {/* BEFORE */}
                                        <TableRow>
                                            <TableCell rowSpan={2}>
                                                {formatDate(log.timestamp)}
                                            </TableCell>

                                            <TableCell rowSpan={2}>
                                                <Chip
                                                    size="small"
                                                    color={actionColor(log.action)}
                                                    label={log.action}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label="Before"
                                                    color="error"
                                                    size="small"
                                                />
                                            </TableCell>

                                            {columns.map(col => (
                                                <TableCell key={col}>
                                                    {String(log.previous?.[col] ?? "-")}
                                                </TableCell>
                                            ))}
                                        </TableRow>

                                        {/* AFTER */}
                                        <TableRow>

                                            <TableCell>
                                                <Chip
                                                    label="After"
                                                    color="success"
                                                    size="small"
                                                />
                                            </TableCell>

                                            {columns.map(col => {

                                                const changed =
                                                    JSON.stringify(log.previous?.[col]) !==
                                                    JSON.stringify(log.present?.[col]);

                                                return (
                                                    <TableCell
                                                        key={col}
                                                        sx={{
                                                            fontWeight: changed ? 700 : 400,
                                                            bgcolor: changed
                                                                ? "#e8f5e9"
                                                                : "inherit",
                                                        }}
                                                    >
                                                        {String(log.present?.[col] ?? "-")}
                                                    </TableCell>
                                                );
                                            })}

                                        </TableRow>

                                        {/* separator */}
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length + 3}
                                                sx={{
                                                    p: 0,
                                                    borderBottom: "4px solid #dcdcdc",
                                                    bgcolor: "#fafafa",
                                                    height: 10,
                                                }}
                                            />
                                        </TableRow>

                                    </React.Fragment>

                                ))}

                            </TableBody>

                        </Table>
                    </TableContainer>

                )}

            </DialogContent>

        </Dialog>

    );

}
