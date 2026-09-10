import {

  Button,

  Dialog,

  DialogActions,

  DialogContent,

  DialogContentText,

  DialogTitle,

} from "@mui/material";


import {

  Band,

} from "../../../services/crmdService";


interface Props {

  open: boolean;

  band: Band | null;

  loading: boolean;

  onClose: () => void;

  onConfirm: () => void;

}


export default function DeleteBandDialog({

  open,

  band,

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

        Delete Band

      </DialogTitle>


      <DialogContent>


        <DialogContentText>


          Are you sure you want to delete


          {" "}

          <strong>

            {band?.name}

          </strong>


          ?


        </DialogContentText>


        {

          (band?.feeder_count ?? 0) > 0 && (

            <DialogContentText
              sx={{
                mt: 2,
                color: "warning.main",
              }}
            >

              This band is currently used by{" "}

              <strong>

                {
                  band?.feeder_count
                }

              </strong>

              {" "}

              feeder(s).

              Deletion may fail.

              Consider deactivating the band instead.

            </DialogContentText>

          )

        }


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