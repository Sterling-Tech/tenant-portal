import {

  useEffect,

  useState,

} from "react";


import {

  Add,

  Delete,

  Edit,

  MoreVert,

  Refresh,

  Search,

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

  createMeter,

  deleteMeter,

  getMeters,

  Meter,

  MeterPayload,

  updateMeter,

} from "../../../services/crmdService";


import MeterFormModal
  from "./MeterFormModal";


import DeleteMeterDialog
  from "./DeleteMeterDialog";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { usePermission } from "../../../hooks/usePermission";


export default function MeterPage() {


  // =========================
  // STATE
  // =========================

  const [

    meters,

    setMeters,

  ] = useState<Meter[]>([]);


  const [

    loading,

    setLoading,

  ] = useState(false);


  const [

    search,

    setSearch,

  ] = useState("");


  const [

    formOpen,

    setFormOpen,

  ] = useState(false);


  const [

    selectedMeter,

    setSelectedMeter,

  ] = useState<Meter | null>(
    null
  );


  const [

    saving,

    setSaving,

  ] = useState(false);


  const [

    deleteOpen,

    setDeleteOpen,

  ] = useState(false);


  const [

    deleting,

    setDeleting,

  ] = useState(false);


  const [

    meterToDelete,

    setMeterToDelete,

  ] = useState<Meter | null>(
    null
  );


  // =========================
  // ACTION MENU
  // =========================

  const [

    actionAnchorEl,

    setActionAnchorEl,

  ] = useState<HTMLElement | null>(
    null
  );


  const [

    selectedActionMeter,

    setSelectedActionMeter,

  ] = useState<Meter | null>(
    null
  );


  const actionMenuOpen =
    Boolean(actionAnchorEl);


  // =========================
  // LOAD METERS
  // =========================

  const loadMeters =
    async () => {

      try {

        setLoading(true);


        const response =
          await getMeters(
            search,
            1,
            100
          );


        const data =

          Array.isArray(response)

            ? response

            : response?.results ?? [];


        setMeters(data);

      } catch (error) {

        console.error(
          "Failed to load meters",
          error
        );

      } finally {

        setLoading(false);

      }

    };


  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {

    loadMeters();

  }, []);


  // =========================
  // SEARCH
  // =========================

  useEffect(() => {

    const timeout =

      setTimeout(() => {

        loadMeters();

      }, 500);


    return () =>

      clearTimeout(timeout);

  }, [search]);


  // =========================
  // CREATE
  // =========================

  const handleCreate = () => {

    setSelectedMeter(null);

    setFormOpen(true);

  };


  // =========================
  // EDIT
  // =========================

  const handleEdit = (

    meter: Meter

  ) => {

    setSelectedMeter(meter);

    setFormOpen(true);

  };


  // =========================
  // SUBMIT
  // =========================

  const handleSubmit =
    async (

      payload: MeterPayload

    ) => {

      try {

        setSaving(true);


        if (selectedMeter) {

          await updateMeter(
            payload,
            selectedMeter.id
          );

        } else {
          await createMeter(
            payload
          );

        }
        setFormOpen(false);
        setSelectedMeter(null);
        loadMeters();

      } catch (error: any) {

        console.error(
          "Failed to save meter",
          error
        );
        alert(
          error?.response
            ?.data
            ?.detail
          ||
          "Failed to save meter"
        );
        toast.error(getErrorMessage(error));
      } finally {

        setSaving(false);

      }

    };


  // =========================
  // OPEN DELETE
  // =========================

  const handleOpenDelete = (
    meter: Meter
  ) => {
    setMeterToDelete(meter);
    setDeleteOpen(true);
  };


  // =========================
  // DELETE
  // =========================

  const handleDelete =
    async () => {
      if (!meterToDelete) {
        return;
      }
      try {
        setDeleting(true);
        await deleteMeter(
          meterToDelete.id
        );
        setDeleteOpen(false);
        setMeterToDelete(null);
        loadMeters();
      } catch (error: any) {
        console.error(
          "Failed to delete meter",
          error
        );

        alert(
          error?.response
            ?.data
            ?.detail
          ||
          "Failed to delete meter"
        );
        toast.error(getErrorMessage(error));
      } finally {
        setDeleting(false);
      }
    };

  const handleOpenActionMenu = (
    event: React.MouseEvent<HTMLElement>,
    meter: Meter

  ) => {
    setActionAnchorEl(
      event.currentTarget
    );
    setSelectedActionMeter(
      meter
    );
  };

  const handleCloseActionMenu = () => {
    setActionAnchorEl(null);
  };

  const handleMenuEdit = () => {

    if (!selectedActionMeter) {
      return;
    }
    handleEdit(
      selectedActionMeter
    );
    handleCloseActionMenu();
  };

  const handleMenuDelete = () => {
    if (!selectedActionMeter) {
      return;
    }
    handleOpenDelete(
      selectedActionMeter
    );
    handleCloseActionMenu();
  };

  const { can } = usePermission()
  return (

    <Box>


      {/* ===================== */}
      {/* HEADER */}
      {/* ===================== */}

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

            Meter Management

          </Typography>


          <Typography

            variant="body2"

            color="text.secondary"

          >

            Manage electricity meters
            and meter configurations.

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
              loadMeters
            }

          >

            Refresh

          </Button>

          <Tooltip
            title={
              can("manage_meters")
                ? ""
                : "You don't have permission to perform this action."
            }
          >
            <span>
              <Button
                disabled={!can("manage_meters")}
                variant="contained"
                startIcon={
                  <Add />
                }
                onClick={
                  handleCreate
                }
              >
                Create Meter
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

        placeholder="Search meter..."

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

                  Meter Number

                </TableCell>


                <TableCell>

                  Customer

                </TableCell>


                <TableCell>

                  Meter Type

                </TableCell>


                <TableCell>

                  Meter Make

                </TableCell>


                <TableCell>

                  Status

                </TableCell>


                <TableCell>

                  Vendable

                </TableCell>


                <TableCell>

                  Disconnected

                </TableCell>


                <TableCell>

                  Installation Date

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

                        colSpan={9}

                        align="center"

                      >

                        <CircularProgress
                          size={28}
                        />

                      </TableCell>

                    </TableRow>

                  )

                  : meters.length === 0

                    ? (

                      <TableRow>

                        <TableCell

                          colSpan={9}

                          align="center"

                        >

                          No meters found

                        </TableCell>

                      </TableRow>

                    )

                    : (

                      meters.map(

                        (meter) => (

                          <TableRow

                            key={meter.id}

                            hover

                          >


                            <TableCell>

                              {
                                meter.meter_number
                              }

                            </TableCell>


                            <TableCell>

                              {
                                meter.customer_name
                                || "-"
                              }

                            </TableCell>


                            <TableCell>

                              {
                                meter.metering_type
                              }

                            </TableCell>


                            <TableCell>

                              {
                                meter.meter_make
                                  ?.name
                              }

                            </TableCell>


                            <TableCell>

                              <Chip

                                size="small"

                                label={
                                  meter.status
                                }

                                color={

                                  meter.status ===
                                    "active"

                                    ? "success"

                                    : "default"

                                }

                              />

                            </TableCell>


                            <TableCell>

                              <Chip

                                size="small"

                                label={

                                  meter.is_vendable

                                    ? "Yes"

                                    : "No"

                                }

                                color={

                                  meter.is_vendable

                                    ? "success"

                                    : "default"

                                }

                              />

                            </TableCell>


                            <TableCell>

                              <Chip

                                size="small"

                                label={

                                  meter.is_disconnected

                                    ? "Yes"

                                    : "No"

                                }

                                color={

                                  meter.is_disconnected

                                    ? "error"

                                    : "success"

                                }

                              />

                            </TableCell>


                            <TableCell>

                              {

                                meter.installation_date

                                  ? new Date(

                                    meter.installation_date

                                  ).toLocaleDateString()

                                  : "-"

                              }

                            </TableCell>


                            <TableCell
                              align="right"
                            >

                              <IconButton

                                onClick={(event) =>

                                  handleOpenActionMenu(

                                    event,

                                    meter

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
            can("manage_meters")
              ? ""
              : "You don't have permission to perform this action."
          }
        >
          <span>
            <MenuItem
              disabled={!can("manage_meters")}
              onClick={
                handleMenuEdit
              }
            >
              <Edit
                fontSize="small"
                sx={{
                  mr: 1,
                }}
              />
              Edit
            </MenuItem>
          </span>
        </Tooltip>

        <Tooltip
          title={
            can("manage_meters")
              ? ""
              : "You don't have permission to perform this action."
          }
        >
          <span>
            <MenuItem
              disabled={!can("manage_meters")}
              onClick={
                handleMenuDelete
              }
              sx={{
                color: "error.main",
              }}
            >
              <Delete
                fontSize="small"
                sx={{
                  mr: 1,
                }}
              />
              Delete
            </MenuItem>
          </span>
        </Tooltip>

      </Menu>


      {/* ===================== */}
      {/* FORM MODAL */}
      {/* ===================== */}

      <MeterFormModal

        open={
          formOpen
        }

        meter={
          selectedMeter
        }

        loading={
          saving
        }

        onClose={() => {

          if (!saving) {

            setFormOpen(false);

            setSelectedMeter(null);

          }

        }}

        onSubmit={
          handleSubmit
        }

      />


      {/* ===================== */}
      {/* DELETE DIALOG */}
      {/* ===================== */}

      <DeleteMeterDialog

        open={
          deleteOpen
        }

        meter={
          meterToDelete
        }

        loading={
          deleting
        }

        onClose={() => {

          if (!deleting) {

            setDeleteOpen(false);

            setMeterToDelete(null);

          }

        }}

        onConfirm={
          handleDelete
        }

      />


    </Box>

  );

}