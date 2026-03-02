import React, { useState, useEffect } from 'react';
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
    Divider,
    Alert,
    Snackbar,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import {
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    AccountCircle as AccountIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../store/store';

const API_BASE_URL = 'http://188.166.161.13:8001/api/v1';

const Settings: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    // Account settings
    const [accountForm, setAccountForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
    });

    // Security settings
    const [securityForm, setSecurityForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
        two_factor_enabled: false,
    });

    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState({
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
    });

    useEffect(() => {
        if (user) {
            setAccountForm({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleSaveAccount = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/users/${user?.id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(accountForm),
            });

            if (response.ok) {
                setSuccess('Account settings updated successfully!');
            }
        } catch (err) {
            console.error('Error updating account:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSecurity = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/auth/change-password/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    current_password: securityForm.current_password,
                    new_password: securityForm.new_password,
                }),
            });

            if (response.ok) {
                setSuccess('Password changed successfully!');
                setSecurityForm({
                    current_password: '',
                    new_password: '',
                    confirm_password: '',
                    two_factor_enabled: securityForm.two_factor_enabled,
                });
            }
        } catch (err) {
            console.error('Error changing password:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={3}>
            <Typography variant="h4" component="h1" gutterBottom>
                Settings
            </Typography>

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>

            <Card sx={{ mt: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                        <Tab icon={<AccountIcon />} label="Account" iconPosition="start" />
                        <Tab icon={<SecurityIcon />} label="Security" iconPosition="start" />
                        <Tab icon={<NotificationsIcon />} label="Notifications" iconPosition="start" />
                    </Tabs>
                </Box>

                {/* Account Tab */}
                {activeTab === 0 && (
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                            Profile Information
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    value={accountForm.first_name}
                                    onChange={(e) => setAccountForm({ ...accountForm, first_name: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    value={accountForm.last_name}
                                    onChange={(e) => setAccountForm({ ...accountForm, last_name: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={accountForm.email}
                                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    value={accountForm.phone}
                                    onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 3 }}>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSaveAccount}
                                disabled={loading}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </CardContent>
                )}

                {/* Security Tab */}
                {activeTab === 1 && (
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                            Security Settings
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Current Password"
                                    type="password"
                                    value={securityForm.current_password}
                                    onChange={(e) => setSecurityForm({ ...securityForm, current_password: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="New Password"
                                    type="password"
                                    value={securityForm.new_password}
                                    onChange={(e) => setSecurityForm({ ...securityForm, new_password: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Confirm New Password"
                                    type="password"
                                    value={securityForm.confirm_password}
                                    onChange={(e) => setSecurityForm({ ...securityForm, confirm_password: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={securityForm.two_factor_enabled}
                                            onChange={(e) => setSecurityForm({ ...securityForm, two_factor_enabled: e.target.checked })}
                                        />
                                    }
                                    label="Enable Two-Factor Authentication"
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 3 }}>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSaveSecurity}
                                disabled={loading || securityForm.new_password !== securityForm.confirm_password}
                            >
                                Change Password
                            </Button>
                        </Box>
                    </CardContent>
                )}

                {/* Notifications Tab */}
                {activeTab === 2 && (
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                            Notification Preferences
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Email Notifications"
                                    secondary="Receive updates and alerts via email"
                                />
                                <Switch
                                    checked={notificationSettings.email_notifications}
                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, email_notifications: e.target.checked })}
                                />
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary="SMS Notifications"
                                    secondary="Receive important alerts via SMS"
                                />
                                <Switch
                                    checked={notificationSettings.sms_notifications}
                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, sms_notifications: e.target.checked })}
                                />
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary="Push Notifications"
                                    secondary="Receive browser notifications"
                                />
                                <Switch
                                    checked={notificationSettings.push_notifications}
                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, push_notifications: e.target.checked })}
                                />
                            </ListItem>
                        </List>
                    </CardContent>
                )}
            </Card>
        </Box>
    );
};

export default Settings;

