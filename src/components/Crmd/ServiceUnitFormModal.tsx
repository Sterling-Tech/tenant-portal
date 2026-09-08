import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import {
  useEffect,
  useState,
} from "react";

import {
  BusinessUnit,
  ServiceUnit,
  ServiceUnitPayload,
  getBusinessUnits,
} from "../../services/crmdService";

interface ServiceUnitFormModalProps {
  open: boolean;

  onClose: () => void;

  serviceUnit: ServiceUnit | null;

  loading?: boolean;

  onSubmit: (
    payload: ServiceUnitPayload
  ) => void;
}

export default function ServiceUnitFormModal({
  open,
  onClose,
  serviceUnit,
  loading = false,
  onSubmit,
}: ServiceUnitFormModalProps) {

  const [businessUnits, setBusinessUnits] =
    useState<BusinessUnit[]>([]);

  const [loadingBusinessUnits, setLoadingBusinessUnits] =
    useState(false);


  const [form, setForm] =
    useState<ServiceUnitPayload>({
      name: "",
      code: "",
      business_unit: 0,
      is_active: true,
    });


  // =========================
  // Populate Form
  // =========================

  useEffect(() => {

    if (serviceUnit) {

      setForm({
        name:
          serviceUnit.name,

        code:
          serviceUnit.code,

        business_unit:
          serviceUnit.business_unit?.id || 0,

        is_active:
          serviceUnit.is_active,
      });

    } else {

      setForm({
        name: "",
        code: "",
        business_unit: 0,
        is_active: true,
      });

    }

  }, [serviceUnit, open]);


  // =========================
  // Load Business Units
  // =========================

  useEffect(() => {

    if (!open)
      return;


    const loadBusinessUnits =
      async () => {

        try {

          setLoadingBusinessUnits(
            true
          );


          const response =
            await getBusinessUnits(
              "",
              1,
              100
            );


          /*
            Support:

            [
              ...
            ]

            OR

            {
              count,
              results
            }
          */


          const normalizedBusinessUnits =
            Array.isArray(response)

              ? response

              : response?.results ?? [];


          setBusinessUnits(
            normalizedBusinessUnits
          );

        } catch (error) {

          console.error(
            "Failed to load business units:",
            error
          );

        } finally {

          setLoadingBusinessUnits(
            false
          );

        }

      };


    loadBusinessUnits();


  }, [open]);


  // =========================
  // Submit
  // =========================

  const handleSubmit = () => {

    if (!form.name.trim()) {
      return;
    }


    if (!form.code.trim()) {
      return;
    }


    if (!form.business_unit) {
      return;
    }


    onSubmit({
      ...form,

      name:
        form.name.trim(),

      code:
        form.code.trim(),
    });

  };


  return (

    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >


      {/* ========================= */}
      {/* TITLE */}
      {/* ========================= */}

      <DialogTitle>

        <Typography
          variant="h6"
          fontWeight={700}
        >

          {
            serviceUnit
              ? "Edit Service Unit"
              : "Add Service Unit"
          }

        </Typography>

      </DialogTitle>


      {/* ========================= */}
      {/* CONTENT */}
      {/* ========================= */}

      <DialogContent>


        <Stack
          spacing={3}
          mt={1}
        >


          {/* Name */}

          <TextField

            label="Service Unit Name"

            fullWidth

            required

            value={form.name}

            onChange={(e) =>

              setForm(
                (prev) => ({
                  ...prev,

                  name:
                    e.target.value,
                })
              )

            }

          />


          {/* Code */}

          <TextField

            label="Service Unit Code"

            fullWidth

            required

            value={form.code}

            onChange={(e) =>

              setForm(
                (prev) => ({
                  ...prev,

                  code:
                    e.target.value,
                })
              )

            }

          />


          {/* Business Unit */}

          <FormControl
            fullWidth
            required
          >

            <InputLabel>
              Business Unit
            </InputLabel>


            <Select

              value={
                form.business_unit
                  ? String(
                    form.business_unit
                  )
                  : ""
              }


              label="Business Unit"


              onChange={(e) =>

                setForm(
                  (prev) => ({
                    ...prev,

                    business_unit:
                      Number(
                        e.target.value
                      ),
                  })
                )

              }

            >


              <MenuItem value="">

                <em>
                  Select Business Unit
                </em>

              </MenuItem>


              {
                businessUnits.map(
                  (businessUnit) => (

                    <MenuItem
                      key={
                        businessUnit.id
                      }

                      value={
                        businessUnit.id
                      }
                    >

                      {
                        businessUnit.name
                      }

                      {" ("}

                      {
                        businessUnit.code
                      }

                      {")"}

                    </MenuItem>

                  )
                )
              }


            </Select>


            {
              loadingBusinessUnits && (

                <Typography
                  fontSize={12}
                  color="text.secondary"
                  mt={1}
                >

                  Loading business units...

                </Typography>

              )
            }


          </FormControl>


          {/* Status */}

          <FormControlLabel

            control={

              <Switch

                checked={
                  form.is_active
                }


                onChange={(e) =>

                  setForm(
                    (prev) => ({
                      ...prev,

                      is_active:
                        e.target.checked,
                    })
                  )

                }

              />

            }


            label={

              form.is_active
                ? "Active"
                : "Inactive"

            }

          />


        </Stack>


      </DialogContent>


      {/* ========================= */}
      {/* ACTIONS */}
      {/* ========================= */}

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >


        <Button
          onClick={onClose}
          disabled={loading}
        >

          Cancel

        </Button>


        <Button

          variant="contained"

          disabled={
            loading ||
            !form.name ||
            !form.code ||
            !form.business_unit
          }


          onClick={handleSubmit}

        >

          {
            loading

              ? "Saving..."

              : serviceUnit

                ? "Update Service Unit"

                : "Create Service Unit"

          }

        </Button>


      </DialogActions>


    </Dialog>

  );

}