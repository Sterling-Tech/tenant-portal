import {

  Button,

  Dialog,

  DialogActions,

  DialogContent,

  DialogTitle,

  Typography,

} from "@mui/material";


import {

  ServiceUnit,

} from "../../../services/crmdService";


interface DeleteServiceUnitDialogProps {

  open: boolean;

  serviceUnit:
    ServiceUnit | null;

  loading: boolean;

  onClose: () => void;

  onConfirm: () => void;

}


export default function DeleteServiceUnitDialog({

  open,

  serviceUnit,

  loading,

  onClose,

  onConfirm,

}: DeleteServiceUnitDialogProps) {


  return (


    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
    >


      <DialogTitle>

        Delete Service Unit

      </DialogTitle>


      <DialogContent>


        <Typography>


          Are you sure you want to delete{" "}


          <strong>

            {
              serviceUnit?.name
            }

          </strong>


          ?


        </Typography>


        <Typography

          mt={1}

          fontSize={13}

          color="text.secondary"

        >

          This action cannot be undone.

        </Typography>


      </DialogContent>


      <DialogActions>


        <Button

          onClick={onClose}

          disabled={loading}

        >

          Cancel

        </Button>


        <Button

          variant="contained"

          color="error"

          onClick={onConfirm}

          disabled={loading}

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