import {

  Button,

  Dialog,

  DialogActions,

  DialogContent,

  DialogContentText,

  DialogTitle,

} from "@mui/material";


import {

  MeterMake,

} from "../../../services/crmdService";


interface Props {

  open: boolean;

  meterMake: MeterMake | null;

  loading: boolean;

  onClose: () => void;

  onConfirm: () => void;

}


export default function DeleteMeterMakeDialog({

  open,

  meterMake,

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

      maxWidth="sm"

      fullWidth

    >


      <DialogTitle className='bg-blue-900' color='white'>

        Delete Meter Make

      </DialogTitle>


      <DialogContent>


        <DialogContentText mt={3}>


          Are you sure you want to delete:

          <strong>

            {" "}

            {meterMake?.name}

          </strong>

          ?


          <br />

          <br />


          This action cannot be undone.


        </DialogContentText>


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