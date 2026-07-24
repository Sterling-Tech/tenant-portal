import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    Typography,
    Stack,
    FormControlLabel,
    Switch,
    CircularProgress,
} from "@mui/material";

import {
    Ringfences,
    UpdateSchemePayload,
} from "../../services/ringfenceService";

interface Props {
    open: boolean;
    loading?: boolean;
    scheme: Ringfences | null;
    onClose: () => void;
    onSubmit: (
        schemeId: number,
        values: UpdateSchemePayload
    ) => void;
}

const defaultValues: UpdateSchemePayload = {
    name: "",
    description: "",
    is_active: true,
};

export default function EditSchemeModal({
    open,
    loading = false,
    scheme,
    onClose,
    onSubmit,
}: Props) {
    const [values, setValues] =
        useState<UpdateSchemePayload>(defaultValues);

    useEffect(() => {
        if (scheme && open) {
            setValues({
                name: scheme.name,
                description: scheme.description,
                is_active: scheme.is_active,
            });
        }
    }, [scheme, open]);

    const handleChange = (
        field: keyof UpdateSchemePayload,
        value: any
    ) => {
        setValues(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const submit = () => {
        if (!scheme) return;

        if (!values.name.trim()) return;

        onSubmit(scheme.id, values);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle className="bg-blue-800 text-white">
                <Typography
                    variant="h6"
                    fontWeight={700}
                >
                    Edit Scheme
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3} mt={0.2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Supplier"
                            value={scheme?.supplier.name ?? ""}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Scheme Code"
                            value={scheme?.code ?? ""}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Scheme Name"
                            value={values.name}
                            onChange={(e) =>
                                handleChange(
                                    "name",
                                    e.target.value
                                )
                            }
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            multiline
                            rows={4}
                            fullWidth
                            label="Description"
                            value={values.description}
                            onChange={(e) =>
                                handleChange(
                                    "description",
                                    e.target.value
                                )
                            }
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={values.is_active}
                                    onChange={(e) =>
                                        handleChange(
                                            "is_active",
                                            e.target.checked
                                        )
                                    }
                                />
                            }
                            label="Active Scheme"
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Stack
                    direction="row"
                    spacing={2}
                    width="100%"
                    justifyContent="flex-end"
                >
                    <Button
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={submit}
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress
                                size={22}
                                color="inherit"
                            />
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}