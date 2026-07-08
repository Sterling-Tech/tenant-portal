import React, { useEffect, useState } from 'react'
import {
    Box,
    Typography,
    CardContent,
    Grid,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    FormControlLabel,
    Switch,
} from "@mui/material";
import { Save } from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import { genderOptions } from './CreateNewAdmin';
import { toast } from 'react-toastify';
import { updateUser } from '../../services/settingService';
export default function UserUpdate() {
    const { user } = useAppSelector((state) => state.auth);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});


    const [accountForm, setAccountForm] = useState({
        first_name: "",
        last_name: "",
        gender: "",
        name:"",
        phone_number: "",
        two_factor_enabled: false,
    });

    useEffect(() => {
        if (user) {
            setAccountForm({
                name: `${accountForm.first_name} ${accountForm.last_name}`,
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                gender: user.gender || "",
                phone_number: user.phone_number || "",
                two_factor_enabled: user.is_2fa_enabled,
            });
        }
    }, [user]);

    const validateAccountForm = () => {
        const newErrors: Record<string, string> = {};

        if (!accountForm.first_name?.trim()) {
            newErrors.first_name = "First name field is required";
        }

        if (!accountForm.last_name?.trim()) {
            newErrors.last_name = "Last name field is required";
        }

        if (!accountForm.phone_number?.trim()) {
            newErrors.phone_number = "Phone Number field is required";
        }

        if (!accountForm.gender?.trim()) {
            newErrors.gender = "Gender field is required";
        }


        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };
    // ================= ACCOUNT SAVE =================
    const handleSaveAccount = async () => {
        if (!validateAccountForm()) return;

        try {
            setLoading(true);
            await updateUser({
                name: `${accountForm.first_name} ${accountForm.last_name}`,
                gender:accountForm.gender,
                phone_number:accountForm.phone_number,
                is_2fa_enabled:accountForm.two_factor_enabled,
            })
            toast.success("User profile updated successfully")
            // setAccountForm({
            //     first_name: "",
            //     last_name: "",
            //     gender: "",
            //     phone_number: "",
            //     two_factor_enabled: false,
            // })
            setErrors({});
        } catch (error) {
            console.error(error);
            toast.error("Failed to update user");
        }


    };

    return (
        <div>
            <CardContent sx={{ p: 4 }}>
                <Typography
                    variant="h6"
                    fontWeight={700}
                    mb={4}
                >
                    Profile Information
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="First Name"
                            value={accountForm.first_name}
                            onChange={(e) => {
                                setAccountForm({
                                    ...accountForm,
                                    first_name:
                                        e.target.value,
                                })
                                setErrors((prev) => ({
                                    ...prev,
                                    first_name: "",
                                }));
                            }}
                            error={!!errors.first_name}
                            helperText={errors.first_name}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Last Name"
                            value={accountForm.last_name}
                            onChange={(e) => {
                                setAccountForm({
                                    ...accountForm,
                                    last_name:
                                        e.target.value,
                                })
                                setErrors((prev) => ({
                                    ...prev,
                                    last_name: "",
                                }));
                            }}
                            error={!!errors.last_name}
                            helperText={errors.last_name}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl
                            fullWidth
                            error={!!errors.gender}
                        >
                            <Select
                                displayEmpty
                                value={accountForm.gender || ""}

                                onChange={(e) => {
                                    setAccountForm({
                                        ...accountForm,
                                        gender: e.target.value,
                                    })
                                    setErrors((prev) => ({
                                        ...prev,
                                        gender: "",
                                    }));
                                }}

                            >
                                <MenuItem value="">Select Gender</MenuItem>
                                {genderOptions.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.gender && (
                                <Typography
                                    fontSize={12}
                                    color="error"
                                    mt={0.5}
                                >
                                    {errors.gender}
                                </Typography>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Phone Number"
                            value={accountForm.phone_number}
                            onChange={(e) => {
                                setAccountForm({
                                    ...accountForm,
                                    phone_number: e.target.value,
                                })
                                setErrors((prev) => ({
                                    ...prev,
                                    phone_number: "",
                                }));
                            }}
                            error={!!errors.phone_number}
                            helperText={errors.phone_number}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={
                                        accountForm.two_factor_enabled
                                    }
                                    onChange={(e) =>
                                        setAccountForm({
                                            ...accountForm,
                                            two_factor_enabled:
                                                e.target.checked,
                                        })
                                    }
                                />
                            }
                            label="Enable Two-Factor Authentication"
                        />
                    </Grid>
                </Grid>

                <Box mt={4}>
                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSaveAccount}
                        disabled={loading}
                        sx={{
                            borderRadius: 3,
                            textTransform: "none",
                            px: 4,
                            height: 46,
                        }}
                    >
                        Update User
                    </Button>
                </Box>
            </CardContent>
        </div>
    )
}
