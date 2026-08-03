import React, { useEffect, useState } from 'react'
import { Policy, retrievePolicy, updatePolicy } from './policy';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../../utils/getErrorMessage';

import {
    Paper,
    Stack,
    Typography,
    Switch,
    FormControlLabel,
    TextField,
    Button,
    Divider,
    Tooltip,
} from "@mui/material";
import { usePermission } from '../../../hooks/usePermission';


export default function RetrievePolicy() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [policy, setPolicy] = useState<Policy>({
        is_enabled: true,
        min_length: 8,
        require_upper: true,
        require_lower: true,
        require_number: true,
        require_symbol: false,
        block_common_passwords: true,
        check_hibp_online: false,
        history_depth: 5,
        max_failed_attempts: 5,
        lockout_minutes: 15,
        attempt_window_minutes: 15,
        password_expiry_days: 90,
        updated_at: "",
    });

    const loadPolicy = async () => {
        try {
            setLoading(true);

            const res = await retrievePolicy();

            setPolicy(res);
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPolicy();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);

            await updatePolicy(policy);

            toast.success("Password policy updated successfully");

            loadPolicy();
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const { can } = usePermission();
    
    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={3}>
                Password Policy
            </Typography>

            <Stack spacing={3}>

                <FormControlLabel
                    control={
                        <Switch
                            checked={policy.is_enabled}
                            onChange={(e) =>
                                setPolicy({
                                    ...policy,
                                    is_enabled: e.target.checked,
                                })
                            }
                        />
                    }
                    label="Enable Password Policy"
                />

                <Divider />

                <Typography variant="subtitle1">
                    Password Requirements
                </Typography>

                <TextField
                    label="Minimum Password Length"
                    type="number"
                    value={policy.min_length}
                    onChange={(e) =>
                        setPolicy({
                            ...policy,
                            min_length: Number(e.target.value),
                        })
                    }
                />

                <FormControlLabel
                    control={
                        <Switch
                            checked={policy.require_upper}
                            onChange={(e) =>
                                setPolicy({
                                    ...policy,
                                    require_upper: e.target.checked,
                                })
                            }
                        />
                    }
                    label="Require Uppercase Letter"
                />

                <FormControlLabel
                    control={
                        <Switch
                            checked={policy.require_lower}
                            onChange={(e) =>
                                setPolicy({
                                    ...policy,
                                    require_lower: e.target.checked,
                                })
                            }
                        />
                    }
                    label="Require Lowercase Letter"
                />

                <FormControlLabel
                    control={
                        <Switch
                            checked={policy.require_number}
                            onChange={(e) =>
                                setPolicy({
                                    ...policy,
                                    require_number: e.target.checked,
                                })
                            }
                        />
                    }
                    label="Require Number"
                />

                <FormControlLabel
                    control={
                        <Switch
                            checked={policy.require_symbol}
                            onChange={(e) =>
                                setPolicy({
                                    ...policy,
                                    require_symbol: e.target.checked,
                                })
                            }
                        />
                    }
                    label="Require Special Character"
                />

                <FormControlLabel
                    control={
                        <Switch
                            checked={policy.block_common_passwords}
                            onChange={(e) =>
                                setPolicy({
                                    ...policy,
                                    block_common_passwords: e.target.checked,
                                })
                            }
                        />
                    }
                    label="Block Common Passwords"
                />

                <FormControlLabel
                    control={
                        <Switch
                            checked={policy.check_hibp_online}
                            onChange={(e) =>
                                setPolicy({
                                    ...policy,
                                    check_hibp_online: e.target.checked,
                                })
                            }
                        />
                    }
                    label="Check Have I Been Pwned Database"
                />

                <Divider />

                <Typography variant="subtitle1">
                    Password History
                </Typography>

                <TextField
                    label="Password History Depth"
                    type="number"
                    value={policy.history_depth}
                    onChange={(e) =>
                        setPolicy({
                            ...policy,
                            history_depth: Number(e.target.value),
                        })
                    }
                />

                <Divider />

                <Typography variant="subtitle1">
                    Account Lockout
                </Typography>

                <TextField
                    label="Maximum Failed Attempts"
                    type="number"
                    value={policy.max_failed_attempts}
                    onChange={(e) =>
                        setPolicy({
                            ...policy,
                            max_failed_attempts: Number(e.target.value),
                        })
                    }
                />

                <TextField
                    label="Lockout Duration (Minutes)"
                    type="number"
                    value={policy.lockout_minutes}
                    onChange={(e) =>
                        setPolicy({
                            ...policy,
                            lockout_minutes: Number(e.target.value),
                        })
                    }
                />

                <TextField
                    label="Attempt Window (Minutes)"
                    type="number"
                    value={policy.attempt_window_minutes}
                    onChange={(e) =>
                        setPolicy({
                            ...policy,
                            attempt_window_minutes: Number(e.target.value),
                        })
                    }
                />

                <Divider />

                <Typography variant="subtitle1">
                    Password Expiration
                </Typography>

                <TextField
                    label="Password Expiry (Days)"
                    type="number"
                    value={policy.password_expiry_days}
                    onChange={(e) =>
                        setPolicy({
                            ...policy,
                            password_expiry_days: Number(e.target.value),
                        })
                    }
                />

                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                    Last Updated:{" "}
                    {policy.updated_at
                        ? new Date(policy.updated_at).toLocaleString()
                        : "-"}
                </Typography>

                <Stack direction="row" justifyContent="flex-end">
                    <Tooltip
                        title={
                            can("retrieve_admin")
                                ? ""
                                : "You don't have permission to perform this action."
                        }
                    >
                        <span>
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={saving || !can("retrieve_admin")}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </span>
                    </Tooltip>
                </Stack>

            </Stack>
        </Paper>
    )
}
