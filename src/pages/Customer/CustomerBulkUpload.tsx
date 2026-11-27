
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import { Refresh, Download, CloudUpload, } from "@mui/icons-material";

import {
//   CloudUpload,
//   Download,
  FileSpreadsheet,
  
  CheckCircle,
  AlertCircle,
  Play,
  X,
} from "lucide-react";

import {
  ImportJob,
  ImportKind,
  uploadImportFile,
  getImportJob,
  downloadImportTemplate,
  downloadImportErrors,
} from "../../services/vendorService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { toast } from "react-toastify";

interface CustomerBulkUploadProps {
  kind?: ImportKind;
  onImportComplete?: () => void;
}

const CustomerBulkUpload: React.FC<CustomerBulkUploadProps> = ({
  kind = "customers",
  onImportComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [job, setJob] = useState<ImportJob | null>(null);

  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const isRunning = (status?: string) => {
    const value = status?.toLowerCase();

    return value === "pending" || value === "processing";
  };

  const isCompleted = (status?: string) => {
    const value = status?.toLowerCase();

    return (
      value === "completed" ||
      value === "success" ||
      value === "succeeded"
    );
  };

  const isFailed = (status?: string) => {
    const value = status?.toLowerCase();

    return (
      value === "failed" ||
      value === "cancelled" ||
      value === "canceled"
    );
  };

  const validationPassed =
    job?.mode === "validate" &&
    isCompleted(job.status) &&
    job.failed === 0 &&
    job.total_rows > 0;

  const progress =
    job && job.total_rows > 0
      ? Math.min((job.processed / job.total_rows) * 100, 100)
      : 0;

  // Select CSV file
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setError("");

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
    setJob(null);
  };

  // Download template or error report
  const saveBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    setError("");

    try {
      const blob = await downloadImportTemplate(kind);
      saveBlob(blob, `${kind}_template.csv`);
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err));
      setError("Unable to download the CSV template.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadErrors = async () => {
    if (!job) return;

    try {
      const blob = await downloadImportErrors(job.id);
      saveBlob(blob, `${kind}_import_errors_${job.id}.csv`);
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err));
      setError("Unable to download the error report.");
    }
  };

  // Upload CSV
  const handleUpload = async (mode: "validate" | "commit") => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    setError("");

    if (mode === "validate") {
      setUploading(true);
    } else {
      setCommitting(true);
    }

    try {
      const response = await uploadImportFile(file, kind, mode);

      setJob(response);
    } catch (err: any) {
      console.error("Import upload failed:", err);
        toast.error(getErrorMessage(err));
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to upload the CSV file."
      );
    } finally {
      setUploading(false);
      setCommitting(false);
    }
  };

  // Refresh job status manually
  const handleRefresh = async () => {
    if (!job) return;

    setRefreshing(true);

    try {
      const response = await getImportJob(job.id);
      setJob(response);
    } catch (err) {
      console.error("Unable to refresh import job:", err);
      toast.error(getErrorMessage(err));
      setError("Unable to refresh import status.");
    } finally {
      setRefreshing(false);
    }
  };

  // Automatically poll while job is pending or processing
  useEffect(() => {
    if (!job || !isRunning(job.status)) return;

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        const response = await getImportJob(job.id);

        if (!cancelled) {
          setJob(response);
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
        console.error("Import polling failed:", err);
      }
    }, 3000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [job]);

  // Notify parent when a commit finishes successfully
  useEffect(() => {
    if (
      job?.mode === "commit" &&
      isCompleted(job.status)
    ) {
      onImportComplete?.();
    }
  }, [job?.id, job?.mode, job?.status, onImportComplete]);

  const handleRemoveFile = () => {
    setFile(null);
    setJob(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #E2E8F0",
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography fontSize={20} fontWeight={700}>
              Bulk {kind === "customers" ? "Customer" : "Debt"} Import
            </Typography>

            <Typography color="text.secondary" fontSize={13} mt={0.5}>
              Upload a CSV file to import multiple records at once.
            </Typography>
          </Box>

          {/* Template */}
          <Box
            sx={{
              p: 2,
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <FileSpreadsheet color="#15803D" />

              <Box>
                <Typography fontWeight={600} fontSize={14}>
                  CSV Import Template
                </Typography>

                <Typography color="text.secondary" fontSize={12}>
                  Download the required CSV format.
                </Typography>
              </Box>
            </Stack>

            <Button
              size="small"
              variant="outlined"
              startIcon={
                downloading ? (
                  <CircularProgress size={14} />
                ) : (
                  <Download sx={{size:16}} />
                )
              }
              disabled={downloading}
              onClick={handleDownloadTemplate}
              sx={{ textTransform: "none", whiteSpace: "nowrap" }}
            >
              Download
            </Button>
          </Box>

          {/* File upload */}
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: "2px dashed #CBD5E1",
              borderRadius: 3,
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: "#FAFCFF",
              "&:hover": {
                borderColor: "#1E3A8A",
                bgcolor: "#F1F5F9",
              },
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={handleFileChange}
            />

            <CloudUpload
              sx={{color:"#64748B",size:38}}
            />

            <Typography fontWeight={600} mt={1}>
              Click to upload CSV
            </Typography>

            <Typography color="text.secondary" fontSize={12} mt={0.5}>
              Only CSV files are supported.
            </Typography>
          </Box>

          {/* Selected file */}
          {file && (
            <Box
              sx={{
                p: 2,
                border: "1px solid #E2E8F0",
                borderRadius: 2,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <FileSpreadsheet color="#15803D" />

                  <Box>
                    <Typography fontWeight={600} fontSize={13}>
                      {file.name}
                    </Typography>

                    <Typography color="text.secondary" fontSize={11}>
                      {(file.size / 1024).toFixed(2)} KB
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  color="error"
                  size="small"
                  onClick={handleRemoveFile}
                  disabled={uploading || committing}
                >
                  <X size={17} />
                </Button>
              </Stack>
            </Box>
          )}

          {/* Error */}
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Upload actions */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={
                uploading ? (
                  <CircularProgress size={16} />
                ) : (
                  <Refresh sx={{size:17}} />
                )
              }
              disabled={!file || uploading || committing}
              onClick={() => handleUpload("validate")}
              sx={{ textTransform: "none", py: 1.2 }}
            >
              {uploading ? "Validating..." : "Validate CSV"}
            </Button>

            <Button
              fullWidth
              variant="contained"
              startIcon={<Play size={17} />}
              disabled={
                !file ||
                !validationPassed ||
                uploading ||
                committing
              }
              onClick={() => handleUpload("commit")}
              sx={{
                bgcolor: "#1E3A8A",
                textTransform: "none",
                py: 1.2,
                "&:hover": { bgcolor: "#172554" },
              }}
            >
              {committing ? "Registering..." : "Commit & Register"}
            </Button>
          </Stack>

          {/* Job results */}
          {job && (
            <>
              <Divider />

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography fontWeight={700}>
                  Import Job #{job.id}
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={job.status}
                    color={
                      isCompleted(job.status)
                        ? "success"
                        : isFailed(job.status)
                          ? "error"
                          : "info"
                    }
                  />

                  <Button
                    size="small"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Refresh sx={{size:17}} />
                    )}
                  </Button>
                </Stack>
              </Stack>

              {job.message && (
                <Alert
                  severity={
                    isFailed(job.status) || job.failed > 0
                      ? "warning"
                      : "info"
                  }
                >
                  {job.message}
                </Alert>
              )}

              {/* Progress */}
              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography fontSize={13} fontWeight={600}>
                    Processing progress
                  </Typography>

                  <Typography fontSize={13} fontWeight={600}>
                    {job.processed} / {job.total_rows}
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                  }}
                />
              </Box>

              {/* Statistics */}
              <Grid container spacing={2}>
                {[
                  {
                    label: "Total Rows",
                    value: job.total_rows,
                  },
                  {
                    label: "Processed",
                    value: job.processed,
                  },
                  {
                    label: "Successful",
                    value: job.succeeded,
                  },
                  {
                    label: "Failed",
                    value: job.failed,
                  },
                ].map((item) => (
                  <Grid item xs={6} md={3} key={item.label}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#F8FAFC",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        color="text.secondary"
                        fontSize={12}
                      >
                        {item.label}
                      </Typography>

                      <Typography fontSize={22} fontWeight={700}>
                        {item.value ?? 0}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Validation status */}
              {job.mode === "validate" && isCompleted(job.status) && (
                <Alert
                  severity={validationPassed ? "success" : "warning"}
                  icon={
                    validationPassed ? (
                      <CheckCircle />
                    ) : (
                      <AlertCircle />
                    )
                  }
                >
                  {validationPassed
                    ? "Validation successful. You can now commit this import."
                    : "Validation completed, but some rows failed or no rows were found. Review the results before proceeding."}
                </Alert>
              )}

              {job.mode === "commit" && isCompleted(job.status) && (
                <Alert severity="success">
                  Customer import has been completed successfully.
                </Alert>
              )}

              {isFailed(job.status) && (
                <Alert severity="error">
                  Import processing failed. Review the error report if available.
                </Alert>
              )}

              {/* Error report */}
              {job.has_error_report && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Download sx={{size:17}} />}
                  onClick={handleDownloadErrors}
                  sx={{ textTransform: "none", alignSelf: "flex-start" }}
                >
                  Download Error Report
                </Button>
              )}
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CustomerBulkUpload;
