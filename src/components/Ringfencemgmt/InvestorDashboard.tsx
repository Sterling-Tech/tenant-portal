import {
  Box,
  Card,
  Stack,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";

import {
  Search,
  Refresh,
  Add,
  MoreVert,
  Edit,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";

import { useEffect, useState } from "react";

import {
  retrieveInvestors,
  Investor,
} from "../../services/ringfenceService";
import CreateInvestorModal from "./CreateInvestorModal";

export default function InvestorDashboard() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [filtered, setFiltered] = useState<Investor[]>([]);

  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const [search, setSearch] = useState("");

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const [selected, setSelected] =
    useState<Investor | null>(null);

  const [openCreate, setOpenCreate] = useState(false);

  /**
   * Load investors
   */
  const loadInvestors = async () => {
    try {
      setLoading(true);

      const res = await retrieveInvestors();

      setInvestors(res.results);
      setFiltered(res.results);
      setCount(res.count);
    } catch (err) {
      console.error("Failed to load investors:", err);

      setInvestors([]);
      setFiltered([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initial load
   */
  useEffect(() => {
    loadInvestors();
  }, []);

  /**
   * Search
   */
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(investors);
      return;
    }

    const value = search.toLowerCase();

    setFiltered(
      investors.filter(
        (investor) =>
          investor.name
            ?.toLowerCase()
            .includes(value) ||
          investor.code
            ?.toLowerCase()
            .includes(value) ||
          investor.contact_name
            ?.toLowerCase()
            .includes(value) ||
          investor.contact_email
            ?.toLowerCase()
            .includes(value)
      )
    );
  }, [search, investors]);

  /**
   * Active investors
   */
  const activeCount = investors.filter(
    (investor) => investor.is_active
  ).length;

  /**
   * Inactive investors
   */
  const inactiveCount = investors.filter(
    (investor) => !investor.is_active
  ).length;

  /**
   * Close menu
   */
  const closeMenu = () => {
    setAnchorEl(null);
    setSelected(null);
  };

  return (
    <Stack spacing={3}>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
      >
        <SummaryCard
          title="Total Investors"
          value={count}
        />

        <SummaryCard
          title="Active Investors"
          value={activeCount}
        />

        <SummaryCard
          title="Inactive Investors"
          value={inactiveCount}
        />
      </Stack>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <Card sx={{ p: 2 }}>
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          justifyContent="space-between"
          spacing={2}
        >

          {/* Search */}
          <TextField
            placeholder="Search investor..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            sx={{
              width: {
                xs: "100%",
                md: 350,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          {/* Actions */}
          <Stack
            direction="row"
            spacing={2}
          >
            <Button
              startIcon={<Refresh />}
              onClick={loadInvestors}
              disabled={loading}
            >
              Refresh
            </Button>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() =>
                setOpenCreate(true)
              }
            >
              Create Investor
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <Card>
        {loading ? (
          <Box
            py={8}
            display="flex"
            justifyContent="center"
          >
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Box
            py={8}
            textAlign="center"
          >
            <Typography
              color="text.secondary"
            >
              {search
                ? "No investors match your search."
                : "No investors found."}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              overflowX: "auto",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>

                  <TableCell>
                    Name
                  </TableCell>

                  <TableCell>
                    Code
                  </TableCell>

                  <TableCell>
                    Contact
                  </TableCell>

                  <TableCell>
                    Email
                  </TableCell>

                  <TableCell>
                    Phone
                  </TableCell>

                  <TableCell>
                    Status
                  </TableCell>

                  <TableCell
                    align="right"
                  />

                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.map(
                  (investor) => (
                    <TableRow
                      key={investor.id}
                      hover
                    >

                      {/* Name */}
                      <TableCell>
                        <Typography
                          fontWeight={600}
                        >
                          {investor.name}
                        </Typography>
                      </TableCell>

                      {/* Code */}
                      <TableCell>
                        {investor.code}
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        {investor.contact_name ||
                          "-"}
                      </TableCell>

                      {/* Email */}
                      <TableCell>
                        {investor.contact_email ||
                          "-"}
                      </TableCell>

                      {/* Phone */}
                      <TableCell>
                        {investor.contact_phone ||
                          "-"}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            investor.is_active
                              ? "Active"
                              : "Inactive"
                          }
                          color={
                            investor.is_active
                              ? "success"
                              : "default"
                          }
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => {
                            setAnchorEl(
                              e.currentTarget
                            );
                            setSelected(
                              investor
                            );
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>

                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>

      {/* =====================================================
          ACTION MENU
      ===================================================== */}

      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closeMenu}
      >

        <MenuItem
          onClick={() => {
            console.log(
              "Edit investor:",
              selected
            );

            closeMenu();
          }}
        >
          <Edit
            fontSize="small"
            sx={{ mr: 1 }}
          />

          Edit
        </MenuItem>

        {selected?.is_active ? (
          <MenuItem
            onClick={() => {
              console.log(
                "Deactivate investor:",
                selected
              );

              closeMenu();
            }}
          >
            <Cancel
              color="warning"
              fontSize="small"
              sx={{ mr: 1 }}
            />

            Deactivate
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              console.log(
                "Activate investor:",
                selected
              );

              closeMenu();
            }}
          >
            <CheckCircle
              color="success"
              fontSize="small"
              sx={{ mr: 1 }}
            />

            Activate
          </MenuItem>
        )}

      </Menu>

      {/* =====================================================
          CREATE INVESTOR
      ===================================================== */}

      <CreateInvestorModal
        open={openCreate}
        onClose={() =>
          setOpenCreate(false)
        }
        onSuccess={loadInvestors}
      />

    </Stack>
  );
}


/**
 * Summary card
 */
function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <Card
      sx={{
        flex: 1,
        p: 3,
      }}
    >
      <Typography
        color="text.secondary"
      >
        {title}
      </Typography>

      <Typography
        variant="h4"
        fontWeight={700}
        mt={1}
      >
        {value.toLocaleString()}
      </Typography>
    </Card>
  );
}