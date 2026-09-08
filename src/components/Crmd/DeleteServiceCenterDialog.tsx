import {

  Button,

  Dialog,

  DialogActions,

  DialogContent,

  DialogContentText,

  DialogTitle,

} from "@mui/material";


import {

  ServiceCenter,

} from "../../services/crmdService";


interface Props {

  open: boolean;

  serviceCenter:
    ServiceCenter | null;

  loading: boolean;

  onClose: () => void;

  onConfirm: () => void;

}


export default function DeleteServiceCenterDialog({

  open,

  serviceCenter,

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


      <DialogTitle>

        Delete Service Center

      </DialogTitle>



      <DialogContent>


        <DialogContentText>


          Are you sure you want to delete


          {" "}

          <strong>

            {
              serviceCenter?.name
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

          onClick={onClose}

          disabled={loading}

        >

          Cancel

        </Button>



        <Button

          color="error"

          variant="contained"


          onClick={
            onConfirm
          }


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