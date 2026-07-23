import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    CircularProgress,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { CreateSchemePayload } from "../../services/ringfenceService";

export interface SupplierOption {
    id: number;
    name: string;
}

// export interface SchemeForm {
//   supplier_id: number | "";
//   name: string;
//   code: string;
//   description: string;
//   is_active: boolean;
// }

interface Props {
    open: boolean;
    loading?: boolean;
    suppliers: SupplierOption[];
    //   initialValues?: SchemeForm;
    initialValues?: CreateSchemePayload;
    mode?: "create" | "edit";
    onClose: () => void;
    onSubmit: (values: CreateSchemePayload) => void;
}


const defaultValues: CreateSchemePayload = {
    supplier: 0,
    name: "",
    code: "",
    description: "",
};
export default function CreateSchemeModal({
    open,
    loading = false,
    suppliers,
    initialValues,
    mode = "create",
    onClose,
    onSubmit,
}: Props) {
    const [values, setValues] =
        useState<CreateSchemePayload>(defaultValues);

    useEffect(() => {
        if (open) {
            setValues(initialValues ?? defaultValues);
        }
    }, [open, initialValues]);

    const handleChange = (
        field: keyof CreateSchemePayload,
        value: any
    ) => {
        setValues((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const submit = () => {
        if (!values.supplier) return;
        if (!values.name.trim()) return;
        if (!values.code.trim()) return;

        onSubmit(values);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle>
                <Typography fontWeight={700}>
                    {mode === "create"
                        ? "Create Scheme"
                        : "Edit Scheme"}
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3} mt={0.2}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Supplier</InputLabel>

                            <Select
                                label="Supplier"
                                value={values.supplier}
                                onChange={(e) =>
                                    handleChange(
                                        "supplier",
                                        Number(e.target.value)
                                    )
                                }
                            >
                                {suppliers.map((supplier) => (
                                    <MenuItem
                                        key={supplier.id}
                                        value={supplier.id}
                                    >
                                        {supplier.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
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

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Scheme Code"
                            value={values.code}
                            onChange={(e) =>
                                handleChange(
                                    "code",
                                    e.target.value.toUpperCase()
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

                    {/* <Grid item xs={12}>
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
                    </Grid> */}
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
                        ) : mode === "create" ? (
                            "Create Scheme"
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}