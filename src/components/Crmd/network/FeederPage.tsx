import {
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import Box from "@mui/material/Box";

import SearchIcon from "@mui/icons-material/Search";

import AddIcon from "@mui/icons-material/Add";

import EditIcon from "@mui/icons-material/Edit";

import DeleteIcon from "@mui/icons-material/Delete";

import {
  useEffect,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { toast } from "react-toastify";

import {
  Feeder,
  FeederPayload,
  createFeeder,
  deleteFeeder,
  getFeeders,
  updateFeeder,
} from "../../../services/crmdService";

import { getErrorMessage } from "../../../utils/getErrorMessage";
import FeederFormModal from "./FeederFormModal";
import DeleteFeederDialog from "./DeleteFeederDialog";

const PAGE_SIZE = 10;


export default function FeederPage() {


  const queryClient =
    useQueryClient();


  // =========================
  // STATES
  // =========================


  const [search, setSearch] =
    useState("");


  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");


  const [page, setPage] =
    useState(1);


  const [
    voltageLevel,
    setVoltageLevel,
  ] = useState<
    number | ""
  >("");


  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);


  const [
    editingFeeder,
    setEditingFeeder,
  ] = useState<
    Feeder | null
  >(null);


  const [
    deletingFeeder,
    setDeletingFeeder,
  ] = useState<
    Feeder | null
  >(null);


  // =========================
  // DEBOUNCE SEARCH
  // =========================


  useEffect(() => {


    const timer =
      setTimeout(() => {


        setDebouncedSearch(
          search
        );


        setPage(1);


      }, 400);


    return () =>
      clearTimeout(timer);


  }, [search]);



  // =========================
  // FETCH FEEDERS
  // =========================


  const {

    data,

    isLoading,

    isFetching,

    isError,

    error,

  } = useQuery({


    queryKey: [

      "feeders",

      debouncedSearch,

      page,

      PAGE_SIZE,

      voltageLevel,

    ],


    queryFn: () =>

      getFeeders(

        debouncedSearch,

        page,

        PAGE_SIZE,

        undefined,

        undefined,

        undefined,

        undefined,

        undefined,

        voltageLevel || undefined

      ),


  });



  // =========================
  // FETCH ERROR
  // =========================


  useEffect(() => {


    if (isError) {


      toast.error(

        getErrorMessage(
          error
        )

      );


    }


  }, [

    isError,

    error,

  ]);



  // =========================
  // NORMALIZE RESPONSE
  // =========================


  const feeders =

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
        totalCount /
        PAGE_SIZE
      )

    );



  // =========================
  // CREATE FEEDER
  // =========================


  const createFeederMutation =

    useMutation({


      mutationFn:

        createFeeder,


      onSuccess: () => {


        toast.success(

          "Feeder created successfully."

        );


        setModalOpen(false);


        queryClient.invalidateQueries({

          queryKey:
            ["feeders"],

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
  // UPDATE FEEDER
  // =========================


  const updateFeederMutation =

    useMutation({


      mutationFn: ({

        payload,

        id,

      }: {

        payload:
          FeederPayload;

        id:
          number;

      }) =>

        updateFeeder(

          payload,

          id

        ),



      onSuccess: () => {


        toast.success(

          "Feeder updated successfully."

        );


        setModalOpen(false);


        setEditingFeeder(
          null
        );


        queryClient.invalidateQueries({

          queryKey:
            ["feeders"],

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
  // DELETE FEEDER
  // =========================


  const deleteFeederMutation =

    useMutation({


      mutationFn:

        deleteFeeder,


      onSuccess: () => {


        toast.success(

          "Feeder deleted successfully."

        );


        setDeletingFeeder(
          null
        );



        /*
          If the last item on
          the current page was deleted,
          go back one page.
        */


        if (

          feeders.length === 1 &&

          page > 1

        ) {


          setPage(

            (prev) =>
              prev - 1

          );


        } else {


          queryClient.invalidateQueries({

            queryKey:
              ["feeders"],

          });


        }


      },


      onError: (

        error: any

      ) => {


        const status =

          error?.response
            ?.status;



        if (

          status === 409

        ) {


          toast.error(

            "This feeder is being used by other records. Please deactivate it instead."

          );


        } else {


          toast.error(

            getErrorMessage(
              error
            )

          );


        }


      },


    });



  // =========================
  // SUBMIT
  // =========================


  const handleSubmit = (

    payload:
      FeederPayload

  ) => {


    if (

      editingFeeder

    ) {


      updateFeederMutation.mutate({

        payload,

        id:
          editingFeeder.id,

      });


    } else {


      createFeederMutation.mutate(

        payload

      );


    }


  };



  // =========================
  // DELETE
  // =========================


  const handleDelete = () => {


    if (

      !deletingFeeder

    )
      return;



    deleteFeederMutation.mutate(

      deletingFeeder.id

    );


  };



  // =========================
  // LOADING STATES
  // =========================


  const saving =

    createFeederMutation
      .isPending ||

    updateFeederMutation
      .isPending;



  const deleting =

    deleteFeederMutation
      .isPending;



  return (


    <Box>


      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}


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

            Feeders

          </Typography>


          <Typography

            fontSize={13}

            color="text.secondary"

          >

            Manage 33kV and 11kV
            electricity feeders.

          </Typography>


        </Box>



        <Button

          variant="contained"

          startIcon={
            <AddIcon />
          }


          onClick={() => {


            setEditingFeeder(
              null
            );


            setModalOpen(
              true
            );


          }}

        >

          Add Feeder

        </Button>


      </Stack>



      {/* ========================= */}
      {/* SEARCH + FILTER */}
      {/* ========================= */}


      <Stack

        direction={{

          xs: "column",

          sm: "row",

        }}

        spacing={2}

        mb={2}

      >


        <TextField

          fullWidth

          size="small"


          placeholder="
            Search feeder by
            name or code...
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

        />



        <TextField

          select

          size="small"

          label="Voltage"

          value={

            voltageLevel

          }


          onChange={(e) => {


            const value =
              e.target.value;


            setVoltageLevel(

              value === ""

                ? ""

                : Number(value)

            );


            setPage(1);


          }}


          sx={{

            minWidth:
              160,

          }}

        >


          <MenuItem value="">

            All Voltage Levels

          </MenuItem>


          <MenuItem value={33}>

            33kV

          </MenuItem>


          <MenuItem value={11}>

            11kV

          </MenuItem>


        </TextField>


      </Stack>



      {/* ========================= */}
      {/* TABLE */}
      {/* ========================= */}


      <Card

        sx={{

          borderRadius: 3,

          overflow:
            "hidden",

        }}

      >


        <Box

          sx={{

            overflowX:
              "auto",

          }}

        >


          <table

            style={{

              width:
                "100%",

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

                  Feeder

                </th>



                <th
                  style={{
                    padding: 14,
                    textAlign: "left",
                  }}
                >

                  Voltage

                </th>



                <th
                  style={{
                    padding: 14,
                    textAlign: "left",
                  }}
                >

                  Parent

                </th>



                <th
                  style={{
                    padding: 14,
                    textAlign: "left",
                  }}
                >

                  Substation

                </th>



                <th
                  style={{
                    padding: 14,
                    textAlign: "left",
                  }}
                >

                  Band

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
                    textAlign: "left",
                  }}
                >

                  Automation

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



            <tbody>


              {isLoading ? (


                <tr>


                  <td

                    colSpan={8}

                    style={{

                      padding: 40,

                      textAlign:
                        "center",

                    }}

                  >

                    Loading feeders...

                  </td>


                </tr>


              ) : feeders.length === 0 ? (


                <tr>


                  <td

                    colSpan={8}

                    style={{

                      padding: 40,

                      textAlign:
                        "center",

                    }}

                  >

                    No feeders found.

                  </td>


                </tr>


              ) : (


                feeders.map(

                  (

                    feeder

                  ) => (


                    <tr

                      key={
                        feeder.id
                      }


                      style={{

                        borderTop:

                          "1px solid #E5E7EB",

                      }}

                    >


                      {/* ================= */}
                      {/* FEEDER */}
                      {/* ================= */}


                      <td
                        style={{
                          padding: 14,
                        }}
                      >


                        <Typography

                          fontWeight={600}

                        >

                          {
                            feeder.name
                          }

                        </Typography>


                        <Typography

                          fontSize={11}

                          color="text.secondary"

                        >

                          {
                            feeder.code
                          }

                        </Typography>


                      </td>



                      {/* ================= */}
                      {/* VOLTAGE */}
                      {/* ================= */}


                      <td
                        style={{
                          padding: 14,
                        }}
                      >


                        <Chip

                          size="small"


                          label={
                            `${feeder.voltage_level}kV`
                          }


                          color={

                            feeder.voltage_level === 33

                              ? "primary"

                              : "secondary"

                          }

                        />


                      </td>



                      {/* ================= */}
                      {/* PARENT */}
                      {/* ================= */}


                      <td
                        style={{
                          padding: 14,
                        }}
                      >


                        {

                          feeder.parent

                            ? (

                              <>

                                <Typography
                                  fontSize={13}
                                >

                                  {
                                    feeder.parent
                                      .name
                                  }

                                </Typography>


                                <Typography

                                  fontSize={11}

                                  color="text.secondary"

                                >

                                  {
                                    feeder.parent
                                      .code
                                  }

                                </Typography>

                              </>

                            )

                            : "-"

                        }


                      </td>



                      {/* ================= */}
                      {/* SUBSTATION */}
                      {/* ================= */}


                      <td
                        style={{
                          padding: 14,
                        }}
                      >


                        <Typography
                          fontSize={13}
                        >

                          {
                            feeder.substation
                              ?.name
                          }

                        </Typography>


                        <Typography

                          fontSize={11}

                          color="text.secondary"

                        >

                          {
                            feeder.substation
                              ?.code
                          }

                        </Typography>


                      </td>



                      {/* ================= */}
                      {/* BAND */}
                      {/* ================= */}


                      <td
                        style={{
                          padding: 14,
                        }}
                      >

                        {
                          feeder.band ||
                          "-"
                        }

                      </td>



                      {/* ================= */}
                      {/* STATUS */}
                      {/* ================= */}


                      <td
                        style={{
                          padding: 14,
                        }}
                      >


                        <Chip

                          size="small"


                          label={

                            feeder.status

                          }


                          color={

                            feeder.status ===
                              "active"

                              ? "success"

                              : "default"

                          }

                        />


                      </td>



                      {/* ================= */}
                      {/* AUTOMATED */}
                      {/* ================= */}


                      <td
                        style={{
                          padding: 14,
                        }}
                      >


                        <Chip

                          size="small"


                          label={

                            feeder.is_automated

                              ? "Automated"

                              : "Manual"

                          }


                          color={

                            feeder.is_automated

                              ? "primary"

                              : "default"

                          }

                        />


                      </td>



                      {/* ================= */}
                      {/* ACTIONS */}
                      {/* ================= */}


                      <td
                        style={{

                          padding: 14,

                          textAlign:
                            "center",

                        }}
                      >


                        <IconButton

                          size="small"


                          onClick={() => {


                            setEditingFeeder(

                              feeder

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



                        <IconButton

                          size="small"

                          color="error"


                          onClick={() =>

                            setDeletingFeeder(

                              feeder

                            )

                          }

                        >

                          <DeleteIcon
                            fontSize="small"
                          />

                        </IconButton>


                      </td>


                    </tr>


                  )

                )

              )}


            </tbody>


          </table>


        </Box>


      </Card>



      {/* ========================= */}
      {/* PAGINATION */}
      {/* ========================= */}


      <Box

        sx={{

          display:
            "flex",

          justifyContent:
            "space-between",

          alignItems:
            "center",

          mt: 2,

        }}

      >


        <Typography

          fontSize={13}

          color="text.secondary"

        >

          Showing page{" "}

          {page}

          {" "}of{" "}

          {totalPages}

          {" "}({totalCount} total)


        </Typography>



        <Stack

          direction="row"

          spacing={1}

        >


          <Button

            size="small"


            disabled={

              page === 1 ||

              isFetching

            }


            onClick={() =>

              setPage(

                (prev) =>
                  prev - 1

              )

            }

          >

            Previous

          </Button>



          <Button

            size="small"


            disabled={

              page >=
              totalPages ||

              isFetching

            }


            onClick={() =>

              setPage(

                (prev) =>
                  prev + 1

              )

            }

          >

            Next

          </Button>


        </Stack>


      </Box>



      {/* ========================= */}
      {/* FORM MODAL */}
      {/* ========================= */}


      <FeederFormModal

        open={modalOpen}


        onClose={() => {


          setModalOpen(false);


          setEditingFeeder(
            null
          );


        }}


        feeder={
          editingFeeder
        }


        loading={
          saving
        }


        onSubmit={
          handleSubmit
        }

      />



      {/* ========================= */}
      {/* DELETE MODAL */}
      {/* ========================= */}


      <DeleteFeederDialog

        open={
          Boolean(
            deletingFeeder
          )
        }


        feeder={
          deletingFeeder
        }


        loading={
          deleting
        }


        onClose={() =>

          setDeletingFeeder(
            null
          )

        }


        onConfirm={
          handleDelete
        }

      />


    </Box>


  );

}