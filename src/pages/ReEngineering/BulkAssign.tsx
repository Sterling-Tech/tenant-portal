import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
} from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

const BulkAssign: React.FC = () => {
  const [meter, setMeter] = useState("");
  const [location, setLocation] = useState("");
  const [account, setAccount] = useState("");

  return (
    <Box sx={{ bgcolor: "#F4F5F8", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          height: 250,
          background: "linear-gradient(90deg,#22C1DC,#1E73E8)",
          px: 4,
          pt: 4,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={600}
          color="white"
        >
          Bulk Assign
        </Typography>
      </Box>

      {/* Main Card */}
      <Paper
        elevation={5}
        sx={{
          width: "80%",
          mx: "auto",
          mt: -12,
          p: 5,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ color: "#4A5B7C" }}
        >
          Bulk Meter Assign Hello World
        </Typography>

        <Grid container spacing={3} alignItems="center">
          {/* Meter */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Select Meter</InputLabel>
              <Select
                value={meter}
                label="Select Meter"
                onChange={(e) => setMeter(e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Meter 1">Meter 1</MenuItem>
                <MenuItem value="Meter 2">Meter 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Location */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Select Location</InputLabel>
              <Select
                value={location}
                label="Select Location"
                onChange={(e) => setLocation(e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Lagos">Lagos</MenuItem>
                <MenuItem value="Abuja">Abuja</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Account */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Select Account</InputLabel>
              <Select
                value={account}
                label="Select Account"
                onChange={(e) => setAccount(e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Account 1">Account 1</MenuItem>
                <MenuItem value="Account 2">Account 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Remove */}
          <Grid item xs={12} md={1}>
            <IconButton
              sx={{
                color: "#506080",
                "&:hover": {
                  bgcolor: "transparent",
                },
              }}
            >
              <RemoveCircleOutlineIcon fontSize="large" />
            </IconButton>
          </Grid>
        </Grid>

        {/* Buttons */}
        <Box
          mt={5}
          display="flex"
          gap={3}
          flexWrap="wrap"
        >
          <Button
            variant="outlined"
            sx={{
              px: 5,
              py: 1.8,
              fontSize: 22,
              textTransform: "none",
              borderRadius: 2,
              borderColor: "#203864",
              color: "#203864",
              fontWeight: 600,
            }}
          >
            New Meter Record
          </Button>

          <Button
            variant="contained"
            sx={{
              px: 5,
              py: 1.8,
              fontSize: 22,
              textTransform: "none",
              borderRadius: 2,
              bgcolor: "#17315C",
              fontWeight: 600,
              boxShadow: 3,
              "&:hover": {
                bgcolor: "#10284B",
              },
            }}
          >
            Process Meters
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default BulkAssign;
