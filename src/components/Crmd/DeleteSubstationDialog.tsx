import {

  Button,

  Dialog,

  DialogActions,

  DialogContent,

  DialogContentText,

  DialogTitle,

} from "@mui/material";

import {

  Substation,

} from "../../services/crmdService";


interface Props {

  open: boolean;

  substation:
    Substation | null;

  loading: boolean;

  onClose: () => void;

  onConfirm: () => void;

}


export default function
DeleteSubstationDialog({

  open,

  substation,

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

      maxWidth="xs"

      fullWidth

    >


      {/* TITLE */}

      <DialogTitle>

        Delete Substation

      </DialogTitle>


      {/* CONTENT */}

      <DialogContent>


        <DialogContentText>


          Are you sure you want
          to delete


          <strong>

            {" "}

            {
              substation?.name
            }

          </strong>


          ?


          <br />

          <br />


          This action cannot
          be undone.


        </DialogContentText>


      </DialogContent>


      {/* ACTIONS */}

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