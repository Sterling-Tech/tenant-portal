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
  ListItemButton,
} from "@mui/material";
import { Refresh, PersonAdd, Add, Search } from "@mui/icons-material";
import { VendorOrg } from "../../types/vendor";

/* ================= MOCK MODE ================= */
const USE_MOCK = true;

const MOCK_TENANTS = [
  { id: "1", business_name: "Sterling Technology and Systems" },
];

const now = new Date().toISOString();

export const MOCK_TREE: VendorOrg[] = [
  {
    id: "vendor-1",
    tenant: "1",
    name: "Sterling North",
    slug: "sterling-north",
    level: "vendor",
    status: "active",
    parent: null,
    created_at: now,
    updated_at: now,
    children: [
      {
        id: "agent-1",
        tenant: "1",
        name: "Agent Emeka",
        slug: "agent-emeka",
        level: "agent",
        status: "active",
        parent: "vendor-1",
        created_at: now,
        updated_at: now,
        children: [
          {
            id: "cashier-1",
            tenant: "1",
            name: "Cashier Tunde",
            slug: "cashier-tunde",
            level: "cashier",
            status: "active",
            parent: "agent-1",
            created_at: now,
            updated_at: now,
            children: [
              {
                id: "pos-1",
                tenant: "1",
                name: "POS Terminal 001",
                slug: "pos-1",
                level: "pos",
                status: "active",
                parent: "cashier-1",
                created_at: now,
                updated_at: now,
                children: [],
              },
              {
                id: "pos-2",
                tenant: "1",
                name: "POS Terminal 002",
                slug: "pos-2",
                level: "pos",
                status: "active",
                parent: "cashier-1",
                created_at: now,
                updated_at: now,
                children: [],
              },
            ],
          },
          {
            id: "cashier-2",
            tenant: "1",
            name: "Cashier Ngozi",
            slug: "cashier-ngozi",
            level: "cashier",
            status: "active",
            parent: "agent-1",
            created_at: now,
            updated_at: now,
            children: [
              {
                id: "pos-3",
                tenant: "1",
                name: "POS Terminal 003",
                slug: "pos-3",
                level: "pos",
                status: "active",
                parent: "cashier-2",
                created_at: now,
                updated_at: now,
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: "agent-2",
        tenant: "1",
        name: "Agent Chidi",
        slug: "agent-chidi",
        level: "agent",
        status: "active",
        parent: "vendor-1",
        created_at: now,
        updated_at: now,
        children: [],
      },
    ],
  },
];


const MOCK_BINDINGS = [
  { id: "1", user_email: "emeka@sterling.io", role: "agent", status: "active" },
];

/* ================= COMPONENT ================= */
const VendorHierarchy: React.FC = () => {
  const [tenantId, setTenantId] = useState("1");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [orgSearchTerm, setOrgSearchTerm] = useState("");

  const tenants = MOCK_TENANTS;
  const tree = MOCK_TREE;
  const bindings = MOCK_BINDINGS;

  /* find selected org */
  const findOrg = (nodes: VendorOrg[], id: string | null): VendorOrg | null => {
    if (!id) return null;
    for (const n of nodes) {
      if (n.id === id) return n;
      const found = findOrg(n.children || [], id);
      if (found) return found;
    }
    return null;
  };

  const selectedOrg = findOrg(tree, selectedOrgId);

  /* filter */
  const filteredTree = useMemo(() => {
    if (!orgSearchTerm) return tree;
    const term = orgSearchTerm.toLowerCase();

    const filter = (org: VendorOrg): VendorOrg | null => {
      const match = org.name.toLowerCase().includes(term);
      const children =
        org.children?.map(filter).filter(Boolean) as VendorOrg[];

      if (match || children.length) return { ...org, children };
      return null;
    };

    return tree.map(filter).filter(Boolean) as VendorOrg[];
  }, [tree, orgSearchTerm]);

  /* count */
  const countByLevel = (level: string) => {
    let count = 0;
    const walk = (nodes: VendorOrg[]) => {
      nodes.forEach((n) => {
        if (n.level === level) count++;
        if (n.children) walk(n.children);
      });
    };
    walk(tree);
    return count;
  };

  return (
    <Box p={3} bgcolor="#f5f7fb">
      {/* HEADER */}
      <Stack spacing={2} mb={3}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Vendor Hierarchy
            </Typography>
            <Typography color="text.secondary">
              View the full structure under each vendor
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Refresh />}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<PersonAdd />}>
              Add Vendor Admin
            </Button>
            <Button variant="contained" color="success" startIcon={<Add />}>
              Add Root Organisation
            </Button>
          </Stack>
        </Stack>

        {/* TOP BAR */}
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between">
            <Autocomplete
              size="small"
              sx={{ width: 300 }}
              options={tenants}
              getOptionLabel={(o) => o.business_name}
              value={tenants[0]}
              onChange={(_, v) => v && setTenantId(v.id)}
              renderInput={(params) => <TextField {...params} />}
            />

            <Stack direction="row" spacing={1}>
              <Chip label={`Agents ${countByLevel("agent")}`} />
              <Chip label={`Cashiers ${countByLevel("cashier")}`} />
              <Chip label={`POS ${countByLevel("pos")}`} />
            </Stack>
          </Stack>
        </Paper>
      </Stack>

      <Grid container spacing={3}>
        {/* LEFT */}
        <Grid item xs={4}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search..."
              value={orgSearchTerm}
              onChange={(e) => setOrgSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <List>
              {filteredTree.map((org) => (
                <ListItemButton
                  key={org.id}
                  onClick={() => setSelectedOrgId(org.id)}
                >
                  {org.name}
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* RIGHT */}
        <Grid item xs={8}>
          {selectedOrg ? (
            <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Box sx={{ bgcolor: "#1e3a8a", color: "#fff", p: 3 }}>
                <Typography variant="h5">{selectedOrg.name}</Typography>
                <Typography>{bindings[0]?.user_email}</Typography>
              </Box>

              <Box p={3}>
                <Typography variant="caption">LEVEL</Typography>
                <Typography>{selectedOrg.level}</Typography>

                <Box mt={3}>
                  <Typography fontWeight={600}>Children</Typography>
                  {selectedOrg.children?.map((c) => (
                    <Paper key={c.id} sx={{ p: 2, mt: 1 }}>
                      {c.name}
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 5, textAlign: "center" }}>
              Select a node
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default VendorHierarchy;