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
  Stack,
  TextField,
} from "@mui/material";

import {
  MeterMake,
  MeterMakePayload,
} from "../../../services/crmdService";


interface Props {

  open: boolean;

  onClose: () => void;

  meterMake: MeterMake | null;

  loading: boolean;

  onSubmit: (
    payload: MeterMakePayload
  ) => void;

}


export default function MeterMakeFormModal({

  open,

  onClose,

  meterMake,

  loading,

  onSubmit,

}: Props) {


  // =========================
  // FORM STATE
  // =========================

  const [

    name,

    setName,

  ] = useState("");


  // =========================
  // POPULATE FORM
  // =========================

  useEffect(() => {


    if (meterMake) {


      setName(
        meterMake.name ?? ""
      );


    } else {


      setName("");


    }


  }, [

    meterMake,

    open,

  ]);


  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = () => {


    if (!name.trim()) {


      alert(
        "Meter make name is required"
      );


      return;

    }


    onSubmit({

      name:
        name.trim(),

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


      <DialogTitle>

        {

          meterMake

            ? "Edit Meter Make"

            : "Create Meter Make"

        }

      </DialogTitle>


      <DialogContent>


        <Stack

          spacing={2}

          mt={1}

        >


          <TextField

            fullWidth

            label="Meter Make Name"

            placeholder="Enter meter make name"

            value={name}

            disabled={loading}

            onChange={(event) =>

              setName(
                event.target.value
              )

            }

          />


        </Stack>


      </DialogContent>


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

              : meterMake

                ? "Update"

                : "Create"

          }

        </Button>


      </DialogActions>


    </Dialog>

  );

}