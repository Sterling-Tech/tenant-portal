import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Autocomplete,
  TextField,
  Button,
  Grid,
  Skeleton,
  Drawer,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { Refresh, MoreVert } from "@mui/icons-material";
import {
  fetchVendors,
  fetchVendorchildren,
  Vendor,
} from "../../services/vendorService";

/* ================= SUMMARY CARD ================= */

const StatCard = ({ label, value }: any) => (
  <Paper
    sx={{
      px: 2,
      py: 1.5,
      minWidth: 110,
      borderRadius: 3,
      border: "1px solid #e5e7eb",
      background: "#ffffff",
      transition: "0.2s",
      "&:hover": {
        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        transform: "translateY(-2px)",
      },
    }}
  >
    <Typography fontSize={11} color="text.secondary">
      {label}
    </Typography>

    <Typography fontSize={18} fontWeight={700}>
      {value}
    </Typography>
  </Paper>
);

/* ================= COLUMN ================= */

const Column = ({ title, items, loadingLevel, onClick, onMenu }: any) => (
  <Box flex={1} minWidth={240}>
    <Typography fontWeight={600} mb={1}>
      {title}
    </Typography>

    <Paper
      sx={{
        p: 1,
        borderRadius: 4,
        height: 420,
        overflowY: "auto",
      }}
    >
      {loadingLevel
        ? [...Array(6)].map((_, i) => (
            <Skeleton key={i} height={50} sx={{ mb: 1 }} />
          ))
        : items.map((item: any) => (
            <Box
              key={item.id}
              sx={{
                p: 1.5,
                borderRadius: 3,
                mb: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                transition: "0.2s",
                "&:hover": {
                  bgcolor: "#eef2ff",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box onClick={() => onClick(item)}>
                <Typography fontSize={13} fontWeight={600}>
                  {item.business_name}
                </Typography>
                <Typography fontSize={11} color="text.secondary">
                  {item.email || "No email"}
                </Typography>
              </Box>

              <IconButton size="small" onClick={(e) => onMenu(e, item)}>
                <MoreVert fontSize="small" />
              </IconButton>
            </Box>
          ))}
    </Paper>
  </Box>
);

/* ================= MAIN ================= */

const VendorHierarchy = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const [subVendors, setSubVendors] = useState<Vendor[]>([]);
  const [agents, setAgents] = useState<Vendor[]>([]);
  const [cashiers, setCashiers] = useState<Vendor[]>([]);
  const [pos, setPos] = useState<Vendor[]>([]);

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [loadingLevel, setLoadingLevel] = useState({
    sub: false,
    agent: false,
    cashier: false,
    pos: false,
  });

  const [anchorEl, setAnchorEl] = useState<any>(null);
  const [menuRow, setMenuRow] = useState<any>(null);

  /* ================= LOAD ROOT ================= */

  const loadVendors = async () => {
    const res = await fetchVendors({ main_vendor: true });
    setVendors(res.results || []);
  };

  useEffect(() => {
    loadVendors();
  }, []);

  /* ================= LOAD LEVEL ================= */

const loadLevel = async (id: any, level: string) => {
  setLoadingLevel(prev => ({ ...prev, [level]: true }));

  try {
    const res: any = await fetchVendorchildren(id);

    console.log("API RESPONSE:", res);

    const list = Array.isArray(res?.results)
      ? res.results
      : Array.isArray(res)
      ? res
      : [];

    // if (level === "sub") {
    //   setSubVendors(list);
    //   setAgents([]);
    //   setCashiers([]);
    //   setPos([]);
    // }

    // if (level === "agent") {
    //   setAgents(list);
    //   setCashiers([]);
    //   setPos([]);
    // }

    // if (level === "cashier") {
    //   setCashiers(list);
    //   setPos([]);
    // }

    // if (level === "pos") {
    //   setPos(list);
    // }
    if (level === "sub") setSubVendors(list);
    if (level === "agent") setAgents(list);
    if (level === "cashier") setCashiers(list);
    if (level === "pos") setPos(list);
  } catch (err) {
    console.error("LOAD ERROR:", err);

    // setSubVendors([]);
    // setAgents([]);
    // setCashiers([]);
    // setPos([]);
  } finally {
    setLoadingLevel(prev => ({ ...prev, [level]: false }));
  }
};

  /* ================= MENU ================= */

  const openMenu = (e: any, row: any) => {
    setAnchorEl(e.currentTarget);
    setMenuRow(row);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };

  /* ================= COUNTS ================= */

  const counts = {
    sub: subVendors.length,
    agent: agents.length,
    cashier: cashiers.length,
    pos: pos.length,
  };

  /* ================= UI ================= */

  return (
    <Box bgcolor="#f5f7fb"
    // p={2}
     >
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Box>
          <Typography fontSize={28} fontWeight={700}>
            Vendor Hierarchy
          </Typography>
          <Typography color="text.secondary">
            Manage vendors, agents, cashiers and POS
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadVendors}
          sx={{ height: 36, textTransform: "none", borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Stack>

      {/* SELECTOR */}
      <Paper
  sx={{
    p: 2,
    borderRadius: 4,
    mb: 3,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 2,
  }}
>
  {/* LEFT: Vendor Selector */}
  <Stack direction="row" spacing={2} alignItems="center">
    <Typography fontSize={13} color="text.secondary">
      Vendor:
    </Typography>

    <Autocomplete
      size="small"
      options={vendors}
      value={selectedVendor}
      sx={{
        width: 260,
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
          bgcolor: "#f9fafb",
        },
      }}
      onChange={(_, v) => {
        if (!v) return;
        setSelectedVendor(v);
        loadLevel(v.id, "sub");
      }}
      getOptionLabel={(o) => o.business_name}
      renderInput={(params) => (
        <TextField {...params} placeholder="Select vendor" />
      )}
    />
  </Stack>

  {/* RIGHT: STATS */}
  <Stack direction="row" spacing={2}>
    <StatCard label="Sub Vendors" value={counts.sub} />
    <StatCard label="Agents" value={counts.agent} />
    <StatCard label="Cashiers" value={counts.cashier} />
    <StatCard label="POS" value={counts.pos} />
  </Stack>
</Paper>

      {/* STATS */}
      {/* <Grid container spacing={2} mb={3}>
        <Grid item xs={3}>
          <StatCard label="Sub Vendors" value={counts.sub} />
        </Grid>
        <Grid item xs={3}>
          <StatCard label="Agents" value={counts.agent} />
        </Grid>
        <Grid item xs={3}>
          <StatCard label="Cashiers" value={counts.cashier} />
        </Grid>
        <Grid item xs={3}>
          <StatCard label="POS" value={counts.pos} />
        </Grid>
      </Grid> */}

      {/* HIERARCHY */}
      <Stack direction="row" spacing={2}>
        <Column
          title="Sub Vendors"
          items={subVendors}
          loading={loadingLevel}
          onClick={(item: any) => {
            setSelected(item);
            loadLevel(item.id, "agent");
          }}
          onMenu={openMenu}
        />

        <Column
          title="Agents"
          items={agents}
          loading={loadingLevel}
          onClick={(item: any) => {
            setSelected(item);
            loadLevel(item.id, "cashier");
          }}
          onMenu={openMenu}
        />

        <Column
          title="Cashiers"
          items={cashiers}
          loading={loadingLevel}
          onClick={(item: any) => {
            setSelected(item);
            loadLevel(item.id, "pos");
          }}
          onMenu={openMenu}
        />

        <Column
          title="POS"
          items={pos}
          loading={loadingLevel}
          onClick={(item: any) => setSelected(item)}
          onMenu={openMenu}
        />
      </Stack>

      {/* DRAWER */}
      <Drawer
        anchor="right"
        open={!!selected}
        onClose={() => setSelected(null)}
      >
        <Box width={320} p={3}>
          <Typography fontSize={20} fontWeight={700}>
            {selected?.business_name}
          </Typography>

          <Typography mt={1} color="text.secondary">
            {selected?.email}
          </Typography>

          <Typography fontSize={13} mt={2}>
            {selected?.phone_number || "-"}
          </Typography>
          <Typography fontSize={13} mt={2}>
            address: {selected?.address || "-"}
          </Typography>

          <Chip
            label={selected?.account_status}
            color="success"
            sx={{ mt: 2 }}
          />

          <Button fullWidth sx={{ mt: 3 }} variant="contained">
            View Full Details
          </Button>
        </Box>
      </Drawer>

      {/* MENU */}
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}>
  <MenuItem
    onClick={() => {
      if (menuRow) setSelected(menuRow);
      closeMenu();
    }}
  >
    View Details
  </MenuItem>

  <MenuItem
    onClick={() => {
      if (menuRow) {
        const hierarchyMap: any = {
          vendor: "sub",
          sub_vendor: "agent",
          agent: "cashier",
          cashier: "pos",
        };

        const nextLevel = hierarchyMap[menuRow.hierachy];

        if (nextLevel) {
          loadLevel(menuRow.id, nextLevel);
        }
      }

      closeMenu();
    }}
  >
    Load Children
  </MenuItem>
</Menu>
    </Box>
  );
};

export default VendorHierarchy;