import {
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import { AuditHistoryQuery } from "./auditTypes";



interface Props {
  filters: AuditHistoryQuery;
  setFilters: React.Dispatch<
    React.SetStateAction<AuditHistoryQuery>
  >;
  onSearch: () => void;
}

export default function HistoryFilters({
  filters,
  setFilters,
  onSearch,
}: Props) {
  const handleChange = (
    field: keyof AuditHistoryQuery,
    value: any
  ) => {
    setFilters((prev:any) => ({
      ...prev,
      [field]:
        value === "" ? undefined : value,
    }));
  };

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
      }}
    >
      <Grid container spacing={2}>
        {/* Model */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Model Name"
            placeholder="Vendor"
            value={filters.model_name ?? ""}
            onChange={(e) =>
              handleChange(
                "model_name",
                e.target.value
              )
            }
          />
        </Grid>

        {/* Action */}
        <Grid item xs={12} md={2}>
          <TextField
            select
            fullWidth
            size="small"
            label="Action"
            value={filters.action ?? ""}
            onChange={(e) =>
              handleChange(
                "action",
                e.target.value
              )
            }
          >
            <MenuItem value="">
              All
            </MenuItem>

            <MenuItem value="CREATE">
              CREATE
            </MenuItem>

            <MenuItem value="UPDATE">
              UPDATE
            </MenuItem>

            <MenuItem value="DELETE">
              DELETE
            </MenuItem>
          </TextField>
        </Grid>

        {/* Actor */}
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Actor ID"
            value={
              filters.actor_id ?? ""
            }
            onChange={(e) =>
              handleChange(
                "actor_id",
                e.target.value
                  ? Number(
                      e.target.value
                    )
                  : undefined
              )
            }
          />
        </Grid>

        {/* Object */}
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Object ID"
            value={
              filters.object_id ?? ""
            }
            onChange={(e) =>
              handleChange(
                "object_id",
                e.target.value
              )
            }
          />
        </Grid>

        {/* Request ID */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Request ID"
            value={
              filters.request_id ?? ""
            }
            onChange={(e) =>
              handleChange(
                "request_id",
                e.target.value
              )
            }
          />
        </Grid>

        {/* Start Date */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Start Date"
            value={
              filters.start_date ?? ""
            }
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(e) =>
              handleChange(
                "start_date",
                e.target.value
              )
            }
          />
        </Grid>

        {/* End Date */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="End Date"
            value={
              filters.end_date ?? ""
            }
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(e) =>
              handleChange(
                "end_date",
                e.target.value
              )
            }
          />
        </Grid>

        {/* Buttons */}
        <Grid item xs={12} md={6}>
          <Stack
            direction="row"
            spacing={2}
            height="100%"
            alignItems="center"
            justifyContent="flex-end"
          >
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() =>
                setFilters({
                  start_date: undefined,
                  end_date: undefined,
                  action: undefined,
                  model_name:
                    undefined,
                  actor_id:
                    undefined,
                  object_id:
                    undefined,
                  request_id:
                    undefined,
                })
              }
            >
              Reset
            </Button>

            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={onSearch}
            >
              Search
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}