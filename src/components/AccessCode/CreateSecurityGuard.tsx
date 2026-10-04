import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { CreateGuardPayload, Guard } from "../../services/AccessCodeService";


interface Props {
    open: boolean;
    guard?: Guard | null;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateGuardPayload) => void;
}

const initialForm: CreateGuardPayload = {
    name: "",
    email: "",
    phone_number: "",
    gender: "male",
};

export default function SecurityGuardFormModal({
    open,
    guard,
    loading = false,
    onClose,
    onSubmit,
}: Props) {
    const [form, setForm] =
        useState<CreateGuardPayload>(initialForm);

    const [errors, setErrors] =
        useState<Record<string, string>>({});

    useEffect(() => {
        if (guard) {
            setForm({
                name: guard.name,
                email: guard.email,
                phone_number: guard.phone_number,
                gender: guard.gender,
            });
        } else {
            setForm(initialForm);
        }

        setErrors({});
    }, [guard, open]);

    const handleChange =
        (field: keyof CreateGuardPayload) =>
        (
            event: React.ChangeEvent<HTMLInputElement>
        ) => {
            setForm((prev) => ({
                ...prev,
                [field]: event.target.value,
            }));

            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!form.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        }

        if (!form.phone_number.trim()) {
            newErrors.phone_number =
                "Phone number is required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        onSubmit({
            name: form.name.trim(),
            email: form.email.trim(),
            phone_number: form.phone_number.trim(),
            gender: form.gender,
        });
    };

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                Add Security Guard
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2.5} mt={1}>

                    <TextField
                        fullWidth
                        label="Full Name"
                        value={form.name}
                        onChange={handleChange("name")}
                        error={Boolean(errors.name)}
                        helperText={errors.name}
                    />

                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                    />

                    <TextField
                        fullWidth
                        label="Phone Number"
                        value={form.phone_number}
                        onChange={handleChange(
                            "phone_number"
                        )}
                        error={Boolean(
                            errors.phone_number
                        )}
                        helperText={
                            errors.phone_number
                        }
                    />

                    <TextField
                        select
                        fullWidth
                        label="Gender"
                        value={form.gender}
                        onChange={handleChange("gender")}
                    >
                        <MenuItem value="male">
                            Male
                        </MenuItem>

                        <MenuItem value="female">
                            Female
                        </MenuItem>
                    </TextField>

                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>

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
                    {loading
                        ? "Creating..."
                        : "Create Guard"}
                </Button>

            </DialogActions>
        </Dialog>
    );
}