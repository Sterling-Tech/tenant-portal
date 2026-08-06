import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Link,
    Paper,
    Stack,
} from '@mui/material';

import {
    Visibility,
    VisibilityOff,
    Login as LoginIcon,
} from '@mui/icons-material';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/store';
import { extractAuthPayload, setAuth } from '../../store/slices/authSlice';
import { toast } from 'react-toastify'
import { loginUser, confirmOtp, resetExpiredPassword } from "../../services/authService";
import { getUserPermissions, viewGroup } from '../../services/roleService';
import { setPermissions } from '../../store/slices/permissionSlice';
import { getErrorMessage } from '../../utils/getErrorMessage';
import ExpiredPasswordModal from './ExpiredPasswordModal';
import { Policy, retrievePolicy } from '../Settings/passwordpolicy/policy';




interface LoginFormData {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const hasCheckedAuth = useRef(false);
    //otp
    const [otpOpen, setOtpOpen] = useState(false);
    //const [otp, setOtp] = useState("");
    const [pendingEmail, setPendingEmail] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    //resend otp
    const [resendingOtp, setResendingOtp] = useState(false);
    const [otpMessage, setOtpMessage] = useState("");
    const [loginCredentials, setLoginCredentials] = useState({
        email: "",
        password: "",
    });

    const [expiredPasswordOpen, setExpiredPasswordOpen] = useState(false);
    const [expiredLoading, setExpiredLoading] = useState(false);
    const [expiredEmail, setExpiredEmail] = useState("");

    const [expiredPasswordForm, setExpiredPasswordForm] = useState({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });
    // password policy
    const [passwordPolicy, setPasswordPolicy] = useState<Policy | null>(null);
    const [showPolicy, setShowPolicy] = useState(false);
    //totp
    const [twoFaMethod, setTwoFaMethod] = useState<"email" | "authenticator">("email");

    const OTP_DURATION = 5 * 60; // 5 mins
    const [timeLeft, setTimeLeft] = useState(OTP_DURATION);

    const otpValue = otp.join("");

    const canResend = timeLeft === 0;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Redirect if already authenticated (only once on mount)
    useEffect(() => {
        if (hasCheckedAuth.current) return;

        const token = localStorage.getItem('token');
        console.log('Login component mounted - has token:', !!token);

        if (token) {
            console.log('Already has token, redirecting to /tenants/admin');
            navigate('/tenants/admin');
        }

        hasCheckedAuth.current = true;
    }, [navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError(null);
    };

    const handleOtpChange = (
        value: string,
        index: number
    ) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;

        setOtp(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(
                `otp-${index + 1}`
            );

            nextInput?.focus();
        }
    };

    const handleOtpKeyDown = (
        e: React.KeyboardEvent<HTMLElement>,
        index: number
    ) => {
        if (
            e.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            const prevInput = document.getElementById(
                `otp-${index - 1}`
            );

            prevInput?.focus();
        }
    };

