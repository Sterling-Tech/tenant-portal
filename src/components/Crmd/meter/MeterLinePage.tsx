import {

  useEffect,

  useState,

} from "react";


import {

  Add,

  Refresh,

  Search,

} from "@mui/icons-material";


import {
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
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

  createMeterLine,

  getMeterLines,

  MeterAction,

  MeterLine,

  MeterLinePayload,

} from "../../../services/crmdService";


import MeterLineFormModal
  from "./MeterLineFormModal";


export default function MeterLinePage() {


  // =========================
  // STATE
  // =========================

  const [

    meterLines,

    setMeterLines,

  ] = useState<MeterLine[]>([]);


  const [

    loading,

    setLoading,

  ] = useState(false);


  const [

    saving,

    setSaving,

  ] = useState(false);


  const [

    search,

    setSearch,

  ] = useState("");


  const [

    actionFilter,

    setActionFilter,

  ] = useState<MeterAction | "">("");


  const [

    formOpen,

    setFormOpen,

  ] = useState(false);


  // =========================
  // LOAD METER LINES
  // =========================

  const loadMeterLines =
    async () => {

      try {

        setLoading(true);


        const response =
          await getMeterLines(

            search,

            1,

            100,

            undefined,

            undefined,

            actionFilter || undefined

          );


        const data =

          Array.isArray(response)

            ? response

            : response?.results ?? [];


        setMeterLines(data);

      } catch (error) {

        console.error(

          "Failed to load meter timeline",

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

    loadMeterLines();

  }, []);


  // =========================
  // SEARCH / FILTER
  // =========================

  useEffect(() => {

    const timeout =

      setTimeout(() => {

        loadMeterLines();

      }, 500);


    return () =>

      clearTimeout(timeout);

  }, [

    search,

    actionFilter,

  ]);


  // =========================
  // CREATE
  // =========================

  const handleSubmit =
    async (

      payload:
        MeterLinePayload

    ) => {

      try {

        setSaving(true);


        await createMeterLine(
          payload
        );


        alert(

          "Meter action recorded successfully"

        );


        setFormOpen(false);

        loadMeterLines();

      } catch (error: any) {

        console.error(

          "Failed to record meter action",

          error

        );


        alert(

          error?.response
            ?.data
            ?.detail

          ||

          "Failed to record meter action"

        );

      } finally {

        setSaving(false);

      }

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

            Meter Timeline

          </Typography>


          <Typography

            variant="body2"

            color="text.secondary"

          >

            Track all meter activities
            and lifecycle events.

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
              loadMeterLines
            }

          >

            Refresh

          </Button>


          <Button

            variant="contained"

            startIcon={
              <Add />
            }

            onClick={() =>

              setFormOpen(true)

            }

          >

            Record Action

          </Button>


        </Stack>


      </Stack>


      {/* ===================== */}
      {/* FILTERS */}
      {/* ===================== */}

      <Stack

        direction={{

          xs: "column",

          sm: "row",

        }}

        spacing={2}

        mb={3}

      >


        {/* SEARCH */}

        <TextField

          fullWidth

          placeholder="Search meter..."

          value={search}

          onChange={(event) =>

            setSearch(
              event.target.value
            )

          }

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


        {/* ACTION FILTER */}

        <TextField

          select

          fullWidth

          label="Action"

          value={
            actionFilter
          }

          onChange={(event) =>

            setActionFilter(
              event.target.value as MeterAction | ""
            )

          }

        >

          <MenuItem value="">

            All Actions

          </MenuItem>


          <MenuItem value="installed">

            Installed

          </MenuItem>


          <MenuItem value="assigned">

            Assigned

          </MenuItem>


          <MenuItem value="unassigned">

            Unassigned

          </MenuItem>


          <MenuItem value="disconnected">

            Disconnected

          </MenuItem>


          <MenuItem value="reconnected">

            Reconnected

          </MenuItem>


          <MenuItem value="replaced">

            Replaced

          </MenuItem>


          <MenuItem value="retired">

            Retired

          </MenuItem>


          <MenuItem value="received">

            Received

          </MenuItem>


        </TextField>


      </Stack>


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

                  Meter

                </TableCell>


                <TableCell>

                  Customer

                </TableCell>


                <TableCell>

                  Action

                </TableCell>


                <TableCell>

                  Reading

                </TableCell>


                <TableCell>

                  Related Meter

                </TableCell>


                <TableCell>

                  Reason

                </TableCell>


                <TableCell>

                  Performed By

                </TableCell>


                <TableCell>

                  Occurred At

                </TableCell>


              </TableRow>


            </TableHead>


            <TableBody>


              {

                loading

                  ? (

                    <TableRow>

                      <TableCell

                        colSpan={8}

                        align="center"

                      >

                        <CircularProgress
                          size={28}
                        />

                      </TableCell>

                    </TableRow>

                  )

                  : meterLines.length === 0

                    ? (

                      <TableRow>

                        <TableCell

                          colSpan={8}

                          align="center"

                        >

                          No meter activities found

                        </TableCell>

                      </TableRow>

                    )

                    : (

                      meterLines.map(

                        (line) => (

                          <TableRow

                            key={line.id}

                            hover

                          >


                            <TableCell>

                              {
                                line.meter_number
                              }

                            </TableCell>


                            <TableCell>

                              {
                                line.customer_name
                                  || "-"
                              }

                            </TableCell>


                            <TableCell>

                              <Chip

                                size="small"

                                label={

                                  line.action

                                    .replace(
                                      "_",
                                      " "
                                    )

                                }

                              />

                            </TableCell>


                            <TableCell>

                              {
                                line.reading
                              }

                            </TableCell>


                            <TableCell>

                              {

                                line.related_meter_number

                                  || "-"

                              }

                            </TableCell>


                            <TableCell>

                              {
                                line.reason
                              }

                            </TableCell>


                            <TableCell>

                              {

                                line.performed_by_name

                              }

                            </TableCell>


                            <TableCell>

                              {

                                new Date(

                                  line.occurred_at

                                ).toLocaleString()

                              }

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
      {/* RECORD ACTION MODAL */}
      {/* ===================== */}

      <MeterLineFormModal

        open={
          formOpen
        }

        loading={
          saving
        }

        onClose={() => {

          if (!saving) {

            setFormOpen(false);

          }

        }}

        onSubmit={
          handleSubmit
        }

      />


    </Box>

  );

}