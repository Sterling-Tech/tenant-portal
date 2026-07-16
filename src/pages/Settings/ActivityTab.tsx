import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Refresh,
  Search,
  Person,
  Public,
  Event,
} from "@mui/icons-material";

import { auditService } from "../../services/AuditService";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

const actionColor = (action: string) => {
  const value = action.toLowerCase();

  if (value.includes("delete")) return "error";
  if (value.includes("suspend")) return "error";
  if (value.includes("create")) return "success";
  if (value.includes("configure")) return "warning";
  if (value.includes("login")) return "info";

  return "primary";
};

export default function ActivityTab() {
  const today = new Date().toISOString().slice(0, 10);

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [startDate, setStartDate] = useState(today);

  const [endDate, setEndDate] = useState(today);

  const [error, setError] = useState("");

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);

      const res = await auditService.getLogs({
        start_date: startDate,
        end_date: endDate,
      });

      setLogs(res.results);
    } catch (err: any) {
      setError("error fetching logs: " + (err.message || err));
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filtered = useMemo(() => {
    if (!search.trim()) return logs;

    const q = search.toLowerCase();

    return logs.filter(
      (item) =>
        item.actor_email?.toLowerCase().includes(q) ||
        item.summary?.toLowerCase().includes(q) ||
        item.action?.toLowerCase().includes(q) ||
        item.ip_address?.toLowerCase().includes(q)
    );
  }, [logs, search]);

  return (
    <Box>

      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
        }}
      >
        <Grid container spacing={2}>

          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1 }} />,
              }}
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              size="small"
              fullWidth
              type="date"
              label="From"
              value={startDate}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              size="small"
              fullWidth
              type="date"
              label="To"
              value={endDate}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Refresh />}
              onClick={loadLogs}
            >
              Refresh
            </Button>
          </Grid>

        </Grid>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          py={10}
          display="flex"
          justifyContent="center"
        >
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <Typography color="text.secondary">
            No activity found.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>

          {filtered.map((log, index) => (
            <Card
              key={index}
              sx={{
                p: 2,
                borderRadius: 3,
                transition: ".2s",
                "&:hover": {
                  boxShadow: 4,
                },
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
              >
                <Stack spacing={1} flex={1}>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Chip
                      size="small"
                      label={log.action}
                      color={actionColor(log.action)}
                    />

                    <Typography
                      fontWeight={700}
                    >
                      {log.summary}
                    </Typography>
                  </Stack>

                  <Divider />

                  <Stack
                    direction="row"
                    spacing={4}
                    flexWrap="wrap"
                  >

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Avatar
                        sx={{
                          width: 30,
                          height: 30,
                        }}
                      >
                        <Person fontSize="small" />
                      </Avatar>

                      <Box>

                        <Typography
                          fontSize={13}
                          fontWeight={600}
                        >
                          {log.actor?.name || "System"}
                        </Typography>

                        <Typography
                          fontSize={12}
                          color="text.secondary"
                        >
                          {log.actor_email}
                        </Typography>

                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Public fontSize="small" />

                      <Typography fontSize={13}>
                        {log.ip_address}
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Event fontSize="small" />

                      <Typography fontSize={13}>
                        {formatDate(log.timestamp)}
                      </Typography>
                    </Stack>

                  </Stack>

                </Stack>
              </Stack>
            </Card>
          ))}

        </Stack>
      )}
    </Box>
  );
}