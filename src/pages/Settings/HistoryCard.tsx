import {
  Avatar,
  Box,
  Card,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import PublicIcon from "@mui/icons-material/Public";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StorageIcon from "@mui/icons-material/Storage";


// import {
//   actionColor,
//   formatDate,
// } from "./historyUtils";
import { ObjectHistory } from "./auditTypes";
import HistoryComparison from "./HistoryComparison";

interface Props {
  history: ObjectHistory;
}

export default function HistoryCard({
    history,
}: Props) {
    function actionColor(
        action: string
    ): import("@mui/types").OverridableStringUnion<
        "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning",
        import("@mui/material").ChipPropsColorOverrides
    > | undefined {
        switch (action.toLowerCase()) {
            case "create":
                return "success";
            case "update":
                return "info";
            case "delete":
                return "error";
            case "restore":
                return "warning";
            default:
                return "default";
        }
    }

    function formatDate(date: string): string {
        return new Date(date).toLocaleString();
    }

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 3,
        transition: ".2s",
        "&:hover": {
          boxShadow: 5,
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Stack spacing={1} flex={1}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <Chip
              label={history.action}
              color={actionColor(history.action)}
              size="small"
            />

            <Chip
              variant="outlined"
              size="small"
              icon={<StorageIcon />}
              label={history.model_name}
            />

            <Typography
              fontWeight={700}
              fontSize={15}
            >
              Object #{history.object_id}
            </Typography>
          </Stack>

          <Typography
            color="text.secondary"
            fontSize={13}
          >
            Request ID:{" "}
            {history.request_id || "-"}
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Metadata */}
      <Stack
        direction="row"
        spacing={4}
        flexWrap="wrap"
        mb={2}
      >
        {/* Actor */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
            }}
          >
            <PersonIcon fontSize="small" />
          </Avatar>

          <Box>
            <Typography
              fontWeight={600}
              fontSize={13}
            >
              {history.actor_email ??
                "System"}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Actor
            </Typography>
          </Box>
        </Stack>

        {/* IP */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <PublicIcon
            color="action"
            fontSize="small"
          />

          <Box>
            <Typography fontSize={13}>
              {history.ip_address ??
                "-"}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              IP Address
            </Typography>
          </Box>
        </Stack>

        {/* Time */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <AccessTimeIcon
            color="action"
            fontSize="small"
          />

          <Box>
            <Typography fontSize={13}>
              {formatDate(
                history.timestamp
              )}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Timestamp
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Before / After */}
      <HistoryComparison
        previous={history.previous}
        present={history.present}
        action={history.action}
      />
    </Card>
  );
}