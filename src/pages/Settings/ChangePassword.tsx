import React, { useState } from 'react'
import {
  Box,
  Typography,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
} from "@mui/material";
import { Save } from '@mui/icons-material';
import { changePassword, ChangePasswordProp } from '../../services/settingService';
export default function ChangePassword() {
  const [securityForm, setSecurityForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [alert, setAlert] = React.useState<{ open: boolean; type: string; message: string }>({
    open: false,
    type: "success",
    message: ""
  });

  const validateAdminForm = () => {
    const newErrors: Record<string, string> = {};

    if (!securityForm.old_password.trim()) {
      newErrors.old_password = "Current password is required";
    }

    if (!securityForm.new_password.trim()) {
      newErrors.new_password = "New password is required";
    }

    if (!securityForm.confirm_password.trim()) {
      newErrors.confirm_password =
        "Please confirm your new password";
    }

    if (
      securityForm.new_password &&
      securityForm.confirm_password &&
      securityForm.new_password !== securityForm.confirm_password
    ) {
      newErrors.confirm_password =
        "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSecurity = async () => {
    if (!validateAdminForm()) return;

    try {
      setLoading(true);

      await changePassword({
        old_password: securityForm.old_password,
        new_password: securityForm.new_password,
        confirm_password: securityForm.confirm_password,
      });

      setAlert({
        open: true,
        type: "success",
        message: "Password changed successfully",
      });

      setSecurityForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });

      setErrors({});
    } catch (error: any) {
      setAlert({
        open: true,
        type: "error",
        message:
          error?.response?.data?.message ||
          "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <CardContent sx={{ p: 4 }}>
        {alert.open && (
          <Alert
            severity={
              alert.type as "success" | "error"
            }
            sx={{ mb: 2 }}
            onClose={() =>
              setAlert({
                ...alert,
                open: false,
              })
            }
          >
            {alert.message}
          </Alert>
        )}
        <Typography
          variant="h6"
          fontWeight={700}
          mb={4}
        >
          Security Settings
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={securityForm.old_password}
              onChange={(e) => {
                setSecurityForm({
                  ...securityForm,
                  old_password: e.target.value,
                });

                setErrors((prev) => ({
                  ...prev,
                  old_password: "",
                }));
              }}
              error={!!errors.old_password}
              helperText={errors.old_password}
            />
          </Grid>


          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={
                securityForm.new_password
              }
              onChange={(e) => {
                setSecurityForm({
                  ...securityForm,
                  new_password:
                    e.target.value,
                });
                setErrors((prev) => ({
                  ...prev,
                  new_password: "",
                }));
              }}
              error={!!errors.new_password}
              helperText={errors.new_password}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              value={
                securityForm.confirm_password
              }
              onChange={(e) => {
                setSecurityForm({
                  ...securityForm,
                  confirm_password:
                    e.target.value,
                });
                setErrors((prev) => ({
                  ...prev,
                  confirm_password: "",
                }));
              }}
              error={!!errors.confirm_password}
              helperText={errors.confirm_password}
            />
          </Grid>

        </Grid>

        <Box mt={4}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveSecurity}

            disabled={
              loading ||
              !securityForm.old_password ||
              !securityForm.new_password ||
              !securityForm.confirm_password ||
              securityForm.new_password !==
              securityForm.confirm_password
            }
            sx={{
              borderRadius: 3,
              textTransform: "none",
              px: 4,
              height: 46,
            }}
          >
            Change Password
          </Button>
        </Box>
      </CardContent>
    </div>
  )
}
