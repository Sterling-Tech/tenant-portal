import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  getOnboardingPolicy,
  updateOnboardingPolicy,
  OnboardingPolicy,
} from "../../services/onbordingService";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function OnboardingPolicySettings() {
  const [policy, setPolicy] = useState<OnboardingPolicy | null>(null);

  const [testKeyValidityDays, setTestKeyValidityDays] =
    useState("");

  const [testStartingBalance, setTestStartingBalance] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        setLoading(true);

        const data = await getOnboardingPolicy();

        setPolicy(data);
        setTestKeyValidityDays(
          String(data.test_key_validity_days)
        );
        setTestStartingBalance(
          data.test_starting_balance
        );
      } catch (error) {
        console.error("Failed to load onboarding policy:", error);
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadPolicy();
  }, []);

  const handleSave = async () => {
    const days = Number(testKeyValidityDays);

    if (!days || days <= 0) {
      toast.error(
        "Test-key validity must be greater than 0 days."
      );
      return;
    }

    if (!testStartingBalance) {
      toast.error("Please enter the test starting balance.");
      return;
    }

    try {
      setSaving(true);

      const updated = await updateOnboardingPolicy({
        test_key_validity_days: days,
        test_starting_balance: testStartingBalance,
      });

      setPolicy(updated);

      setTestKeyValidityDays(
        String(updated.test_key_validity_days)
      );

      setTestStartingBalance(
        updated.test_starting_balance
      );

      toast.success("Onboarding policy updated successfully.");
    } catch (error) {
      console.error("Failed to update onboarding policy:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Stack
            alignItems="center"
            justifyContent="center"
            py={5}
          >
            <CircularProgress />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <div>
            <Typography variant="h6" fontWeight={700}>
              Onboarding Policy
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Configure the temporary test environment
              provided to newly onboarded vendors.
            </Typography>
          </div>

          <Alert severity="info">
            These settings determine how long a vendor's
            temporary test key remains valid and the balance
            available during testing.
          </Alert>

          <TextField
            label="Test Key Validity"
            type="number"
            value={testKeyValidityDays}
            onChange={(e) =>
              setTestKeyValidityDays(e.target.value)
            }
            fullWidth
            InputProps={{
              endAdornment: (
                <Typography color="text.secondary">
                  days
                </Typography>
              ),
            }}
          />

          <TextField
            label="Test Starting Balance"
            value={testStartingBalance}
            onChange={(e) =>
              setTestStartingBalance(e.target.value)
            }
            fullWidth
            helperText="Balance assigned to vendors in the temporary test environment."
          />

          {policy?.updated_at && (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Last updated:{" "}
              {new Date(policy.updated_at).toLocaleString()}
            </Typography>
          )}

          <Stack
            direction="row"
            justifyContent="flex-end"
          >
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <CircularProgress
                  size={20}
                  color="inherit"
                />
              ) : (
                "Save Changes"
              )}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}