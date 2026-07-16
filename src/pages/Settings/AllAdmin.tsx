import React, { useEffect, useState } from 'react'
import {
    Box,
    Typography,
    IconButton,
    Chip,
    Avatar,
    Stack,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress,
    Menu,
    MenuItem
} from "@mui/material";
import { getAllAdmin } from '../../services/settingService';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UserHistoryModal from "./UserHistoryModal";
export default function AllAdmin() {
    const [loading, setLoading] = useState(false);
    const [admin, setAdmin] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const handleFetchAdmin = async () => {
        setLoading(true);
        try {
            const response = await getAllAdmin();
            setAdmin(response);
        } catch (error) {
            console.error("Error fetching admins:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleFetchAdmin();
    }, []);

    const handleMenuOpen = (
        e: React.MouseEvent<HTMLElement>
    ) => {
        setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            {/* List of Admins */}

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Business Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone Number</TableCell>
                        <TableCell>Gender</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {loading ? (
                        <Box py={3} textAlign="center">
                            <CircularProgress size={24} />
                        </Box>
                    ) : (
                        (admin || []).map((v) => (
                            <TableRow
                                key={v.id}
                                hover
                                selected={selected?.id === v.id}
                                onClick={() => setSelected(v)}
                                sx={{ cursor: "pointer" }}
                            >

                                <TableCell>
                                    <Stack direction="row" spacing={2}>
                                        <Avatar>
                                            {v.name?.charAt(0)}
                                        </Avatar>

                                        <Typography
                                            fontWeight={500}
                                            sx={{
                                                maxWidth: 150,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {v.name}
                                        </Typography>
                                    </Stack>
                                </TableCell>

                                <TableCell>{v.email}</TableCell>
                                <TableCell>{v.phone_number}</TableCell>
                                <TableCell>{v.gender}</TableCell>

                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedUser(v);
                                            setAnchorEl(e.currentTarget);
                                        }}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>

                            </TableRow>

                        )))}
                </TableBody>


            </Table>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => {
                    setAnchorEl(null);
                    setSelectedUser(null);
                }}
            >
                <MenuItem
                    onClick={() => {
                        setHistoryOpen(true);
                        setAnchorEl(null);
                    }}
                >
                    View History
                </MenuItem>
            </Menu>

            <UserHistoryModal
                open={historyOpen}
                user={selectedUser}
                onClose={() => {
                    setHistoryOpen(false);
                    setSelectedUser(null);
                }}
            />
        </div >
    )
}
