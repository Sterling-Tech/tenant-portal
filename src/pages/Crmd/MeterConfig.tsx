import { Box, Tabs, Tab, Paper } from "@mui/material";
import { useState } from "react";
import CategoryPage from "../../components/Crmd/tariff/CategoryPage";
import TariffPage from "../../components/Crmd/tariff/TariffPage";
import MeterMakePage from "../../components/Crmd/meter/MeterMakePage";
import MeterPage from "../../components/Crmd/meter/MeterPage";
import MeterLinePage from "../../components/Crmd/meter/MeterLinePage";

export default function MeterConfig() {
   const [tab, setTab] = useState(0);

  return (
    <Box>
      <Paper

        elevation={0}
        sx={{
          mb: 3,

          borderRadius: 2,

          border:
            "1px solid #E5E7EB",

          py: 1,

          overflow: "hidden",
        }}

      >

        <Tabs

          value={tab}

          onChange={(_, value) =>
            setTab(value)
          }


          variant="scrollable"

          scrollButtons="auto"

          allowScrollButtonsMobile


          textColor="primary"

          indicatorColor="primary"


          sx={{

            "& .MuiTab-root": {

              textTransform:
                "none",

              fontWeight: 500,

              minWidth: "auto",

              whiteSpace:
                "nowrap",

            },

          }}

        >

          <Tab
            label="Configure Meter Make"
          />

          <Tab
            label="Configure Meter"
          />
          <Tab
            label="Configure Meter Line"
          />
        </Tabs>

      </Paper>

      {tab === 0 && (
        <MeterMakePage/>
      )}

      {tab === 1 && (
        <MeterPage />
      )}

      {tab === 2 && (
        <MeterLinePage />
      )}
      
    </Box>
  );
}

