import {
  Box,
  Card,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import {
  Bolt,
  Payments,
  AccountBalanceWallet,
  AccessTime,
} from "@mui/icons-material";

const fmt = (amount: number) =>
  `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

interface Props {
  unitsVended: number;
  totalVends: number;

  totalPaid: number;
  paymentCount: number;

  outstandingDebt: number;
  debtName: string;
  deductionRate: string;

  lastActivityDate: string;
  lastActivityText: string;
}

export default function CustomerSummary({
  unitsVended,
  totalVends,
  totalPaid,
  paymentCount,
  outstandingDebt,
  debtName,
  deductionRate,
  lastActivityDate,
  lastActivityText,
}: Props) {
  const items = [
    {
      icon: <Bolt color="primary" />,
      title: "Units vended (all time)",
      value: `${unitsVended.toLocaleString()} kWh`,
      sub: `${totalVends} vends`,
      color: "#2563eb",
    },
    {
      icon: <Payments color="success" />,
      title: "Total paid (all time)",
      value: fmt(totalPaid),
      sub: `${paymentCount} vends`,
      color: "#16a34a",
    },
    {
      icon: <AccountBalanceWallet sx={{ color: "#ea580c" }} />,
      title: "Outstanding debt",
      value: fmt(outstandingDebt),
      sub: `${debtName} · ${deductionRate}`,
      color: "#dc2626",
    },
    {
      icon: <AccessTime sx={{ color: "#7c3aed" }} />,
      title: "Last activity",
      value: lastActivityDate,
      sub: lastActivityText,
      color: "#111827",
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        mt: 3,
        // borderRadius: 4,
        // border: "1px solid #e5e7eb",
      }}
    >
      <Grid container>
        {items.map((item, index) => (
          <Grid item xs={12} md={3} key={index}>
            <Stack
              spacing={2}
              alignItems="center"
              justifyContent="center"
              sx={{
                py: 4,
                px: 3,
                position: "relative",
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  bgcolor: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </Box>

              <Typography
                fontSize={13}
                color="text.secondary"
              >
                {item.title}
              </Typography>

              <Typography
                fontWeight={800}
                fontSize={36}
                color={item.color}
              >
                {item.value}
              </Typography>

              <Typography
                fontSize={14}
                color="text.secondary"
              >
                {item.sub}
              </Typography>

              {index !== items.length - 1 && (
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: 40,
                    bottom: 40,
                  }}
                />
              )}
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}