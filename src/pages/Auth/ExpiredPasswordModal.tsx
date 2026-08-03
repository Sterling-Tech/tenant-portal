import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { LockReset } from "@mui/icons-material";
import { useState } from "react";

interface Props {
    open: boolean;
    email: string;
    loading?: boolean;
    onClose?: () => void;
    onSubmit: (payload: {
        old_password: string;
        new_password: string;
        confirm_password: string;
    }) => void;
}

const ExpiredPasswordModal = ({
    open,
    email,
    loading,
    onClose,
    onSubmit,
}: Props) => {
    const [form, setForm] = useState({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange =
        (field: keyof typeof form) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setForm({
                    ...form,
                    [field]: e.target.value,
                });
            };

    return (
        <Dialog
            open={open}
            //   onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle
                sx={{
                    bgcolor: "error.main",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <LockReset />
                Password Expired
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                <Stack spacing={3}>
                    <Alert severity="warning">
                        Your password has expired.
                        <br />
                        You must create a new password before you can continue.
                    </Alert>

                    <TextField
                        label="Email"
                        value={email}
                        fullWidth
                        disabled
                    />

                    <TextField
                        label="Current Password"
                        type={showOldPassword ? "text" : "password"}
                        fullWidth
                        value={form.old_password}
                        onChange={handleChange("old_password")}
                    />

                    <TextField
                        label="New Password"
                        type={showNewPassword ? "text" : "password"}
                        fullWidth
                        value={form.new_password}
                        onChange={handleChange("new_password")}
                    />

                    <TextField
                        label="Confirm New Password"
                        type={showConfirmPassword ? "text" : "password"}
                        fullWidth
                        value={form.confirm_password}
                        onChange={handleChange("confirm_password")}
                    />

                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Your new password should:
                        </Typography>

                        <ul
                            style={{
                                marginTop: 8,
                                paddingLeft: 18,
                            }}
                        >
                            <li>Meet your organization's password policy</li>
                            <li>Be different from your previous password</li>
                            <li>Contain uppercase, lowercase, numbers and symbols (if required)</li>
                        </ul>
                    </Box>

                    <Button
                        variant="contained"
                        size="large"
                        disabled={loading ||
                            !form.old_password ||
                            !form.new_password ||
                            !form.confirm_password}
                        onClick={() => onSubmit(form)}
                    >
                        {loading ? (
                            <CircularProgress
                                color="inherit"
                                size={22}
                            />
                        ) : (
                            "Update Password"
                        )}
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default ExpiredPasswordModal;