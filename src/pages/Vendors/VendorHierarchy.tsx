import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Autocomplete,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Drawer,
} from "@mui/material";
import { Refresh, MoreVert } from "@mui/icons-material";
import {
  fetchVendors,
  fetchVendorchildren,
  Vendor,
} from "../../services/vendorService";

/* ================= COLUMN ================= */

const Column = ({
  title,
  items,
  loading,
  onClick,
  onMenu,
}: any) => (
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
        position: "relative",
      }}
    >
      {/* LOADER */}
      {loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255,255,255,0.6)",
            zIndex: 2,
          }}
        >
          <CircularProgress size={28} />
        </Box>
      )}

      {/* EMPTY STATE */}
      {!loading && items.length === 0 && (
        <Box
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography fontSize={13} color="text.secondary">
            No data
          </Typography>
        </Box>
      )}

      {/* LIST */}
      {!loading &&
        items.map((item: any) => (
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

  const [data, setData] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState<any>(null);

  const [anchorEl, setAnchorEl] = useState<any>(null);
  const [menuRow, setMenuRow] = useState<any>(null);

  /* LOAD ROOT */

  const loadVendors = async () => {
    const res = await fetchVendors({ main_vendor: true });
    setVendors(res.results || []);
  };

  useEffect(() => {
    loadVendors();
  }, []);

  /* LOAD CHILDREN (ONLY when explicitly called) */

  const loadChildren = async (id: any) => {
    setLoading(true);
    try {
      const res: any = await fetchVendorchildren(id);

      const list = Array.isArray(res?.results)
        ? res.results
        : Array.isArray(res)
        ? res
        : [];

      setData(list); // ✅ replace ONLY when explicitly loading children
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  /* GROUPING */

  const subVendors = data.filter((d) => d.hierachy === "sub_vendor");
  const agents = data.filter((d) => d.hierachy === "agent");
  const cashiers = data.filter((d) => d.hierachy === "cashier");
  const pos = data.filter((d) => d.hierachy === "pos");

  /* MENU */

  const openMenu = (e: any, row: any) => {
    setAnchorEl(e.currentTarget);
    setMenuRow(row);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };

  /* COUNTS */

  const counts = {
    sub: subVendors.length,
    agent: agents.length,
    cashier: cashiers.length,
    pos: pos.length,
  };

  /* UI */

  return (
    <Box bgcolor="#f5f7fb">
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Box>
          <Typography fontSize={28} fontWeight={700}>
            Vendor Hierarchy
          </Typography>
          <Typography color="text.secondary">
            Sub-vendors → Agents → Cashiers → POS
          </Typography>
        </Box>

        <Button variant="outlined" startIcon={<Refresh />} onClick={loadVendors}
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
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography fontSize={13}>Vendor:</Typography>

          <Autocomplete
            size="small"
            options={vendors}
            value={selectedVendor}
            sx={{ width: 260 }}
            onChange={(_, v) => {
              if (!v) return;
              setSelectedVendor(v);
              loadChildren(v.id); // ✅ ONLY here
            }}
            getOptionLabel={(o) => o.business_name}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select vendor" />
            )}
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <Chip label={`Sub ${counts.sub}`} />
          <Chip label={`Agents ${counts.agent}`} />
          <Chip label={`Cashiers ${counts.cashier}`} />
          <Chip label={`POS ${counts.pos}`} />
        </Stack>
      </Paper>

      {/* HIERARCHY */}
      <Stack direction="row" spacing={2}>
        <Column
          title="Sub Vendors"
          items={subVendors}
          loading={loading}
          onClick={(item: any) => {
            setSelected(item); // ✅ ONLY open drawer
          }}
          onMenu={openMenu}
        />

        <Column
          title="Agents"
          items={agents}
          loading={loading}
          onClick={(item: any) => {
            setSelected(item);
          }}
          onMenu={openMenu}
        />

        <Column
          title="Cashiers"
          items={cashiers}
          loading={loading}
          onClick={(item: any) => {
            setSelected(item);
          }}
          onMenu={openMenu}
        />

        <Column
          title="POS"
          items={pos}
          loading={loading}
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

          <Typography mt={2}>
            {selected?.phone_number || "-"}
          </Typography>

          <Typography mt={2}>
            Address: {selected?.address || "-"}
          </Typography>

          <Chip label={selected?.account_status} sx={{ mt: 2 }} />
        </Box>
      </Drawer>

      {/* MENU */}
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menuRow) loadChildren(menuRow.id); // ✅ ONLY here loads new data
            closeMenu();
          }}
        >
          View Children
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default VendorHierarchy;