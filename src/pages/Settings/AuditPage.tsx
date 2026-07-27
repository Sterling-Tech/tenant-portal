import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";

import ActivityTab from "../Settings/ActivityTab";
import CustomerCategoryHistoryTab from "./CustomerCategoryHistoryTab";
import AuditHistoryPage from "./AuditHistoryTab";

export default function AuditPage() {
    const [tab, setTab] = useState(0);

    return (
        <Box>

            <Typography
                fontSize={28}
                fontWeight={700}
                mb={3}
                ml={3}
            >
                Audit Logs
            </Typography>

            <Paper
                sx={{
                    mb: 3,
                    borderRadius: 3
                }}
            >
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                >
                    <Tab label="Activity" />
                    <Tab label="History" />
                    {/* <Tab label="Customer Category" /> */}
                </Tabs>
            </Paper>

            {tab === 0 && <ActivityTab />}
            {tab === 1 && <AuditHistoryPage />}
            {tab === 3 && <CustomerCategoryHistoryTab />}
        </Box>
    );
}