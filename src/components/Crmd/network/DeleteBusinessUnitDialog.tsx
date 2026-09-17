import React from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import { BusinessUnit } from "../../../services/crmdService";


interface Props {

  open: boolean;

  businessUnit:
    | BusinessUnit
    | null;

  loading: boolean;

  onClose: () => void;

  onConfirm: () => void;

}


export default function DeleteBusinessUnitDialog({

  open,

  businessUnit,

  loading,

  onClose,

  onConfirm,

}: Props) {

  return (

    <Dialog
      open={open}
      onClose={onClose}
    >

      <DialogTitle className="bg-blue-900" color="white">

        Delete Business Unit

      </DialogTitle>


      <DialogContent>

        <Typography mt={3}>

          Are you sure you want to delete{" "}

          <strong>
            {businessUnit?.name}
          </strong>

          ?

        </Typography>


        <Typography
          fontSize={12}
          color="text.secondary"
          mt={1}
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

          color="error"

          variant="contained"

          disabled={loading}

          onClick={onConfirm}

        >

          {loading
            ? "Deleting..."
            : "Delete"}

        </Button>

      </DialogActions>


    </Dialog>

  );

}