    const handleOtpPaste = (
        e: React.ClipboardEvent
    ) => {
        e.preventDefault();

        const pastedData = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (pastedData.length === 6) {
            setOtp(pastedData.split(""));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError(null);
        setIsLoading(true);

        try {
            const response = await loginUser(formData);

            // Login requires second factor
            if (response.status === 202) {
                setPendingEmail(formData.email);

                setTwoFaMethod(response.data.method); // "email" | "authenticator"

                setOtpOpen(true);
                if (response.data.method === "email") {
                    toast.info("A verification code has been sent to your email.");
                } else {
                    toast.info("Enter the code from your Authenticator app.");
                }

                return;
            }
            
            if (!response.ok) {
                const error = response.data;
                const message =
                    error?.detail ??
                    error?.message ??
                    "";

                const isExpired =
                    response.status === 403 &&
                    (
                        error === 'password_expired' ||
                        error?.code === "password_expired" ||
                        message.toLowerCase().includes("password expired")
                    );

                if (isExpired) {
                    setPendingEmail(response.data.email ?? formData.email);
                    setExpiredPasswordOpen(true);
                    return;
                }

                toast.error(getErrorMessage(error));
                return;
            }
            // Login successful (200)
            const { user, token, refreshToken } =
                extractAuthPayload(response.data);

            if (!token) {
                toast.error(
                    "Login response did not include an access token."
                );
                return;
            }

            dispatch(
                setAuth({
                    token,
                    refreshToken,
                    user,
                })
            );

            if (user) {
                const [group, userPermissions] =
                    await Promise.all([
                        user.group
                            ? viewGroup(user.group.id)
                            : Promise.resolve(null),

                        getUserPermissions(user.id),
                    ]);

                const groupCodes =
                    group?.permissions?.map(
                        p => p.permission.code
                    ) ?? [];

                const userCodes =
                    userPermissions.map(
                        p => p.permission.code
                    );

                const combinedPermissions = [
                    ...groupCodes,
                    ...userCodes,
                ];

                const permissions = combinedPermissions.filter(
                    (p, i) => combinedPermissions.indexOf(p) === i
                );

                dispatch(setPermissions(permissions));

                localStorage.setItem(
                    "permissions",
                    JSON.stringify(permissions)
                );
            }
            console.log(
                "Login successful, redirecting to /tenants/admin"
            );

            navigate("/tenants/admin");
        }

        catch (err: any) {
            console.error(err);

            toast.error(getErrorMessage(err));

        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmOtp = async () => {
        try {
            setOtpLoading(true);
            const response = await confirmOtp({
                email: pendingEmail,
                otp: otpValue,
            });
            if (!response.ok) {
                toast.error(
                    response.data ||
                    response.data.message ||
                    response.data.detail ||
                    "Invalid OTP"
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
            if (user) {
                const [group, userPermissions] =
                    await Promise.all([
                        user.group
                            ? viewGroup(user.group.id)
                            : Promise.resolve(null),

                        getUserPermissions(user.id),
                    ]);

                const groupCodes =
                    group?.permissions?.map(
                        p => p.permission.code
                    ) ?? [];

                const userCodes =
                    userPermissions.map(
                        p => p.permission.code
                    );

                const combinedPermissions = [
                    ...groupCodes,
                    ...userCodes,
                ];

                const permissions = combinedPermissions.filter(
                    (p, i) => combinedPermissions.indexOf(p) === i
                );

                dispatch(setPermissions(permissions));

                localStorage.setItem(
                    "permissions",
                    JSON.stringify(permissions)
                );
            }

            toast.success("Login successful");

            setOtpOpen(false);
            navigate("/tenants/admin");
        } catch (error: any) {
            toast.error(
                error.message ||
                "Failed to verify OTP"
            );
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        try {
            setResendingOtp(true);
            setOtpMessage("");
            const response = await loginUser(formData)

            if (response.status !== 202) {
                toast.error(
                    response.data ||
                    response.data.message ||
                    response.data.detail ||
                    "Unable to resend OTP"
                );
                return;
            }

            // clear old otp
            setOtp(["", "", "", "", "", ""]);

            // restart timer
            setTimeLeft(OTP_DURATION);

            toast.success(
                "A new OTP has been sent to your email."
            );

            // focus first box
            document
                .getElementById("otp-0")
                ?.focus();
        } catch (error) {
            toast.error(
                "Failed to resend OTP."
            );
        } finally {
            setResendingOtp(false);
        }
    };

    const handleResetExpiredPassword = async () => {
        if (!expiredPasswordForm.old_password) {
            toast.error("Current password is required");
            return;
        }

        if (!expiredPasswordForm.new_password) {
            toast.error("New password is required");
            return;
        }

        if (!expiredPasswordForm.confirm_password) {
            toast.error("Please confirm your new password");
            return;
        }

        if (
            expiredPasswordForm.new_password !==
            expiredPasswordForm.confirm_password
        ) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setExpiredLoading(true);

            const response = await resetExpiredPassword({
                email: pendingEmail,
                old_password: expiredPasswordForm.old_password,
                new_password: expiredPasswordForm.new_password,
                confirm_password:
                    expiredPasswordForm.confirm_password,
            });

            if (!response.ok) {
                toast.error(getErrorMessage(response.data));
                return;
            }

            toast.success(
                "Password changed successfully. Please login with your new password."
            );

            setExpiredPasswordOpen(false);

            setExpiredPasswordForm({
                old_password: "",
                new_password: "",
                confirm_password: "",
            });

            setFormData({
                email: pendingEmail,
                password: "",
            });
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setExpiredLoading(false);
        }
    };

    useEffect(() => {
        if (!otpOpen) return;

        setTimeLeft(OTP_DURATION);

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [otpOpen]);


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    // password policy

    // useEffect(() => {
    //     const loadPolicy = async () => {
    //         try {
    //             const policy = await retrievePolicy();
    //             setPasswordPolicy(policy);
    //         } catch (err) {
    //             console.error(err);
    //         }
    //     };

    //     loadPolicy();
    // }, []);
    // console.log("passwordPolicy", passwordPolicy);

    const passwordChecks = {
        minLength: formData.password.length >= 8,
        upperCase: /[A-Z]/.test(formData.password),
        lowerCase: /[a-z]/.test(formData.password),
        number: /\d/.test(formData.password),
        symbol: /[!@#$%^&*(),.?":{}|<>_\-+=\\[\]/`~;]/.test(formData.password),
    };

    const Requirement = ({
        passed,
        text,
    }: {
        passed: boolean;
        text: string;
    }) => (
        <Stack direction="row" spacing={1} alignItems="center">
            {passed ? (
                <CheckCircleIcon color="success" fontSize="small" />
            ) : (
                <CancelIcon color="error" fontSize="small" />
            )}

            <Typography
                variant="body2"
                color={passed ? "success.main" : "error.main"}
            >
                {text}
            </Typography>
        </Stack>
    );

    const passwordValid =
        passwordChecks.minLength &&
        passwordChecks.upperCase &&
        passwordChecks.lowerCase &&
        passwordChecks.number &&
        passwordChecks.symbol;

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: 2,
            }}
        >
            <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h4" component="h1" gutterBottom>
                            QuickCash Tenant Portal
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sign in to access your tenant dashboard
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}


                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            onFocus={() => setShowPolicy(true)}
                            onBlur={() => setShowPolicy(false)}
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                            autoComplete="current-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={togglePasswordVisibility}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {/* password policy */}
                        {/* {showPolicy && passwordPolicy?.is_enabled && (
                            <Paper
                                variant="outlined"
                                sx={{
                                    mt: 2,
                                    p: 2,
                                    bgcolor: "#f8fafc",
                                    borderRadius: 2,
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    gutterBottom
                                >
                                    Password Requirements
                                </Typography>

                                <Stack spacing={0.5}>
                                    <Typography variant="body2">
                                        • Minimum {passwordPolicy.min_length} characters
                                    </Typography>

                                    {passwordPolicy.require_upper && (
                                        <Typography variant="body2">
                                            • At least one uppercase letter
                                        </Typography>
                                    )}

                                    {passwordPolicy.require_lower && (
                                        <Typography variant="body2">
                                            • At least one lowercase letter
                                        </Typography>
                                    )}

                                    {passwordPolicy.require_number && (
                                        <Typography variant="body2">
                                            • At least one number
                                        </Typography>
                                    )}

                                    {passwordPolicy.require_symbol && (
                                        <Typography variant="body2">
                                            • At least one special character
                                        </Typography>
                                    )}

                                    {passwordPolicy.password_expiry_days > 0 && (
                                        <Typography
                                            variant="body2"
                                            color="warning.main"
                                        >
                                            • Password expires every{" "}
                                            {passwordPolicy.password_expiry_days} days
                                        </Typography>
                                    )}
                                </Stack>
                            </Paper>
                        )} */}
                        {/* {showPolicy && (
                            <Paper
                                variant="outlined"
                                sx={{
                                    mt: 2,
                                    p: 2,
                                    bgcolor: "#f8fafc",
                                    borderRadius: 2,
                                    borderColor: "primary.light",
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    gutterBottom
                                >
                                    Password Requirements
                                </Typography>

                                <Stack spacing={1}>
                                    <Requirement
                                        passed={passwordChecks.minLength}
                                        text="Minimum 8 characters"
                                    />

                                    <Requirement
                                        passed={passwordChecks.upperCase}
                                        text="At least one uppercase letter"
                                    />

                                    <Requirement
                                        passed={passwordChecks.lowerCase}
                                        text="At least one lowercase letter"
                                    />

                                    <Requirement
                                        passed={passwordChecks.number}
                                        text="At least one number"
                                    />

                                    <Requirement
                                        passed={passwordChecks.symbol}
                                        text="At least one special character"
                                    />
                                </Stack>
                            </Paper>
                        )} */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            // disabled={isLoading || !passwordValid}
                            disabled={isLoading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Vendor credentials: vendor1@quickcash.com / password
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
            {/* otp */}
            <Dialog
                open={otpOpen}
                maxWidth="xs"
                fullWidth

            >
                <DialogTitle sx={{ textAlign: "center", fontWeight: 700 }}>
                    {twoFaMethod === "email"
                        ? "Verify Email OTP"
                        : "Verify Authenticator Code"}
                </DialogTitle>

                <DialogContent>
                    {twoFaMethod === "email" ? (
                        <>
                            <Typography
                                variant="body2"
                                textAlign="center"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                We've sent a 6-digit verification code to
                            </Typography>

                            <Typography
                                textAlign="center"
                                fontWeight={600}
                                sx={{ mb: 3 }}
                            >
                                {pendingEmail}
                            </Typography>
                            {/* {otpMessage && (
                                <Alert
                                    severity={
                                        otpMessage.includes("sent")
                                            ? "success"
                                            : "error"
                                    }
                                    sx={{ mt: 2 }}
                                >
                                    {otpMessage}
                                </Alert>
                            )} */}
                        </>
                    ) : (
                        <>
                            <Typography
                                variant="body2"
                                textAlign="center"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                Open your Authenticator app and enter the current 6-digit code.
                            </Typography>

                            <Alert severity="info" sx={{ mb: 3 }}>
                                Use Google Authenticator, Microsoft Authenticator, or any TOTP app linked to your account. The code refreshes automatically every 30 seconds.
                            </Alert>
                        </>
                    )}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 1,
                        }}
                    >
                        {otp.map((digit, index) => (
                            <TextField
                                key={index}
                                id={`otp-${index}`}
                                value={digit}
                                onPaste={handleOtpPaste}
                                onChange={(e) =>
                                    handleOtpChange(
                                        e.target.value,
                                        index
                                    )
                                }
                                onKeyDown={(e) =>
                                    handleOtpKeyDown(
                                        e,
                                        index
                                    )
                                }
                                inputProps={{
                                    maxLength: 1,
                                    inputMode: "numeric",
                                    style: {
                                        textAlign: "center",
                                        fontSize: "1.4rem",
                                        fontWeight: 700,
                                    },
                                }}
                                sx={{
                                    width: 52,
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 2,
                                        height: 56,
                                    },
                                }}
                            />
                        ))}
                    </Box>
                    {twoFaMethod === "email" ? (
                        <>
                            <Typography
                                variant="caption"
                                display="block"
                                textAlign="center"
                                color="text.secondary"
                                sx={{ mt: 3 }}
                            >
                                Enter the 6-digit code sent to your email
                            </Typography>
                            <Typography
                                textAlign="center"
                                sx={{
                                    mt: 3,
                                    fontWeight: 600,
                                    color: timeLeft < 60
                                        ? "error.main"
                                        : "text.secondary",
                                }}
                            >
                                OTP expires in {formatTime(timeLeft)}
                            </Typography>
                        </>
                    ) : (
                        <Typography
                            variant="caption"
                            display="block"
                            textAlign="center"
                            color="text.secondary"
                            sx={{ mt: 3 }}
                        >
                            Enter the 6-digit from your Authenticator app
                        </Typography>
                    )}

                </DialogContent>
                {twoFaMethod === "email" ? (
                    <Box sx={{ mt: 3, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            Didn't receive the code?
                        </Typography>

                        <Button
                            size="small"
                            variant="text"
                            disabled={!canResend || resendingOtp}
                            onClick={handleResendOtp}
                        >
                            {resendingOtp
                                ? "Sending..."
                                : canResend
                                    ? "Resend OTP"
                                    : `Resend in ${formatTime(timeLeft)}`}
                        </Button>
                    </Box>
                ) : (
                    <Alert severity="info" sx={{ mt: 3 }}>
                        Open your Authenticator app to retrieve the latest verification code.
                    </Alert>
                )}

                <DialogActions
                    sx={{
                        justifyContent: "center",
                        pb: 3,
                        px: 3,
                    }}
                >
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={
                            otpLoading ||
                            otpValue.length !== 6
                        }
                        onClick={handleConfirmOtp}
                    >
                        {otpLoading ? (
                            <CircularProgress
                                size={22}
                                color="inherit"
                            />
                        ) : (
                            "Verify OTP"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            <ExpiredPasswordModal
                open={expiredPasswordOpen}
                email={expiredEmail}
                loading={expiredLoading}
                onSubmit={handleResetExpiredPassword}
            />
        </Box>
    );
};

export default Login;
