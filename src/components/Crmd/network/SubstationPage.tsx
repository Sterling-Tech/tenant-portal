import {
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
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
  Substation,
  SubstationPayload,
  createSubstation,
  deleteSubstation,
  getSubstations,
  updateSubstation,
} from "../../../services/crmdService";

import { getErrorMessage } from "../../../utils/getErrorMessage";
import SubstationFormModal from "./SubstationFormModal";
import DeleteSubstationDialog from "./DeleteSubstationDialog";

const PAGE_SIZE = 10;


export default function SubstationPage() {

  const queryClient =
    useQueryClient();


  // ===================================
  // LOCAL STATE
  // ===================================

  const [search, setSearch] =
    useState("");


  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");


  const [page, setPage] =
    useState(1);


  const [modalOpen, setModalOpen] =
    useState(false);


  const [
    editingSubstation,
    setEditingSubstation,
  ] = useState<Substation | null>(
    null
  );


  const [
    deletingSubstation,
    setDeletingSubstation,
  ] = useState<Substation | null>(
    null
  );


  // ===================================
  // DEBOUNCE SEARCH
  // ===================================

  useEffect(() => {

    const timer =
      setTimeout(() => {

        setDebouncedSearch(search);

        setPage(1);

      }, 400);


    return () =>
      clearTimeout(timer);

  }, [search]);


  // ===================================
  // FETCH SUBSTATIONS
  // ===================================

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({

    queryKey: [

      "substations",

      debouncedSearch,

      page,

      PAGE_SIZE,

    ],


    queryFn: () =>
      getSubstations(

        debouncedSearch,

        page,

        PAGE_SIZE

      ),

  });


  // ===================================
  // FETCH ERROR
  // ===================================

  useEffect(() => {

    if (isError) {

      toast.error(
        getErrorMessage(error)
      );

    }

  }, [

    isError,

    error,

  ]);


  // ===================================
  // NORMALIZE RESPONSE
  // ===================================

  const substations =
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


  // ===================================
  // CREATE SUBSTATION
  // ===================================

  const createSubstationMutation =

    useMutation({

      mutationFn:
        createSubstation,


      onSuccess: () => {

        toast.success(
          "Substation created successfully."
        );


        setModalOpen(false);


        queryClient.invalidateQueries({

          queryKey:
            ["substations"],

        });

      },


      onError: (error) => {

        console.error(error);


        toast.error(
          getErrorMessage(error)
        );

      },

    });


  // ===================================
  // UPDATE SUBSTATION
  // ===================================

  const updateSubstationMutation =

    useMutation({

      mutationFn: ({

        payload,

        id,

      }: {

        payload:
          SubstationPayload;

        id:
          number;

      }) =>

        updateSubstation(

          payload,

          id

        ),


      onSuccess: () => {

        toast.success(
          "Substation updated successfully."
        );


        setModalOpen(false);


        setEditingSubstation(
          null
        );


        queryClient.invalidateQueries({

          queryKey:
            ["substations"],

        });

      },


      onError: (error) => {

        console.error(error);


        toast.error(
          getErrorMessage(error)
        );

      },

    });


  // ===================================
  // DELETE SUBSTATION
  // ===================================

  const deleteSubstationMutation =

    useMutation({

      mutationFn:
        deleteSubstation,


      onSuccess: () => {

        toast.success(
          "Substation deleted successfully."
        );


        setDeletingSubstation(
          null
        );


        /*
          If we delete the
          last item on a page,
          move to previous page.
        */

        if (

          substations.length === 1 &&

          page > 1

        ) {

          setPage(

            (prev) =>
              prev - 1

          );

        } else {

          queryClient.invalidateQueries({

            queryKey:
              ["substations"],

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

            "This substation is being used by other records. Please deactivate it instead."

          );

        } else {

          toast.error(

            getErrorMessage(error)

          );

        }

      },

    });


  // ===================================
  // SUBMIT FORM
  // ===================================

  const handleSubmit = (

    payload:
      SubstationPayload

  ) => {


    if (
      editingSubstation
    ) {

      updateSubstationMutation.mutate({

        payload,

        id:
          editingSubstation.id,

      });

    } else {

      createSubstationMutation.mutate(

        payload

      );

    }

  };


  // ===================================
  // DELETE
  // ===================================

  const handleDelete = () => {

    if (
      !deletingSubstation
    )
      return;


    deleteSubstationMutation.mutate(

      deletingSubstation.id

    );

  };


  // ===================================
  // LOADING STATES
  // ===================================

  const saving =

    createSubstationMutation.isPending ||

    updateSubstationMutation.isPending;


  const deleting =

    deleteSubstationMutation.isPending;


  // ===================================
  // RENDER
  // ===================================

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

            Injection Substations

          </Typography>


          <Typography

            fontSize={13}

            color="text.secondary"

          >

            Manage injection substations
            and their locations.

          </Typography>


        </Box>


        <Button

          variant="contained"

          startIcon={
            <AddIcon />
          }


          onClick={() => {


            setEditingSubstation(
              null
            );


            setModalOpen(
              true
            );


          }}

        >

          Add Substation

        </Button>


      </Stack>


      {/* ============================= */}
      {/* SEARCH */}
      {/* ============================= */}

      <TextField

        fullWidth

        size="small"


        placeholder="
          Search substation
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
            {/* TABLE HEADER */}
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

                  Substation

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

                  Address

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
            {/* TABLE BODY */}
            {/* ===================== */}

            <tbody>


              {/* Loading */}

              {isLoading ? (


                <tr>


                  <td

                    colSpan={5}


                    style={{

                      padding: 40,

                      textAlign:
                        "center",

                    }}

                  >

                    Loading substations...

                  </td>


                </tr>


              ) : substations.length === 0 ? (


                <tr>


                  <td

                    colSpan={5}


                    style={{

                      padding: 40,

                      textAlign:
                        "center",

                    }}

                  >

                    No substations found.

                  </td>


                </tr>


              ) : (


                substations.map(

                  (
                    substation
                  ) => (


                    <tr

                      key={
                        substation.id
                      }


                      style={{

                        borderTop:

                          "1px solid #E5E7EB",

                      }}

                    >


                      {/* ================= */}
                      {/* NAME */}
                      {/* ================= */}

                      <td

                        style={{

                          padding:
                            14,

                        }}

                      >


                        <Typography

                          fontWeight={600}

                        >

                          {
                            substation.name
                          }

                        </Typography>


                      </td>


                      {/* ================= */}
                      {/* CODE */}
                      {/* ================= */}

                      <td

                        style={{

                          padding:
                            14,

                        }}

                      >


                        <Chip

                          label={
                            substation.code
                          }

                          size="small"

                        />


                      </td>


                      {/* ================= */}
                      {/* ADDRESS */}
                      {/* ================= */}

                      <td

                        style={{

                          padding:
                            14,

                        }}

                      >

                        {
                          substation.address
                        }

                      </td>


                      {/* ================= */}
                      {/* STATUS */}
                      {/* ================= */}

                      <td

                        style={{

                          padding:
                            14,

                        }}

                      >


                        <Chip

                          size="small"


                          label={

                            substation.is_active

                              ? "Active"

                              : "Inactive"

                          }


                          color={

                            substation.is_active

                              ? "success"

                              : "default"

                          }

                        />


                      </td>


                      {/* ================= */}
                      {/* ACTIONS */}
                      {/* ================= */}

                      <td

                        style={{

                          padding:
                            14,

                          textAlign:
                            "center",

                        }}

                      >


                        {/* EDIT */}

                        <IconButton

                          size="small"


                          onClick={() => {


                            setEditingSubstation(

                              substation

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


                        {/* DELETE */}

                        <IconButton

                          size="small"

                          color="error"


                          onClick={() =>


                            setDeletingSubstation(

                              substation

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


      {/* ============================= */}
      {/* PAGINATION */}
      {/* ============================= */}

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


          {/* PREVIOUS */}

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


          {/* NEXT */}

          <Button

            size="small"


            disabled={

              page >= totalPages ||

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


      {/* ============================= */}
      {/* CREATE / EDIT MODAL */}
      {/* ============================= */}

      <SubstationFormModal

        open={modalOpen}


        onClose={() => {


          setModalOpen(false);


          setEditingSubstation(
            null
          );


        }}


        substation={
          editingSubstation
        }


        loading={
          saving
        }

        onSubmit={
          handleSubmit
        }

      />

      {/* ============================= */}
      {/* DELETE DIALOG */}
      {/* ============================= */}

      <DeleteSubstationDialog

        open={
          Boolean(
            deletingSubstation
          )
        }


        substation={
          deletingSubstation
        }


        loading={
          deleting
        }


        onClose={() =>

          setDeletingSubstation(
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