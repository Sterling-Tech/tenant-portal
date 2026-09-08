import { Box, Tabs, Tab, Paper } from "@mui/material";
import { useState } from "react";
import RingfenceDashboard from "../../components/Ringfencemgmt/RingfenceDashboard";
import SupplierDashboard from "../../components/Ringfencemgmt/SupplierDashboard";
import InvestorDashboard from "../../components/Ringfencemgmt/InvestorDashboard";


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
          py: 2,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Configure Schemes" />
          <Tab label="Configure Suppliers" />
          <Tab label="Configure Investors" />
          <Tab label="Configure DISCOs" />
        </Tabs>
      </Paper>

      {tab === 0 && <RingfenceDashboard />}

      {tab === 1 && <SupplierDashboard />}
      {tab === 2 && (<InvestorDashboard />)}
      {tab === 3 && (
        <Box sx={{ textAlign: "center", mt: 5 }}>
          <h3>DISCOs Configuration</h3>
          <p>DISCOs configuration is currently under development.</p>
        </Box>
      )}
    </Box>
  );
}
