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
} from '@mui/material';

import {
    Visibility,
    VisibilityOff,
    Login as LoginIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/store';
import { extractAuthPayload, setAuth } from '../../store/slices/authSlice';
import type { User } from '../../store/slices/authSlice';
import { toast } from 'react-toastify'

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
            const response = await fetch(
                "http://188.166.161.13:8061/user/login/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const contentType = response.headers.get("content-type");

            if (!contentType?.includes("application/json")) {
                const text = await response.text();

                console.error("Non-JSON response:", {
                    status: response.status,
                    body: text,
                });

                toast.error(
                    "Server returned an invalid response format."
                );

                return;
            }

            const data = await response.json();

            // 2FA enabled → OTP sent
            if (response.status === 202) {
                setLoginCredentials({
                    email: formData.email,
                    password: formData.password,
                });
                setPendingEmail(formData.email);
                setOtpOpen(true);

                toast.info(
                    "Verification code sent to your email"
                );
                return;
            }

            // Login failed
            if (!response.ok) {
                toast.error(
                    data.message ||
                    data.detail ||
                    "Login failed. Please try again."
                );
                return;
            }

            // Login successful (200)
            const { user, token, refreshToken } =
                extractAuthPayload(data);

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

            console.log(
                "Login successful, redirecting to /tenants/admin"
            );

            navigate("/tenants/admin");
        } catch (err: any) {
            console.error("Login error:", err);

            setError(
                err.message ||
                "Login failed. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmOtp = async () => {
        try {
            setOtpLoading(true);

            const response = await fetch(
                "http://188.166.161.13:8061/user/login/confirm-otp/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: pendingEmail,
                        otp: otpValue,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                toast.error(
                    data.message ||
                    data.detail ||
                    "Invalid OTP"
                );
                return;
            }

            const { user, token, refreshToken } =
                extractAuthPayload(data);

            dispatch(
                setAuth({
                    token,
                    refreshToken,
                    user,
                })
            );

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

            const response = await fetch(
                "http://188.166.161.13:8061/user/login/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(
                        loginCredentials
                    ),
                }
            );

            const data = await response.json();

            if (response.status !== 202) {
                toast.error(
                    data.message ||
                    data.detail ||
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
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
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
                <DialogTitle
                    sx={{
                        textAlign: "center",
                        fontWeight: 700,
                        pb: 1,
                    }}
                >
                    Verify Login
                </DialogTitle>

                <DialogContent>
                    <Typography
                        variant="body2"
                        textAlign="center"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        We've sent a 6-digit verification code to
                    </Typography>

                    {otpMessage && (
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
                    )}

                    <Typography
                        textAlign="center"
                        fontWeight={600}
                        sx={{ mb: 4 }}
                    >
                        {pendingEmail}
                    </Typography>

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
                </DialogContent>

                <Box
                    sx={{
                        mt: 3,
                        textAlign: "center",
                    }}
                >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Didn't receive OTP
                    </Typography>

                    <Button
                        size="small"
                        variant="text"
                        disabled={
                            !canResend ||
                            resendingOtp
                        }
                        onClick={handleResendOtp}
                    >
                        {resendingOtp
                            ? "Sending..."
                            : canResend
                                ? "Resend OTP"
                                : `Resend in ${formatTime(
                                    timeLeft
                                )}`}
                    </Button>

                    {otpMessage && (
                        <Typography
                            variant="caption"
                            display="block"
                            sx={{ mt: 1 }}
                        >
                            {otpMessage}
                        </Typography>
                    )}
                </Box>

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
        </Box>
    );
};

export default Login;
