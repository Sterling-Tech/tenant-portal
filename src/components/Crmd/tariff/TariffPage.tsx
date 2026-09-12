import { useEffect, useState } from "react";
import {
    Add, Delete, Edit, MoreVert, Refresh, Search,
} from "@mui/icons-material";


import {
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import {
    closeTariff,
    createTariff,
    deleteTariff,
    getTariffs,
    Tariff,
    TariffPayload,
    updateTariff,
} from "../../../services/crmdService";

import TariffFormModal from "./TariffFormModal";
import DeleteTariffDialog from "./DeleteTariffDialog";
import CloseTariffDialog from "./CloseTariffDialog";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { usePermission } from "../../../hooks/usePermission";

export default function TariffPage() {

    const [tariffs, setTariffs] = useState<Tariff[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [tariffToDelete, setTariffToDelete] = useState<Tariff | null>(null);
    const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedActionTariff, setSelectedActionTariff] = useState<Tariff | null>();
    const actionMenuOpen = Boolean(actionAnchorEl);
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [tariffToClose, setTariffToClose] = useState<Tariff | null>(null);
    const [closing, setClosing] = useState(false);

    const loadTariffs =
        async () => {
            try {
                setLoading(true);
                const response = await getTariffs(search, 1, 100);
                const data =
                    Array.isArray(
                        response
                    )

                        ? response

                        : response?.results ?? [];
                setTariffs(
                    data
                );


            } catch (error) {


                console.error(

                    "Failed to load tariffs",

                    error

                );


            } finally {


                setLoading(false);


            }


        };

    useEffect(() => {
        loadTariffs();
    }, []);

    useEffect(() => {
        const timeout =
            setTimeout(
                () => {
                    loadTariffs();
                },
                500
            );
        return () =>
            clearTimeout(
                timeout
            );
    }, [search]);

    const handleCreate = () => {
        setSelectedTariff(
            null
        );
        setFormOpen(
            true
        );
    };

    const handleEdit = (
        tariff: Tariff
    ) => {
        setSelectedTariff(
            tariff
        );
        setFormOpen(
            true
        );
    };
    const handleSubmit =
        async (
            payload: TariffPayload
        ) => {
            try {
                setSaving(true);
                if (
                    selectedTariff
                ) {
                    await updateTariff(
                        payload,
                        selectedTariff.id
                    );
                } else {
                    await createTariff(
                        payload
                    );


                }


                setFormOpen(
                    false
                );
                setSelectedTariff(
                    null
                );
                loadTariffs();
            } catch (error: any) {
                console.error(
                    "Failed to save tariff",
                    error
                );
                toast.error(getErrorMessage(error) || "Failed to save tariff");
                // alert(

                //     error?.response
                //         ?.data
                //         ?.detail

                //     ||

                //     "Failed to save tariff"

                // );
            } finally {
                setSaving(false);
            }
        };

    const handleOpenDelete = (
        tariff: Tariff
    ) => {
        setTariffToDelete(
            tariff
        );
        setDeleteOpen(
            true
        );
    };

    const handleDelete =
        async () => {
            if (
                !tariffToDelete
            ) {
                return;
            }
            try {
                setDeleting(true);
                await deleteTariff(
                    tariffToDelete.id
                );
                setDeleteOpen(
                    false
                );
                setTariffToDelete(
                    null
                );
                loadTariffs();
            } catch (error: any) {
                console.error(
                    "Failed to delete tariff",
                    error
                );
                toast.error(getErrorMessage(error) || "Failed to delete tariff");
                // alert(

                //     error?.response
                //         ?.data
                //         ?.detail

                //     ||

                //     "Failed to delete tariff"

                // );


            } finally {
                setDeleting(false);
            }
        };

    const handleOpenActionMenu = (
        event: React.MouseEvent<HTMLElement>,
        tariff: Tariff
    ) => {
        setActionAnchorEl(
            event.currentTarget
        );
        setSelectedActionTariff(
            tariff
        );
    };

    const handleCloseActionMenu = () => {
        setActionAnchorEl(
            null
        );
    };

    const handleMenuEdit = () => {
        if (!selectedActionTariff) {
            return;
        }
        handleEdit(
            selectedActionTariff
        );
        handleCloseActionMenu();
    };

    const handleMenuDelete = () => {
        if (!selectedActionTariff) {
            return;
        }
        handleOpenDelete(
            selectedActionTariff
        );
        handleCloseActionMenu();
    };

    const handleOpenCloseDialog = (
        tariff: Tariff
    ) => {
        setTariffToClose(tariff);
        setCloseDialogOpen(true);
    };

    const handleCloseTariff = async (
        effectiveTo: string
    ) => {
        if (!tariffToClose) {
            return;
        }
        try {
            setClosing(true);
            await closeTariff(
                tariffToClose.id,
                {
                    effective_to: effectiveTo,
                }
            );

            alert(
                "Tariff window closed successfully"
            );

            setCloseDialogOpen(false);

            setTariffToClose(null);

            loadTariffs();
        } catch (error: any) {
            console.error(
                "Failed to close tariff",
                error
            );

            const message =
                error?.response?.data?.detail ||
                "Failed to close tariff";

            alert(message);
        } finally {
            setClosing(false);
        }
    };

    const { can } = usePermission();

    return (

        <Box>
            <Stack

                direction={{

                    xs: "column",

                    sm: "row",

                }}

                justifyContent="space-between"

                alignItems={{

                    xs: "stretch",

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

                        Tariff Management

                    </Typography>


                    <Typography

                        variant="body2"

                        color="text.secondary"

                    >

                        Manage electricity tariffs
                        and effective tariff windows.

                    </Typography>


                </Box>


                <Stack

                    direction="row"

                    spacing={1}

                >


                    <Button

                        startIcon={
                            <Refresh />
                        }

                        onClick={
                            loadTariffs
                        }

                    >

                        Refresh

                    </Button>

                    <Tooltip
                        title={
                            can("manage_tariff_config")
                                ? ""
                                : "You don't have permission to perform this action."
                        }
                    >
                        <span>
                            <Button
                                disabled={!can("manage_tariff_config")}
                                variant="contained"
                                startIcon={
                                    <Add />
                                }
                                onClick={
                                    handleCreate
                                }
                            >
                                Publish Tariff
                            </Button>
                        </span>
                    </Tooltip>

                </Stack>


            </Stack>


            {/* ===================== */}
            {/* SEARCH */}
            {/* ===================== */}


            <TextField

                fullWidth

                placeholder="Search tariff..."

                value={search}

                onChange={(event) =>

                    setSearch(
                        event.target.value
                    )

                }

                sx={{
                    mb: 3,
                }}

                InputProps={{

                    startAdornment:

                        (

                            <InputAdornment
                                position="start"
                            >

                                <Search />

                            </InputAdornment>

                        ),

                }}

            />


            {/* ===================== */}
            {/* TABLE */}
            {/* ===================== */}


            <Paper

                elevation={0}

                sx={{

                    border:

                        "1px solid #E5E7EB",

                    borderRadius: 2,

                    overflow: "hidden",

                }}

            >


                <TableContainer>


                    <Table>


                        <TableHead>


                            <TableRow>


                                <TableCell>

                                    Name

                                </TableCell>


                                <TableCell>

                                    Band

                                </TableCell>


                                <TableCell>

                                    Category

                                </TableCell>


                                <TableCell>

                                    Metering Type

                                </TableCell>


                                <TableCell>

                                    Rate

                                </TableCell>


                                <TableCell>

                                    Tariff Index

                                </TableCell>


                                <TableCell>

                                    Effective From

                                </TableCell>


                                <TableCell>

                                    Effective To

                                </TableCell>


                                <TableCell>

                                    Status

                                </TableCell>


                                <TableCell

                                    align="right"

                                >

                                    Actions

                                </TableCell>


                            </TableRow>


                        </TableHead>


                        <TableBody>


                            {

                                loading

                                    ? (


                                        <TableRow>


                                            <TableCell

                                                colSpan={10}

                                                align="center"

                                            >


                                                <CircularProgress

                                                    size={28}

                                                />


                                            </TableCell>


                                        </TableRow>


                                    )

                                    : tariffs.length === 0

                                        ? (


                                            <TableRow>


                                                <TableCell

                                                    colSpan={10}

                                                    align="center"

                                                >

                                                    No tariffs found

                                                </TableCell>


                                            </TableRow>


                                        )

                                        : (


                                            tariffs.map(

                                                (tariff) => (


                                                    <TableRow

                                                        key={
                                                            tariff.id
                                                        }

                                                        hover

                                                    >


                                                        <TableCell>

                                                            {
                                                                tariff.name
                                                            }

                                                        </TableCell>


                                                        <TableCell>

                                                            {
                                                                tariff.band
                                                                    ?.name
                                                            }

                                                        </TableCell>


                                                        <TableCell>

                                                            {
                                                                tariff.category
                                                                    ?.name
                                                            }

                                                        </TableCell>


                                                        <TableCell>

                                                            {
                                                                tariff.metering_type
                                                            }

                                                        </TableCell>


                                                        <TableCell>



                                                            {
                                                                Number(

                                                                    tariff.rate

                                                                ).toLocaleString()

                                                            }
                                                            %
                                                        </TableCell>


                                                        <TableCell>

                                                            {
                                                                tariff.tariff_index
                                                            }

                                                        </TableCell>


                                                        <TableCell>

                                                            {

                                                                new Date(

                                                                    tariff.effective_from

                                                                ).toLocaleString()

                                                            }

                                                        </TableCell>


                                                        <TableCell>

                                                            {

                                                                tariff.effective_to

                                                                    ? new Date(

                                                                        tariff.effective_to

                                                                    ).toLocaleString()

                                                                    : "Open"

                                                            }

                                                        </TableCell>


                                                        <TableCell>


                                                            <Chip

                                                                size="small"

                                                                label={

                                                                    tariff.is_current

                                                                        ? "Current"

                                                                        : "Historical"

                                                                }

                                                                color={

                                                                    tariff.is_current

                                                                        ? "success"

                                                                        : "default"

                                                                }

                                                            />


                                                        </TableCell>


                                                        {/* <TableCell

                              align="right"

                            >


                              <IconButton

                                color="primary"

                                onClick={() =>

                                  handleEdit(

                                    tariff

                                  )

                                }

                              >

                                <Edit />

                              </IconButton>


                              <IconButton

                                color="error"

                                onClick={() =>

                                  handleOpenDelete(

                                    tariff

                                  )

                                }

                              >

                                <Delete />

                              </IconButton>


                            </TableCell> */}

                                                        <TableCell
                                                            align="right"
                                                        >

                                                            <IconButton

                                                                onClick={(event) =>

                                                                    handleOpenActionMenu(
                                                                        event,
                                                                        tariff
                                                                    )

                                                                }

                                                            >

                                                                <MoreVert />

                                                            </IconButton>

                                                        </TableCell>

                                                    </TableRow>


                                                )

                                            )

                                        )

                            }


                        </TableBody>


                    </Table>


                </TableContainer>


            </Paper>

            {/* ===================== */}
            {/* ACTION MENU */}
            {/* ===================== */}

            <Menu

                anchorEl={
                    actionAnchorEl
                }

                open={
                    actionMenuOpen
                }

                onClose={
                    handleCloseActionMenu
                }

            >
                <Tooltip
                    title={
                        can("manage_tariff_config")
                            ? ""
                            : "You don't have permission to perform this action."
                    }
                >
                    <span>
                        <MenuItem
                            disabled={!can("manage_tariff_config")}
                            onClick={
                                handleMenuEdit
                            }

                        >

                            <Edit

                                fontSize="small"

                                style={{
                                    marginRight: 8,
                                }}

                            />

                            Edit

                        </MenuItem>
                    </span>
                </Tooltip>


                <Tooltip
                    title={
                        can("manage_tariff_config")
                            ? ""
                            : "You don't have permission to perform this action."
                    }
                >
                    <span>
                        <MenuItem
                            disabled={!can("manage_tariff_config")}
                            onClick={
                                handleMenuDelete
                            }

                            sx={{
                                color: "error.main",
                            }}
                        >

                            <Delete

                                fontSize="small"

                                style={{
                                    marginRight: 8,
                                }}

                            />

                            Delete

                        </MenuItem>

                    </span>
                </Tooltip>
                <MenuItem
                    onClick={() => {
                        if (selectedActionTariff) {
                            handleOpenCloseDialog(selectedActionTariff);
                            handleCloseActionMenu();
                        }
                    }}
                    disabled={!selectedActionTariff?.is_current}
                >
                    Close
                </MenuItem>
            </Menu>
            {/* ===================== */}
            {/* FORM MODAL */}
            {/* ===================== */}


            <TariffFormModal

                open={
                    formOpen
                }

                onClose={() => {

                    if (!saving) {

                        setFormOpen(
                            false
                        );

                        setSelectedTariff(
                            null
                        );

                    }

                }}

                tariff={
                    selectedTariff
                }

                loading={
                    saving
                }

                onSubmit={
                    handleSubmit
                }

            />


            {/* ===================== */}
            {/* DELETE DIALOG */}
            {/* ===================== */}


            <DeleteTariffDialog

                open={
                    deleteOpen
                }

                tariff={
                    tariffToDelete
                }

                loading={
                    deleting
                }

                onClose={() => {

                    if (!deleting) {

                        setDeleteOpen(
                            false
                        );

                        setTariffToDelete(
                            null
                        );

                    }

                }}

                onConfirm={
                    handleDelete
                }

            />
            <CloseTariffDialog

                open={
                    closeDialogOpen
                }

                tariff={
                    tariffToClose
                }

                loading={
                    closing
                }

                onClose={() => {

                    if (!closing) {

                        setCloseDialogOpen(
                            false
                        );

                        setTariffToClose(
                            null
                        );

                    }

                }}

                onConfirm={
                    handleCloseTariff
                }

            />

        </Box>

    );

}