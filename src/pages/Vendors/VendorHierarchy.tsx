import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  Chip,
  Paper,
  TextField,
  InputAdornment,
  Autocomplete,
  Grid,
  List,
} from "@mui/material";
import { Refresh, PersonAdd, Add, Search } from "@mui/icons-material";

/* ================= MOCK DATA ================= */

const now = new Date().toISOString();

const LEVEL_COLORS: any = {
  vendor: "#2563eb",
  agent: "#059669",
  cashier: "#d97706",
  pos: "#dc2626",
};

const LEVEL_LABEL: any = {
  vendor: "Vendor",
  agent: "Agent",
  cashier: "Cashier",
  pos: "POS Terminal",
};
const MOCK_VENDORS = [
  { id: "1", name: "Sterling Technology and Systems" },
  { id: "2", name: "First Bank Vendor Group" },
  { id: "3", name: "UBA Vendor Network" },
];
const MOCK_TREE: any[] = [
  {
    id: "vendor-1",
    name: "Sterling North",
    level: "vendor",
    status: "active",
    email: "north@sterling.io",
    phone: "+23480001",
    children: [
      {
        id: "agent-1",
        name: "Agent Emeka",
        level: "agent",
        status: "active",
        email: "emeka@sterling.io",
        phone: "+23480002",
        children: [
          {
            id: "cashier-1",
            name: "Cashier Tunde",
            level: "cashier",
            status: "active",
            children: [
              { id: "pos-1", name: "POS Terminal 001", level: "pos", status: "active", children: [] },
              { id: "pos-2", name: "POS Terminal 002", level: "pos", status: "active", children: [] },
            ],
          },
          {
            id: "cashier-2",
            name: "Cashier Ngozi",
            level: "cashier",
            status: "active",
            children: [
              { id: "pos-3", name: "POS Terminal 003", level: "pos", status: "active", children: [] },
            ],
          },
        ],
      },
      {
        id: "agent-2",
        name: "Agent Chidi",
        level: "agent",
        status: "active",
        email: "chidi@sterling.io",
        phone: "+23480003",
        children: [
          {
            id: "cashier-3",
            name: "Cashier Bola",
            level: "cashier",
            status: "active",
            children: [
              { id: "pos-4", name: "POS Terminal 004", level: "pos", status: "active", children: [] },
            ],
          },
        ],
      },
    ],
  },
];

/* ================= HELPERS ================= */

const countChildren = (node: any) => node.children?.length || 0;

const countByLevel = (tree: any[], level: string) => {
  let count = 0;
  const walk = (nodes: any[]) => {
    nodes.forEach((n) => {
      if (n.level === level) count++;
      if (n.children) walk(n.children);
    });
  };
  walk(tree);
  return count;
};

/* ================= TREE NODE ================= */

const TreeNode = ({ node, selectedId, onSelect }: any) => {
  return (
    <Box ml={node.level !== "vendor" ? 2 : 0}>
      <Box
        onClick={() => onSelect(node)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1,
          py: 1,
          borderRadius: 2,
          cursor: "pointer",
          bgcolor: selectedId === node.id ? "#e0e7ff" : "transparent",
          "&:hover": { bgcolor: "#f1f5f9" },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: LEVEL_COLORS[node.level],
            }}
          />
          <Typography fontSize={14}>{node.name}</Typography>
        </Stack>

        {node.children?.length > 0 && (
          <Chip
            size="small"
            label={node.children.length}
            sx={{ height: 20, fontSize: 11 }}
          />
        )}
      </Box>

      {node.children?.map((child: any) => (
        <TreeNode
          key={child.id}
          node={child}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </Box>
  );
};

/* ================= MAIN ================= */

const VendorHierarchy = () => {
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(MOCK_VENDORS[0]);

  /* SEARCH FILTER */
  const filteredTree = useMemo(() => {
    if (!search) return MOCK_TREE;

    const filter = (node: any): any => {
      const match = node.name.toLowerCase().includes(search.toLowerCase());
      const children = node.children?.map(filter).filter(Boolean);

      if (match || children.length) return { ...node, children };
      return null;
    };

    return MOCK_TREE.map(filter).filter(Boolean);
  }, [search]);

  return (
    <Box 
    //p={3}
     bgcolor="#f5f7fb">
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Box>
          <Typography fontSize={28} fontWeight={700}>
            Vendor Hierarchy
          </Typography>
          <Typography color="text.secondary">
            Sub-vendors, Agents, Cashiers and POS terminals
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
  <Button
    size="small"
    variant="outlined"
    startIcon={<Refresh />}
    sx={{ height: 36, textTransform: "none", borderRadius: 2 }}
  >
    Refresh
  </Button>


</Stack>
      </Stack>

      {/* TOP BAR */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
  <Typography fontSize={13}>Viewing vendor:</Typography>

  <Autocomplete
    size="small"
    sx={{ width: 260 }}
    options={MOCK_VENDORS}
    value={selectedVendor}
    onChange={(_, v) => v && setSelectedVendor(v)}
    getOptionLabel={(o) => o.name}
    renderInput={(params) => (
      <TextField {...params} placeholder="Select vendor" />
    )}
  />
</Stack>

          <Stack direction="row" spacing={1}>
            <Chip label={`Agents ${countByLevel(MOCK_TREE, "agent")}`} />
            <Chip label={`Cashiers ${countByLevel(MOCK_TREE, "cashier")}`} />
            <Chip label={`POS ${countByLevel(MOCK_TREE, "pos")}`} />
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* LEFT PANEL */}
        <Grid item xs={4}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search nodes..."
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

            <Box mt={2}>
              {filteredTree.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  selectedId={selected?.id}
                  onSelect={setSelected}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT PANEL */}
        <Grid item xs={8}>
          {selected ? (
            <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
              {/* HEADER */}
              <Box sx={{ bgcolor: "#1e3a8a", color: "#fff", p: 3 }}>
                <Chip
                  label={LEVEL_LABEL[selected.level]}
                  sx={{ mb: 1, bgcolor: "#bbf7d0", color: "#065f46" }}
                />
                <Typography fontSize={24} fontWeight={700}>
                  {selected.name}
                </Typography>
                <Typography fontSize={14}>
                  {selected.email || "No email"}
                </Typography>
              </Box>

              {/* DETAILS */}
              <Box p={3}>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Typography variant="caption">EMAIL</Typography>
                    <Typography>{selected.email || "-"}</Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption">PHONE</Typography>
                    <Typography>{selected.phone || "-"}</Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption">STATUS</Typography>
                    <Chip label={selected.status} color="success" size="small" />
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption">LEVEL</Typography>
                    <Typography>{LEVEL_LABEL[selected.level]}</Typography>
                  </Grid>
                </Grid>

                {/* CHILDREN CARDS */}
                <Box mt={4}>
                  <Typography fontWeight={600} mb={2}>
                    {LEVEL_LABEL[selected.level]} Children ({countChildren(selected)})
                  </Typography>

                  <Grid container spacing={2}>
                    {selected.children?.map((c: any) => (
                      <Grid item xs={4} key={c.id}>
                        <Paper sx={{ p: 2, borderRadius: 2 }}>
                          <Chip
                            label={LEVEL_LABEL[c.level].slice(0, 2)}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Typography fontWeight={600}>{c.name}</Typography>
                          <Typography fontSize={12} color="text.secondary">
                            {countChildren(c)} below
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 6, textAlign: "center" }}>
              Select a node
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default VendorHierarchy;