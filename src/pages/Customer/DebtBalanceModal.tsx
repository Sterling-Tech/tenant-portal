import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

interface DebtBalanceProps {
  open: boolean;
  onClose: () => void;
  debts: any[];
  customerAnalytic: any;
//   can: (permission: string) => boolean;
  fmt: (value: number) => string;
//   handleEditDebt: (debt: any) => void;
//   handleSuspendActivateDebt: (debt: any) => void;
}

export default function DebtBalanceModal({
  open,
  onClose,
  debts,
  customerAnalytic,
//   can,
  fmt,
//   handleEditDebt,
//   handleSuspendActivateDebt,
}: DebtBalanceProps) {
  const progress = customerAnalytic
    ? (customerAnalytic.recovered_debt /
        (customerAnalytic.recovered_debt +
          customerAnalytic.remaining_debt || 1)) *
      100
    : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className="bg-blue-800 text-white">Customer Debt Balance</DialogTitle>

      <DialogContent dividers>
        {debts.length === 0 ? (
          <Typography>No active debt found.</Typography>
        ) : (
          debts.map((d) => (
            <Card
              key={d.id}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 3,
                border: "1px solid #fecaca",
                bgcolor: "#fff1f2",
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography
                    fontSize={11}
                    fontWeight={700}
                    color="#b91c1c"
                  >
                    ACTIVE DEBT
                  </Typography>

                  <Chip
                    label="Running"
                    size="small"
                    color="error"
                  />
                </Stack>

                <Typography
                  fontSize={30}
                  fontWeight={900}
                  color="#dc2626"
                >
                  {fmt(Number(d.balance))}
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 7,
                    borderRadius: 10,
                    backgroundColor: "#fee2e2",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#10b981",
                    },
                  }}
                />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography
                    fontSize={12}
                    color="#10b981"
                  >
                    {progress.toFixed(1)}% repaid
                  </Typography>

                  <Typography
                    fontSize={12}
                    color="#10b981"
                  >
                    {fmt(customerAnalytic?.recovered_debt || 0)}
                    {" "}recovered
                  </Typography>

                  <Typography
                    fontSize={12}
                    color="#64748b"
                  >
                    {fmt(customerAnalytic?.remaining_debt || 0)}
                    {" "}remaining
                  </Typography>
                </Stack>

                <Divider />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography fontSize={12}>
                    Plan
                  </Typography>

                  <Typography
                    fontWeight={600}
                    fontSize={12}
                  >
                    {d.payment_plan?.name}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography fontSize={12}>
                    Rate
                  </Typography>

                  <Typography
                    fontWeight={600}
                    fontSize={12}
                  >
                    {d.rate}% per cycle
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography fontSize={12}>
                    Last Deduction
                  </Typography>

                  <Typography
                    fontWeight={600}
                    fontSize={12}
                    color="#dc2626"
                  >
                    {d.last_debit
                      ? new Date(
                          d.last_debit
                        ).toLocaleDateString()
                      : "—"}
                  </Typography>
                </Stack>

                <Divider />

                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  spacing={2}
                >
                  {/* <Tooltip
                    title={
                      can("retrieve_admin")
                        ? ""
                        : "You don't have permission."
                    }
                  >
                    <span>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={!can("retrieve_admin")}
                        onClick={() =>
                          handleEditDebt(d)
                        }
                      >
                        Edit
                      </Button>

                      <Button
                        sx={{ ml: 2 }}
                        variant="contained"
                        size="small"
                        color={
                          d.is_suspended
                            ? "success"
                            : "warning"
                        }
                        disabled={!can("retrieve_admin")}
                        onClick={() =>
                          handleSuspendActivateDebt(d)
                        }
                      >
                        {d.is_suspended
                          ? "Activate"
                          : "Suspend"}
                      </Button>
                    </span>
                  </Tooltip> */}
                </Stack>
              </Stack>
            </Card>
          ))
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}