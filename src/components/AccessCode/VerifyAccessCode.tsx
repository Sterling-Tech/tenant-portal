import {
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Grid,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import {
    CheckCircle,
    Person,
    Phone,
    Home,
    Badge,
    AccessTime,
    Login,
} from "@mui/icons-material";

import { toast } from "react-toastify";


import { getErrorMessage } from "../../utils/getErrorMessage";
import { AccessCodeResponse, admitVisitor, verifyAccessCode } from "../../services/AccessCodeService";



export default function VerifyAccessCode() {

    const [
        code,
        setCode,
    ] = useState("");

    const [
        visitor,
        setVisitor,
    ] = useState<AccessCodeResponse | null>(
        null
    );

    const [
        verifying,
        setVerifying,
    ] = useState(false);

    const [
        admitting,
        setAdmitting,
    ] = useState(false);


    // =========================
    // VERIFY ACCESS CODE
    // =========================

    const handleVerify = async () => {

        const cleanCode =
            code.trim();

        if (!cleanCode) {

            toast.error(
                "Please enter the access code."
            );

            return;
        }

        try {

            setVerifying(true);

            const response =
                await verifyAccessCode({
                    code: cleanCode,
                });

            setVisitor(response);

            toast.success(
                "Access code verified successfully."
            );

        } catch (error) {

            console.error(
                "Failed to verify access code:",
                error
            );

            setVisitor(null);

            toast.error(
                getErrorMessage(error)
            );

        } finally {

            setVerifying(false);

        }
    };


    // =========================
    // ADMIT VISITOR
    // =========================

    const handleAdmit = async () => {

        if (!visitor) {
            return;
        }

        try {

            setAdmitting(true);

            const response =
                await admitVisitor({
                    code: visitor.code,
                });

            setVisitor(response);

            toast.success(
                `${response.visitor_name} has been admitted successfully.`
            );

            /*
             * Clear the input after successful admission.
             */
            setCode("");

        } catch (error: any) {

            console.error(
                "Failed to admit visitor:",
                error
            );

            const status =
                error?.response?.status;

            if (status === 409) {

                toast.error(
                    "This access code has already been used."
                );

            } else {

                toast.error(
                    getErrorMessage(error)
                );

            }

        } finally {

            setAdmitting(false);

        }
    };


    // =========================
    // RESET
    // =========================

    const handleReset = () => {

        setCode("");

        setVisitor(null);

    };


    return (

        <Box>

            {/* ========================= */}
            {/* HEADER */}
            {/* ========================= */}

            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: "flex-start",
                    sm: "center",
                }}
                spacing={2}
                mb={3}
            >

                <Box>

                    <Typography
                        variant="h5"
                        fontWeight={700}
                    >
                        Access Gate
                    </Typography>

                    <Typography
                        fontSize={13}
                        color="text.secondary"
                    >
                        Verify visitor access codes
                        and admit visitors at the gate.
                    </Typography>

                </Box>

            </Stack>


            {/* ========================= */}
            {/* CODE VERIFICATION */}
            {/* ========================= */}

            <Card
                sx={{
                    borderRadius: 3,
                    mb: 3,
                }}
            >

                <CardContent>

                    <Typography
                        variant="h6"
                        fontWeight={700}
                        mb={1}
                    >
                        Verify Access Code
                    </Typography>

                    <Typography
                        fontSize={13}
                        color="text.secondary"
                        mb={3}
                    >
                        Enter the visitor's access code
                        to verify their invitation.
                    </Typography>


                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={2}
                    >

                        <TextField
                            fullWidth
                            label="Access Code"
                            placeholder="Enter access code"
                            value={code}
                            onChange={(event) => {

                                setCode(
                                    event.target.value
                                );

                            }}
                            onKeyDown={(event) => {

                                if (
                                    event.key === "Enter"
                                ) {
                                    handleVerify();
                                }

                            }}
                            inputProps={{
                                maxLength: 20,
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Badge />
                                    </InputAdornment>
                                ),
                            }}
                        />


                        <Button
                            variant="contained"
                            onClick={handleVerify}
                            disabled={
                                verifying ||
                                !code.trim()
                            }
                            sx={{
                                minWidth: 150,
                            }}
                        >

                            {verifying ? (

                                <CircularProgress
                                    size={22}
                                    color="inherit"
                                />

                            ) : (

                                "Verify Code"

                            )}

                        </Button>

                    </Stack>

                </CardContent>

            </Card>


            {/* ========================= */}
            {/* VISITOR DETAILS */}
            {/* ========================= */}

            {visitor && (

                <Card
                    sx={{
                        borderRadius: 3,
                    }}
                >

                    <CardContent>

                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            justifyContent="space-between"
                            alignItems={{
                                xs: "flex-start",
                                sm: "center",
                            }}
                            spacing={2}
                            mb={3}
                        >

                            <Box>

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                >

                                    <CheckCircle
                                        color="success"
                                    />

                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                    >
                                        Visitor Verified
                                    </Typography>

                                </Stack>

                                <Typography
                                    fontSize={13}
                                    color="text.secondary"
                                    mt={0.5}
                                >
                                    Confirm the visitor's
                                    details before admission.
                                </Typography>

                            </Box>

                        </Stack>


                        <Alert
                            severity={
                                visitor.used_at
                                    ? "warning"
                                    : "success"
                            }
                            sx={{
                                mb: 3,
                            }}
                        >

                            {visitor.used_at
                                ? "This access code has already been used."
                                : "This access code is valid and ready for admission."
                            }

                        </Alert>


                        <Grid
                            container
                            spacing={2}
                        >

                            {/* Visitor Name */}

                            <Grid
                                item
                                xs={12}
                                md={6}
                            >

                                <InfoItem
                                    icon={<Person />}
                                    label="Visitor"
                                    value={
                                        visitor.visitor_name
                                    }
                                />

                            </Grid>


                            {/* Visitor Phone */}

                            <Grid
                                item
                                xs={12}
                                md={6}
                            >

                                <InfoItem
                                    icon={<Phone />}
                                    label="Phone"
                                    value={
                                        visitor.visitor_phone
                                    }
                                />

                            </Grid>


                            {/* Access Code */}

                            <Grid
                                item
                                xs={12}
                                md={6}
                            >

                                <InfoItem
                                    icon={<Badge />}
                                    label="Access Code"
                                    value={
                                        visitor.code
                                    }
                                />

                            </Grid>


                            {/* Expires */}

                            <Grid
                                item
                                xs={12}
                                md={6}
                            >

                                <InfoItem
                                    icon={<AccessTime />}
                                    label="Expires"
                                    value={
                                        formatDate(
                                            visitor.expires_at
                                        )
                                    }
                                />

                            </Grid>

                        </Grid>


                        <Divider
                            sx={{
                                my: 3,
                            }}
                        />


                        {/* ========================= */}
                        {/* HOST */}
                        {/* ========================= */}

                        <Typography
                            fontWeight={700}
                            mb={2}
                        >
                            Host Information
                        </Typography>


                        <Grid
                            container
                            spacing={2}
                        >

                            <Grid
                                item
                                xs={12}
                                md={4}
                            >

                                <InfoItem
                                    icon={<Person />}
                                    label="Host"
                                    value={
                                        visitor.host.name
                                    }
                                />

                            </Grid>


                            <Grid
                                item
                                xs={12}
                                md={4}
                            >

                                <InfoItem
                                    icon={<Phone />}
                                    label="Host Phone"
                                    value={
                                        visitor.host.phone_number
                                    }
                                />

                            </Grid>


                            <Grid
                                item
                                xs={12}
                                md={4}
                            >

                                <InfoItem
                                    icon={<Home />}
                                    label="Address"
                                    value={
                                        visitor.host.address
                                    }
                                />

                            </Grid>

                        </Grid>


                        <Divider
                            sx={{
                                my: 3,
                            }}
                        />


                        {/* ========================= */}
                        {/* ACTIONS */}
                        {/* ========================= */}

                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            justifyContent="flex-end"
                            spacing={2}
                        >

                            <Button
                                variant="outlined"
                                onClick={handleReset}
                                disabled={admitting}
                            >
                                Cancel
                            </Button>


                            <Button
                                variant="contained"
                                color="success"
                                startIcon={
                                    admitting
                                        ? (
                                            <CircularProgress
                                                size={18}
                                                color="inherit"
                                            />
                                        )
                                        : (
                                            <Login />
                                        )
                                }
                                onClick={handleAdmit}
                                disabled={
                                    admitting ||
                                    Boolean(
                                        visitor.used_at
                                    )
                                }
                            >

                                {admitting
                                    ? "Admitting..."
                                    : "Admit Visitor"
                                }

                            </Button>

                        </Stack>

                    </CardContent>

                </Card>

            )}

        </Box>
    );
}


// =========================
// INFO ITEM
// =========================

interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

function InfoItem({
    icon,
    label,
    value,
}: InfoItemProps) {

    return (

        <Box
            sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
            }}
        >

            <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
            >

                <Box
                    sx={{
                        color: "primary.main",
                        display: "flex",
                    }}
                >
                    {icon}
                </Box>

                <Box>

                    <Typography
                        fontSize={11}
                        color="text.secondary"
                    >
                        {label}
                    </Typography>

                    <Typography
                        fontWeight={600}
                    >
                        {value || "—"}
                    </Typography>

                </Box>

            </Stack>

        </Box>
    );
}


// =========================
// DATE FORMATTER
// =========================

function formatDate(
    value: string
) {

    if (!value) {
        return "—";
    }

    return new Date(
        value
    ).toLocaleString();
}
