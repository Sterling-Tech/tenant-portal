import React, { useState } from 'react'
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    MenuItem,
    Chip,
    Stack,
    Paper,
    IconButton,
    InputAdornment,
} from "@mui/material";
import { Business, CopyAll, Domain, Key, Public, Refresh, Save } from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import { configureVendor } from '../../services/settingService';
import { toast } from 'react-toastify';
import { useParams } from "react-router-dom";

interface ConfigureVendorProps {
    vendorId: string;
}
export default function ConfigureVendor({
}: ConfigureVendorProps) {
    const { user } = useAppSelector((state) => state.auth);

    const vendorId = user?.id?.toString() || "";

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [configurationForm, setConfigurationForm] = useState({
        funding_cap: "",
        transaction_max: "",
        commission_rate: "",
        monthly_target: "",
    });
    const validateConfigurationForm = () => {
        const newErrors: Record<string, string> = {};

        if (!configurationForm.funding_cap?.trim()) {
            newErrors.funding_cap = "Funding Cap field is required";
        }

        if (!configurationForm.transaction_max?.trim()) {
            newErrors.transaction_max = "Max transaction field is required";
        }

        if (!configurationForm.commission_rate?.trim()) {
            newErrors.commission_rate = "Commission rate field is required";
        }

        if (!configurationForm.monthly_target?.trim()) {
            newErrors.monthly_target = "Monthly target field is required";
        }


        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };
    const handleSaveConfiguration = async () => {
        if (!validateConfigurationForm()) return;
        if (!vendorId) {
            toast.error('Missing vendor id');
            return;
        }
        try {
            setLoading(true);
            await configureVendor(
                {
                    funding_cap: configurationForm.funding_cap,
                    transaction_max: configurationForm.transaction_max,
                    commission_rate: Number(
                        configurationForm.commission_rate
                    ),
                    monthly_target: configurationForm.monthly_target,
                },
                vendorId
            );
            console.log(configurationForm);
            toast.success("Configure vendor updated successfully")
        } catch (err) {
            console.error(err);
            setLoading(false);
        } finally {
            setLoading(false)
        }
    };

    return (
        <div>
            <CardContent sx={{ p: 4 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={4}
                    flexWrap="wrap"
                    gap={2}
                >
                    <Box>
                        <Typography
                            variant="h5"
                            fontWeight={800}
                        >
                            Vendor Configuration
                        </Typography>

                        <Typography
                            color="#64748B"
                            mt={1}
                        >
                            Setup vendor business vital information
                        </Typography>
                    </Box>

                    {/* <Chip
                        label="Super Admin Only"
                        color="error"
                        sx={{
                            fontWeight: 700,
                        }}
                    /> */}
                </Stack>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border:
                                    "1px solid #E2E8F0",
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                mb={3}
                                alignItems="center"
                            >
                                <Business />

                                <Typography
                                    fontWeight={700}
                                    fontSize={18}
                                >
                                    Vendor Configuration
                                </Typography>
                            </Stack>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Funding Capital"
                                        value={
                                            configurationForm.funding_cap
                                        }
                                        onChange={(e) => {
                                            setConfigurationForm(
                                                {
                                                    ...configurationForm,
                                                    funding_cap:
                                                        e.target
                                                            .value,
                                                }
                                            )
                                            setErrors((prev) => ({
                                                ...prev,
                                                funding_cap: "",
                                            }));
                                        }}
                                        error={!!errors.funding_cap}
                                        helperText={errors.funding_cap}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Transaction Max"
                                        value={
                                            configurationForm.transaction_max
                                        }
                                        onChange={(e) => {
                                            setConfigurationForm(
                                                {
                                                    ...configurationForm,
                                                    transaction_max:
                                                        e.target
                                                            .value,
                                                }
                                            )
                                            setErrors((prev) => ({
                                                ...prev,
                                                transaction_max: "",
                                            }));
                                        }}
                                        error={!!errors.transaction_max}
                                        helperText={errors.transaction_max}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Monthly Target"
                                        value={
                                            configurationForm.monthly_target
                                        }
                                        onChange={(e) => {
                                            setConfigurationForm(
                                                {
                                                    ...configurationForm,
                                                    monthly_target:
                                                        e.target
                                                            .value,
                                                }
                                            )
                                            setErrors((prev) => ({
                                                ...prev,
                                                monthly_target: "",
                                            }));
                                        }}
                                        error={!!errors.monthly_target}
                                        helperText={errors.monthly_target}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Commission Rate (%)"
                                        value={
                                            configurationForm.commission_rate
                                        }
                                        onChange={(e) => {
                                            setConfigurationForm(
                                                {
                                                    ...configurationForm,
                                                    commission_rate:
                                                        e.target
                                                            .value,
                                                }
                                            )
                                            setErrors((prev) => ({
                                                ...prev,
                                                commission_rate: "",
                                            }));
                                        }}
                                        error={!!errors.commission_rate}
                                        helperText={errors.commission_rate}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>

                <Box mt={4}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<Save />}
                        onClick={
                            handleSaveConfiguration
                        }
                        disabled={loading}
                        sx={{
                            borderRadius: 3,
                            textTransform: "none",
                            px: 5,
                            height: 52,
                            fontWeight: 700,
                        }}
                    >
                        Save Configuration
                    </Button>
                </Box>
            </CardContent>
        </div>
    )
}
