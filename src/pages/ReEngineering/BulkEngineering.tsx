import React, { useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import {
  uploadBulkEngineeringTokens,
  downloadCsvReport,
  BulkEngineeringSummary,
  BulkEngineeringResultRow,
} from "../../services/engineeringtokenservice";

// Purely informational now — the CSV's own `vend_type` column drives what
// actually gets processed per row (a single file can mix all five types).
// This just lets the tester label/organize the batch they're about to send.
const uploadTypes = [
  "Bulk Key Change",
  "Bulk Free Issue",
  "Bulk Meter",
  "Bulk Clear Token",
  "Bulk Tamper Token",
  "Bulk Max Power",
];

type ResultDialogState =
  | { kind: "success"; data: BulkEngineeringSummary }
  | { kind: "partial"; message: string; csvReport: string }
  | { kind: "error"; message: string; csvReport?: string }
  | null;

const BulkEngineering: React.FC = () => {
  const [uploadType, setUploadType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resultDialog, setResultDialog] = useState<ResultDialogState>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: SelectChangeEvent) => {
    setUploadType(event.target.value);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setSelectedFile(event.target.files[0]);
      setFormError(null);
    }
    event.target.value = "";
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  const closeResultDialog = () => setResultDialog(null);

  const processFile = async () => {
    if (!selectedFile) {
      setFormError("Please select a CSV or XLSX file first.");
      return;
    }
    setFormError(null);
    setUploading(true);
    try {
      const outcome = await uploadBulkEngineeringTokens(selectedFile);
      if (outcome.kind === "success") {
        setResultDialog({ kind: "success", data: outcome.summary });
        setSelectedFile(null);
        setUploadType("");
      } else if (outcome.kind === "partial") {
        setResultDialog({ kind: "partial", message: outcome.message, csvReport: outcome.csvReport });
      } else {
        setResultDialog({ kind: "error", message: outcome.message, csvReport: outcome.csvReport });
      }
    } catch (err: any) {
      setResultDialog({ kind: "error", message: "An unexpected error occurred while uploading. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#ECECF1" }}>
      {/* Header */}
      <Box
        sx={{
          height: 250,
          background: "#203864",
          px: 5,
          py: 4,
        }}
      >
        <Typography color="white" fontSize={34} fontWeight={700}>
          Bulk Engineering
        </Typography>
      </Box>

      {/* Content */}
      <Box display="flex" justifyContent="center" mt={-18}>
        <Paper elevation={4} sx={{ width: 760, borderRadius: 2, p: 5 }}>
          {/* Upload Area */}
          <Box
            onClick={openFilePicker}
            sx={{
              border: selectedFile ? "3px dashed #203864" : "3px dashed #203864",
              borderRadius: 2,
              minHeight: 120,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              mb: 1,
              py: 4,
              transition: ".3s",
              "&:hover": { bgcolor: "#f5f9ff" },
            }}
          >
            {selectedFile ? (
              <>
                <InsertDriveFileOutlinedIcon sx={{ fontSize: 60, color: "#1FA387", mb: 1.5 }} />
                <Typography fontWeight={700} fontSize={20}>{selectedFile.name}</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {(selectedFile.size / 1024).toFixed(1)} KB · click to choose a different file
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={clearFile}
                  sx={{ mt: 1.5, textTransform: "none" }}
                >
                  Remove file
                </Button>
              </>
            ) : (
              <>
                <CloudUploadOutlinedIcon sx={{ fontSize: 70, color: "#1565C0", mb: 2 }} />
                <Typography color="primary" fontSize={26} textAlign="center" px={2}>
                  Upload file (CSV/XLSX) with a maximum of 100 rows.
                </Typography>
              </>
            )}

            <input
              ref={inputRef}
              hidden
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
            />
          </Box>

          {/* Required columns reference */}
          <Typography variant="caption" color="text.secondary" display="block" mb={3}>
            Columns: <code>vend_type, meter_number, units, kilowatt, to_ti, to_sgc, to_krn, reason</code> — one row per token.
            A single file can mix any of the five token types below; each row's own <code>vend_type</code> decides how it's processed.
          </Typography>

          {formError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          {/* Select — now just an optional label for the batch, not sent to the API */}
          <FormControl fullWidth sx={{ mb: 1 }}>
            <Select displayEmpty value={uploadType} onChange={handleChange}>
              <MenuItem value="">Batch label (optional)</MenuItem>
              {uploadTypes.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" display="block" mb={3}>
            This is just a label for your own reference — it isn't sent with the upload. Token types are read per-row from the file itself.
          </Typography>

          {/* Button */}
          <Button
            fullWidth
            size="large"
            variant="contained"
            onClick={processFile}
            disabled={uploading}
            sx={{
              height: 60,
              bgcolor: "#1FA387",
              fontSize: 22,
              textTransform: "none",
              "&:hover": { bgcolor: "#198C73" },
            }}
          >
            {uploading ? <CircularProgress size={26} color="inherit" /> : "Process File"}
          </Button>
        </Paper>
      </Box>

      {/* ══════════════════════════════════════════════════════════════════
          SUCCESS DIALOG — 200, every row issued
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={resultDialog?.kind === "success"} onClose={closeResultDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}>
        {resultDialog?.kind === "success" && (
          <Box>
            <Box sx={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)", px: 3, pt: 4, pb: 3, textAlign: "center", position: "relative" }}>
              <IconButton onClick={closeResultDialog} size="small" sx={{ position: "absolute", top: 12, right: 12, color: "#bbf7d0" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
              <Box sx={{ width: 68, height: 68, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
                <CheckCircleIcon sx={{ fontSize: 38, color: "#fff" }} />
              </Box>
              <Typography variant="h6" fontWeight={800} color="#fff">Bulk Upload Successful</Typography>
              <Typography variant="body2" sx={{ color: "#bbf7d0", mt: 0.5 }}>
                {resultDialog.data.issued} token{resultDialog.data.issued === 1 ? "" : "s"} issued
              </Typography>
            </Box>
            <DialogContent sx={{ pt: 2.5 }}>
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Token</TableCell>
                      <TableCell>Token 2</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Value / Units</TableCell>
                      <TableCell>Invoice ID</TableCell>
                      <TableCell>KRN / TI / SGC</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resultDialog.data.results.map((r: BulkEngineeringResultRow, idx: number) => (
                      <TableRow key={`${r.invoice_id}-${idx}`} hover>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{r.token}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{r.token2 || "—"}</TableCell>
                        <TableCell>{r.description}</TableCell>
                        <TableCell>{r.value}{r.units ? ` (${r.units})` : ""}</TableCell>
                        <TableCell>{r.invoice_id}</TableCell>
                        <TableCell>
                          {[r.krn, r.ti, r.sgc].filter(Boolean).join(" / ") || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button fullWidth variant="contained" onClick={closeResultDialog} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "#16a34a", "&:hover": { bgcolor: "#15803d" } }}>
                Okay, Done
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
          PARTIAL SUCCESS DIALOG — 207, some rows failed at the gateway
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={resultDialog?.kind === "partial"} onClose={closeResultDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}>
        {resultDialog?.kind === "partial" && (
          <Box>
            <Box sx={{ background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)", px: 3, pt: 4, pb: 3, textAlign: "center", position: "relative" }}>
              <IconButton onClick={closeResultDialog} size="small" sx={{ position: "absolute", top: 12, right: 12, color: "#fde68a" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
              <Box sx={{ width: 68, height: 68, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
                <WarningAmberIcon sx={{ fontSize: 38, color: "#fff" }} />
              </Box>
              <Typography variant="h6" fontWeight={800} color="#fff">Partially Completed</Typography>
              <Chip label="207 · Partial Success" size="small" sx={{ mt: 1, bgcolor: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700 }} />
            </Box>
            <DialogContent sx={{ pt: 2.5 }}>
              <Typography variant="body2" color="text.secondary" mb={2}>{resultDialog.message}</Typography>
              <Box sx={{ p: 1.5, bgcolor: "#fffbeb", border: "1px solid #fde68a", borderRadius: 2, maxHeight: 220, overflow: "auto" }}>
                <Typography component="pre" variant="caption" sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all", m: 0 }}>
                  {resultDialog.csvReport}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button
                fullWidth variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => downloadCsvReport(resultDialog.csvReport, "bulk-engineering-gateway-report.csv")}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
              >
                Download Report
              </Button>
              <Button fullWidth variant="contained" onClick={closeResultDialog} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "#d97706", "&:hover": { bgcolor: "#b45309" } }}>
                Okay
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
          ERROR DIALOG — 400 (validation failed) or 502 (gateway failed) or
          any other unexpected failure
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={resultDialog?.kind === "error"} onClose={closeResultDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}>
        {resultDialog?.kind === "error" && (
          <Box>
            <Box sx={{ background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)", px: 3, pt: 4, pb: 3, textAlign: "center", position: "relative" }}>
              <IconButton onClick={closeResultDialog} size="small" sx={{ position: "absolute", top: 12, right: 12, color: "#fecaca" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
              <Box sx={{ width: 68, height: 68, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
                <ErrorOutlineIcon sx={{ fontSize: 38, color: "#fff" }} />
              </Box>
              <Typography variant="h6" fontWeight={800} color="#fff">Bulk Upload Failed</Typography>
            </Box>
            <DialogContent sx={{ pt: 2.5 }}>
              <Box sx={{ p: 2, bgcolor: "#fef2f2", borderRadius: 2, border: "1px solid #fecaca", mb: resultDialog.csvReport ? 2 : 0 }}>
                <Typography variant="body2" color="error.dark" fontWeight={700} mb={0.5}>Reason from server:</Typography>
                <Typography variant="body2" color="error.main">{resultDialog.message}</Typography>
              </Box>
              {resultDialog.csvReport && (
                <Box sx={{ p: 1.5, bgcolor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 2, maxHeight: 220, overflow: "auto" }}>
                  <Typography component="pre" variant="caption" sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all", m: 0 }}>
                    {resultDialog.csvReport}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              {resultDialog.csvReport && (
                <Button
                  fullWidth variant="outlined" color="error"
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadCsvReport(resultDialog.csvReport!, "bulk-engineering-error-report.csv")}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                >
                  Download Report
                </Button>
              )}
              <Button fullWidth variant="contained" onClick={closeResultDialog} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "#dc2626", "&:hover": { bgcolor: "#b91c1c" } }}>
                Close
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default BulkEngineering;