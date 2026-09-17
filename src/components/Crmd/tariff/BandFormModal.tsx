import {
  useEffect,
  useState,
} from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from "@mui/material";

import {
  Band,
  BandPayload,
} from "../../../services/crmdService";


interface Props {
  open: boolean;

  onClose: () => void;

  band: Band | null;

  loading: boolean;

  onSubmit: (
    payload: BandPayload
  ) => void;
}


const initialForm: BandPayload = {
  name: "",
  category: "",
  description: "",
  baseline_hours: "",
  is_active: true,
};


export default function BandFormModal({
  open,
  onClose,
  band,
  loading,
  onSubmit,
}: Props) {


  const [
    form,
    setForm,
  ] = useState<BandPayload>(
    initialForm
  );


  // =========================
  // POPULATE FORM
  // =========================

  useEffect(() => {

    if (!open) return;


    if (band) {

      setForm({
        name:
          band.name ?? "",

        category:
          band.category ?? "",

        description:
          band.description ?? "",

        baseline_hours:
          band.baseline_hours ?? "",

        is_active:
          band.is_active,
      });

    } else {

      setForm(
        initialForm
      );

    }

  }, [
    band,
    open,
  ]);


  // =========================
  // CHANGE HANDLER
  // =========================

  const handleChange = (
    field: keyof BandPayload,
    value: string | boolean
  ) => {

    setForm(
      (prev:any) => ({
        ...prev,
        [field]: value,
      })
    );

  };


  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = () => {


    if (
      !form.name.trim()
    ) {

      alert(
        "Band name is required"
      );

      return;

    }


    if (
      !form.category.trim()
    ) {

      alert(
        "Band category is required"
      );

      return;

    }


    if (
      !form.baseline_hours.trim()
    ) {

      alert(
        "Baseline hours is required"
      );

      return;

    }


    const hours =
      Number(
        form.baseline_hours
      );


    if (
      Number.isNaN(hours) ||
      hours < 0
    ) {

      alert(
        "Baseline hours must be a valid positive number"
      );

      return;

    }


    onSubmit({
      ...form,

      name:
        form.name.trim(),

      category:
        form.category.trim(),

      description:
        form.description.trim(),

      baseline_hours:
        form.baseline_hours.trim(),
    });

  };


  return (

    <Dialog
      open={open}

      onClose={
        loading
          ? undefined
          : onClose
      }

      fullWidth

      maxWidth="sm"
    >


      {/* TITLE */}

      <DialogTitle className="bg-blue-900" color="white">

        {
          band
            ? "Edit Band"
            : "Create Band"
        }

      </DialogTitle>


      {/* CONTENT */}

      <DialogContent>


        <Stack
          spacing={2}
          mt={3}
        >


          {/* NAME */}

          <TextField
            fullWidth

            required

            label="Band Name"

            placeholder="e.g. Band A"

            value={
              form.name
            }

            onChange={(e) =>

              handleChange(
                "name",
                e.target.value
              )

            }
          />


          {/* CATEGORY */}

          <TextField
            fullWidth

            required

            label="Category"

            placeholder="e.g. Residential"

            value={
              form.category
            }

            onChange={(e) =>

              handleChange(
                "category",
                e.target.value
              )

            }
          />


          {/* DESCRIPTION */}

          <TextField
            fullWidth

            multiline

            rows={3}

            label="Description"

            placeholder="Enter band description"

            value={
              form.description
            }

            onChange={(e) =>

              handleChange(
                "description",
                e.target.value
              )

            }
          />


          {/* BASELINE HOURS */}

          <TextField
            fullWidth

            required

            type="number"

            label="Baseline Hours"

            placeholder="e.g. 417.6"

            inputProps={{
              min: 0,
              step: "0.01",
            }}

            value={
              form.baseline_hours
            }

            onChange={(e) =>

              handleChange(
                "baseline_hours",
                e.target.value
              )

            }
          />


          {/* ACTIVE */}

          <FormControlLabel

            control={

              <Switch

                checked={
                  form.is_active
                }

                onChange={(e) =>

                  handleChange(
                    "is_active",
                    e.target.checked
                  )

                }

              />

            }

            label="Active"

          />


        </Stack>


      </DialogContent>


      {/* ACTIONS */}

      <DialogActions>


        <Button

          disabled={loading}

          onClick={onClose}

        >

          Cancel

        </Button>


        <Button

          variant="contained"

          disabled={loading}

          onClick={handleSubmit}

        >

          {
            loading

              ? "Saving..."

              : band

                ? "Update Band"

                : "Create Band"

          }

        </Button>


      </DialogActions>


    </Dialog>

  );

}