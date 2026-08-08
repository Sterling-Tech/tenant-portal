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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
} from "@mui/material";
import { Save } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { genderOptions } from './CreateNewAdmin';
import { toast } from 'react-toastify';
import { confirmTotp, disableTotp, setupTotp, TotpSetupResponse, updateUser } from '../../services/settingService';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { extractAuthPayload, setAuth } from '../../store/slices/authSlice';
export default function UserUpdate() {
    const { user } = useAppSelector((state) => state.auth);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});


    const [accountForm, setAccountForm] = useState({
        first_name: "",
        last_name: "",
        gender: "",
        name: "",
        phone_number: "",
        two_factor_enabled: false,
    });

    // Authenticator app
    const [totpDialogOpen, setTotpDialogOpen] = useState(false);
    const [totpLoading, setTotpLoading] = useState(false);
    const [confirmingTotp, setConfirmingTotp] = useState(false);

    const [totpData, setTotpData] = useState<TotpSetupResponse | null>(null);

    const [otp, setOtp] = useState("");
    const [totpError, setTotpError] = useState("");

    const [disableDialogOpen, setDisableDialogOpen] = useState(false);
    const [disablingTotp, setDisablingTotp] = useState(false);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!user) return;

        const names = (user.name || "").trim().split(" ");

        setAccountForm({
            first_name: names[0] || "",
            last_name: names.slice(1).join(" "),
            name: user.name || "",
            gender: user.gender || "",
            phone_number: user.phone_number || "",
            two_factor_enabled: user.is_2fa_enabled,
        });
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
            const update = await updateUser({
                name: `${accountForm.first_name} ${accountForm.last_name}`,
                gender: accountForm.gender,
                phone_number: accountForm.phone_number,
                is_2fa_enabled: accountForm.two_factor_enabled,
            })
            toast.success("User profile updated successfully")

            const { user, token } =
                extractAuthPayload(update);

            dispatch(
                setAuth({
                    token,
                    user,
                })
            );
            setErrors({});

        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    // const handleSetupTotp = async (enabled: boolean) => {
    //     if (!enabled) return;

    //     try {
    //         setTotpLoading(true);

    //         const response = await setupTotp();

    //         setTotpData(response);
    //         setOtp("");
    //         setTotpDialogOpen(true);
    //     } catch (err) {
    //         toast.error(getErrorMessage(err));
    //     } finally {
    //         setTotpLoading(false);
    //     }
    // };

    const handleSetupTotp = async () => {
        try {
            setTotpLoading(true);
            setTotpError("");

            const response = await setupTotp();

            setTotpData(response);
            setOtp("");
            setTotpDialogOpen(true);

        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setTotpLoading(false);
        }
    };
    // const handleConfirmTotp = async () => {
    //     if (otp.length !== 6) {
    //         setTotpError("Enter the 6 digit code.");
    //         return;
    //     }

    //     try {
    //         setConfirmingTotp(true);

    //         const totp = await confirmTotp({
    //             otp,
    //         });

    //         toast.success("Authenticator enabled successfully.");

    //         setTotpDialogOpen(false);

    //         setAccountForm({
    //             ...accountForm,
    //             two_factor_enabled: true,
    //         });
    //         const { user, token, refreshToken } =
    //             extractAuthPayload(totp);

    //         dispatch(
    //             setAuth({
    //                 token,
    //                 refreshToken,
    //                 user,
    //             })
    //         );
    //         setOtp("");
    //     } catch (err) {
    //         toast.error(getErrorMessage(err));
    //     } finally {
    //         setConfirmingTotp(false);
    //     }
    // };

    const handleConfirmTotp = async () => {
        if (otp.length !== 6) {
            setTotpError("Enter the 6 digit code.");
            return;
        }

        try {
            setConfirmingTotp(true);
            setTotpError("");

            const response = await confirmTotp({
                otp,
            });

            if (!response.ok) {
                setTotpError(
                    response.data ||
                    response.data?.detail ||
                    response.data?.non_field_errors?.[0] ||
                    "Invalid authenticator code."
                );
                return;
            }

            const { user, token, refreshToken } =
                extractAuthPayload(response.data);

            dispatch(
                setAuth({
                    token,
                    refreshToken,
                    user,
                })
            );

            setAccountForm(prev => ({
                ...prev,
                two_factor_enabled: true,
            }));

            toast.success("Authenticator enabled successfully.");

            setTotpDialogOpen(false);
            setOtp("");

        } catch (err) {
            setTotpError(getErrorMessage(err));
        } finally {
            setConfirmingTotp(false);
        }
    };
    const handleDisableTotp = async () => {
        try {
            setDisablingTotp(true);

            const updatedUser = await disableTotp();

            toast.success("Authenticator disabled successfully.");

            setAccountForm((prev) => ({
                ...prev,
                two_factor_enabled: updatedUser.is_2fa_enabled,
            }));

            setDisableDialogOpen(false);

            const { user, token } =
                extractAuthPayload(updatedUser.data);

            dispatch(
                setAuth({
                    token,
                    user,
                })
            );
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setDisablingTotp(false);
        }
    };
    const authenticatorEnabled =
        user?.two_fa_method === "authenticator" &&
        user?.totp_confirmed;

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
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Two-Factor Authentication must be enabled before you can use an
                            Authenticator App.
                        </Alert>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={accountForm.two_factor_enabled}
                                    // onChange={async (e) => {
                                    //     const checked = e.target.checked;

                                    //     setAccountForm(prev => ({
                                    //         ...prev,
                                    //         two_factor_enabled: checked,
                                    //     }));

                                    //     try {
                                    //         const updated = await updateUser({
                                    //             name: `${accountForm.first_name} ${accountForm.last_name}`,
                                    //             gender: accountForm.gender,
                                    //             phone_number: accountForm.phone_number,
                                    //             is_2fa_enabled: checked,
                                    //         });

                                    //         const { user, token } =
                                    //             extractAuthPayload(updated);

                                    //         dispatch(
                                    //             setAuth({
                                    //                 token,
                                    //                 user,
                                    //             })
                                    //         );
                                    //     } catch (err) {
                                    //         toast.error(getErrorMessage(err));
                                    //     }
                                    // }}
                                    onChange={async (e) => {
                                        const checked = e.target.checked;

                                        try {
                                            setLoading(true);

                                            const updated = await updateUser({
                                                name: `${accountForm.first_name} ${accountForm.last_name}`,
                                                gender: accountForm.gender,
                                                phone_number: accountForm.phone_number,
                                                is_2fa_enabled: checked,
                                            });

                                            const { user, token, refreshToken } =
                                                extractAuthPayload(updated);

                                            dispatch(
                                                setAuth({
                                                    token,
                                                    refreshToken,
                                                    user,
                                                })
                                            );

                                            setAccountForm(prev => ({
                                                ...prev,
                                                two_factor_enabled: checked,
                                            }));

                                            toast.success(
                                                checked
                                                    ? "Two-factor authentication enabled."
                                                    : "Two-factor authentication disabled."
                                            );

                                        } catch (err) {
                                            toast.error(getErrorMessage(err));
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                />
                            }
                            label="Enable Two-Factor Authentication"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={authenticatorEnabled}
                                    disabled={!accountForm.two_factor_enabled}
                                    // onChange={(e) => {
                                    //     if (e.target.checked) {
                                    //         handleSetupTotp(true);
                                    //     } else {
                                    //         setDisableDialogOpen(true);
                                    //     }
                                    // }}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            handleSetupTotp();
                                        } else {
                                            setDisableDialogOpen(true);
                                        }
                                    }}
                                />
                            }
                            label="Use Authenticator App instead of Email OTP"
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
                <Dialog
                    open={totpDialogOpen}
                    onClose={() => setTotpDialogOpen(false)}
                    maxWidth="xs"
                    fullWidth
                >
                    <DialogTitle>
                        Setup Authenticator App
                    </DialogTitle>

                    <DialogContent>

                        {totpLoading ? (
                            <Box textAlign="center" py={4}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Typography mb={2}>
                                    Scan this QR Code using
                                    Google Authenticator or
                                    Microsoft Authenticator.
                                </Typography>

                                {totpData?.qr_code && (
                                    <Box textAlign="center" mb={2}>
                                        <img
                                            src={totpData.qr_code}
                                            alt="QR Code"
                                            width={220}
                                        />
                                    </Box>
                                )}

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mb={2}
                                >
                                    Secret:
                                </Typography>

                                <Typography
                                    fontWeight={700}
                                    mb={3}
                                >
                                    {totpData?.secret}
                                </Typography>

                                {/* <TextField
                                    fullWidth
                                    label="6 Digit Code"
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value);
                                        setTotpError("");
                                    }}
                                    error={!!totpError}
                                    helperText={totpError}
                                /> */}
                                <TextField
                                    fullWidth
                                    label="6 Digit Code"
                                    value={otp}
                                    onChange={(e) => {
                                        const value = e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 6);

                                        setOtp(value);
                                        setTotpError("");
                                    }}
                                    inputProps={{
                                        inputMode: "numeric",
                                        maxLength: 6,
                                    }}
                                    error={!!totpError}
                                    helperText={totpError}
                                />
                            </>
                        )}

                    </DialogContent>

                    <DialogActions>

                        <Button
                            onClick={() => setTotpDialogOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleConfirmTotp}
                            disabled={confirmingTotp}
                        >
                            {confirmingTotp
                                ? "Verifying..."
                                : "Verify"}
                        </Button>

                    </DialogActions>
                </Dialog>
                <Dialog
                    open={disableDialogOpen}
                    onClose={() => setDisableDialogOpen(false)}
                >
                    <DialogTitle className='bg-blue-800 text-white'>
                        Disable Authenticator
                    </DialogTitle>

                    <DialogContent>
                        <Typography>
                            Are you sure you want to remove your authenticator app?
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mt={2}
                        >
                            Login verification will revert back to Email OTP.
                        </Typography>
                    </DialogContent>

                    <DialogActions>
                        <Button
                            onClick={() => setDisableDialogOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            color="error"
                            variant="contained"
                            onClick={handleDisableTotp}
                            disabled={disablingTotp}
                        >
                            {disablingTotp
                                ? "Disabling..."
                                : "Disable"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </div>
    )
}

