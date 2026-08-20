import React, { useState, useEffect } from "react";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  MenuItem,
  Chip,
  Stack,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";

import {
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Save as SaveIcon,
  SettingsApplications as ConfigIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Key as KeyIcon,
  Language as DomainIcon,
  Business as BusinessIcon,
  Public as PublicIcon,
  History,
  Group,
  Policy,
} from "@mui/icons-material";

import { useAppSelector } from "../../store/store";
import CreateNewAdmin from "./CreateNewAdmin";
import AllAdmin from "./AllAdmin";
import AssignPermission from "./AssignPermission";
import ChangePassword from "./ChangePassword";
import UserUpdate from "./UserUpdate";
import ConfigureVendor from "../../components/OnboardingUser/ConfigureVendor";
import { RelatedVendorResponse } from "../../services/onbordingService";
import AuditPage from "./AuditPage";
import Roles from "../Roles/Roles";
import { usePermission } from "../../hooks/usePermission";
import RetrievePolicy from "./passwordpolicy/RetrievePolicy";
import OnboardingPolicySettings from "./OnboardingPolicy";

//const API_BASE_URL = "http://188.166.161.13:8001/api/v1";

const Settings: React.FC = () => {
  const [success, setSuccess] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("account");

  const { can } = usePermission();

  return (
    <Box
      // p={3}
      sx={{
        // background: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <Box mb={4}>
        <Typography
          variant="h4"
          fontWeight={800}
        >
          System Settings
        </Typography>

        <Typography color="#64748B" mt={1}>
          Manage account, security,
          notifications and organization
          configurations
        </Typography>
      </Box>

      {/* SUCCESS ALERT */}
      <Snackbar
        open={!!success}
        autoHideDuration={5000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>

      {/* MAIN CARD */}
      <Card
        sx={{
          borderRadius: 5,
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(15,23,42,0.06)",
        }}
      >
        {/* Tabs */}
        <Box
          sx={{
            borderBottom: "1px solid #E2E8F0",
            px: 2,
            bgcolor: "#fff",
          }}
        >
          {/* <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="fullWidth"
            scrollButtons="auto"
            
          > */}
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTabs-flexContainer": {
                width: "100%",
              },
              "& .MuiTab-root": {
                flex: 1,
                minWidth: 160, // adjust as needed
              },
            }}
          >

            <Tab value="account" label="Account" icon={<AccountIcon />} />

            <Tab value="security" label="Security" icon={<SecurityIcon />} />
            {can("create_admin") && (
              <Tab
                value="admin-management"
                label="Admin Management"
                icon={<ConfigIcon />}
              />
            )}

            {can("retrieve_admin") && (
              <Tab
                value="admin-list"
                label="Admin List"
                icon={<ConfigIcon />}
              />
            )}
            {can("manage_permissions") && (
              <Tab
                value="assign-permission"
                label="Assign Permission"
                icon={<ConfigIcon />}
              />
            )}
            <Tab
              value="audit"
              label="Audit Logs"
              icon={<History />}
            />
            {can("manage_group") && (
            <Tab
              value="roles"
              label="Roles & Permissions"
              icon={<Group />}
            />
            )}
             <Tab
              value="policy"
              label="Password Policy"
              icon={<Policy />}
            />

            {can("manage_onboarding_policy") && (
            <Tab
              value="onboardingpolicy"
              label="Onboarding Policy"
              icon={<Policy />}
            />
            )}
          </Tabs>
        </Box>

        {activeTab === "account" && <UserUpdate />}

        {activeTab === "security" && <ChangePassword />}

        {activeTab === "admin-management" && <CreateNewAdmin />}

        {activeTab === "admin-list" && <AllAdmin />}

        {activeTab === "assign-permission" && <AssignPermission />}

        {activeTab === "audit" && <AuditPage />}

        {activeTab === "roles" && <Roles />}

        {activeTab === "policy" && <RetrievePolicy />}

        {activeTab === "onboardingpolicy" && <OnboardingPolicySettings />}
      </Card>
    </Box>
  );
};

export default Settings;