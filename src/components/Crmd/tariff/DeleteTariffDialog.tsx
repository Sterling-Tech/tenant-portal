import {

  Button,

  Dialog,

  DialogActions,

  DialogContent,

  DialogTitle,

  Typography,

} from "@mui/material";


import {

  Tariff,

} from "../../../services/crmdService";


interface Props {

  open: boolean;

  tariff: Tariff | null;

  loading: boolean;

  onClose: () => void;

  onConfirm: () => void;

}


export default function DeleteTariffDialog({

  open,

  tariff,

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


      <DialogTitle className='bg-blue-900' color='white'>

        Delete Tariff

      </DialogTitle>


      <DialogContent>


        <Typography mt={3}>

          Are you sure you want to delete

          {" "}

          <strong>

            {tariff?.name}

          </strong>

          ?

        </Typography>


        <Typography

          color="error"

          mt={2}

        >

          This action cannot be undone.

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

          color="error"

          variant="contained"

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