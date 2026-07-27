import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

interface Props {
  previous: Record<string, any> | null;
  present: Record<string, any> | null;
  action: string;
}

const prettify = (value: any): string => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  )
    return "-";

  if (typeof value === "boolean")
    return value ? "True" : "False";

  if (
    typeof value === "object"
  ) {
    try {
      return JSON.stringify(
        value,
        null,
        2
      );
    } catch {
      return String(value);
    }
  }

  return String(value);
};

export default function HistoryComparison({
  previous,
  present,
  action,
}: Props) {
  const keys = Array.from(
    new Set([
      ...Object.keys(previous || {}),
      ...Object.keys(present || {}),
    ])
  );

  return (
    <Stack spacing={2}>
      {keys.map((key) => {
        const before =
          previous?.[key];

        const after =
          present?.[key];

        const changed =
          JSON.stringify(before) !==
          JSON.stringify(after);

        // hide unchanged values on UPDATE
        if (
          action === "UPDATE" &&
          !changed
        )
          return null;

        return (
          <Paper
            key={key}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
            }}
          >
            <Stack spacing={2}>
              {/* Field Name */}

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  fontWeight={700}
                  textTransform="capitalize"
                >
                  {key.split("_").join(" ")}
                </Typography>

                {changed && (
                  <Chip
                    size="small"
                    color="warning"
                    label="Changed"
                  />
                )}
              </Stack>

              {/* CREATE */}

              {action ===
                "CREATE" && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Value
                  </Typography>

                  <Box
                    mt={1}
                    p={1.5}
                    bgcolor="#e8f5e9"
                    borderRadius={2}
                    sx={{
                      whiteSpace:
                        "pre-wrap",
                      wordBreak:
                        "break-word",
                      fontFamily:
                        "monospace",
                    }}
                  >
                    {prettify(after)}
                  </Box>
                </Box>
              )}

              {/* DELETE */}

              {action ===
                "DELETE" && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Deleted Value
                  </Typography>

                  <Box
                    mt={1}
                    p={1.5}
                    bgcolor="#ffebee"
                    borderRadius={2}
                    sx={{
                      whiteSpace:
                        "pre-wrap",
                      wordBreak:
                        "break-word",
                      fontFamily:
                        "monospace",
                    }}
                  >
                    {prettify(before)}
                  </Box>
                </Box>
              )}

              {/* UPDATE */}

              {action ===
                "UPDATE" && (
                <Grid
                  container
                  spacing={2}
                >
                  <Grid
                    item
                    xs={12}
                    md={6}
                  >
                    <Typography
                      variant="caption"
                      color="error"
                    >
                      Previous
                    </Typography>

                    <Box
                      mt={1}
                      p={1.5}
                      bgcolor="#ffebee"
                      borderRadius={2}
                      sx={{
                        whiteSpace:
                          "pre-wrap",
                        wordBreak:
                          "break-word",
                        fontFamily:
                          "monospace",
                      }}
                    >
                      {prettify(
                        before
                      )}
                    </Box>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    md={6}
                  >
                    <Typography
                      variant="caption"
                      color="success.main"
                    >
                      Current
                    </Typography>

                    <Box
                      mt={1}
                      p={1.5}
                      bgcolor="#e8f5e9"
                      borderRadius={2}
                      sx={{
                        whiteSpace:
                          "pre-wrap",
                        wordBreak:
                          "break-word",
                        fontFamily:
                          "monospace",
                      }}
                    >
                      {prettify(
                        after
                      )}
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
