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
    Autocomplete,
    MenuItem,
    Checkbox,
    ListItemText,
    TextField,
    Paper,
    Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Vendor } from "../../services/vendorService";

// interface Vendor {
//     id: number;
//     name: string;
// }

interface Props {
    open: boolean;
    loading?: boolean;
    schemeId: number;
    vendors: Vendor[];
    vendorHasNext: boolean;
    vendorPage: number;
    loadMore: () => void;
    onClose: () => void;
    onSubmit: (values: {
        scheme: number;
        vendors: number[];
    }) => void;
}

export default function AssignVendorModal({
    open,
    loading = false,
    schemeId,
    vendors,
    vendorHasNext,
    vendorPage,
    loadMore,
    onClose,
    onSubmit,
}: Props) {
    const [selected, setSelected] = useState<Vendor[]>([]);


    useEffect(() => {
        if (open) {
            setSelected([]);
        }
    }, [open]);


    const VendorPaper = (props: any) => (
        <Paper {...props}>
            {props.children}

            {vendorHasNext && (
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
                Assign Vendors
            </DialogTitle>

            <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Vendors</InputLabel>

                    <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={vendors}
                        value={selected}
                        PaperComponent={VendorPaper}
                        getOptionLabel={(option) => option.business_name}
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

                                {option.business_name}
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
                        // onSubmit({
                        //     scheme: schemeId,
                        //     vendors: selected,
                        // })
                        onSubmit({
                            scheme: schemeId,
                            vendors: selected.map(v => Number(v.id)),
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
        </Dialog >
    );
}