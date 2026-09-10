import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import { TariffCategory } from "../../../services/crmdService";

interface Props {
  open: boolean;
  category: TariffCategory | null;
  loading: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteCategoryDialog({
  open,
  category,
  loading,
  error,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        Delete Tariff Category
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        <Typography>
          Are you sure you want to delete{" "}
          <strong>
            {category?.name}
          </strong>
          ?
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          This action cannot be undone.
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          If this category is being used by other
          records, it cannot be deleted. You may
          need to deactivate it instead.
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
          {loading
            ? "Deleting..."
            : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}