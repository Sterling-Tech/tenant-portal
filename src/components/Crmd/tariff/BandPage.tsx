import {

  useCallback,

  useEffect,

  useState,

} from "react";


import {

  Add,

  Search,

} from "@mui/icons-material";


import {

  Alert,

  Box,

  Button,

  CircularProgress,

  InputAdornment,

  Paper,

  Stack,

  TextField,

  Typography,

} from "@mui/material";


import {

  Band,

  BandPayload,

  createBand,

  deleteBand,

  getBands,

  updateBand,

} from "../../../services/crmdService";


import BandFormModal from "./BandFormModal";

import BandTable from "./BandTable";

import DeleteBandDialog from "./DeleteBandDialog";


const PAGE_SIZE = 10;


export default function BandPage() {


  // =========================
  // STATE
  // =========================


  const [

    bands,

    setBands,

  ] = useState<Band[]>([]);


  const [

    loading,

    setLoading,

  ] = useState(false);


  const [

    saving,

    setSaving,

  ] = useState(false);


  const [

    error,

    setError,

  ] = useState<string | null>(
      null
    );


  const [

    search,

    setSearch,

  ] = useState("");


  const [

    debouncedSearch,

    setDebouncedSearch,

  ] = useState("");


  const [

    page,

    setPage,

  ] = useState(1);


  const [

    total,

    setTotal,

  ] = useState(0);


  // =========================
  // MODAL STATE
  // =========================


  const [

    formOpen,

    setFormOpen,

  ] = useState(false);


  const [

    deleteOpen,

    setDeleteOpen,

  ] = useState(false);


  const [

    selectedBand,

    setSelectedBand,

  ] = useState<
    Band | null
  >(null);


  // =========================
  // SEARCH DEBOUNCE
  // =========================


  useEffect(() => {


    const timer =
      setTimeout(() => {

        setDebouncedSearch(
          search
        );


        setPage(1);


      }, 500);


    return () =>
      clearTimeout(timer);


  }, [
    search,
  ]);


  // =========================
  // LOAD BANDS
  // =========================


  const loadBands =
    useCallback(

      async () => {


        try {


          setLoading(true);


          setError(
            null
          );


          const response =
            await getBands(

              debouncedSearch,

              page,

              PAGE_SIZE

            );


          // =====================
          // ARRAY RESPONSE
          // =====================


          if (

            Array.isArray(
              response
            )

          ) {


            setBands(
              response
            );


            setTotal(
              response.length
            );


            return;


          }


          // =====================
          // PAGINATED RESPONSE
          // =====================


          setBands(

            response?.results ?? []

          );


          setTotal(

            response?.count ?? 0

          );


        } catch (error: any) {


          console.error(
            error
          );


          setError(

            error?.message ??

            "Failed to load bands"

          );


        } finally {


          setLoading(false);


        }


      },

      [

        debouncedSearch,

        page,

      ]

    );


  useEffect(() => {


    loadBands();


  }, [
    loadBands,
  ]);


  // =========================
  // CREATE
  // =========================


  const handleCreate = () => {


    setSelectedBand(
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

    band: Band

  ) => {


    setSelectedBand(
      band
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

      payload: BandPayload

    ) => {


      try {


        setSaving(
          true
        );


        setError(
          null
        );


        if (

          selectedBand

        ) {


          await updateBand(

            payload,

            selectedBand.id

          );


        } else {


          await createBand(

            payload

          );


        }


        setFormOpen(
          false
        );


        setSelectedBand(
          null
        );


        await loadBands();


      } catch (error: any) {


        console.error(
          error
        );


        setError(

          error?.message ??

          "Failed to save band"

        );


      } finally {


        setSaving(
          false
        );


      }


    };


  // =========================
  // DELETE MODAL
  // =========================


  const handleDeleteClick = (

    band: Band

  ) => {


    setSelectedBand(
      band
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

        !selectedBand

      )

        return;


      try {


        setSaving(
          true
        );


        setError(
          null
        );


        await deleteBand(

          selectedBand.id

        );


        setDeleteOpen(
          false
        );


        setSelectedBand(
          null
        );


        await loadBands();


      } catch (error: any) {


        console.error(
          error
        );


        /*
          API can return:

          409

          Referenced by rows below it;
          deactivate instead.
        */


        setError(

          error?.response?.data?.detail ??

          error?.message ??

          "Unable to delete band. It may be referenced by feeders."

        );


      } finally {


        setSaving(
          false
        );


      }


    };


  // =========================
  // PAGINATION
  // =========================


  const totalPages =

    Math.ceil(

      total / PAGE_SIZE

    );


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
            fontWeight={600}
          >

            Band Management

          </Typography>


          <Typography
            variant="body2"
            color="text.secondary"
          >

            Configure tariff bands and baseline hours.

          </Typography>


        </Box>


        <Button

          variant="contained"

          startIcon={
            <Add />
          }

          onClick={
            handleCreate
          }

        >

          Add Band

        </Button>


      </Stack>


      {/* ===================== */}
      {/* ERROR */}
      {/* ===================== */}


      {

        error && (

          <Alert

            severity="error"

            sx={{
              mb: 2,
            }}

            onClose={() =>
              setError(null)
            }

          >

            {error}

          </Alert>

        )

      }


      {/* ===================== */}
      {/* SEARCH */}
      {/* ===================== */}


      <Paper

        elevation={0}

        sx={{
          p: 2,
          mb: 2,
          border:
            "1px solid #E5E7EB",
          borderRadius: 2,
        }}

      >


        <TextField

          fullWidth

          placeholder="Search by band name..."

          value={
            search
          }

          onChange={(e) =>

            setSearch(
              e.target.value
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


      </Paper>


      {/* ===================== */}
      {/* TABLE */}
      {/* ===================== */}


      {

        loading

          ? (

            <Box

              display="flex"

              justifyContent="center"

              py={6}

            >

              <CircularProgress />

            </Box>

          )

          : (

            <BandTable

              bands={
                bands
              }

              onEdit={
                handleEdit
              }

              onDelete={
                handleDeleteClick
              }

            />

          )

      }


      {/* ===================== */}
      {/* PAGINATION */}
      {/* ===================== */}


      {

        !loading &&

        totalPages > 1 && (

          <Stack

            direction="row"

            spacing={2}

            justifyContent="flex-end"

            alignItems="center"

            mt={3}

          >


            <Button

              disabled={
                page === 1
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


            <Typography>

              Page

              {" "}

              {page}

              {" "}

              of

              {" "}

              {totalPages}

            </Typography>


            <Button

              disabled={
                page ===
                totalPages
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

        )

      }


      {/* ===================== */}
      {/* FORM MODAL */}
      {/* ===================== */}


      <BandFormModal

        open={
          formOpen
        }

        onClose={() =>

          setFormOpen(
            false
          )

        }

        band={
          selectedBand
        }

        loading={
          saving
        }

        onSubmit={
          handleSubmit
        }

      />


      {/* ===================== */}
      {/* DELETE MODAL */}
      {/* ===================== */}


      <DeleteBandDialog

        open={
          deleteOpen
        }

        band={
          selectedBand
        }

        loading={
          saving
        }

        onClose={() => {

          setDeleteOpen(
            false
          );

        }}

        onConfirm={
          handleDelete
        }

      />


    </Box>

  );

}