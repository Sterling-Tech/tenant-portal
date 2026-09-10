import React, {
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
    Typography,
    Pagination,
    Select,
    Tooltip,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { toast } from "react-toastify";

import RegionFormModal from "./RegionFormModal";
import DeleteRegionDialog from "./DeleteRegionDialog";

import {
    Region,
    RegionPayload,
    createRegion,
    deleteRegion,
    getRegions,
    updateRegion,
} from "../../../services/crmdService";

import { getErrorMessage } from "../../../utils/getErrorMessage";
import { usePermission } from "../../../hooks/usePermission";

export default function RegionPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRegion, setEditingRegion] = useState<Region | null>(null);
    const [deletingRegion, setDeletingRegion] = useState<Region | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [nextPage, setNextPage] = useState<string | null>(null);
    const [previousPage, setPreviousPage] = useState<string | null>(null);

    // -------------------------
    // Fetch Regions
    // -------------------------

    const loadRegions = async (
        searchValue = search,
        currentPage = page
    ) => {
        try {
            setLoading(true);

            const data = await getRegions(
                searchValue,
                currentPage,
                pageSize
            );

            setRegions(data.results || []);

            setTotalCount(data.count || 0);

            setNextPage(data.next);

            setPreviousPage(data.previous);

        } catch (error) {

            console.error(
                "Failed to fetch regions:",
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
        loadRegions(search, page);
    }, [page]);


    // -------------------------
    // Search
    // -------------------------

    useEffect(() => {

        const timer =
            setTimeout(() => {

                loadRegions(search);

            }, 400);

        return () =>
            clearTimeout(timer);

    }, [search]);


    // -------------------------
    // Create / Update
    // -------------------------

    const handleSubmit = async (
        payload: RegionPayload
    ) => {

        try {

            setSaving(true);

            if (editingRegion) {

                await updateRegion(
                    payload,
                    editingRegion.id
                );

                toast.success(
                    "Region updated successfully"
                );

            } else {

                await createRegion(payload);

                toast.success(
                    "Region created successfully"
                );

            }

            setModalOpen(false);

            setEditingRegion(null);

            loadRegions(search);

        } catch (error) {

            console.error(error);

            toast.error(
                getErrorMessage(error)
            );

        } finally {

            setSaving(false);

        }
    };


    // -------------------------
    // Delete
    // -------------------------

    const handleDelete = async () => {

        if (!deletingRegion)
            return;

        try {

            setDeleting(true);

            await deleteRegion(
                deletingRegion.id
            );

            toast.success(
                "Region deleted successfully"
            );

            setDeletingRegion(null);

            loadRegions(search);

        } catch (error: any) {

            const status =
                error?.response?.status;

            if (status === 409) {

                toast.error(
                    "This region is being used by other records. Please deactivate it instead."
                );

            } else {

                toast.error(
                    getErrorMessage(error)
                );

            }

        } finally {

            setDeleting(false);

        }

    };

    const totalPages = Math.ceil(
        totalCount / pageSize
    );
    const { can } = usePermission();
    return (

        <Box>

            {/* Header */}

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
                        Regions
                    </Typography>

                    <Typography
                        fontSize={13}
                        color="text.secondary"
                    >
                        Manage electricity regions and NERC configuration.
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
                            variant="contained"
                            disabled={!can("manage_network_config")}
                            startIcon={<AddIcon />}
                            onClick={() => {

                                setEditingRegion(null);

                                setModalOpen(true);

                            }}
                        >
                            Add Region
                        </Button>
                    </span>
                </Tooltip>
            </Stack>


            {/* Search */}

            <TextField
                fullWidth
                size="small"

                placeholder="Search region by name or code..."

                value={search}

                onChange={(e) =>
                    setSearch(
                        e.target.value
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


            {/* Table */}

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
                                        padding: "14px",
                                        textAlign: "left",
                                    }}
                                >
                                    Region
                                </th>

                                <th
                                    style={{
                                        padding: "14px",
                                        textAlign: "left",
                                    }}
                                >
                                    Code
                                </th>

                                <th
                                    style={{
                                        padding: "14px",
                                        textAlign: "left",
                                    }}
                                >
                                    NERC Phone
                                </th>

                                <th
                                    style={{
                                        padding: "14px",
                                        textAlign: "left",
                                    }}
                                >
                                    Remittance Account
                                </th>

                                <th
                                    style={{
                                        padding: "14px",
                                        textAlign: "left",
                                    }}
                                >
                                    Status
                                </th>

                                <th
                                    style={{
                                        padding: "14px",
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
                                            padding: "40px",
                                            textAlign:
                                                "center",
                                        }}
                                    >
                                        Loading regions...
                                    </td>

                                </tr>

                            ) : regions.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={6}
                                        style={{
                                            padding: "40px",
                                            textAlign:
                                                "center",
                                        }}
                                    >
                                        No regions found.
                                    </td>

                                </tr>

                            ) : (

                                regions.map(
                                    (region) => (

                                        <tr
                                            key={
                                                region.id
                                            }
                                            style={{
                                                borderTop:
                                                    "1px solid #E5E7EB",
                                            }}
                                        >

                                            {/* Region */}

                                            <td
                                                style={{
                                                    padding:
                                                        "14px",
                                                }}
                                            >

                                                <Typography
                                                    fontWeight={600}
                                                >

                                                    {
                                                        region.name
                                                    }

                                                </Typography>

                                                <Typography
                                                    fontSize={11}
                                                    color="text.secondary"
                                                >

                                                    {
                                                        region.nerc_address
                                                    }

                                                </Typography>

                                            </td>


                                            {/* Code */}

                                            <td
                                                style={{
                                                    padding:
                                                        "14px",
                                                }}
                                            >

                                                <Chip
                                                    label={
                                                        region.code
                                                    }
                                                    size="small"
                                                />

                                            </td>


                                            {/* Phone */}

                                            <td
                                                style={{
                                                    padding:
                                                        "14px",
                                                }}
                                            >

                                                {
                                                    region.nerc_phone
                                                }

                                            </td>


                                            {/* Account */}

                                            <td
                                                style={{
                                                    padding:
                                                        "14px",
                                                }}
                                            >

                                                {
                                                    region.remittance_account
                                                }

                                            </td>


                                            {/* Status */}

                                            <td
                                                style={{
                                                    padding:
                                                        "14px",
                                                }}
                                            >

                                                <Chip
                                                    size="small"

                                                    label={
                                                        region.is_active
                                                            ? "Active"
                                                            : "Inactive"
                                                    }

                                                    color={
                                                        region.is_active
                                                            ? "success"
                                                            : "default"
                                                    }
                                                />

                                            </td>


                                            {/* Actions */}

                                            <td
                                                style={{
                                                    padding:
                                                        "14px",
                                                    textAlign:
                                                        "center",
                                                }}
                                            >
                                                <Tooltip
                                                    title={
                                                        can("manage_network_config")
                                                            ? ""
                                                            : "You don't have permission to perform this action."
                                                    }
                                                >
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            disabled={!can("manage_network_config")}
                                                            onClick={() => {

                                                                setEditingRegion(
                                                                    region
                                                                );

                                                                setModalOpen(
                                                                    true
                                                                );

                                                            }}
                                                        >

                                                            <EditIcon
                                                                fontSize="small"
                                                            />

                                                        </IconButton>

                                                    </span>
                                                </Tooltip>

                                                <Tooltip
                                                    title={
                                                        can("manage_network_config")
                                                            ? ""
                                                            : "You don't have permission to perform this action."
                                                    }
                                                >
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            disabled={!can("manage_network_config")}
                                                            color="error"

                                                            onClick={() =>
                                                                setDeletingRegion(
                                                                    region
                                                                )
                                                            }
                                                        >

                                                            <DeleteIcon
                                                                fontSize="small"
                                                            />

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

            </Card>

            {/* Pagination */}

            {totalCount > 0 && (

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
                    sx={{
                        mt: 2,
                    }}
                >

                    {/* Page Info */}

                    <Typography
                        fontSize={13}
                        color="text.secondary"
                    >

                        Showing page {page} of {totalPages}

                        {" • "}

                        {totalCount} region
                        {totalCount !== 1 ? "s" : ""}

                    </Typography>


                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                    >

                        {/* Page Size */}

                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >

                            <Typography fontSize={13}>
                                Rows:
                            </Typography>


                            <Select
                                size="small"
                                value={pageSize}
                                onChange={(e: any) => {

                                    setPageSize(
                                        Number(e.target.value)
                                    );

                                    setPage(1);

                                }}
                                sx={{
                                    minWidth: 70,
                                }}
                            >

                                <MenuItem value={5}>
                                    5
                                </MenuItem>

                                <MenuItem value={10}>
                                    10
                                </MenuItem>

                                <MenuItem value={20}>
                                    20
                                </MenuItem>

                                <MenuItem value={50}>
                                    50
                                </MenuItem>

                            </Select>

                        </Stack>


                        {/* Pagination */}

                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, value) => {

                                setPage(value);

                            }}
                            color="primary"
                            shape="rounded"
                        />

                    </Stack>

                </Stack>

            )}

            {/* Create / Edit */}

            <RegionFormModal

                open={modalOpen}

                onClose={() => {

                    setModalOpen(false);

                    setEditingRegion(null);

                }}

                region={editingRegion}

                loading={saving}

                onSubmit={handleSubmit}

            />


            {/* Delete */}

            <DeleteRegionDialog

                open={
                    Boolean(deletingRegion)
                }

                region={
                    deletingRegion
                }

                loading={
                    deleting
                }

                onClose={() =>
                    setDeletingRegion(null)
                }

                onConfirm={
                    handleDelete
                }

            />

        </Box>

    );

}