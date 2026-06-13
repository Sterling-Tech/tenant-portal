import { createTheme } from "@mui/material/styles";


// ─── Types ────────────────────────────────────────────────────────────────────
export type TabKey = "vendors" | "subvendors" | "agents" | "cashiers" | "pos";

export interface Entity {
  id: string;
  initials: string;
  color: string;
  name: string;
  email: string;
  breadcrumb: string;
  status: "active" | "inactive";
  wallet: string;
  parent: string;
}
export const TAB_CONFIG: Record<
  TabKey,
  {
    label: string;
    singular: string;
    fixedParent: boolean;
    buttonLabel: string;
    parentLabel: string;
    parentOptions: string[];
    parentDescription: string;
    stats: { total: number; active: number; inactive: number };
  }
> = {
  vendors: {
    label: "Vendors",
    singular: "Vendor",
    fixedParent: true,
    buttonLabel: "Onboard Vendor",
    parentLabel: "Tenant",
    parentOptions: ["Tenant"],
    parentDescription:
      "Vendors (e.g. BAXI, Moneypoint, OPay) sit directly under this Disco tenant. All subvendors, agents, cashiers and POS must be created under a vendor.",
    stats: { total: 32, active: 28, inactive: 4 },
    },
  subvendors: {
    label: "Subvendors",
    singular: "Subvendor",
    fixedParent: false,
    buttonLabel: "Onboard Subvendor",
    parentLabel: "Vendor",
    parentOptions: ["BAXI", "PayServ", "Flutterwave", "Moniepoint"],
    parentDescription:
      "Subvendors sit directly under a Vendor. Choose the vendor this subvendor will belong to.",
    stats: { total: 14, active: 11, inactive: 3 },
    },
  agents: {
    label: "Agents",
    singular: "Agent",
    fixedParent: false,
    buttonLabel: "Onboard Agent",
    parentLabel: "Subvendor",
    parentOptions: ["SubV Alpha", "SubV Beta", "SubV Gamma"],
    parentDescription:
      "Agents operate under a Subvendor and manage cashiers on the ground.",
    stats: { total: 47, active: 40, inactive: 7 },
  },
  cashiers: {
    label: "Cashiers",
    singular: "Cashier",
    fixedParent: false,
    buttonLabel: "Onboard Cashier",
    parentLabel: "Agent",
    parentOptions: ["Agent Lagos", "Agent Abuja", "Agent PH"],
    parentDescription:
      "Cashiers are attached to an Agent and handle point-of-sale transactions.",
    stats: { total: 89, active: 76, inactive: 13 },
    },
  pos: {
    label: "POS",
    singular: "POS",
    fixedParent: false,
    buttonLabel: "Onboard POS",
    parentLabel: "Cashier",
    parentOptions: ["Cashier A", "Cashier B", "Cashier C"],
    parentDescription:
      "POS terminals are assigned to a Cashier and are the end points of the hierarchy.",
    stats: { total: 3, active: 2, inactive: 1 },
  },
};
// ─── Per-tab mock rows ────────────────────────────────────────────────────────
export const TAB_DATA: Record<TabKey, Entity[]> = {
  vendors: [
    { id: "v1", initials: "BX", color: "#0F2D6B", name: "BAXI", email: "baxi@fintech.ng", breadcrumb: "Tenant › BAXI", status: "active", wallet: "₦1,204,500", parent: "Tenant" },
    { id: "v2", initials: "PY", color: "#1A7F4B", name: "PayServ", email: "payserv@fintech.ng", breadcrumb: "Tenant › PayServ", status: "active", wallet: "₦892,000", parent: "Tenant" },
    { id: "v3", initials: "FL", color: "#7B4FBF", name: "Flutterwave", email: "flutter@fintech.ng", breadcrumb: "Tenant › Flutterwave", status: "active", wallet: "₦3,540,200", parent: "Tenant" },
    { id: "v4", initials: "MN", color: "#C0392B", name: "Moniepoint", email: "moniepoint@fintech.ng", breadcrumb: "Tenant › Moniepoint", status: "inactive", wallet: "₦0", parent: "Tenant" },
  ],
  subvendors: [
    { id: "s1", initials: "SA", color: "#1565C0", name: "SubV Alpha", email: "alpha@fintech.ng", breadcrumb: "Tenant › BAXI › SubV Alpha", status: "active", wallet: "₦420,000", parent: "BAXI" },
    { id: "s2", initials: "SB", color: "#2E7D32", name: "SubV Beta", email: "beta@fintech.ng", breadcrumb: "Tenant › PayServ › SubV Beta", status: "active", wallet: "₦310,000", parent: "PayServ" },
    { id: "s3", initials: "SG", color: "#6A1B9A", name: "SubV Gamma", email: "gamma@fintech.ng", breadcrumb: "Tenant › Flutterwave › SubV Gamma", status: "inactive", wallet: "₦0", parent: "Flutterwave" },
  ],
  agents: [
    { id: "a1", initials: "AL", color: "#0277BD", name: "Agent Lagos", email: "lagos@agents.ng", breadcrumb: "Tenant › BAXI › SubV Alpha › Agent Lagos", status: "active", wallet: "₦85,000", parent: "SubV Alpha" },
    { id: "a2", initials: "AB", color: "#00695C", name: "Agent Abuja", email: "abuja@agents.ng", breadcrumb: "Tenant › PayServ › SubV Beta › Agent Abuja", status: "active", wallet: "₦62,500", parent: "SubV Beta" },
    { id: "a3", initials: "AP", color: "#4527A0", name: "Agent PH", email: "ph@agents.ng", breadcrumb: "Tenant › Flutterwave › SubV Gamma › Agent PH", status: "inactive", wallet: "₦0", parent: "SubV Gamma" },
  ],
  cashiers: [
    { id: "c1", initials: "CA", color: "#283593", name: "Cashier A", email: "cashiera@pos.ng", breadcrumb: "... › Agent Lagos › Cashier A", status: "active", wallet: "₦12,400", parent: "Agent Lagos" },
    { id: "c2", initials: "CB", color: "#1B5E20", name: "Cashier B", email: "cashierb@pos.ng", breadcrumb: "... › Agent Abuja › Cashier B", status: "active", wallet: "₦9,800", parent: "Agent Abuja" },
    { id: "c3", initials: "CC", color: "#B71C1C", name: "Cashier C", email: "cashierc@pos.ng", breadcrumb: "... › Agent PH › Cashier C", status: "inactive", wallet: "₦0", parent: "Agent PH" },
  ],
  pos: [
    { id: "p1", initials: "P1", color: "#37474F", name: "POS Terminal 001", email: "pos001@devices.ng", breadcrumb: "... › Cashier A › POS 001", status: "active", wallet: "₦4,200", parent: "Cashier A" },
    { id: "p2", initials: "P2", color: "#4E342E", name: "POS Terminal 002", email: "pos002@devices.ng", breadcrumb: "... › Cashier B › POS 002", status: "active", wallet: "₦3,100", parent: "Cashier B" },
    { id: "p3", initials: "P3", color: "#880E4F", name: "POS Terminal 003", email: "pos003@devices.ng", breadcrumb: "... › Cashier C › POS 003", status: "inactive", wallet: "₦0", parent: "Cashier C" },
  ],
};

