
import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { getAuthHeaders } from "../../services";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://188.166.161.13:8065";

interface ProofOfPaymentProps {
  url: string;
}

const ProofOfPayment: React.FC<ProofOfPaymentProps> = ({ url }) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    const loadFile = async () => {
      try {
        setLoading(true);
        setError(null);

        const fullUrl = `${API_BASE_URL}${url}`;

        console.log("Loading proof:", fullUrl);

        const authHeaders = getAuthHeaders();

        // Content-Type is unnecessary for a GET request.
        // Remove it to avoid sending JSON content type when requesting a file.
        //delete authHeaders["Content-Type"];

        const response = await fetch(fullUrl, {
          method: "GET",
          headers: {
            ...authHeaders,
            Accept: "*/*",
          },
        });

        console.log("Proof response:", {
          status: response.status,
          contentType: response.headers.get("content-type"),
        });

        if (!response.ok) {
          const errorText = await response.text();

          console.error("Proof request failed:", {
            status: response.status,
            body: errorText,
          });

          throw new Error(
            `Unable to load proof of payment (${response.status})`
          );
        }

        const contentType =
          response.headers.get("content-type")?.toLowerCase() || "";

        const blob = await response.blob();

        console.log("Proof blob:", {
          type: blob.type,
          size: blob.size,
        });

        if (!blob.size) {
          throw new Error("The proof of payment file is empty.");
        }

        objectUrl = URL.createObjectURL(blob);

        setFileUrl(objectUrl);

        // Prefer the actual blob MIME type if available
        setFileType(
          blob.type || contentType
        );
      } catch (err) {
        console.error(
          "Failed to load proof of payment:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load proof of payment."
        );
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      loadFile();
    } else {
      setLoading(false);
      setError("No proof of payment was provided.");
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  if (loading) {
    return (
      <Box
        sx={{
          width: 100,
          height: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={22} />
      </Box>
    );
  }

  if (error || !fileUrl) {
    return (
      <Typography
        variant="caption"
        color="error"
      >
        {error || "Unable to load proof"}
      </Typography>
    );
  }

  const isImage = fileType?.startsWith("image/");
  const isPdf =
    fileType?.includes("application/pdf");

  // IMAGE
  if (isImage) {
    return (
      <Box
        component="img"
        src={fileUrl}
        alt="Proof of payment"
        sx={{
          width: 100,
          height: 70,
          objectFit: "cover",
          borderRadius: 1,
          border: "1px solid #E0E0E0",
          cursor: "pointer",
        }}
        onClick={() => window.open(fileUrl, "_blank")}
      />
    );
  }

  // PDF
  if (isPdf) {
    return (
      <Button
        variant="outlined"
        size="small"
        startIcon={<OpenInNewIcon />}
        onClick={() =>
          window.open(fileUrl, "_blank")
        }
      >
        View PDF
      </Button>
    );
  }

  // UNKNOWN FILE TYPE
  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={<OpenInNewIcon />}
      onClick={() =>
        window.open(fileUrl, "_blank")
      }
    >
      View File
    </Button>
  );
};

export default ProofOfPayment;