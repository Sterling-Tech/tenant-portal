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

//const API_BASE_URL = "http://188.166.161.13:8001/api/v1";

const Settings: React.FC = () => {
  const { user } = useAppSelector((state: any) => state.auth);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedVendor, setSelectedVendor] =
    useState<RelatedVendorResponse | null>(null);

  // ================= NOTIFICATIONS =================
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
  });

  // ================= CONFIGURATION =================
  const [configurationForm, setConfigurationForm] = useState({
    organization_name: "",
    organization_id: "ORG-20394-AB",
    organization_type: "vendor",

    api_key: "pk_live_x82jshh2728sjj",
    api_secret: "sk_live_8sjjsjjs929299",

    api_scope: "full_access",
    rate_limit: "1000",

    domain: "",
    ip_address: "",

    expiration_date: "",
    data_limit: "10GB",

    commission_rate: "5",

    saas_enabled: true,
    billing_cycle: "monthly",

    webhook_url: "",
  });

  // ================= CONFIGURATION =================
  const generateApiKey = () => {
    const random = Math.random().toString(36).substring(2, 18);

    setConfigurationForm({
      ...configurationForm,
      api_key: `pk_live_${random}`,
    });

    setSuccess("API Key Generated Successfully");
  };

  const rotateApiKey = () => {
    const random = Math.random().toString(36).substring(2, 18);

    setConfigurationForm({
      ...configurationForm,
      api_secret: `sk_live_${random}`,
    });

    setSuccess("API Secret Rotated Successfully");
  };

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
          boxShadow:
            "0 10px 40px rgba(15,23,42,0.06)",
        }}
      >
        {/* TABS */}
        <Box
          sx={{
            borderBottom: "1px solid #E2E8F0",
            px: 2,
            bgcolor: "#fff",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, value) =>
              setActiveTab(value)
            }
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<AccountIcon />}
              iconPosition="start"
              label="Account"
            />

            <Tab
              icon={<SecurityIcon />}
              iconPosition="start"
              label="Security"
            />

            {/* <Tab
              icon={<NotificationsIcon />}
              iconPosition="start"
              label="Notifications"
            />*/}
            {/* 
            <Tab
              icon={<ConfigIcon />}
              iconPosition="start"
              label="Configuration"
            /> */}
            <Tab
              icon={<ConfigIcon />}
              iconPosition="start"
              label="Admin Management"
            />
            <Tab
              icon={<ConfigIcon />}
              iconPosition="start"
              label="Admin List"
            />
            <Tab
              icon={<ConfigIcon />}
              iconPosition="start"
              label="Assign Permission"
            />
           
            <Tab 
              icon={<History />} 
              iconPosition="start" 
              label="Audit Logs" 
            />
            <Tab 
              icon={<Group />} 
              iconPosition="start" 
              label="Roles & Permissions" 
            />
          </Tabs>
        </Box>

        {/* ================= ACCOUNT TAB ================= */}
        {activeTab === 0 && (
          <UserUpdate />
        )}

        {/* ================= SECURITY TAB ================= */}
        {activeTab === 1 && (
          <ChangePassword />
        )}

       
        {/* ================= ADMIN MANAGEMENT TAB ================= */}
        {activeTab === 2 && (
          <CreateNewAdmin />
        )}
        {/* ================= ADMIN LIST TAB ================= */}
        {activeTab === 3 && (
          <AllAdmin />
        )}
        {activeTab === 4 && (
          <AssignPermission />
        )}
        {activeTab === 5 && (
          <AuditPage />
        )}
        {activeTab === 6 && (
          <Roles />
        )}
      </Card>
    </Box>
  );
};

export default Settings;