import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
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
  Add,
  Delete,
  Edit,
  MoreVert,
  Refresh,
  Search,
} from "@mui/icons-material";

import CategoryFormModal from "./CategoryFormModal";

import DeleteCategoryDialog from "./DeleteCategoryDialog";

import {
  createTariffCategory,
  deleteTariffCategory,
  getTariffCategories,
  Tariff,
  TariffCategory,
  TariffCategoryPayload,
  updateTariffCategory,
} from "../../../services/crmdService";


const PAGE_SIZE = 10;


export default function TariffCategoryPage() {

  // =========================
  // DATA STATE
  // =========================

  const [
    categories,
    setCategories,
  ] = useState<TariffCategory[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    saving,
    setSaving,
  ] = useState(false);

  const [closeDialogOpen, setCloseDialogOpen] =
  useState(false);

const [tariffToClose, setTariffToClose] =
  useState<Tariff | null>(null);

const [closing, setClosing] =
  useState(false);

  // =========================
  // SEARCH STATE
  // =========================

  const [
    search,
    setSearch,
  ] = useState("");


  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");


  // =========================
  // PAGINATION
  // =========================

  const [
    page,
    setPage,
  ] = useState(1);


  const [
    count,
    setCount,
  ] = useState(0);


  // =========================
  // FORM MODAL
  // =========================

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);


  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<TariffCategory | null>(
    null
  );


  // =========================
  // ACTION MENU
  // =========================

  const [
    menuAnchor,
    setMenuAnchor,
  ] = useState<HTMLElement | null>(
    null
  );


  const [
    menuCategory,
    setMenuCategory,
  ] = useState<TariffCategory | null>(
    null
  );


  // =========================
  // DELETE DIALOG
  // =========================

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);


  const [
    categoryToDelete,
    setCategoryToDelete,
  ] = useState<TariffCategory | null>(
    null
  );


  const [
    deleteLoading,
    setDeleteLoading,
  ] = useState(false);


  const [
    deleteError,
    setDeleteError,
  ] = useState("");


  // =========================
  // SNACKBAR
  // =========================

  const [
    snackbar,
    setSnackbar,
  ] = useState({
    open: false,
    message: "",
    severity: "success" as
      | "success"
      | "error",
  });


  // =========================
  // DEBOUNCE SEARCH
  // =========================

  useEffect(() => {

    const timer = setTimeout(() => {

      setDebouncedSearch(search);

      setPage(1);

    }, 500);


    return () => {

      clearTimeout(timer);

    };

  }, [search]);


  // =========================
  // LOAD CATEGORIES
  // =========================

  const loadCategories =
    useCallback(async () => {

      try {

        setLoading(true);


        const response =
          await getTariffCategories(

            debouncedSearch,

            page,

            PAGE_SIZE

          );


        // =====================
        // HANDLE ARRAY RESPONSE
        // =====================

        if (Array.isArray(response)) {

          setCategories(response);

          setCount(
            response.length
          );

        }

        // =====================
        // HANDLE PAGINATED RESPONSE
        // =====================

        else {

          setCategories(
            response?.results ?? []
          );

          setCount(
            response?.count ?? 0
          );

        }


      } catch (error) {

        console.error(
          "Failed to load tariff categories",
          error
        );


        setSnackbar({

          open: true,

          message:
            "Failed to load tariff categories",

          severity:
            "error",

        });


      } finally {

        setLoading(false);

      }


    }, [

      debouncedSearch,

      page,

    ]);


  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {

    loadCategories();

  }, [loadCategories]);


  // =========================
  // CREATE
  // =========================

  const handleCreate = () => {

    setSelectedCategory(null);

    setModalOpen(true);

  };


  // =========================
  // EDIT
  // =========================

  const handleEdit = (

    category: TariffCategory

  ) => {

    setSelectedCategory(category);

    setModalOpen(true);

    handleCloseMenu();

  };


  // =========================
  // FORM SUBMIT
  // =========================

  const handleSubmit =
    async (
      payload: TariffCategoryPayload
    ) => {

      try {

        setSaving(true);


        // =====================
        // UPDATE
        // =====================

        if (selectedCategory) {

          await updateTariffCategory(

            payload,

            selectedCategory.id

          );


          setSnackbar({

            open: true,

            message:
              "Tariff category updated successfully",

            severity:
              "success",

          });

        }

        // =====================
        // CREATE
        // =====================

        else {

          await createTariffCategory(
            payload
          );


          setSnackbar({

            open: true,

            message:
              "Tariff category created successfully",

            severity:
              "success",

          });

        }


        setModalOpen(false);

        setSelectedCategory(null);


        await loadCategories();


      } catch (error: any) {

        console.error(
          "Failed to save tariff category",
          error
        );


        setSnackbar({

          open: true,

          message:
            "Failed to save tariff category",

          severity:
            "error",

        });


      } finally {

        setSaving(false);

      }

    };


  // =========================
  // OPEN DELETE DIALOG
  // =========================

  const handleOpenDeleteDialog = (

    category: TariffCategory

  ) => {

    setCategoryToDelete(category);

    setDeleteError("");

    setDeleteDialogOpen(true);

    handleCloseMenu();

  };


  // =========================
  // CLOSE DELETE DIALOG
  // =========================

  const handleCloseDeleteDialog = () => {

    if (deleteLoading) {
      return;
    }


    setDeleteDialogOpen(false);

    setCategoryToDelete(null);

    setDeleteError("");

  };


  // =========================
  // CONFIRM DELETE
  // =========================

  const handleConfirmDelete =
    async () => {

      if (!categoryToDelete) {
        return;
      }


      try {

        setDeleteLoading(true);

        setDeleteError("");


        await deleteTariffCategory(

          categoryToDelete.id

        );


        // =====================
        // CLOSE DIALOG
        // =====================

        setDeleteDialogOpen(false);

        setCategoryToDelete(null);


        // =====================
        // SUCCESS MESSAGE
        // =====================

        setSnackbar({

          open: true,

          message:
            "Tariff category deleted successfully",

          severity:
            "success",

        });


        // =====================
        // HANDLE LAST ITEM
        // =====================

        if (

          categories.length === 1 &&

          page > 1

        ) {

          setPage(
            (prev) => prev - 1
          );

        }

        else {

          await loadCategories();

        }


      } catch (error: any) {

        console.error(
          "Failed to delete tariff category",
          error
        );


        let message =
          "Failed to delete tariff category";


        // =====================
        // HANDLE 409 ERROR
        // =====================

        if (

          error?.response?.status === 409

        ) {

          message =
            "This category is being used by other records and cannot be deleted. Please deactivate it instead.";

        }


        // =====================
        // HANDLE BACKEND ERRORS
        // =====================

        else if (

          error?.response?.data

        ) {

          const data =
            error.response.data;


          if (
            typeof data === "string"
          ) {

            message = data;

          }

          else if (
            data.detail
          ) {

            message = data.detail;

          }

          else {

            message =
              JSON.stringify(data);

          }

        }


        setDeleteError(message);


      } finally {

        setDeleteLoading(false);

      }

    };


  // =========================
  // OPEN ACTION MENU
  // =========================

  const handleOpenMenu = (

    event:
      React.MouseEvent<HTMLElement>,

    category:
      TariffCategory

  ) => {

    setMenuAnchor(
      event.currentTarget
    );


    setMenuCategory(category);

  };


  // =========================
  // CLOSE ACTION MENU
  // =========================

  const handleCloseMenu = () => {

    setMenuAnchor(null);

    setMenuCategory(null);

  };


  // =========================
  // PAGINATION
  // =========================

  const totalPages =
    Math.ceil(
      count / PAGE_SIZE
    );


  // =========================
  // RENDER
  // =========================

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

            Tariff Categories

          </Typography>


          <Typography
            variant="body2"
            color="text.secondary"
          >

            Manage electricity tariff categories

          </Typography>

        </Box>



        <Stack
          direction="row"
          spacing={1}
        >

          <Button

            variant="outlined"

            startIcon={<Refresh />}

            onClick={loadCategories}

          >

            Refresh

          </Button>



          <Button

            variant="contained"

            startIcon={<Add />}

            onClick={handleCreate}

          >

            Add Category

          </Button>

        </Stack>

      </Stack>



      {/* ===================== */}
      {/* SEARCH */}
      {/* ===================== */}

      <TextField

        fullWidth

        placeholder="Search category..."

        value={search}

        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }

        InputProps={{

          startAdornment: (

            <Search

              sx={{

                mr: 1,

                color:
                  "text.secondary",

              }}

            />

          ),

        }}

        sx={{
          mb: 2,
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
                  Name
                </TableCell>

                <TableCell>
                  Legacy Name
                </TableCell>

                <TableCell>
                  Status
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


              {/* ================= */}
              {/* LOADING */}
              {/* ================= */}

              {

                loading && (

                  <TableRow>

                    <TableCell

                      colSpan={5}

                      align="center"

                      sx={{
                        py: 4,
                      }}

                    >

                      <CircularProgress
                        size={30}
                      />

                    </TableCell>

                  </TableRow>

                )

              }



              {/* ================= */}
              {/* EMPTY */}
              {/* ================= */}

              {

                !loading &&

                categories.length === 0 && (

                  <TableRow>

                    <TableCell

                      colSpan={5}

                      align="center"

                      sx={{
                        py: 4,
                      }}

                    >

                      <Typography
                        color="text.secondary"
                      >

                        No tariff categories found

                      </Typography>

                    </TableCell>

                  </TableRow>

                )

              }



              {/* ================= */}
              {/* DATA */}
              {/* ================= */}

              {

                !loading &&

                categories.map(

                  (category) => (

                    <TableRow

                      key={category.id}

                      hover

                    >


                      {/* NAME */}

                      <TableCell>

                        <Typography
                          fontWeight={600}
                        >

                          {category.name}

                        </Typography>

                      </TableCell>



                      {/* LEGACY NAME */}

                      <TableCell>

                        {
                          category.legacy_name ||
                          "-"
                        }

                      </TableCell>



                      {/* STATUS */}

                      <TableCell>

                        <Chip

                          size="small"

                          label={

                            category.is_active

                              ? "Active"

                              : "Inactive"

                          }

                          color={

                            category.is_active

                              ? "success"

                              : "default"

                          }

                        />

                      </TableCell>



                      {/* CREATED DATE */}

                      <TableCell>

                        {

                          category.created_at

                            ? new Date(

                                category.created_at

                              ).toLocaleDateString()

                            : "-"

                        }

                      </TableCell>



                      {/* ACTION */}

                      <TableCell
                        align="right"
                      >

                        <IconButton

                          onClick={(event) =>

                            handleOpenMenu(

                              event,

                              category

                            )

                          }

                        >

                          <MoreVert />

                        </IconButton>

                      </TableCell>


                    </TableRow>

                  )

                )

              }


            </TableBody>


          </Table>


        </TableContainer>



        {/* ===================== */}
        {/* PAGINATION */}
        {/* ===================== */}

        <Stack

          direction="row"

          justifyContent="space-between"

          alignItems="center"

          p={2}

        >


          <Typography
            variant="body2"
            color="text.secondary"
          >

            Page {page} of{" "}

            {
              totalPages || 1
            }

            {" • "}

            {
              count
            }

            {" total"}

          </Typography>



          <Stack
            direction="row"
            spacing={1}
          >


            <Button

              disabled={
                page === 1 ||
                loading
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

              disabled={

                loading ||

                page >= totalPages

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


        </Stack>


      </Paper>



      {/* ===================== */}
      {/* ACTION MENU */}
      {/* ===================== */}

      <Menu

        anchorEl={menuAnchor}

        open={
          Boolean(menuAnchor)
        }

        onClose={handleCloseMenu}

      >


        {/* EDIT */}

        <MenuItem

          onClick={() => {

            if (menuCategory) {

              handleEdit(
                menuCategory
              );

            }

          }}

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

          onClick={() => {

            if (menuCategory) {

              handleOpenDeleteDialog(

                menuCategory

              );

            }

          }}

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
      {/* CREATE / EDIT MODAL */}
      {/* ===================== */}

      <CategoryFormModal

        open={modalOpen}

        onClose={() => {

          setModalOpen(false);

          setSelectedCategory(null);

        }}

        category={selectedCategory}

        loading={saving}

        onSubmit={handleSubmit}

      />



      {/* ===================== */}
      {/* DELETE DIALOG */}
      {/* ===================== */}

      <DeleteCategoryDialog

        open={deleteDialogOpen}

        category={categoryToDelete}

        loading={deleteLoading}

        error={deleteError}

        onClose={
          handleCloseDeleteDialog
        }

        onConfirm={
          handleConfirmDelete
        }

      />



      {/* ===================== */}
      {/* SNACKBAR */}
      {/* ===================== */}

      <Snackbar

        open={snackbar.open}

        autoHideDuration={4000}

        onClose={() =>

          setSnackbar(
            (prev) => ({

              ...prev,

              open: false,

            })

          )

        }

      >

        <Alert

          severity={
            snackbar.severity
          }

          onClose={() =>

            setSnackbar(
              (prev) => ({

                ...prev,

                open: false,

              })

            )

          }

        >

          {snackbar.message}

        </Alert>

      </Snackbar>


    </Box>

  );

}