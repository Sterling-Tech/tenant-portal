import { Box, Tabs, Tab, Paper } from "@mui/material";
import { useState } from "react";
import BandPage from "../../components/Crmd/tariff/BandPage";
import CategoryPage from "../../components/Crmd/tariff/CategoryPage";
import TariffPage from "../../components/Crmd/tariff/TariffPage";

export default function TariffConfig() {
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
            label="Configure Band"
          />

          <Tab
            label="Configure Category"
          />
          <Tab
            label="Configure Tariff"
          />
        </Tabs>

      </Paper>

      {tab === 0 && (
        <BandPage/>
      )}

      {tab === 1 && (
        <CategoryPage />
      )}

      {tab === 2 && (
        <TariffPage />
      )}
      
    </Box>
  );
}

