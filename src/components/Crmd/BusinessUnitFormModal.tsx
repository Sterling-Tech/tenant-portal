import React, {
  useEffect,
  useState,
} from "react";

import {
  Box,
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
} from "@mui/material";

import {
  BusinessUnit,
  BusinessUnitPayload,
} from "../../services/crmdService";

import {
  Region,
  getRegions,
} from "../../services/crmdService";


interface Props {
  open: boolean;

  onClose: () => void;

  businessUnit: BusinessUnit | null;

  loading: boolean;

  onSubmit: (
    payload: BusinessUnitPayload
  ) => void;
}


const EMPTY_FORM: BusinessUnitPayload = {
  name: "",
  code: "",
  region: 0,
  nerc_address: "",
  phone: "",
  remittance_account: "",
  is_active: true,
};


export default function BusinessUnitFormModal({
  open,
  onClose,
  businessUnit,
  loading,
  onSubmit,
}: Props) {

  const [form, setForm] =
    useState<BusinessUnitPayload>(
      EMPTY_FORM
    );

  const [regions, setRegions] =
    useState<Region[]>([]);

  const [loadingRegions, setLoadingRegions] =
    useState(false);


  // --------------------------------
  // Load Regions
  // --------------------------------

  useEffect(() => {

    const loadRegions = async () => {

      try {

        setLoadingRegions(true);

        const response =
          await getRegions();

        const normalizedRegions =
          Array.isArray(response)
            ? response
            : Array.isArray(
                (response as any)?.results
              )
            ? (response as any).results
            : [];

        setRegions(
          normalizedRegions
        );

      } catch (error) {

        console.error(
          "Failed to load regions:",
          error
        );

      } finally {

        setLoadingRegions(false);

      }

    };


    if (open) {

      loadRegions();

    }

  }, [open]);


  // --------------------------------
  // Populate Form
  // --------------------------------

  useEffect(() => {

    if (businessUnit) {

      setForm({

        name:
          businessUnit.name || "",

        code:
          businessUnit.code || "",

        region:
          businessUnit.region?.id || 0,

        nerc_address:
          businessUnit.nerc_address || "",

        phone:
          businessUnit.phone || "",

        remittance_account:
          businessUnit.remittance_account || "",

        is_active:
          businessUnit.is_active,

      });

    } else {

      setForm(
        EMPTY_FORM
      );

    }

  }, [
    businessUnit,
    open,
  ]);


  // --------------------------------
  // Submit
  // --------------------------------

  const handleSubmit = () => {

    if (!form.name.trim()) {

      return;

    }

    if (!form.code.trim()) {

      return;

    }

    if (!form.region) {

      return;

    }

    onSubmit(form);

  };


  return (

    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >

      <DialogTitle>

        <Typography
          variant="h6"
          fontWeight={700}
        >

          {businessUnit
            ? "Edit Business Unit"
            : "Create Business Unit"}

        </Typography>

      </DialogTitle>


      <DialogContent>

        <Box mt={1}>

          <Stack spacing={2.5}>


            {/* Name */}

            <TextField

              label="Business Unit Name"

              required

              fullWidth

              value={form.name}

              onChange={(e) =>

                setForm((prev) => ({

                  ...prev,

                  name:
                    e.target.value,

                }))

              }

            />


            {/* Code */}

            <TextField

              label="Business Unit Code"

              required

              fullWidth

              value={form.code}

              onChange={(e) =>

                setForm((prev) => ({

                  ...prev,

                  code:
                    e.target.value
                      .toUpperCase(),

                }))

              }

            />


            {/* Region */}

            <FormControl
              fullWidth
              required
            >

              <InputLabel>

                Region

              </InputLabel>


              <Select

                value={form.region || ""}

                label="Region"

                disabled={
                  loadingRegions
                }

                onChange={(e) =>

                  setForm((prev) => ({

                    ...prev,

                    region:
                      Number(
                        e.target.value
                      ),

                  }))

                }

              >

                <MenuItem
                  value=""
                  disabled
                >

                  Select Region

                </MenuItem>


                {regions
                  .filter(
                    (region) =>
                      region.is_active
                  )
                  .map(
                    (region) => (

                      <MenuItem
                        key={region.id}
                        value={region.id}
                      >

                        {region.name}
                        {" "}
                        ({region.code})

                      </MenuItem>

                    )
                  )}

              </Select>

            </FormControl>


            {/* NERC Address */}

            <TextField

              label="NERC Address"

              fullWidth

              multiline

              minRows={2}

              value={
                form.nerc_address
              }

              onChange={(e) =>

                setForm((prev) => ({

                  ...prev,

                  nerc_address:
                    e.target.value,

                }))

              }

            />


            {/* Phone */}

            <TextField

              label="Phone Number"

              fullWidth

              value={form.phone}

              onChange={(e) =>

                setForm((prev) => ({

                  ...prev,

                  phone:
                    e.target.value,

                }))

              }

            />


            {/* Remittance Account */}

            <TextField

              label="Remittance Account"

              fullWidth

              value={
                form.remittance_account
              }

              onChange={(e) =>

                setForm((prev) => ({

                  ...prev,

                  remittance_account:
                    e.target.value,

                }))

              }

            />


            {/* Status */}

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >

              <Box>

                <Typography
                  fontWeight={600}
                >

                  Active

                </Typography>

                <Typography
                  fontSize={12}
                  color="text.secondary"
                >

                  Enable or disable this
                  business unit.

                </Typography>

              </Box>


              <Switch

                checked={
                  form.is_active
                }

                onChange={(e) =>

                  setForm((prev) => ({

                    ...prev,

                    is_active:
                      e.target.checked,

                  }))

                }

              />

            </Stack>


          </Stack>

        </Box>

      </DialogContent>


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

          disabled={loading}

          onClick={handleSubmit}

        >

          {loading
            ? "Saving..."
            : businessUnit
            ? "Update Business Unit"
            : "Create Business Unit"}

        </Button>

      </DialogActions>


    </Dialog>

  );

}