export const theme = createTheme({
    palette: {
        primary: { main: "#0F2D6B" },
        success: { main: "#1A7F4B" },
        error: { main: "#C0392B" },
        background: { default: "#F5F7FA", paper: "#FFFFFF" },
        text: { primary: "#0D1B2A", secondary: "#6B7A8D" },
    },
    typography: {
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        h4: { fontWeight: 700, letterSpacing: "-0.5px" },
        subtitle2: { fontWeight: 600, letterSpacing: "0.06em", fontSize: "0.7rem" },
    },
    shape: { borderRadius: 10 },
    components: {
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    minWidth: "unset",
                    padding: "10px 4px",
                    marginRight: 28,
                    color: "#6B7A8D",
                    "&.Mui-selected": { color: "#0F2D6B", fontWeight: 700 },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    letterSpacing: "0.08em",
                    color: "#9AA4B2",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #E8ECF0",
                    paddingTop: 10,
                    paddingBottom: 10,
                },
                body: {
                    borderBottom: "1px solid #F0F2F5",
                    paddingTop: 14,
                    paddingBottom: 14,
                    fontSize: "0.875rem",
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: { boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderRadius: 12 },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 600, fontSize: "0.75rem", borderRadius: 20 },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: { root: { borderRadius: 8 } },
        },
        MuiDialog: {
            styleOverrides: {
                paper: { borderRadius: 14, padding: 0 },
            },
        },
    },
});