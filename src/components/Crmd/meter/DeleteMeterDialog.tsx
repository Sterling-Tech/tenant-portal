import {

  Button,

  Dialog,

  DialogActions,

  DialogContent,

  DialogTitle,

  Typography,

} from "@mui/material";


import {
  Meter,
} from "../../../services/crmdService";


interface Props {

  open: boolean;

  meter: Meter | null;

  loading: boolean;

  onClose: () => void;

  onConfirm: () => void;

}


export default function DeleteMeterDialog({

  open,

  meter,

  loading,

  onClose,

  onConfirm,

}: Props) {


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

        Delete Meter

      </DialogTitle>


      <DialogContent>


        <Typography>

          Are you sure you want to delete meter

          {" "}

          <strong>

            {meter?.meter_number}

          </strong>

          ?

        </Typography>


        <Typography

          variant="body2"

          color="text.secondary"

          sx={{
            mt: 1,
          }}

        >

          This action cannot be undone.

          If the meter is referenced by
          other records, the system may
          require you to deactivate it instead.

        </Typography>


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

          color="error"

          disabled={loading}

          onClick={onConfirm}

        >

          {

            loading

              ? "Deleting..."

              : "Delete"

          }

        </Button>


      </DialogActions>


    </Dialog>

  );

}