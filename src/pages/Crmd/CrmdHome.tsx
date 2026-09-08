import { Box, Tabs, Tab, Paper } from "@mui/material";
import { useState } from "react";
import RegionPage from "../../components/Crmd/RegionPage";
import BusinessUnitPage from "../../components/Crmd/BusinessUnitPage";
import ServiceUnitPage from "../../components/Crmd/ServiceUnitPage";
import ServiceCenterPage from "../../components/Crmd/ServiceCenterPage";
import SubstationPage from "../../components/Crmd/SubstationPage";
import FeederPage from "../../components/Crmd/FeederPage";

export default function CrmdHome() {
   const [tab, setTab] = useState(0);

  return (
    <Box>
      {/* <Paper
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
          <Tab label="Configure Regions" />
          <Tab label="Configure Business Unit" />
          <Tab label="Configure Service Unit" />
          <Tab label="Configure Service Center" />
          <Tab label="Configure Substation" />
          <Tab label="Configure Feeder" />
        </Tabs>
      </Paper> */}
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
            label="Configure Regions"
          />

          <Tab
            label="Configure Business Unit"
          />

          <Tab
            label="Configure Service Unit"
          />

          <Tab
            label="Configure Service Center"
          />

          <Tab
            label="Configure Substation"
          />

          {/* <Tab
            label="Configure Feeder"
          /> */}

        </Tabs>

      </Paper>

      {tab === 0 && (
        <RegionPage/>
      )}

      {tab === 1 && (
        <BusinessUnitPage />
      )}
      {tab === 2 && (
        <ServiceUnitPage />
      )}
      {tab === 3 && (
        <ServiceCenterPage />
      )}
      {tab === 4 && (
        <SubstationPage />
      )}
      {tab === 5 && (
        <FeederPage />
      )}
    </Box>
  );
}

