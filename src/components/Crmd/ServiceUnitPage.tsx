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


import {

  useEffect,

  useState,

} from "react";


import {

  useMutation,

  useQuery,

  useQueryClient,

} from "@tanstack/react-query";


import SearchIcon from
  "@mui/icons-material/Search";

import AddIcon from
  "@mui/icons-material/Add";

import EditIcon from
  "@mui/icons-material/Edit";

import DeleteIcon from
  "@mui/icons-material/Delete";


import {

  ServiceUnit,

  ServiceUnitPayload,

  createServiceUnit,

  deleteServiceUnit,

  getServiceUnits,

  updateServiceUnit,

} from "../../services/crmdService";


import {

  toast

} from "react-toastify";


import {

  getErrorMessage

} from "../../utils/getErrorMessage";


import ServiceUnitFormModal
  from "./ServiceUnitFormModal";
import DeleteServiceUnitDialog from "./DeleteServiceUnitDialog";



const PAGE_SIZE = 10;


export default function ServiceUnitPage() {


  const queryClient =
    useQueryClient();


  // =========================
  // STATE
  // =========================


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

    editingServiceUnit,

    setEditingServiceUnit,

  ] = useState<ServiceUnit | null>(
    null
  );


  const [

    deletingServiceUnit,

    setDeletingServiceUnit,

  ] = useState<ServiceUnit | null>(
    null
  );


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
  // FETCH SERVICE UNITS
  // =========================


  const {

    data,

    isLoading,

    isFetching,

    isError,

    error,

  } = useQuery({


    queryKey: [

      "service-units",

      debouncedSearch,

      page,

      PAGE_SIZE,

    ],


    queryFn: () =>

      getServiceUnits(

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


  const serviceUnits =

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
  // CREATE
  // =========================


  const createServiceUnitMutation =

    useMutation({


      mutationFn:

        createServiceUnit,


      onSuccess: () => {


        toast.success(

          "Service unit created successfully."

        );


        setModalOpen(
          false
        );


        queryClient.invalidateQueries({

          queryKey:

            ["service-units"],

        });


      },


      onError: (

        error

      ) => {


        console.error(
          error
        );


        toast.error(

          getErrorMessage(
            error
          )

        );


      },


    });


  // =========================
  // UPDATE
  // =========================


  const updateServiceUnitMutation =

    useMutation({


      mutationFn: ({

        payload,

        id,

      }: {

        payload:
          ServiceUnitPayload;

        id:
          number;

      }) =>

        updateServiceUnit(

          payload,

          id

        ),


      onSuccess: () => {


        toast.success(

          "Service unit updated successfully."

        );


        setModalOpen(
          false
        );


        setEditingServiceUnit(
          null
        );


        queryClient.invalidateQueries({

          queryKey:

            ["service-units"],

        });


      },


      onError: (

        error

      ) => {


        console.error(
          error
        );


        toast.error(

          getErrorMessage(
            error
          )

        );


      },


    });


  // =========================
  // DELETE
  // =========================


  const deleteServiceUnitMutation =

    useMutation({


      mutationFn:

        deleteServiceUnit,


      onSuccess: () => {


        toast.success(

          "Service unit deleted successfully."

        );


        setDeletingServiceUnit(
          null
        );


        /*
          Move back one page
          when deleting the
          only item
        */


        if (

          serviceUnits.length === 1 &&

          page > 1

        ) {


          setPage(

            (prev) =>

              prev - 1

          );


        } else {


          queryClient.invalidateQueries({

            queryKey:

              ["service-units"],

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

            "This service unit is being used by other records. Please deactivate it instead."

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
      ServiceUnitPayload

  ) => {


    if (

      editingServiceUnit

    ) {


      updateServiceUnitMutation.mutate({

        payload,

        id:

          editingServiceUnit.id,

      });


    } else {


      createServiceUnitMutation.mutate(

        payload

      );


    }


  };


  // =========================
  // DELETE
  // =========================


  const handleDelete = () => {


    if (

      !deletingServiceUnit

    )

      return;


    deleteServiceUnitMutation.mutate(

      deletingServiceUnit.id

    );


  };


  // =========================
  // LOADING STATES
  // =========================


  const saving =

    createServiceUnitMutation.isPending ||

    updateServiceUnitMutation.isPending;


  const deleting =

    deleteServiceUnitMutation.isPending;


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

            Service Units

          </Typography>


          <Typography

            fontSize={13}

            color="text.secondary"

          >

            Manage service units
            and their business units.

          </Typography>


        </Box>


        <Button

          variant="contained"

          startIcon={

            <AddIcon />

          }


          onClick={() => {


            setEditingServiceUnit(

              null

            );


            setModalOpen(

              true

            );


          }}

        >

          Add Service Unit

        </Button>


      </Stack>


      {/* ========================= */}
      {/* SEARCH */}
      {/* ========================= */}


      <TextField

        fullWidth

        size="small"


        placeholder="
          Search service unit
          by name or code...
        "


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


            {/* TABLE HEADER */}


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

                  Service Unit

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

                  Business Unit

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


            {/* TABLE BODY */}


            <tbody>


              {isLoading ? (


                <tr>


                  <td

                    colSpan={6}

                    style={{

                      padding: 40,

                      textAlign:

                        "center",

                    }}

                  >

                    Loading service units...

                  </td>


                </tr>


              ) : serviceUnits.length === 0 ? (


                <tr>


                  <td

                    colSpan={6}

                    style={{

                      padding: 40,

                      textAlign:

                        "center",

                    }}

                  >

                    No service units found.

                  </td>


                </tr>


              ) : (


                serviceUnits.map(

                  (

                    serviceUnit

                  ) => (


                    <tr

                      key={

                        serviceUnit.id

                      }


                      style={{

                        borderTop:

                          "1px solid #E5E7EB",

                      }}

                    >


                      {/* NAME */}


                      <td

                        style={{

                          padding: 14,

                        }}

                      >


                        <Typography

                          fontWeight={600}

                        >

                          {

                            serviceUnit.name

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

                            serviceUnit.code

                          }

                          size="small"

                        />


                      </td>


                      {/* BUSINESS UNIT */}


                      <td

                        style={{

                          padding: 14,

                        }}

                      >


                        <Typography

                          fontWeight={500}

                        >

                          {

                            serviceUnit
                              .business_unit
                              ?.name

                          }

                        </Typography>


                        <Typography

                          fontSize={11}

                          color="text.secondary"

                        >

                          {

                            serviceUnit
                              .business_unit
                              ?.code

                          }

                        </Typography>


                      </td>


                      {/* REGION */}


                      <td

                        style={{

                          padding: 14,

                        }}

                      >


                        <Typography

                          fontWeight={500}

                        >

                          {

                            serviceUnit
                              .business_unit
                              ?.region
                              ?.name

                          }

                        </Typography>


                        <Typography

                          fontSize={11}

                          color="text.secondary"

                        >

                          {

                            serviceUnit
                              .business_unit
                              ?.region
                              ?.code

                          }

                        </Typography>


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

                            serviceUnit
                              .is_active

                              ? "Active"

                              : "Inactive"

                          }


                          color={

                            serviceUnit
                              .is_active

                              ? "success"

                              : "default"

                          }

                        />


                      </td>


                      {/* ACTIONS */}


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


                            setEditingServiceUnit(

                              serviceUnit

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


                            setDeletingServiceUnit(

                              serviceUnit

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


      {

        totalPages > 1 && (


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


        )

      }


      {/* ========================= */}
      {/* FORM MODAL */}
      {/* ========================= */}


      <ServiceUnitFormModal

        open={

          modalOpen

        }


        onClose={() => {


          setModalOpen(

            false

          );


          setEditingServiceUnit(

            null

          );


        }}


        serviceUnit={

          editingServiceUnit

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


      <DeleteServiceUnitDialog

        open={

          Boolean(
            deletingServiceUnit
          )

        }


        serviceUnit={

          deletingServiceUnit

        }


        loading={

          deleting

        }


        onClose={() =>

          setDeletingServiceUnit(
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