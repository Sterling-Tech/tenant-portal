
import {
    useEffect,
    useState,
} from "react";

import {
    Box,
    Button,
    Card,
    Chip,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonIcon from "@mui/icons-material/Person";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { toast } from "react-toastify";

import {
    ActivateDeactivateGuard,
    createGuard,
    getGuards,
    CreateGuardPayload,
    Guard,
    activateDeactivateGuard,
} from "../../services/AccessCodeService";


import { usePermission } from "../../hooks/usePermission";
import { getErrorMessage } from "../../utils/getErrorMessage";
import CreateSecurityGuard from "../../components/AccessCode/CreateSecurityGuard";
import { useNavigate } from "react-router-dom";



export default function SecurityGuardsPage() {

    const { can } = usePermission();
    const navigate = useNavigate();
    
    const [guards, setGuards] =
        useState<Guard[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [statusLoading, setStatusLoading] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [modalOpen, setModalOpen] =
        useState(false);

    const [
        actionAnchorEl,
        setActionAnchorEl,
    ] = useState<null | HTMLElement>(null);

    const [
        selectedGuard,
        setSelectedGuard,
    ] = useState<Guard | null>(null);

const handleNavigation = (path: string) => {
        navigate(path); 
    };

    // ==================================
    // LOAD GUARDS
    // ==================================

    const loadGuards = async () => {

        try {

            setLoading(true);

            const response =
                await getGuards();

            setGuards(response || []);

        } catch (error) {

            console.error(
                "Failed to fetch security guards:",
                error
            );

            toast.error(
                getErrorMessage(error)
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadGuards();

    }, []);


    // ==================================
    // CREATE GUARD
    // ==================================

    const handleCreateGuard = async (
        payload: CreateGuardPayload
    ) => {

        try {

            setSaving(true);

            await createGuard(payload);

            toast.success(
                "Security guard created successfully."
            );

            setModalOpen(false);

            await loadGuards();

        } catch (error) {

            console.error(error);

            toast.error(
                getErrorMessage(error)
            );

        } finally {

            setSaving(false);

        }
    };


    // ==================================
    // ACTION MENU
    // ==================================

    const handleOpenMenu = (
        event: React.MouseEvent<HTMLElement>,
        guard: Guard
    ) => {

        setActionAnchorEl(
            event.currentTarget
        );

        setSelectedGuard(guard);
    };


    const handleCloseMenu = () => {

        setActionAnchorEl(null);

        setSelectedGuard(null);
    };


    // ==================================
    // ACTIVATE / DEACTIVATE
    // ==================================

    const handleToggleStatus = async () => {

        if (!selectedGuard) return;

        try {

            setStatusLoading(true);

            const newStatus =
                !selectedGuard.account_active;

            await activateDeactivateGuard({
                id: selectedGuard.id,
                account_active: newStatus,
            });

            toast.success(
                newStatus
                    ? "Security guard activated successfully."
                    : "Security guard deactivated successfully."
            );

            handleCloseMenu();

            await loadGuards();

        } catch (error) {

            console.error(error);

            toast.error(
                getErrorMessage(error)
            );

        } finally {

            setStatusLoading(false);

        }
    };


    // ==================================
    // SEARCH
    // ==================================

    const filteredGuards =
        guards.filter((guard) => {

            const value =
                search.toLowerCase();

            return (
                guard.name
                    .toLowerCase()
                    .includes(value) ||
                guard.email
                    .toLowerCase()
                    .includes(value) ||
                guard.phone_number
                    .toLowerCase()
                    .includes(value)
            );
        });


    return (

        <Box>

            {/* ========================= */}
            {/* HEADER */}
            {/* ========================= */}

            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: "flex-start",
                    sm: "center",
                }}
                spacing={2}
                mb={3}
            >

                <Box>

                    <Typography
                        variant="h5"
                        fontWeight={700}
                    >
                        Security Guards
                    </Typography>

                    <Typography
                        fontSize={13}
                        color="text.secondary"
                    >
                        Manage security personnel
                        responsible for visitor access
                        and gate admission.
                    </Typography>

                </Box>

                {/* <Tooltip
                    title={
                        can(
                            "manage_security_personnel"
                        )
                            ? ""
                            : "You don't have permission to perform this action."
                    }
                >
                    <span>

                        <Button
                            variant="contained"
                            startIcon={
                                <AddIcon />
                            }
                            disabled={
                                !can(
                                    "manage_security_personnel"
                                )
                            }
                            onClick={() => handleNavigation('/access')}
                        >
                            Verify Access code
                        </Button>

                    </span>
                </Tooltip> */}

                <Tooltip
                    title={
                        can(
                            "manage_security_personnel"
                        )
                            ? ""
                            : "You don't have permission to perform this action."
                    }
                >
                    <span>

                        <Button
                            variant="contained"
                            startIcon={
                                <AddIcon />
                            }
                            disabled={
                                !can(
                                    "manage_security_personnel"
                                )
                            }
                            onClick={() =>
                                setModalOpen(true)
                            }
                        >
                            Add Security Guard
                        </Button>

                    </span>
                </Tooltip>

            </Stack>


            {/* ========================= */}
            {/* SEARCH */}
            {/* ========================= */}

            <TextField
                fullWidth
                size="small"
                placeholder="Search guards by name, email or phone..."
                value={search}
                onChange={(event) =>
                    setSearch(
                        event.target.value
                    )
                }
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    mb: 2,
                }}
            />


            {/* ========================= */}
            {/* TABLE */}
            {/* ========================= */}

            <Card
                sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                }}
            >

                <Box
                    sx={{
                        overflowX: "auto",
                    }}
                >

                    <table
                        style={{
                            width: "100%",
                            borderCollapse:
                                "collapse",
                        }}
                    >

                        <thead>

                            <tr
                                style={{
                                    background:
                                        "#F8FAFC",
                                }}
                            >

                                <th
                                    style={{
                                        padding: 14,
                                        textAlign: "left",
                                    }}
                                >
                                    Guard
                                </th>

                                <th
                                    style={{
                                        padding: 14,
                                        textAlign: "left",
                                    }}
                                >
                                    Email
                                </th>

                                <th
                                    style={{
                                        padding: 14,
                                        textAlign: "left",
                                    }}
                                >
                                    Phone
                                </th>

                                <th
                                    style={{
                                        padding: 14,
                                        textAlign: "left",
                                    }}
                                >
                                    Gender
                                </th>

                                <th
                                    style={{
                                        padding: 14,
                                        textAlign: "left",
                                    }}
                                >
                                    Status
                                </th>

                                <th
                                    style={{
                                        padding: 14,
                                        textAlign: "center",
                                    }}
                                >
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan={6}
                                        style={{
                                            padding: 40,
                                            textAlign:
                                                "center",
                                        }}
                                    >
                                        Loading security guards...
                                    </td>

                                </tr>

                            ) : filteredGuards.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={6}
                                        style={{
                                            padding: 40,
                                            textAlign:
                                                "center",
                                        }}
                                    >
                                        No security guards found.
                                    </td>

                                </tr>

                            ) : (

                                filteredGuards.map(
                                    (guard) => (

                                        <tr
                                            key={guard.id}
                                            style={{
                                                borderTop:
                                                    "1px solid #E5E7EB",
                                            }}
                                        >

                                            {/* Guard */}

                                            <td
                                                style={{
                                                    padding: 14,
                                                }}
                                            >

                                                <Stack
                                                    direction="row"
                                                    spacing={1.5}
                                                    alignItems="center"
                                                >

                                                    <PersonIcon
                                                        color="action"
                                                    />

                                                    <Box>

                                                        <Typography
                                                            fontWeight={600}
                                                        >
                                                            {
                                                                guard.name
                                                            }
                                                        </Typography>

                                                        <Typography
                                                            fontSize={11}
                                                            color="text.secondary"
                                                        >
                                                            ID:{" "}
                                                            {
                                                                guard.id
                                                            }
                                                        </Typography>

                                                    </Box>

                                                </Stack>

                                            </td>


                                            {/* Email */}

                                            <td
                                                style={{
                                                    padding: 14,
                                                }}
                                            >
                                                {
                                                    guard.email
                                                }
                                            </td>


                                            {/* Phone */}

                                            <td
                                                style={{
                                                    padding: 14,
                                                }}
                                            >
                                                {
                                                    guard.phone_number
                                                }
                                            </td>


                                            {/* Gender */}

                                            <td
                                                style={{
                                                    padding: 14,
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        textTransform:
                                                            "capitalize",
                                                    }}
                                                >
                                                    {
                                                        guard.gender
                                                    }
                                                </Typography>
                                            </td>


                                            {/* Status */}

                                            <td
                                                style={{
                                                    padding: 14,
                                                }}
                                            >

                                                <Chip
                                                    size="small"
                                                    label={
                                                        guard.account_active
                                                            ? "Active"
                                                            : "Inactive"
                                                    }
                                                    color={
                                                        guard.account_active
                                                            ? "success"
                                                            : "default"
                                                    }
                                                />

                                            </td>


                                            {/* Actions */}

                                            <td
                                                style={{
                                                    padding: 14,
                                                    textAlign:
                                                        "center",
                                                }}
                                            >

                                                <Tooltip
                                                    title={
                                                        can(
                                                            "manage_security_personnel"
                                                        )
                                                            ? ""
                                                            : "You don't have permission to perform this action."
                                                    }
                                                >
                                                    <span>

                                                        <IconButton
                                                            size="small"
                                                            disabled={
                                                                !can(
                                                                    "manage_security_personnel"
                                                                )
                                                            }
                                                            onClick={(
                                                                event
                                                            ) =>
                                                                handleOpenMenu(
                                                                    event,
                                                                    guard
                                                                )
                                                            }
                                                        >

                                                            <MoreVertIcon />

                                                        </IconButton>

                                                    </span>
                                                </Tooltip>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </Box>


                {/* ========================= */}
                {/* ACTION MENU */}
                {/* ========================= */}

                <Menu
                    anchorEl={
                        actionAnchorEl
                    }
                    open={
                        Boolean(
                            actionAnchorEl
                        )
                    }
                    onClose={
                        handleCloseMenu
                    }
                >

                    <MenuItem
                        disabled={
                            statusLoading ||
                            !can(
                                "manage_security_personnel"
                            )
                        }
                        onClick={
                            handleToggleStatus
                        }
                    >

                        {selectedGuard?.account_active ? (
                            <>

                                <BlockIcon
                                    fontSize="small"
                                    sx={{
                                        mr: 1,
                                        color:
                                            "error.main",
                                    }}
                                />

                                Deactivate

                            </>
                        ) : (
                            <>

                                <CheckCircleIcon
                                    fontSize="small"
                                    sx={{
                                        mr: 1,
                                        color:
                                            "success.main",
                                    }}
                                />

                                Activate

                            </>
                        )}

                    </MenuItem>

                </Menu>

            </Card>


            {/* ========================= */}
            {/* CREATE MODAL */}
            {/* ========================= */}

            <CreateSecurityGuard
                open={modalOpen}
                loading={saving}
                onClose={() =>
                    setModalOpen(false)
                }
                onSubmit={
                    handleCreateGuard
                }
            />

        </Box>
    );
}