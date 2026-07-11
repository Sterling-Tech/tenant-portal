import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";

interface PipelineAuthDialogProps {
  open: boolean;
  loading?: boolean;
  defaultUsername?: string;
  onClose: () => void;
  onSubmit: (username: string, password: string) => Promise<void> | void;
}

export default function PipelineAuthDialog({
  open,
  loading = false,
  defaultUsername = "",
  onClose,
  onSubmit,
}: PipelineAuthDialogProps) {
  const [username, setUsername] = useState(defaultUsername);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) {
      setUsername(defaultUsername);
      setPassword("");
    }
  }, [open, defaultUsername]);

  const handleSubmit = async () => {
    if (!username.trim()) return;
    if (!password.trim()) return;

    await onSubmit(username, password);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        Authenticate Pipeline Trigger
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Username"
            value={username}
            fullWidth
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            fullWidth
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          Trigger Pipeline
        </Button>
      </DialogActions>
    </Dialog>
  );
}