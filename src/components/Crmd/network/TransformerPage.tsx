import {

  useEffect,

  useState,

} from "react";


import {

  useMutation,

  useQuery,

  useQueryClient,

} from "@tanstack/react-query";


import {

  Box,

  Button,

  Card,

  Chip,

  IconButton,

  InputAdornment,

  Stack,

  TextField,

  Typography,

} from "@mui/material";


import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Transformer,
  TransformerPayload,
  createTransformer,
  deleteTransformer,
  getTransformers,
  updateTransformer,
} from "../../../services/crmdService";
import {toast} from "react-toastify";
import {getErrorMessage} from "../../../utils/getErrorMessage";
import TransformerFormModal from "./TransformerFormModal";
import DeleteTransformerDialog from "./DeleteTransformerDialog";
import { usePermission } from "../../../hooks/usePermission";

const PAGE_SIZE = 10;

export default function TransformerPage() {

  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch ] = useState("");
  const [page, setPage ] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransformer, setEditingTransformer] = useState<Transformer | null>(null);
  const [deletingTransformer, setDeletingTransformer ] = useState<Transformer | null>(null);


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
  // FETCH TRANSFORMERS
  // =========================

  const {

    data,

    isLoading,

    isFetching,

    isError,

    error,

  } = useQuery({


    queryKey: [

      "transformers",

      debouncedSearch,

      page,

      PAGE_SIZE,

    ],


    queryFn: () =>

      getTransformers(

        debouncedSearch,

        page,

        PAGE_SIZE

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

  const transformers =

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
  // CREATE MUTATION
  // =========================

  const createTransformerMutation =

    useMutation({


      mutationFn:

        createTransformer,


      onSuccess: () => {


        toast.success(

          "Transformer created successfully."

        );


        setModalOpen(false);


        queryClient.invalidateQueries({

          queryKey:

            ["transformers"],

        });


      },


      onError: (

        error

      ) => {


        console.error(error);


        toast.error(

          getErrorMessage(
            error
          )

        );


      },


    });


  // =========================
  // UPDATE MUTATION
  // =========================

  const updateTransformerMutation =

    useMutation({


      mutationFn: ({

        payload,

        id,

      }: {

        payload:
          TransformerPayload;

        id:
          number;

      }) =>

        updateTransformer(

          payload,

          id

        ),


      onSuccess: () => {


        toast.success(

          "Transformer updated successfully."

        );


        setModalOpen(false);


        setEditingTransformer(
          null
        );


        queryClient.invalidateQueries({

          queryKey:

            ["transformers"],

        });


      },


      onError: (

        error

      ) => {


        console.error(error);


        toast.error(

          getErrorMessage(
            error
          )

        );


      },


    });


  // =========================
  // DELETE MUTATION
  // =========================

  const deleteTransformerMutation =

    useMutation({


      mutationFn:

        deleteTransformer,


      onSuccess: () => {


        toast.success(

          "Transformer deleted successfully."

        );


        setDeletingTransformer(
          null
        );


        /*
          If last item on page
          was deleted,
          go to previous page.
        */

        if (

          transformers.length === 1 &&

          page > 1

        ) {


          setPage(

            (prev) =>
              prev - 1

          );


        } else {


          queryClient.invalidateQueries({

            queryKey:

              ["transformers"],

          });


        }


      },


      onError: (

        error: any

      ) => {


        const status =

          error?.response?.status;


        if (

          status === 409

        ) {


          toast.error(

            "This transformer is being used by other records. Please deactivate it instead."

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
  // HANDLE SUBMIT
  // =========================

  const handleSubmit = (

    payload:
      TransformerPayload

  ) => {


    if (

      editingTransformer

    ) {


      updateTransformerMutation.mutate({

        payload,


        id:

          editingTransformer.id,

      });


    } else {


      createTransformerMutation.mutate(

        payload

      );


    }


  };


  // =========================
  // HANDLE DELETE
  // =========================

  const handleDelete = () => {


    if (

      !deletingTransformer

    )
      return;


    deleteTransformerMutation.mutate(

      deletingTransformer.id

    );


  };


  // =========================
  // LOADING STATES
  // =========================

  const saving =

    createTransformerMutation.isPending ||

    updateTransformerMutation.isPending;


  const deleting =

    deleteTransformerMutation.isPending;

const {can} = usePermission()
  // =========================
  // UI
  // =========================

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

            Transformers

          </Typography>


          <Typography

            fontSize={13}

            color="text.secondary"

          >

            Manage distribution transformers.

          </Typography>


        </Box>


        <Button

          variant="contained"

          startIcon={

            <AddIcon />

          }
          onClick={() => {
            setEditingTransformer(
              null
            );
            setModalOpen(
              true
            );
          }}

        >
          Add Transformer

        </Button>


      </Stack>


      {/* ========================= */}
      {/* SEARCH */}
      {/* ========================= */}

      <TextField

        fullWidth

        size="small"

        placeholder="Search transformer by name or code..."


        value={

          search

        }


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
                    textAlign: "left",
                  }}
                >
                  Transformer
                </th>


                <th
                  style={{
                    padding: 14,
                    textAlign: "left",
                  }}
                >
                  Code
                </th>


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
                  Band
                </th>


                <th
                  style={{
                    padding: 14,
                    textAlign: "left",
                  }}
                >
                  Schedule
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

                    colSpan={7}

                    style={{

                      padding: 40,

                      textAlign:
                        "center",

                    }}

                  >

                    Loading transformers...

                  </td>


                </tr>


              ) : transformers.length === 0 ? (


                <tr>


                  <td

                    colSpan={7}

                    style={{

                      padding: 40,

                      textAlign:
                        "center",

                    }}

                  >

                    No transformers found.

                  </td>


                </tr>


              ) : (


                transformers.map(

                  (transformer) => (


                    <tr

                      key={

                        transformer.id

                      }


                      style={{

                        borderTop:

                          "1px solid #E5E7EB",

                      }}

                    >


                      {/* TRANSFORMER */}

                      <td
                        style={{
                          padding: 14,
                        }}
                      >


                        <Typography

                          fontWeight={600}

                        >

                          {

                            transformer.name

                          }

                        </Typography>


                        <Typography

                          fontSize={11}

                          color="text.secondary"

                        >

                          {

                            transformer.address

                          }

                        </Typography>


                      </td>


                      {/* CODE */}

                      <td
                        style={{
                          padding: 14,
                        }}
                      >


                        <Chip

                          label={

                            transformer.code

                          }

                          size="small"

                        />


                      </td>


                      {/* FEEDER */}

                      <td
                        style={{
                          padding: 14,
                        }}
                      >


                        <Typography

                          fontWeight={500}

                        >

                          {

                            transformer.feeder
                              ?.name

                          }

                        </Typography>


                        <Typography

                          fontSize={11}

                          color="text.secondary"

                        >

                          {

                            transformer.feeder
                              ?.code

                          }

                          {" • "}

                          {

                            transformer.feeder
                              ?.voltage_level

                          }

                          kV

                        </Typography>


                      </td>


                      {/* BAND */}

                      <td
                        style={{
                          padding: 14,
                        }}
                      >


                        {

                          transformer.band

                        }


                      </td>


                      {/* SCHEDULE */}

                      <td
                        style={{
                          padding: 14,
                        }}
                      >


                        <Chip

                          size="small"

                          label={

                            transformer.schedule
                              ?.toUpperCase()

                          }


                          color={

                            transformer.schedule ===
                            "metered"

                              ? "primary"

                              : "default"

                          }

                        />


                      </td>


                      {/* STATUS */}

                      <td
                        style={{
                          padding: 14,
                        }}
                      >


                        <Chip

                          size="small"


                          label={

                            transformer.is_active

                              ? "Active"

                              : "Inactive"

                          }


                          color={

                            transformer.is_active

                              ? "success"

                              : "default"

                          }

                        />


                      </td>


                      {/* ACTIONS */}

                      <td
                        style={{
                          padding: 14,
                          textAlign: "center",
                        }}
                      >


                        <IconButton

                          size="small"


                          onClick={() => {


                            setEditingTransformer(

                              transformer

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

                            setDeletingTransformer(

                              transformer

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

      {totalPages > 1 && (


        <Box

          sx={{

            display: "flex",

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


      )}


      {/* ========================= */}
      {/* CREATE / EDIT MODAL */}
      {/* ========================= */}

      <TransformerFormModal

        open={

          modalOpen

        }


        onClose={() => {


          setModalOpen(false);


          setEditingTransformer(
            null
          );


        }}


        transformer={

          editingTransformer

        }


        loading={

          saving

        }


        onSubmit={

          handleSubmit

        }

      />


      {/* ========================= */}
      {/* DELETE DIALOG */}
      {/* ========================= */}

      <DeleteTransformerDialog

        open={

          Boolean(
            deletingTransformer
          )

        }


        transformer={

          deletingTransformer

        }


        loading={

          deleting

        }


        onClose={() =>

          setDeletingTransformer(
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