import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import { getUserPermissions, UserPermission } from "../../services/roleService";

// import {
//   getUserPermissions,
//   UserPermission,
// } from "../../services/permissionService";

interface UserPermissionsProps {
  userId?: number;
}

const UserPermissions: React.FC<UserPermissionsProps> = ({ userId }) => {
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUserPermissions(userId);

      setPermissions(response || []);
    } catch (err) {
      console.error("Failed to fetch user permissions:", err);
      setError("Unable to load your assigned permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [userId]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <SecurityIcon color="primary" />

            <Typography variant="h6" fontWeight={700}>
              Assigned Permissions
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            mt={0.5}
          >
            Permissions currently assigned to your account.
          </Typography>
        </Box>

        <Chip
          label={`${permissions.length} Permission${
            permissions.length !== 1 ? "s" : ""
          }`}
          color="primary"
          variant="outlined"
        />
      </Stack>

      {/* Empty state */}
      {permissions.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Box textAlign="center" py={5}>
              <SecurityIcon
                sx={{
                  fontSize: 48,
                  color: "text.disabled",
                  mb: 1,
                }}
              />

              <Typography
                fontWeight={600}
                color="text.secondary"
              >
                No permissions assigned
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                mt={1}
              >
                You currently don't have any permissions assigned
                to your account.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {permissions.map(({ permission }) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={permission.id}
            >
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    {/* Permission name */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Typography
                        fontWeight={700}
                        fontSize={15}
                      >
                        {permission.name}
                      </Typography>

                      <Chip
                        label={`#${permission.id}`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        minHeight: 42,
                      }}
                    >
                      {permission.description || "No description available."}
                    </Typography>

                    {/* Permission code */}
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mb={0.5}
                      >
                        Permission Code
                      </Typography>

                      <Chip
                        label={permission.code}
                        size="small"
                        sx={{
                          fontFamily: "monospace",
                          bgcolor: "#F1F5F9",
                        }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default UserPermissions;