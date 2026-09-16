import {
  Button,
  Card,
  Chip,
  Menu,
  MenuItem,
  Pagination,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import Box from "@mui/material/Box";

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

import {
  ServiceCenter,
  ServiceCenterPayload,
  createServiceCenter,
  deleteServiceCenter,
  getServiceCenters,
  updateServiceCenter,
} from "../../../services/crmdService";

import { toast } from "react-toastify";

import { getErrorMessage } from "../../../utils/getErrorMessage";
import ServiceCenterFormModal from "./ServiceCenterFormModal";
import DeleteServiceCenterDialog from "./DeleteServiceCenterDialog";
import { usePermission } from "../../../hooks/usePermission";



const PAGE_SIZE = 10;


export default function ServiceCenterPage() {

  const queryClient =
    useQueryClient();


  // =========================
  // LOCAL STATE
  // =========================

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServiceCenter, setEditingServiceCenter] = useState<ServiceCenter | null>(null);
  const [deletingServiceCenter, setDeletingServiceCenter] = useState<ServiceCenter | null>(null);

  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedActionServiceCenter, setSelectedActionServiceCenter] = useState<ServiceCenter | null>(null);
  const actionMenuOpen = Boolean(actionAnchorEl);

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
  // FETCH SERVICE CENTERS
  // =========================

  const {

    data,

    isLoading,

    isFetching,

    isError,

    error,

  } = useQuery({

    queryKey: [

      "service-centers",

      debouncedSearch,

      page,

      PAGE_SIZE,

    ],


    queryFn: () =>

      getServiceCenters(

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
        getErrorMessage(error)
      );

    }

  }, [

    isError,

    error,

  ]);


  // =========================
  // NORMALIZE RESPONSE
  // =========================

  const serviceCenters =
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
  // CREATE MUTATION
  // =========================

  const createMutation =
    useMutation({

      mutationFn:
        createServiceCenter,


      onSuccess: () => {

        toast.success(
          "Service center created successfully."
        );


        setModalOpen(false);


        queryClient.invalidateQueries({

          queryKey:
            ["service-centers"],

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
  // UPDATE MUTATION
  // =========================

  const updateMutation =
    useMutation({

      mutationFn: ({

        payload,

        id,

      }: {

        payload:
        ServiceCenterPayload;

        id:
        number;

      }) =>

        updateServiceCenter(

          payload,

          id

        ),


      onSuccess: () => {

        toast.success(
          "Service center updated successfully."
        );


        setModalOpen(false);


        setEditingServiceCenter(
          null
        );


        queryClient.invalidateQueries({

          queryKey:
            ["service-centers"],

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
  // DELETE MUTATION
  // =========================

  const deleteMutation =
    useMutation({

      mutationFn:
        deleteServiceCenter,


      onSuccess: () => {

        toast.success(
          "Service center deleted successfully."
        );


        setDeletingServiceCenter(
          null
        );


        /*
          If the last item
          on this page is deleted,
          move to previous page.
        */

        if (

          serviceCenters.length === 1 &&

          page > 1

        ) {

          setPage(

            (prev) =>
              prev - 1

          );

        } else {

          queryClient.invalidateQueries({

            queryKey:
              ["service-centers"],

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

            "This service center is being used by other records. Please deactivate it instead."

          );

        } else {

          toast.error(

            getErrorMessage(error)

          );

        }

      },

    });


  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = (

    payload:
      ServiceCenterPayload

  ) => {

    if (

      editingServiceCenter

    ) {

      updateMutation.mutate({

        payload,

        id:
          editingServiceCenter.id,

      });

    } else {

      createMutation.mutate(

        payload

      );

    }

  };


  // =========================
  // DELETE
  // =========================

  const handleDelete = () => {

    if (

      !deletingServiceCenter

    )
      return;


    deleteMutation.mutate(

      deletingServiceCenter.id

    );

  };


  // =========================
  // LOADING STATES
  // =========================

  const saving = createMutation.isPending || updateMutation.isPending;
  const deleting = deleteMutation.isPending;

  const handleOpenActionMenu = (
    event: React.MouseEvent<HTMLElement>,
    serviceCenter: ServiceCenter
  ) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedActionServiceCenter(serviceCenter);
  };

  const handleCloseActionMenu = () => {
    setActionAnchorEl(null);
    setSelectedActionServiceCenter(null);
  };

  const handleEditServiceCenter = () => {
    if (!selectedActionServiceCenter) return;

    setEditingServiceCenter(
      selectedActionServiceCenter
    );

    setModalOpen(true);

    handleCloseActionMenu();
  };

  const handleDeleteServiceCenter = () => {
    if (!selectedActionServiceCenter) return;

    setDeletingServiceCenter(
      selectedActionServiceCenter
    );

    handleCloseActionMenu();
  };

  const { can } = usePermission();

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

            Service Centers

          </Typography>


          <Typography

            fontSize={13}

            color="text.secondary"

          >

            Manage service centers
            across your service network.

          </Typography>


        </Box>


        <Button

          variant="contained"

          startIcon={
            <AddIcon />
          }

          onClick={() => {

            setEditingServiceCenter(
              null
            );


            setModalOpen(
              true
            );

          }}

        >

          Add Service Center

        </Button>


      </Stack>



      {/* ========================= */}
      {/* SEARCH */}
      {/* ========================= */}

      <TextField

        fullWidth

        size="small"

        placeholder="
          Search service center
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

                  Service Center

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

                  Service Unit

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



            {/* ========================= */}
            {/* TABLE BODY */}
            {/* ========================= */}

            <tbody>


              {isLoading ? (


                <tr>


                  <td

                    colSpan={7}

                    style={{

                      padding:
                        40,

                      textAlign:
                        "center",

                    }}

                  >

                    Loading service centers...

                  </td>


                </tr>


              ) : serviceCenters.length === 0 ? (


                <tr>


                  <td

                    colSpan={7}

                    style={{

                      padding:
                        40,

                      textAlign:
                        "center",

                    }}

                  >

                    No service centers found.

                  </td>


                </tr>


              ) : (


                serviceCenters.map(

                  (serviceCenter) => (


                    <tr

                      key={
                        serviceCenter.id
                      }


                      style={{

                        borderTop:
                          "1px solid #E5E7EB",

                      }}

                    >


                      {/* ================= */}
                      {/* SERVICE CENTER */}
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
                            serviceCenter.name
                          }

                        </Typography>


                        <Typography

                          fontSize={11}

                          color="text.secondary"

                        >

                          {
                            serviceCenter.address
                          }

                        </Typography>


                      </td>



                      {/* ================= */}
                      {/* CODE */}
                      {/* ================= */}

                      <td
                        style={{
                          padding: 14,
                        }}
                      >


                        <Chip

                          label={
                            serviceCenter.code
                          }

                          size="small"

                        />


                      </td>



                      {/* ================= */}
                      {/* SERVICE UNIT */}
                      {/* ================= */}

                      <td
                        style={{
                          padding: 14,
                        }}
                      >


                        <Typography
                          fontWeight={500}
                        >

                          {

                            serviceCenter
                              .service_unit
                              ?.name

                          }

                        </Typography>


                        <Typography

                          fontSize={11}

                          color="text.secondary"

                        >

                          {

                            serviceCenter
                              .service_unit
                              ?.code

                          }

                        </Typography>


                      </td>



                      {/* ================= */}
                      {/* BUSINESS UNIT */}
                      {/* ================= */}

                      <td
                        style={{
                          padding: 14,
                        }}
                      >

                        {
                          serviceCenter
                            .business_unit
                        }

                      </td>



                      {/* ================= */}
                      {/* REGION */}
                      {/* ================= */}

                      <td
                        style={{
                          padding: 14,
                        }}
                      >

                        {
                          serviceCenter
                            .region
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

                            serviceCenter
                              .is_active

                              ? "Active"

                              : "Inactive"

                          }


                          color={

                            serviceCenter
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
                                  serviceCenter
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
            onClick={handleEditServiceCenter}
          >
            <EditIcon
              fontSize="small"
              sx={{ mr: 1 }}
            />

            Edit
          </MenuItem>

          <MenuItem
            onClick={handleDeleteServiceCenter}
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

          mt:
            2,

        }}

      >


        <Typography

          fontSize={13}

          color="text.secondary"

        >

          Showing page {page}
          {" "}of {totalPages}

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



      {/* ========================= */}
      {/* CREATE / EDIT MODAL */}
      {/* ========================= */}

      <ServiceCenterFormModal

        open={
          modalOpen
        }


        onClose={() => {

          setModalOpen(
            false
          );


          setEditingServiceCenter(
            null
          );

        }}


        serviceCenter={
          editingServiceCenter
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

      <DeleteServiceCenterDialog

        open={
          Boolean(
            deletingServiceCenter
          )
        }


        serviceCenter={
          deletingServiceCenter
        }


        loading={
          deleting
        }


        onClose={() =>

          setDeletingServiceCenter(
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