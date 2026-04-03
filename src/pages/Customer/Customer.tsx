// PIXEL-PERFECT VERSION (matches your screenshot closely)
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Divider,
} from "@mui/material";
import { Search, MoreVert, Refresh } from "@mui/icons-material";
import { fetchCustomers, fetchCustomer, type Customer } from "../../services/vendorService";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = useState<Customer | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    const data = await fetchCustomers();
    setCustomers(data.results);
  };

  useEffect(() => {
    load();
  }, []);

  const getStatus = (c: Customer) =>
    Number(c.wallet?.balance) > 0 ? "inactive" : "active";

  const filtered = useMemo(() => {
    return customers.filter((c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.account_number?.includes(search)
    );
  }, [customers, search]);

  const handleRowClick = async (c: Customer) => {
    const full = await fetchCustomer({customer_id: c.id});
    setSelected(full);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <Box p={4} sx={{ background: "#F8FAFC", minHeight: "100vh" }}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Box>
          <Typography fontSize={28} fontWeight={700}>
            Customer Registry
          </Typography>
          <Typography color="#64748B">
            Register and manage all customers — search by meter number or account number
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Refresh />}sx={{ height: 36, textTransform: "none", borderRadius: 2 }}>
            Refresh
          </Button>
          <Button variant="contained" sx={{ height: 36, textTransform: "none", borderRadius: 2 }}>
            + Register Customer
          </Button>
        </Stack>
      </Stack>

      {/* SEARCH BAR */}
      <Card sx={{ p: 3, borderRadius: 4, mb: 3 }}>
  <Stack spacing={2}>
    
    <Typography fontWeight={600}>Quick Search</Typography>

    <Stack direction="row" spacing={2}>
      <TextField
        fullWidth
        placeholder="Search by meter number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        placeholder="Search by account number..."
      />

      <Button variant="outlined">Clear</Button>
    </Stack>
  </Stack>
</Card>

      {/* TABLE */}
			
      <Card sx={{ borderRadius: 4 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  "Customer",
                  "Account No",
                  "Meter No",
                  "Class",
                  "Category",
                  "Metering",
                  "Status",
                  "Debt Balance",
                  "",
                ].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: "#94A3B8" }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleRowClick(c)}
                >
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: "#E2E8F0", color: "#1E293B" }}>
                        {c.name?.slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={500}>{c.name}</Typography>
                        <Typography fontSize={12} color="#94A3B8">
                          {c.phone_number}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell>{c.account_number}</TableCell>
                  <TableCell>{c.meter_number}</TableCell>

                  <TableCell>
                    <Chip
                      label={c.customer_class?.name}
                      size="small"
                      sx={{ bgcolor: "#E2FBE8", color: "#166534" }}
                    />
                  </TableCell>

                  <TableCell>{c.customer_category?.name}</TableCell>

                  <TableCell>
                    <Chip
                      label={c.metering_type?.name}
                      size="small"
                      sx={{ bgcolor: "#EEF2FF", color: "#3730A3" }}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={getStatus(c)}
                      size="small"
                      sx={{
                        bgcolor:
                          getStatus(c) === "active" ? "#DCFCE7" : "#FEE2E2",
                        color:
                          getStatus(c) === "active" ? "#166534" : "#991B1B",
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={`₦${c.wallet?.balance || "0.00"}`}
                      size="small"
                      sx={{
                        bgcolor:
                          Number(c.wallet?.balance) > 0
                            ? "#FEE2E2"
                            : "#DCFCE7",
                        color:
                          Number(c.wallet?.balance) > 0
                            ? "#991B1B"
                            : "#166534",
                      }}
                    />
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setMenuRow(c);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* MENU */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem>View</MenuItem>
        <MenuItem>Edit</MenuItem>
        <MenuItem sx={{ color: "red" }}>Delete</MenuItem>
      </Menu>

      {/* DETAIL PANEL */}
      {selected && (
        <Card ref={detailRef} sx={{ mt: 4, borderRadius: 4, overflow: "hidden" }}>
          <Box sx={{ bgcolor: "#1E3A8A", color: "white", p: 3 }}>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography fontWeight={700} fontSize={20}>
                  {selected.name}
                </Typography>
                <Typography fontSize={14}>{selected.phone_number}</Typography>

                <Stack direction="row" spacing={1} mt={1}>
                  <Chip label={getStatus(selected)} size="small" sx={{ bgcolor: "#FEE2E2", color: "#991B1B" }} />
                  <Chip label={selected.metering_type?.name} size="small" />
                  <Chip label={`Debt: ₦${selected.wallet?.balance}`} size="small" />
                </Stack>
              </Box>

              <Button variant="outlined" sx={{ color: "white", borderColor: "white" }}>
                Close
              </Button>
            </Stack>
          </Box>

          <Box p={3}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={6}>
                <Box>
                  <Typography fontSize={12} color="#94A3B8">ACCOUNT NO</Typography>
                  <Typography fontWeight={600}>{selected.account_number}</Typography>
                </Box>
                <Box>
                  <Typography fontSize={12} color="#94A3B8">METER NO</Typography>
                  <Typography fontWeight={600}>{selected.meter_number}</Typography>
                </Box>
                <Box>
                  <Typography fontSize={12} color="#94A3B8">CLASS</Typography>
                  <Typography fontWeight={600}>{selected.customer_class?.name}</Typography>
                </Box>
                <Box>
                  <Typography fontSize={12} color="#94A3B8">CATEGORY</Typography>
                  <Typography fontWeight={600}>{selected.customer_category?.name}</Typography>
                </Box>
              </Stack>

              <Divider />

              <Box>
                <Typography fontSize={12} color="#94A3B8">ADDRESS</Typography>
                <Typography fontWeight={600}>{(selected as any).address || "N/A"}</Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button variant="contained">Edit</Button>
                <Button variant="outlined" color="error">Delete</Button>
              </Stack>
            </Stack>
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default CustomerManagement;
