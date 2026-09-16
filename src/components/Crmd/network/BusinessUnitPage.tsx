
import {
    Button,
    Card,
    Chip,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    Pagination,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import {
    useEffect,
    useState,
} from "react";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import Box from "@mui/material/Box/Box";
import { BusinessUnit, BusinessUnitPayload, createBusinessUnit, deleteBusinessUnit, getBusinessUnits, updateBusinessUnit } from "../../../services/crmdService";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import BusinessUnitFormModal from "./BusinessUnitFormModal";
import DeleteBusinessUnitDialog from "./DeleteBusinessUnitDialog";
import { usePermission } from "../../../hooks/usePermission";

const PAGE_SIZE = 10;

export default function BusinessUnitPage() {

    const queryClient =
        useQueryClient();


    // =========================
    // Local State
    // =========================

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);

    const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedActionBusinessUnit, setSelectedActionBusinessUnit] = useState<BusinessUnit | null>(null);
    const actionMenuOpen = Boolean(actionAnchorEl);

    const [editingBusinessUnit, setEditingBusinessUnit] = useState<BusinessUnit | null>(null);
    const [deletingBusinessUnit, setDeletingBusinessUnit] = useState<BusinessUnit | null>(null);


    // =========================
    // Debounce Search
    // =========================

    useEffect(() => {

        const timer =
            setTimeout(() => {

                setDebouncedSearch(search);

                setPage(1);

            }, 400);

        return () =>
            clearTimeout(timer);

    }, [search]);


    // =========================
    // Fetch Business Units
    // =========================

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
    } = useQuery({

        queryKey: [
            "business-units",
            debouncedSearch,
            page,
            PAGE_SIZE,
        ],

        queryFn: () =>
            getBusinessUnits(
                debouncedSearch,
                page,
                PAGE_SIZE
            ),

    });


    // =========================
    // Handle Fetch Error
    // =========================

    useEffect(() => {

        if (isError) {

            toast.error(
                getErrorMessage(error)
            );

        }

    }, [isError, error]);


    // =========================
    // Normalize Response
    // =========================

    const businessUnits =
        Array.isArray(data)
            ? data
            : data?.results ?? [];


    const totalCount =
        Array.isArray(data)
            ? data.length
            : data?.count ?? 0;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalCount / PAGE_SIZE
            )
        );


    // =========================
    // Create Mutation
    // =========================

    const createBusinessUnitMutation =
        useMutation({

            mutationFn:
                createBusinessUnit,

            onSuccess: () => {

                toast.success(
                    "Business unit created successfully."
                );

                setModalOpen(false);

                queryClient.invalidateQueries({
                    queryKey:
                        ["business-units"],
                });

            },

            onError: (error) => {

                console.error(error);

                toast.error(
                    getErrorMessage(error)
                );

            },

        });


    // =========================
    // Update Mutation
    // =========================

    const updateBusinessUnitMutation =
        useMutation({

            mutationFn: ({
                payload,
                id,
            }: {
                payload: BusinessUnitPayload;
                id: number;
            }) =>
                updateBusinessUnit(
                    payload,
                    id
                ),


            onSuccess: () => {

                toast.success(
                    "Business unit updated successfully."
                );

                setModalOpen(false);

                setEditingBusinessUnit(
                    null
                );

                queryClient.invalidateQueries({
                    queryKey:
                        ["business-units"],
                });

            },


            onError: (error) => {

                console.error(error);

                toast.error(
                    getErrorMessage(error)
                );

            },

        });


    // =========================
    // Delete Mutation
    // =========================

    const deleteBusinessUnitMutation =
        useMutation({

            mutationFn:
                deleteBusinessUnit,


            onSuccess: () => {

                toast.success(
                    "Business unit deleted successfully."
                );

                setDeletingBusinessUnit(
                    null
                );


                /*
                  Move to previous page
                  if last item was deleted
                */

                if (
                    businessUnits.length === 1 &&
                    page > 1
                ) {

                    setPage(
                        (prev) =>
                            prev - 1
                    );

                } else {

                    queryClient.invalidateQueries({
                        queryKey:
                            ["business-units"],
                    });

                }

            },


            onError: (
                error: any
            ) => {

                const status =
                    error?.response?.status;


                if (status === 409) {

                    toast.error(
                        "This business unit is being used by other records. Please deactivate it instead."
                    );

                } else {

                    toast.error(
                        getErrorMessage(error)
                    );

                }

            },

        });


    // =========================
    // Submit
    // =========================

    const handleSubmit = (
        payload: BusinessUnitPayload
    ) => {

        if (editingBusinessUnit) {

            updateBusinessUnitMutation.mutate({

                payload,

                id:
                    editingBusinessUnit.id,

            });

        } else {

            createBusinessUnitMutation.mutate(
                payload
            );

        }

    };


    // =========================
    // Delete
    // =========================

    const handleDelete = () => {

        if (!deletingBusinessUnit)
            return;


        deleteBusinessUnitMutation.mutate(

            deletingBusinessUnit.id

        );

    };


    // =========================
    // Loading States
    // =========================

    const saving =
        createBusinessUnitMutation.isPending ||
        updateBusinessUnitMutation.isPending;


    const deleting =
        deleteBusinessUnitMutation.isPending;


    const handleOpenActionMenu = (
        event: React.MouseEvent<HTMLElement>,
        businessUnit: BusinessUnit
    ) => {
        setActionAnchorEl(event.currentTarget);
        setSelectedActionBusinessUnit(businessUnit);
    };

    const handleCloseActionMenu = () => {
        setActionAnchorEl(null);
        setSelectedActionBusinessUnit(null);
    };

    const handleEditBusinessUnit = () => {
        if (!selectedActionBusinessUnit) return;

        setEditingBusinessUnit(
            selectedActionBusinessUnit
        );

        setModalOpen(true);

        handleCloseActionMenu();
    };

    const handleDeleteBusinessUnit = () => {
        if (!selectedActionBusinessUnit) return;

        setDeletingBusinessUnit(
            selectedActionBusinessUnit
        );

        handleCloseActionMenu();
    };

    const { can } = usePermission();


    return (
        <Box>
            {/* ============================= */}
            {/* HEADER */}
            {/* ============================= */}

            <Stack

                direction="row"

                justifyContent="space-between"

                alignItems="center"

                mb={3}

            >


                <Box>


                    <Typography

                        variant="h5"

                        fontWeight={700}

                    >

                        Business Units

                    </Typography>


                    <Typography

                        fontSize={13}

                        color="text.secondary"

                    >

                        Manage business units
                        and their regional
                        configuration.

                    </Typography>


                </Box>

                <Tooltip
                    title={
                        can("manage_network_config")
                            ? ""
                            : "You don't have permission to perform this action."
                    }
                >
                    <span>



                        <Button
                            disabled={!can("manage_network_config")}
                            variant="contained"

                            startIcon={
                                <AddIcon />
                            }

                            onClick={() => {


                                setEditingBusinessUnit(
                                    null
                                );


                                setModalOpen(
                                    true
                                );


                            }}

                        >

                            Add Business Unit

                        </Button>
                    </span>
                </Tooltip>

            </Stack>


            {/* ============================= */}
            {/* SEARCH */}
            {/* ============================= */}

            <TextField

                fullWidth

                size="small"

                placeholder="
          Search business unit
          by name or code...
        "

                value={search}

                onChange={(e) =>
                    setSearch(
                        e.target.value
                    )
                }


                InputProps={{

                    startAdornment: (

                        <InputAdornment
                            position="start"
                        >

                            <SearchIcon />

                        </InputAdornment>

                    ),

                }}


                sx={{
                    mb: 2,
                }}

            />


            {/* ============================= */}
            {/* TABLE */}
            {/* ============================= */}

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


                        {/* ===================== */}
                        {/* HEADER */}
                        {/* ===================== */}

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
                                        textAlign:
                                            "left",
                                    }}
                                >
                                    Business Unit
                                </th>


                                <th
                                    style={{
                                        padding: 14,
                                        textAlign:
                                            "left",
                                    }}
                                >
                                    Code
                                </th>


                                <th
                                    style={{
                                        padding: 14,
                                        textAlign:
                                            "left",
                                    }}
                                >
                                    Region
                                </th>


                                <th
                                    style={{
                                        padding: 14,
                                        textAlign:
                                            "left",
                                    }}
                                >
                                    Phone
                                </th>


                                <th
                                    style={{
                                        padding: 14,
                                        textAlign:
                                            "left",
                                    }}
                                >
                                    Status
                                </th>


                                <th
                                    style={{
                                        padding: 14,
                                    }}
                                >
                                    Actions
                                </th>


                            </tr>


                        </thead>


                        {/* ===================== */}
                        {/* BODY */}
                        {/* ===================== */}

                        <tbody>


                            {isLoading ? (


                                <tr>


                                    <td

                                        colSpan={6}

                                        style={{

                                            padding:
                                                40,

                                            textAlign:
                                                "center",

                                        }}

                                    >

                                        Loading business units...

                                    </td>


                                </tr>


                            ) : businessUnits.length === 0 ? (


                                <tr>


                                    <td

                                        colSpan={6}

                                        style={{

                                            padding:
                                                40,

                                            textAlign:
                                                "center",

                                        }}

                                    >

                                        No business units found.

                                    </td>


                                </tr>


                            ) : (


                                businessUnits.map(

                                    (
                                        businessUnit
                                    ) => (


                                        <tr

                                            key={
                                                businessUnit.id
                                            }


                                            style={{

                                                borderTop:
                                                    "1px solid #E5E7EB",

                                            }}

                                        >


                                            {/* Name */}

                                            <td
                                                style={{
                                                    padding: 14,
                                                }}
                                            >


                                                <Typography
                                                    fontWeight={600}
                                                >

                                                    {
                                                        businessUnit.name
                                                    }

                                                </Typography>


                                                <Typography

                                                    fontSize={11}

                                                    color="text.secondary"

                                                >

                                                    {
                                                        businessUnit.nerc_address
                                                    }

                                                </Typography>


                                            </td>


                                            {/* Code */}

                                            <td
                                                style={{
                                                    padding: 14,
                                                }}
                                            >

                                                <Chip

                                                    label={
                                                        businessUnit.code
                                                    }

                                                    size="small"

                                                />

                                            </td>


                                            {/* Region */}

                                            <td
                                                style={{
                                                    padding: 14,
                                                }}
                                            >


                                                <Typography
                                                    fontWeight={500}
                                                >

                                                    {
                                                        businessUnit
                                                            .region
                                                            ?.name
                                                    }

                                                </Typography>


                                                <Typography

                                                    fontSize={11}

                                                    color="text.secondary"

                                                >

                                                    {
                                                        businessUnit
                                                            .region
                                                            ?.code
                                                    }

                                                </Typography>


                                            </td>


                                            {/* Phone */}

                                            <td
                                                style={{
                                                    padding: 14,
                                                }}
                                            >

                                                {
                                                    businessUnit.phone
                                                }

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

                                                        businessUnit
                                                            .is_active

                                                            ? "Active"

                                                            : "Inactive"

                                                    }


                                                    color={

                                                        businessUnit
                                                            .is_active

                                                            ? "success"

                                                            : "default"

                                                    }

                                                />


                                            </td>


                                            {/* Actions */}

                                            <td
                                                style={{
                                                    padding: 14,
                                                    textAlign: "center",
                                                    width: 80,
                                                }}
                                            >
                                                <Tooltip
                                                    title={
                                                        can("manage_network_config")
                                                            ? "Actions"
                                                            : "You don't have permission to perform this action."
                                                    }
                                                >
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            disabled={
                                                                !can("manage_network_config")
                                                            }
                                                            onClick={(event) =>
                                                                handleOpenActionMenu(
                                                                    event,
                                                                    businessUnit
                                                                )
                                                            }
                                                        >
                                                            <MoreVertIcon fontSize="small" />
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

                <Menu
                    anchorEl={actionAnchorEl}
                    open={actionMenuOpen}
                    onClose={handleCloseActionMenu}
                >
                    <MenuItem
                        onClick={handleEditBusinessUnit}
                    >
                        <EditIcon
                            fontSize="small"
                            sx={{ mr: 1 }}
                        />

                        Edit
                    </MenuItem>

                    <MenuItem
                        onClick={handleDeleteBusinessUnit}
                        sx={{
                            color: "error.main",
                        }}
                    >
                        <DeleteIcon
                            fontSize="small"
                            sx={{ mr: 1 }}
                        />

                        Delete
                    </MenuItem>
                    
                </Menu>
            </Card>


            {/* ============================= */}
            {/* PAGINATION */}
            {/* ============================= */}

            {(
                <Stack

                    direction="row"

                    justifyContent="space-between"

                    alignItems="center"

                    mt={3}

                >


                    <Typography
                        fontSize={13}
                        color="text.secondary"
                    >

                        Showing{" "}

                        {
                            businessUnits.length
                        }

                        {" "}of{" "}

                        {
                            totalCount
                        }

                        {" "}business units


                    </Typography>


                    <Pagination

                        count={
                            totalPages
                        }

                        page={
                            page
                        }

                        onChange={

                            (_, value) =>
                                setPage(value)

                        }

                        color="primary"

                    />


                </Stack>
            )}
            {/* ============================= */}
            {/* CREATE / EDIT */}
            {/* ============================= */}
            <BusinessUnitFormModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingBusinessUnit(null);
                }}

                businessUnit={editingBusinessUnit}
                loading={saving}
                onSubmit={handleSubmit}
            />
            {/* ============================= */}
            {/* DELETE */}
            {/* ============================= */}

            <DeleteBusinessUnitDialog
                open={Boolean(deletingBusinessUnit)}
                businessUnit={deletingBusinessUnit}
                loading={deleting}
                onClose={() => setDeletingBusinessUnit(null)}
                onConfirm={handleDelete}
            />
        </Box>

    );

}