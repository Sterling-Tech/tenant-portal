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

  Typography,

} from "@mui/material";


import {

  createMeterMake,

  deleteMeterMake,

  getMeterMakes,

  MeterMake,

  MeterMakePayload,

  updateMeterMake,

} from "../../../services/crmdService";
import MeterMakeFormModal from "./MeterMakeFormModal";
import DeleteMeterMakeDialog from "./DeleteMeterMakeDialog";

export default function MeterMakePage() {


  // =========================
  // STATE
  // =========================

  const [

    meterMakes,

    setMeterMakes,

  ] = useState<MeterMake[]>([]);


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

    selectedMeterMake,

    setSelectedMeterMake,

  ] = useState<MeterMake | null>(

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

    meterMakeToDelete,

    setMeterMakeToDelete,

  ] = useState<MeterMake | null>(

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

    selectedActionMeterMake,

    setSelectedActionMeterMake,

  ] = useState<MeterMake | null>(

    null

  );


  const actionMenuOpen =

    Boolean(
      actionAnchorEl
    );


  // =========================
  // LOAD METER MAKES
  // =========================

  const loadMeterMakes =
    async () => {


      try {


        setLoading(true);


        const response =

          await getMeterMakes(

            search,

            1,

            100

          );


        const data =

          Array.isArray(
            response
          )

            ? response

            : response?.results ?? [];


        setMeterMakes(
          data
        );


      } catch (error) {


        console.error(

          "Failed to load meter makes",

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


    loadMeterMakes();


  }, []);


  // =========================
  // SEARCH
  // =========================

  useEffect(() => {


    const timeout =

      setTimeout(

        () => {


          loadMeterMakes();


        },

        500

      );


    return () =>

      clearTimeout(
        timeout
      );


  }, [

    search,

  ]);


  // =========================
  // CREATE
  // =========================

  const handleCreate = () => {


    setSelectedMeterMake(

      null

    );


    setFormOpen(

      true

    );


  };


  // =========================
  // EDIT
  // =========================

  const handleEdit = (

    meterMake: MeterMake

  ) => {


    setSelectedMeterMake(

      meterMake

    );


    setFormOpen(

      true

    );


  };


  // =========================
  // SUBMIT
  // =========================

  const handleSubmit =
    async (

      payload: MeterMakePayload

    ) => {


      try {


        setSaving(true);


        if (

          selectedMeterMake

        ) {


          await updateMeterMake(

            payload,

            selectedMeterMake.id

          );


        } else {


          await createMeterMake(

            payload

          );


        }


        setFormOpen(

          false

        );


        setSelectedMeterMake(

          null

        );


        await loadMeterMakes();


      } catch (error: any) {


        console.error(

          "Failed to save meter make",

          error

        );


        const message =

          error?.response
            ?.data
            ?.detail

          ||

          error?.response
            ?.data
            ?.message

          ||

          "Failed to save meter make";


        alert(
          message
        );


      } finally {


        setSaving(false);


      }


    };


  // =========================
  // OPEN DELETE
  // =========================

  const handleOpenDelete = (

    meterMake: MeterMake

  ) => {


    setMeterMakeToDelete(

      meterMake

    );


    setDeleteOpen(

      true

    );


  };


  // =========================
  // DELETE
  // =========================

  const handleDelete =
    async () => {


      if (

        !meterMakeToDelete

      ) {


        return;


      }


      try {


        setDeleting(true);


        await deleteMeterMake(

          meterMakeToDelete.id

        );


        setDeleteOpen(

          false

        );


        setMeterMakeToDelete(

          null

        );


        await loadMeterMakes();


      } catch (error: any) {


        console.error(

          "Failed to delete meter make",

          error

        );


        const message =

          error?.response
            ?.data
            ?.detail

          ||

          error?.response
            ?.data
            ?.message

          ||

          "Failed to delete meter make";


        alert(
          message
        );


      } finally {


        setDeleting(false);


      }


    };


  // =========================
  // OPEN ACTION MENU
  // =========================

  const handleOpenActionMenu = (

    event:
      React.MouseEvent<HTMLElement>,

    meterMake:
      MeterMake

  ) => {


    setActionAnchorEl(

      event.currentTarget

    );


    setSelectedActionMeterMake(

      meterMake

    );


  };


  // =========================
  // CLOSE ACTION MENU
  // =========================

  const handleCloseActionMenu = () => {


    setActionAnchorEl(

      null

    );


  };


  // =========================
  // EDIT FROM MENU
  // =========================

  const handleMenuEdit = () => {


    if (

      !selectedActionMeterMake

    ) {


      return;


    }


    handleEdit(

      selectedActionMeterMake

    );


    handleCloseActionMenu();


  };


  // =========================
  // DELETE FROM MENU
  // =========================

  const handleMenuDelete = () => {


    if (

      !selectedActionMeterMake

    ) {


      return;


    }


    handleOpenDelete(

      selectedActionMeterMake

    );


    handleCloseActionMenu();


  };


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

            Meter Make Management

          </Typography>


          <Typography

            variant="body2"

            color="text.secondary"

          >

            Manage meter manufacturers
            and meter makes.

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
              loadMeterMakes
            }

            disabled={
              loading
            }

          >

            Refresh

          </Button>


          <Button

            variant="contained"

            startIcon={
              <Add />
            }

            onClick={
              handleCreate
            }

          >

            Add Meter Make

          </Button>


        </Stack>


      </Stack>


      {/* ===================== */}
      {/* SEARCH */}
      {/* ===================== */}

      <TextField

        fullWidth

        placeholder="Search meter make..."

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

                  ID

                </TableCell>


                <TableCell>

                  Meter Make

                </TableCell>


                <TableCell>

                  Created At

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

                        colSpan={4}

                        align="center"

                      >


                        <CircularProgress

                          size={28}

                        />


                      </TableCell>


                    </TableRow>


                  )

                  : meterMakes.length === 0

                    ? (


                      <TableRow>


                        <TableCell

                          colSpan={4}

                          align="center"

                        >

                          No meter makes found

                        </TableCell>


                      </TableRow>


                    )

                    : (


                      meterMakes.map(

                        (meterMake) => (

                          <TableRow

                            key={
                              meterMake.id
                            }

                            hover

                          >


                            <TableCell>

                              {
                                meterMake.id
                              }

                            </TableCell>


                            <TableCell>

                              <Typography
                                fontWeight={500}
                              >

                                {
                                  meterMake.name
                                }

                              </Typography>

                            </TableCell>


                            <TableCell>

                              {

                                meterMake.created_at

                                  ? new Date(

                                      meterMake.created_at

                                    ).toLocaleString()

                                  : "-"

                              }

                            </TableCell>


                            {/* ACTION */}

                            <TableCell

                              align="right"

                            >


                              <IconButton

                                onClick={(event) =>

                                  handleOpenActionMenu(

                                    event,

                                    meterMake

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


        {/* EDIT */}

        <MenuItem

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


        {/* DELETE */}

        <MenuItem

          onClick={
            handleMenuDelete
          }

          sx={{

            color:

              "error.main",

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


      </Menu>


      {/* ===================== */}
      {/* FORM MODAL */}
      {/* ===================== */}

      <MeterMakeFormModal

        open={
          formOpen
        }

        onClose={() => {


          if (

            !saving

          ) {


            setFormOpen(

              false

            );


            setSelectedMeterMake(

              null

            );


          }


        }}

        meterMake={
          selectedMeterMake
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

      <DeleteMeterMakeDialog

        open={
          deleteOpen
        }

        meterMake={
          meterMakeToDelete
        }

        loading={
          deleting
        }

        onClose={() => {


          if (

            !deleting

          ) {


            setDeleteOpen(

              false

            );


            setMeterMakeToDelete(

              null

            );


          }


        }}

        onConfirm={
          handleDelete
        }

      />


    </Box>

  );

}