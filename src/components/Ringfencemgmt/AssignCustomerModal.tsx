import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    Paper,
    Divider,
    Autocomplete,
    TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Customer } from "../../services/vendorService";


interface Props {
    open: boolean;
    loading?: boolean;
    schemeId: number;
    customers: Customer[];
    customerHasNext: boolean;
    customerPage: number;
    loadMore: () => void;
    onClose: () => void;
    onSubmit: (values: {
        scheme: number;
        customers: number[];
    }) => void;
}

export default function AssignCustomerModal({
    open,
    loading = false,
    schemeId,
    customers,
    customerHasNext,
    customerPage,
    loadMore,
    onClose,
    onSubmit,
}: Props) {
    const [selected, setSelected] = useState<Customer[]>([]);

    useEffect(() => {
        if (open) {
            setSelected([]);
        }
    }, [open]);

    const CustomerPaper = (props: any) => (
        <Paper {...props}>
            {props.children}

            {customerHasNext && (
                <>
                    <Divider />

                    <Button
                        fullWidth
                        disabled={loading}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={loadMore}
                    >
                        {loading ? (
                            <CircularProgress size={18} />
                        ) : (
                            "Load More"
                        )}
                    </Button>
                </>
            )}
        </Paper>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                Assign Customers
            </DialogTitle>

            <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Customers</InputLabel>

                    {/* <Select
                        multiple
                        value={selected}
                        label="Vendors"
                        onChange={(e) =>
                            setSelected(
                                e.target.value as number[]
                            )
                        }
                        renderValue={(selectedIds) =>
                            customers
                                .filter(v =>
                                    selectedIds.includes(v.id)
                                )
                                .map(v => v.name)
                                .join(", ")
                        }
                    >
                        {customers.map(customer => (
                            <MenuItem
                                key={customer.id}
                                value={customer.id}
                            >
                                <Checkbox
                                    checked={selected.includes(
                                        customer.id
                                    )}
                                />

                                <ListItemText
                                    primary={customer.name}
                                />
                            </MenuItem>
                        ))}
                    </Select> */}
                    <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={customers}
                        value={selected}
                        PaperComponent={CustomerPaper}
                        getOptionLabel={(option) => option.name}
                        onChange={(_, value) => setSelected(value)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Vendors"
                            />
                        )}
                        renderOption={(props, option, { selected }) => (
                            <li {...props}>
                                <Checkbox checked={selected} />

                                {option.name}
                            </li>
                        )}
                    />
                </FormControl>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    disabled={loading}
                    onClick={() =>
                        onSubmit({
                            scheme: schemeId,
                            // customers: selected,
                            customers: selected.map(v => Number(v.id))
                        })
                    }
                >
                    {loading ? (
                        <CircularProgress
                            size={20}
                            color="inherit"
                        />
                    ) : (
                        "Assign"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}