import { Box, Tabs, Tab, Paper } from "@mui/material";
import { useState } from "react";
import RingfenceDashboard from "../../components/Ringfencemgmt/RingfenceDashboard";
import SupplierDashboard from "../../components/Ringfencemgmt/SupplierDashboard";


export default function ReferenceManagement() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          border: "1px solid #E5E7EB",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Schemes" />
          <Tab label="Suppliers" />
        </Tabs>
      </Paper>

      {tab === 0 && <RingfenceDashboard />}

      {tab === 1 && <SupplierDashboard />}
    </Box>
  );
}
