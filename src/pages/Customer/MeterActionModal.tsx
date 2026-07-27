import {
    Dialog,
    DialogContent,
    Typography,
    Box,
    TextField,
    Button,
    Stack,
    FormControl,
    Select,
    MenuItem,
    CircularProgress,
} from "@mui/material";

export interface Field {
    name: string;
    label: string;

    type:
    | "text"
    | "number"
    | "textarea"
    | "select";

    placeholder?: string;

    options?: {
        label: string;
        value: string;
    }[];
}

interface Props {
    open: boolean;
    title: string;
    fields: Field[];
    values: Record<string, string>;
    onChange: (name: string, value: string) => void;
    onClose: () => void;
    onSubmit: () => void;
    /** Disables both buttons and swaps the submit label while an API call is in flight */
    loading?: boolean;
    /** Disables just the submit button (e.g. required fields not yet filled) */
    submitDisabled?: boolean;
}

export default function MeterActionModal({
    open,
    title,
    fields,
    values,
    onChange,
    onClose,
    onSubmit,
    loading = false,
    submitDisabled = false,
}: Props) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogContent sx={{ p: 5 }}>
                <Typography
                    sx={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#25345D",
                        mb: 5,
                    }}
                >
                    {title}
                </Typography>

                {fields.map((field) => (
                    <Box key={field.name} mb={3}>
                        <Typography
                            sx={{
                                color: "#4F67FF",
                                fontWeight: 600,
                                mb: 1,
                            }}
                        >
                            {field.label}
                        </Typography>

                        {field.type === "select" ? (
                            <FormControl fullWidth>
                                <Select
                                    value={values[field.name] || ""}
                                    displayEmpty
                                    onChange={(e) =>
                                        onChange(field.name, e.target.value)
                                    }
                                >
                                    <MenuItem value="">
                                        Select {field.label}
                                    </MenuItem>

                                    {field.options?.map((option) => (
                                        <MenuItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <TextField
                                fullWidth
                                type={
                                    field.type === "number"
                                        ? "number"
                                        : "text"
                                }
                                multiline={field.type === "textarea"}
                                rows={field.type === "textarea" ? 3 : 1}
                                placeholder={field.placeholder}
                                value={values[field.name] || ""}
                                onChange={(e) =>
                                    onChange(field.name, e.target.value)
                                }
                            />
                        )}
                    </Box>
                ))}

                <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="flex-end"
                >
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        disabled={loading}
                        sx={{
                            px: 5,
                            height: 55,
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={onSubmit}
                        disabled={loading || submitDisabled}
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                        sx={{
                            px: 5,
                            height: 55,
                            bgcolor: "#243B67",
                        }}
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}