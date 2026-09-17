import {

  Button,

  Dialog,

  DialogActions,

  DialogContent,

  DialogContentText,

  DialogTitle,

} from "@mui/material";


import {

  Feeder,

} from "../../../services/crmdService";


interface Props {

  open: boolean;

  feeder: Feeder | null;

  loading: boolean;

  onClose: () => void;

  onConfirm: () => void;

}


export default function DeleteFeederDialog({

  open,

  feeder,

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

    >


      <DialogTitle className='bg-blue-900' color='white'>

        Delete Feeder

      </DialogTitle>



      <DialogContent>


        <DialogContentText mt={3}>


          Are you sure you want to
          delete{" "}


          <strong>

            {
              feeder?.name
            }

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