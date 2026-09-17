import {

  Button,

  Dialog,

  DialogActions,

  DialogContent,

  DialogContentText,

  DialogTitle,

} from "@mui/material";


import {

  Transformer

} from "../../../services/crmdService";


interface Props {


  open:
    boolean;


  transformer:
    Transformer | null;


  loading:
    boolean;


  onClose:
    () => void;


  onConfirm:
    () => void;


}


export default function DeleteTransformerDialog({

  open,

  transformer,

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


      <DialogTitle className='bg-blue-900' color='white'>

        Delete Transformer

      </DialogTitle>


      <DialogContent >


        <DialogContentText mt={3}>


          Are you sure you want to delete{" "}


          <strong>

            {

              transformer?.name

            }

          </strong>


          ?


        </DialogContentText>


        <DialogContentText

          sx={{

            mt: 1,

            fontSize: 12,

          }}

        >


          This action cannot be undone.


        </DialogContentText>


      </DialogContent>


      <DialogActions>


        <Button

          disabled={loading}


          onClick={

            onClose

          }

        >

          Cancel

        </Button>


        <Button

          color="error"

          variant="contained"


          disabled={loading}


          onClick={

            onConfirm

          }

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