import React from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Region } from "../../../services/crmdService";



interface Props {
  open: boolean;

  region: Region | null;

  loading?: boolean;

  onClose: () => void;

  onConfirm: () => void;
}

export default function DeleteRegionDialog({
  open,
  region,
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle className="bg-blue-900" color="white">
        Delete Region
      </DialogTitle>

      <DialogContent>
        <Typography mt={3}>
          Are you sure you want to delete{" "}
          <strong>
            {region?.name}
          </strong>
          ?
        </Typography>

        <Typography
          fontSize={13}
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
          onClick={onConfirm}
          disabled={loading}
        >
          {loading
            ? "Deleting..."
            : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}