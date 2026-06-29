import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

const uploadTypes = [
  "Bulk Key Change",
  "Bulk Free Issue",
  "Bulk Meter",
  "Bulk Clear Token",
  "Bulk Tamper Token",
  "Bulk Max Power",
];

const BulkEngineering: React.FC = () => {
  const [uploadType, setUploadType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: SelectChangeEvent) => {
    setUploadType(event.target.value);
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files?.length) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const processFile = () => {
    console.log(uploadType);
    console.log(selectedFile);

    // API Call
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#ECECF1" }}>
      {/* Header */}
      <Box
        sx={{
          height: 250,
          background:
            "linear-gradient(90deg,#22C1E9 0%, #1D74E7 100%)",
          px: 5,
          py: 4,
        }}
      >
        <Typography
          color="white"
          fontSize={34}
          fontWeight={700}
        >
          Bulk Engineering
        </Typography>
      </Box>

      {/* Content */}
      <Box
        display="flex"
        justifyContent="center"
        mt={-18}
      >
        <Paper
          elevation={4}
          sx={{
            width: 760,
            borderRadius: 2,
            p: 5,
          }}
        >
          {/* Upload Area */}

          <Box
            onClick={openFilePicker}
            sx={{
              border: "4px dashed blue",
              borderRadius: 2,
              height: 280,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              mb: 4,
              transition: ".3s",

              "&:hover": {
                bgcolor: "#f5f9ff",
              },
            }}
          >
            <CloudUploadOutlinedIcon
              sx={{
                fontSize: 70,
                color: "#1565C0",
                mb: 2,
              }}
            />

            <Typography
              color="primary"
              fontSize={26}
            >
              Upload file (CSV/XLSX) with a maximum of
              100 rows.
            </Typography>

            {selectedFile && (
              <Typography
                mt={3}
                fontWeight={600}
                color="text.secondary"
              >
                {selectedFile.name}
              </Typography>
            )}

            <input
              ref={inputRef}
              hidden
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
            />
          </Box>

          {/* Select */}

          <FormControl fullWidth sx={{ mb: 3 }}>
            <Select
              displayEmpty
              value={uploadType}
              onChange={handleChange}
            >
              <MenuItem value="">
                Select upload type
              </MenuItem>

              {uploadTypes.map((item) => (
                <MenuItem
                  key={item}
                  value={item}
                >
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Button */}

          <Button
            fullWidth
            size="large"
            variant="contained"
            onClick={processFile}
            sx={{
              height: 60,
              bgcolor: "#1FA387",
              fontSize: 22,
              textTransform: "none",

              "&:hover": {
                bgcolor: "#198C73",
              },
            }}
          >
            Process File
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default BulkEngineering;